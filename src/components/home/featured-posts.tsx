import { getAllPosts } from '@/services/post-service'
import { PostCard } from '@/app/blog/components/post-card'

export async function FeaturedPosts() {
  const posts = await getAllPosts({
    status: 'PUBLISHED',
    language: 'ES'
  })

  const featuredPosts = posts.slice(0, 6)

  if (featuredPosts.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-wine-muted/10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center font-jost text-gabi-dark-green">
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