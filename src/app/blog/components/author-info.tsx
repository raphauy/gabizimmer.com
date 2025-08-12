import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AuthorInfoProps {
  author: {
    name: string | null
    email: string
    image?: string | null
  }
}

export function AuthorInfo({ author }: AuthorInfoProps) {
  const displayName = author.name || 'Gabi Zimmer'
  const initial = displayName[0]?.toUpperCase() || 'G'
  
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-sm text-muted-foreground">Author</span>
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={author.image || undefined} alt={displayName} />
          <AvatarFallback className="bg-muted text-foreground text-xs">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{displayName}</span>
      </div>
    </div>
  )
}