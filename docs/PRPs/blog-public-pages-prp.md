# PRP: Blog Público - Páginas y Componentes

## Goal
Implementar el sistema completo de blog público para gabizimmer.com con rutas SEO-friendly `/blog/[categorySlug]/[postSlug]`, página de post individual con diseño profesional y moderno, componente PostContent reutilizable, sistema de comentarios integrado, y página índice del blog con filtros y paginación. Todo siguiendo el sistema de diseño establecido, patrones RSC de Next.js 15, y arquitectura en capas estricta del proyecto.

## Why
- **Valor de negocio**: Establecer la presencia editorial online de Gabi Zimmer como experta en vinos
- **Impacto en usuarios**: Proporcionar una experiencia de lectura excepcional, accesible y mobile-first
- **Integración con features existentes**: Aprovechar el sistema de posts completo ya implementado en admin
- **Problemas que resuelve**: Actualmente no hay forma pública de leer el contenido editorial creado

## What
Sistema de blog público completo con navegación por categorías, lectura de posts individuales, sistema de comentarios, búsqueda, paginación y SEO optimizado. El diseño debe ser simple, moderno y profesional siguiendo el sistema de diseño de Gabi Zimmer con componentes shadcn/ui v4.

### Success Criteria
- [ ] Página de post individual accesible en `/blog/[categorySlug]/[postSlug]` con todo el contenido
- [ ] Componente PostContent reutilizable sin comentarios
- [ ] Sistema de comentarios funcional con moderación
- [ ] Página índice del blog con grid de posts y filtros por categoría
- [ ] Paginación server-side funcionando correctamente
- [ ] Posts relacionados mostrándose automáticamente
- [ ] SEO completo con metadata dinámicos y sitemap
- [ ] Build sin errores: `pnpm run build && pnpm run typecheck && pnpm run lint`
- [ ] Performance óptima con ISR y lazy loading de imágenes
- [ ] Diseño responsive mobile-first
- [ ] Dark mode completamente funcional

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Reglas arquitectónicas estrictas que DEBEN seguirse
  sections: "Arquitectura en Capas", "Principios de Diseño"
  
- file: /docs/sistema-diseno-gz.md
  why: Sistema de diseño completo con colores, tipografías y componentes
  sections: "Paleta de Colores", "Tipografía", "Componentes de Blog"
  
- file: /docs/features.md
  why: Features implementadas y contexto del proyecto
  sections: "Features de Administrador", "Sistema de Diseño"
  
- file: prisma/schema.prisma
  why: Modelos Post, Category, Comment, User completos
  sections: "model Post", "model Comment", "model Category"
  
- file: src/services/post-service.ts
  why: Service layer completo con todas las funciones necesarias
  sections: todas las funciones export
  
- file: src/services/category-service.ts
  why: CRUD de categorías para filtros
  sections: "getAllCategories", "getCategoryBySlug"
  
- file: src/app/admin/posts/page.tsx
  why: Patrón RSC con Suspense ya implementado
  sections: estructura completa
  
- file: src/app/admin/posts/post-editor.tsx
  why: Entender formato del contenido JSON de Novel
  sections: "normalizeContent", renderizado
  
- file: src/app/admin/posts/actions.ts
  why: Patrón de Server Actions establecido
  sections: todas las actions
  
- file: docs/resources/blog-post-reference-1.png
  why: Referencia visual del diseño deseado
  note: Imagen con layout clean y profesional
  
- url: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
  why: Rutas dinámicas anidadas en Next.js 15
  
- url: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  why: SEO con metadata dinámicos
  
