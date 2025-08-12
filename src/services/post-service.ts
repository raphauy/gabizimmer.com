import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { type Post, type PostStatus, type Language, type Prisma } from "@prisma/client"

// Tipo personalizado para posts con relaciones
export type PostWithRelations = Post & {
  author: { name: string | null; email: string; image?: string | null }
  category: { name: string; slug: string }
  _count?: { comments: number }
}

// ✅ Validaciones al inicio del archivo
export const createPostSchema = z.object({
  title: z.string()
    .min(1, "El título es requerido")
    .max(200, "El título no puede exceder 200 caracteres")
    .trim(),
  slug: z.string()
    .min(1, "El slug es requerido")
    .max(100, "El slug no puede exceder 100 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug debe ser lowercase con guiones")
    .trim(),
  content: z.any(), // JSON from Novel editor
  excerpt: z.string()
    .max(300, "El resumen no puede exceder 300 caracteres")
    .nullable()
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"] as const),
  language: z.enum(["ES", "EN"] as const),
  featuredImageUrl: z.string()
    .url("URL de imagen inválida")
    .nullable()
    .optional(),
  categoryId: z.string()
    .cuid("ID de categoría inválido"),
  authorId: z.string()
    .cuid("ID de autor inválido"),
  seoTitle: z.string()
    .max(60, "El título SEO no puede exceder 60 caracteres")
    .nullable()
    .optional(),
  seoDescription: z.string()
    .max(160, "La descripción SEO no puede exceder 160 caracteres")
    .nullable()
    .optional(),
  publishedAt: z.date().optional().nullable()
})

export const updatePostSchema = createPostSchema.partial()

// Tipos derivados de schemas
export type CreatePostData = z.infer<typeof createPostSchema>
export type UpdatePostData = z.infer<typeof updatePostSchema>

/**
 * Auto-generación de slug con normalización de acentos
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100)
}

/**
 * Verificación de unicidad de slug por idioma
 */
export async function isSlugUnique(
  slug: string,
  language: Language,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.post.findFirst({
    where: {
      slug,
      language,
      ...(excludeId && { NOT: { id: excludeId } })
    }
  })
  return !existing
}

/**
 * Calcular tiempo de lectura desde contenido JSON
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateReadingTime(content: any): number {
  // Extraer texto del JSON de Novel editor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractText = (obj: any): string => {
    if (typeof obj === 'string') return obj
    if (typeof obj !== 'object' || obj === null) return ''
    
    let text = ''
    if (obj.text) text += obj.text + ' '
    if (obj.content && Array.isArray(obj.content)) {
      for (const item of obj.content) {
        text += extractText(item) + ' '
      }
    }
    return text
  }
  
  const text = extractText(content)
  const wordsPerMinute = 200
  const words = text.split(/\s+/).filter(word => word.length > 0).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

/**
 * Verificar integridad antes de eliminar
 */
async function checkPostIntegrity(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      _count: {
        select: { comments: true }
      }
    }
  })
  
  if (!post) {
    throw new Error("Post no encontrado")
  }
  
  if (post._count.comments > 0) {
    throw new Error(
      `No se puede eliminar el post: tiene ${post._count.comments} comentario(s) asociado(s)`
    )
  }
  
  return post
}

/**
 * Obtiene un post por ID
 */
export async function getPostById(id: string): Promise<PostWithRelations | null> {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, email: true, image: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { comments: true } }
    }
  })
}

/**
 * Obtiene un post por slug e idioma
 */
