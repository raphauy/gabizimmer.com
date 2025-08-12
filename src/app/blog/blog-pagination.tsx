import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllPosts } from '@/services/post-service'
import { getCategoryBySlug } from '@/services/category-service'

interface BlogPaginationProps {
  currentPage: number
  category?: string
  search?: string
  basePath?: string
}

const POSTS_PER_PAGE = 9

export async function BlogPagination({ currentPage, category, search, basePath = '/blog' }: BlogPaginationProps) {
  // Obtener categoría si se especifica
  let categoryId: string | undefined
  if (category) {
    const categoryData = await getCategoryBySlug(category)
    if (categoryData) {
      categoryId = categoryData.id
    }
  }
  
  // Obtener todos los posts para calcular el total
  const allPosts = await getAllPosts({ 
    status: 'PUBLISHED',
    categoryId,
    language: 'ES'
  })
  
  // Filtrar por búsqueda si se especifica
  let filteredPosts = allPosts
  if (search) {
    const searchLower = search.toLowerCase()
    filteredPosts = allPosts.filter(post => 
      post.title.toLowerCase().includes(searchLower) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchLower))
    )
  }
  
  // Calcular páginas totales
  const totalPosts = filteredPosts.length
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)
  
  // Si solo hay una página, no mostrar paginación
  if (totalPages <= 1) return null
  
  // Construir URL con parámetros mantenidos
  const buildUrl = (page: number) => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', page.toString())
    if (search) params.set('search', search)
    
    const queryString = params.toString()
    return queryString ? `${basePath}?${queryString}` : basePath
  }
  
  // Calcular rango de páginas a mostrar (máximo 5)
  const maxPagesToShow = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)
  
  // Ajustar startPage si estamos cerca del final
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }
  
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  )
  
  return (
    <nav 
      className="flex justify-center items-center gap-2 mt-12 mb-8"
      aria-label="Paginación del blog"
    >
      {/* Botón anterior */}
      {currentPage > 1 ? (
        <Button
          variant="outline"
          size="icon"
          asChild
          className="hover:bg-wine-primary/10 hover:text-wine-primary hover:border-wine-primary"
        >
          <Link href={buildUrl(currentPage - 1)} aria-label="Página anterior">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          disabled
          aria-label="Página anterior (deshabilitado)"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      
      {/* Primera página si no está visible */}
      {startPage > 1 && (
        <>
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            size="sm"
            asChild
            className={currentPage === 1 
              ? "bg-wine-primary hover:bg-wine-accent" 
              : "hover:bg-wine-primary/10 hover:text-wine-primary hover:border-wine-primary"
            }
          >
            <Link href={buildUrl(1)}>1</Link>
          </Button>
          {startPage > 2 && (
            <span className="px-2 text-muted-foreground">...</span>
          )}
        </>
      )}
      
      {/* Números de página */}
      {pageNumbers.map(pageNum => (
        <Button
          key={pageNum}
          variant={currentPage === pageNum ? "default" : "outline"}
          size="sm"
          asChild
          className={currentPage === pageNum 
            ? "bg-wine-primary hover:bg-wine-accent" 
            : "hover:bg-wine-primary/10 hover:text-wine-primary hover:border-wine-primary"
          }
        >
          <Link href={buildUrl(pageNum)}>
            {pageNum}
          </Link>
        </Button>
      ))}
      
      {/* Última página si no está visible */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-muted-foreground">...</span>
          )}
          <Button
            variant={currentPage === totalPages ? "default" : "outline"}
            size="sm"
            asChild
            className={currentPage === totalPages 
              ? "bg-wine-primary hover:bg-wine-accent" 
              : "hover:bg-wine-primary/10 hover:text-wine-primary hover:border-wine-primary"
            }
          >
            <Link href={buildUrl(totalPages)}>{totalPages}</Link>
          </Button>
        </>
      )}
      
      {/* Botón siguiente */}
      {currentPage < totalPages ? (
        <Button
          variant="outline"
          size="icon"
          asChild
          className="hover:bg-wine-primary/10 hover:text-wine-primary hover:border-wine-primary"
        >
          <Link href={buildUrl(currentPage + 1)} aria-label="Página siguiente">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          disabled
          aria-label="Página siguiente (deshabilitado)"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
      
      {/* Información de página */}
      <span className="ml-4 text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>
    </nav>
  )
}