- url: https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
  why: ISR para performance óptima
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── admin/                    # Panel admin completo
│   │   ├── posts/                # CRUD posts funcional
│   │   │   ├── page.tsx          # Lista posts
│   │   │   ├── new/page.tsx      # Crear post
│   │   │   ├── [id]/edit/page.tsx # Editar post
│   │   │   ├── post-editor.tsx   # Editor Novel
│   │   │   └── actions.ts        # Server actions
│   │   └── categories/           # CRUD categorías
│   ├── blog/                     # Blog público (mínimo)
│   │   └── page.tsx              # Solo placeholder
│   └── globals.css               # Estilos globales
├── services/
│   ├── post-service.ts           # ✅ Completo (16 funciones)
│   ├── category-service.ts       # ✅ Completo
│   └── upload-service.ts         # ✅ Vercel Blob
├── components/
│   └── ui/                       # 22 componentes shadcn/ui v4
└── lib/
    ├── prisma.ts                 # Cliente Prisma
    └── auth/                     # NextAuth config
```

### Desired Codebase Tree
```bash
src/
├── app/
│   └── blog/
│       ├── page.tsx                        # RSC índice del blog
│       ├── layout.tsx                      # Layout con header/footer
│       ├── blog-grid.tsx                   # RSC grid de posts
│       ├── blog-filters.tsx                # Cliente filtros
│       ├── blog-pagination.tsx             # Componente paginación
│       ├── sitemap.ts                      # Sitemap dinámico
│       ├── [categorySlug]/
│       │   ├── page.tsx                    # Página de categoría
│       │   └── [postSlug]/
│       │       ├── page.tsx                # RSC página del post
│       │       ├── post-page-content.tsx   # RSC contenido
│       │       └── comments-section.tsx    # Cliente comentarios
│       └── components/
│           ├── post-content.tsx            # Reutilizable sin comentarios
│           ├── post-card.tsx               # 3 variantes
│           ├── post-header.tsx             # Metadata del post
│           ├── author-info.tsx             # Info del autor
│           ├── share-buttons.tsx           # Compartir social
│           ├── related-posts.tsx           # Posts relacionados
│           └── comment-form.tsx            # Formulario comentarios
├── services/
│   └── comment-service.ts                  # NUEVO: CRUD comentarios
└── lib/
    ├── seo.ts                              # Utilidades SEO
    └── related-posts.ts                    # Algoritmo relacionados
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Arquitectura en capas estricta (docs/architecture.md)
// - SOLO services/ puede importar prisma
// - RSC fetchea datos → pasa props a cliente
// - Server Actions en lugar de API routes
// - Co-ubicación modular: todo de blog junto

// PATTERN: RSC con Suspense (copiado de admin)
export default function BlogPage() {
  return (
    <div>
      <Suspense fallback={<BlogSkeleton />}>
        <BlogGrid />
      </Suspense>
    </div>
  )
}

// PATTERN: Server Component async para data fetching
export async function BlogGrid() {
  const posts = await getAllPosts({ status: 'PUBLISHED' })
  return <PostGrid posts={posts} />
}

// GOTCHA: Next.js 15 - params y searchParams son Promise
interface PageProps {
  params: Promise<{ categorySlug: string; postSlug: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

// PATTERN: generateStaticParams para ISR
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(post => ({
    categorySlug: post.category.slug,
    postSlug: post.slug,
  }))
}

// PATTERN: Contenido Novel es JSON, necesita normalización
function normalizeContent(content: any): any {
  if (!content) return { type: 'doc', content: [] }
  if (typeof content === 'string') {
    return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }] }
  }
  return content
}

// PATTERN: Validaciones Zod en services
export const createCommentSchema = z.object({
  content: z.string().min(1, "Comentario requerido").max(1000),
  postId: z.string().cuid(),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email()
})
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// 1. Service de Comentarios (NUEVO)
// src/services/comment-service.ts
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const createCommentSchema = z.object({
  content: z.string().min(1, "El comentario es requerido").max(1000),
  postId: z.string().cuid("ID de post inválido"),
  authorName: z.string().min(1, "El nombre es requerido").max(100),
  authorEmail: z.string().email("Email inválido"),
})

export const moderateCommentSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['APPROVED', 'REJECTED', 'SPAM'])
})

export type CreateCommentData = z.infer<typeof createCommentSchema>
export type ModerateCommentData = z.infer<typeof moderateCommentSchema>

