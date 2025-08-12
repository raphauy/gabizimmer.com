import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryForm } from "../../category-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCategoryById } from "@/services/category-service"
import { notFound } from "next/navigation"

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  // CRITICAL: Next.js 15 - await params antes de usar propiedades
  const { id } = await params
  
  const category = await getCategoryById(id)

  if (!category) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb y navegación */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/categories">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a Categorías
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Editar Categoría</h2>
        <p className="text-muted-foreground">
          Modifica la información de la categoría &quot;{category.name}&quot;
        </p>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm category={category} isEdit />
        </CardContent>
      </Card>
    </div>
  )
}