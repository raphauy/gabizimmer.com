# PRP: CRUD de Posts del Blog

## Goal
Implementar un sistema completo de gestión de posts para el blog de Gabi Zimmer con editor rico (Novel.sh), upload de imágenes a Vercel Blob, integración opcional con AI para generación de contenido, y todas las operaciones CRUD necesarias para crear, editar, publicar y archivar contenido editorial sobre vinos y gastronomía, siguiendo el mismo nivel de calidad y características que el CRUD de categorías ya implementado.

## Why
- **Valor de negocio**: Permitir a Gabi publicar contenido editorial profesional sobre vinos, estableciendo su presencia digital como comunicadora de vinos
- **Impacto en usuarios**: Los lectores tendrán acceso a contenido de calidad sobre vinos, gastronomía y cultura, con una experiencia de lectura optimizada
- **Integración con features existentes**: Se integra con el sistema de categorías ya implementado para organizar el contenido
- **Problemas que resuelve**: Actualmente no hay forma de publicar contenido; este sistema permitirá flujo editorial completo desde borrador hasta publicación

## What
Sistema de gestión de posts con editor WYSIWYG que permite crear, editar, publicar y moderar contenido editorial. Incluye manejo de imágenes, estados de publicación, SEO metadata, soporte multiidioma, y las mismas características de UX del CRUD de categorías (validación en tiempo real, feedback visual, protección de integridad).

### Success Criteria
- [ ] CRUD completo de posts funcionando en `/admin/posts` con autenticación superadmin
- [ ] Editor Novel.sh integrado con upload de imágenes a Vercel Blob
- [ ] Estados de publicación (DRAFT, PUBLISHED, ARCHIVED) con flujo correcto
- [ ] Relación con categorías existentes funcionando con conteo de posts
- [ ] Slug único por idioma validado con indicadores visuales como en categorías
- [ ] Auto-generación de slug desde título con normalización de acentos
- [ ] Tests passing: `pnpm run lint && pnpm run typecheck && pnpm run build`
- [ ] UI consistente con sistema de diseño wine-theme usando shadcn/ui v4
- [ ] Loading states, skeleton components y toast notifications como en categorías

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Reglas arquitectónicas estrictas, solo services/ importa Prisma
  
- file: /docs/features.md
  why: CRÍTICO - Documentación del CRUD de categorías implementado como referencia exacta
  
- file: /docs/sistema-diseno-gz.md
  why: Sistema de diseño completo con colores wine-theme y tipografía Jost
  
- file: prisma/schema.prisma
  why: Modelo Post completo con relaciones a Category y User
  
- file: src/services/category-service.ts
  why: PATRÓN EXACTO a seguir - validaciones Zod, unicidad de slug, protección de integridad
  
- file: src/services/upload-service.ts
  why: Funciones uploadPostImage ya implementadas para Vercel Blob
  
- file: src/app/admin/categories/
  why: Módulo CRUD completo con todas las características de UX a replicar
  
- url: https://novel.sh/docs/installation
  why: Documentación oficial de Novel editor
  section: "Installation" y "Usage"
  
- url: https://sdk.vercel.ai/docs/ai-sdk-core/generating-text
  why: Vercel AI SDK v4 para features AI opcionales
  section: "generateText"
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── admin/
│   │   ├── categories/        # CRUD completo con todas las características
│   │   │   ├── page.tsx      # RSC lista con tabla responsive
│   │   │   ├── actions.ts    # Server actions con validaciones
│   │   │   ├── categories-list.tsx # Fetch con ordenamiento
│   │   │   ├── category-form.tsx # Validación tiempo real
│   │   │   ├── categories-skeleton.tsx # Loading states
│   │   │   ├── new/page.tsx  # Con breadcrumbs
│   │   │   └── [id]/edit/page.tsx # Con protección
│   │   └── components/
│   │       └── admin-sidebar-client.tsx # Ya incluye link a posts
├── services/
│   ├── category-service.ts   # Patrón completo con validaciones avanzadas
│   └── upload-service.ts     # uploadPostImage() ready
├── components/
│   └── ui/                   # 21 componentes shadcn/ui v4
└── lib/
    └── prisma.ts             # Solo importable desde services/
