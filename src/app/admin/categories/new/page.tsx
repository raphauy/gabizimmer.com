import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryForm } from "../category-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewCategoryPage() {
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
        <h2 className="text-3xl font-bold tracking-tight">Nueva Categoría</h2>
        <p className="text-muted-foreground">
          Crea una nueva categoría para organizar el contenido del blog
        </p>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  )
}