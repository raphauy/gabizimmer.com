# PRP: Rediseño de Home Page y Migración del Chat

## Goal
Transformar la página principal de gabizimmer.com de un chat único a una landing page profesional que presente a Gabi Zimmer con su biografía, imagen y posts destacados del blog, moviendo el chat existente a una ruta dedicada `/chat` con entrada en el menú de navegación.

## Why
- **Valor de negocio**: La home actual no representa adecuadamente la marca personal de Gabi Zimmer como comunicadora de vinos
- **Impacto en usuarios**: Los visitantes podrán conocer inmediatamente quién es Gabi, su experiencia y acceder a contenido relevante del blog
- **Integración con features existentes**: Aprovecha el sistema de blog ya implementado para mostrar contenido destacado
- **Problemas que resuelve**: Mejora la primera impresión, aumenta engagement con el contenido del blog, mantiene el chat como feature secundaria accesible

## What
La home page debe mostrar:
1. Sección hero con foto de Gabi y biografía profesional completa
2. Grid de posts destacados del blog (3-6 posts publicados más recientes)
3. Navegación actualizada con enlace al chat en `/chat`
4. El chat actual se mueve completo a la nueva ruta `/chat`
5. Diseño responsive mobile-first siguiendo el sistema de diseño Gabi Zimmer

### Success Criteria
- [ ] La home page muestra la imagen de Gabi (`public/gabi.jpg`) con la biografía proporcionada
- [ ] Se muestran al menos 3 posts publicados del blog en la home
- [ ] El chat funciona correctamente en la nueva ruta `/chat`
- [ ] El menú de navegación incluye enlace "Chat" que lleva a `/chat`
- [ ] El diseño es responsive y sigue el sistema de colores de marca (Amarillo GZ, Verde Oscuro, etc.)
- [ ] Los tests pasan: `pnpm run lint` y `pnpm run typecheck` sin errores
- [ ] Build de producción exitoso: `pnpm run build`

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Arquitectura en capas estricta, solo services/ accede a Prisma

- file: /docs/features.md
  why: Descripción exacta de la feature a implementar y texto de Gabi
  section: "Siguientes Features a Implementar - Feature #1"

- file: /docs/sistema-diseno-gz.md
  why: Sistema de diseño completo, colores de marca, tipografía oficial

- file: prisma/schema.prisma
  why: Modelo Post para entender estructura de datos del blog

- file: src/services/post-service.ts
  why: Servicio para obtener posts publicados del blog
  focus: getAllPosts función y tipos exportados

- file: src/app/page.tsx
  why: Home page actual con chat - base para transformación

- file: src/components/layout/header.tsx
  why: Header con navegación actual que debe actualizarse

- file: src/app/blog/components/post-card.tsx
  why: Componente PostCard reutilizable para mostrar posts

- file: src/components/chat/chat-interface.tsx
  why: Sistema de chat interno completo para reusar en /chat
```

### Current Codebase Tree
```bash
# Estado actual relevante
src/
├── app/
│   ├── page.tsx                # Home actual con BondWidget (chat externo)
│   ├── layout.tsx              # Layout principal con grid
│   ├── blog/                   # Sistema de blog completo
│   │   ├── components/
│   │   │   └── post-card.tsx  # PostCard con 3 variantes
│   └── api/
│       └── chat/              # API del chat interno
├── services/
│   └── post-service.ts        # ÚNICA capa con acceso a Prisma
├── components/
│   ├── layout/
│   │   └── header.tsx         # Navegación principal
│   └── chat/
│       └── chat-interface.tsx # Chat interno completo (no usado)
└── lib/
    └── utils.ts               # cn() para clases
```

### Desired Codebase Tree
```bash
# Archivos nuevos y modificados
src/
├── app/
│   ├── page.tsx               # MODIFICAR: Nueva home con hero + posts
│   └── chat/
│       └── page.tsx           # NUEVO: Chat movido aquí
├── components/
│   ├── layout/
│   │   └── header.tsx         # MODIFICAR: Agregar "Chat" al menú
│   └── home/
│       ├── hero-section.tsx   # NUEVO: Sección con foto y bio
│       └── featured-posts.tsx # NUEVO: RSC con posts destacados
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Arquitectura en capas estricta (docs/architecture.md)
// - SOLO services/ puede importar prisma
// - RSC fetchea datos → pasa props a cliente
// - Server Components por defecto, 'use client' solo cuando necesario

