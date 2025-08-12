import { readFileSync } from 'fs'
import matter from 'gray-matter'

export interface FrontMatter {
  title: string
  date: string
  modified?: string
  slug: string
  excerpt?: string
  status: string
  author: string
  categories: string[]
  tags?: string[]
  originalId?: number
  lang: "en" | "es"
  seoTitle?: string
  seoDescription?: string
  featuredImage?: string
}

export interface MarkdownPost {
  frontMatter: FrontMatter
  content: string
  images: string[]
}

/**
 * Extrae rutas de imágenes del contenido markdown
 */
function extractImagePaths(content: string): string[] {
  const images: string[] = []
  
  // Regex para imágenes markdown: ![alt](ruta)
  const markdownImageRegex = /!\[.*?\]\((.*?)\)/g
  
  // Regex para imágenes HTML: <img src="ruta">
  const htmlImageRegex = /<img[^>]+src=["'](.*?)["']/gi
  
  let match
  
  // Extraer imágenes markdown
  while ((match = markdownImageRegex.exec(content)) !== null) {
    const imagePath = match[1].trim()
    if (imagePath && !images.includes(imagePath)) {
      images.push(imagePath)
    }
  }
  
  // Extraer imágenes HTML
  while ((match = htmlImageRegex.exec(content)) !== null) {
    const imagePath = match[1].trim()
    if (imagePath && !images.includes(imagePath)) {
      images.push(imagePath)
    }
  }
  
  return images
}

/**
 * Normaliza rutas de imágenes relativas
 */
function normalizeImagePaths(images: string[]): string[] {
  return images.map(imagePath => {
    // Convertir rutas relativas que empiecen con ./
    if (imagePath.startsWith('./')) {
      return imagePath
    }
    
    // Si es solo el nombre del archivo, agregar ./images/
    if (!imagePath.includes('/') && !imagePath.startsWith('http')) {
      return `./images/${imagePath}`
    }
    
    return imagePath
  }).filter(path => 
    // Solo incluir imágenes locales (no URLs absolutas)
    !path.startsWith('http') && !path.startsWith('//')
  )
}

/**
 * Valida y normaliza el front matter
 */
function validateFrontMatter(data: any): FrontMatter {
  if (!data) {
    throw new Error('Front matter es requerido')
  }
  
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Front matter debe tener un título válido')
  }
  
  if (!data.slug || typeof data.slug !== 'string') {
    throw new Error('Front matter debe tener un slug válido')
  }
  
  if (!data.date) {
    throw new Error('Front matter debe tener una fecha válida')
  }
  
  if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
    throw new Error('Front matter debe tener al menos una categoría')
  }
  
  if (!data.lang || !['es', 'en'].includes(data.lang)) {
    throw new Error('Front matter debe tener un idioma válido (es o en)')
  }
  
  // Normalizar status
  const normalizedStatus = data.status?.toLowerCase() || 'draft'
  
  return {
    title: data.title.trim(),
    date: data.date,
    modified: data.modified || undefined,
    slug: data.slug.trim(),
    excerpt: data.excerpt?.trim() || undefined,
    status: normalizedStatus,
    author: data.author?.trim() || 'Gabi Zimmer',
    categories: data.categories.map((cat: any) => String(cat).trim()),
    tags: Array.isArray(data.tags) ? data.tags.map((tag: any) => String(tag).trim()) : undefined,
    originalId: data.originalId ? Number(data.originalId) : undefined,
    lang: data.lang as "en" | "es",
    seoTitle: data.seoTitle?.trim() || undefined,
    seoDescription: data.seoDescription?.trim() || undefined,
    featuredImage: data.featuredImage?.trim() || undefined
  }
}

/**
 * Parsea un archivo markdown y extrae front matter, contenido e imágenes
 */
export async function parseMarkdown(filePath: string): Promise<MarkdownPost> {
  try {
    // Leer archivo
    const fileContent = readFileSync(filePath, 'utf8')
    
    // Parsear con gray-matter
    const { data, content } = matter(fileContent)
    
    // Validar y normalizar front matter
    const frontMatter = validateFrontMatter(data)
    
    // Extraer imágenes del contenido
    const extractedImages = extractImagePaths(content)
    
    // Agregar featured image si existe
    const allImages = [...extractedImages]
    if (frontMatter.featuredImage && !allImages.includes(frontMatter.featuredImage)) {
      allImages.unshift(frontMatter.featuredImage) // Agregar al principio
    }
    
    // Normalizar rutas de imágenes
    const normalizedImages = normalizeImagePaths(allImages)
    
    return {
      frontMatter,
      content: content.trim(),
      images: normalizedImages
    }
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error parseando markdown: ${error.message}`)
    }
    throw new Error(`Error desconocido parseando archivo: ${filePath}`)
  }
}