export async function createComment(data: unknown) {
  const validated = createCommentSchema.parse(data)
  
  const comment = await prisma.comment.create({
    data: {
      ...validated,
      status: 'PENDING', // Moderación por defecto
    },
    include: {
      post: true
    }
  })
  
  return comment
}

export async function getApprovedComments(postId: string) {
  return prisma.comment.findMany({
    where: {
      postId,
      status: 'APPROVED'
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function moderateComment(data: ModerateCommentData) {
  return prisma.comment.update({
    where: { id: data.id },
    data: { status: data.status }
  })
}

// 2. Utilidades SEO
// src/lib/seo.ts
import type { Metadata } from 'next'

export function generateBlogPostMetadata({
  title,
  description,
  image,
  publishedAt,
  author,
  tags,
}: {
  title: string
  description: string
  image?: string
  publishedAt?: Date
  author?: string
  tags?: string[]
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gabizimmer.com'
  
  return {
    title: `${title} | Gabi Zimmer`,
    description,
    keywords: tags?.join(', '),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
      publishedTime: publishedAt?.toISOString(),
      authors: author ? [author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    }
  }
}

// 3. Algoritmo Posts Relacionados
// src/lib/related-posts.ts
export async function getRelatedPosts(currentPost: any, limit = 6) {
  const { getAllPosts } = await import('@/services/post-service')
  
  const allPosts = await getAllPosts({ 
    status: 'PUBLISHED',
    language: currentPost.language 
  })
  
  return allPosts
    .filter(post => post.id !== currentPost.id)
    .filter(post => post.categoryId === currentPost.categoryId)
    .slice(0, limit)
}
```

### Task List (Orden de Implementación)
```yaml
Task 1: Service Layer de Comentarios
CREATE src/services/comment-service.ts:
  - PATTERN: Copiar estructura de post-service.ts
  - VALIDATIONS: Schemas Zod al inicio
  - FUNCTIONS: create, getApproved, moderate
  - INCLUDE: Validación anti-spam básica
  - ONLY LAYER: Que importa prisma

Task 2: Utilidades SEO y Relacionados
CREATE src/lib/seo.ts:
  - generateBlogPostMetadata función
  - JSON-LD structured data helper
CREATE src/lib/related-posts.ts:
  - getRelatedPosts con filtro por categoría
  - Considerar tags si existen

Task 3: Layout del Blog
CREATE src/app/blog/layout.tsx:
  - Header con navegación
  - Footer si necesario
  - Container con max-width

Task 4: Página Índice del Blog (RSC)
CREATE src/app/blog/page.tsx:
  - RSC con Suspense boundary
  - searchParams para paginación y filtros
  - Fetch posts con status PUBLISHED
  - Metadata estático

Task 5: Grid de Posts (RSC)
CREATE src/app/blog/blog-grid.tsx:
  - Async server component
  - Fetch posts del service
  - Grid responsive 1-2-3 columnas
  - Usar PostCard component

Task 6: PostCard Component (3 variantes)
CREATE src/app/blog/components/post-card.tsx:
  - VARIANTS: featured, default, compact
  - USE: Card de shadcn/ui
  - PROPS: Post data
  - Link a post individual
  - CVA para variantes

Task 7: Filtros del Blog (Cliente)
CREATE src/app/blog/blog-filters.tsx:
  - 'use client' al inicio
  - Tabs de shadcn/ui para categorías
  - Search input
  - Update URL params

Task 8: Paginación
CREATE src/app/blog/blog-pagination.tsx:
  - Server component
  - Links con searchParams
  - Mantener filtros activos

Task 9: Rutas Dinámicas Anidadas
CREATE src/app/blog/[categorySlug]/[postSlug]/page.tsx:
  - generateStaticParams para ISR
  - generateMetadata dinámico
  - Fetch post por slugs
  - notFound() si no existe

Task 10: Contenido del Post (RSC)
CREATE src/app/blog/[categorySlug]/[postSlug]/post-page-content.tsx:
  - Server component
  - Renderizar Novel content
  - PostHeader con metadata
  - AuthorInfo component
  - ShareButtons
  - RelatedPosts al final

Task 11: PostContent Reutilizable
CREATE src/app/blog/components/post-content.tsx:
  - SIN sistema de comentarios
  - Normalizar Novel JSON
  - Estilos prose de Tailwind
  - Imágenes optimizadas

Task 12: Sistema de Comentarios
CREATE src/app/blog/[categorySlug]/[postSlug]/comments-section.tsx:
  - 'use client'
  - Fetch comentarios aprobados
  - Formulario para nuevos
  - Server action para crear
  - Toast de confirmación

Task 13: Componentes Auxiliares
CREATE src/app/blog/components/post-header.tsx:
  - Título, fecha, categoría, autor
CREATE src/app/blog/components/author-info.tsx:
  - Avatar y nombre del autor
CREATE src/app/blog/components/share-buttons.tsx:
  - Twitter, Facebook, LinkedIn, copiar link
CREATE src/app/blog/components/related-posts.tsx:
  - Grid de posts relacionados

Task 14: Server Actions del Blog
CREATE src/app/blog/[categorySlug]/[postSlug]/actions.ts:
  - 'use server'
  - createCommentAction
  - Validación y moderación

Task 15: Sitemap Dinámico
CREATE src/app/blog/sitemap.ts:
  - Export default async function
  - Fetch todos los posts
  - Generar URLs completas
  - Incluir lastModified

Task 16: Página de Categoría
CREATE src/app/blog/[categorySlug]/page.tsx:
  - Lista posts de categoría
  - Metadata de categoría
  - Reutilizar BlogGrid
```

### Per-Task Pseudocode
```typescript
// Task 4: Página Índice del Blog
// src/app/blog/page.tsx
import { Suspense } from 'react'
import { BlogGrid } from './blog-grid'
import { BlogFilters } from './blog-filters'
import { BlogPagination } from './blog-pagination'
import { Skeleton } from '@/components/ui/skeleton'

interface BlogPageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    search?: string
  }>
}

export const metadata = {
  title: 'Blog | Gabi Zimmer',
  description: 'Artículos sobre vino, gastronomía, viajes y cultura por Gabi Zimmer',
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const category = params.category
  const search = params.search

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-jost">
          Blog de Gabi Zimmer
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explorando el mundo del vino, la gastronomía y la cultura
        </p>
      </div>

      <BlogFilters 
        currentCategory={category}
        currentSearch={search}
      />

      <Suspense fallback={<BlogGridSkeleton />}>
        <BlogGrid 
          page={page}
          category={category}
          search={search}
        />
      </Suspense>

      <BlogPagination 
        currentPage={page}
        category={category}
        search={search}
      />
    </div>
  )
}

function BlogGridSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-96" />
      ))}
    </div>
  )
}

