import { getAllUsers, getColaboradores } from "@/services/user-service"
import { getAllCategories } from "@/services/category-service"
import { getPostsCount } from "@/services/post-service"
import { getCommentsCount } from "@/services/comment-service"
import { AdminSidebarClient } from "./admin-sidebar-client"

interface AdminSidebarProps {
  children: React.ReactNode
}

export async function AdminSidebar({ children }: AdminSidebarProps) {
  const [users, colaboradores, categories, postsCount, commentsCount] = await Promise.all([
    getAllUsers(),
    getColaboradores(),
    getAllCategories(),
    getPostsCount(),
    getCommentsCount(),
  ])
  
  const userCount = users.length
  const colaboradorCount = colaboradores.length
  const categoriesCount = categories.length

  return (
    <AdminSidebarClient 
      userCount={userCount} 
      colaboradorCount={colaboradorCount}
      categoriesCount={categoriesCount}
      postsCount={postsCount}
      commentsCount={commentsCount}
    >
      {children}
    </AdminSidebarClient>
  )
}