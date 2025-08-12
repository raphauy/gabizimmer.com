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

// Generar rutas estáticas para ISR
export async function generateStaticParams() {
  const posts = await getAllPosts({ status: 'PUBLISHED' })
  
  return posts.map((post) => ({
    categorySlug: post.category.slug,
    postSlug: post.slug,
  }))
}

// Revalidar cada hora
export const revalidate = 3600

// Generar metadata dinámicos
export async function generateMetadata({ params }: PostPageProps) {
  const { postSlug, categorySlug } = await params
  const post = await getPostBySlugAndLanguage(postSlug, 'ES')
  
  if (!post || post.status !== 'PUBLISHED') {
    return { title: 'Post no encontrado | Gabi Zimmer' }
  }

  return generateBlogPostMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || '',
    image: post.featuredImageUrl,
    publishedAt: post.publishedAt,
    author: post.author.name,
    slug: postSlug,
    categorySlug,
  })
}

export default async function PostPage({ params }: PostPageProps) {
  const { postSlug, categorySlug } = await params
  const post = await getPostBySlugAndLanguage(postSlug, 'ES')
  
  // Verificar que el post existe y está publicado
  if (!post || post.status !== 'PUBLISHED') {
    notFound()
  }
  
  // Verificar que la categoría coincide (para evitar URLs incorrectas)
  if (post.category.slug !== categorySlug) {
    notFound()
  }

  return (
    <article className="min-h-screen">
      {/* Contenido del Post */}
      <Suspense fallback={<PostSkeleton />}>
        <PostPageContent post={post} />
      </Suspense>
      
      {/* Sección de Comentarios */}
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsSection postId={post.id} />
      </Suspense>
    </article>
  )
}

function PostSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Imagen hero skeleton */}
      <Skeleton className="h-96 w-full rounded-lg" />
      
      {/* Título y metadata skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      
      {/* Contenido skeleton */}
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
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
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}