// Task 6: PostCard Component
// src/app/blog/components/post-card.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Calendar } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const postCardVariants = cva(
  'group overflow-hidden transition-all hover:shadow-lg',
  {
    variants: {
      variant: {
        featured: 'md:col-span-2 lg:col-span-3',
        default: '',
        compact: 'h-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface PostCardProps extends VariantProps<typeof postCardVariants> {
  post: {
    id: string
    title: string
    slug: string
    excerpt?: string
    featuredImageUrl?: string
    category: {
      name: string
      slug: string
    }
    author: {
      name: string
      image?: string
    }
    readingTime?: number
    publishedAt?: Date
  }
  className?: string
}

export function PostCard({ post, variant, className }: PostCardProps) {
  const href = `/blog/${post.category.slug}/${post.slug}`

  return (
    <Card className={cn(postCardVariants({ variant }), className)}>
      <Link href={href} className="block">
        {post.featuredImageUrl && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-wine-primary text-white">
                {post.category.name}
              </Badge>
            </div>
          </div>
        )}

        <CardHeader>
          <h2 className={cn(
            'font-jost font-bold line-clamp-2 group-hover:text-wine-primary transition-colors',
            variant === 'featured' ? 'text-2xl md:text-3xl' : 'text-xl'
          )}>
            {post.title}
          </h2>
        </CardHeader>

        {post.excerpt && variant !== 'compact' && (
          <CardContent>
            <p className="text-muted-foreground line-clamp-3 font-noto-serif">
              {post.excerpt}
            </p>
          </CardContent>
        )}

        <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.image} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{post.author.name}</span>
          </div>

          <div className="flex items-center gap-4">
            {post.readingTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{post.readingTime} min</span>
              </div>
            )}
            {post.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(post.publishedAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
            )}
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}

