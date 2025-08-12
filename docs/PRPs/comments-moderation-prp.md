# PRP: Sistema de Moderación de Comentarios en Admin

## Goal
Implementar una interfaz completa de visualización y moderación de comentarios en `/admin/comments` que permita a Gabi Zimmer y colaboradores gestionar todos los comentarios del blog con capacidades de filtrado, búsqueda, moderación en bulk, y estadísticas en tiempo real, siguiendo los patrones arquitectónicos y de UI establecidos en el proyecto.

## Why
- **Valor de negocio**: Control editorial completo sobre la conversación en el blog, protección contra spam y mantenimiento de la calidad del contenido
- **Impacto en usuarios**: Gabi podrá moderar comentarios eficientemente, mejorando la calidad de la discusión y la experiencia de los lectores
- **Integración con features existentes**: Los comentarios ya existen en el modelo de datos y el servicio está implementado, falta la interfaz de administración
- **Problemas que resuelve**: Actualmente no hay forma de moderar comentarios pendientes, ver estadísticas o gestionar el spam de manera eficiente

## What
Sistema completo de moderación que permita:
- Visualizar todos los comentarios con filtros por estado (PENDING, APPROVED, REJECTED)
- Búsqueda por contenido, autor o email
- Acciones de moderación individual y en bulk
- Estadísticas en tiempo real de comentarios
- Navegación directa al post relacionado
- Sistema de notificaciones para nuevos comentarios pendientes

### Success Criteria
- [ ] Página `/admin/comments` accesible desde el sidebar con badge de comentarios pendientes
- [ ] Tabla de comentarios con filtros funcionales por estado, búsqueda y ordenamiento
- [ ] Acciones de aprobar/rechazar funcionando individualmente y en bulk
- [ ] Estadísticas visibles: total, pendientes, aprobados, rechazados
- [ ] Loading states con skeleton components consistentes con el diseño
- [ ] Validación de permisos (superadmin puede eliminar, colaboradores solo moderar)
- [ ] Tests: `pnpm run lint` y `pnpm run typecheck` sin errores
- [ ] Build de producción exitoso: `pnpm run build`

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Reglas arquitectónicas estrictas de capas y co-ubicación modular
  
- file: /docs/features.md
  why: Estado actual del proyecto, features implementadas y sistema de comentarios existente
  
- file: prisma/schema.prisma
  why: Modelo Comment y CommentStatus ya definidos, relaciones con Post
  lines: 122-138
  
- file: src/services/comment-service.ts
  why: CRÍTICO - Servicio completo ya implementado con todas las funciones necesarias
  
- file: src/app/admin/posts/page.tsx
  why: Patrón de página principal con Suspense a seguir
  
- file: src/app/admin/posts/posts-list.tsx
  why: Patrón de lista con filtros y búsqueda a replicar
  
- file: src/app/admin/posts/posts-skeleton.tsx
  why: Patrón de skeleton loading a seguir
  
- file: src/app/admin/posts/post-actions-client.tsx
  why: Patrón de acciones contextuales con dropdown menu
  
- file: src/app/admin/categories/actions.ts
  why: Patrón de Server Actions con validación de permisos
  
- file: src/app/admin/components/admin-sidebar.tsx
  why: Para agregar el nuevo item de navegación con badge
  
- url: https://ui.shadcn.com/docs/components/table
  why: Documentación de la tabla de shadcn/ui v4
  section: "Data Table"
  
- url: https://ui.shadcn.com/docs/components/badge
  why: Para los badges de estado de comentarios
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── admin/
│   │   ├── categories/     # Ejemplo de módulo completo
│   │   ├── posts/          # Ejemplo con acciones contextuales
│   │   ├── components/     # Sidebar y componentes compartidos
│   │   └── page.tsx        # Dashboard principal
│   └── api/
├── services/
│   └── comment-service.ts  # YA EXISTE - servicio completo
├── components/
│   └── ui/                 # 22 componentes shadcn instalados
└── lib/
    └── prisma.ts           # Cliente Prisma (solo services lo importan)
