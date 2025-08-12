# PRP: Agente de IA Moderador de Comentarios

## Goal
Implementar un sistema automatizado de moderación de comentarios usando IA que analice cada nuevo comentario enviado al blog, determine si es apropiado según criterios de calidad y relevancia para un blog de vinos y gastronomía, apruebe automáticamente los comentarios válidos, rechace los inadecuados enviando notificación por email, y registre el nombre del moderador (humano o "Agente IA") en el sistema.

## Why
- **Eficiencia operativa**: Reducir el 80% del trabajo manual de moderación de comentarios permitiendo que Gabi se enfoque en crear contenido
- **Respuesta inmediata**: Los lectores ven sus comentarios apropiados publicados instantáneamente, mejorando engagement
- **Calidad del contenido**: Filtrar automáticamente spam, contenido ofensivo o irrelevante manteniendo alto nivel editorial
- **Transparencia**: Notificar a Gabi sobre rechazos con justificación clara del agente
- **Trazabilidad**: Saber quién aprobó cada comentario (humano o IA) para auditoría y mejora continua

## What
Sistema de moderación automática que intercepta cada nuevo comentario antes de guardarlo, utiliza Vercel AI SDK con GPT-5 para análisis semántico, aplica criterios específicos del dominio de vinos/gastronomía, y ejecuta acciones automáticas según el resultado.

### Success Criteria
- [ ] Todo comentario nuevo pasa por el agente IA antes de ser guardado con estado final
- [ ] Comentarios apropiados se aprueban automáticamente y aparecen en el blog instantáneamente
- [ ] Comentarios rechazados generan email a gabi@gabizimmer.com con copia a rapha.uy@rapha.uy
- [ ] Campo `approvedBy` en BD muestra "Agente IA" o nombre del moderador humano
- [ ] El agente usa generateObject de Vercel AI SDK con modelo "openai/gpt-5" (no mini)
- [ ] Tests de integración validan casos de aprobación y rechazo
- [ ] Sistema funciona sin afectar la moderación manual existente en /admin/comments

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Arquitectura en capas, solo services/ accede a Prisma
  
- file: /docs/features.md
  why: Contexto del proyecto y features implementadas
  sections: "Features de Administrador > Sistema de Moderación de Comentarios"
  
- file: prisma/schema.prisma
  why: Modelo Comment actual, necesario agregar campo approvedBy
  lines: 122-138
  
- file: src/services/comment-service.ts
  why: Lógica actual de creación y moderación de comentarios
  focus: createComment(), isSpam(), auto-aprobación existente
  
- file: src/services/email-service.ts
  why: Sistema de envío de emails con Resend
  focus: sendOtpEmail() como referencia
  
- file: src/components/emails/otp-email.tsx
  why: Template de email a replicar para notificaciones
  
- file: src/app/api/chat/route.ts
  why: Implementación actual con Vercel AI SDK
  focus: configuración del modelo y gateway
  
- url: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
  why: Documentación oficial de generateObject
  section: "generateObject with zod schema"
  
- file: src/app/admin/comments/comments-list.tsx
  why: UI donde debe aparecer el campo approvedBy
  lines: 195-204
```

### Current Codebase Tree
```bash
src/
├── services/
│   ├── comment-service.ts      # Crear, moderar, auto-aprobar
│   ├── email-service.ts        # Envío con Resend
│   └── ai-moderation-service.ts # NUEVO - Agente IA
├── components/
│   └── emails/
│       ├── otp-email.tsx       # Template existente
│       └── comment-rejected-email.tsx # NUEVO
├── app/
│   └── admin/
│       └── comments/
│           └── comments-list.tsx # Mostrar approvedBy
└── lib/
    └── ai-config.ts            # NUEVO - Config compartida AI
```

### Desired Codebase Tree
```bash
src/
├── services/
│   └── ai-moderation-service.ts # Moderación con IA
├── components/
│   └── emails/
│       └── comment-rejected-email.tsx # Notificación rechazo
├── lib/
│   └── ai-config.ts           # Gateway y modelos AI
└── prisma/
    └── schema.prisma          # Comment con approvedBy
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Arquitectura en capas (docs/architecture.md)
// - SOLO services/ puede importar prisma
// - Validaciones Zod co-ubicadas en servicios
// - Server Actions usan servicios, nunca Prisma directo

// PATTERN: Configuración AI Gateway actual
// src/app/api/chat/route.ts usa:
const result = streamText({
  model: 'openai/gpt-5-mini',
  // Para moderación usar 'openai/gpt-5' (sin mini)
})

// PATTERN: generateObject con Zod schema
import { generateObject } from 'ai'
import { z } from 'zod'

const moderationSchema = z.object({
  isAppropriate: z.boolean(),
  reason: z.string().optional(),
  confidence: z.number().min(0).max(1)
})

