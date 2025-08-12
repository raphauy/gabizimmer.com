# PRP: Preview de Posts en Admin

## Goal
Implementar un sistema de preview que permita a los autores visualizar exactamente cómo se verá su post publicado antes de guardarlo, integrado como un cuarto tab en el formulario de edición/creación de posts en `/admin/posts`, reutilizando los componentes de visualización pública existentes (`PostContent`, `PostHeader`) para garantizar fidelidad visual.

## Why
- **Valor de negocio**: Reduce errores de publicación y mejora la calidad del contenido al permitir validación visual antes de guardar
- **Impacto en usuarios**: Gabi y colaboradores pueden verificar formato, imágenes y legibilidad antes de publicar
- **Integración con features existentes**: Se integra naturalmente con el flujo de edición actual usando el patrón de tabs
- **Problemas que resuelve**: Elimina la necesidad de guardar como borrador para ver el resultado, evita publicaciones con errores de formato

## What
Sistema de preview en tiempo real integrado en el formulario de posts que muestra el contenido exactamente como aparecerá en el blog público, incluyendo título, imagen destacada, categoría, metadatos y contenido formateado, con controles de viewport para simular diferentes dispositivos.

### Success Criteria
- [ ] Preview disponible como cuarto tab "Preview" en el formulario de posts
- [ ] Renderizado idéntico al blog público usando componentes existentes
- [ ] Actualización en tiempo real al cambiar de tab
- [ ] Controles de viewport (móvil/tablet/escritorio) funcionales
- [ ] Sin errores de lint/typecheck
- [ ] Navegación fluida entre tabs manteniendo estado del formulario
- [ ] Preview funciona tanto en crear como editar posts

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /home/raphael/desarrollo/gabizimmer.com/docs/architecture.md
  why: CRÍTICO - Arquitectura en capas estricta, co-ubicación modular
  
- file: /home/raphael/desarrollo/gabizimmer.com/docs/features.md
  why: Features implementadas y contexto del sistema
  
- file: /home/raphael/desarrollo/gabizimmer.com/prisma/schema.prisma
  why: Modelo Post completo con todos los campos
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/services/post-service.ts
  why: Tipos y validaciones del modelo Post
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/app/admin/posts/post-form.tsx
  why: CRÍTICO - Formulario actual con 3 tabs donde agregar el preview
  sections: líneas 1-100 para estructura de tabs, 200-300 para estados
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/app/blog/components/post-content.tsx
  why: CRÍTICO - Componente que renderiza JSON de Novel a HTML
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/app/blog/components/post-header.tsx
  why: Componente para mostrar título, categoría y metadatos
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/app/blog/[categorySlug]/[postSlug]/post-page-content.tsx
  why: Estructura completa de visualización pública para replicar
  
- url: https://ui.shadcn.com/docs/components/tabs
  why: Documentación del componente Tabs de shadcn/ui
  section: "Default"
  
- url: https://ui.shadcn.com/docs/components/toggle-group
  why: Para controles de viewport responsive
  section: "Outline"
```

### Current Codebase Tree
```bash
src/app/admin/posts/
├── page.tsx                    # Listado de posts
├── new/
│   └── page.tsx               # Crear nuevo post
├── [id]/
│   └── edit/
│       └── page.tsx           # Editar post existente
├── post-form.tsx              # Formulario con 3 tabs actuales
├── post-editor.tsx            # Editor Novel.js
├── posts-list.tsx             # Tabla de posts
├── post-status-badge.tsx
├── post-image-upload.tsx
├── category-selector.tsx
├── post-actions-client.tsx
├── posts-skeleton.tsx
└── actions.ts                 # Server actions

src/app/blog/components/
├── post-content.tsx           # Renderiza JSON Novel → HTML
├── post-header.tsx            # Header con título y metadata
├── share-buttons.tsx
└── related-posts.tsx
```

### Desired Codebase Tree
```bash
src/app/admin/posts/
├── [archivos existentes...]
├── post-preview.tsx           # NUEVO - Componente principal de preview
├── post-preview-viewport.tsx  # NUEVO - Controles de viewport
└── post-form.tsx              # MODIFICADO - Agregar 4to tab
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: PostForm ya tiene 3 tabs con estado compartido
// src/app/admin/posts/post-form.tsx línea ~85
<Tabs defaultValue="basic" className="space-y-4">
  <TabsList className="grid w-full grid-cols-3"> // Cambiar a grid-cols-4
    <TabsTrigger value="basic">Datos básicos</TabsTrigger>
    <TabsTrigger value="content">Contenido</TabsTrigger>
    <TabsTrigger value="seo">SEO y metadatos</TabsTrigger>
    // AGREGAR: <TabsTrigger value="preview">Preview</TabsTrigger>
  </TabsList>

