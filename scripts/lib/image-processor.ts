import { readFileSync, existsSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { uploadFeaturedImage, uploadContentImage } from '@/services/upload-service'
import chalk from 'chalk'

/**
 * Resultado del procesamiento de imágenes
 */
export interface ImageProcessingResult {
  originalUrl: string
  newUrl: string
  fileName: string
  size: number
  success: boolean
  error?: string
}

/**
 * Determina si una ruta de imagen es una imagen destacada
 */
function isFeaturedImage(imagePath: string, index: number): boolean {
  // La primera imagen o la que contiene "featured" en el nombre
  return index === 0 || imagePath.toLowerCase().includes('featured')
}

/**
 * Obtiene el tipo MIME basado en la extensión del archivo
 */
function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  }
  return mimeTypes[ext] || 'image/jpeg'
}

/**
 * Convierte un buffer a File object
 */
function bufferToFile(buffer: Buffer, fileName: string, mimeType: string): File {
  const blob = new Blob([buffer], { type: mimeType })
  return new File([blob], fileName, { type: mimeType })
}

/**
 * Procesa una imagen individual
 */
async function processImage(
  imagePath: string, 
  markdownDir: string, 
  postId: string,
  index: number
): Promise<ImageProcessingResult> {
  try {
    // Construir path completo de la imagen
    const baseDir = dirname(markdownDir)
    let fullPath: string
    
    if (imagePath.startsWith('./')) {
      // Ruta relativa desde el markdown
      fullPath = join(baseDir, imagePath.substring(2))
    } else if (imagePath.startsWith('/')) {
      // Ruta absoluta
      fullPath = imagePath
    } else {
      // Ruta relativa sin ./
      fullPath = join(baseDir, imagePath)
    }
    
    // Verificar que el archivo existe
    if (!existsSync(fullPath)) {
      return {
        originalUrl: imagePath,
        newUrl: imagePath, // Mantener original si no se encuentra
        fileName: basename(imagePath),
        size: 0,
        success: false,
        error: `Archivo no encontrado: ${fullPath}`
      }
    }
    
    // Leer archivo
    const fileBuffer = readFileSync(fullPath)
    const fileName = basename(fullPath)
    const mimeType = getMimeType(fullPath)
    
    // Crear File object
    const file = bufferToFile(fileBuffer, fileName, mimeType)
    
    // Determinar si es imagen destacada
    const isFeatured = isFeaturedImage(imagePath, index)
    
    // Subir a Vercel Blob
    const uploadResult = isFeatured
      ? await uploadFeaturedImage(file, postId)
      : await uploadContentImage(file, postId)
    
    return {
      originalUrl: imagePath,
      newUrl: uploadResult.url,
      fileName: fileName,
      size: fileBuffer.length,
      success: true
    }
    
  } catch (error) {
    return {
      originalUrl: imagePath,
      newUrl: imagePath, // Mantener original en caso de error
      fileName: basename(imagePath),
      size: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Procesa todas las imágenes de un post
 */
export async function processImages(
  imagePaths: string[],
  postId: string,
  markdownFilePath: string
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>()
  
  if (imagePaths.length === 0) {
    return imageMap
  }
  
  console.log(chalk.blue(`   📸 Procesando ${imagePaths.length} imagen(es):`))
  
  const results: ImageProcessingResult[] = []
  
  // Procesar imágenes en paralelo (máximo 3 a la vez)
  const batchSize = 3
  for (let i = 0; i < imagePaths.length; i += batchSize) {
    const batch = imagePaths.slice(i, i + batchSize)
    const batchPromises = batch.map((imagePath, batchIndex) => 
      processImage(imagePath, markdownFilePath, postId, i + batchIndex)
    )
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }
  
  // Procesar resultados
  let successCount = 0
  let errorCount = 0
  
  for (const result of results) {
    if (result.success) {
      imageMap.set(result.originalUrl, result.newUrl)
      successCount++
      console.log(chalk.green(`      ✓ ${result.fileName} → ${result.newUrl.split('/').pop()}`))
    } else {
      errorCount++
      console.log(chalk.yellow(`      ⚠ ${result.fileName}: ${result.error}`))
    }
  }
  
  // Resumen
  if (successCount > 0) {
    console.log(chalk.green(`   ✅ ${successCount} imagen(es) subida(s) exitosamente`))
  }
  
  if (errorCount > 0) {
    console.log(chalk.yellow(`   ⚠ ${errorCount} imagen(es) con errores`))
  }
  
  return imageMap
}

/**
 * Actualiza URLs de imágenes en el contenido JSON de Novel
 */
export function updateImageUrlsInNovelContent(
  novelContent: any,
  imageMap: Map<string, string>
): any {
  if (!novelContent || typeof novelContent !== 'object') {
    return novelContent
  }
  
  function updateNode(node: any): any {
    if (!node || typeof node !== 'object') {
      return node
    }
    
    // Si es un nodo de imagen, actualizar la URL
    if (node.type === 'image' && node.attrs?.src && imageMap.has(node.attrs.src)) {
      return {
        ...node,
        attrs: {
          ...node.attrs,
          src: imageMap.get(node.attrs.src)
        }
      }
    }
    
    // Si tiene contenido, procesarlo recursivamente
    if (node.content && Array.isArray(node.content)) {
      return {
        ...node,
        content: node.content.map(updateNode)
      }
    }
    
    return node
  }
  
  return updateNode(novelContent)
}