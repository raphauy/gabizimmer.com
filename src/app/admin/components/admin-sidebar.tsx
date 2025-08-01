import { getAllUsers, getColaboradores } from "@/services/user-service"
import { AdminSidebarClient } from "./admin-sidebar-client"

interface AdminSidebarProps {
  children: React.ReactNode
}

export async function AdminSidebar({ children }: AdminSidebarProps) {
  const [users, colaboradores] = await Promise.all([
    getAllUsers(),
    getColaboradores()
  ])
  
  const userCount = users.length
  const colaboradorCount = colaboradores.length

  return (
    <AdminSidebarClient 
      userCount={userCount} 
      colaboradorCount={colaboradorCount}
    >
      {children}
    </AdminSidebarClient>
  )
}