```

### Desired Codebase Tree
```bash
src/
├── services/
│   └── post-service.ts        # ÚNICA capa con acceso a Prisma, siguiendo category-service
├── app/
│   └── admin/posts/           # Módulo co-ubicado completo
│       ├── page.tsx           # RSC lista principal con tabla responsive
│       ├── actions.ts         # Server actions co-ubicadas con validaciones
│       ├── posts-list.tsx     # RSC fetch con ordenamiento y filtros
│       ├── posts-skeleton.tsx # Loading states como categories
│       ├── post-form.tsx      # Form con validación tiempo real
│       ├── post-editor.tsx    # Wrapper Novel editor
│       ├── post-image-upload.tsx # Upload featured image con preview
│       ├── post-actions-client.tsx # Client con confirmación delete
│       ├── post-status-badge.tsx # Badge con colores apropiados
│       ├── new/page.tsx       # Crear post con breadcrumbs
│       └── [id]/edit/page.tsx # Editar con protección autor/admin
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Arquitectura en capas estricta (docs/architecture.md)
// - SOLO services/ puede importar prisma
// - Validaciones Zod co-ubicadas AL INICIO del servicio
// - RSC por defecto, 'use client' solo cuando necesario
// - Server Actions en lugar de API routes
// - Co-ubicación modular: todo de posts junto

// PATTERN: Service layer con validaciones avanzadas (como category-service)
// src/services/post-service.ts
import { prisma } from '@/lib/prisma' // SOLO en services/
import { z } from 'zod'

// Validaciones AL INICIO
export const createPostSchema = z.object({
  title: z.string().min(1, "Título requerido").max(200),
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, "Slug inválido: solo minúsculas, números y guiones")
    .min(1, "Slug requerido")
    .max(100, "Slug demasiado largo"),
  content: z.any(), // JSON from Novel editor
  excerpt: z.string().max(300, "Máximo 300 caracteres").optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  language: z.enum(["ES", "EN"]),
  featuredImageUrl: z.string().url("URL de imagen inválida").optional(),
  categoryId: z.string().cuid("ID de categoría inválido"),
  authorId: z.string().cuid("ID de autor inválido"),
  seoTitle: z.string().max(60, "Máximo 60 caracteres").optional(),
  seoDescription: z.string().max(160, "Máximo 160 caracteres").optional()
})

export type CreatePostData = z.infer<typeof createPostSchema>

// PATTERN: Auto-generación de slug con normalización (como categories)
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100)
}

// PATTERN: Verificación de unicidad con indicadores (como categories)
export async function isSlugUnique(
  slug: string, 
  language: Language,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.post.findFirst({
    where: { 
      slug, 
      language,
      ...(excludeId && { NOT: { id: excludeId } })
    }
  })
  return !existing
}

// GOTCHA: Protección de integridad referencial
// Al eliminar, verificar si no hay comentarios asociados
const postWithRelations = await prisma.post.findUnique({
  where: { id },
  include: { _count: { select: { comments: true } } }
})

if (postWithRelations?._count.comments > 0) {
  throw new Error(`No se puede eliminar: el post tiene ${postWithRelations._count.comments} comentarios`)
}

// GOTCHA: Next.js 15 dynamic imports para Novel
const NovelEditor = dynamic(() => import('./post-editor'), {
  ssr: false,
  loading: () => <Skeleton className="h-96" />
})

// PATTERN: Feedback visual consistente (como categories)
toast.success("Post creado exitosamente")
toast.error("Error al crear el post")
toast.info("Guardando borrador...")

