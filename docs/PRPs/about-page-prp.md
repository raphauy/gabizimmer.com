# PRP: Página /about que muestra Post "sobre-gabi"

## Goal
Crear una página pública `/about` que muestre el contenido del post con slug "sobre-gabi", permitiendo que Gabi actualice el contenido desde el panel de administración y se refleje automáticamente en la página pública.

## Why
- **Enlace roto**: Actualmente el header tiene un link a `/about` que retorna 404
- **Actualización dinámica**: Gabi necesita poder editar su página "Sobre mí" desde el admin sin tocar código
- **Consistencia editorial**: Usar el mismo sistema de contenido (Novel editor) que los posts del blog
- **SEO**: Página importante para el posicionamiento y presencia online de Gabi

## What
Página pública accesible sin autenticación que:
- Renderiza el contenido del post con slug "sobre-gabi" 
- Muestra el contenido con el mismo formato y estilos que los posts del blog
- Incluye metadata SEO dinámicos desde el post
- Retorna 404 si el post no existe o no está publicado
- Se actualiza automáticamente cuando el post es editado en admin

### Success Criteria
- [ ] La página `/about` carga correctamente sin autenticación
- [ ] Muestra el contenido del post "sobre-gabi" si existe y está PUBLISHED
- [ ] Retorna 404 si el post no existe o no está publicado
- [ ] Los metadata SEO se generan desde los campos del post
- [ ] El contenido JSON del Novel editor se renderiza correctamente
- [ ] Los cambios en el post desde admin se reflejan inmediatamente
- [ ] `pnpm run lint` y `pnpm run typecheck` pasan sin errores
- [ ] `pnpm run build` completa exitosamente

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /home/raphael/desarrollo/gabizimmer.com/docs/architecture.md
  why: CRÍTICO - Arquitectura en capas estricta, solo services/ puede usar Prisma
  
- file: /home/raphael/desarrollo/gabizimmer.com/docs/features.md
  why: Contexto del proyecto y features implementadas
  
- file: /home/raphael/desarrollo/gabizimmer.com/prisma/schema.prisma
  why: Modelo Post con campos y relaciones necesarias
  sections: "model Post"
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/services/post-service.ts
  why: Función getPostBySlugAndLanguage() ya implementada
  sections: "getPostBySlugAndLanguage"
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/app/blog/[categorySlug]/[postSlug]/page.tsx
  why: Patrón de página pública que muestra un post con SEO y metadata
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/app/blog/components/post-content.tsx
  why: Componente que renderiza contenido JSON del Novel editor
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/components/layout/header.tsx
  why: Link existente a /about en línea 21
  
- url: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  why: Metadata dinámicos en Next.js 15
  section: "generateMetadata function"
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── page.tsx              # Landing con ChatInterface
│   ├── blog/                 # Sistema de blog público
│   │   ├── [categorySlug]/[postSlug]/
│   │   │   └── page.tsx     # Página individual de post
│   │   └── components/
│   │       └── post-content.tsx  # Renderiza JSON de Novel
│   └── admin/               # Panel administración
│       └── posts/           # CRUD de posts
├── services/
│   └── post-service.ts      # getPostBySlugAndLanguage()
└── components/
    └── layout/
        └── header.tsx       # Link a /about línea 21
```

### Desired Codebase Tree
```bash
src/
├── app/
│   └── about/
│       └── page.tsx        # Nueva página RSC que muestra post "sobre-gabi"
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Arquitectura en capas estricta (docs/architecture.md)
// - SOLO services/ puede importar prisma
// - Páginas llaman a servicios, nunca a Prisma directamente

// PATTERN: Página pública con contenido de post
// 1. Server Component (sin 'use client')
// 2. Obtener post por slug usando servicio
// 3. Verificar que existe y está publicado
// 4. Renderizar con PostContent
// 5. Metadata dinámicos para SEO

// PATTERN: Verificación de estado publicado
if (!post || post.status !== 'PUBLISHED') {
  notFound() // Next.js 404
}

// PATTERN: PostContent espera JSON del Novel editor
<PostContent content={post.content} />

// GOTCHA: El slug debe ser exacto "sobre-gabi"
// GOTCHA: Idioma por defecto ES
// GOTCHA: PostContent es 'use client' pero la página no
```

## Implementation Blueprint

### Data Flow
```typescript
// 1. Usuario visita /about
// 2. RSC obtiene post por slug
await getPostBySlugAndLanguage("sobre-gabi", "ES")
// 3. Verifica estado PUBLISHED
// 4. Genera metadata SEO
// 5. Renderiza contenido con PostContent
```

### Task List (Orden de Implementación)
```yaml
Task 1: Crear página /about
CREATE src/app/about/page.tsx:
  - RSC sin 'use client'
  - Import getPostBySlugAndLanguage de services
  - Import PostContent de blog/components
  - Import notFound de next/navigation
  - Obtener post con slug "sobre-gabi" y language "ES"
  - Verificar existe y status === 'PUBLISHED'
  - Si no, llamar notFound()
  - Renderizar contenido con PostContent

