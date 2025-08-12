import { put, del } from '@vercel/blob'
import { z } from 'zod'

// Esquemas de validación
export const uploadImageSchema = z.object({
  file: z.any(), // File object del navegador
  userId: z.string().min(1, "ID de usuario requerido"),
  folder: z.string().optional().default("avatars")
})

export const deleteImageSchema = z.object({
  url: z.string().url("URL de imagen inválida")
})

// Tipos
export type UploadImageInput = z.infer<typeof uploadImageSchema>
export type DeleteImageInput = z.infer<typeof deleteImageSchema>

/**
 * Sube una imagen de avatar de usuario a Vercel Blob Storage
 */
export async function uploadUserAvatar(input: UploadImageInput) {
  const validatedInput = uploadImageSchema.parse(input)
  
  // Validar que sea un archivo de imagen
  if (!validatedInput.file || !validatedInput.file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen')
  }
  
  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (validatedInput.file.size > maxSize) {
    throw new Error('La imagen no puede ser mayor a 5MB')
  }
  
  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileExtension = validatedInput.file.name.split('.').pop() || 'jpg'
    const fileName = `${validatedInput.folder}/${validatedInput.userId}-${timestamp}.${fileExtension}`
    
    // Subir archivo a Vercel Blob
    const blob = await put(fileName, validatedInput.file, {
      access: 'public',
      addRandomSuffix: false, // Ya tenemos timestamp para evitar colisiones
    })
    
    return {
      url: blob.url,
      fileName: fileName,
      size: validatedInput.file.size,
      contentType: validatedInput.file.type
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Error al subir la imagen')
  }
}

/**
 * Elimina una imagen de Vercel Blob Storage
 */
export async function deleteImage(input: DeleteImageInput) {
  const validatedInput = deleteImageSchema.parse(input)
  
  try {
    await del(validatedInput.url)
    return { success: true }
  } catch (error) {
    console.error('Error deleting image:', error)
    throw new Error('Error al eliminar la imagen')
  }
}

/**
 * Elimina la imagen de avatar anterior de un usuario y sube una nueva
 */
export async function replaceUserAvatar(input: UploadImageInput & { currentImageUrl?: string }) {
  const validatedInput = uploadImageSchema.parse(input)
  
  try {
    // Subir nueva imagen
    const newImage = await uploadUserAvatar(validatedInput)
    
    // Eliminar imagen anterior si existe
    if (input.currentImageUrl) {
      try {
        await deleteImage({ url: input.currentImageUrl })
      } catch (error) {
        // No fallar si no se puede eliminar la imagen anterior
        console.warn('Could not delete previous image:', error)
      }
    }
    
    return newImage
  } catch (error) {
    console.error('Error replacing user avatar:', error)
    throw new Error('Error al reemplazar la imagen de avatar')
  }
}

/**
 * Sube una imagen de workspace a Vercel Blob Storage
 */
export async function uploadWorkspaceImage(input: { file: File, workspaceId: string }) {
  // Validar que sea un archivo de imagen
  if (!input.file || !input.file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen')
  }
  
  // Validar tamaño (máximo 2MB para logos)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (input.file.size > maxSize) {
    throw new Error('La imagen no puede ser mayor a 2MB')
  }
  
  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileExtension = input.file.name.split('.').pop() || 'jpg'
    const fileName = `workspaces/${input.workspaceId}-${timestamp}.${fileExtension}`
    
    // Subir archivo a Vercel Blob
    const blob = await put(fileName, input.file, {
      access: 'public',
      addRandomSuffix: false,
    })
    
    return {
      url: blob.url,
      fileName: fileName,
      size: input.file.size,
      contentType: input.file.type
    }
  } catch (error) {
    console.error('Error uploading workspace image:', error)
    throw new Error('Error al subir la imagen del workspace')
  }
}

/**
 * Elimina la imagen anterior de un workspace y sube una nueva
 */
export async function replaceWorkspaceImage(input: { file: File, workspaceId: string, currentImageUrl?: string }) {
  try {
    // Subir nueva imagen
    const newImage = await uploadWorkspaceImage({
      file: input.file,
      workspaceId: input.workspaceId
    })
    
    // Eliminar imagen anterior si existe
    if (input.currentImageUrl) {
      try {
        await deleteImage({ url: input.currentImageUrl })
      } catch (error) {
        // No fallar si no se puede eliminar la imagen anterior
        console.warn('Could not delete previous workspace image:', error)
      }
    }
    
    return newImage
  } catch (error) {
    console.error('Error replacing workspace image:', error)
    throw new Error('Error al reemplazar la imagen del workspace')
  }
}

/**
 * Sube una imagen de contenido del blog a Vercel Blob Storage
 */
export async function uploadPostImage(input: { 
  file: File, 
  postId: string,
  type: 'content' | 'featured' 
}) {
  // Validar que sea imagen
  if (!input.file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen')
  }
  
  // Límites según tipo
  const maxSize = input.type === 'featured' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
  if (input.file.size > maxSize) {
    throw new Error(`La imagen no puede ser mayor a ${maxSize / (1024 * 1024)}MB`)
  }
  
  try {
    const timestamp = Date.now()
    const fileExtension = input.file.name.split('.').pop() || 'jpg'
    const folder = input.type === 'featured' ? 'blog/featured' : 'blog/posts'
    const fileName = `${folder}/${input.postId}-${timestamp}.${fileExtension}`
    
    // Subir a Vercel Blob
    const blob = await put(fileName, input.file, {
      access: 'public',
      addRandomSuffix: false,
    })
    
    return {
      url: blob.url,
      fileName: fileName,
      size: input.file.size,
      contentType: input.file.type
    }
  } catch (error) {
    console.error('Error uploading blog image:', error)
    throw new Error('Error al subir la imagen del blog')
  }
}

/**
 * Sube imagen destacada del post
 */
export async function uploadFeaturedImage(file: File, postId: string) {
  return uploadPostImage({ file, postId, type: 'featured' })
}

/**
 * Sube imagen de contenido del post
 */
export async function uploadContentImage(file: File, postId: string) {
  return uploadPostImage({ file, postId, type: 'content' })
}

/**
 * Elimina todas las imágenes de un post (al eliminar el post)
 */
export async function deletePostImages(postId: string, imageUrls: string[]) {
  const errors = []
  
  for (const url of imageUrls) {
    try {
      await del(url)
    } catch (error) {
      errors.push({ url, error })
    }
  }
  
  if (errors.length > 0) {
    console.warn('Some images could not be deleted:', errors)
  }
  
  return { deleted: imageUrls.length - errors.length, errors }
}

/**
 * Reemplaza la imagen destacada de un post
 */
export async function replaceFeaturedImage(input: { 
  file: File, 
  postId: string, 
  currentImageUrl?: string 
}) {
  try {
    // Subir nueva imagen
    const newImage = await uploadFeaturedImage(input.file, input.postId)
    
    // Eliminar imagen anterior si existe
    if (input.currentImageUrl) {
      try {
        await deleteImage({ url: input.currentImageUrl })
      } catch (error) {
        // No fallar si no se puede eliminar la imagen anterior
        console.warn('Could not delete previous featured image:', error)
      }
    }
    
    return newImage
  } catch (error) {
    console.error('Error replacing featured image:', error)
    throw new Error('Error al reemplazar la imagen destacada')
  }
}