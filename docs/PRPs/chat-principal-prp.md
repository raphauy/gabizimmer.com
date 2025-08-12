# PRP: Chat Principal para gabizimmer.com

## Goal
Implementar un chat interactivo con IA en la página principal de gabizimmer.com que permita a los visitantes hacer preguntas sobre vinos, catas y el contenido de Gabi Zimmer, con un diseño visual inspirado en el chat del simulador de Bond pero adaptado a la identidad de marca de Gabi (tema de vinos, colores wine-primary).

## Why
- **Valor de negocio**: Aumentar engagement de visitantes ofreciendo respuestas instantáneas sobre vinos y el expertise de Gabi
- **Impacto en usuarios**: Los lectores pueden obtener recomendaciones personalizadas de vinos y maridajes sin navegar por todo el sitio
- **Integración con features existentes**: Preparar la base para futuras integraciones con el blog y sistema de contenido
- **Problemas que resuelve**: Falta de interactividad en el sitio actual, necesidad de un punto de contacto dinámico con la audiencia

## What
Chat con IA usando Vercel AI SDK v5 que responde preguntas sobre vinos, especialmente uruguayos, con conocimiento del contenido y expertise de Gabi Zimmer. Sin persistencia inicial, usando OpenAI GPT-5-mini a través de AI Gateway de Vercel.

### Success Criteria
- [ ] Chat funcional en `/chat` con streaming de respuestas
- [ ] Diseño visual adaptado del simulador de Bond al tema wine de Gabi
- [ ] Greeting personalizado mencionando a Gabi y vinos
- [ ] Input multimodal estilizado con bordes redondeados como Bond
- [ ] Header y Footer del sitio integrados
- [ ] Respuestas contextualizadas sobre vinos uruguayos
- [ ] Build de producción sin errores
- [ ] Responsive design mobile-first
- [ ] Dark mode funcional

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Arquitectura en capas estricta, solo services/ accede a Prisma
  
- file: /docs/sistema-diseno-gz.md
  why: Sistema de diseño completo con colores wine, tipografías y componentes
  
- file: /package.json
  why: Verificar que AI SDK v5 ya está instalado (ai: "^5.0.0")
  
- file: /src/components/layout/header.tsx
  why: Header existente para reutilizar en la página del chat
  
- file: /src/components/layout/footer.tsx
  why: Footer existente para mantener consistencia
  
- file: /src/app/layout.tsx
  why: Layout principal con providers y configuración de fuentes

# Bond Reference Files (para adaptar diseño)
- file: /home/raphael/desarrollo/bond/src/app/a/[slug]/manage/agents/[id]/simulator/chat-interface.tsx
  why: Componente principal del chat a adaptar, estructura y hooks
  
- file: /home/raphael/desarrollo/bond/src/components/simulator/greeting.tsx
  why: Greeting component a personalizar para Gabi
  
- file: /home/raphael/desarrollo/bond/src/components/simulator/message.tsx
  why: Componente de mensaje con estilos y markdown
  
- url: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
  why: Documentación oficial Vercel AI SDK v5 para implementación básica
  section: "Build a Chatbot"
  
- url: https://ai-sdk.dev/providers/openai#ai-gateway
  why: Configuración de AI Gateway de Vercel con OpenAI
  section: "AI Gateway"
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── admin/           # Panel superadmin (no tocar)
│   ├── blog/           # Blog público
│   ├── api/            # API routes existentes
│   ├── layout.tsx      # Layout principal con providers
│   └── page.tsx        # Landing actual (mantener)
├── components/
│   ├── layout/         # Header y Footer listos
│   │   ├── header.tsx  # Header con nav y theme toggle
│   │   └── footer.tsx  # Footer con info de Gabi
│   └── ui/            # shadcn/ui v4 componentes
├── services/          # ÚNICA capa con acceso a Prisma
└── lib/              # Utilidades y configuración
```

### Desired Codebase Tree
```bash
src/
├── app/
│   ├── chat/                    # Nueva ruta del chat
│   │   ├── page.tsx            # RSC página principal del chat
│   │   ├── chat-interface.tsx  # Cliente con useChat hook
│   │   └── actions.ts          # Server actions si necesarias
│   └── api/
│       └── chat/
│           └── route.ts        # POST endpoint para AI SDK
├── components/
│   └── chat/                   # Componentes del chat
│       ├── greeting.tsx        # Saludo personalizado Gabi
│       ├── message.tsx         # Mensaje adaptado de Bond
│       ├── typing-dots.tsx     # Indicador de escritura
│       └── message-content.tsx # Renderizado markdown
└── services/
    └── ai-service.ts           # Configuración del modelo (opcional)
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: AI SDK v5 ya está instalado (verificado en package.json)
// - Usar import { useChat } from 'ai/react'
// - Endpoint debe ser POST en app/api/chat/route.ts
// - Modelo: openai/gpt-5-mini con AI Gateway de Vercel

// PATTERN: AI Gateway de Vercel (NO necesita OPENAI_API_KEY)
// Usar: import { createOpenAI } from '@ai-sdk/openai'
// Config con baseURL de AI Gateway y API Key de AI_GATEWAY_API_KEY

