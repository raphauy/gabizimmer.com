'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { debounce } from '@/lib/utils'
import { CategorySelector } from './category-selector'

export function BlogFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Detectar categoría desde la URL
  const pathSegments = pathname.split('/')
  const currentCategory = pathSegments.length === 3 && pathSegments[1] === 'blog' && pathSegments[2] !== '' 
    ? pathSegments[2] 
    : undefined
  
  const currentSearch = searchParams.get('search') || undefined
  
  const [searchValue, setSearchValue] = useState(currentSearch || '')
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([])
  
  // Actualizar searchValue cuando cambie currentSearch
  useEffect(() => {
    setSearchValue(currentSearch || '')
  }, [currentSearch])

  // Cargar categorías al montar
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        const allCategories = [
          { slug: 'all', name: 'Todos' },
          ...data.map((cat: { slug: string; name: string }) => ({ slug: cat.slug, name: cat.name }))
        ]
        setCategories(allCategories)
      })
      .catch((error) => {
        console.error('Error loading categories:', error)
        // Fallback a categorías hardcodeadas si falla - ordenadas por posts estimados
        setCategories([
          { slug: 'all', name: 'Todos' },
          { slug: 'uruguay', name: 'Uruguay' },
          { slug: 'vinos-naturales', name: 'Vinos naturales' },
          { slug: 'mundo-del-vino', name: 'Mundo del Vino' },
          { slug: 'noticias', name: 'Noticias' },
          { slug: 'opinion', name: 'Opinion' },
          { slug: 'podcast', name: 'Podcast' },
          { slug: 'sin-categorizar', name: 'Sin categorizar' },
        ])
      })
  }, [])

  // Actualizar URL con nuevos parámetros
  const updateURL = useCallback((params: Record<string, string | undefined>) => {
    const current = new URLSearchParams(searchParams.toString())
    
    // Actualizar o eliminar parámetros
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        current.set(key, value)
      } else {
        current.delete(key)
      }
    })
    
    // Resetear a página 1 cuando se cambian filtros
    if (params.search !== undefined) {
      current.delete('page')
    }
    
    const search = current.toString()
    const query = search ? `?${search}` : ''
    
    // Mantener la ruta de categoría si existe
    const basePath = currentCategory && currentCategory !== 'all' 
      ? `/blog/${currentCategory}` 
      : '/blog'
    
    router.push(`${basePath}${query}`)
  }, [router, searchParams, currentCategory])

  // Debounce para búsqueda
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateURL({ search: value || undefined })
    }, 500),
    [updateURL]
  )

  // Manejar cambio de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    debouncedSearch(value)
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b">
      {/* Selector de categorías */}
      <div className="flex items-center">
        <CategorySelector
          categories={categories}
          currentCategory={currentCategory}
        />
      </div>

      {/* Barra de búsqueda - estilo Vercel */}
      <div className="relative w-full md:w-auto flex items-center">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder="Buscar..."
          value={searchValue}
          onChange={handleSearchChange}
          className="pl-9 pr-3 h-9 w-full md:w-[200px] bg-background border rounded-full text-sm"
        />
      </div>
    </div>
  )
}