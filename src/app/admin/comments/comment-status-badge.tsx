import { Badge } from "@/components/ui/badge"
import { CommentStatus } from "@prisma/client"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AlertCircle } from "lucide-react"

interface CommentStatusBadgeProps {
  status: CommentStatus
  rejectionReason?: string | null
}

export function CommentStatusBadge({ status, rejectionReason }: CommentStatusBadgeProps) {
  const getStatusConfig = (status: CommentStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pendiente",
          className: "bg-amber-100 text-amber-800 border-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-200"
        }
      case "APPROVED":
        return {
          label: "Aprobado",
          className: "bg-green-100 text-green-800 border-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:border-green-200"
        }
      case "REJECTED":
        return {
          label: "Rechazado",
          className: "bg-red-100 text-red-800 border-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:border-red-200"
        }
      default:
        return {
          label: status,
          className: ""
        }
    }
  }

  const config = getStatusConfig(status)
  
  // Si está rechazado y hay razón, mostrar con tooltip
  if (status === "REJECTED" && rejectionReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn(config.className, "cursor-help")}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold mb-1">Razón del rechazo:</p>
            <p className="text-sm">{rejectionReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  
  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  )
}