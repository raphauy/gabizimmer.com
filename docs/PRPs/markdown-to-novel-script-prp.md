# PRP: Script de Conversión Markdown a Novel JSON

## Goal
Crear un script TypeScript CLI que tome un archivo markdown de post migrado como input, lo transforme al formato JSON de Novel (TipTap), suba las imágenes a Vercel Blob, y cree el post en la base de datos utilizando los servicios existentes del proyecto.

## Why
- **Valor de negocio**: Permite migrar contenido histórico de Gabi Zimmer (~100+ posts) desde WordPress al nuevo blog
- **Eficiencia**: Automatiza la conversión manual que tomaría horas por post
- **Validación incremental**: Permite probar con un post individual antes de migración masiva
- **Preservación de contenido**: Mantiene todo el contenido histórico, metadata y estructura original

## What
Script de línea de comandos que acepta la ruta de un archivo markdown y:
1. Parsea el front matter YAML con metadata del post
2. Convierte el contenido markdown a estructura JSON de Novel/TipTap
3. Sube imágenes locales a Vercel Blob y actualiza URLs
4. Crea o reutiliza categorías según metadata
5. Inserta el post en la base de datos con todos los campos mapeados

### Success Criteria
- [ ] Script ejecutable vía `pnpm run convert:post <path-to-markdown>`
- [ ] Conversión completa de markdown a JSON Novel con todos los elementos soportados
- [ ] Imágenes subidas a Vercel Blob con URLs actualizadas en el contenido
- [ ] Categorías creadas automáticamente si no existen
- [ ] Post creado en BD con validaciones Zod pasando
- [ ] Salida detallada mostrando progreso y resultado final
- [ ] Manejo de errores robusto con mensajes claros

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Reglas arquitectónicas estrictas del proyecto
  
- file: prisma/schema.prisma
  why: Modelo Post completo con campos y relaciones
  
- file: src/services/post-service.ts
  why: Servicio principal con validaciones y funciones de creación
  
- file: src/services/upload-service.ts
  why: Sistema de upload a Vercel Blob para imágenes
  
- file: src/services/category-service.ts
  why: CRUD de categorías para crear/verificar
  
- file: src/app/admin/posts/actions.ts
  why: Ejemplos de uso real de los servicios
  
- file: docs/resources/migrated-posts/2019-07-22-que-importa-realmente-al-comprar-un-vino.md
  why: Ejemplo de estructura markdown con front matter
  
- file: docs/resources/migrated-posts/2019-07-27-los-vinos-de-produccion-limitada.md
  why: Segundo ejemplo para validar patrones
  
- url: https://github.com/tiptap/tiptap/blob/main/docs/api/documents.md
  why: Estructura JSON de TipTap/ProseMirror
  section: "Document Structure"
  
- url: https://www.npmjs.com/package/gray-matter
  why: Parseo de front matter YAML
  
- url: https://github.com/syntax-tree/mdast
  why: AST de markdown para conversión
```

### Current Codebase Tree
```bash
src/
├── services/
│   ├── post-service.ts       # createPost, validaciones Zod
│   ├── upload-service.ts     # uploadFeaturedImage, uploadContentImage
│   └── category-service.ts   # getAllCategories, createCategory
├── app/admin/posts/
│   ├── post-editor.tsx       # Editor Novel con estructura JSON
│   └── actions.ts           # Server actions usando servicios
scripts/
├── README.md                # Documentación de migración
└── output/                  # Posts markdown migrados
    ├── *.md                # Archivos markdown
    └── images/             # Imágenes locales
```

### Desired Codebase Tree
```bash
scripts/
├── convert-markdown-to-novel.ts  # Script principal
├── lib/
│   ├── markdown-parser.ts       # Parseo y conversión
│   ├── novel-converter.ts       # Markdown → JSON Novel
│   └── image-processor.ts       # Upload y reemplazo URLs
└── output/                       # Existente
```

### Known Gotchas & Patterns

```typescript
// CRITICAL: Arquitectura en capas - SOLO services/ importa Prisma
// Script NO debe importar @/lib/prisma directamente

