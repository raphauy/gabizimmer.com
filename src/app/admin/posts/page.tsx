import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PostsList } from "./posts-list"
import { PostsSkeleton } from "./posts-skeleton"

export default function PostsPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Posts del Blog</h2>
          <p className="text-sm text-muted-foreground">
            Administra el contenido editorial sobre vinos y gastronomía
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Post
          </Link>
        </Button>
      </div>

      <Suspense fallback={<PostsSkeleton />}>
        <PostsList />
      </Suspense>
    </div>
  )
}