// PATTERN: Adaptación visual Bond → Gabi
// Bond usa: amber-600, purple-700, gray borders
// Gabi usar: wine-primary, wine-accent, wine-muted
// Mantener: rounded-3xl inputs, min-h-[100px] textarea

// GOTCHA: Next.js 15 App Router
export async function POST(req: Request) {} // ✓ Route handler correcto
export default function() {} // ✗ No usar default export

// PATTERN: Componentes cliente solo donde necesario
'use client' // Solo en chat-interface.tsx y componentes interactivos

// ENV Variable ya configurada
// AI_GATEWAY_API_KEY existe en .env (confirmado en features.md)
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// 1. Types para el Chat (sin persistencia inicial)
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
}

// 2. Configuración del modelo AI con AI Gateway
export const AI_CONFIG = {
  model: 'gpt-5-mini',
  temperature: 0.7,
  systemPrompt: `Eres el asistente virtual de Gabi Zimmer, comunicadora especializada en vinos uruguayos. 
    Tienes conocimiento profundo sobre vinos, especialmente uruguayos, maridajes y catas.
    Responde de forma amigable, profesional y con el expertise de Gabi.
    Menciona vinos uruguayos cuando sea relevante.`
}
```

### Task List (Orden de Implementación)
```yaml
Task 1: API Route Handler con AI Gateway
CREATE src/app/api/chat/route.ts:
  - IMPLEMENT POST handler para AI SDK
  - USE createOpenAI con AI Gateway config
  - CONFIG: baseURL y apiKey de AI_GATEWAY_API_KEY
  - MODEL: gpt-5-mini
  - SYSTEM prompt con contexto de Gabi y vinos
  - STREAM responses con streamText

Task 2: Chat Interface Component
CREATE src/app/chat/chat-interface.tsx:
  - 'use client' directive
  - USE useChat hook de 'ai/react'
  - ADAPT diseño de Bond chat-interface.tsx
  - TEXTAREA con rounded-3xl, min-h-[100px]
  - AUTO-RESIZE del textarea
  - COLORS: wine-primary en vez de amber

Task 3: Greeting Component
CREATE src/components/chat/greeting.tsx:
  - ADAPT de Bond pero personalizado
  - TEXT: "Hola, soy el asistente de Gabi Zimmer"
  - SUBTEXT: "¿Qué te gustaría saber sobre vinos hoy?"
  - ICON: Usar Wine o Grape de lucide-react
  - COLORS: text-wine-primary para "Gabi Zimmer"

Task 4: Message Component
CREATE src/components/chat/message.tsx:
  - ADAPT de Bond message.tsx
  - USER messages: bg-wine-primary text-white
  - ASSISTANT: bg-wine-muted/20 text-foreground
  - AVATAR: Iniciales o iconos de vino
  - MARKDOWN support con react-markdown

Task 5: Message Content Component
CREATE src/components/chat/message-content.tsx:
  - COPY estructura de Bond
  - RENDER markdown con react-markdown
  - CODE blocks con syntax highlighting
  - LINKS con target="_blank"
  - LISTS con estilos wine theme

Task 6: Typing Indicator
CREATE src/components/chat/typing-dots.tsx:
  - SIMPLE animación de 3 puntos
  - COLOR: wine-primary
  - SHOW cuando isLoading del useChat

Task 7: Chat Page
CREATE src/app/chat/page.tsx:
  - RSC con layout completo
  - IMPORT Header y Footer
  - WRAPPER para chat-interface
  - TITLE: "Chat con Gabi Zimmer"
  - META tags para SEO

Task 8: Update Navigation
MODIFY src/components/layout/header.tsx:
  - ADD link "Chat" en navegación
  - BETWEEN "Inicio" y "Blog"
  - HIGHLIGHT cuando esté activo

Task 9: Styling Adjustments
UPDATE tailwind.config.ts y globals.css:
  - ENSURE wine colors están definidos
  - ADD animaciones para typing dots
  - GRADIENT backgrounds si necesario

Task 10: Environment Verification
VERIFY .env.local:
  - AI_GATEWAY_API_KEY debe estar configurada (ya confirmada)
  - NO necesita OPENAI_API_KEY (usando AI Gateway)
```

### Per-Task Pseudocode
```typescript
// Task 1: API Route Handler con AI Gateway
// src/app/api/chat/route.ts
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// Configurar OpenAI con AI Gateway de Vercel
const openai = createOpenAI({
  baseURL: 'https://gateway.ai.vercel.com/v1/openai',
  apiKey: process.env.AI_GATEWAY_API_KEY,
})

export async function POST(req: Request) {
  const { messages } = await req.json()
  
  const result = streamText({
    model: openai('gpt-5-mini'),
    messages,
    system: `Eres el asistente virtual de Gabi Zimmer, comunicadora especializada en vinos uruguayos.
      Tienes conocimiento profundo sobre vinos, especialmente uruguayos, maridajes y catas.
      Responde de forma amigable, profesional y con el expertise de Gabi.`,
    temperature: 0.7,
  })
  
  return result.toDataStreamResponse()
}