```

### Desired Codebase Tree
```bash
src/
├── app/
│   └── admin/
│       └── comments/                    # NUEVO módulo co-ubicado
│           ├── page.tsx                 # RSC principal con Suspense
│           ├── actions.ts                # Server Actions co-ubicadas
│           ├── comments-list.tsx         # RSC fetch y render tabla
│           ├── comments-filters.tsx      # Cliente: filtros y búsqueda
│           ├── comment-actions-client.tsx # Cliente: dropdown acciones
│           ├── comment-status-badge.tsx  # Badge visual por estado
│           ├── comments-skeleton.tsx     # Loading skeleton
│           ├── comments-stats.tsx        # Tarjetas de estadísticas
│           └── bulk-actions.tsx          # Cliente: acciones en bulk
└── services/
    └── comment-service.ts              # YA EXISTE - no modificar
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Arquitectura en capas estricta (docs/architecture.md)
// - SOLO services/ puede importar prisma
// - Server Actions en actions.ts, no API routes
// - Co-ubicación modular: todo de comments junto en su carpeta

// PATTERN: Server Component principal con Suspense
// src/app/admin/comments/page.tsx
export default async function CommentsPage() {
  return (
    <div>
      <header>...</header>
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsList />
      </Suspense>
    </div>
  )
}

// PATTERN: Validación de permisos en Server Actions
// src/app/admin/comments/actions.ts
"use server"
import { auth } from "@/lib/auth"

export async function deleteCommentAction(id: string) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") {
    throw new Error("No autorizado")
  }
  // ... lógica
}

// PATTERN: Cliente con estados locales para filtros
// src/app/admin/comments/comments-filters.tsx
"use client"
export function CommentsFilters({ onFilterChange }) {
  const [status, setStatus] = useState<CommentStatus | "ALL">("ALL")
  // ... lógica de filtros
}

// GOTCHA: El servicio ya tiene todas las funciones necesarias
// NO crear nuevas funciones, usar las existentes:
// - getAllComments(filters?) - con filtros opcionales
// - getPendingComments() - solo pendientes
// - moderateComment(data) - aprobar/rechazar
// - deleteComment(id) - eliminar
// - getCommentsStats() - estadísticas

// PATTERN: Badges de estado con colores consistentes
// PENDING: ámbar/yellow
// APPROVED: verde/green  
// REJECTED: rojo/red
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// YA EXISTE en Prisma - NO MODIFICAR
enum CommentStatus {
  PENDING
  REJECTED 
  APPROVED
}

