'use client'

import { useMemo } from 'react'
import Image from 'next/image'

// Tipos para el contenido de Novel editor
type NovelMark = {
  type: string
  attrs?: Record<string, unknown>
}

type NovelNode = {
  type: string
  text?: string
  marks?: NovelMark[]
  attrs?: Record<string, unknown>
  content?: NovelNode[]
}

interface PostContentProps {
  content: unknown // JSON from Novel editor
}

/**
 * Normaliza el contenido para asegurar estructura correcta
 */
function normalizeContent(content: unknown): NovelNode {
  if (!content) {
    return { type: 'doc', content: [] }
  }
  
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content)
      return normalizeContent(parsed)
    } catch {
      // Si es string plano, convertir a estructura de Novel
      return {
        type: 'doc',
        content: [{
          type: 'paragraph',
          content: [{
            type: 'text',
            text: content
          }]
        }]
      }
    }
  }
  
  // Si ya es objeto, verificar estructura
  if (typeof content === 'object' && content !== null) {
    const node = content as Record<string, unknown>
    return {
      type: (node.type as string) || 'doc',
      content: (node.content as NovelNode[]) || [],
      text: node.text as string | undefined,
      marks: node.marks as NovelMark[] | undefined,
      attrs: node.attrs as Record<string, unknown> | undefined,
    }
  }
  
  return { type: 'doc', content: [] }
}

/**
 * Renderiza el contenido JSON de Novel a HTML
 */
function renderNode(node: NovelNode, index: number = 0): React.ReactNode {
  if (!node) return null

  // Texto plano
  if (node.type === 'text') {
    let text: React.ReactNode = node.text
    
    // Aplicar marcas (bold, italic, etc)
    if (node.marks && Array.isArray(node.marks)) {
      node.marks.forEach((mark) => {
        switch (mark.type) {
          case 'bold':
            text = <strong key={`${index}-bold`}>{text}</strong>
            break
          case 'italic':
            text = <em key={`${index}-italic`}>{text}</em>
            break
          case 'underline':
            text = <u key={`${index}-underline`}>{text}</u>
            break
          case 'strike':
            text = <s key={`${index}-strike`}>{text}</s>
            break
          case 'code':
            text = <code key={`${index}-code`} className="px-1 py-0.5 bg-muted rounded text-sm">{text}</code>
            break
          case 'link':
            text = (
              <a 
                key={`${index}-link`}
                href={mark.attrs?.href as string} 
                target={(mark.attrs?.target as string) || '_blank'}
                rel="noopener noreferrer"
                className="text-wine-primary hover:text-wine-accent underline transition-colors"
              >
                {text}
              </a>
            )
            break
        }
      })
    }
    
    return text
  }

  // Párrafo
  if (node.type === 'paragraph') {
    return (
      <p key={index} className="mb-4">
        {node.content?.map((child, i) => renderNode(child, i))}
      </p>
    )
  }

  // Encabezados
  if (node.type === 'heading') {
    const level = (node.attrs?.level as number) || 2
    const className = level === 1 ? 'text-3xl font-bold mb-6 mt-8' :
                     level === 2 ? 'text-2xl font-bold mb-4 mt-6' :
                     level === 3 ? 'text-xl font-semibold mb-3 mt-4' :
                     'text-lg font-semibold mb-2 mt-3'
    
    const HeadingContent = <>{node.content?.map((child, i) => renderNode(child, i))}</>
    
    switch(level) {
      case 1:
        return <h1 key={index} className={className}>{HeadingContent}</h1>
      case 2:
        return <h2 key={index} className={className}>{HeadingContent}</h2>
      case 3:
        return <h3 key={index} className={className}>{HeadingContent}</h3>
      case 4:
        return <h4 key={index} className={className}>{HeadingContent}</h4>
      case 5:
        return <h5 key={index} className={className}>{HeadingContent}</h5>
      case 6:
        return <h6 key={index} className={className}>{HeadingContent}</h6>
      default:
        return <h2 key={index} className={className}>{HeadingContent}</h2>
    }
  }

  // Lista desordenada
  if (node.type === 'bulletList') {
    return (
      <ul key={index} className="list-disc list-inside mb-4 space-y-1">
        {node.content?.map((child, i) => renderNode(child, i))}
      </ul>
    )
  }

  // Lista ordenada
  if (node.type === 'orderedList') {
    return (
      <ol key={index} className="list-decimal list-inside mb-4 space-y-1">
        {node.content?.map((child, i) => renderNode(child, i))}
      </ol>
    )
  }

  // Item de lista
  if (node.type === 'listItem') {
    return (
      <li key={index}>
        {node.content?.map((child, i) => {
          // Si el hijo es un párrafo, renderizar solo su contenido
          if (child.type === 'paragraph' && child.content) {
            return child.content.map((grandchild, j) => renderNode(grandchild, j))
          }
          return renderNode(child, i)
        })}
      </li>
    )
  }

  // Blockquote
  if (node.type === 'blockquote') {
    return (
      <blockquote key={index} className="border-l-4 border-wine-primary pl-4 my-4 italic text-muted-foreground">
        {node.content?.map((child, i) => renderNode(child, i))}
      </blockquote>
    )
  }

  // Código en bloque
  if (node.type === 'codeBlock') {
    return (
      <pre key={index} className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
        <code className="text-sm">
          {node.content?.map((child, i) => 
            child.type === 'text' && child.text ? child.text : renderNode(child, i)
          )}
        </code>
      </pre>
    )
  }

  // Regla horizontal
  if (node.type === 'horizontalRule') {
    return <hr key={index} className="my-8 border-border" />
  }

  // Imagen
  if (node.type === 'image') {
    const imageSrc = node.attrs?.src as string | undefined
    const imageAlt = (node.attrs?.alt as string) || ''
    const imageTitle = node.attrs?.title as string | undefined
    
    return (
      <figure key={index} className="my-6">
        {imageSrc ? (
          <Image 
            src={imageSrc} 
            alt={imageAlt} 
            width={800}
            height={400}
            className="w-full rounded-lg"
          />
        ) : null}
        {imageTitle ? (
          <figcaption className="text-center text-sm text-muted-foreground mt-2">
            {imageTitle}
          </figcaption>
        ) : null}
      </figure>
    )
  }

  // Documento raíz
  if (node.type === 'doc') {
    return (
      <>
        {node.content?.map((child, i) => renderNode(child, i))}
      </>
    )
  }

  // Tipo no reconocido - intentar renderizar contenido
  if (node.content && Array.isArray(node.content)) {
    return (
      <>
        {node.content.map((child, i) => renderNode(child, i))}
      </>
    )
  }

  // Si no se puede renderizar, devolver null
  return null
}

export function PostContent({ content }: PostContentProps) {
  const normalizedContent = useMemo(() => normalizeContent(content), [content])
  
  return (
    <>
      {renderNode(normalizedContent)}
    </>
  )
}