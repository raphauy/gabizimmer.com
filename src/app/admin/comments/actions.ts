"use server"

import { auth } from "@/lib/auth"
import { 
  getAllComments, 
  moderateCommentManually, 
  deleteComment,
  getCommentsStats,
  getPendingComments,
  type CommentWithPost
} from "@/services/comment-service"
import { revalidatePath } from "next/cache"
import { type CommentStatus } from "@prisma/client"

export async function getCommentsAction(filters?: {
  status?: CommentStatus
  postId?: string
  authorEmail?: string
}) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "superadmin" && session.user.role !== "colaborador")) {
      throw new Error("No autorizado")
    }
    
    const comments = await getAllComments(filters)
    
    // Obtener información del post para cada comentario
    const { prisma } = await import("@/lib/prisma")
    const commentsWithPost = await Promise.all(
      comments.map(async (comment) => {
        const post = await prisma.post.findUnique({
          where: { id: comment.postId },
          select: { 
            title: true, 
            slug: true,
            category: {
              select: {
                slug: true
              }
            }
          }
        })
        return {
          ...comment,
          post: post || { title: "Post eliminado", slug: "" }
        } as CommentWithPost
      })
    )
    
    return { 
      success: true, 
      comments: commentsWithPost 
    }
  } catch (error) {
    console.error("Error obteniendo comentarios:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al obtener comentarios",
      comments: []
    }
  }
}

export async function getCommentsStatsAction() {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "superadmin" && session.user.role !== "colaborador")) {
      throw new Error("No autorizado")
    }
    
    const stats = await getCommentsStats()
    
    return { 
      success: true, 
      stats 
    }
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al obtener estadísticas",
      stats: null
    }
  }
}

export async function approveCommentAction(id: string) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "superadmin" && session.user.role !== "colaborador")) {
      throw new Error("No autorizado para moderar comentarios")
    }
    
    await moderateCommentManually({ 
      id, 
      status: "APPROVED",
      moderatorEmail: session.user.email || undefined
    })
    
    revalidatePath("/admin/comments")
    revalidatePath("/admin") // Dashboard stats
    revalidatePath("/blog") // Por si afecta a algún post público
    
    return { 
      success: true,
      message: "Comentario aprobado exitosamente"
    }
  } catch (error) {
    console.error("Error aprobando comentario:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al aprobar comentario"
    }
  }
}

export async function rejectCommentAction(id: string) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "superadmin" && session.user.role !== "colaborador")) {
      throw new Error("No autorizado para moderar comentarios")
    }
    
    await moderateCommentManually({ 
      id, 
      status: "REJECTED",
      moderatorEmail: session.user.email || undefined
    })
    
    revalidatePath("/admin/comments")
    revalidatePath("/admin") // Dashboard stats
    
    return { 
      success: true,
      message: "Comentario rechazado exitosamente"
    }
  } catch (error) {
    console.error("Error rechazando comentario:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al rechazar comentario"
    }
  }
}

export async function deleteCommentAction(id: string) {
  try {
    const session = await auth()
    
    // Solo superadmin puede eliminar comentarios
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("Solo superadmin puede eliminar comentarios")
    }
    
    await deleteComment(id)
    
    revalidatePath("/admin/comments")
    revalidatePath("/admin") // Dashboard stats
    revalidatePath("/blog") // Por si afecta a algún post público
    
    return { 
      success: true,
      message: "Comentario eliminado permanentemente"
    }
  } catch (error) {
    console.error("Error eliminando comentario:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al eliminar comentario"
    }
  }
}

export async function bulkModerateAction(
  ids: string[], 
  status: CommentStatus
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "superadmin" && session.user.role !== "colaborador")) {
      throw new Error("No autorizado para moderar comentarios")
    }
    
    const results = await Promise.allSettled(
      ids.map(id => moderateCommentManually({ 
        id, 
        status,
        moderatorEmail: session.user.email || undefined
      }))
    )
    
    const successCount = results.filter(r => r.status === "fulfilled").length
    const failedCount = results.filter(r => r.status === "rejected").length
    
    revalidatePath("/admin/comments")
    revalidatePath("/admin") // Dashboard stats
    revalidatePath("/blog") // Por si afecta a posts públicos
    
    if (failedCount > 0) {
      return {
        success: false,
        error: `${successCount} comentarios moderados, ${failedCount} fallaron`
      }
    }
    
    return { 
      success: true,
      message: `${successCount} comentarios ${status === "APPROVED" ? "aprobados" : "rechazados"} exitosamente`
    }
  } catch (error) {
    console.error("Error en moderación masiva:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al moderar comentarios"
    }
  }
}

export async function bulkDeleteAction(ids: string[]) {
  try {
    const session = await auth()
    
    // Solo superadmin puede eliminar comentarios
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("Solo superadmin puede eliminar comentarios")
    }
    
    const results = await Promise.allSettled(
      ids.map(id => deleteComment(id))
    )
    
    const successCount = results.filter(r => r.status === "fulfilled").length
    const failedCount = results.filter(r => r.status === "rejected").length
    
    revalidatePath("/admin/comments")
    revalidatePath("/admin") // Dashboard stats
    revalidatePath("/blog") // Por si afecta a posts públicos
    
    if (failedCount > 0) {
      return {
        success: false,
        error: `${successCount} comentarios eliminados, ${failedCount} fallaron`
      }
    }
    
    return { 
      success: true,
      message: `${successCount} comentarios eliminados permanentemente`
    }
  } catch (error) {
    console.error("Error en eliminación masiva:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al eliminar comentarios"
    }
  }
}

export async function getPendingCommentsCountAction() {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "superadmin" && session.user.role !== "colaborador")) {
      return { success: false, count: 0 }
    }
    
    const pendingComments = await getPendingComments()
    
    return { 
      success: true, 
      count: pendingComments.length 
    }
  } catch (error) {
    console.error("Error obteniendo count de pendientes:", error)
    return { 
      success: false, 
      count: 0
    }
  }
}