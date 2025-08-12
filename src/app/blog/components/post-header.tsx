import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { PostWithRelations } from '@/services/post-service'

interface PostHeaderProps {
  post: PostWithRelations
}

export function PostHeader({ post }: PostHeaderProps) {
  const publishedDate = post.publishedAt 
    ? format(new Date(post.publishedAt), "dd/MM/yyyy", { locale: es })
    : 'Borrador'

  return (
    <header className="text-center">
      {/* Categoría - pequeña y sutil como en la referencia */}
      <div className="mb-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {post.category.name}
        </span>
      </div>
      
      {/* Título - grande y prominente */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-jost leading-tight">
        {post.title}
      </h1>
      
      {/* Metadata - autor y fecha */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span className="font-medium">
          {post.author.name || 'Gabi Zimmer'}
        </span>
        <span>•</span>
        <span>{publishedDate}</span>
      </div>
    </header>
  )
}