// PATTERN: Estructura front matter de posts migrados
interface FrontMatter {
  title: string           // "Título del post"
  date: string           // "2019-07-22 07:01:32"
  modified?: string      // "2019-07-27 09:57:48"
  slug: string           // "slug-del-post"
  excerpt?: string       // Puede estar vacío ""
  status: string         // "published" → mapear a PostStatus
  author: string         // "Gabi Zimmer" → obtener authorId
  categories: string[]   // ["Vinos", "Cultura"] → crear si no existen
  tags?: string[]        // No implementado aún en el sistema
  originalId?: number    // ID de WordPress, guardar en metadata si es posible
  lang: "en" | "es"      // Mapear a Language enum
  seoTitle?: string      // "%%title%% extra" → procesar
  seoDescription?: string
  featuredImage?: string // "./images/imagen.jpg" → subir y obtener URL
}

// PATTERN: Estructura JSON de Novel/TipTap
interface NovelDocument {
  type: "doc",
  content: NovelNode[]
}

interface NovelNode {
  type: "paragraph" | "heading" | "image" | "blockquote" | "bulletList" | "orderedList" | "codeBlock"
  attrs?: Record<string, any>
  content?: NovelNode[]
  text?: string
  marks?: Array<{
    type: "bold" | "italic" | "link" | "code"
    attrs?: Record<string, any>
  }>
}

// GOTCHA: Validación de slug única por idioma
// post-service.ts ya tiene isSlugUnique(slug, language)

// GOTCHA: AuthorId hardcodeado para Gabi
// Obtener de BD o usar ID conocido de seed

// PATTERN: Imágenes relativas → URLs absolutas
// De: ./images/wine.jpg
// A: https://[blob-store].public.blob.vercel-storage.com/blog/featured/[postId]-[timestamp].jpg
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// 1. Tipos para el script
interface MarkdownPost {
  frontMatter: FrontMatter
  content: string
  images: string[] // Rutas de imágenes encontradas
}

interface ConversionResult {
  postId: string
  title: string
  slug: string
  imagesUploaded: number
  categoryCreated: boolean
  warnings: string[]
}

// 2. Mapeo de status
const STATUS_MAP: Record<string, PostStatus> = {
  'published': 'PUBLISHED',
  'draft': 'DRAFT',
  'private': 'DRAFT',
  'trash': 'ARCHIVED'
}

// 3. Mapeo de idioma
const LANGUAGE_MAP: Record<string, Language> = {
  'es': 'ES',
  'en': 'EN',
  'spanish': 'ES',
  'english': 'EN'
}
```

### Task List (Orden de Implementación)

```yaml
Task 1: Setup del Script Base
CREATE scripts/convert-markdown-to-novel.ts:
  - Configurar script CLI con argumentos
  - Validar archivo existe y es .md
  - Setup de Prisma Client
  - Manejo de errores global

Task 2: Parser de Markdown
CREATE scripts/lib/markdown-parser.ts:
  - Usar gray-matter para extraer front matter
  - Extraer imágenes del contenido (regex)
  - Normalizar paths de imágenes
  - Retornar MarkdownPost estructurado

Task 3: Conversor a Novel JSON
CREATE scripts/lib/novel-converter.ts:
  - Instalar: unified, remark-parse, remark-gfm
  - Parsear markdown a AST
  - Convertir AST a estructura Novel/TipTap
  - Manejar: párrafos, headings, listas, blockquotes, imágenes, links
  - Preservar formato (bold, italic, code)

Task 4: Procesador de Imágenes
CREATE scripts/lib/image-processor.ts:
  - Leer archivo de imagen local
  - Convertir a Buffer/Blob
  - Usar uploadFeaturedImage para imagen principal
  - Usar uploadContentImage para imágenes en contenido
  - Retornar mapping oldUrl → newUrl
  - Actualizar URLs en JSON Novel

Task 5: Gestión de Categorías
EXTEND scripts/convert-markdown-to-novel.ts:
  - Importar getAllCategories, createCategory
  - Buscar categorías por nombre (normalizado)
  - Crear categorías faltantes con slug generado
  - Obtener categoryId para el post

