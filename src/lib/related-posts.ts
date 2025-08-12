import { type PostWithRelations } from '@/services/post-service'

/**
 * Algoritmo para obtener posts relacionados
 * Prioriza: 1) misma categoría, 2) tags compartidos, 3) mismo autor
 */
export async function getRelatedPosts(
  currentPost: PostWithRelations & { tags?: Array<{ tag: { id: string; name: string } }> },
  limit: number = 6
): Promise<PostWithRelations[]> {
  // Importación dinámica para evitar dependencias circulares
  const { getAllPosts } = await import('@/services/post-service')
  
  // Obtener todos los posts publicados del mismo idioma
  const allPosts = await getAllPosts({ 
    status: 'PUBLISHED',
    language: currentPost.language 
  })
  
  // Filtrar el post actual
  const otherPosts = allPosts.filter(post => post.id !== currentPost.id)
  
  // Sistema de puntuación para relevancia
  const scoredPosts = otherPosts.map(post => {
    let score = 0
    
    // Misma categoría: +3 puntos
    if (post.categoryId === currentPost.categoryId) {
      score += 3
    }
    
    // Mismo autor: +1 punto
    if (post.authorId === currentPost.authorId) {
      score += 1
    }
    
    // Posts más recientes tienen ligera preferencia
    const daysDifference = Math.abs(
      (new Date(post.publishedAt || post.createdAt).getTime() - 
       new Date(currentPost.publishedAt || currentPost.createdAt).getTime()) / 
      (1000 * 60 * 60 * 24)
    )
    
    // Bonus por cercanía temporal (máximo 0.5 puntos)
    if (daysDifference < 30) {
      score += 0.5
    } else if (daysDifference < 90) {
      score += 0.3
    } else if (daysDifference < 180) {
      score += 0.1
    }
    
    return { post, score }
  })
  
  // Ordenar por puntuación y devolver los más relevantes
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post)
}

/**
 * Obtiene posts populares (basado en comentarios)
 */
export async function getPopularPosts(
  limit: number = 5,
  excludeId?: string
): Promise<PostWithRelations[]> {
  const { getAllPosts } = await import('@/services/post-service')
  
  const posts = await getAllPosts({ status: 'PUBLISHED' })
  
  // Filtrar post actual si se proporciona
  const filteredPosts = excludeId 
    ? posts.filter(post => post.id !== excludeId)
    : posts
  
  // Ordenar por número de comentarios y fecha de publicación
  return filteredPosts
    .sort((a, b) => {
      // Primero por número de comentarios
      const commentsDiff = (b._count?.comments || 0) - (a._count?.comments || 0)
      if (commentsDiff !== 0) return commentsDiff
      
      // Luego por fecha de publicación (más recientes primero)
      const dateA = new Date(a.publishedAt || a.createdAt).getTime()
      const dateB = new Date(b.publishedAt || b.createdAt).getTime()
      return dateB - dateA
    })
    .slice(0, limit)
}

/**
 * Obtiene posts recientes
 */
export async function getRecentPosts(
  limit: number = 5,
  excludeId?: string
): Promise<PostWithRelations[]> {
  const { getAllPosts } = await import('@/services/post-service')
  
  const posts = await getAllPosts({ status: 'PUBLISHED' })
  
  // Filtrar post actual si se proporciona
  const filteredPosts = excludeId 
    ? posts.filter(post => post.id !== excludeId)
    : posts
  
  // Ya vienen ordenados por fecha desde el servicio, solo limitar
  return filteredPosts.slice(0, limit)
}

/**
 * Obtiene posts de la misma categoría
 */
export async function getPostsByCategory(
  categoryId: string,
  limit: number = 6,
  excludeId?: string
): Promise<PostWithRelations[]> {
  const { getAllPosts } = await import('@/services/post-service')
  
  const posts = await getAllPosts({ 
    status: 'PUBLISHED',
    categoryId 
  })
  
  // Filtrar post actual si se proporciona
  const filteredPosts = excludeId 
    ? posts.filter(post => post.id !== excludeId)
    : posts
  
  return filteredPosts.slice(0, limit)
}

/**
 * Obtiene posts del mismo autor
 */
export async function getPostsByAuthor(
  authorId: string,
  limit: number = 6,
  excludeId?: string
): Promise<PostWithRelations[]> {
  const { getAllPosts } = await import('@/services/post-service')
  
  const posts = await getAllPosts({ 
    status: 'PUBLISHED',
    authorId 
  })
  
  // Filtrar post actual si se proporciona
  const filteredPosts = excludeId 
    ? posts.filter(post => post.id !== excludeId)
    : posts
  
  return filteredPosts.slice(0, limit)
}