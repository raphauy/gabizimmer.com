import { Skeleton } from '@/components/ui/skeleton'

export function PostsSkeleton() {
  return (
    <section className="py-12 bg-wine-muted/10">
      <div className="container mx-auto px-4">
        <Skeleton className="h-9 w-64 mx-auto mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card text-card-foreground rounded-lg border shadow-sm overflow-hidden"
            >
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}