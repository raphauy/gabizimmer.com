import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Wrench } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Configuración del sistema y personalización
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-6 h-6 text-muted-foreground" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Settings className="w-5 h-5" />
            En Desarrollo
          </CardTitle>
          <CardDescription>
            Esta sección está siendo construida
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Las opciones de configuración estarán disponibles próximamente. 
            Aquí podrás personalizar el sitio, gestionar configuraciones generales 
            y ajustar parámetros del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}