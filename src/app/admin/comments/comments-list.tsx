"use client"

import { useState, useEffect } from "react"
import { getCommentsAction } from "./actions"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, ExternalLink } from "lucide-react"
import { CommentStatusBadge } from "./comment-status-badge"
import { CommentActionsClient } from "./comment-actions-client"
import { BulkActions } from "./bulk-actions"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { type CommentWithPost } from "@/services/comment-service"
import { type CommentStatus } from "@prisma/client"

export function CommentsList() {
  const [comments, setComments] = useState<CommentWithPost[]>([])
  const [filteredComments, setFilteredComments] = useState<CommentWithPost[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<CommentStatus | "ALL">("ALL")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const filters = statusFilter !== "ALL" ? { status: statusFilter } : undefined
      const result = await getCommentsAction(filters)
      if (result.success) {
        setComments(result.comments)
        setFilteredComments(result.comments)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  useEffect(() => {
    let filtered = comments

    // Aplicar filtro de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(comment =>
        comment.content.toLowerCase().includes(searchLower) ||
        comment.authorName.toLowerCase().includes(searchLower) ||
        comment.authorEmail.toLowerCase().includes(searchLower) ||
        comment.post.title.toLowerCase().includes(searchLower)
      )
    }

    setFilteredComments(filtered)
  }, [searchTerm, comments])

  const handleSelectAll = () => {
    if (selectedIds.length === filteredComments.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredComments.map(c => c.id))
    }
  }

  const handleSelectComment = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleBulkActionComplete = () => {
    setSelectedIds([])
    fetchComments()
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando comentarios...</div>
  }

  if (comments.length === 0 && statusFilter === "ALL") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No hay comentarios todavía
        </p>
        <p className="text-sm text-muted-foreground">
          Los comentarios aparecerán aquí cuando los visitantes comenten en los posts del blog
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CommentStatus | "ALL")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="PENDING">Pendientes</SelectItem>
              <SelectItem value="APPROVED">Aprobados</SelectItem>
              <SelectItem value="REJECTED">Rechazados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por contenido, autor o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contador y acciones masivas */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {selectedIds.length > 0 ? (
            <span>{selectedIds.length} comentario(s) seleccionado(s)</span>
          ) : (
            <span>{filteredComments.length} de {comments.length} comentarios</span>
          )}
        </div>
        
        {selectedIds.length > 0 && (
          <BulkActions 
            selectedIds={selectedIds} 
            onComplete={handleBulkActionComplete}
          />
        )}
      </div>

      {filteredComments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No se encontraron comentarios que coincidan con los filtros
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-3 w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredComments.length && filteredComments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-3 font-medium text-sm">Autor</th>
                  <th className="text-left p-3 font-medium text-sm">Contenido</th>
                  <th className="text-left p-3 font-medium text-sm">Post</th>
                  <th className="text-left p-3 font-medium text-sm">Estado</th>
                  <th className="text-left p-3 font-medium text-sm">Aprobado por</th>
                  <th className="text-left p-3 font-medium text-sm">Fecha</th>
                  <th className="text-right p-3 font-medium text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredComments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-muted/50">
                    <td className="p-3 w-12">
                      <Checkbox
                        checked={selectedIds.includes(comment.id)}
                        onCheckedChange={() => handleSelectComment(comment.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5 min-w-[120px] max-w-[180px]">
                        <p className="font-medium text-sm truncate">
                          {comment.authorName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {comment.authorEmail}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="min-w-[200px] max-w-[350px]">
                        <p className="text-sm line-clamp-2">
                          {comment.content}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="min-w-[150px] max-w-[250px]">
                        {comment.post.slug && comment.post.category?.slug ? (
                          <div className="relative group">
                            <Link 
                              href={`/blog/${comment.post.category.slug}/${comment.post.slug}#comments`}
                              target="_blank"
                              className="hover:underline"
                              title={comment.post.title}
                            >
                              <p className="text-sm line-clamp-2 pr-5">
                                {comment.post.title}
                              </p>
                            </Link>
                            <ExternalLink className="h-3 w-3 absolute top-0.5 right-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-2" title={comment.post.title}>
                            {comment.post.title}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <CommentStatusBadge status={comment.status} rejectionReason={comment.rejectionReason} />
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-muted-foreground">
                        {comment.approvedBy === 'Agente IA' ? (
                          <span className="text-purple-600 dark:text-purple-400">
                            {comment.approvedBy}
                          </span>
                        ) : comment.approvedBy ? (
                          <span>{comment.approvedBy}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-xs text-muted-foreground space-y-0.5 whitespace-nowrap">
                        <div>{format(new Date(comment.createdAt), "dd MMM", { locale: es })}</div>
                        <div>{format(new Date(comment.createdAt), "HH:mm", { locale: es })}</div>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <CommentActionsClient 
                        comment={comment} 
                        onActionComplete={fetchComments}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}