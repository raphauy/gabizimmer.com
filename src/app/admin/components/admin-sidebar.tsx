import { getAllUsers, getColaboradores } from "@/services/user-service"
import { getAllCategories } from "@/services/category-service"
import { getPostsCount } from "@/services/post-service"
import { getPendingComments } from "@/services/comment-service"
import { AdminSidebarClient } from "./admin-sidebar-client"

interface AdminSidebarProps {
  children: React.ReactNode
}

export async function AdminSidebar({ children }: AdminSidebarProps) {
  const [users, colaboradores, categories, postsCount, pendingComments] = await Promise.all([
    getAllUsers(),
    getColaboradores(),
    getAllCategories(),
    getPostsCount(),
    getPendingComments(),
  ])
  
  const userCount = users.length
  const colaboradorCount = colaboradores.length
  const categoriesCount = categories.length
  const pendingCommentsCount = pendingComments.length

  return (
    <AdminSidebarClient 
      userCount={userCount} 
      colaboradorCount={colaboradorCount}
      categoriesCount={categoriesCount}
      postsCount={postsCount}
      pendingCommentsCount={pendingCommentsCount}
    >
      {children}
    </AdminSidebarClient>
  )
}