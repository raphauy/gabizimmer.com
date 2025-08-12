'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { PostContent } from '@/app/blog/components/post-content'
import { PostHeader } from '@/app/blog/components/post-header'
import { PostPreviewViewport } from './post-preview-viewport'
import type { Category } from '@prisma/client'
import type { JSONContent } from "novel"

interface PostPreviewProps {
  title: string
  content: JSONContent
  excerpt?: string
  featuredImageUrl?: string | null
  categoryId: string
  categories: Category[]
  authorName?: string
  createdAt?: Date
}

export function PostPreview({
  title,
  content,
  excerpt,
  featuredImageUrl,
  categoryId,
  categories,
  authorName,
  createdAt
}: PostPreviewProps) {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  
  // Mock del post para PostHeader
  const mockPost = useMemo(() => ({
    id: 'preview',
    title,
    slug: 'preview',
    content,
    excerpt: excerpt || null,
    featuredImageUrl: featuredImageUrl || null,
    status: 'DRAFT' as const,
    language: 'ES' as const,
    seoTitle: null,
    seoDescription: null,
    authorId: 'preview',
    categoryId,
    readingTime: null,
    publishedAt: null,
    createdAt: createdAt || new Date(),
    updatedAt: new Date(),
    author: {
      id: 'preview',
      name: authorName || 'Gabi Zimmer',
      email: '',
      image: null
    },
    category: categories.find(c => c.id === categoryId) || {
      id: 'preview',
      name: 'Sin categoría',
      slug: 'sin-categoria',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    _count: {
      comments: 0
    }
  }), [title, content, excerpt, featuredImageUrl, categoryId, categories, authorName, createdAt])
  
  // Clases de contenedor según viewport
  const containerClass = viewport === 'mobile' ? 'max-w-sm' : 
                        viewport === 'tablet' ? 'max-w-2xl' : 
                        'max-w-4xl'
  
  return (
    <div className="space-y-4">
      {/* Controles de viewport */}
      <PostPreviewViewport 
        viewport={viewport} 
        onViewportChange={setViewport}
      />
      
      {/* Contenedor de preview con scroll */}
      <div className="border rounded-lg bg-background overflow-hidden">
        <div className="h-[600px] overflow-y-auto">
          {/* Header del Post con información centrada */}
          <div className={`${containerClass} mx-auto px-4 pt-12 pb-8`}>
            <PostHeader post={mockPost} />
          </div>
          
          {/* Imagen Hero a todo el ancho */}
          {featuredImageUrl && (
            <div className="relative w-full aspect-[21/9] mb-12">
              <Image
                src={featuredImageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}
          
          {/* Contenido del Post */}
          <div className={`${containerClass} mx-auto px-4`}>
            <div className="prose prose-lg dark:prose-invert max-w-none pb-12">
              <PostContent content={content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}