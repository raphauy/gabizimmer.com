import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'

// Tipos para la estructura JSON de Novel/TipTap
interface NovelNode {
  type: string
  attrs?: Record<string, any>
  content?: NovelNode[]
  text?: string
  marks?: Array<{
    type: string
    attrs?: Record<string, any>
  }>
}

interface NovelDocument {
  type: 'doc'
  content: NovelNode[]
}

/**
 * Convierte un nodo de texto inline con sus marcas a formato Novel
 */
function convertInlineContent(node: any): NovelNode[] {
  const result: NovelNode[] = []
  
  function processNode(mdNode: any): NovelNode[] {
    switch (mdNode.type) {
      case 'text':
        return [{
          type: 'text',
          text: mdNode.value
        }]
        
      case 'strong':
        // Procesar contenido del strong
        const boldContent: NovelNode[] = []
        for (const child of mdNode.children || []) {
          const childNodes = processNode(child)
          childNodes.forEach(childNode => {
            if (childNode.type === 'text') {
              boldContent.push({
                ...childNode,
                marks: [
                  ...(childNode.marks || []),
                  { type: 'bold' }
                ]
              })
            } else {
              boldContent.push(childNode)
            }
          })
        }
        return boldContent
        
      case 'emphasis':
        // Procesar contenido del emphasis
        const italicContent: NovelNode[] = []
        for (const child of mdNode.children || []) {
          const childNodes = processNode(child)
          childNodes.forEach(childNode => {
            if (childNode.type === 'text') {
              italicContent.push({
                ...childNode,
                marks: [
                  ...(childNode.marks || []),
                  { type: 'italic' }
                ]
              })
            } else {
              italicContent.push(childNode)
            }
          })
        }
        return italicContent
        
      case 'inlineCode':
        return [{
          type: 'text',
          text: mdNode.value,
          marks: [{ type: 'code' }]
        }]
        
      case 'link':
        // Procesar contenido del link
        const linkContent: NovelNode[] = []
        for (const child of mdNode.children || []) {
          const childNodes = processNode(child)
          childNodes.forEach(childNode => {
            if (childNode.type === 'text') {
              linkContent.push({
                ...childNode,
                marks: [
                  ...(childNode.marks || []),
                  { 
                    type: 'link', 
                    attrs: { 
                      href: mdNode.url,
                      target: mdNode.url.startsWith('http') ? '_blank' : null
                    } 
                  }
                ]
              })
            } else {
              linkContent.push(childNode)
            }
          })
        }
        return linkContent
        
      case 'break':
        return [{
          type: 'hardBreak'
        }]
        
      default:
        // Para otros tipos, procesar recursivamente los hijos
        const content: NovelNode[] = []
        if (mdNode.children) {
          for (const child of mdNode.children) {
            content.push(...processNode(child))
          }
        }
        return content
    }
  }
  
  return processNode(node)
}

/**
 * Convierte un nodo de bloque markdown a formato Novel
 */
function convertBlockNode(node: any): NovelNode | NovelNode[] | null {
  switch (node.type) {
    case 'paragraph':
      const paragraphContent: NovelNode[] = []
      for (const child of node.children || []) {
        paragraphContent.push(...convertInlineContent(child))
      }
      
      return {
        type: 'paragraph',
        content: paragraphContent.length > 0 ? paragraphContent : [{ type: 'text', text: '' }]
      }
      
    case 'heading':
      const headingContent: NovelNode[] = []
      for (const child of node.children || []) {
        headingContent.push(...convertInlineContent(child))
      }
      
      return {
        type: 'heading',
        attrs: { level: Math.min(6, Math.max(1, node.depth)) },
        content: headingContent.length > 0 ? headingContent : [{ type: 'text', text: '' }]
      }
      
    case 'blockquote':
      const blockquoteContent: NovelNode[] = []
      for (const child of node.children || []) {
        const converted = convertBlockNode(child)
        if (converted) {
          if (Array.isArray(converted)) {
            blockquoteContent.push(...converted)
          } else {
            blockquoteContent.push(converted)
          }
        }
      }
      
      return {
        type: 'blockquote',
        content: blockquoteContent
      }
      
    case 'code':
      return {
        type: 'codeBlock',
        attrs: { language: node.lang || null },
        content: [{
          type: 'text',
          text: node.value || ''
        }]
      }
      
    case 'list':
      const listItems: NovelNode[] = []
      for (const listItem of node.children || []) {
        if (listItem.type === 'listItem') {
          const listItemContent: NovelNode[] = []
          for (const child of listItem.children || []) {
            const converted = convertBlockNode(child)
            if (converted) {
              if (Array.isArray(converted)) {
                listItemContent.push(...converted)
              } else {
                listItemContent.push(converted)
              }
            }
          }
          
          listItems.push({
            type: 'listItem',
            content: listItemContent
          })
        }
      }
      
      return {
        type: node.ordered ? 'orderedList' : 'bulletList',
        content: listItems
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
      
    case 'thematicBreak':
      return {
        type: 'horizontalRule'
      }
      
    case 'html':
      // Para HTML crudo, intentar parsearlo como párrafo
      if (node.value && typeof node.value === 'string') {
        return {
          type: 'paragraph',
          content: [{
            type: 'text',
            text: node.value.replace(/<[^>]*>/g, '') // Strip HTML tags
          }]
        }
      }
      return null
      
    default:
      // Para tipos desconocidos, intentar procesar como párrafo si tiene contenido de texto
      if (node.value && typeof node.value === 'string') {
        return {
          type: 'paragraph',
          content: [{
            type: 'text',
            text: node.value
          }]
        }
      }
      
      // Si tiene hijos, intentar procesarlos recursivamente
      if (node.children) {
        const childNodes: NovelNode[] = []
        for (const child of node.children) {
          const converted = convertBlockNode(child)
          if (converted) {
            if (Array.isArray(converted)) {
              childNodes.push(...converted)
            } else {
              childNodes.push(converted)
            }
          }
        }
        return childNodes
      }
      
      return null
  }
}

/**
 * Convierte contenido markdown a estructura JSON de Novel/TipTap
 */
export async function convertToNovel(markdown: string): Promise<NovelDocument> {
  if (!markdown || markdown.trim() === '') {
    return {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: '' }]
      }]
    }
  }
  
  try {
    // Configurar el procesador de markdown
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
    
    // Parsear el markdown a AST
    const ast = processor.parse(markdown)
    
    // Convertir el AST a estructura Novel
    const novelDoc: NovelDocument = {
      type: 'doc',
      content: []
    }
    
    // Procesar cada nodo hijo del root
    for (const node of ast.children || []) {
      const converted = convertBlockNode(node)
      if (converted) {
        if (Array.isArray(converted)) {
          novelDoc.content.push(...converted)
        } else {
          novelDoc.content.push(converted)
        }
      }
    }
    
    // Si no hay contenido, agregar un párrafo vacío
    if (novelDoc.content.length === 0) {
      novelDoc.content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: '' }]
      })
    }
    
    return novelDoc
    
  } catch (error) {
    console.error('Error converting markdown to Novel:', error)
    
    // Fallback: crear un documento con el markdown como texto plano
    return {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{
          type: 'text',
          text: markdown
        }]
      }]
    }
  }
}