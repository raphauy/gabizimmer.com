"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { 
  createPost, 
  updatePost, 
  deletePost, 
  isSlugUnique,
  generateSlug,
  getAllPosts,
  type CreatePostData,
  type UpdatePostData
} from "@/services/post-service"
import { getAllCategories } from "@/services/category-service"
import { Language, PostStatus } from "@prisma/client"

export async function checkSlugAction(
  slug: string, 
  language: Language,
  excludeId?: string
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "superadmin" && session.user.role !== "colaborador")) {
      throw new Error("No autorizado")
    }

    const isUnique = await isSlugUnique(slug, language, excludeId)
    return { success: true, isUnique }
  } catch (error) {
    console.error("Error verificando slug:", error)
    return { 
      success: false, 
      isUnique: false, 
      error: error instanceof Error ? error.message : "Error al verificar slug" 
    }
  }
}

export async function generateSlugAction(title: string) {
  return generateSlug(title)
}

export async function createPostAction(data: Omit<CreatePostData, 'authorId'>) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "superadmin" && session.user.role !== "colaborador")) {
      throw new Error("No autorizado para crear posts")
    }
    
    
    const post = await createPost({
      ...data,
      authorId: session.user.id
    })
    
    revalidatePath('/admin/posts')
    if (post.status === 'PUBLISHED') {
      revalidatePath('/blog')
      revalidatePath(`/blog/${post.slug}`)
    }
    
    return { 
      success: true, 
      post,
      message: 'Post creado exitosamente' 
    }
  } catch (error) {
    console.error("Error creando post:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al crear post' 
    }
  }
}

export async function updatePostAction(id: string, data: UpdatePostData) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      throw new Error("No autorizado")
    }
    
    // Solo superadmin puede editar cualquier post
    // Colaboradores solo pueden editar sus propios posts
    if (session.user.role === "colaborador") {
      const { getPostById } = await import("@/services/post-service")
      const post = await getPostById(id)
      if (!post || post.authorId !== session.user.id) {
        throw new Error("No autorizado para editar este post")
      }
    } else if (session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }
    
    const post = await updatePost(id, data)
    
    revalidatePath('/admin/posts')
    revalidatePath(`/admin/posts/${id}/edit`)
    if (post.status === 'PUBLISHED') {
      revalidatePath('/blog')
      revalidatePath(`/blog/${post.slug}`)
    }
    
    return { 
      success: true, 
      post,
      message: 'Post actualizado exitosamente' 
    }
  } catch (error) {
    console.error("Error actualizando post:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al actualizar post' 
    }
  }
}

export async function deletePostAction(id: string) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("Solo superadmin puede eliminar posts")
    }
    
    await deletePost(id)
    
    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    
    return { 
      success: true,
      message: 'Post eliminado exitosamente'
    }
  } catch (error) {
    console.error("Error eliminando post:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al eliminar post' 
    }
  }
}

export async function publishPostAction(id: string) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "superadmin" && session.user.role !== "colaborador")) {
      throw new Error("No autorizado")
    }
    
    const post = await updatePost(id, { status: 'PUBLISHED' as PostStatus })
    
    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    revalidatePath(`/blog/${post.slug}`)
    
    return { 
      success: true, 
      post,
      message: 'Post publicado exitosamente' 
    }
  } catch (error) {
    console.error("Error publicando post:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al publicar post' 
    }
  }
}

export async function archivePostAction(id: string) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "superadmin" && session.user.role !== "colaborador")) {
      throw new Error("No autorizado")
    }
    
    const post = await updatePost(id, { status: 'ARCHIVED' as PostStatus })
    
    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    
    return { 
      success: true, 
      post,
      message: 'Post archivado exitosamente' 
    }
  } catch (error) {
    console.error("Error archivando post:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al archivar post' 
    }
  }
}

export async function getCategoriesAction() {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "superadmin" && session.user.role !== "colaborador")) {
      throw new Error("No autorizado")
    }
    
    const categories = await getAllCategories()
    
    return { 
      success: true, 
      categories 
    }
  } catch (error) {
    console.error("Error obteniendo categorías:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al cargar categorías',
      categories: []
    }
  }
}

export async function getPostsAction() {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "superadmin" && session.user.role !== "colaborador")) {
      throw new Error("No autorizado")
    }
    
    const posts = await getAllPosts()
    
    return { 
      success: true, 
      posts 
    }
  } catch (error) {
    console.error("Error obteniendo posts:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al cargar posts',
      posts: []
    }
  }
}