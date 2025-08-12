#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import chalk from 'chalk'
import ora from 'ora'

const prisma = new PrismaClient()

/**
 * Verifica si un contenido JSON tiene la estructura correcta de Novel/Tiptap
 */
function hasCorrectStructure(content: any): boolean {
  return (
    content &&
    typeof content === 'object' &&
    content.type === 'doc' &&
    Array.isArray(content.content)
  )
}

/**
 * Convierte un contenido mal formado (array directo) a estructura correcta
 */
function fixContentStructure(content: any): any {
  if (hasCorrectStructure(content)) {
    return content // Ya está bien
  }

  // Si es un array directo, envolvarlo en un nodo "doc"
  if (Array.isArray(content)) {
    return {
      type: 'doc',
      content: content
    }
  }

  // Si es un objeto sin tipo "doc", intentar arreglarlo
  if (content && typeof content === 'object' && !content.type) {
    if (content.content && Array.isArray(content.content)) {
      return {
        type: 'doc',
        content: content.content
      }
    }
  }

  // Si no se puede arreglar, crear estructura mínima
  console.warn('⚠️  Contenido no reconocido, creando estructura mínima')
  return {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [{
        type: 'text',
        text: 'Contenido migrado (estructura no reconocida)'
      }]
    }]
  }
}

async function main() {
  const spinner = ora('Buscando posts con contenido mal formado...').start()
  
  try {
    // Obtener todos los posts
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
      }
    })

    spinner.text = `Analizando ${posts.length} posts...`

    const postsToFix: Array<{ id: string, title: string, originalContent: any, fixedContent: any }> = []

    // Analizar cada post
    for (const post of posts) {
      if (!hasCorrectStructure(post.content)) {
        const fixedContent = fixContentStructure(post.content)
        postsToFix.push({
          id: post.id,
          title: post.title,
          originalContent: post.content,
          fixedContent
        })
      }
    }

    if (postsToFix.length === 0) {
      spinner.succeed(chalk.green('✅ Todos los posts tienen estructura correcta'))
      console.log(chalk.blue(`📊 ${posts.length} posts analizados, ninguno necesita reparación`))
      return
    }

    spinner.text = `Reparando ${postsToFix.length} posts...`

    // Mostrar qué posts se van a arreglar
    console.log('')
    console.log(chalk.yellow(`⚠️  Encontrados ${postsToFix.length} posts con estructura incorrecta:`))
    postsToFix.forEach((post, index) => {
      console.log(chalk.gray(`   ${index + 1}. ${post.title} (${post.id})`))
    })
    console.log('')

    // Confirmar reparación
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const shouldFix = await new Promise<boolean>((resolve) => {
      readline.question(chalk.cyan('¿Continuar con la reparación? (y/N): '), (answer: string) => {
        readline.close()
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
      })
    })

    if (!shouldFix) {
      spinner.info(chalk.blue('Reparación cancelada por el usuario'))
      return
    }

    spinner.start('Reparando posts...')

    // Reparar posts uno por uno
    let repaired = 0
    for (const post of postsToFix) {
      try {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            content: post.fixedContent as any
          }
        })
        repaired++
        spinner.text = `Reparando posts... (${repaired}/${postsToFix.length})`
      } catch (error) {
        console.error(chalk.red(`❌ Error reparando post "${post.title}":`, error))
      }
    }

    spinner.succeed(chalk.green(`✅ Reparación completada`))
    
    console.log('')
    console.log(chalk.green(`🎉 ${repaired} posts reparados exitosamente`))
    console.log(chalk.blue('📝 Los posts ahora deberían cargarse correctamente en el editor'))

    if (repaired < postsToFix.length) {
      console.log(chalk.yellow(`⚠️  ${postsToFix.length - repaired} posts no pudieron ser reparados`))
    }
    
  } catch (error) {
    spinner.fail(chalk.red('❌ Error durante la reparación'))
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