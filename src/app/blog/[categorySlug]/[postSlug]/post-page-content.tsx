import Image from 'next/image'
import { PostContent } from '../../components/post-content'
import { PostHeader } from '../../components/post-header'
import { ShareButtons } from '../../components/share-buttons'
import { RelatedPosts } from '../../components/related-posts'
import { generateArticleJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo'
import type { PostWithRelations } from '@/services/post-service'

interface PostPageContentProps {
  post: PostWithRelations
}

export async function PostPageContent({ post }: PostPageContentProps) {
  // Generar JSON-LD para SEO
  const articleJsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.excerpt || '',
    image: post.featuredImageUrl,
    publishedAt: post.publishedAt,
    modifiedAt: post.updatedAt,
    author: post.author.name,
    slug: post.slug,
    categorySlug: post.category.slug,
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Inicio', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.category.name, url: `/blog?category=${post.category.slug}` },
    { name: post.title },
  ])

  return (
    <>
      {/* JSON-LD Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <>
        {/* Header del Post con información centrada */}
        <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
          <PostHeader post={post} />
        </div>

        {/* Imagen Hero a todo el ancho */}
        {post.featuredImageUrl && (
          <div className="relative w-full aspect-[21/9] mb-12">
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        )}

        {/* Contenido del Post */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <PostContent content={post.content} />
          </div>

          {/* Botones de Compartir */}
          <div className="my-12 py-8 border-y">
            <ShareButtons 
              url={`/blog/${post.category.slug}/${post.slug}`}
              title={post.title}
              description={post.excerpt || ''}
            />
          </div>

          {/* Posts Relacionados */}
          <div className="mt-12 mb-16">
            <RelatedPosts currentPost={post} />
          </div>
        </div>
      </>
    </>
  )
}