// PATTERN: Home page como RSC
// src/app/page.tsx
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedPosts } from '@/components/home/featured-posts'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<PostsSkeleton />}>
        <FeaturedPosts />
      </Suspense>
    </>
  )
}

// PATTERN: RSC para fetch de datos
// src/components/home/featured-posts.tsx
import { getAllPosts } from '@/services/post-service'
import { PostCard } from '@/app/blog/components/post-card'

export async function FeaturedPosts() {
  const posts = await getAllPosts({
    status: 'PUBLISHED',
    language: 'ES'
  })
  const featuredPosts = posts.slice(0, 6) // Primeros 6 posts

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {featuredPosts.map(post => (
        <PostCard key={post.id} post={post} variant="default" />
      ))}
    </div>
  )
}

// GOTCHA: Chat usa ChatInterface interno, no BondWidget
// El proyecto tiene ChatInterface completo pero usa BondWidget externo
// Debemos usar ChatInterface para mantener consistencia

// GOTCHA: Navegación en header.tsx usa array navItems
const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "Sobre Gabi" },
  { href: "/chat", label: "Chat" } // NUEVO
]
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// No se requieren cambios en modelos
// Usamos Post existente de Prisma

// Tipos ya definidos en post-service.ts
export type PostWithRelations = Post & {
  author: User
  category: Category
  _count: { comments: number }
}
```

### Task List (Orden de Implementación)
```yaml
Task 1: Crear componente HeroSection
CREATE src/components/home/hero-section.tsx:
  - Imagen de Gabi: /gabi.jpg con next/image optimizado
  - Biografía completa en 3 párrafos (texto proporcionado)
  - Diseño responsive: imagen arriba en mobile, lado a lado en desktop
  - Colores de marca: fondo verde claro, texto verde oscuro
  - Sin 'use client' (componente estático)

Task 2: Crear componente FeaturedPosts (RSC)
CREATE src/components/home/featured-posts.tsx:
  - Server Component async para fetch de datos
  - Llamar getAllPosts con status: 'PUBLISHED'
  - Tomar primeros 6 posts ordenados por fecha
  - Grid responsive: 1 columna mobile, 2 tablet, 3 desktop
  - Usar PostCard existente con variant="default"
  - Título de sección: "Últimas Publicaciones"

Task 3: Actualizar Home Page
MODIFY src/app/page.tsx:
  - Remover BondWidget completamente
  - Importar y usar HeroSection
  - Importar y usar FeaturedPosts con Suspense
  - Mantener estructura con layout existente
  - Metadata: title y description actualizados

Task 4: Crear ruta /chat
CREATE src/app/chat/page.tsx:
  - Importar ChatInterface (componente interno)
  - Usar layout similar a home actual
  - Metadata específica para chat
  - Container con max-width para centrar

Task 5: Actualizar navegación
MODIFY src/components/layout/header.tsx:
  - Agregar { href: "/chat", label: "Chat" } a navItems
  - Mantener orden: Inicio, Blog, Sobre Gabi, Chat
  - Verificar responsive menu funciona

Task 6: Skeleton para loading
CREATE src/components/home/posts-skeleton.tsx:
  - Grid con 6 skeleton cards
  - Usar componentes Skeleton de shadcn/ui
  - Mantener mismo layout que posts reales

Task 7: Validación y optimización
VERIFY:
  - Imágenes optimizadas con next/image
  - Sin imports de Prisma fuera de services/
  - Todos los componentes siguen arquitectura
  - Dark mode funciona correctamente
```

### Per-Task Pseudocode
```typescript
// Task 1: HeroSection
// src/components/home/hero-section.tsx
import Image from 'next/image'

export function HeroSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden">
            <Image
              src="/gabi.jpg"
              alt="Gabi Zimmer"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gabi-dark-green">
              Gabi Zimmer
            </h1>
            <div className="prose prose-lg max-w-none">
              <p>Gabi Zimmer es comunicadora, sommelière...</p>
              <p>En su recorrido, ha combinado...</p>
              <p>Actualmente, Gabi es catadora...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Task 2: FeaturedPosts
// src/components/home/featured-posts.tsx
import { getAllPosts } from '@/services/post-service'
import { PostCard } from '@/app/blog/components/post-card'

