import { prisma } from "@/lib/prisma"

export interface AdminDashboardMetrics {
  totalUsers: number
  colaboradores: number
  activeUsers: number
  superadmins: number
}

/**
 * Obtiene las métricas para el dashboard de admin simplificado
 */
export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const [
    totalUsers,
    colaboradores,
    activeUsers,
    superadmins
  ] = await Promise.all([
    // Total de usuarios
    prisma.user.count(),
    
    // Colaboradores
    prisma.user.count({
      where: {
        role: "colaborador"
      }
    }),
    
    // Usuarios activos (que han completado onboarding)
    prisma.user.count({
      where: {
        isOnboarded: true
      }
    }),
    
    // Superadmins
    prisma.user.count({
      where: {
        role: "superadmin"
      }
    })
  ])

  return {
    totalUsers,
    colaboradores,
    activeUsers,
    superadmins
  }
}