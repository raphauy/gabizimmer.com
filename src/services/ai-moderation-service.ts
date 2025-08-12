import { generateObject } from 'ai'
import { z } from 'zod'
import { AI_CONFIG } from '@/lib/ai-config'

// Schema para el resultado de moderación
const moderationResultSchema = z.object({
  isAppropriate: z.boolean().describe('Si el comentario es apropiado para publicar'),
  reason: z.string().optional().describe('Breve explicación si es rechazado'),
  confidence: z.number().min(0).max(1).describe('Nivel de confianza en la decisión'),
  category: z.enum(['spam', 'offensive', 'off-topic', 'low-quality', 'appropriate'])
    .describe('Categoría del comentario')
})

export type ModerationResult = z.infer<typeof moderationResultSchema>

// Interfaz para los parámetros de moderación
export interface ModerateCommentParams {
  content: string
  postTitle: string
  authorName: string
  authorEmail: string
}

/**
 * Modera un comentario usando IA para determinar si debe ser aprobado
 * @returns ModerationResult con la decisión o null si falla
 */
export async function moderateComment({
  content,
  postTitle,
  authorName,
  authorEmail
}: ModerateCommentParams): Promise<ModerationResult | null> {
  try {
    // Validar que tenemos la API key configurada
    if (!AI_CONFIG.gatewayApiKey) {
      console.error('AI_GATEWAY_API_KEY no está configurada')
      return null
    }

    // Preparar el prompt con contexto del comentario
    const prompt = `Analiza este comentario del blog de vinos y gastronomía:
    
    Post: "${postTitle}"
    Autor: ${authorName} (${authorEmail})
    Comentario: "${content}"
    
    Determina si debe ser aprobado o rechazado según los criterios establecidos.
    Si lo rechazas, proporciona una razón breve y clara.`

    // Llamar a generateObject con el modelo de moderación
    const result = await generateObject({
      model: AI_CONFIG.models.moderation,
      system: AI_CONFIG.moderation.systemPrompt,
      prompt,
      schema: moderationResultSchema,
      temperature: AI_CONFIG.moderation.temperature,
    })
    
    // Log para debugging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🤖 Moderación IA:', {
        comentario: content.substring(0, 50) + '...',
        resultado: result.object
      })
    }
    
    return result.object
    
  } catch (error) {
    console.error('Error en moderación IA:', error)
    
    // Si el error es por límite de rate o timeout, podríamos reintentar
    // Por ahora, simplemente devolvemos null para usar el flujo tradicional
    return null
  }
}

/**
 * Verifica si un email parece sospechoso (para validación adicional)
 */
export function isSuspiciousEmail(email: string): boolean {
  const suspiciousPatterns = [
    /^[a-z0-9]{20,}@/, // Emails muy largos aleatorios
    /@(guerrillamail|mailinator|10minutemail|tempmail)/i, // Emails temporales conocidos
    /^(test|spam|xxx|admin|root)@/i, // Nombres sospechosos
  ]
  
  return suspiciousPatterns.some(pattern => pattern.test(email))
}

/**
 * Analiza el sentimiento de un comentario (útil para estadísticas)
 */
export async function analyzeCommentSentiment(content: string): Promise<'positive' | 'neutral' | 'negative' | null> {
  try {
    const result = await generateObject({
      model: AI_CONFIG.models.moderation,
      prompt: `Analiza el sentimiento de este comentario: "${content}"`,
      schema: z.object({
        sentiment: z.enum(['positive', 'neutral', 'negative'])
      }),
      temperature: 0.3,
    })
    
    return result.object.sentiment
  } catch (error) {
    console.error('Error analizando sentimiento:', error)
    return null
  }
}