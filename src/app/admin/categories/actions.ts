"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  getCategoryBySlug,
  type UpdateCategoryData
} from "@/services/category-service"

export async function createCategoryAction(formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string

    // Validar que el nombre no esté vacío
    if (!name?.trim()) {
      throw new Error("El nombre es requerido")
    }

    // Validar que el slug no esté vacío
    if (!slug?.trim()) {
      throw new Error("El slug es requerido")
    }

    const categoryData = {
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null
    }

    const category = await createCategory(categoryData)

    revalidatePath("/admin/categories")
    return { success: true, category, message: "Categoría creada correctamente" }
  } catch (error) {
    console.error("Error creando categoría:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error creando categoría" 
    }
  }
}

export async function updateCategoryAction(categoryId: string, formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string

    // Validar que el nombre no esté vacío si se proporciona
    if (name !== null && !name?.trim()) {
      throw new Error("El nombre no puede estar vacío")
    }

    // Validar que el slug no esté vacío si se proporciona
    if (slug !== null && !slug?.trim()) {
      throw new Error("El slug no puede estar vacío")
    }

    const categoryData: UpdateCategoryData = {}
    if (name) categoryData.name = name.trim()
    if (slug) categoryData.slug = slug.trim()
    if (description !== null) categoryData.description = description?.trim() || null

    const category = await updateCategory(categoryId, categoryData)

    revalidatePath("/admin/categories")
    return { success: true, category, message: "Categoría actualizada correctamente" }
  } catch (error) {
    console.error("Error actualizando categoría:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error actualizando categoría" 
    }
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    await deleteCategory(categoryId)

    revalidatePath("/admin/categories")
    return { success: true, message: "Categoría eliminada correctamente" }
  } catch (error) {
    console.error("Error eliminando categoría:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error eliminando categoría" 
    }
  }
}

export async function checkSlugUniqueAction(slug: string, excludeId?: string) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    const existingCategory = await getCategoryBySlug(slug.trim().toLowerCase())
    
    // Si existe y no es la misma categoría que estamos editando
    const isUnique = !existingCategory || existingCategory.id === excludeId
    
    return { success: true, isUnique }
  } catch (error) {
    console.error("Error verificando slug:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error verificando slug" 
    }
  }
}