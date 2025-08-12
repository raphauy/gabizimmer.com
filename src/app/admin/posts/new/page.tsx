import { PostForm } from "../post-form"
import { getAllCategories } from "@/services/category-service"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function NewPostPage() {
  const categories = await getAllCategories()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/admin/posts" className="hover:text-foreground transition-colors">
          Posts
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground font-medium">Nuevo Post</span>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Crear Nuevo Post</h2>
        <p className="text-muted-foreground">
          Comparte contenido sobre vinos y gastronomía con tu audiencia
        </p>
      </div>

      <PostForm categories={categories} />
    </div>
  )
}