// Task 9: Página del Post Individual
// src/app/blog/[categorySlug]/[postSlug]/page.tsx
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPostBySlugAndLanguage, getAllPosts } from '@/services/post-service'
import { PostPageContent } from './post-page-content'
import { CommentsSection } from './comments-section'
import { generateBlogPostMetadata } from '@/lib/seo'
import { Skeleton } from '@/components/ui/skeleton'

interface PostPageProps {
  params: Promise<{
    categorySlug: string
    postSlug: string
  }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts({ status: 'PUBLISHED' })
  
  return posts.map((post) => ({
    categorySlug: post.category.slug,
    postSlug: post.slug,
  }))
}

export const revalidate = 3600 // ISR: 1 hora

export async function generateMetadata({ params }: PostPageProps) {
  const { postSlug } = await params
  const post = await getPostBySlugAndLanguage(postSlug, 'ES')
  
  if (!post) {
    return { title: 'Post no encontrado' }
  }

  return generateBlogPostMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || '',
    image: post.featuredImageUrl,
    publishedAt: post.publishedAt,
    author: post.author.name,
    tags: post.tags?.map(t => t.tag.name),
  })
}

export default async function PostPage({ params }: PostPageProps) {
  const { postSlug } = await params
  const post = await getPostBySlugAndLanguage(postSlug, 'ES')
  
  if (!post || post.status !== 'PUBLISHED') {
    notFound()
  }

  return (
    <article className="min-h-screen">
      <Suspense fallback={<PostSkeleton />}>
        <PostPageContent post={post} />
      </Suspense>
      
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsSection postId={post.id} />
      </Suspense>
    </article>
  )
}

function PostSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-96 w-full" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  )
}

function CommentsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}
```

### Integration Points
```yaml
DATABASE:
  - migration: pnpm prisma db push (modelos ya existen)
  - validation: pnpm prisma studio
  
AUTH:
  - rutas públicas: blog no requiere auth
  - comentarios: pueden ser anónimos con email
  
UI:
  - components: usar 22 shadcn/ui existentes
  - dark mode: variables CSS ya configuradas
  - responsive: clases Tailwind mobile-first

SEO:
  - metadata: generateMetadata dinámico
  - sitemap: /blog/sitemap.ts automático
  - structured data: JSON-LD en PostPageContent
  
PERFORMANCE:
  - ISR: revalidate = 3600 (1 hora)
  - images: next/image con sizes y priority
  - lazy loading: Suspense boundaries
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar PRIMERO - corregir errores antes de continuar
pnpm run lint          # ESLint
pnpm run typecheck     # TypeScript
# Expected: 0 errores
```

### Level 2: Database
```bash
# Los modelos ya existen, verificar
pnpm prisma validate
# Expected: Schema válido
```

### Level 3: Dev Testing
```bash
# Dev server
pnpm run dev

# Test rutas principales
curl http://localhost:3000/blog
# Expected: HTML con grid de posts

# Test post individual (usar slug real)
curl http://localhost:3000/blog/vinos/primer-post
# Expected: HTML con contenido del post

# Test paginación
curl "http://localhost:3000/blog?page=2"
# Expected: Segunda página de posts

# Test filtro categoría
curl "http://localhost:3000/blog?category=vinos"
# Expected: Solo posts de vinos
```

### Level 4: Build Production
```bash
pnpm run build
# Expected: Build exitoso, páginas estáticas generadas

# Verificar output
# - Generating static pages (x/y)
# - Posts populares pre-renderizados

