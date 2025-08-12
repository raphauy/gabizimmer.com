'use client'

import { useChat, type UIMessage } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Message } from '@/components/chat/message'
import { Greeting } from '@/components/chat/greeting'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChatInterface() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState('')
  
  const { messages, sendMessage, status } = useChat({
    onFinish: () => {
      // Devolver el foco al textarea cuando termina la respuesta
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 100)
    }
  })

  const isLoading = status !== 'ready'

  // Funciones para manejar altura del textarea
  const adjustHeight = () => {
    if (textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight
      const minHeight = 100
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(minHeight, scrollHeight + 2)}px`
    }
  }

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '100px'
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [input])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) {
      return
    }

    sendMessage({ text: input })
    setInput('')
    resetHeight()
    
    // Mantener foco en el textarea
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {messages.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full flex flex-col items-center justify-center gap-8 max-w-3xl">
            <div className="w-full flex flex-col items-center">
              <Greeting />
            </div>
            <div className="w-full max-w-3xl">
              {/* Input multimodal */}
              <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="p-2 pb-4 max-w-4xl mx-auto">
                  <div className="relative w-full flex flex-col gap-4">
                    <form onSubmit={onSubmit} className="relative">
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value)
                          adjustHeight()
                        }}
                        placeholder="Pregunta sobre vinos, maridajes o catas..."
                        disabled={isLoading}
                        rows={2}
                        autoFocus
                        className={cn(
                          "min-h-[100px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-3xl !text-lg bg-background pb-16 px-4 pt-3",
                          "border-gabi-light-green/40 focus:border-gabi-dark-green transition-colors",
                          "shadow-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                        )}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                            e.preventDefault()
                            onSubmit(e as React.FormEvent)
                          }
                        }}
                      />
                      
                      {/* Botón Enviar */}
                      <div className="absolute bottom-0 right-0 p-3 w-fit flex flex-row justify-end">
                        <Button 
                          type="submit" 
                          size="icon"
                          disabled={isLoading || !input.trim()}
                          className="rounded-full w-8 h-8 bg-gabi-dark-green text-white hover:bg-gabi-blue flex items-center justify-center"
                        >
                          <ArrowUp size={16} />
                        </Button>
                      </div>
                    </form>
                  </div>
                  
                  {/* Disclaimer */}
                  <div className="text-center mt-2">
                    <p className="text-xs text-muted-foreground">
                      El asistente puede cometer errores. Considera verificar la información importante.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Messages con scroll */}
          <div className="flex-1 overflow-y-auto p-4 pb-0">
            <div className="space-y-3 max-w-4xl mx-auto">
              {messages.map((message: UIMessage) => {
                const textContent = message.parts
                  .filter(part => part.type === 'text')
                  .map(part => (part as { type: 'text'; text: string }).text)
                  .join('')
                
                return (
                  <Message 
                    key={message.id} 
                    message={{
                      id: message.id,
                      role: message.role as 'user' | 'assistant' | 'system',
                      content: textContent,
                    }}
                    isLoading={false}
                  />
                )
              })}
              
              {/* Loading indicator */}
              {isLoading && (
                <Message 
                  message={{
                    id: 'loading',
                    role: 'assistant',
                    content: ''
                  }}
                  isLoading={true}
                />
              )}
            </div>
          </div>
          
          {/* Input multimodal con mensajes */}
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-4 pb-4 max-w-4xl mx-auto">
              <div className="relative w-full flex flex-col gap-4">
                <form onSubmit={onSubmit} className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      adjustHeight()
                    }}
                    placeholder="Pregunta sobre vinos, maridajes o catas..."
                    disabled={isLoading}
                    rows={2}
                    className={cn(
                      "min-h-[100px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-3xl !text-lg bg-background pb-16 px-4 pt-3",
                      "border-gabi-light-green/40 focus:border-gabi-dark-green transition-colors",
                      "shadow-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault()
                        onSubmit(e as React.FormEvent)
                      }
                    }}
                  />
                  
                  {/* Botón Enviar */}
                  <div className="absolute bottom-0 right-0 p-3 w-fit flex flex-row justify-end">
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={isLoading || !input.trim()}
                      className="rounded-full w-8 h-8 bg-gabi-dark-green text-white hover:bg-gabi-blue flex items-center justify-center"
                    >
                      <ArrowUp size={16} />
                    </Button>
                  </div>
                </form>
              </div>
              
              {/* Disclaimer */}
              <div className="text-center mt-2">
                <p className="text-xs text-muted-foreground">
                  El asistente puede cometer errores. Considera verificar la información importante sobre vinos.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}