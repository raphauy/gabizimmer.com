import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { type Comment, type CommentStatus, type Prisma } from "@prisma/client"
import { moderateComment } from "@/services/ai-moderation-service"
import { sendCommentRejectionEmail } from "@/services/email-service"

// Tipo personalizado para comentarios con relación de post
export type CommentWithPost = Comment & {
  post: { 
    title: string
    slug: string
    category?: {
      slug: string
    }
  }
  approvedBy?: string | null
  rejectionReason?: string | null
}

// ✅ Validaciones al inicio del archivo
export const createCommentSchema = z.object({
  content: z.string()
    .min(1, "El comentario es requerido")
    .max(1000, "El comentario no puede exceder 1000 caracteres")
    .trim(),
  postId: z.string()
    .cuid("ID de post inválido"),
  authorName: z.string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),
  authorEmail: z.string()
    .email("Email inválido")
    .toLowerCase()
    .trim(),
})

export const moderateCommentSchema = z.object({
  id: z.string().cuid("ID de comentario inválido"),
  status: z.enum(["APPROVED", "REJECTED", "PENDING"] as const)
})

// Tipos derivados de schemas
export type CreateCommentData = z.infer<typeof createCommentSchema>
export type ModerateCommentData = z.infer<typeof moderateCommentSchema>

/**
 * Validación anti-spam básica
 */
function isSpam(content: string): boolean {
  // Patrones comunes de spam
  const spamPatterns = [
    /\b(viagra|cialis|casino|poker|lottery|winner|prize)\b/gi,
    /\b(click here|buy now|free money|work from home)\b/gi,
    /https?:\/\/[^\s]+/g, // URLs excesivas (más de 2)
    /(.)\1{10,}/g, // Caracteres repetidos excesivamente
  ]
  
  // Contar URLs
  const urlMatches = content.match(/https?:\/\/[^\s]+/g) || []
  if (urlMatches.length > 2) {
    return true
  }
  
  // Verificar otros patrones de spam
  return spamPatterns.some(pattern => pattern.test(content))
}

/**
 * Obtiene un comentario por ID
 */
export async function getCommentById(id: string): Promise<Comment | null> {
  return await prisma.comment.findUnique({
    where: { id }
  })
}

/**
 * Obtiene todos los comentarios aprobados de un post
 */
