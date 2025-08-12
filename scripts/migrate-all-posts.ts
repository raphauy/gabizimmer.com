#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { readdirSync, existsSync } from 'fs'
import { join, basename } from 'path'
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

interface MigrationResult {
  postId: string
  title: string
  slug: string
  status: 'success' | 'error' | 'skipped'
  error?: string
  imagesUploaded: number
  categoryCreated: boolean
}

interface MigrationStats {
  totalFiles: number
  processed: number
  successful: number
  errors: number
  skipped: number
  categoriesCreated: number
  imagesUploaded: number
  startTime: Date
  endTime?: Date
}

const prisma = new PrismaClient()

/**
 * Obtiene todos los archivos markdown del directorio
 */
function getMarkdownFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    throw new Error(`Directorio no encontrado: ${directory}`)
  }
  
  const files = readdirSync(directory)
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => join(directory, file))
    .sort() // Ordenar para migración consistente
}

/**
 * Obtiene los slugs de posts ya existentes en la BD
 */
async function getExistingSlugs(): Promise<Set<string>> {
  const existingPosts = await prisma.post.findMany({
    select: { slug: true }
  })
  
  return new Set(existingPosts.map(post => post.slug))
}

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
function generateExcerpt(content: string, frontMatter: any): string | null {
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
async function ensureCategory(categoryName: string, stats: MigrationStats): Promise<string> {
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
  
  stats.categoriesCreated++
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

/**
 * Convierte un archivo markdown individual
 */
async function convertSinglePost(
  filePath: string,
  existingSlugs: Set<string>,
  author: any,
  stats: MigrationStats
): Promise<MigrationResult> {
  const fileName = basename(filePath)
  
  try {
    // 1. Parsear markdown
    const markdownPost = await parseMarkdown(filePath)
    
    // Verificar si el post ya existe
    if (existingSlugs.has(markdownPost.frontMatter.slug)) {
      return {
        postId: '',
        title: markdownPost.frontMatter.title,
        slug: markdownPost.frontMatter.slug,
        status: 'skipped',
        error: 'Post ya existe en la base de datos',
        imagesUploaded: 0,
        categoryCreated: false
      }
    }
    
    // 2. Convertir a Novel JSON
    let novelContent = await convertToNovel(markdownPost.content)
    
    // 3. Gestionar categorías
    const primaryCategory = markdownPost.frontMatter.categories[0]
    if (!primaryCategory) {
      throw new Error('El post debe tener al menos una categoría')
    }
    const categoryId = await ensureCategory(primaryCategory, stats)
    
    // 4. Procesar imágenes
    const imagesUploaded = markdownPost.images.length
    let imageMap = new Map<string, string>()
    
    if (imagesUploaded > 0) {
      // Generar ID temporal para las imágenes
      const tempPostId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
      
      stats.imagesUploaded += imagesUploaded
    }
    
    // 5. Crear post
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
    
    // Agregar slug a existentes para evitar duplicados en el mismo lote
    existingSlugs.add(post.slug)
    
    return {
      postId: post.id,
      title: post.title,
      slug: post.slug,
      status: 'success',
      imagesUploaded,
      categoryCreated: false // Se cuenta en stats globales
    }
    
  } catch (error) {
    return {
      postId: '',
      title: fileName,
      slug: '',
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido',
      imagesUploaded: 0,
      categoryCreated: false
    }
  }
}

/**
 * Muestra el progreso de la migración
 */
function displayProgress(stats: MigrationStats, current: number, total: number, currentFile: string) {
  const percentage = Math.round((current / total) * 100)
  const elapsed = Date.now() - stats.startTime.getTime()
  const avgTimePerFile = current > 0 ? elapsed / current : 0
  const estimatedTotal = avgTimePerFile * total
  const remaining = estimatedTotal - elapsed
  
  console.log(`\n${chalk.blue('📊 Progreso:')} ${current}/${total} (${percentage}%)`)
  console.log(`${chalk.green('✅ Exitosos:')} ${stats.successful}`)
  console.log(`${chalk.yellow('⚠️ Omitidos:')} ${stats.skipped}`)
  console.log(`${chalk.red('❌ Errores:')} ${stats.errors}`)
  console.log(`${chalk.blue('🖼️ Imágenes:')} ${stats.imagesUploaded}`)
  console.log(`${chalk.blue('📁 Categorías nuevas:')} ${stats.categoriesCreated}`)
  console.log(`${chalk.gray('⏱️ Tiempo estimado restante:')} ${Math.round(remaining / 1000)}s`)
  console.log(`${chalk.gray('📄 Actual:')} ${basename(currentFile)}`)
}

/**
 * Muestra el resumen final
 */
function displayFinalSummary(stats: MigrationStats, results: MigrationResult[]) {
  const duration = ((stats.endTime!.getTime() - stats.startTime.getTime()) / 1000).toFixed(1)
  
  console.log('\n' + chalk.green('🎉 MIGRACIÓN COMPLETADA') + '\n')
  
  console.log(`${chalk.blue('📊 Estadísticas finales:')}`)
  console.log(`   Total archivos: ${stats.totalFiles}`)
  console.log(`   Procesados: ${stats.processed}`)
  console.log(`   ${chalk.green('✅ Exitosos: ' + stats.successful)}`)
  console.log(`   ${chalk.yellow('⚠️ Omitidos: ' + stats.skipped)}`)
  console.log(`   ${chalk.red('❌ Errores: ' + stats.errors)}`)
  console.log(`   🖼️ Imágenes subidas: ${stats.imagesUploaded}`)
  console.log(`   📁 Categorías creadas: ${stats.categoriesCreated}`)
  console.log(`   ⏱️ Tiempo total: ${duration}s\n`)
  
  // Mostrar errores si los hay
  const errorResults = results.filter(r => r.status === 'error')
  if (errorResults.length > 0) {
    console.log(chalk.red('❌ Posts con errores:'))
    errorResults.forEach(result => {
      console.log(`   ${chalk.red('•')} ${result.title}: ${result.error}`)
    })
    console.log('')
  }
  
  // Mostrar algunos posts exitosos
  const successResults = results.filter(r => r.status === 'success').slice(0, 5)
  if (successResults.length > 0) {
    console.log(chalk.green('✅ Algunos posts migrados exitosamente:'))
    successResults.forEach(result => {
      console.log(`   ${chalk.green('•')} ${result.title} (${result.slug})`)
    })
    if (stats.successful > 5) {
      console.log(`   ${chalk.gray(`... y ${stats.successful - 5} más`)}`)
    }
  }
}

async function main() {
  const postsDirectory = 'docs/resources/migrated-posts'
  const spinner = ora('Preparando migración masiva...').start()
  
  try {
    // 1. Obtener archivos markdown
    spinner.text = 'Escaneando archivos markdown...'
    const markdownFiles = getMarkdownFiles(postsDirectory)
    
    if (markdownFiles.length === 0) {
      spinner.fail(chalk.yellow('No se encontraron archivos markdown para migrar'))
      return
    }
    
    // 2. Obtener posts existentes
    spinner.text = 'Verificando posts existentes en base de datos...'
    const existingSlugs = await getExistingSlugs()
    
    // 3. Obtener autor
    spinner.text = 'Verificando autor...'
    const author = await getGabiAuthor()
    
    spinner.succeed(chalk.green(`Preparación completa. ${markdownFiles.length} archivos encontrados, ${existingSlugs.size} posts ya existen.`))
    
    // Inicializar estadísticas
    const stats: MigrationStats = {
      totalFiles: markdownFiles.length,
      processed: 0,
      successful: 0,
      errors: 0,
      skipped: 0,
      categoriesCreated: 0,
      imagesUploaded: 0,
      startTime: new Date()
    }
    
    const results: MigrationResult[] = []
    
    console.log(`\n${chalk.blue('🚀 Iniciando migración de ' + markdownFiles.length + ' posts...')}\n`)
    
    // 4. Procesar cada archivo
    for (let i = 0; i < markdownFiles.length; i++) {
      const filePath = markdownFiles[i]
      const fileName = basename(filePath)
      
      displayProgress(stats, i, markdownFiles.length, filePath)
      
      const result = await convertSinglePost(filePath, existingSlugs, author, stats)
      results.push(result)
      
      // Actualizar estadísticas
      stats.processed++
      switch (result.status) {
        case 'success':
          stats.successful++
          console.log(`${chalk.green('✅')} ${result.title}`)
          break
        case 'error':
          stats.errors++
          console.log(`${chalk.red('❌')} ${fileName}: ${result.error}`)
          break
        case 'skipped':
          stats.skipped++
          console.log(`${chalk.yellow('⚠️')} ${result.title}: ${result.error}`)
          break
      }
      
      // Pequeña pausa para no sobrecargar la BD
      if (i < markdownFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    stats.endTime = new Date()
    displayFinalSummary(stats, results)
    
  } catch (error) {
    spinner.fail(chalk.red('❌ Error durante la migración'))
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