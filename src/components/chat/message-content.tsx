'use client'

import ReactMarkdown from 'react-markdown'

interface MessageContentProps {
  content: string
}

export function MessageContent({ content }: MessageContentProps) {
  // Para texto simple sin markdown, renderizar directamente
  const isSimpleText = !content.includes('\n') && !content.includes('*') && !content.includes('`') && !content.includes('[') && !content.includes('#')
  
  if (isSimpleText) {
    return <span className="leading-none">{content}</span>
  }
  
  return (
    <ReactMarkdown
      components={{
        // Párrafos con spacing controlado como Bond
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        // Enlaces que se abren en nueva pestaña
        a: ({ href, children, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-wine-primary underline hover:text-wine-accent transition-colors"
            {...props}
          >
            {children}
          </a>
        ),
        // Código inline
        code: ({ children, ...props }) => (
          <code
            className="bg-wine-muted/20 text-wine-primary px-1 py-0.5 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        ),
        // Bloques de código
        pre: ({ children, ...props }) => (
          <pre
            className="bg-wine-muted/20 p-3 rounded-lg overflow-x-auto font-mono text-sm"
            {...props}
          >
            {children}
          </pre>
        ),
        // Listas
        ul: ({ children, ...props }) => (
          <ul className="list-disc list-inside space-y-1" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal list-inside space-y-1" {...props}>
            {children}
          </ol>
        ),
        // Citas
        blockquote: ({ children, ...props }) => (
          <blockquote
            className="border-l-4 border-wine-primary pl-4 italic text-muted-foreground"
            {...props}
          >
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}