// PATTERN: Estados ya existen en PostForm para el preview
const [title, setTitle] = useState(post?.title || '')
const [content, setContent] = useState(post?.content || {})
const [excerpt, setExcerpt] = useState(post?.excerpt || '')
const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featuredImageUrl || '')
const [categoryId, setCategoryId] = useState(post?.categoryId || '')

// GOTCHA: PostContent espera JSON de Novel, no string
// Usar directamente el estado 'content' sin modificación

// PATTERN: Componentes públicos son client components
// PostContent ya es 'use client', se puede usar directamente

// GOTCHA: PostHeader espera PostWithRelations
// Crear objeto mock con estructura esperada para preview
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// Tipos necesarios para el preview (ya existen en post-service.ts)
export type PostWithRelations = Post & {
  author: User
  category: Category
  tags: PostTag[]
  comments: Comment[]
}

// Mock data para preview cuando creando nuevo post
const mockAuthor = {
  id: 'preview',
  name: session?.user?.name || 'Autor',
  email: session?.user?.email || '',
  // otros campos necesarios...
}

const mockCategory = categories.find(c => c.id === categoryId) || {
  id: 'preview',
  name: 'Sin categoría',
  slug: 'sin-categoria'
}
```

### Task List (Orden de Implementación)
```yaml
Task 1: Crear componente PostPreviewViewport
CREATE src/app/admin/posts/post-preview-viewport.tsx:
  - COMPONENT: Controles de viewport (móvil/tablet/desktop)
  - USE: ToggleGroup de shadcn/ui
  - ICONS: Smartphone, Tablet, Monitor de lucide-react
  - STATE: viewport con valores 'mobile' | 'tablet' | 'desktop'
  - STYLE: Clases responsive para simular dispositivos

Task 2: Crear componente PostPreview principal
CREATE src/app/admin/posts/post-preview.tsx:
  - IMPORT: PostContent y PostHeader de blog/components
  - PROPS: Recibir todos los estados del formulario
  - MOCK: Crear estructura PostWithRelations para PostHeader
  - LAYOUT: Replicar estructura de post-page-content.tsx
  - VIEWPORT: Integrar PostPreviewViewport con contenedor responsive

Task 3: Modificar PostForm - Agregar 4to tab
MODIFY src/app/admin/posts/post-form.tsx:
  - TABS: Cambiar grid-cols-3 a grid-cols-4 en TabsList
  - ADD: TabsTrigger value="preview" con icono Eye
  - ADD: TabsContent value="preview" con PostPreview
  - PASS: Todos los estados necesarios a PostPreview
  - LAZY: Cargar PostPreview solo cuando tab activo

Task 4: Ajustar estilos para preview
MODIFY src/app/admin/posts/post-preview.tsx:
  - CONTAINER: Agregar clases para simular viewport
  - MOBILE: max-w-sm mx-auto
  - TABLET: max-w-2xl mx-auto
  - DESKTOP: max-w-4xl mx-auto
  - SCROLL: overflow-y-auto con altura fija para preview

Task 5: Optimización de performance
MODIFY src/app/admin/posts/post-preview.tsx:
  - MEMO: Usar useMemo para normalizar contenido
  - LAZY: Solo renderizar cuando tab preview está activo
  - DEBOUNCE: Opcional - retrasar actualización del preview
```

### Per-Task Pseudocode
```typescript
// Task 1: PostPreviewViewport
// src/app/admin/posts/post-preview-viewport.tsx
'use client'

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Monitor, Tablet, Smartphone } from "lucide-react"

type Viewport = 'mobile' | 'tablet' | 'desktop'

interface PostPreviewViewportProps {
  viewport: Viewport
  onViewportChange: (viewport: Viewport) => void
}

