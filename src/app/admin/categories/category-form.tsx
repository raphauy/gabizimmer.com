"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createCategoryAction, updateCategoryAction, checkSlugUniqueAction } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
}

interface CategoryFormProps {
  category?: Category
  isEdit?: boolean
}

// Función para generar slug desde nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD") // Descomponer caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remover diacríticos
    .replace(/[^\w\s-]/g, "") // Remover caracteres especiales
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/-+/g, "-") // Reemplazar múltiples guiones con uno
    .replace(/^-|-$/g, "") // Remover guiones al inicio y final
}

export function CategoryForm({ category, isEdit = false }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(category?.name || "")
  const [slug, setSlug] = useState(category?.slug || "")
  const [description, setDescription] = useState(category?.description || "")
  const [slugTouched, setSlugTouched] = useState(false)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [slugUnique, setSlugUnique] = useState<boolean | null>(null)
  
  const router = useRouter()

  // Auto-generar slug cuando cambie el nombre (solo si no se ha tocado manualmente)
  useEffect(() => {
    if (!slugTouched && name) {
      const newSlug = generateSlug(name)
      setSlug(newSlug)
    }
  }, [name, slugTouched])

  // Verificar unicidad del slug con debounce
  useEffect(() => {
    if (!slug) {
      setSlugUnique(null)
      return
    }

    const checkSlug = async () => {
      setCheckingSlug(true)
      try {
        const result = await checkSlugUniqueAction(slug, category?.id)
        if (result.success) {
          setSlugUnique(result.isUnique ?? null)
        }
      } catch (error) {
        console.error("Error checking slug:", error)
      } finally {
        setCheckingSlug(false)
      }
    }

    const timeoutId = setTimeout(checkSlug, 500)
    return () => clearTimeout(timeoutId)
  }, [slug, category?.id])

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    
    try {
      const result = isEdit && category
        ? await updateCategoryAction(category.id, formData)
        : await createCategoryAction(formData)
      
      if (result.success) {
        toast.success(result.message)
        router.push("/admin/categories")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error(`Error ${isEdit ? "actualizando" : "creando"} categoría`)
    } finally {
      setLoading(false)
    }
  }

  const handleSlugChange = (value: string) => {
    setSlugTouched(true)
    setSlug(value)
  }

  const isSlugValid = slug && slugUnique !== false && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  const canSubmit = name && slug && slugUnique === true && !loading

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Ej: Vinos Tintos"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <div className="relative">
            <Input
              id="slug"
              name="slug"
              type="text"
              placeholder="ej: vinos-tintos"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={`pr-8 ${
                slug && slugUnique === false 
                  ? "border-red-500 focus:ring-red-500" 
                  : slug && slugUnique === true 
                  ? "border-green-500 focus:ring-green-500" 
                  : ""
              }`}
              required
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {checkingSlug && slug && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
              {!checkingSlug && slug && slugUnique === true && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {!checkingSlug && slug && slugUnique === false && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          {slug && slugUnique === false && (
            <p className="text-sm text-red-600">Este slug ya está en uso</p>
          )}
          {slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && (
            <p className="text-sm text-red-600">
              El slug debe contener solo letras minúsculas, números y guiones
            </p>
          )}
          {slug && isSlugValid && (
            <p className="text-sm text-muted-foreground">
              URL: /blog/categoria/{slug}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Descripción de la categoría (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          {description.length}/500 caracteres
        </p>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={!canSubmit}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEdit ? "Actualizando..." : "Creando..."}
            </>
          ) : (
            isEdit ? "Actualizar Categoría" : "Crear Categoría"
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.push("/admin/categories")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}