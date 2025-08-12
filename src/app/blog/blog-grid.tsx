import { getAllPosts } from '@/services/post-service'
import { getCategoryBySlug } from '@/services/category-service'
import { PostCard } from './components/post-card'

interface BlogGridProps {
  page: number
  category?: string
  search?: string
}

const POSTS_PER_PAGE = 9

export async function BlogGrid({ page, category, search }: BlogGridProps) {
  // Obtener categoría si se especifica
  let categoryId: string | undefined
  if (category) {
    const categoryData = await getCategoryBySlug(category)
    if (categoryData) {
      categoryId = categoryData.id
    }
  }
  
  // Obtener todos los posts publicados
  const allPosts = await getAllPosts({ 
    status: 'PUBLISHED',
    categoryId,
    language: 'ES' // Por ahora solo español
  })
  
  // Filtrar por búsqueda si se especifica
  let filteredPosts = allPosts
  if (search) {
    const searchLower = search.toLowerCase()
    filteredPosts = allPosts.filter(post => 
      post.title.toLowerCase().includes(searchLower) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchLower))
    )
  }
  
  // Calcular paginación
  const totalPosts = filteredPosts.length
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)
  const startIndex = (page - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex)
  
  // Si no hay posts
  if (paginatedPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          {search 
            ? `No se encontraron artículos con "${search}"`
            : category
            ? `No hay artículos en esta categoría aún`
            : 'No hay artículos publicados aún'}
        </p>
      </div>
    )
  }
  
  // Determinar cuál es el primer post (para destacarlo)
  const shouldShowFeatured = page === 1 && !search && !category
  const featuredPost = shouldShowFeatured ? paginatedPosts[0] : null
  const regularPosts = shouldShowFeatured ? paginatedPosts.slice(1) : paginatedPosts
  
  return (
    <div className="my-8">
      {/* Post destacado (solo en primera página sin filtros) */}
      {featuredPost && (
        <div className="mb-12">
          <PostCard 
            post={featuredPost} 
            variant="featured"
          />
        </div>
      )}
      
      {/* Grid de posts regulares */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {regularPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post}
            variant="default"
          />
        ))}
      </div>
      
      {/* Información de paginación para el componente padre */}
      <div className="hidden">
        <span data-total-pages={totalPages} />
        <span data-total-posts={totalPosts} />
      </div>
    </div>
  )
}