export async function getPostBySlugAndLanguage(
  slug: string,
  language: Language
): Promise<PostWithRelations | null> {
  return await prisma.post.findFirst({
    where: { slug, language },
    include: {
      author: { select: { name: true, email: true, image: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { comments: true } }
    }
  })
}

/**
 * Obtiene todos los posts con filtros opcionales
 */
export async function getAllPosts(filters?: {
  status?: PostStatus
  categoryId?: string
  authorId?: string
  language?: Language
}): Promise<PostWithRelations[]> {
  const where: Prisma.PostWhereInput = {}
  
  if (filters?.status) where.status = filters.status
  if (filters?.categoryId) where.categoryId = filters.categoryId
  if (filters?.authorId) where.authorId = filters.authorId
  if (filters?.language) where.language = filters.language
  
  return await prisma.post.findMany({
    where,
    include: {
      author: { select: { name: true, email: true, image: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { comments: true } }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

/**
 * Crea un nuevo post
 */
export async function createPost(data: CreatePostData): Promise<PostWithRelations> {
  const validated = createPostSchema.parse(data)
  
  // Validar que el autor existe
  const author = await prisma.user.findUnique({
    where: { id: validated.authorId }
  })
  if (!author) {
    throw new Error(`El autor con ID "${validated.authorId}" no existe`)
  }
  
  // Validar slug único por idioma
  const isUnique = await isSlugUnique(validated.slug, validated.language)
  if (!isUnique) {
    throw new Error(
      `El slug "${validated.slug}" ya existe para el idioma ${validated.language}`
    )
  }
  
  // Validar que la categoría existe
  const category = await prisma.category.findUnique({
    where: { id: validated.categoryId }
  })
  if (!category) {
    throw new Error("La categoría especificada no existe")
  }
  
  const readingTime = calculateReadingTime(validated.content)
  const publishedAt = validated.status === 'PUBLISHED' 
    ? (validated.publishedAt ?? new Date()) 
    : null
  
  try {
    const post = await prisma.post.create({
      data: {
        ...validated,
        content: JSON.parse(JSON.stringify(validated.content)) as Prisma.InputJsonValue,
        readingTime,
        publishedAt
      },
      include: {
        author: { select: { name: true, email: true, image: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true } }
      }
    })
    return post
  } catch (error) {
    console.error('Error creating post:', error)
    throw new Error('Error al crear el post')
  }
}

/**
 * Actualiza un post existente
 */
export async function updatePost(
  id: string,
  data: UpdatePostData
): Promise<PostWithRelations> {
  const validated = updatePostSchema.parse(data)
  
  // Obtener el post actual
  const currentPost = await prisma.post.findUnique({
    where: { id }
  })
  
  if (!currentPost) {
    throw new Error("Post no encontrado")
  }
  
  // Si se está actualizando el slug, verificar unicidad
  if (validated.slug && validated.slug !== currentPost.slug) {
    const language = validated.language || currentPost.language
    const isUnique = await isSlugUnique(validated.slug, language, id)
    if (!isUnique) {
      throw new Error(
        `El slug "${validated.slug}" ya existe para el idioma ${language}`
      )
    }
  }
  
  // Si se está actualizando la categoría, verificar que existe
  if (validated.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: validated.categoryId }
    })
    if (!category) {
      throw new Error("La categoría especificada no existe")
    }
  }
  
  // Recalcular tiempo de lectura si se actualiza el contenido
  let readingTime = currentPost.readingTime
  if (validated.content) {
    readingTime = calculateReadingTime(validated.content)
  }
  
  // Actualizar publishedAt si cambia el estado
  let publishedAt = currentPost.publishedAt
  if (validated.status === 'PUBLISHED' && currentPost.status !== 'PUBLISHED') {
    publishedAt = new Date()
  } else if (validated.status !== 'PUBLISHED' && currentPost.status === 'PUBLISHED') {
    publishedAt = null
  }
  
  try {
    const updateData: Prisma.PostUpdateInput = {
      ...validated,
      readingTime,
      publishedAt
    }
    if (validated.content) {
      updateData.content = JSON.parse(JSON.stringify(validated.content)) as Prisma.InputJsonValue
    }
    
    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { name: true, email: true, image: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true } }
      }
    })
    return post
  } catch (error) {
    console.error('Error updating post:', error)
    throw new Error('Error al actualizar el post')
  }
}

/**
 * Elimina un post (solo si no tiene comentarios)
 */
export async function deletePost(id: string): Promise<Post> {
  // Verificar integridad primero
  await checkPostIntegrity(id)
  
  try {
    return await prisma.post.delete({ where: { id } })
  } catch (error) {
    console.error('Error deleting post:', error)
    throw new Error('Error al eliminar el post')
  }
}

/**
 * Obtiene estadísticas de posts
 */
export async function getPostsStats() {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    archivedPosts,
    postsWithComments,
    mostCommentedPost
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.count({ where: { status: 'DRAFT' } }),
    prisma.post.count({ where: { status: 'ARCHIVED' } }),
    prisma.post.count({
      where: {
        comments: {
          some: {}
        }
      }
    }),
    prisma.post.findFirst({
      include: {
        _count: {
          select: { comments: true }
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
    totalPosts,
    publishedPosts,
    draftPosts,
    archivedPosts,
    postsWithComments,
    mostCommentedPost: mostCommentedPost ? {
      title: mostCommentedPost.title,
      commentsCount: mostCommentedPost._count.comments
    } : null
  }
}

/**
 * Obtiene el conteo total de posts (para sidebar)
 */
export async function getPostsCount(): Promise<number> {
  return await prisma.post.count()
}