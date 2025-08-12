'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { createCommentAction, getApprovedCommentsAction } from './actions'
import { useEffect } from 'react'
import type { Comment } from '@prisma/client'

interface CommentsSectionProps {
  postId: string
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: '',
    content: ''
  })

  // Cargar comentarios aprobados
  useEffect(() => {
    async function loadComments() {
      try {
        const result = await getApprovedCommentsAction(postId)
        if (result.success) {
          setComments(result.comments)
        } else {
          toast.error(result.message || 'Error al cargar los comentarios')
        }
      } catch (error) {
        console.error('Error loading comments:', error)
        toast.error('Error al cargar los comentarios')
      } finally {
        setLoading(false)
      }
    }
    
    loadComments()
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.authorName.trim() || !formData.authorEmail.trim() || !formData.content.trim()) {
      toast.error('Por favor completa todos los campos')
      return
    }

    startTransition(async () => {
      try {
        const result = await createCommentAction({
          postId,
          ...formData
        })
        
        if (result.success) {
          toast.success(result.message)
          // Limpiar formulario
          setFormData({
            authorName: '',
            authorEmail: '',
            content: ''
          })
          
          // Si el comentario fue auto-aprobado, agregarlo a la lista
          if (result.comment && result.comment.status === 'APPROVED') {
            setComments(prev => [result.comment!, ...prev])
          }
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        console.error('Error submitting comment:', error)
        toast.error('Error al enviar el comentario')
      }
    })
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comentarios ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulario de nuevo comentario */}
          <form onSubmit={handleSubmit} className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold">Deja tu comentario</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Tu nombre"
                  value={formData.authorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                  disabled={isPending}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.authorEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorEmail: e.target.value }))}
                  disabled={isPending}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">Comentario *</Label>
              <Textarea
                id="comment"
                placeholder="Escribe tu comentario aquí..."
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                disabled={isPending}
                required
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.content.length}/1000 caracteres
              </p>
            </div>
            
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-wine-primary hover:bg-wine-accent"
            >
              <Send className="h-4 w-4 mr-2" />
              {isPending ? 'Enviando...' : 'Enviar comentario'}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Tu email no será publicado. Los comentarios son moderados antes de aparecer.
            </p>
          </form>
          
          {/* Lista de comentarios */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-24" />
                      <div className="h-16 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Sé el primero en comentar este artículo
            </p>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-wine-primary/10 text-wine-primary text-sm">
                      {comment.authorName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: es
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}