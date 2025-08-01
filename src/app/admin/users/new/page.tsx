import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UserForm } from "../user-form"

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invitar Colaborador</h2>
          <p className="text-muted-foreground">
            Invitar un nuevo colaborador al sitio
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Colaborador</CardTitle>
          <CardDescription>
            Complete los datos para invitar un nuevo colaborador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>
    </div>
  )
}