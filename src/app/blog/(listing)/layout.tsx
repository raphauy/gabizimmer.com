import { Suspense } from 'react'
import { BlogFilters } from '../blog-filters'
import { Skeleton } from '@/components/ui/skeleton'

export default function ListingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Este layout se preserva entre navegaciones de /blog y /blog/[categorySlug]
  // La barra de categorías no se recargará al navegar entre categorías
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
      {/* Filtros que se mantienen entre navegaciones */}
      <Suspense fallback={<BlogFiltersSkeleton />}>
        <BlogFilters />
      </Suspense>
      
      {/* Contenido específico de cada página */}
      {children}
    </div>
  )
}

function BlogFiltersSkeleton() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b">
      {/* Skeleton para selector de categorías */}
      <div className="flex items-center gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>
      
      {/* Skeleton para barra de búsqueda */}
      <div className="w-full md:w-auto">
        <Skeleton className="h-9 w-full md:w-[200px] rounded-full" />
      </div>
    </div>
  )
}