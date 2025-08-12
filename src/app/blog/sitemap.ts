import { MetadataRoute } from 'next'
import { getAllPosts } from '@/services/post-service'
import { getAllCategories } from '@/services/category-service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gabizimmer.com'
  
  // Obtener todos los posts publicados
  const posts = await getAllPosts({ status: 'PUBLISHED' })
  
  // Obtener todas las categorías
  const categories = await getAllCategories()
  
  // URLs de posts individuales
  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.category.slug}/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  
  // URLs de categorías
  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/blog/categoria/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))
  
  // Página principal del blog
  const blogMainUrl = {
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }
  
  return [blogMainUrl, ...categoryUrls, ...postUrls]
}