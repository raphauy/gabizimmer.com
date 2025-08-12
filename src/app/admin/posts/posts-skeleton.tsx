import { Skeleton } from "@/components/ui/skeleton"

export function PostsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Skeleton para la barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[200px]" />
          <Skeleton className="h-9 w-[150px]" />
          <Skeleton className="h-9 w-[150px]" />
        </div>
        <Skeleton className="h-9 w-[200px]" />
      </div>

      {/* Skeleton para la tabla */}
      <div className="rounded-lg border">
        {/* Header */}
        <div className="border-b bg-muted/50 px-6 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        {/* Filas */}
        <div className="divide-y">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4 max-w-md" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-1" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer con paginación */}
        <div className="border-t px-6 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}