Task 2: Agregar metadata dinámicos
MODIFY src/app/about/page.tsx:
  - Export generateMetadata async function
  - Obtener post nuevamente (o cache)
  - Retornar metadata con:
    - title: post.seoTitle || post.title || "Sobre Gabi Zimmer"
    - description: post.seoDescription || post.excerpt
    - openGraph con imagen si existe
```

### Per-Task Implementation

```typescript
// Task 1: src/app/about/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlugAndLanguage } from '@/services/post-service'
import { PostContent } from '../blog/components/post-content'

export async function generateMetadata(): Promise<Metadata> {
  const post = await getPostBySlugAndLanguage('sobre-gabi', 'ES')
  
  if (!post || post.status !== 'PUBLISHED') {
    return {
      title: 'Sobre Gabi Zimmer',
      description: 'Conoce más sobre Gabi Zimmer, sommelier y educadora de vinos uruguayos'
    }
  }
  
  return {
    title: post.seoTitle || post.title || 'Sobre Gabi Zimmer',
    description: post.seoDescription || post.excerpt || 'Conoce más sobre Gabi Zimmer',
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || '',
      images: post.featuredImageUrl ? [post.featuredImageUrl] : [],
    }
  }
}

export default async function AboutPage() {
  const post = await getPostBySlugAndLanguage('sobre-gabi', 'ES')
  
  if (!post || post.status !== 'PUBLISHED') {
    notFound()
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">{post.title}</h1>
        <PostContent content={post.content} />
      </article>
    </div>
  )
}
```

### Integration Points
```yaml
DATABASE:
  - Post debe existir con slug: "sobre-gabi"
  - Post debe tener status: PUBLISHED
  - Post debe tener language: ES
  
UI:
  - PostContent maneja todo el renderizado
  - Prose classes de Tailwind para estilos
  - Container responsive con max-width
  
SEO:
  - Metadata dinámicos desde campos del post
  - OpenGraph para redes sociales
  - Fallbacks si campos SEO están vacíos

ADMIN:
  - Post editable en /admin/posts
  - Cambios se reflejan inmediatamente
  - Slug no debe cambiar para mantener funcionando
```

## Validation Loop

### Level 1: Syntax & Types
```bash
pnpm run lint          # ESLint - 0 errores esperados
pnpm run typecheck     # TypeScript - 0 errores esperados
```

### Level 2: Dev Server Test
```bash
pnpm run dev
# Navegar a http://localhost:3000/about
# Verificar que carga o da 404 apropiado
```

### Level 3: Post Creation (si no existe)
```sql
-- Si necesitas crear el post manualmente en Prisma Studio:
-- pnpm prisma studio
-- Crear Post con:
-- slug: "sobre-gabi"
-- language: "ES" 
-- status: "PUBLISHED"
-- title: "Sobre Gabi Zimmer"
-- content: JSON del Novel editor
```

### Level 4: Production Build
```bash
pnpm run build
# Expected: Build exitoso sin warnings
```

## Final Checklist

### Arquitectura
- [ ] No importa Prisma directamente (usa service)
- [ ] RSC sin 'use client' 
- [ ] Llama a getPostBySlugAndLanguage del servicio
- [ ] Usa PostContent existente para renderizar

### Funcionalidad
- [ ] Página carga en /about
- [ ] Muestra contenido si post existe y está publicado
- [ ] Retorna 404 si no existe o no está publicado
- [ ] Metadata SEO dinámicos funcionan
- [ ] Contenido se renderiza correctamente

### Calidad
- [ ] Sin errores de lint/types
- [ ] Build de producción exitoso
- [ ] Responsive y accesible
- [ ] Dark mode soportado

## Anti-Patterns to Avoid

### Arquitectura
- ❌ NO importar `@/lib/prisma` directamente en la página
- ❌ NO crear queries Prisma en el componente
- ❌ NO usar 'use client' en la página principal

### Implementación
- ❌ NO hardcodear el contenido en la página
- ❌ NO crear un nuevo componente para renderizar contenido
- ❌ NO modificar el PostContent existente
- ❌ NO cambiar el slug "sobre-gabi" esperado
- ❌ NO olvidar verificar status PUBLISHED

## Score de Confianza

**9/10** - Este PRP tiene alta probabilidad de éxito en una sola pasada porque:

✅ Implementación extremadamente simple (1 archivo, ~50 líneas)
✅ Reutiliza componentes y servicios existentes probados
✅ Patrón claro copiado de páginas similares existentes
✅ No requiere cambios en base de datos ni otros archivos
✅ Validaciones y errores manejados apropiadamente

El único punto de posible falla es si el post "sobre-gabi" no existe en la base de datos, pero eso se soluciona fácilmente desde el admin.