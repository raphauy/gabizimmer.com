#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import chalk from 'chalk'

const prisma = new PrismaClient()

async function main() {
  console.log(chalk.blue('🔍 Inspeccionando estructura de posts...'))
  
  // Obtener posts recientes
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      content: true,
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  })

  for (const post of posts) {
    console.log('')
    console.log(chalk.cyan(`📄 Post: ${post.title}`))
    console.log(chalk.gray(`ID: ${post.id}`))
    
    // Analizar estructura del content
    const content = post.content
    console.log('Tipo:', typeof content)
    console.log('Es array?', Array.isArray(content))
    
    if (content && typeof content === 'object') {
      console.log('Tiene type?', 'type' in content ? content.type : 'NO')
      console.log('Tiene content?', 'content' in content ? Array.isArray(content.content) : 'NO')
      
      // Mostrar estructura primera parte
      const jsonStr = JSON.stringify(content, null, 2)
      console.log('Estructura:')
      console.log(jsonStr.substring(0, 300) + (jsonStr.length > 300 ? '...' : ''))
    } else {
      console.log('Contenido:', content)
    }
    
    console.log(chalk.gray('---'))
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)