import { Suspense } from "react"
import { MessageSquare } from "lucide-react"
import { CommentsList } from "./comments-list"
import { CommentsSkeleton } from "./comments-skeleton"
import { CommentsStats } from "./comments-stats"

export default async function CommentsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Comentarios</h1>
      </div>
      
      <Suspense fallback={<div className="text-muted-foreground">Cargando estadísticas...</div>}>
        <CommentsStats />
      </Suspense>
      
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsList />
      </Suspense>
    </div>
  )
}