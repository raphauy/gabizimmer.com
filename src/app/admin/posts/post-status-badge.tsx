import { Badge } from "@/components/ui/badge"
import { PostStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

interface PostStatusBadgeProps {
  status: PostStatus
}

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  const getStatusConfig = (status: PostStatus) => {
    switch (status) {
      case "DRAFT":
        return {
          label: "Borrador",
          className: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-200"
        }
      case "PUBLISHED":
        return {
          label: "Publicado",
          className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200"
        }
      case "ARCHIVED":
        return {
          label: "Archivado",
          className: "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200"
        }
      default:
        return {
          label: status,
          className: ""
        }
    }
  }

  const config = getStatusConfig(status)
  
  return (
    <Badge variant="outline" className={cn("border-0", config.className)}>
      {config.label}
    </Badge>
  )
}