Task 6: Obtención de Author
EXTEND scripts/convert-markdown-to-novel.ts:
  - Query directo a Prisma para obtener usuario Gabi
  - Fallback a primer superadmin si no se encuentra
  - Validar que existe antes de crear post

Task 7: Creación del Post
INTEGRATE en script principal:
  - Mapear todos los campos de front matter
  - Procesar seoTitle (remover %%title%%)
  - Calcular excerpt si está vacío (primeros 160 chars)
  - Llamar createPost del servicio
  - Manejar errores de validación Zod

Task 8: Feedback y Logging
ADD a script principal:
  - Spinner/progress para cada paso
  - Colores en terminal (chalk o similar)
  - Resumen final con estadísticas
  - Guardar log de conversión

Task 9: Configuración package.json
MODIFY package.json:
  - ADD script: "convert:post": "tsx scripts/convert-markdown-to-novel.ts"
  - Verificar dependencias necesarias

Task 10: Testing y Validación
CREATE scripts/test-conversion.ts:
  - Test con post de ejemplo
  - Verificar estructura JSON generada
  - Validar imágenes subidas
  - Confirmar post en BD
```

### Per-Task Pseudocode

```typescript
// Task 1: Setup del Script Base
// scripts/convert-markdown-to-novel.ts
import { PrismaClient } from '@prisma/client'
import { parseMarkdown } from './lib/markdown-parser'
import { convertToNovel } from './lib/novel-converter'
import { processImages } from './lib/image-processor'
import { createPost } from '@/services/post-service'
import { getAllCategories, createCategory } from '@/services/category-service'
import chalk from 'chalk'
import ora from 'ora'

const prisma = new PrismaClient()