// PATTERN: Revalidation paths completos
revalidatePath("/admin/posts")
revalidatePath(`/blog/${post.slug}`)
revalidatePath("/blog")
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// 1. Prisma Schema (YA EXISTE - NO MODIFICAR)
model Post {
  id            String      @id @default(cuid())
  title         String
  slug          String      
  content       Json        // Novel editor JSON
  excerpt       String?
  status        PostStatus  @default(DRAFT)
  language      Language
  featuredImageUrl String?
  
  seoTitle        String?
  seoDescription  String?
  
  authorId      String
  author        User        @relation(fields: [authorId], references: [id])
  
  categoryId    String      
  category      Category    @relation(fields: [categoryId], references: [id])
  
  comments      Comment[]   // Para protección de integridad
  
  readingTime   Int?        // Auto-calcular
  
  publishedAt   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@unique([slug, language]) // Slug único por idioma
  @@index([status, publishedAt])
  @@index([authorId])
  @@index([categoryId])
}
```

### Task List (Orden de Implementación)
```yaml
Task 0: Install Novel.sh
RUN: pnpm add novel@latest
VALIDATE: Check package.json includes novel

Task 1: Service Layer - post-service.ts
CREATE src/services/post-service.ts:
  - COPY estructura exacta de category-service.ts
  - VALIDATIONS: Schemas Zod co-ubicados con mensajes descriptivos
  - IMPLEMENT: generateSlug con normalización de acentos
  - IMPLEMENT: isSlugUnique para verificación en tiempo real
  - IMPLEMENT: checkPostIntegrity para protección antes de eliminar
  - IMPLEMENT: createPost, getAllPosts, getPostById, updatePost, deletePost
  - SPECIAL: getPostBySlugAndLanguage para validar unicidad
  - SPECIAL: calculateReadingTime desde content
  - FILTER: Por status, categoryId, authorId, language
  - ONLY LAYER: Que puede importar @/lib/prisma

Task 2: Server Actions Co-ubicadas
CREATE src/app/admin/posts/actions.ts:
  - 'use server' al inicio
  - AUTH: Validar session superadmin/colaborador
  - ACTIONS: createPostAction, updatePostAction, deletePostAction
  - ACTIONS: checkSlugAction para verificación en tiempo real
  - USE: post-service.ts únicamente
  - REVALIDATE: Múltiples paths después de cambios
  - ERROR: Manejo robusto con mensajes descriptivos
  - FEEDBACK: Preparar mensajes para toasts

Task 3: RSC Principal - Lista
CREATE src/app/admin/posts/page.tsx:
  - COPY pattern from: src/app/admin/categories/page.tsx
  - HEADER: "Gestión de Posts del Blog" con descripción
  - BUTTON: Link a /admin/posts/new con icono Plus
  - CARD: Container con CardHeader y CardContent
  - SUSPENSE: PostsSkeleton component
  - NO 'use client' - RSC por defecto

Task 4: RSC Data Fetching
CREATE src/app/admin/posts/posts-list.tsx:
  - ASYNC server component
  - CALL: getAllPosts() from service
  - RENDER: Table responsive con columnas clickeables
  - COLUMNS: Título (link), Autor, Categoría, Estado, Idioma, Fecha
  - SORT: Por fecha descendente por defecto
  - INCLUDE: PostStatusBadge component
  - NO direct prisma import

Task 5: Post Status Badge
CREATE src/app/admin/posts/post-status-badge.tsx:
  - 'use client' si necesario
  - VARIANTS: DRAFT (amber), PUBLISHED (green), ARCHIVED (gray)
  - USE: Badge from shadcn/ui con colores consistentes
  - DARK MODE: Soporte completo como categories

Task 6: Loading Skeleton
CREATE src/app/admin/posts/posts-skeleton.tsx:
  - COPY pattern from categories-skeleton.tsx
  - TABLE skeleton matching real table
  - USE: Skeleton from shadcn/ui
  - ROWS: 5-10 skeleton rows con estructura idéntica

Task 7: Novel Editor Wrapper
CREATE src/app/admin/posts/post-editor.tsx:
  - 'use client' obligatorio
  - DYNAMIC import Novel con next/dynamic
  - PROPS: content, onChange, onImageUpload
  - INTEGRATE: uploadContentImage from upload-service
  - AUTO-SAVE: Debounced updates con indicador visual
  - PLACEHOLDER: "Escribe tu contenido aquí..."

Task 8: Featured Image Upload
CREATE src/app/admin/posts/post-image-upload.tsx:
  - 'use client' component
  - USE: uploadFeaturedImage from upload-service
  - PREVIEW: Mostrar imagen actual con opción eliminar
  - REPLACE: Botón para cambiar imagen
  - FEEDBACK: Loading state durante upload
  - SIZE: Límite 5MB con validación