// Task 2: Chat Interface
// src/app/chat/chat-interface.tsx
'use client'
import { useChat } from 'ai/react'
import { Greeting } from '@/components/chat/greeting'
import { Message } from '@/components/chat/message'
import { TypingDots } from '@/components/chat/typing-dots'

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  })

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <Greeting />
        ) : (
          messages.map(m => <Message key={m.id} message={m} />)
        )}
        {isLoading && <TypingDots />}
      </div>
      
      {/* Input area - estilo Bond */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-background/95 backdrop-blur">
        <div className="relative">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
            className="w-full rounded-3xl min-h-[100px] p-4 pr-12 resize-none
              border-wine-muted/20 focus:border-wine-primary transition-colors"
            placeholder="Pregunta sobre vinos, maridajes o catas..."
          />
          <button 
            type="submit"
            className="absolute bottom-3 right-3 rounded-full p-2 
              bg-wine-primary text-white hover:bg-wine-primary/90"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

// Task 3: Greeting Component
// src/components/chat/greeting.tsx
import { Wine } from 'lucide-react'

export function Greeting() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <Wine className="h-12 w-12 text-wine-primary mb-4" />
      <h2 className="text-2xl font-bold mb-2">
        Hola, soy el asistente de <span className="text-wine-primary">Gabi Zimmer</span>
      </h2>
      <p className="text-muted-foreground max-w-md">
        ¿Qué te gustaría saber sobre vinos uruguayos hoy? 
        Puedo ayudarte con recomendaciones, maridajes y más.
      </p>
    </div>
  )
}
```

### Integration Points
```yaml
NAVIGATION:
  - header: Agregar link a /chat
  - mobile: Incluir en menú móvil
  
THEMING:
  - dark mode: Ya soportado automáticamente
  - colors: Usar wine-primary, wine-accent del sistema
  
AI CONFIG:
  - model: gpt-5-mini (2025 latest)
  - gateway: AI Gateway de Vercel
  - api key: AI_GATEWAY_API_KEY en .env
  - streaming: Usar streamText de AI SDK v5

FUTURE:
  - persistencia: Agregar con chat-service.ts
  - multimodal: Habilitar imágenes de vinos
  - rag: Integrar con contenido del blog
```

## Validation Loop

### Level 1: Syntax & Types
```bash
pnpm run lint
pnpm run typecheck
# Expected: 0 errores
```

### Level 2: Development Testing
```bash
pnpm run dev
# Navigate to http://localhost:3000/chat
# Test:
# - Greeting aparece sin mensajes
# - Enviar mensaje funciona
# - Streaming de respuesta visible
# - Dark mode toggle funciona
```

### Level 3: API Testing
```bash
# Test endpoint directamente
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hola"}]}'
# Expected: Stream de respuesta con AI Gateway
```

### Level 4: Production Build
```bash
pnpm run build
# Expected: Build exitoso sin warnings

pnpm run start
# Test en http://localhost:3000/chat
```

## Final Checklist

### Arquitectura
- [ ] API route en app/api/chat/route.ts con AI Gateway
- [ ] Componentes cliente solo donde necesario
- [ ] Sin acceso directo a Prisma (no necesario aún)
- [ ] Streaming funcional con AI SDK v5

### UI/UX
- [ ] Diseño adaptado de Bond con tema wine
- [ ] Greeting personalizado para Gabi
- [ ] Input con rounded-3xl como Bond
- [ ] Colores wine-primary en vez de amber
- [ ] Header y Footer integrados
- [ ] Responsive y dark mode funcional

### Funcionalidad
- [ ] Chat básico sin persistencia
- [ ] Respuestas con contexto de vinos
- [ ] Modelo gpt-5-mini configurado con AI Gateway
- [ ] Streaming de respuestas
- [ ] Manejo de errores básico

## Anti-Patterns to Avoid

### Arquitectura
- ❌ NO crear servicios con Prisma (no hay persistencia aún)
- ❌ NO usar OPENAI_API_KEY directamente (usar AI Gateway)
- ❌ NO olvidar 'use client' en componentes interactivos
- ❌ NO crear API routes con default export

### UI/UX
- ❌ NO copiar colores amber de Bond (usar wine theme)
- ❌ NO implementar multimodal complejo inicial
- ❌ NO agregar features no solicitadas (persistencia, etc)
- ❌ NO olvidar el header y footer en la página

### Performance
- ❌ NO bloquear el UI durante streaming
- ❌ NO hacer la página completa 'use client'
- ❌ NO cargar componentes pesados innecesarios

## Score de Confianza: 9/10

Este PRP tiene alta probabilidad de éxito porque:
- AI SDK v5 ya está instalado
- AI Gateway configurado con AI_GATEWAY_API_KEY
- Patrones claros de Bond para adaptar
- Sistema de diseño bien definido
- Arquitectura simple sin persistencia inicial
- Referencias exactas a archivos necesarios
- Modelo gpt-5-mini (2025) especificado correctamente