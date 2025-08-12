import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { BlogGrid } from '../../blog-grid'
import { BlogPagination } from '../../blog-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { getCategoryBySlug } from '@/services/category-service'
import { generateCategoryMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string
  }>
  searchParams: Promise<{
    page?: string
    search?: string
  }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params
  const category = await getCategoryBySlug(categorySlug)
  
  if (!category) {
    return {}
  }

  return generateCategoryMetadata({
    name: category.name,
    slug: category.slug,
    description: category.description || `Artículos sobre ${category.name} en el blog de Gabi Zimmer`
  })
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categorySlug } = await params
  const search = await searchParams
  const page = parseInt(search.page ?? '1')
  const searchQuery = search.search

  // Verificar que la categoría existe
  const category = await getCategoryBySlug(categorySlug)
  if (!category) {
    notFound()
  }

  return (
    <>
      {/* Grid de Posts con Suspense */}
      <Suspense fallback={<BlogGridSkeleton />}>
        <BlogGrid 
          page={page}
          category={categorySlug}
          search={searchQuery}
        />
      </Suspense>

      {/* Paginación */}
      <BlogPagination 
        currentPage={page}
        category={categorySlug}
        search={searchQuery}
        basePath={`/blog/${categorySlug}`}
      />
    </>
  )
}

function BlogGridSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 my-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}