Task 9: Post Form
CREATE src/app/admin/posts/post-form.tsx:
  - 'use client' component
  - COPY estructura de category-form.tsx
  - FIELDS: Título con auto-slug, editor, excerpt, etc
  - SLUG: Auto-generación con botón regenerar
  - SLUG: Verificación unicidad en tiempo real con indicador
  - COUNTERS: Caracteres para título, excerpt, SEO
  - VALIDATION: Con react-hook-form y zod
  - SUBMIT: Usar server actions con loading state

Task 10: Client Actions
CREATE src/app/admin/posts/post-actions-client.tsx:
  - 'use client' component
  - DELETE: Modal confirmación con mensaje descriptivo
  - EDIT: Link a /admin/posts/[id]/edit
  - VIEW: Link preview al blog (si publicado)
  - TOAST: Feedback con sonner para todas las acciones

Task 11: Create Post Page
CREATE src/app/admin/posts/new/page.tsx:
  - RSC fetching categories para select
  - RENDER: PostForm component
  - TITLE: "Nuevo Post"
  - BREADCRUMB: Admin > Posts > Nuevo
  - CARD: Container consistente con categories

Task 12: Edit Post Page  
CREATE src/app/admin/posts/[id]/edit/page.tsx:
  - RSC fetching post by ID con relaciones
  - VALIDATE: Autor o superadmin puede editar
  - RENDER: PostForm con datos existentes
  - TITLE: "Editar Post: {title}"
  - BREADCRUMB: Admin > Posts > Editar
  - 404: Si post no existe

Task 13: Update Sidebar Count
MODIFY src/app/admin/components/admin-sidebar.tsx:
  - ADD: postsCount to data fetch
  - DISPLAY: Badge con count en nav item
  - CONSISTENT: Con badge de categorías
```

### Per-Task Pseudocode
```typescript
// Task 1: Service Layer con características avanzadas
// src/services/post-service.ts
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schemas al inicio con mensajes descriptivos
export const createPostSchema = z.object({
  title: z.string()
    .min(1, "El título es requerido")
    .max(200, "El título no puede exceder 200 caracteres"),
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones")
    .min(1, "El slug es requerido")
    .max(100, "El slug no puede exceder 100 caracteres"),
  content: z.any(),
  excerpt: z.string()
    .max(300, "El resumen no puede exceder 300 caracteres")
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  language: z.enum(["ES", "EN"]),
  featuredImageUrl: z.string().url("URL de imagen inválida").optional(),
  categoryId: z.string().cuid("Categoría inválida"),
  authorId: z.string().cuid("Autor inválido"),
  seoTitle: z.string().max(60, "Máximo 60 caracteres").optional(),
  seoDescription: z.string().max(160, "Máximo 160 caracteres").optional()
})

export const updatePostSchema = createPostSchema.partial()

export type CreatePostData = z.infer<typeof createPostSchema>
export type UpdatePostData = z.infer<typeof updatePostSchema>

// Auto-generación de slug con normalización
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100)
}

// Verificación de unicidad
export async function isSlugUnique(
  slug: string,
  language: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.post.findFirst({
    where: {
      slug,
      language,
      ...(excludeId && { NOT: { id: excludeId } })
    }
  })
  return !existing
}

// Calcular tiempo de lectura
function calculateReadingTime(content: any): number {
  const text = extractTextFromJSON(content)
  const wordsPerMinute = 200
  const words = text.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// Verificar integridad antes de eliminar
async function checkPostIntegrity(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      _count: {
        select: { comments: true }
      }
    }
  })
  
  if (post?._count.comments > 0) {
    throw new Error(
      `No se puede eliminar el post: tiene ${post._count.comments} comentario(s) asociado(s)`
    )
  }
}