model Comment {
  id          String        @id @default(cuid())
  content     String        @db.Text
  status      CommentStatus @default(PENDING)
  postId      String
  post        Post          @relation(...)
  authorName  String
  authorEmail String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

// TIPOS YA DEFINIDOS en comment-service.ts
export type CommentWithPost = Comment & {
  post: {
    id: string
    title: string
    slug: string
  }
}

// Para filtros
export type CommentFilters = {
  status?: CommentStatus
  search?: string
  postId?: string
}
```

### Task List (Orden de Implementación)
```yaml
Task 1: Crear estructura base del módulo
CREATE src/app/admin/comments/:
  - Crear carpeta vacía para el módulo
  - PATTERN: Co-ubicación modular

Task 2: RSC Principal con Suspense
CREATE src/app/admin/comments/page.tsx:
  - COPY pattern from: src/app/admin/posts/page.tsx
  - HEADER: "Comentarios" con badge de pendientes
  - ADD: <CommentsStats /> antes de la lista
  - SUSPENSE: <CommentsList /> con <CommentsSkeleton />
  - NO 'use client' - es RSC

Task 3: Server Actions Co-ubicadas
CREATE src/app/admin/comments/actions.ts:
  - 'use server' al inicio
  - getCommentsAction(filters?) - llama a getAllComments
  - getCommentsStatsAction() - llama a getCommentsStats  
  - approveCommentAction(id) - llama a moderateComment con APPROVED
  - rejectCommentAction(id) - llama a moderateComment con REJECTED
  - deleteCommentAction(id) - solo superadmin, llama a deleteComment
  - bulkModerateAction(ids[], status) - itera y modera múltiples
  - USE: import from '@/services/comment-service'
  - REVALIDATE: revalidatePath('/admin/comments') después de cambios

Task 4: Lista de Comentarios RSC
CREATE src/app/admin/comments/comments-list.tsx:
  - 'use client' al inicio (necesita estados para filtros)
  - STATE: comments[], filters, search, loading, selectedIds[]
  - FETCH inicial con getCommentsAction()
  - SEARCH: filtro por content/authorName/authorEmail
  - FILTER: por status (ALL, PENDING, APPROVED, REJECTED)
  - TABLE con columnas: checkbox, autor, contenido, post, estado, fecha, acciones
  - BULK actions bar cuando hay seleccionados
  - REFRESH después de acciones

Task 5: Badge de Estado
CREATE src/app/admin/comments/comment-status-badge.tsx:
  - COPY pattern from: src/app/admin/posts/post-status-badge.tsx
  - PENDING: variant="secondary" className="bg-amber-100 text-amber-800"
  - APPROVED: variant="secondary" className="bg-green-100 text-green-800"  
  - REJECTED: variant="secondary" className="bg-red-100 text-red-800"
  - Dark mode support

Task 6: Acciones Contextuales
CREATE src/app/admin/comments/comment-actions-client.tsx:
  - COPY pattern from: src/app/admin/posts/post-actions-client.tsx
  - 'use client'
  - DROPDOWN con MoreHorizontal icon
  - ACTIONS según estado:
    - Ver en blog (link al post#comments)
    - Aprobar (si PENDING/REJECTED)
    - Rechazar (si PENDING/APPROVED)
    - Eliminar (solo superadmin, con confirmación)
  - Loading states por acción
  - Toast notifications

Task 7: Estadísticas
CREATE src/app/admin/comments/comments-stats.tsx:
  - ASYNC server component
  - FETCH stats con getCommentsStatsAction()
  - 4 Cards con métricas:
    - Total de comentarios
    - Pendientes (ámbar)
    - Aprobados (verde)
    - Rechazados (rojo)
  - Iconos: MessageSquare, Clock, CheckCircle, XCircle

Task 8: Skeleton Loading
CREATE src/app/admin/comments/comments-skeleton.tsx:
  - COPY structure from: src/app/admin/posts/posts-skeleton.tsx
  - Skeleton para stats cards (4 cards)
  - Skeleton para filtros
  - Skeleton para tabla (8 filas)

Task 9: Bulk Actions
CREATE src/app/admin/comments/bulk-actions.tsx:
  - 'use client'
  - SHOW cuando hay comentarios seleccionados
  - ACTIONS: Aprobar todos, Rechazar todos, Eliminar todos
  - Confirmación antes de ejecutar
  - Loading state durante operación
  - Clear selection después

Task 10: Actualizar Sidebar
MODIFY src/app/admin/components/admin-sidebar.tsx:
  - IMPORT MessageSquare icon
  - ADD item después de Posts:
    {
      title: "Comentarios",
      href: "/admin/comments",
      icon: MessageSquare,
      badge: "pendingComments"
    }

MODIFY src/app/admin/components/admin-sidebar-client.tsx:
  - ADD case "pendingComments" en getBadgeCount:
    case "pendingComments":
      return pendingCommentsCount
```

### Per-Task Pseudocode
```typescript
// Task 2: Página Principal
// src/app/admin/comments/page.tsx
import { Suspense } from 'react'
import { MessageSquare } from 'lucide-react'
import { CommentsList } from './comments-list'
import { CommentsSkeleton } from './comments-skeleton'
import { CommentsStats } from './comments-stats'

export default async function CommentsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Comentarios</h1>
      </div>
      
      <Suspense fallback={<div>Cargando estadísticas...</div>}>
        <CommentsStats />
      </Suspense>
      
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsList />
      </Suspense>
    </div>
  )
}

// Task 3: Server Actions
// src/app/admin/comments/actions.ts
"use server"
import { auth } from '@/lib/auth'
import { 
  getAllComments, 
  moderateComment,
  deleteComment,
  getCommentsStats 
} from '@/services/comment-service'
import { revalidatePath } from 'next/cache'

export async function approveCommentAction(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("No autorizado")
  
  try {
    await moderateComment({ id, status: 'APPROVED' })
    revalidatePath('/admin/comments')
    revalidatePath('/admin') // Dashboard stats
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Task 4: Lista Principal
// src/app/admin/comments/comments-list.tsx
"use client"
import { useState, useEffect } from 'react'
import { Table } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { getCommentsAction } from './actions'
import { CommentStatusBadge } from './comment-status-badge'
import { CommentActionsClient } from './comment-actions-client'

export function CommentsList() {
  const [comments, setComments] = useState([])
  const [status, setStatus] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  useEffect(() => {
    fetchComments()
  }, [status])
  
  const fetchComments = async () => {
    setLoading(true)
    const filters = status !== 'ALL' ? { status } : undefined
    const result = await getCommentsAction(filters)
    setComments(result)
    setLoading(false)
  }
  
  const filteredComments = comments.filter(comment => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      comment.content.toLowerCase().includes(searchLower) ||
      comment.authorName.toLowerCase().includes(searchLower) ||
      comment.authorEmail.toLowerCase().includes(searchLower)
    )
  })
  
  // ... resto de la implementación
}
```

### Integration Points
```yaml
DATABASE:
  - Modelo Comment ya existe
  - No requiere migraciones
  
