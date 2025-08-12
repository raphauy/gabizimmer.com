import { Suspense } from 'react'
import { BlogGrid } from '../blog-grid'
import { BlogPagination } from '../blog-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { generateBlogIndexMetadata } from '@/lib/seo'

interface BlogPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
  }>
}

export const metadata = generateBlogIndexMetadata()

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const search = params.search

  return (
    <>
      {/* Grid de Posts con Suspense */}
      <Suspense fallback={<BlogGridSkeleton />}>
        <BlogGrid 
          page={page}
          search={search}
        />
      </Suspense>

      {/* Paginación */}
      <BlogPagination 
        currentPage={page}
        search={search}
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