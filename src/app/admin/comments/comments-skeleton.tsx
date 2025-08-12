import { Skeleton } from "@/components/ui/skeleton"

export function CommentsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton para las tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="rounded-lg border p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton para la barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[150px]" />
        </div>
        <Skeleton className="h-9 w-full sm:w-64" />
      </div>

      {/* Skeleton para el contador */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Skeleton para la tabla */}
      <div className="rounded-lg border">
        {/* Header */}
        <div className="border-b bg-muted/50 px-6 py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        
        {/* Filas */}
        <div className="divide-y">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex-1 max-w-md">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}