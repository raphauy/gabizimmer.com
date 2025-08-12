"use client"

import { useState } from "react"
import { 
  EditorRoot, 
  EditorContent, 
  EditorCommand,
  EditorCommandList,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorBubble,
  EditorBubbleItem,
  handleCommandNavigation,
  useEditor,
  type JSONContent 
} from "novel"
import { useDebouncedCallback } from "use-debounce"
import { uploadContentImage } from "@/services/upload-service"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { defaultExtensions, suggestionItems } from "./extensions"
import { Bold, Italic, Underline, Code, Link, Strikethrough, Type, Heading2, Heading3, List, ListOrdered, Quote, CheckSquare } from "lucide-react"

// Componente para el Bubble Menu con estados activos
function BubbleMenuContent() {
  const { editor } = useEditor()
  
  if (!editor) return null

  const formatItems = [
    // Headers
    {
      type: 'header',
      name: 'h2',
      icon: Heading2,
      isActive: () => editor.isActive('heading', { level: 2 }),
      command: () => {
        if (editor.isActive('heading', { level: 2 })) {
          editor.chain().focus().setParagraph().run()
        } else {
          editor.chain().focus().setHeading({ level: 2 }).run()
        }
      }
    },
    {
      type: 'header',
      name: 'h3', 
      icon: Heading3,
      isActive: () => editor.isActive('heading', { level: 3 }),
      command: () => {
        if (editor.isActive('heading', { level: 3 })) {
          editor.chain().focus().setParagraph().run()
        } else {
          editor.chain().focus().setHeading({ level: 3 }).run()
        }
      }
    },
    // Listas y citas
    {
      type: 'list',
      name: 'bulletList',
      icon: List,
      isActive: () => editor.isActive('bulletList'),
      command: () => editor.chain().focus().toggleBulletList().run()
    },
    {
      type: 'list',
      name: 'orderedList',
      icon: ListOrdered, 
      isActive: () => editor.isActive('orderedList'),
      command: () => editor.chain().focus().toggleOrderedList().run()
    },
    {
      type: 'list',
      name: 'blockquote',
      icon: Quote,
      isActive: () => editor.isActive('blockquote'),
      command: () => editor.chain().focus().toggleBlockquote().run()
    },
    {
      type: 'list',
      name: 'taskList',
      icon: CheckSquare,
      isActive: () => editor.isActive('taskList'),
      command: () => editor.chain().focus().toggleTaskList().run()
    },
    // Formato de texto
    {
      type: 'format',
      name: 'bold',
      icon: Bold,
      isActive: () => editor.isActive('bold'),
      command: () => editor.chain().focus().toggleBold().run()
    },
    {
      type: 'format',
      name: 'italic',
      icon: Italic,
      isActive: () => editor.isActive('italic'),
      command: () => editor.chain().focus().toggleItalic().run()
    },
    {
      type: 'format',
      name: 'underline',
      icon: Underline,
      isActive: () => editor.isActive('underline'),
      command: () => editor.chain().focus().toggleUnderline().run()
    },
    {
      type: 'format',
      name: 'code',
      icon: Code,
      isActive: () => editor.isActive('code'),
      command: () => editor.chain().focus().toggleCode().run()
    },
    {
      type: 'format',
      name: 'link',
      icon: Link,
      isActive: () => editor.isActive('link'),
      command: () => {
        const url = window.prompt('Introduce la URL:')
        if (url) {
          editor.chain().focus().setLink({ href: url }).run()
        }
      }
    },
    {
      type: 'format',
      name: 'strike',
      icon: Strikethrough,
      isActive: () => editor.isActive('strike'),
      command: () => editor.chain().focus().toggleStrike().run()
    }
  ]

  const headerItems = formatItems.filter(item => item.type === 'header')
  const listItems = formatItems.filter(item => item.type === 'list')  
  const formatTextItems = formatItems.filter(item => item.type === 'format')

  return (
    <>
      {/* Headers primero */}
      {headerItems.map((item, index) => (
        <EditorBubbleItem key={index} onSelect={() => item.command()}>
          <button
            type="button"
            className={cn(
              "p-2 hover:bg-accent hover:text-accent-foreground",
              item.isActive() 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
          </button>
        </EditorBubbleItem>
      ))}
      
      {/* Separador */}
      <div className="h-6 w-px bg-muted mx-1" />
      
      {/* Listas y citas */}
      {listItems.map((item, index) => (
        <EditorBubbleItem key={index} onSelect={() => item.command()}>
          <button
            type="button"
            className={cn(
              "p-2 hover:bg-accent hover:text-accent-foreground",
              item.isActive() 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
          </button>
        </EditorBubbleItem>
      ))}
      
      {/* Separador */}
      <div className="h-6 w-px bg-muted mx-1" />
      
      {/* Formato de texto */}
      {formatTextItems.map((item, index) => (
        <EditorBubbleItem key={index} onSelect={() => item.command()}>
          <button
            type="button"
            className={cn(
              "p-2 hover:bg-accent hover:text-accent-foreground",
              item.isActive() 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
          </button>
        </EditorBubbleItem>
      ))}
      
      {/* Limpiar formato */}
      <EditorBubbleItem onSelect={() => editor.chain().focus().unsetAllMarks().run()}>
        <button
          type="button"
          className="p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Type className="h-5 w-5" />
        </button>
      </EditorBubbleItem>
    </>
  )
}
import "katex/dist/katex.min.css"

interface PostEditorProps {
  content: JSONContent | undefined
  onChange: (content: JSONContent) => void
  onSave?: () => void
  className?: string
}

export function PostEditor({ content, onChange, onSave, className }: PostEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Función para normalizar el contenido mal formado
  const normalizeContent = (rawContent: JSONContent | undefined): JSONContent => {
    if (!rawContent) {
      return { type: 'doc', content: [] }
    }

    // Función recursiva para limpiar nodos vacíos
    const cleanNode = (node: unknown): JSONContent | null => {
      if (!node || typeof node !== 'object') return node as JSONContent

      const nodeObj = node as Record<string, unknown>

      // Si es un nodo de texto vacío, eliminarlo
      if (nodeObj.type === 'text' && (!nodeObj.text || (typeof nodeObj.text === 'string' && nodeObj.text.trim() === ''))) {
        return null
      }

      // Si tiene contenido, limpiar recursivamente
      if (Array.isArray(nodeObj.content)) {
        const cleanedContent = nodeObj.content
          .map(cleanNode)
          .filter((child: JSONContent | null) => child !== null)

        return { ...nodeObj, content: cleanedContent } as JSONContent
      }

      return nodeObj as JSONContent
    }

    let normalizedContent: JSONContent

    // Si ya tiene la estructura correcta
    if (rawContent.type === 'doc' && Array.isArray(rawContent.content)) {
      normalizedContent = rawContent
    }
    // Si es un array directo (contenido migrado mal formado), envolvarlo en un nodo "doc"
    else if (Array.isArray(rawContent)) {
      normalizedContent = {
        type: 'doc',
        content: rawContent
      } as JSONContent
    }
    // Si es un objeto sin tipo "doc", intentar arreglarlo
    else if (typeof rawContent === 'object' && rawContent.content && Array.isArray(rawContent.content)) {
      normalizedContent = {
        type: 'doc',
        content: rawContent.content
      } as JSONContent
    }
    // Fallback: crear estructura mínima
    else {
      return { type: 'doc', content: [] }
    }

    // Limpiar nodos vacíos del contenido normalizado
    return cleanNode(normalizedContent) || { type: 'doc', content: [] }
  }

  // Debounced onChange
  const debouncedOnChange = useDebouncedCallback((value: JSONContent) => {
    onChange(value)
    setIsSaving(true)
    
    // Simular guardado
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
    }, 500)
  }, 1000)

  const handleImageUpload = async (file: File) => {
    try {
      const tempId = `temp-${Date.now()}`
      const result = await uploadContentImage(file, tempId)
      return result.url
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Error al subir la imagen")
      throw error
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2 text-xs text-muted-foreground">
        {isSaving && <span>Guardando...</span>}
        {!isSaving && lastSaved && (
          <span>
            Guardado a las {lastSaved.toLocaleTimeString("es-ES", { 
              hour: "2-digit", 
              minute: "2-digit" 
            })}
          </span>
        )}
      </div>
      
      <EditorRoot>
        <EditorContent
          extensions={defaultExtensions}
          initialContent={normalizeContent(content)}
          onUpdate={({ editor }) => {
            const json = editor.getJSON()
            debouncedOnChange(json)
          }}
          className="w-full max-w-screen-lg border-muted bg-background rounded-lg border shadow-lg"
          editorProps={{
            attributes: {
              class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full p-6"
            },
            handleDOMEvents: {
              keydown: (_view, event) => {
                // Handle slash commands navigation
                if (handleCommandNavigation(event)) {
                  return true
                }
                // Handle save shortcut
                if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                  event.preventDefault()
                  onSave?.()
                  return true
                }
                return false
              },
            },
            handlePaste: (view, event) => {
              const items = Array.from(event.clipboardData?.items || [])
              for (const item of items) {
                if (item.type.indexOf("image") === 0) {
                  event.preventDefault()
                  const file = item.getAsFile()
                  if (file) {
                    handleImageUpload(file).then((url) => {
                      const { state } = view
                      const { schema } = state
                      const node = schema.nodes.image.create({ src: url })
                      const transaction = state.tr.replaceSelectionWith(node)
                      view.dispatch(transaction)
                    })
                  }
                  return true
                }
              }
              return false
            },
            handleDrop: (view, event) => {
              const files = Array.from(event.dataTransfer?.files || [])
              const imageFiles = files.filter(file => file.type.startsWith('image/'))
              
              if (imageFiles.length > 0) {
                event.preventDefault()
                const file = imageFiles[0]
                handleImageUpload(file).then((url) => {
                  const { state } = view
                  const { schema } = state
                  const node = schema.nodes.image.create({ src: url })
                  const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
                  if (pos) {
                    const transaction = state.tr.insert(pos.pos, node)
                    view.dispatch(transaction)
                  }
                })
                return true
              }
              return false
            }
          }}
        >
          {/* Comandos Slash */}
          <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No hay resultados
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => {
                    console.log("Command triggered:", val)
                    item.command?.(val)
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent cursor-pointer"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          {/* Bubble Menu */}
          <EditorBubble
            tippyOptions={{
              placement: "top",
            }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
          >
            <BubbleMenuContent />
          </EditorBubble>
        </EditorContent>
      </EditorRoot>
    </div>
  )
}

// Loading state component
export function PostEditorSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[500px] w-full rounded-lg" />
    </div>
  )
}