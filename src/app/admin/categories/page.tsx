import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CategoriesList } from "./categories-list"
import { CategoriesTableSkeleton } from "./categories-table-skeleton"

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Categorías</h2>
          <p className="text-muted-foreground">
            Administra las categorías del blog para organizar el contenido
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
          <CardDescription>
            Todas las categorías disponibles para organizar posts del blog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<CategoriesTableSkeleton />}>
            <CategoriesList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}