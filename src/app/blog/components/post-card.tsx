'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MessageCircle } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { PostWithRelations } from '@/services/post-service'

const postCardVariants = cva(
  'group overflow-hidden transition-all hover:shadow-lg',
  {
    variants: {
      variant: {
        featured: 'md:col-span-2 lg:col-span-3',
        default: '',
        compact: 'h-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface PostCardProps extends VariantProps<typeof postCardVariants> {
  post: PostWithRelations
  className?: string
}

export function PostCard({ post, variant, className }: PostCardProps) {
  const href = `/blog/${post.category.slug}/${post.slug}`
  
  // Formatear fecha
  const formattedDate = post.publishedAt 
    ? formatDistanceToNow(new Date(post.publishedAt), {
        addSuffix: true,
        locale: es,
      })
    : 'Borrador'

  // Determinar si es una variante destacada
  const isFeatured = variant === 'featured'
  const isCompact = variant === 'compact'

  return (
    <div className={cn(
      "bg-card text-card-foreground rounded-lg border shadow-sm overflow-hidden",
      postCardVariants({ variant }), 
      className
    )}>
      <Link href={href} className="flex flex-col h-full">
        {/* Imagen - sin márgenes ni padding */}
        {post.featuredImageUrl ? (
          <div className={cn(
            "relative bg-muted",
            isFeatured ? "aspect-[21/9]" : "aspect-video"
          )}>
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={isFeatured 
                ? "(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              }
              priority={isFeatured}
            />
            {/* Overlay gradient para featured */}
            {isFeatured && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            )}
            {/* Badge de categoría */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-gabi-dark-green text-white border-0">
                {post.category.name}
              </Badge>
            </div>
          </div>
        ) : (
          /* Si no hay imagen, mostrar placeholder sin icono */
          <div className={cn(
            "relative bg-gradient-to-br from-wine-primary/10 to-wine-accent/10",
            isFeatured ? "aspect-[21/9]" : "aspect-video"
          )}>
            <div className="absolute top-4 left-4">
              <Badge className="bg-gabi-dark-green text-white border-0">
                {post.category.name}
              </Badge>
            </div>
          </div>
        )}

        {/* Contenido */}
        <CardHeader className={isFeatured ? "p-8" : "p-4"}>
          <h2 className={cn(
            'font-jost font-bold line-clamp-2 group-hover:text-wine-primary transition-colors',
            isFeatured ? 'text-2xl md:text-3xl lg:text-4xl' : 
            isCompact ? 'text-lg' : 'text-xl md:text-2xl'
          )}>
            {post.title}
          </h2>
        </CardHeader>

        {/* Excerpt - solo si no es compact */}
        {post.excerpt && !isCompact && (
          <CardContent className={cn(
            isFeatured ? "px-8 pb-4" : "px-4 pb-4"
          )}>
            <p className={cn(
              "text-muted-foreground font-noto-serif",
              isFeatured ? "text-base md:text-lg line-clamp-3" : "text-sm line-clamp-2"
            )}>
              {post.excerpt}
            </p>
          </CardContent>
        )}

        {/* Footer con metadata */}
        {isCompact ? (
          // Versión compacta - 2 líneas con 2 datos cada una
          <CardFooter className="px-4 pb-4">
            <div className="flex flex-col gap-2.5 w-full">
              {/* Primera línea: Autor + Tiempo de lectura */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="font-medium truncate">
                  {post.author.name || 'Gabi Zimmer'}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{post.readingTime || 0} min</span>
                </div>
              </div>
              
              {/* Segunda línea: Fecha + Comentarios */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="truncate">{formattedDate}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{post._count?.comments || 0}</span>
                </div>
              </div>
            </div>
          </CardFooter>
        ) : (
          // Versión normal/featured - dos líneas
          <CardFooter className={cn(
            "px-4 pb-4",
            isFeatured && "px-8 pb-8"
          )}>
            <div className="flex flex-col gap-2.5 w-full">
              {/* Primera línea: Autor + Tiempo de lectura */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className={cn(
                  "font-medium truncate",
                  isFeatured && "text-base"
                )}>
                  {post.author.name || 'Gabi Zimmer'}
                </span>
                {post.readingTime && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{post.readingTime} min</span>
                  </div>
                )}
              </div>
              
              {/* Segunda línea: Fecha + Comentarios */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="truncate">{formattedDate}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{post._count?.comments || 0}</span>
                </div>
              </div>
            </div>
          </CardFooter>
        )}
      </Link>
    </div>
  )
}