async function main() {
  const filePath = process.argv[2]
  
  if (!filePath) {
    console.error(chalk.red('❌ Uso: pnpm run convert:post <path-to-markdown>'))
    process.exit(1)
  }
  
  const spinner = ora('Iniciando conversión...').start()
  
  try {
    // 1. Parsear markdown
    spinner.text = 'Parseando archivo markdown...'
    const markdownPost = await parseMarkdown(filePath)
    
    // 2. Convertir a Novel JSON
    spinner.text = 'Convirtiendo a formato Novel...'
    let novelContent = await convertToNovel(markdownPost.content)
    
    // 3. Procesar imágenes
    spinner.text = 'Subiendo imágenes a Vercel Blob...'
    const imageMap = await processImages(markdownPost.images, 'temp-post-id')
    novelContent = updateImageUrls(novelContent, imageMap)
    
    // 4. Gestionar categorías
    spinner.text = 'Verificando categorías...'
    const categoryId = await ensureCategory(markdownPost.frontMatter.categories[0])
    
    // 5. Obtener author
    const author = await prisma.user.findFirst({
      where: { email: 'gabi@gabizimmer.com' }
    })
    
    // 6. Crear post
    spinner.text = 'Creando post en base de datos...'
    const post = await createPost({
      title: markdownPost.frontMatter.title,
      slug: markdownPost.frontMatter.slug,
      content: novelContent,
      excerpt: markdownPost.frontMatter.excerpt || null,
      status: mapStatus(markdownPost.frontMatter.status),
      language: mapLanguage(markdownPost.frontMatter.lang),
      featuredImageUrl: imageMap.get(markdownPost.frontMatter.featuredImage),
      categoryId,
      authorId: author.id,
      seoTitle: processSeoTitle(markdownPost.frontMatter.seoTitle),
      seoDescription: markdownPost.frontMatter.seoDescription
    })
    
    spinner.succeed(chalk.green(`✅ Post creado: ${post.title}`))
    console.log(chalk.blue(`📝 ID: ${post.id}`))
    console.log(chalk.blue(`🔗 Slug: ${post.slug}`))
    console.log(chalk.blue(`🖼️  Imágenes subidas: ${imageMap.size}`))
    
  } catch (error) {
    spinner.fail(chalk.red('❌ Error en conversión'))
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Task 3: Conversor a Novel JSON
// scripts/lib/novel-converter.ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'

export async function convertToNovel(markdown: string): Promise<any> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
  
  const ast = processor.parse(markdown)
  
  // Convertir AST de markdown a estructura Novel
  const novelDoc = {
    type: 'doc',
    content: []
  }
  
  function convertNode(node: any): any {
    switch (node.type) {
      case 'paragraph':
        return {
          type: 'paragraph',
          content: node.children.map(convertInline)
        }
      
      case 'heading':
        return {
          type: 'heading',
          attrs: { level: node.depth },
          content: node.children.map(convertInline)
        }
      
      case 'image':
        return {
          type: 'image',
          attrs: {
            src: node.url,
            alt: node.alt || '',
            title: node.title || null
          }
        }
      
      case 'blockquote':
        return {
          type: 'blockquote',
          content: node.children.map(convertNode)
        }
      
      case 'list':
        return {
          type: node.ordered ? 'orderedList' : 'bulletList',
          content: node.children.map(item => ({
            type: 'listItem',
            content: item.children.map(convertNode)
          }))
        }
      
      default:
        // Manejo de otros tipos
        return null
    }
  }
  
  function convertInline(node: any): any {
    if (node.type === 'text') {
      return { type: 'text', text: node.value }
    }
    
    if (node.type === 'strong') {
      return {
        type: 'text',
        text: node.children[0].value,
        marks: [{ type: 'bold' }]
      }
    }
    
    if (node.type === 'emphasis') {
      return {
        type: 'text',
        text: node.children[0].value,
        marks: [{ type: 'italic' }]
      }
    }
    
    if (node.type === 'link') {
      return {
        type: 'text',
        text: node.children[0].value,
        marks: [{
          type: 'link',
          attrs: { href: node.url }
        }]
      }
    }
    
    return { type: 'text', text: '' }
  }
  
  // Procesar todos los nodos
  visit(ast, (node) => {
    const converted = convertNode(node)
    if (converted) {
      novelDoc.content.push(converted)
    }
  })
  
  return novelDoc
}

// Task 4: Procesador de Imágenes
// scripts/lib/image-processor.ts
import { readFileSync } from 'fs'
import { join, dirname, basename } from 'path'
import { uploadFeaturedImage, uploadContentImage } from '@/services/upload-service'

export async function processImages(
  imagePaths: string[],
  postId: string,
  markdownDir: string
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>()
  
  for (const imagePath of imagePaths) {
    try {
      // Construir path completo
      const fullPath = join(dirname(markdownDir), imagePath.replace('./', ''))
      
      // Leer archivo
      const fileBuffer = readFileSync(fullPath)
      const fileName = basename(fullPath)
      
      // Crear File object
      const file = new File([fileBuffer], fileName, {
        type: `image/${fileName.split('.').pop()}`
      })
      
      // Determinar si es imagen destacada o de contenido
      const isFeatured = imagePath.includes('featured') || imagePaths.indexOf(imagePath) === 0
      
      // Subir a Vercel Blob
      const uploadedUrl = isFeatured
        ? await uploadFeaturedImage(file, postId)
        : await uploadContentImage(file, postId)
      
      // Guardar mapping
      imageMap.set(imagePath, uploadedUrl)
      
      console.log(chalk.gray(`  ✓ ${fileName} → ${uploadedUrl}`))
    } catch (error) {
      console.warn(chalk.yellow(`  ⚠ No se pudo procesar: ${imagePath}`))
    }
  }
  
  return imageMap
}
```

### Integration Points
```yaml
DATABASE:
  - Prisma Client para obtener author (Gabi)
  - Transacciones para atomicidad si es necesario
  
SERVICES:
  - post-service: createPost con validaciones
  - category-service: getAllCategories, createCategory
  - upload-service: uploadFeaturedImage, uploadContentImage
  
ENVIRONMENT:
  - BLOB_READ_WRITE_TOKEN debe estar configurado
  - DATABASE_URL para conexión Prisma
  
FILES:
  - Markdown en: docs/resources/migrated-posts/*.md
  - Imágenes en: docs/resources/migrated-posts/images/
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Verificar sintaxis TypeScript
pnpm run typecheck
# Expected: 0 errores en scripts/
```

### Level 2: Dependencias
```bash
# Instalar dependencias necesarias
pnpm add -D unified remark-parse remark-gfm unist-util-visit chalk ora
pnpm add -D @types/unist
# Already installed: gray-matter, @prisma/client
```

### Level 3: Test con Post de Ejemplo
```bash
# Ejecutar con un post de prueba
pnpm run convert:post docs/resources/migrated-posts/2019-07-22-que-importa-realmente-al-comprar-un-vino.md

# Expected output:
# ✅ Post creado: ¿Qué importa realmente al comprar un vino?
# 📝 ID: [cuid]
# 🔗 Slug: que-importa-realmente-al-comprar-un-vino
# 🖼️ Imágenes subidas: 2
```

### Level 4: Verificación en BD
```bash
# Verificar post creado
pnpm prisma studio
# Navegar a tabla Post y verificar:
# - content es JSON válido de Novel
# - featuredImageUrl apunta a Vercel Blob
# - category relacionada existe
# - author es Gabi
```

### Level 5: Validación de Contenido
```typescript
// Verificar estructura JSON generada
const post = await prisma.post.findUnique({ where: { slug } })
console.log(JSON.stringify(post.content, null, 2))

// Expected: Estructura válida de Novel/TipTap
{
  "type": "doc",
  "content": [
    { "type": "paragraph", "content": [...] },
    { "type": "heading", "attrs": { "level": 2 }, "content": [...] },
    { "type": "image", "attrs": { "src": "https://..." } }
  ]
}
```

## Final Checklist

### Funcionalidad Core
- [ ] Script acepta path de archivo markdown como argumento
- [ ] Parsea correctamente front matter YAML
- [ ] Convierte markdown a JSON Novel con todos los elementos
- [ ] Sube imágenes a Vercel Blob exitosamente
- [ ] Actualiza URLs de imágenes en el contenido
- [ ] Crea o reutiliza categorías según metadata
- [ ] Inserta post en BD con validaciones pasando

### Calidad & Robustez
- [ ] Manejo de errores con mensajes claros
- [ ] Logging detallado del progreso
- [ ] Validación de archivos antes de procesar
- [ ] Rollback parcial si falla algún paso
- [ ] No importa Prisma fuera de lo permitido
- [ ] Sigue arquitectura en capas del proyecto

### Experiencia de Usuario
- [ ] Comando simple: `pnpm run convert:post <file>`
- [ ] Feedback visual con spinner y colores
- [ ] Resumen final con métricas
- [ ] Mensajes de error útiles
- [ ] Documentación de uso en scripts/README.md

## Anti-Patterns to Avoid

### Arquitectura
- ❌ NO importar `@/lib/prisma` en el script principal
- ❌ NO crear queries Prisma complejas, usar servicios
- ❌ NO modificar servicios existentes sin necesidad
- ❌ NO hardcodear IDs o valores específicos

### Conversión
- ❌ NO perder formato (bold, italic, links) en conversión
- ❌ NO ignorar imágenes o dejarlas con paths locales
- ❌ NO crear posts sin categoría (es requerida)
- ❌ NO asumir estructura de markdown, validar primero

### Manejo de Errores
- ❌ NO fallar silenciosamente
- ❌ NO dejar imágenes huérfanas en Blob si falla el post
- ❌ NO continuar si faltan campos requeridos
- ❌ NO sobrescribir posts existentes sin confirmación

## Score de Confianza: 9/10

Este PRP proporciona:
- ✅ Contexto exhaustivo con archivos específicos a leer
- ✅ Estructura detallada del script y librerías auxiliares
- ✅ Ejemplos de código reales del proyecto
- ✅ Mapeo completo de campos y transformaciones
- ✅ Validaciones y testing paso a paso
- ✅ Consideraciones de arquitectura del proyecto

El único punto pendiente es la investigación exacta de la mejor librería para conversión markdown→TipTap, pero se proporcionan alternativas viables.