pnpm run start
# Test en http://localhost:3000/blog
```

### Level 5: SEO Validation
```bash
# Verificar sitemap
curl http://localhost:3000/blog/sitemap.xml
# Expected: XML con todas las URLs de posts

# Verificar metadata (usar DevTools)
# - Open Graph tags presentes
# - Twitter Card configurado
# - Canonical URL correcta
```

## Final Checklist

### Arquitectura en Capas (docs/architecture.md)
- [ ] Solo services/ importa @/lib/prisma
- [ ] comment-service.ts creado con validaciones Zod
- [ ] Server Actions para comentarios
- [ ] RSC para data fetching, Client para interactividad
- [ ] Co-ubicación: todos los componentes del blog juntos

### Calidad de Código
- [ ] Todos los tests pasan
- [ ] Sin errores de lint/types
- [ ] Build de producción exitoso
- [ ] Posts con status PUBLISHED visibles
- [ ] Comentarios con moderación funcionando
- [ ] Paginación manteniendo filtros

### Diseño y UX
- [ ] Diseño matches con referencia blog-post-reference-1.png
- [ ] Sistema de diseño Gabi Zimmer aplicado
- [ ] PostCard con 3 variantes funcionando
- [ ] PostContent reutilizable sin comentarios
- [ ] Responsive mobile-first
- [ ] Dark mode completamente funcional
- [ ] Loading states con Skeleton

### SEO y Performance
- [ ] Metadata dinámicos en cada post
- [ ] Sitemap generado automáticamente
- [ ] ISR configurado (revalidate: 3600)
- [ ] Imágenes optimizadas con next/image
- [ ] Posts relacionados mostrándose
- [ ] generateStaticParams para posts populares

### Componentes Implementados
- [ ] PostCard (featured, default, compact)
- [ ] PostContent (reutilizable)
- [ ] PostHeader con metadata
- [ ] AuthorInfo con avatar
- [ ] ShareButtons funcionales
- [ ] RelatedPosts automáticos
- [ ] CommentsSection con formulario
- [ ] BlogFilters con categorías
- [ ] BlogPagination server-side

## Anti-Patterns to Avoid

### Arquitectura en Capas
- ❌ NO importar prisma fuera de services/
- ❌ NO crear API routes para comentarios (usar Server Actions)
- ❌ NO mezclar lógica de negocio en componentes
- ❌ NO olvidar validaciones Zod en comment-service

### Patrones del Proyecto
- ❌ NO usar 'use client' en pages principales
- ❌ NO fetchear datos en componentes cliente
- ❌ NO crear nuevos patrones si existen establecidos
- ❌ NO exponer posts con status DRAFT o ARCHIVED
- ❌ NO permitir comentarios sin moderación

### Performance
- ❌ NO olvidar Suspense boundaries
- ❌ NO cargar todos los posts sin paginación
- ❌ NO usar imágenes sin optimizar
- ❌ NO bloquear renderizado con datos no críticos
- ❌ NO generar todas las páginas en build time

### SEO
- ❌ NO hardcodear metadata
- ❌ NO olvidar canonical URLs
- ❌ NO omitir alt text en imágenes
- ❌ NO ignorar structured data
- ❌ NO dejar páginas sin metadata

## Score de Confianza

**9/10** - Este PRP tiene toda la información necesaria para implementar exitosamente el blog público:

- ✅ Contexto exhaustivo con referencias a todos los archivos necesarios
- ✅ Servicios backend ya implementados (post-service, category-service)
- ✅ Patrones arquitectónicos claros y establecidos
- ✅ Sistema de diseño documentado con componentes UI disponibles
- ✅ Pseudocódigo detallado para tareas críticas
- ✅ Validaciones ejecutables paso a paso
- ✅ Consideraciones de performance y SEO incluidas
- ✅ Anti-patterns claramente identificados

El único punto pendiente (-1) es que el desarrollador necesitará crear algunos slugs de prueba en la BD para testing completo, pero esto es menor y está cubierto con el seed existente.