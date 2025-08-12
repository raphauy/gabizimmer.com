"use client"

import { useState, useEffect } from "react"
import { getPostsAction } from "./actions"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { PostStatusBadge } from "./post-status-badge"
import { PostActionsClient } from "./post-actions-client"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { type PostWithRelations } from "@/services/post-service"
import { PostsSkeleton } from "./posts-skeleton"

export function PostsList() {
  const [posts, setPosts] = useState<PostWithRelations[]>([])
  const [filteredPosts, setFilteredPosts] = useState<PostWithRelations[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPosts() {
      try {
        const result = await getPostsAction()
        if (result.success) {
          setPosts(result.posts)
          setFilteredPosts(result.posts)
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadPosts()
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPosts(posts)
    } else {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPosts(filtered)
    }
  }, [searchTerm, posts])

  if (isLoading) {
    return <PostsSkeleton />
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No hay posts creados todavía
        </p>
        <p className="text-sm text-muted-foreground">
          Crea tu primer post para comenzar a publicar contenido
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con contador y buscador */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {filteredPosts.length} de {posts.length} posts
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredPosts.length === 0 && searchTerm ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No se encontraron posts que coincidan con &quot;{searchTerm}&quot;
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-0 max-w-xs">Título</TableHead>
            <TableHead className="w-32 whitespace-nowrap">Autor</TableHead>
            <TableHead className="w-24 whitespace-nowrap">Categoría</TableHead>
            <TableHead className="w-20 whitespace-nowrap">Estado</TableHead>
            <TableHead className="w-16 whitespace-nowrap text-center">Comentarios</TableHead>
            <TableHead className="w-20 whitespace-nowrap">Fecha</TableHead>
            <TableHead className="w-12 whitespace-nowrap text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium min-w-0 max-w-xs">
                <div>
                  <Link 
                    href={`/admin/posts/${post.id}/edit`}
                    className="hover:underline block truncate"
                    title={post.title}
                  >
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    {post.readingTime && (
                      <span className="text-xs text-muted-foreground">
                        ({post.readingTime} min lectura)
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                      {post.language}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-32 whitespace-nowrap">
                <div>
                  <p className="text-sm truncate">{post.author.name || "Sin nombre"}</p>
                  <p className="text-xs text-muted-foreground truncate">{post.author.email}</p>
                </div>
              </TableCell>
              <TableCell className="w-24 whitespace-nowrap truncate">{post.category.name}</TableCell>
              <TableCell className="w-20 whitespace-nowrap">
                <PostStatusBadge status={post.status} />
              </TableCell>
              <TableCell className="w-16 whitespace-nowrap text-center">
                {post._count?.comments || 0}
              </TableCell>
              <TableCell className="w-20 whitespace-nowrap">
                <div className="text-sm">
                  {post.publishedAt ? (
                    <div>
                      <p className="text-xs">Publicado</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(post.publishedAt), "dd MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs">Creado</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(post.createdAt), "dd MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="w-12 whitespace-nowrap text-right">
                <PostActionsClient post={post} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
        </div>
      )}
    </div>
  )
}