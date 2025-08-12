import { getRelatedPosts } from '@/lib/related-posts'
import { PostCard } from './post-card'
import type { PostWithRelations } from '@/services/post-service'

interface RelatedPostsProps {
  currentPost: PostWithRelations
  limit?: number
}

export async function RelatedPosts({ currentPost, limit = 3 }: RelatedPostsProps) {
  const relatedPosts = await getRelatedPosts(currentPost, limit)
  
  if (relatedPosts.length === 0) {
    return null
  }
  
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 font-jost">Artículos Relacionados</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            variant="compact"
          />
        ))}
      </div>
    </section>
  )
}