// GOTCHA: Variables de entorno
// AI_GATEWAY_API_KEY ya existe y funciona
// No necesitas OPENAI_API_KEY directo

// PATTERN: Email service
// Solo loguea en desarrollo, envía en producción
if (process.env.VERCEL_ENV === 'development') {
  console.log('📧 Email:', { to, subject })
  return { success: true }
}

// GOTCHA: Revalidación de paths
revalidatePath('/admin/comments')
revalidatePath('/blog/[slug]')
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// 1. Actualizar Prisma Schema
model Comment {
  id          String        @id @default(cuid())
  content     String        @db.Text
  status      CommentStatus @default(PENDING)
  
  postId      String
  post        Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  authorName  String
  authorEmail String
  
  // NUEVO: Campo para tracking de aprobación
  approvedBy  String?       // "Agente IA", email del user, o null
  rejectionReason String?    // Razón del rechazo por IA
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  @@index([postId, status])
  @@map("comments")
}

// 2. Servicio de Moderación IA
// src/services/ai-moderation-service.ts
import { generateObject } from 'ai'
import { z } from 'zod'

const moderationResultSchema = z.object({
  isAppropriate: z.boolean(),
  reason: z.string().describe('Breve explicación si es rechazado'),
  confidence: z.number().min(0).max(1),
  category: z.enum(['spam', 'offensive', 'off-topic', 'low-quality', 'appropriate'])
})

export type ModerationResult = z.infer<typeof moderationResultSchema>

// 3. Email Template Types
export interface CommentRejectedEmailProps {
  commentContent: string
  postTitle: string
  authorName: string
  authorEmail: string
  rejectionReason: string
  commentDate: Date
}
```

### Task List (Orden de Implementación)
```yaml
Task 1: Update Database Schema
MODIFY prisma/schema.prisma:
  - ADD approvedBy String? al modelo Comment
  - ADD rejectionReason String? al modelo Comment
  - RUN: pnpm prisma db push
  - VALIDATE: pnpm prisma studio - verificar nuevos campos

Task 2: Create AI Configuration Module
CREATE src/lib/ai-config.ts:
  - EXPORT configuración compartida para AI
  - MODEL: 'openai/gpt-5' para moderación
  - REUSE: AI_GATEWAY_API_KEY existente
  - SYSTEM PROMPT: Especializado en blog de vinos

Task 3: Create AI Moderation Service
CREATE src/services/ai-moderation-service.ts:
  - PATTERN: Arquitectura en capas - puede importar prisma
  - IMPLEMENT moderateComment(content, postTitle, authorInfo)
  - USE generateObject con schema Zod
  - RETURN ModerationResult con decisión y razón
  - SYSTEM PROMPT: Criterios para blog de vinos/gastronomía
  - HANDLE errores: Si IA falla, devolver PENDING

Task 4: Create Email Template for Rejections
CREATE src/components/emails/comment-rejected-email.tsx:
  - COPY estructura de otp-email.tsx
  - DESIGN: Header con gradiente wine colors
  - CONTENT: Comentario, post, autor, razón, fecha
  - STYLE: Consistente con brand Gabi Zimmer
  - CTA: Link al panel de moderación

Task 5: Extend Email Service
MODIFY src/services/email-service.ts:
  - ADD sendCommentRejectionEmail()
  - TO: gabi@gabizimmer.com
  - CC: rapha.uy@rapha.uy
  - SUBJECT: "Comentario rechazado por moderación automática"
  - USE CommentRejectedEmail template

Task 6: Integrate AI into Comment Creation
MODIFY src/services/comment-service.ts:
  - IMPORT ai-moderation-service
  - IN createComment():
    - BEFORE crear comentario, llamar moderateComment()
    - IF appropriate: status = APPROVED, approvedBy = "Agente IA"
    - IF not appropriate: 
      - status = REJECTED
      - approvedBy = "Agente IA"
      - rejectionReason = reason from AI
      - SEND email notification
    - IF AI fails: mantener flujo actual (PENDING)
  - PRESERVE: Auto-aprobación para usuarios con historial

Task 7: Update Admin UI to Show Approver
MODIFY src/app/admin/comments/comments-list.tsx:
  - ADD columna "Aprobado por" después de Estado
  - SHOW comment.approvedBy || '-'
  - STYLE: Text muted para "Agente IA"
  - WIDTH: Ajustar anchos de columnas

Task 8: Update Comment Types
MODIFY src/services/comment-service.ts:
  - UPDATE CommentWithPost type
  - ADD approvedBy y rejectionReason a tipos

Task 9: Add Tooltip for Rejection Reason
MODIFY src/app/admin/comments/comment-actions-client.tsx:
  - IF status === REJECTED && rejectionReason
  - ADD Tooltip con razón del rechazo
  - USE componente Tooltip de shadcn/ui