export function PostPreviewViewport({ viewport, onViewportChange }: PostPreviewViewportProps) {
  return (
    <div className="flex items-center justify-center mb-4">
      <ToggleGroup 
        type="single" 
        value={viewport}
        onValueChange={(value) => value && onViewportChange(value as Viewport)}
      >
        <ToggleGroupItem value="mobile" aria-label="Vista móvil">
          <Smartphone className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="tablet" aria-label="Vista tablet">
          <Tablet className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="desktop" aria-label="Vista escritorio">
          <Monitor className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

// Task 2: PostPreview principal
// src/app/admin/posts/post-preview.tsx
'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { PostContent } from '@/app/blog/components/post-content'
import { PostHeader } from '@/app/blog/components/post-header'
import { PostPreviewViewport } from './post-preview-viewport'
import type { Category } from '@prisma/client'

interface PostPreviewProps {
  title: string
  content: any // JSON de Novel
  excerpt?: string
  featuredImageUrl?: string
  categoryId: string
  categories: Category[]
  authorName?: string
  createdAt?: Date
}

export function PostPreview({
  title,
  content,
  excerpt,
  featuredImageUrl,
  categoryId,
  categories,
  authorName,
  createdAt
}: PostPreviewProps) {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  
  // Mock del post para PostHeader
  const mockPost = useMemo(() => ({
    id: 'preview',
    title,
    slug: 'preview',
    content,
    excerpt,
    featuredImageUrl,
    status: 'DRAFT' as const,
    language: 'ES' as const,
    seoTitle: null,
    seoDescription: null,
    authorId: 'preview',
    categoryId,
    readingTime: null,
    publishedAt: null,
    createdAt: createdAt || new Date(),
    updatedAt: new Date(),
    author: {
      id: 'preview',
      name: authorName || 'Autor',
      email: '',
      role: 'colaborador' as const,
      // otros campos necesarios según User model
    },
    category: categories.find(c => c.id === categoryId) || {
      id: 'preview',
      name: 'Sin categoría',
      slug: 'sin-categoria',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    tags: [],
    comments: []
  }), [title, content, excerpt, featuredImageUrl, categoryId, categories, authorName, createdAt])
  
  // Clases de contenedor según viewport
  const containerClass = viewport === 'mobile' ? 'max-w-sm' : 
                        viewport === 'tablet' ? 'max-w-2xl' : 
                        'max-w-4xl'
  
  return (
    <div className="space-y-4">
      {/* Controles de viewport */}
      <PostPreviewViewport 
        viewport={viewport} 
        onViewportChange={setViewport}
      />
      
      {/* Contenedor de preview con scroll */}
      <div className="border rounded-lg bg-background overflow-hidden">
        <div className="h-[600px] overflow-y-auto">
          <div className={`${containerClass} mx-auto px-4`}>
            {/* Header del Post */}
            <div className="pt-12 pb-8">
              <PostHeader post={mockPost} />
            </div>
            
            {/* Imagen destacada */}
            {featuredImageUrl && (
              <div className="relative w-full aspect-[21/9] mb-12">
                <Image
                  src={featuredImageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            )}
            
            {/* Contenido */}
            <div className="prose prose-lg dark:prose-invert max-w-none pb-12">
              <PostContent content={content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Task 3: Modificar PostForm
// src/app/admin/posts/post-form.tsx (modificaciones)

// Importar el preview
import { PostPreview } from './post-preview'
import { Eye } from 'lucide-react'

// Dentro del componente PostForm:
// Cambiar TabsList
<TabsList className="grid w-full grid-cols-4"> {/* Era grid-cols-3 */}
  <TabsTrigger value="basic">Datos básicos</TabsTrigger>
  <TabsTrigger value="content">Contenido</TabsTrigger>
  <TabsTrigger value="seo">SEO y metadatos</TabsTrigger>
  <TabsTrigger value="preview">
    <Eye className="h-4 w-4 mr-2" />
    Preview
  </TabsTrigger>
</TabsList>

// Agregar nuevo TabsContent
<TabsContent value="preview" className="mt-6">
  <PostPreview
    title={title}
    content={content}
    excerpt={excerpt}
    featuredImageUrl={featuredImageUrl}
    categoryId={categoryId}
    categories={categories}
    authorName={session?.user?.name}
    createdAt={post?.createdAt}
  />
</TabsContent>
```

### Integration Points
```yaml
COMPONENTS:
  - PostContent: Ya existe, renderiza JSON → HTML
  - PostHeader: Ya existe, muestra metadatos
  - Tabs/TabsTrigger: Ya usado en PostForm
  - ToggleGroup: Nuevo de shadcn/ui para viewport
  
STATES:
  - Todos los estados necesarios ya existen en PostForm
  - Solo pasar props al componente PostPreview
  - No requiere nuevos estados globales
  
AUTH:
  - session?.user?.name para mostrar autor actual
  - Ya disponible en PostForm
  
STYLES:
  - Reutilizar prose de Tailwind para contenido
  - Clases responsive para simular viewports
  - Dark mode ya soportado automáticamente
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Corregir cualquier error antes de continuar
pnpm run lint
pnpm run typecheck
# Expected: 0 errores
```

### Level 2: Visual Testing
```bash
# Iniciar servidor de desarrollo
pnpm run dev

# Navegar a crear post
# http://localhost:3000/admin/posts/new
# - Verificar que aparece 4to tab "Preview"
# - Escribir contenido y cambiar a preview
# - Verificar renderizado correcto

# Navegar a editar post existente
# http://localhost:3000/admin/posts/[id]/edit
# - Verificar preview muestra contenido actual
# - Hacer cambios y verificar actualización
```

### Level 3: Responsive Testing
```bash
# En el preview, probar:
# - Toggle móvil: contenedor se reduce
# - Toggle tablet: tamaño medio
# - Toggle desktop: tamaño completo
# - Scroll funciona en cada viewport
```

### Level 4: Integration Testing
```typescript
// Verificar manualmente:
// 1. Crear post con preview → guardar → ver público
//    Preview debe coincidir con vista pública

// 2. Editar post existente
//    Preview debe mostrar cambios en tiempo real

// 3. Cambiar entre tabs
//    Estado del formulario se mantiene
```

### Level 5: Production Build
```bash
pnpm run build
# Expected: Build exitoso sin warnings

pnpm run start
# Test preview en producción
```

## Final Checklist

### Arquitectura
- [ ] Solo componentes importan PostContent/PostHeader, no servicios
- [ ] Co-ubicación modular: preview en `/admin/posts/`
- [ ] No se rompe arquitectura en capas
- [ ] Estados compartidos correctamente desde PostForm

### Funcionalidad
- [ ] Tab Preview visible y funcional
- [ ] Renderizado idéntico a vista pública
- [ ] Controles de viewport funcionan
- [ ] Actualización en tiempo real
- [ ] Sin pérdida de estado al cambiar tabs

### UX
- [ ] Navegación intuitiva con tabs
- [ ] Preview claramente identificado
- [ ] Viewport controls accesibles
- [ ] Scroll independiente en preview
- [ ] Dark mode funciona correctamente

### Calidad
- [ ] Sin errores de lint/types
- [ ] Build de producción exitoso
- [ ] Performance aceptable (lazy loading)
- [ ] Responsive en todos los tamaños

## Anti-Patterns to Avoid

### Arquitectura
- ❌ NO importar servicios en componentes de preview
- ❌ NO modificar PostContent o PostHeader (reutilizar tal cual)
- ❌ NO crear nuevos servicios (no necesario para preview)
- ❌ NO duplicar lógica de renderizado

### UX
- ❌ NO usar modal (interrumpe flujo)
- ❌ NO requerir guardar para preview
- ❌ NO perder estado al cambiar tabs
- ❌ NO bloquear edición mientras en preview

### Performance
- ❌ NO renderizar preview cuando no visible
- ❌ NO re-renderizar innecesariamente
- ❌ NO cargar preview en servidor (client component)

## Score de Confianza: 9/10

Este PRP tiene alta probabilidad de éxito porque:
- Reutiliza componentes existentes probados
- Se integra naturalmente con el flujo actual
- No requiere cambios en servicios o BD
- Patrón de tabs ya establecido y familiar
- Todos los estados necesarios ya existen
- Arquitectura respetada completamente