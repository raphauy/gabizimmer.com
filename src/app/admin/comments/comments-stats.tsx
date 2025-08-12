import { getCommentsStatsAction } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react"

export async function CommentsStats() {
  const result = await getCommentsStatsAction()
  
  if (!result.success || !result.stats) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Error al cargar estadísticas
      </div>
    )
  }

  const { stats } = result

  const statsCards = [
    {
      title: "Total de Comentarios",
      value: stats.totalComments,
      icon: MessageSquare,
      className: "text-blue-600",
      bgClassName: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Pendientes",
      value: stats.pendingComments,
      icon: Clock,
      className: "text-amber-600",
      bgClassName: "bg-amber-100 dark:bg-amber-900/20"
    },
    {
      title: "Aprobados",
      value: stats.approvedComments,
      icon: CheckCircle,
      className: "text-green-600",
      bgClassName: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Rechazados",
      value: stats.rejectedComments,
      icon: XCircle,
      className: "text-red-600",
      bgClassName: "bg-red-100 dark:bg-red-900/20"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgClassName}`}>
                <Icon className={`h-4 w-4 ${stat.className}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === "Pendientes" && stat.value > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Requieren moderación
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
      
      {stats.mostCommentedPost && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Post Más Comentado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{stats.mostCommentedPost.title}</p>
              <p className="text-sm text-muted-foreground">
                {stats.mostCommentedPost.commentsCount} comentarios
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {stats.uniqueCommenters > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Participación de la Comunidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-bold text-lg">{stats.uniqueCommenters}</span> personas únicas han comentado en tu blog
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}