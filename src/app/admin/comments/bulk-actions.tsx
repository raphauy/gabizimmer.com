"use client"

import { useState } from "react"
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
  CheckCircle, 
  XCircle, 
  Trash 
} from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { bulkModerateAction, bulkDeleteAction } from "./actions"

interface BulkActionsProps {
  selectedIds: string[]
  onComplete: () => void
}

type BulkAction = "approve" | "reject" | "delete" | null

export function BulkActions({ selectedIds, onComplete }: BulkActionsProps) {
  const [pendingAction, setPendingAction] = useState<BulkAction>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { data: session } = useSession()
  
  const isSuperAdmin = session?.user?.role === "superadmin"

  const handleBulkApprove = async () => {
    setIsProcessing(true)
    try {
      const result = await bulkModerateAction(selectedIds, "APPROVED")
      if (result.success) {
        toast.success(result.message)
        onComplete()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al aprobar comentarios")
    } finally {
      setIsProcessing(false)
      setPendingAction(null)
    }
  }

  const handleBulkReject = async () => {
    setIsProcessing(true)
    try {
      const result = await bulkModerateAction(selectedIds, "REJECTED")
      if (result.success) {
        toast.success(result.message)
        onComplete()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al rechazar comentarios")
    } finally {
      setIsProcessing(false)
      setPendingAction(null)
    }
  }

  const handleBulkDelete = async () => {
    setIsProcessing(true)
    try {
      const result = await bulkDeleteAction(selectedIds)
      if (result.success) {
        toast.success(result.message)
        onComplete()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al eliminar comentarios")
    } finally {
      setIsProcessing(false)
      setPendingAction(null)
    }
  }

  const handleConfirm = async () => {
    switch (pendingAction) {
      case "approve":
        await handleBulkApprove()
        break
      case "reject":
        await handleBulkReject()
        break
      case "delete":
        await handleBulkDelete()
        break
    }
  }

  const getDialogContent = () => {
    const count = selectedIds.length
    const commentText = count === 1 ? "comentario" : "comentarios"
    
    switch (pendingAction) {
      case "approve":
        return {
          title: "Aprobar comentarios",
          description: `¿Estás seguro de que deseas aprobar ${count} ${commentText}? Estos comentarios serán visibles públicamente en el blog.`
        }
      case "reject":
        return {
          title: "Rechazar comentarios",
          description: `¿Estás seguro de que deseas rechazar ${count} ${commentText}? Estos comentarios no serán visibles en el blog.`
        }
      case "delete":
        return {
          title: "Eliminar comentarios",
          description: `¿Estás seguro de que deseas eliminar permanentemente ${count} ${commentText}? Esta acción no se puede deshacer.`
        }
      default:
        return { title: "", description: "" }
    }
  }

  const dialogContent = getDialogContent()

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPendingAction("approve")}
          disabled={isProcessing}
        >
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          Aprobar
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPendingAction("reject")}
          disabled={isProcessing}
        >
          <XCircle className="h-4 w-4 mr-2 text-amber-600" />
          Rechazar
        </Button>
        
        {isSuperAdmin && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPendingAction("delete")}
            disabled={isProcessing}
            className="text-destructive hover:text-destructive"
          >
            <Trash className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        )}
      </div>

      <AlertDialog open={pendingAction !== null} onOpenChange={() => setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isProcessing}
              className={pendingAction === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {isProcessing ? "Procesando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}