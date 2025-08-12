import { NextResponse } from 'next/server'
import { getCategoriesWithPostCount } from '@/services/category-service'

export async function GET() {
  try {
    const categoriesWithCount = await getCategoriesWithPostCount()
    // Filtrar solo categorías con posts (ya vienen ordenadas de Prisma)
    const categoriesWithPosts = categoriesWithCount
      .filter(cat => cat._count.posts > 0)
    
    return NextResponse.json(categoriesWithPosts)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}