export async function createPost(data: CreatePostData) {
  const validated = createPostSchema.parse(data)
  
  // Validar slug único por idioma
  const isUnique = await isSlugUnique(validated.slug, validated.language)
  if (!isUnique) {
    throw new Error(
      `El slug "${validated.slug}" ya existe para el idioma ${validated.language}`
    )
  }
  
  const readingTime = calculateReadingTime(validated.content)
  const publishedAt = validated.status === 'PUBLISHED' ? new Date() : null
  
  try {
    const post = await prisma.post.create({
      data: {
        ...validated,
        readingTime,
        publishedAt
      },
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true, slug: true } }
      }
    })
    return post
  } catch (error) {
    console.error('Error creating post:', error)
    throw new Error('Error al crear el post')
  }
}

export async function getAllPosts(filters?: {
  status?: string
  categoryId?: string
  authorId?: string
  language?: string
}) {
  const where: any = {}
  
  if (filters?.status) where.status = filters.status
  if (filters?.categoryId) where.categoryId = filters.categoryId
  if (filters?.authorId) where.authorId = filters.authorId
  if (filters?.language) where.language = filters.language
  
  return await prisma.post.findMany({
    where,
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { comments: true } }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function deletePost(id: string) {
  // Verificar integridad primero
  await checkPostIntegrity(id)
  
  try {
    await prisma.post.delete({ where: { id } })
  } catch (error) {
    console.error('Error deleting post:', error)
    throw new Error('Error al eliminar el post')
  }
}

// Task 2: Server Actions con validaciones
// src/app/admin/posts/actions.ts
"use server"

import { auth } from '@/lib/auth'
import { 
  createPost, 
  updatePost, 
  deletePost, 
  isSlugUnique,
  generateSlug 
} from '@/services/post-service'
import { revalidatePath } from 'next/cache'

export async function checkSlugAction(
  slug: string, 
  language: string,
  excludeId?: string
) {
  try {
    const isUnique = await isSlugUnique(slug, language, excludeId)
    return { isUnique }
  } catch (error) {
    return { isUnique: false, error: 'Error al verificar slug' }
  }
}

export async function generateSlugAction(title: string) {
  return generateSlug(title)
}

export async function createPostAction(data: any) {
  const session = await auth()
  
  if (!session?.user || (session.user.role !== 'superadmin' && session.user.role !== 'colaborador')) {
    throw new Error('No autorizado para crear posts')
  }
  
  try {
    const post = await createPost({
      ...data,
      authorId: session.user.id
    })
    
    revalidatePath('/admin/posts')
    if (post.status === 'PUBLISHED') {
      revalidatePath('/blog')
      revalidatePath(`/blog/${post.slug}`)
    }
    
    return { 
      success: true, 
      post,
      message: 'Post creado exitosamente' 
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al crear post' 
    }
  }
}

export async function deletePostAction(id: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'superadmin') {
    throw new Error('Solo superadmin puede eliminar posts')
  }
  
  try {
    await deletePost(id)
    
    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    
    return { 
      success: true,
      message: 'Post eliminado exitosamente'
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al eliminar post' 
    }
  }
}

// Task 9: Post Form con validación avanzada
// src/app/admin/posts/post-form.tsx
"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPostSchema } from '@/services/post-service'
import { generateSlugAction, checkSlugAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Check, X, Loader2, RefreshCw } from 'lucide-react'

export function PostForm({ 
  post, 
  categories 
}: { 
  post?: any
  categories: any[]
}) {
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugIsUnique, setSlugIsUnique] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm({
    resolver: zodResolver(createPostSchema),
    defaultValues: post || {
      title: '',
      slug: '',
      content: {},
      excerpt: '',
      status: 'DRAFT',
      language: 'ES',
      categoryId: ''
    }
  })
  
  const title = form.watch('title')
  const slug = form.watch('slug')
  const language = form.watch('language')
  const excerpt = form.watch('excerpt')
  const seoTitle = form.watch('seoTitle')
  const seoDescription = form.watch('seoDescription')
  
  // Auto-generar slug desde título
  useEffect(() => {
    if (!post && title && !slug) {
      generateSlugAction(title).then(newSlug => {
        form.setValue('slug', newSlug)
      })
    }
  }, [title, slug, post, form])
  
  // Verificar unicidad de slug
  useEffect(() => {
    if (slug && language) {
      const timer = setTimeout(async () => {
        setIsCheckingSlug(true)
        const result = await checkSlugAction(slug, language, post?.id)
        setSlugIsUnique(result.isUnique)
        setIsCheckingSlug(false)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [slug, language, post?.id])
  
  const handleRegenerateSlug = async () => {
    if (title) {
      const newSlug = await generateSlugAction(title)
      form.setValue('slug', newSlug)
      toast.info('Slug regenerado')
    }
  }
  
  const onSubmit = async (data: any) => {
    if (!slugIsUnique && slugIsUnique !== null) {
      toast.error('El slug debe ser único')
      return
    }
    
    setIsSubmitting(true)
    try {
      // Submit logic here
      toast.success(post ? 'Post actualizado' : 'Post creado')
    } catch (error) {
      toast.error('Error al guardar el post')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Campo Título con contador */}
      <div>
        <Label htmlFor="title">
          Título ({title.length}/200)
        </Label>
        <Input
          id="title"
          {...form.register('title')}
          placeholder="Título del post"
          maxLength={200}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>
      
      {/* Campo Slug con verificación */}
      <div>
        <Label htmlFor="slug" className="flex items-center gap-2">
          Slug URL
          {isCheckingSlug && <Loader2 className="h-3 w-3 animate-spin" />}
          {!isCheckingSlug && slugIsUnique === true && (
            <Check className="h-3 w-3 text-green-600" />
          )}
          {!isCheckingSlug && slugIsUnique === false && (
            <X className="h-3 w-3 text-red-600" />
          )}
        </Label>
        <div className="flex gap-2">
          <Input
            id="slug"
            {...form.register('slug')}
            placeholder="slug-del-post"
            className={slugIsUnique === false ? 'border-red-500' : ''}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRegenerateSlug}
            title="Regenerar slug"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {slugIsUnique === false && (
          <p className="text-sm text-destructive mt-1">
            Este slug ya existe para el idioma seleccionado
          </p>
        )}
      </div>
      
      {/* Campo Excerpt con contador */}
      <div>
        <Label htmlFor="excerpt">
          Resumen ({excerpt?.length || 0}/300)
        </Label>
        <Textarea
          id="excerpt"
          {...form.register('excerpt')}
          placeholder="Breve descripción del post..."
          maxLength={300}
          rows={3}
        />
      </div>
      
      {/* Más campos... */}
      
      {/* Botones de acción */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || slugIsUnique === false}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {post ? 'Actualizar' : 'Crear'} Post
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/posts')}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
```

### Integration Points
```yaml
DATABASE:
  - validate: pnpm prisma validate
  - NO migrations needed - schema already exists

AUTH:
  - protect: middleware.ts already configured
  - roles: superadmin and colaborador can create/edit
  - only superadmin can delete
  - authorId: from session.user.id

UI:
  - components: usar shadcn/ui v4 existentes
  - colors: wine-primary, wine-accent from sistema-diseno
  - dark mode: ya soportado con variables CSS
  - typography: font-jost para UI
  - toast: sonner para todo feedback

STORAGE:
  - images: Vercel Blob via upload-service
  - folders: blog/featured/, blog/posts/
  - cleanup: delete images when post deleted

NAVIGATION:
  - sidebar: ya incluye link a posts
  - breadcrumbs: en páginas crear/editar
  - badge: mostrar count de posts totales
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar PRIMERO - NO continuar con errores
pnpm run lint
pnpm run typecheck
# Expected: 0 errors, 0 warnings
```

### Level 2: Build Check
```bash
# Validar que compila
pnpm run build
# Expected: Build successful
```

### Level 3: Manual Testing Checklist
```bash
# Start dev server
pnpm run dev

# Test checklist completo:
# ✓ Navigate to /admin/posts
# ✓ Ver tabla con skeleton loading
# ✓ Click "Nuevo Post"
# ✓ Título auto-genera slug
# ✓ Verificación slug muestra ✓ o ✗
# ✓ Botón regenerar slug funciona
# ✓ Contadores de caracteres funcionan
# ✓ Upload featured image con preview
# ✓ Editor Novel.sh carga sin errores
# ✓ Auto-save muestra indicador
# ✓ Guardar como borrador
# ✓ Toast muestra "Post creado"
# ✓ Volver a lista, ver nuevo post
# ✓ Click en título abre edición
# ✓ Editar y actualizar
# ✓ Publicar post
# ✓ Intentar eliminar con confirmación
# ✓ Badge en sidebar muestra count
```

### Level 4: Database Validation
```bash
# Check data
pnpm prisma studio
# Verify: 
# - Posts con relaciones correctas
# - Slug único por idioma
# - Reading time calculado
# - PublishedAt seteado al publicar
```

## Final Checklist

### Arquitectura en Capas (CRÍTICO)
- [ ] Solo post-service.ts importa @/lib/prisma
- [ ] Validaciones Zod co-ubicadas al inicio con mensajes descriptivos
- [ ] Server Actions usan solo services, nunca prisma directo
- [ ] Co-ubicación modular: todo en /admin/posts/
- [ ] RSC por defecto, 'use client' solo cuando necesario

### Funcionalidad Core
- [ ] CRUD completo funcionando (Create, Read, Update, Delete)
- [ ] Novel editor integrado con upload de imágenes
- [ ] Estados de publicación con flujo correcto
- [ ] Slug único por idioma validado con indicador visual
- [ ] Auto-generación de slug con normalización de acentos
- [ ] Relación con categorías funcionando
- [ ] Featured image upload/replace/delete
- [ ] Reading time calculado automáticamente
- [ ] publishedAt seteado al publicar
- [ ] Protección de integridad al eliminar

### UI/UX (Igual que categorías)
- [ ] Tabla responsive con columnas clickeables
- [ ] Formularios con validación en tiempo real
- [ ] Contadores de caracteres en campos limitados
- [ ] Loading states con skeleton components
- [ ] Modal de confirmación para eliminación
- [ ] Toast notifications para todas las operaciones
- [ ] Breadcrumbs en páginas crear/editar
- [ ] Badge en sidebar con count actualizado
- [ ] Dark mode funcionando perfectamente
- [ ] Mobile responsive

### Calidad
- [ ] Sin errores de lint
- [ ] Sin errores de TypeScript
- [ ] Build exitoso
- [ ] Manejo de errores con mensajes descriptivos
- [ ] Feedback visual para todas las acciones

## Anti-Patterns to Avoid

### Arquitectura (NO HACER)
- ❌ NO importar `@/lib/prisma` fuera de `services/`
- ❌ NO crear API routes - usar Server Actions
- ❌ NO separar validaciones Zod del servicio
- ❌ NO mezclar lógica de posts con otros dominios
- ❌ NO usar 'use client' en pages principales

### Implementación (EVITAR)
- ❌ NO instalar librerías adicionales sin necesidad
- ❌ NO crear nuevos patrones si existen establecidos
- ❌ NO exponer errores de BD al usuario
- ❌ NO olvidar validación de unicidad de slug
- ❌ NO permitir eliminar posts con comentarios
- ❌ NO dejar imágenes huérfanas en Blob storage
- ❌ NO omitir indicadores visuales de validación

### UI (PROHIBIDO)
- ❌ NO usar otros frameworks UI además de shadcn/ui
- ❌ NO crear estilos custom si existen en sistema-diseno
- ❌ NO ignorar dark mode
- ❌ NO skipear loading states y skeletons
- ❌ NO olvidar toast notifications
- ❌ NO omitir confirmación antes de acciones destructivas
- ❌ NO olvidar breadcrumbs y navegación

---

## Score de Confianza: 9.5/10

Este PRP proporciona toda la información necesaria para implementar el CRUD de posts al mismo nivel de calidad que el CRUD de categorías ya implementado. Incluye todas las características avanzadas de UX como validación en tiempo real, indicadores visuales, protección de integridad, y feedback completo.

El proyecto está excepcionalmente bien preparado con:
- ✅ CRUD de categorías como referencia perfecta con todas las características
- ✅ Arquitectura clara y documentada
- ✅ Servicios de upload listos
- ✅ Sistema de diseño completo
- ✅ Autenticación configurada
- ✅ Prisma schema ya definido
- ✅ Navegación ya incluye posts

La implementación siguiendo este PRP debería resultar en código production-ready que mantiene la consistencia y calidad del proyecto.