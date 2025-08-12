import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCategoriesWithPostCount } from "@/services/category-service"
import { CategoryActionsClient } from "./category-actions-client"
import Link from "next/link"

export async function CategoriesList() {
  const categories = await getCategoriesWithPostCount()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-jost font-medium">Nombre</TableHead>
              <TableHead className="font-jost font-medium">Slug</TableHead>
              <TableHead className="font-jost font-medium">Posts</TableHead>
              <TableHead className="font-jost font-medium">Creada</TableHead>
              <TableHead className="text-right font-jost font-medium">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay categorías registradas
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <Link 
                        href={`/admin/categories/${category.id}/edit`}
                        className="font-jost font-medium text-wine-primary hover:text-wine-accent hover:underline transition-colors"
                      >
                        {category.name}
                      </Link>
                      {category.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {category.slug}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${
                        category._count.posts > 0 
                          ? "text-wine-primary border-wine-primary" 
                          : "text-muted-foreground"
                      }`}
                    >
                      {category._count.posts} post{category._count.posts !== 1 ? "s" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <CategoryActionsClient category={category} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Total: {categories.length} categoría{categories.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}