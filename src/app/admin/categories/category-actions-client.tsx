"use client"

import { deleteCategoryAction } from "@/app/admin/categories/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  _count: {
    posts: number
  }
  createdAt: Date
  updatedAt: Date
}

interface CategoryActionsClientProps {
  category: Category
}

export function CategoryActionsClient({ category }: CategoryActionsClientProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    router.push(`/admin/categories/${category.id}/edit`)
  }

  const handleDeleteCategory = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteCategoryAction(category.id)
      if (result.success) {
        toast.success(result.message)
        setShowDeleteDialog(false)
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error eliminando categoría")
    } finally {
      setIsDeleting(false)
    }
  }

  const canDelete = category._count.posts === 0

  return (
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
        
        {/* Editar categoría */}
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Eliminar categoría */}
        <DropdownMenuItem
          onClick={() => setShowDeleteDialog(true)}
          disabled={!canDelete}
          className={canDelete ? "text-red-600 focus:text-red-600" : "text-muted-foreground"}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
          {!canDelete && (
            <span className="ml-2 text-xs">
              ({category._count.posts} post{category._count.posts !== 1 ? "s" : ""})
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Dialog de confirmación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar categoría?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la categoría <strong>&quot;{category.name}&quot;</strong>? 
              Esta acción no se puede deshacer.
              {!canDelete && (
                <div className="mt-2 text-amber-600">
                  <strong>Nota:</strong> Esta categoría tiene {category._count.posts} post{category._count.posts !== 1 ? "s" : ""} asociado{category._count.posts !== 1 ? "s" : ""}
                  y no se puede eliminar hasta que se reasignen o eliminen.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={isDeleting || !canDelete}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}