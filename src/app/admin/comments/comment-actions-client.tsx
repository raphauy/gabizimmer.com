"use client"

import { useState } from "react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Trash, 
  Eye,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { 
  approveCommentAction, 
  rejectCommentAction, 
  deleteCommentAction 
} from "./actions"
import { type CommentWithPost } from "@/services/comment-service"

interface CommentActionsClientProps {
  comment: CommentWithPost
  onActionComplete?: () => void
}

export function CommentActionsClient({ comment, onActionComplete }: CommentActionsClientProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const { data: session } = useSession()
  
  const isSuperAdmin = session?.user?.role === "superadmin"

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const result = await approveCommentAction(comment.id)
      if (result.success) {
        toast.success(result.message)
        onActionComplete?.()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al aprobar el comentario")
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      const result = await rejectCommentAction(comment.id)
      if (result.success) {
        toast.success(result.message)
        onActionComplete?.()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al rechazar el comentario")
    } finally {
      setIsRejecting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteCommentAction(comment.id)
      if (result.success) {
        toast.success(result.message)
        onActionComplete?.()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al eliminar el comentario")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {comment.post.slug && comment.post.category?.slug && (
            <DropdownMenuItem asChild>
              <Link 
                href={`/blog/${comment.post.category.slug}/${comment.post.slug}#comments`} 
                target="_blank"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver en blog
                <ExternalLink className="ml-auto h-3 w-3" />
              </Link>
            </DropdownMenuItem>
          )}
          
          {comment.status !== "APPROVED" && (
            <DropdownMenuItem 
              onClick={handleApprove} 
              disabled={isApproving}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              {isApproving ? "Aprobando..." : "Aprobar"}
            </DropdownMenuItem>
          )}

          {comment.status !== "REJECTED" && (
            <DropdownMenuItem 
              onClick={handleReject} 
              disabled={isRejecting}
            >
              <XCircle className="mr-2 h-4 w-4 text-amber-600" />
              {isRejecting ? "Rechazando..." : "Rechazar"}
            </DropdownMenuItem>
          )}

          {isSuperAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el comentario de
              <span className="font-semibold"> {comment.authorName}</span> en el post
              <span className="font-semibold"> &quot;{comment.post.title}&quot;</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}