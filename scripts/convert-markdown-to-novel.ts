#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { existsSync } from 'fs'
import chalk from 'chalk'
import ora from 'ora'
import { parseMarkdown } from './lib/markdown-parser'
import { convertToNovel } from './lib/novel-converter'
import { processImages, updateImageUrlsInNovelContent } from './lib/image-processor'
import { createPost, type CreatePostData } from '@/services/post-service'
import { getAllCategories, createCategory } from '@/services/category-service'
import { PostStatus, Language } from '@prisma/client'

// Mapeos para conversión de datos
const STATUS_MAP: Record<string, PostStatus> = {
  'published': 'PUBLISHED',
  'draft': 'DRAFT',
  'private': 'DRAFT',
  'trash': 'ARCHIVED'
}

const LANGUAGE_MAP: Record<string, Language> = {
  'es': 'ES',
  'en': 'EN',
  'spanish': 'ES',
  'english': 'EN'
}

// Interfaces para tipos internos
interface FrontMatter {
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

interface ConversionResult {
  postId: string
  title: string
  slug: string
  imagesUploaded: number
  categoryCreated: boolean
  warnings: string[]
}

const prisma = new PrismaClient()

/**
 * Procesa el SEO title removiendo placeholders de WordPress
 */
function processSeoTitle(seoTitle?: string): string | null {
  if (!seoTitle) return null
  
  return seoTitle
    .replace(/%%title%%/g, '')
    .replace(/%%sitename%%/g, '')
    .trim()
    .substring(0, 60) || null
}

/**
 * Genera excerpt automáticamente si está vacío
 */
function generateExcerpt(content: string, frontMatter: FrontMatter): string | null {
  if (frontMatter.excerpt && frontMatter.excerpt.trim()) {
    return frontMatter.excerpt.trim().substring(0, 300)
  }
  
  // Extraer texto plano del markdown para crear excerpt
  const textContent = content
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remover imágenes
    .replace(/\[.*?\]\(.*?\)/g, '') // Remover links
    .replace(/#+\s+/g, '') // Remover headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remover bold
    .replace(/\*(.+?)\*/g, '$1') // Remover italic
    .replace(/\n+/g, ' ') // Reemplazar saltos de línea
    .trim()
  
  return textContent.length > 0 ? textContent.substring(0, 160) + '...' : null
}

/**
 * Asegurar que la categoría existe, crearla si es necesario
 */
async function ensureCategory(categoryName: string): Promise<string> {
  const normalizedName = categoryName.trim()
  const slug = normalizedName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  
  // Buscar categoría existente
  const categories = await getAllCategories()
  const existingCategory = categories.find(
    cat => cat.name.toLowerCase() === normalizedName.toLowerCase() || 
           cat.slug === slug
  )
  
  if (existingCategory) {
    return existingCategory.id
  }
  
  // Crear nueva categoría
  const newCategory = await createCategory({
    name: normalizedName,
    slug: slug,
    description: null
  })
  
  return newCategory.id
}

/**
 * Obtener el usuario Gabi como author
 */
async function getGabiAuthor() {
  const gabi = await prisma.user.findFirst({
    where: { email: 'gabi@gabizimmer.com' }
  })
  
  if (!gabi) {
    // Fallback al primer superadmin
    const superadmin = await prisma.user.findFirst({
      where: { role: 'superadmin' }
    })
    
    if (!superadmin) {
      throw new Error('No se encontró usuario superadmin. Ejecuta el seed primero.')
    }
    
    return superadmin
  }
  
  return gabi
}

async function main() {
  const filePath = process.argv[2]
  
  if (!filePath) {
    console.error(chalk.red('❌ Uso: pnpm run convert:post <path-to-markdown>'))
    console.error(chalk.gray('Ejemplo: pnpm run convert:post docs/resources/migrated-posts/post-1555.md'))
    process.exit(1)
  }
  
  if (!existsSync(filePath)) {
    console.error(chalk.red(`❌ El archivo no existe: ${filePath}`))
    process.exit(1)
  }
  
  const spinner = ora('Iniciando conversión...').start()
  const warnings: string[] = []
  
  try {
    // 1. Parsear markdown
    spinner.text = 'Parseando archivo markdown...'
    const markdownPost = await parseMarkdown(filePath)
    
    // 2. Convertir a Novel JSON
    spinner.text = 'Convirtiendo a formato Novel...'
    let novelContent = await convertToNovel(markdownPost.content)
    
    // Debug: verificar estructura
    console.log('DEBUG: Estructura del contenido generado:')
    console.log('Tipo:', typeof novelContent)
    console.log('Tiene type?', novelContent.type)
    console.log('Tiene content?', Array.isArray(novelContent.content))
    console.log('JSON stringified:', JSON.stringify(novelContent, null, 2).substring(0, 200) + '...')
    
    // 3. Obtener author
    spinner.text = 'Verificando autor...'
    const author = await getGabiAuthor()
    
    // 4. Gestionar categorías
    spinner.text = 'Verificando categorías...'
    const primaryCategory = markdownPost.frontMatter.categories[0]
    if (!primaryCategory) {
      throw new Error('El post debe tener al menos una categoría')
    }
    const categoryId = await ensureCategory(primaryCategory)
    const categoryCreated = !!(await getAllCategories()).find(c => c.id === categoryId && c.name === primaryCategory)
    
    // 5. Procesar imágenes
    const imagesUploaded = markdownPost.images.length
    let imageMap = new Map<string, string>()
    
    if (imagesUploaded > 0) {
      spinner.text = 'Subiendo imágenes a Vercel Blob...'
      
      // Generar ID temporal para las imágenes
      const tempPostId = `temp-${Date.now()}`
      imageMap = await processImages(markdownPost.images, tempPostId, filePath)
      
      // Actualizar URLs en el contenido Novel
      novelContent = updateImageUrlsInNovelContent(novelContent, imageMap)
      
      // Si hay imagen destacada, obtener su URL actualizada
      if (markdownPost.frontMatter.featuredImage) {
        const featuredImageUrl = imageMap.get(markdownPost.frontMatter.featuredImage)
        if (featuredImageUrl) {
          markdownPost.frontMatter.featuredImage = featuredImageUrl
        }
      }
    } else {
      spinner.text = 'Sin imágenes para procesar...'
    }
    
    // 6. Crear post
    spinner.text = 'Creando post en base de datos...'
    
    const postData: CreatePostData = {
      title: markdownPost.frontMatter.title,
      slug: markdownPost.frontMatter.slug,
      content: novelContent,
      excerpt: generateExcerpt(markdownPost.content, markdownPost.frontMatter),
      status: STATUS_MAP[markdownPost.frontMatter.status] || 'DRAFT',
      language: LANGUAGE_MAP[markdownPost.frontMatter.lang] || 'ES',
      featuredImageUrl: markdownPost.frontMatter.featuredImage || null,
      categoryId,
      authorId: author.id,
      seoTitle: processSeoTitle(markdownPost.frontMatter.seoTitle),
      seoDescription: markdownPost.frontMatter.seoDescription ? 
        markdownPost.frontMatter.seoDescription.substring(0, 160) : null,
      publishedAt: ((): Date | null => {
        try {
          const raw = markdownPost.frontMatter.date
          if (!raw) return null
          const d = new Date(raw)
          return isNaN(d.getTime()) ? null : d
        } catch {
          return null
        }
      })()
    }
    
    const post = await createPost(postData)
    
    // Success
    spinner.succeed(chalk.green(`✅ Post creado: ${post.title}`))
    
    console.log('')
    console.log(chalk.blue(`📝 ID: ${post.id}`))
    console.log(chalk.blue(`🔗 Slug: ${post.slug}`))
    console.log(chalk.blue(`🌐 Idioma: ${post.language}`))
    console.log(chalk.blue(`📊 Status: ${post.status}`))
    console.log(chalk.blue(`🖼️  Imágenes subidas: ${imagesUploaded}`))
    console.log(chalk.blue(`📁 Categoría: ${primaryCategory} ${categoryCreated ? '(nueva)' : '(existente)'}`))
    console.log(chalk.blue(`👤 Autor: ${author.name || author.email}`))
    
    if (warnings.length > 0) {
      console.log('')
      console.log(chalk.yellow('⚠️  Advertencias:'))
      warnings.forEach(warning => console.log(chalk.yellow(`   - ${warning}`)))
    }
    
    console.log('')
    console.log(chalk.green('🎉 Conversión completada exitosamente'))
    
  } catch (error) {
    spinner.fail(chalk.red('❌ Error en conversión'))
    console.error('')
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error))
    
    if (error instanceof Error && error.stack) {
      console.error('')
      console.error(chalk.gray('Stack trace:'))
      console.error(chalk.gray(error.stack))
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar script
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Error fatal:'), error)
    process.exit(1)
  })
}