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
  Edit, 
  Trash, 
  Eye, 
  Archive, 
  BookOpenCheck,
  FileText
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { deletePostAction, publishPostAction, archivePostAction } from "./actions"
import { type PostWithRelations } from "@/services/post-service"

interface PostActionsClientProps {
  post: PostWithRelations
}

export function PostActionsClient({ post }: PostActionsClientProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deletePostAction(post.id)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al eliminar el post")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const result = await publishPostAction(post.id)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al publicar el post")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleArchive = async () => {
    setIsArchiving(true)
    try {
      const result = await archivePostAction(post.id)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al archivar el post")
    } finally {
      setIsArchiving(false)
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
          
          <DropdownMenuItem asChild>
            <Link href={`/admin/posts/${post.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </DropdownMenuItem>

          {post.status === 'PUBLISHED' && (
            <DropdownMenuItem asChild>
              <Link href={`/blog/${post.category.slug}/${post.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Ver en blog
              </Link>
            </DropdownMenuItem>
          )}

          {post.status === 'DRAFT' && (
            <DropdownMenuItem onClick={handlePublish} disabled={isPublishing}>
              <BookOpenCheck className="mr-2 h-4 w-4" />
              {isPublishing ? "Publicando..." : "Publicar"}
            </DropdownMenuItem>
          )}

          {post.status === 'PUBLISHED' && (
            <DropdownMenuItem onClick={handleArchive} disabled={isArchiving}>
              <Archive className="mr-2 h-4 w-4" />
              {isArchiving ? "Archivando..." : "Archivar"}
            </DropdownMenuItem>
          )}

          {post.status === 'ARCHIVED' && (
            <DropdownMenuItem onClick={handlePublish} disabled={isPublishing}>
              <FileText className="mr-2 h-4 w-4" />
              {isPublishing ? "Reactivando..." : "Reactivar"}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el post
              <span className="font-semibold"> &quot;{post.title}&quot;</span>
              {post._count && post._count.comments > 0 && (
                <span className="block mt-2 text-destructive">
                  ⚠️ Este post tiene {post._count.comments} comentario(s) asociado(s).
                  No se puede eliminar hasta que se eliminen los comentarios.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || (post._count && post._count.comments > 0)}
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