export async function FeaturedPosts() {
  // PATTERN: Server component puede llamar servicios directamente
  const posts = await getAllPosts({
    status: 'PUBLISHED',
    language: 'ES'
  })

  const featuredPosts = posts.slice(0, 6)

  if (featuredPosts.length === 0) {
    return null // No mostrar sección si no hay posts
  }

  return (
    <section className="py-12 bg-wine-muted/10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Últimas Publicaciones
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              variant="default"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Task 4: Chat page
// src/app/chat/page.tsx
import { ChatInterface } from '@/components/chat/chat-interface'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat con el Asistente de Vinos | Gabi Zimmer',
  description: 'Conversa con nuestro asistente especializado en vinos uruguayos'
}

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <ChatInterface />
      </div>
    </div>
  )
}
```

### Integration Points
```yaml
IMAGES:
  - source: public/gabi.jpg (verificar que existe)
  - optimization: next/image con sizes responsive

NAVIGATION:
  - file: src/components/layout/header.tsx
  - update: navItems array

BLOG SYSTEM:
  - service: post-service.ts getAllPosts()
  - component: PostCard desde blog/components/

DESIGN SYSTEM:
  - colors: Variables CSS de marca (--gabi-yellow, etc)
  - spacing: Sistema base 8px de Tailwind
  - typography: Clases prose para contenido
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar PRIMERO - corregir errores antes de continuar
pnpm run lint
pnpm run typecheck
# Expected: 0 errores
```

### Level 2: Development Server
```bash
# Iniciar servidor de desarrollo
pnpm run dev

# Verificar rutas
curl http://localhost:3000/          # Nueva home con hero + posts
curl http://localhost:3000/chat      # Chat funcionando
# Expected: HTML correcto en ambas
```

### Level 3: Visual Testing
```
# Verificar en navegador:
1. Home page:
   - Imagen de Gabi visible y optimizada
   - Texto de biografía completo y legible
   - Posts del blog mostrándose (si hay publicados)
   - Diseño responsive en mobile/tablet/desktop

2. Chat page:
   - Chat interface funcionando
   - Puede enviar y recibir mensajes

3. Navegación:
   - Link "Chat" visible en menú
   - Todos los links funcionan
```

### Level 4: Production Build
```bash
pnpm run build
# Expected: Build exitoso sin warnings

pnpm run start
# Test en http://localhost:3000
```

## Final Checklist

### Arquitectura en Capas
- [ ] Solo services/post-service.ts importa Prisma
- [ ] FeaturedPosts es Server Component que llama al servicio
- [ ] No hay 'use client' innecesarios
- [ ] Componentes siguen patrones RSC del proyecto

### Funcionalidad Core
- [ ] Imagen de Gabi se muestra correctamente
- [ ] Biografía completa está visible con los 3 párrafos
- [ ] Posts del blog aparecen (si hay publicados)
- [ ] Chat funciona en /chat
- [ ] Navegación incluye enlace al chat

### Calidad & Performance
- [ ] Imágenes optimizadas con next/image
- [ ] Loading states con Suspense
- [ ] Sin errores de lint/types
- [ ] Build de producción exitoso
- [ ] Diseño responsive funciona
- [ ] Dark mode se ve bien

### UI Consistente
- [ ] Usa colores del sistema de diseño Gabi Zimmer
- [ ] Mantiene estilos consistentes con resto del sitio
- [ ] PostCard se reutiliza del blog
- [ ] Espaciado sigue sistema base 8px

## Anti-Patterns to Avoid

### Arquitectura
- ❌ NO importar `@/lib/prisma` en componentes
- ❌ NO crear queries Prisma fuera de services/
- ❌ NO usar 'use client' en componentes que pueden ser RSC
- ❌ NO hacer fetch de datos en componentes cliente

### Implementación
- ❌ NO hardcodear posts - siempre usar el servicio
- ❌ NO olvidar Suspense boundaries para async components
- ❌ NO usar BondWidget - usar ChatInterface interno
- ❌ NO crear nuevos patrones si ya existen en el proyecto
- ❌ NO modificar servicios existentes sin necesidad

### Performance
- ❌ NO cargar imagen sin next/image optimization
- ❌ NO hacer requests innecesarias al servicio
- ❌ NO renderizar todos los posts - limitar a 6
- ❌ NO olvidar loading states

## Score de Confianza: 9/10

Este PRP tiene un alto score de confianza porque:
- ✅ Reutiliza componentes y servicios existentes
- ✅ Sigue arquitectura establecida del proyecto
- ✅ Instrucciones claras y sin ambigüedades
- ✅ Validaciones ejecutables incluidas
- ✅ Ejemplos de código del propio proyecto
- ✅ No requiere cambios en base de datos

El único punto de atención es verificar que ChatInterface funcione correctamente ya que actualmente se usa BondWidget.