AUTH:
  - Rutas protegidas por middleware existente
  - Validación de rol en Server Actions
  - superadmin: puede eliminar
  - colaborador: puede moderar
  
SERVICE:
  - comment-service.ts completamente implementado
  - Todas las funciones necesarias ya existen
  - Anti-spam ya implementado
  
UI:
  - Usar componentes shadcn/ui existentes
  - Colores de marca Gabi Zimmer disponibles
  - Dark mode automático
  
NAVIGATION:
  - Actualizar sidebar con nuevo item
  - Badge con count de pendientes
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar PRIMERO - corregir errores antes de continuar
pnpm run lint          # ESLint
pnpm run typecheck     # TypeScript
# Expected: 0 errores
```

### Level 2: Database
```bash
# No requiere cambios en schema
pnpm prisma validate
# Expected: Schema válido sin cambios
```

### Level 3: Manual Testing
```bash
# Dev server
pnpm run dev

# Navegar a http://localhost:3000/admin/comments
# Verificar:
- [ ] Página carga con estadísticas
- [ ] Tabla muestra comentarios
- [ ] Filtros funcionan (estado, búsqueda)
- [ ] Acciones individuales funcionan
- [ ] Bulk actions funcionan
- [ ] Permisos correctos según rol
```

### Level 4: Integration Tests
```typescript
// Verificar en navegador:
// 1. Crear comentario en un post público
// 2. Ver que aparece como PENDING en admin
// 3. Aprobar comentario
// 4. Verificar que aparece en el post público
// 5. Verificar que stats se actualizan
```

### Level 5: Production Build
```bash
pnpm run build
# Expected: Build exitoso sin warnings

pnpm run start
# Test en http://localhost:3000/admin/comments
```

## Final Checklist

### Arquitectura en Capas (docs/architecture.md)
- [ ] Solo services/ importa @/lib/prisma (usar servicio existente)
- [ ] Server Actions en lugar de API routes
- [ ] Co-ubicación modular: toda la feature en /admin/comments/
- [ ] No modificar comment-service.ts (ya está completo)

### Calidad de Código
- [ ] Todos los tests pasan (lint, typecheck)
- [ ] Sin errores de build
- [ ] Permisos validados (superadmin vs colaborador)
- [ ] Loading states con skeletons
- [ ] Manejo de errores con toasts
- [ ] Filtros y búsqueda funcionando

### Estructura Modular
- [ ] page.tsx (RSC principal con Suspense)
- [ ] comments-list.tsx (lista con filtros)
- [ ] actions.ts (Server Actions)
- [ ] comment-actions-client.tsx (dropdown acciones)
- [ ] comment-status-badge.tsx (badges visuales)
- [ ] comments-skeleton.tsx (loading)
- [ ] comments-stats.tsx (estadísticas)
- [ ] bulk-actions.tsx (acciones masivas)

### UX Completa
- [ ] Badge en sidebar con count de pendientes
- [ ] Estados visuales claros (colores por status)
- [ ] Acciones contextuales según estado
- [ ] Bulk actions para eficiencia
- [ ] Links directos a posts relacionados
- [ ] Responsive y dark mode

## Anti-Patterns to Avoid

### Arquitectura
- ❌ NO importar `@/lib/prisma` en componentes o actions
- ❌ NO crear nuevas funciones en comment-service (usar las existentes)
- ❌ NO usar API routes, usar Server Actions
- ❌ NO separar la feature fuera de /admin/comments/

### Implementación
- ❌ NO olvidar validación de permisos en cada action
- ❌ NO exponer errores de BD al usuario
- ❌ NO hacer fetch sin loading states
- ❌ NO olvidar revalidatePath después de cambios
- ❌ NO permitir eliminar a colaboradores (solo superadmin)

### UX
- ❌ NO usar colores inconsistentes para estados
- ❌ NO omitir confirmación para acciones destructivas
- ❌ NO olvidar actualizar el badge del sidebar
- ❌ NO hacer la tabla no-responsive

## Score de Confianza: 9/10

Este PRP tiene un alto score de confianza porque:
- El servicio backend está completamente implementado y probado
- Los patrones a seguir están bien establecidos en posts y categories
- No requiere cambios en la base de datos
- Todos los componentes UI necesarios están instalados
- La arquitectura del proyecto está bien documentada

El único punto de menor certeza es la implementación de bulk actions, pero siguiendo el patrón de selectedIds[] usado en otras aplicaciones React debería funcionar sin problemas.