'use server'

import { createComment, getApprovedComments } from '@/services/comment-service'
import { revalidatePath } from 'next/cache'

interface CreateCommentActionData {
  postId: string
  authorName: string
  authorEmail: string
  content: string
}

export async function createCommentAction(data: CreateCommentActionData) {
  try {
    // Validaciones básicas
    if (!data.authorName?.trim() || !data.authorEmail?.trim() || !data.content?.trim()) {
      return {
        success: false,
        message: 'Todos los campos son requeridos'
      }
    }
    
    // Crear el comentario
    const comment = await createComment({
      postId: data.postId,
      authorName: data.authorName.trim(),
      authorEmail: data.authorEmail.trim().toLowerCase(),
      content: data.content.trim()
    })
    
    // Revalidar la página del post para mostrar el nuevo comentario si fue aprobado
    if (comment.status === 'APPROVED') {
      revalidatePath(`/blog`)
    }
    
    // Mensaje según el estado del comentario
    const message = comment.status === 'APPROVED' 
      ? 'Tu comentario ha sido publicado'
      : comment.status === 'REJECTED'
      ? 'Tu comentario fue rechazado por el filtro anti-spam'
      : 'Tu comentario está pendiente de moderación'
    
    return {
      success: true,
      message,
      comment: comment.status === 'APPROVED' ? comment : undefined
    }
  } catch (error) {
    console.error('Error creating comment:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al crear el comentario'
    }
  }
}

export async function getApprovedCommentsAction(postId: string) {
  try {
    const comments = await getApprovedComments(postId)
    return {
      success: true,
      comments
    }
  } catch (error) {
    console.error('Error getting approved comments:', error)
    return {
      success: false,
      comments: [],
      message: 'Error al cargar los comentarios'
    }
  }
}