Task 10: Create Integration Tests
CREATE src/services/__tests__/ai-moderation.test.ts:
  - TEST comentario apropiado → aprobado
  - TEST spam → rechazado con email
  - TEST ofensivo → rechazado con email
  - TEST fallo de IA → PENDING status
  - MOCK generateObject para tests

Task 11: Update Seed Data
MODIFY prisma/seed-comments.ts:
  - ADD comentarios con approvedBy = "Agente IA"
  - ADD comentarios con rejectionReason
  - TEST visualización en admin panel
```

### Per-Task Pseudocode
```typescript
// Task 3: AI Moderation Service
// src/services/ai-moderation-service.ts
import { generateObject } from 'ai'
import { z } from 'zod'

const moderationResultSchema = z.object({
  isAppropriate: z.boolean(),
  reason: z.string().optional(),
  confidence: z.number(),
  category: z.enum(['spam', 'offensive', 'off-topic', 'low-quality', 'appropriate'])
})

export async function moderateComment({
  content,
  postTitle,
  authorName,
  authorEmail
}: {
  content: string
  postTitle: string
  authorName: string
  authorEmail: string
}) {
  try {
    const result = await generateObject({
      model: 'openai/gpt-5', // No mini para mejor calidad
      system: `Eres un moderador experto para el blog de Gabi Zimmer sobre vinos y gastronomía.
        
        Criterios de APROBACIÓN:
        - Relacionado con vinos, gastronomía, maridajes o experiencias culinarias
        - Preguntas genuinas o aportes constructivos
        - Experiencias personales relevantes
        - Opiniones respetuosas aunque sean diferentes
        
        Criterios de RECHAZO:
        - Spam o contenido promocional no relacionado
        - Lenguaje ofensivo, agresivo o inapropiado
        - Completamente fuera de tema (off-topic)
        - Contenido de muy baja calidad o sin sentido
        - Enlaces sospechosos o phishing
        
        Sé estricto con spam pero permisivo con opiniones diversas sobre vinos.`,
      
      prompt: `Analiza este comentario del blog:
        
        Post: "${postTitle}"
        Autor: ${authorName} (${authorEmail})
        Comentario: "${content}"
        
        Determina si debe ser aprobado o rechazado.`,
      
      schema: moderationResultSchema,
      temperature: 0.3, // Baja para consistencia
    })
    
    return result.object
  } catch (error) {
    console.error('Error en moderación IA:', error)
    // Si falla, devolver null para usar flujo tradicional
    return null
  }
}

// Task 6: Integración en comment-service.ts
export async function createComment(data: unknown) {
  const validated = createCommentSchema.parse(data)
  
  // Verificar post existe y está publicado
  const post = await prisma.post.findUnique({
    where: { id: validated.postId },
    select: { id: true, title: true, status: true }
  })
  
  if (!post || post.status !== 'PUBLISHED') {
    throw new Error('Post no encontrado o no publicado')
  }
  
  // NUEVO: Moderación con IA
  const moderation = await moderateComment({
    content: validated.content,
    postTitle: post.title,
    authorName: validated.authorName,
    authorEmail: validated.authorEmail
  })
  
  let finalStatus: CommentStatus = 'PENDING'
  let approvedBy: string | null = null
  let rejectionReason: string | null = null
  
  if (moderation) {
    if (moderation.isAppropriate) {
      finalStatus = 'APPROVED'
      approvedBy = 'Agente IA'
    } else {
      finalStatus = 'REJECTED'
      approvedBy = 'Agente IA'
      rejectionReason = moderation.reason || 'Contenido inadecuado'
      
      // Enviar email de notificación
      await sendCommentRejectionEmail({
        commentContent: validated.content,
        postTitle: post.title,
        authorName: validated.authorName,
        authorEmail: validated.authorEmail,
        rejectionReason,
        commentDate: new Date()
      })
    }
  } else {
    // Si IA falla, usar lógica tradicional
    if (isSpam(validated.content)) {
      finalStatus = 'REJECTED'
      rejectionReason = 'Detectado como spam'
    } else {
      // Check auto-aprobación por historial
      const hasApprovedComments = await checkUserHistory(validated.authorEmail)
      if (hasApprovedComments) {
        finalStatus = 'APPROVED'
        approvedBy = 'Auto-aprobado por historial'
      }
    }
  }
  
  // Crear comentario con estado final
  return await prisma.comment.create({
    data: {
      ...validated,
      status: finalStatus,
      approvedBy,
      rejectionReason
    }
  })
}
```

### Integration Points
```yaml
DATABASE:
  - migration: pnpm prisma db push después de actualizar schema
  - validation: pnpm prisma studio para verificar campos
  
