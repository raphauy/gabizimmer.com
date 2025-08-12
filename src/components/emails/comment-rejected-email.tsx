import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'

export interface CommentRejectedEmailProps {
  commentContent: string
  postTitle: string
  authorName: string
  authorEmail: string
  rejectionReason: string
  commentDate?: Date
}

export default function CommentRejectedEmail({
  commentContent = "Este es un comentario de ejemplo...",
  postTitle = "Los mejores vinos uruguayos para el verano",
  authorName = "Usuario Ejemplo",
  authorEmail = "usuario@ejemplo.com",
  rejectionReason = "Contenido detectado como spam",
  commentDate = new Date()
}: CommentRejectedEmailProps) {
  const appName = "gabizimmer.com"
  const adminUrl = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/admin/comments` : 'https://gabizimmer.com/admin/comments'
  
  return (
    <Html>
      <Head />
      <Preview>Comentario rechazado automáticamente en {postTitle}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-4 px-4 w-[600px] max-w-full">
            <Section className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              {/* Header con gradiente vino */}
              <Section 
                className="text-white text-center py-4" 
                style={{
                  background: 'linear-gradient(135deg, #722f37 0%, #b565d8 100%)', 
                  color: '#ffffff', 
                  textAlign: 'center', 
                  padding: '20px 0'
                }}
              >
                <Container className="px-4">
                  <Heading className="text-xl font-bold m-0 text-white" style={{color: '#ffffff', margin: 0}}>
                    🤖 Moderación Automática
                  </Heading>
                  <Text className="text-white mt-1 mb-0 text-sm opacity-90" style={{color: '#ffffff', fontSize: '14px', margin: '4px 0 0 0'}}>
                    Comentario Rechazado por el Agente IA
                  </Text>
                </Container>
              </Section>

              {/* Contenido principal */}
              <Section className="px-6 pt-4 pb-4">
                {/* Información de rechazo */}
                <Section className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <Text className="text-red-800 font-semibold text-sm m-0 mb-2">
                    📛 Razón del rechazo:
                  </Text>
                  <Text className="text-red-700 text-sm m-0">
                    {rejectionReason}
                  </Text>
                </Section>

                {/* Detalles del comentario */}
                <Heading className="text-gray-900 text-lg font-semibold mb-3 mt-4">
                  Detalles del Comentario
                </Heading>
                
                {/* Post */}
                <div className="mb-3">
                  <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">
                    Post:
                  </Text>
                  <Text className="text-gray-900 text-sm m-0">
                    {postTitle}
                  </Text>
                </div>

                {/* Autor */}
                <div className="mb-3">
                  <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">
                    Autor:
                  </Text>
                  <Text className="text-gray-900 text-sm m-0">
                    {authorName} ({authorEmail})
                  </Text>
                </div>

                {/* Fecha */}
                <div className="mb-3">
                  <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">
                    Fecha:
                  </Text>
                  <Text className="text-gray-900 text-sm m-0">
                    {commentDate.toLocaleString('es-UY', { 
                      dateStyle: 'long', 
                      timeStyle: 'short',
                      timeZone: 'America/Montevideo'
                    })}
                  </Text>
                </div>

                {/* Contenido del comentario */}
                <div className="mb-4">
                  <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">
                    Contenido del comentario:
                  </Text>
                  <Section className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <Text className="text-gray-800 text-sm m-0 whitespace-pre-wrap">
                      {commentContent}
                    </Text>
                  </Section>
                </div>

                {/* Botón de acción */}
                <Section className="text-center mt-6">
                  <Button
                    href={adminUrl}
                    className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg inline-block"
                    style={{
                      background: '#9333ea',
                      color: '#ffffff',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    Revisar en Panel de Admin
                  </Button>
                </Section>

                {/* Nota informativa */}
                <Section className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <Text className="text-blue-800 text-xs m-0">
                    💡 <strong>Nota:</strong> Este comentario fue analizado y rechazado automáticamente por el sistema de moderación con IA. 
                    Si consideras que fue un error, puedes aprobarlo manualmente desde el panel de administración.
                  </Text>
                </Section>
              </Section>

              {/* Footer */}
              <Section className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <Text className="text-gray-500 text-xs text-center m-0">
                  Este email fue enviado automáticamente por el sistema de moderación de {appName}.
                </Text>
                <Text className="text-gray-500 text-xs text-center mt-1 mb-0">
                  Configurado para notificar a: gabi@gabizimmer.com con copia a rapha.uy@rapha.uy
                </Text>
                <Text className="text-gray-400 text-xs text-center mt-2 mb-0">
                  © 2024 {appName}. Todos los derechos reservados.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}