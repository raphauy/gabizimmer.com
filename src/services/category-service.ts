import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { type Category } from "@prisma/client"

// Tipo personalizado para categorías con conteo de posts
export type CategoryWithPostCount = Category & { _count: { posts: number } }

// ✅ Validaciones al inicio del archivo
export const createCategorySchema = z.object({
  name: z.string()
    .min(1, "Nombre requerido")
    .max(100, "Máximo 100 caracteres")
    .trim(),
  slug: z.string()
    .min(1, "Slug requerido") 
    .max(100, "Máximo 100 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug debe ser lowercase con guiones")
    .trim(),
  description: z.string()
    .max(500, "Máximo 500 caracteres")
    .nullable()
    .optional()
})

export const updateCategorySchema = createCategorySchema.partial()

// Tipos derivados de schemas
export type CreateCategoryData = z.infer<typeof createCategorySchema>
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>

/**
 * Obtiene una categoría por ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  return await prisma.category.findUnique({ 
    where: { id } 
  })
}

/**
 * Obtiene una categoría por slug (para validar unicidad)
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return await prisma.category.findUnique({ 
    where: { slug } 
  })
}

/**
 * Obtiene todas las categorías
 */
export async function getAllCategories(): Promise<Category[]> {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
}

/**
 * Obtiene todas las categorías con conteo de posts asociados
 */
export async function getCategoriesWithPostCount(): Promise<CategoryWithPostCount[]> {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    },
    orderBy: {
      posts: {
        _count: 'desc'
      }
    }
  })
}

/**
 * Crea una nueva categoría
 */
export async function createCategory(data: CreateCategoryData): Promise<Category> {
  const validated = createCategorySchema.parse(data)
  
  // Verificar que el slug no exista
  const existingCategory = await getCategoryBySlug(validated.slug)
  if (existingCategory) {
    throw new Error("Ya existe una categoría con este slug")
  }
  
  return await prisma.category.create({
    data: validated
  })
}

/**
 * Actualiza una categoría existente
 */
export async function updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
  const validated = updateCategorySchema.parse(data)
  
  // Si se está actualizando el slug, verificar que no exista en otra categoría
  if (validated.slug) {
    const existingCategory = await getCategoryBySlug(validated.slug)
    if (existingCategory && existingCategory.id !== id) {
      throw new Error("Ya existe una categoría con este slug")
    }
  }
  
  return await prisma.category.update({
    where: { id },
    data: validated
  })
}

/**
 * Elimina una categoría (solo si no tiene posts asociados)
 */
export async function deleteCategory(id: string): Promise<Category> {
  // Verificar si tiene posts asociados
  const postsCount = await prisma.post.count({
    where: { categoryId: id }
  })
  
  if (postsCount > 0) {
    throw new Error(`No se puede eliminar: la categoría tiene ${postsCount} post(s) asociado(s)`)
  }
  
  return await prisma.category.delete({
    where: { id }
  })
}

/**
 * Obtiene estadísticas de categorías
 */
export async function getCategoriesStats() {
  const [totalCategories, categoriesWithPosts, mostUsedCategory] = await Promise.all([
    prisma.category.count(),
    prisma.category.count({
      where: {
        posts: {
          some: {}
        }
      }
    }),
    prisma.category.findFirst({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      }
    })
  ])

  return {
    totalCategories,
    categoriesWithPosts,
    categoriesWithoutPosts: totalCategories - categoriesWithPosts,
    mostUsedCategory: mostUsedCategory ? {
      name: mostUsedCategory.name,
      postsCount: mostUsedCategory._count.posts
    } : null
  }
}