AI GATEWAY:
  - variable: AI_GATEWAY_API_KEY (ya existe)
  - modelo: 'openai/gpt-5' para moderación
  - fallback: Si falla, usar flujo PENDING tradicional

EMAIL:
  - servicio: Resend con templates React Email
  - desarrollo: Solo loguea, no envía
  - producción: Envía a gabi@gabizimmer.com con CC
  
ADMIN UI:
  - tabla: Nueva columna "Aprobado por"
  - tooltip: Mostrar razón de rechazo si existe
  - responsive: Ajustar anchos de columnas
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Después de cada cambio
pnpm run lint
pnpm run typecheck
# Expected: 0 errores
```

### Level 2: Database
```bash
# Después de modificar schema
pnpm prisma validate
pnpm prisma db push
pnpm prisma studio
# Expected: Campos approvedBy y rejectionReason visibles
```

### Level 3: Unit Tests
```typescript
// src/services/__tests__/ai-moderation.test.ts
import { moderateComment } from '../ai-moderation-service'
import { vi } from 'vitest'

describe('AI Comment Moderation', () => {
  test('approves wine-related comment', async () => {
    const result = await moderateComment({
      content: 'Excelente maridaje con Tannat!',
      postTitle: 'Vinos uruguayos para el asado',
      authorName: 'Juan',
      authorEmail: 'juan@test.com'
    })
    expect(result?.isAppropriate).toBe(true)
  })
  
  test('rejects spam comment', async () => {
    const result = await moderateComment({
      content: 'Buy cheap viagra online NOW!!!',
      postTitle: 'Vinos uruguayos',
      authorName: 'Spammer',
      authorEmail: 'spam@test.com'
    })
    expect(result?.isAppropriate).toBe(false)
    expect(result?.category).toBe('spam')
  })
})
```

### Level 4: Integration Testing
```bash
# 1. Crear comentario de prueba
curl -X POST http://localhost:3000/blog/[slug]/comments \
  -d '{"content":"Gran artículo sobre Tannat!","authorName":"Test","authorEmail":"test@test.com"}'

# 2. Verificar en admin panel
# http://localhost:3000/admin/comments
# Expected: Comentario con "Aprobado por: Agente IA"

# 3. Test rechazo
curl -X POST http://localhost:3000/blog/[slug]/comments \
  -d '{"content":"Click here for free money!!!","authorName":"Spam","authorEmail":"spam@test.com"}'

# 4. Verificar email en logs (desarrollo)
# Expected: Log con email de rechazo
```

### Level 5: Production Build
```bash
pnpm run build
# Expected: Build exitoso

pnpm run start
# Test flows completos en localhost:3000
```

## Final Checklist

### Arquitectura en Capas
- [ ] ai-moderation-service.ts en src/services/
- [ ] Solo services/ importa Prisma
- [ ] Validaciones Zod co-ubicadas
- [ ] Email service extiende patrón existente

### Funcionalidad Core
- [ ] generateObject con schema Zod funciona
- [ ] Modelo 'openai/gpt-5' configurado
- [ ] Fallback a PENDING si IA falla
- [ ] Email enviado en rechazos
- [ ] Campo approvedBy guardado correctamente

### UI/UX
- [ ] Columna "Aprobado por" visible en admin
- [ ] Tooltip con razón de rechazo
- [ ] Responsive design mantenido
- [ ] Dark mode soportado

### Calidad
- [ ] Tests unitarios pasan
- [ ] Tests de integración verificados
- [ ] Sin errores de lint/types
- [ ] Build de producción exitoso
- [ ] Documentación actualizada

## Anti-Patterns to Avoid

### Arquitectura
- ❌ NO importar Prisma fuera de services/
- ❌ NO crear API route nueva (usar service directo)
- ❌ NO modificar el flujo de moderación manual
- ❌ NO bloquear si IA falla (usar fallback)

### IA y Prompts
- ❌ NO usar GPT-5-mini para moderación
- ❌ NO hacer prompts genéricos (especializar en vinos)
- ❌ NO temperatura alta (usar 0.3 para consistencia)
- ❌ NO olvidar manejar errores de IA

### Email y Notificaciones
- ❌ NO enviar emails en desarrollo
- ❌ NO olvidar CC a rapha.uy@rapha.uy
- ❌ NO exponer emails de usuarios en notificaciones
- ❌ NO enviar emails por comentarios aprobados

## Score de Confianza: 9/10

Este PRP tiene alta probabilidad de éxito porque:
- Reutiliza patrones existentes del proyecto
- Integración mínima con código actual
- Fallbacks claros si IA falla
- Documentación oficial de Vercel AI SDK clara
- Sistema de emails ya probado y funcionando