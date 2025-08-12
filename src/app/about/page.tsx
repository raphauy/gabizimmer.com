import { Metadata } from 'next'
import { getPostBySlugAndLanguage } from '@/services/post-service'
import { PostContent } from '../blog/components/post-content'

export async function generateMetadata(): Promise<Metadata> {
  const post = await getPostBySlugAndLanguage('sobre-gabi', 'ES')
  
  if (!post) {
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
  
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Sobre Gabi Zimmer</h1>
          <p className="text-muted-foreground">
            La información estará aquí en breve.
          </p>
        </div>
      </div>
    )
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