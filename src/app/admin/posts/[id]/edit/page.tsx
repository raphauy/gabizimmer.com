import { notFound } from "next/navigation"
import { PostForm } from "../../post-form"
import { getPostById } from "@/services/post-service"
import { getAllCategories } from "@/services/category-service"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user) {
    notFound()
  }

  const [post, categories] = await Promise.all([
    getPostById(id),
    getAllCategories()
  ])

  if (!post) {
    notFound()
  }

  // Verificar permisos: superadmin puede editar todo, colaboradores solo sus posts
  if (session.user.role === "colaborador" && post.authorId !== session.user.id) {
    notFound()
  }

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
        <span className="text-foreground font-medium">Editar Post</span>
      </div>


      <PostForm post={post} categories={categories} isEdit />
    </div>
  )
}