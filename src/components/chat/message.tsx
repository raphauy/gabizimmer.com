'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { MessageContent } from './message-content'
import { TypingDots } from './typing-dots'
import Image from 'next/image'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface MessageProps {
  message: Message
  isLoading?: boolean
}

export function Message({ 
  message, 
  isLoading = false
}: MessageProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={cn(
      "flex gap-3 items-start",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="h-9 w-9 shrink-0 mt-[3px] flex items-center justify-center">
          {!isLoading ? (
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gabi-dark-green text-white p-0">
                <Image 
                  src="/vinedo-icon.png" 
                  alt="Asistente Gabi Zimmer" 
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      )}
    
      <div className={cn(
        "max-w-[75%] space-y-2",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Contenido del mensaje */}
        <div className={cn(
          "px-4 py-2 rounded-lg",
          isUser 
            ? "bg-gabi-dark-green !text-white [&>*]:!text-white [&_p]:!text-white" 
            : "bg-muted",
          isLoading && "min-w-[50px] mt-1"
        )}>
          {isLoading ? (
            <TypingDots />
          ) : (
            <MessageContent content={message.content} />
          )}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-9 w-9 shrink-0 mt-[3px]">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}