import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { type Comment, type CommentStatus, type Prisma } from "@prisma/client"

// Tipo personalizado para comentarios con relación de post
export type CommentWithPost = Comment & {
  post: { 
    title: string
    slug: string
    category?: {
      slug: string
    }
  }
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
    where: { id: validated.postId }
  })
  
  if (!post) {
    throw new Error("El post especificado no existe")
  }
  
  if (post.status !== 'PUBLISHED') {
    throw new Error("No se pueden agregar comentarios a posts no publicados")
  }
  
  // Verificación anti-spam básica
  const spamDetected = isSpam(validated.content)
  const initialStatus: CommentStatus = spamDetected ? 'REJECTED' : 'PENDING'
  
  // Verificar si el email ya tiene comentarios aprobados (auto-aprobar)
  const previousApprovedComment = await prisma.comment.findFirst({
    where: {
      authorEmail: validated.authorEmail,
      status: 'APPROVED'
    }
  })
  
  const finalStatus: CommentStatus = previousApprovedComment ? 'APPROVED' : initialStatus
  
  try {
    const comment = await prisma.comment.create({
      data: {
        ...validated,
        status: finalStatus
      }
    })
    
    return comment
  } catch (error) {
    console.error('Error creating comment:', error)
    throw new Error('Error al crear el comentario')
  }
}

/**
 * Modera un comentario (aprobar/rechazar)
 */
export async function moderateComment(data: ModerateCommentData): Promise<Comment> {
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
      data: { status: validated.status }
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