export async function getApprovedComments(postId: string): Promise<Comment[]> {
  return await prisma.comment.findMany({
    where: {
      postId,
      status: 'APPROVED'
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

/**
 * Obtiene comentarios pendientes de moderación
 */
export async function getPendingComments(): Promise<CommentWithPost[]> {
  return await prisma.comment.findMany({
    where: {
      status: 'PENDING'
    },
    include: {
      post: {
        select: {
          title: true,
          slug: true,
          category: {
            select: {
              slug: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

/**
 * Obtiene todos los comentarios con filtros opcionales
 */
export async function getAllComments(filters?: {
  postId?: string
  status?: CommentStatus
  authorEmail?: string
}): Promise<Comment[]> {
  const where: Prisma.CommentWhereInput = {}
  
  if (filters?.postId) where.postId = filters.postId
  if (filters?.status) where.status = filters.status
  if (filters?.authorEmail) where.authorEmail = filters.authorEmail
  
  return await prisma.comment.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    }
  })
}

/**
 * Crea un nuevo comentario
 */
export async function createComment(data: CreateCommentData): Promise<Comment> {
  const validated = createCommentSchema.parse(data)
  
  // Verificar que el post existe
  const post = await prisma.post.findUnique({
    where: { id: validated.postId },
    select: { id: true, title: true, status: true }
  })
  
  if (!post) {
    throw new Error("El post especificado no existe")
  }
  
  if (post.status !== 'PUBLISHED') {
    throw new Error("No se pueden agregar comentarios a posts no publicados")
  }
  
  // NUEVO: Moderación con IA
  const moderation = await moderateComment({
    content: validated.content,
    postTitle: post.title,
    authorName: validated.authorName,
    authorEmail: validated.authorEmail
  })
  
  let finalStatus: CommentStatus = 'PENDING'
  let approvedBy: string | null = null
  let rejectionReason: string | null = null
  
  if (moderation) {
    // Si la IA pudo moderar
    if (moderation.isAppropriate) {
      finalStatus = 'APPROVED'
      approvedBy = 'Agente IA'
    } else {
      finalStatus = 'REJECTED'
      approvedBy = 'Agente IA'
      rejectionReason = moderation.reason || 'Contenido inadecuado'
      
      // Enviar email de notificación de rechazo
      await sendCommentRejectionEmail({
        commentContent: validated.content,
        postTitle: post.title,
        authorName: validated.authorName,
        authorEmail: validated.authorEmail,
        rejectionReason,
        commentDate: new Date()
      })
    }
  } else {
    // Si la IA falla, usar lógica tradicional
    if (isSpam(validated.content)) {
      finalStatus = 'REJECTED'
      rejectionReason = 'Detectado como spam por filtro básico'
    } else {
      // Verificar si el email ya tiene comentarios aprobados (auto-aprobar)
      const previousApprovedComment = await prisma.comment.findFirst({
        where: {
          authorEmail: validated.authorEmail,
          status: 'APPROVED'
        }
      })
      
      if (previousApprovedComment) {
        finalStatus = 'APPROVED'
        approvedBy = 'Auto-aprobado por historial'
      }
    }
  }
  
  try {
    const comment = await prisma.comment.create({
      data: {
        ...validated,
        status: finalStatus,
        approvedBy,
        rejectionReason
      }
    })
    
    return comment
  } catch (error) {
    console.error('Error creating comment:', error)
    throw new Error('Error al crear el comentario')
  }
}

/**
 * Modera un comentario manualmente (aprobar/rechazar)
 */
export async function moderateCommentManually(data: ModerateCommentData & { moderatorEmail?: string }): Promise<Comment> {
  const validated = moderateCommentSchema.parse(data)
  
  const comment = await prisma.comment.findUnique({
    where: { id: validated.id }
  })
  
  if (!comment) {
    throw new Error("Comentario no encontrado")
  }
  
  try {
    return await prisma.comment.update({
      where: { id: validated.id },
      data: { 
        status: validated.status,
        // Si se aprueba manualmente, actualizar approvedBy
        approvedBy: validated.status === 'APPROVED' 
          ? (data.moderatorEmail || 'Moderador manual')
          : comment.approvedBy
      }
    })
  } catch (error) {
    console.error('Error moderating comment:', error)
    throw new Error('Error al moderar el comentario')
  }
}

/**
 * Elimina un comentario
 */
export async function deleteComment(id: string): Promise<Comment> {
  const comment = await prisma.comment.findUnique({
    where: { id }
  })
  
  if (!comment) {
    throw new Error("Comentario no encontrado")
  }
  
  try {
    return await prisma.comment.delete({
      where: { id }
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw new Error('Error al eliminar el comentario')
  }
}

/**
 * Obtiene el total de comentarios
 */
export async function getCommentsCount(): Promise<number> {
  return await prisma.comment.count()
}

/**
 * Obtiene estadísticas de comentarios
 */
export async function getCommentsStats() {
  const [
    totalComments,
    approvedComments,
    pendingComments,
    rejectedComments,
    uniqueCommenters,
    mostCommentedPost
  ] = await Promise.all([
    prisma.comment.count(),
    prisma.comment.count({ where: { status: 'APPROVED' } }),
    prisma.comment.count({ where: { status: 'PENDING' } }),
    prisma.comment.count({ where: { status: 'REJECTED' } }),
    prisma.comment.groupBy({
      by: ['authorEmail'],
      _count: true
    }).then(results => results.length),
    prisma.post.findFirst({
      where: {
        comments: {
          some: {
            status: 'APPROVED'
          }
        }
      },
      include: {
        _count: {
          select: {
            comments: {
              where: {
                status: 'APPROVED'
              }
            }
          }
        }
      },
      orderBy: {
        comments: {
          _count: 'desc'
        }
      }
    })
  ])
  
  return {
    totalComments,
    approvedComments,
    pendingComments,
    rejectedComments,
    uniqueCommenters,
    mostCommentedPost: mostCommentedPost ? {
      title: mostCommentedPost.title,
      commentsCount: mostCommentedPost._count.comments
    } : null
  }
}

/**
 * Obtiene los comentarios recientes (para dashboard)
 */
export async function getRecentComments(limit: number = 5): Promise<CommentWithPost[]> {
  return await prisma.comment.findMany({
    where: {
      status: 'APPROVED'
    },
    include: {
      post: {
        select: {
          title: true,
          slug: true,
          category: {
            select: {
              slug: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })
}