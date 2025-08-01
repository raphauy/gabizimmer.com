# PRP: Transformar Starter Kit Multitenant a Sitio Personal gabizimmer.com

## Goal
Transformar el starter kit multitenant actual en el sitio web personal de Gabi Zimmer, manteniendo la autenticación para gestión de contenido futuro, eliminando toda funcionalidad de workspaces, y creando una landing page minimalista que refleje su identidad profesional como comunicadora de vinos.

## Why
- **Valor de negocio**: Establecer la presencia digital profesional de Gabi Zimmer como autoridad en comunicación sobre vinos
- **Impacto en usuarios**: Visitantes encontrarán información clara sobre Gabi mientras se construye el sitio completo
- **Simplificación técnica**: Eliminar complejidad innecesaria del multitenant para un sitio personal
- **Preparación futura**: Mantener autenticación para que Gabi y colaboradores gestionen contenido de blog

## What
Sitio web personal con landing minimalista y sistema de autenticación simplificado para gestión de contenido futuro.

### Success Criteria
- [ ] Landing page visible en `/` con información de Gabi y mensaje "Estamos construyendo el nuevo sitio de gabizimmer.com"
- [ ] Sistema multitenant completamente eliminado (sin workspaces, sin rutas `/w/`)
- [ ] Autenticación simplificada con roles: `superadmin` (Gabi) y `colaborador` (futuros editores)
- [ ] Panel admin en `/admin` para gestionar colaboradores
- [ ] Build exitoso sin errores de TypeScript o Lint
- [ ] Todas las referencias a workspaces eliminadas de la UI

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /home/raphael/desarrollo/gabizimmer.com/prisma/schema.prisma
  why: Modelo de datos actual - necesario para eliminar workspaces y agregar rol colaborador
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/middleware.ts
  why: Lógica de autenticación y redirección - simplificar sin workspaces
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/lib/auth.ts
  why: Configuración Auth.js v5 - entender flujo actual
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/app/page.tsx
  why: Página principal actual - reemplazar con landing
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/services/user-service.ts
  why: Servicio de usuarios - agregar manejo de rol colaborador
  
- file: /home/raphael/desarrollo/gabizimmer.com/package.json
  why: Dependencias del proyecto - no modificar versiones
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/app/admin/page.tsx
  why: Dashboard admin actual - actualizar métricas sin workspaces
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/components/ui/
  why: Componentes shadcn/ui disponibles para la landing
  
- file: /home/raphael/desarrollo/gabizimmer.com/docs/resources/gabi-instagram.png
  why: Información visual de Gabi para la landing
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── admin/           # Panel superadmin (mantener)
│   ├── w/              # Workspaces (ELIMINAR)
│   ├── invite/         # Invitaciones workspace (ELIMINAR)
│   ├── onboarding/     # Onboarding (mantener)
│   └── page.tsx        # Redirect actual (reemplazar)
├── services/
│   ├── workspace-service.ts  # ELIMINAR
│   ├── user-service.ts       # Modificar
│   └── invitation-service.ts # Simplificar o eliminar
├── components/
│   ├── workspace-*       # ELIMINAR todos
│   └── ui/              # Mantener (shadcn/ui)
└── middleware.ts        # Simplificar
```

### Desired Codebase Tree
```bash
src/
├── app/
│   ├── admin/           # Panel para Gabi gestionar colaboradores
│   │   ├── page.tsx     # Dashboard simplificado
│   │   └── users/       # Gestión de colaboradores
│   ├── onboarding/      # Para colaboradores completar perfil
│   └── page.tsx         # Nueva landing page
├── services/
│   ├── user-service.ts  # Con soporte para rol colaborador
│   └── dashboard-service.ts # Métricas sin workspaces
├── components/
│   ├── landing/         # Componentes de la landing
│   └── ui/              # shadcn/ui components
└── middleware.ts        # Redirección simplificada
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Auth.js v5 beta - sintaxis específica
// Archivo: src/lib/auth.ts
import NextAuth from "next-auth"
// NO usar import { NextAuth } - es export default

// PATTERN: Server Components por defecto en app/
// Solo agregar "use client" cuando necesario

// GOTCHA: Prisma migrations
// Después de modificar schema.prisma:
// 1. pnpm prisma db push (desarrollo)
// 2. pnpm prisma generate

// PATTERN: Validaciones con Zod en servicios
import { z } from "zod"
const schema = z.object({...})
const validated = schema.parse(data)

// CRITICAL: Eliminar imports huérfanos
// Al eliminar workspaces, buscar y eliminar todos los imports relacionados

// PATTERN: Server Actions en Next.js 15
"use server" // Al inicio del archivo
export async function actionName() {}
```

### Información de Gabi para Landing
```yaml
Nombre: Gabi Zimmer
Handle: @gabizimmer__
Tagline: Comunico sobre vinos
Roles:
  - Fundadora @tinta.wine
  - Somm, Educadora & Autora de #uruguayenvinos
  - Catadora para Tim Atkin MW
Métricas:
  - 962 publicaciones
  - 25.4k seguidores
  - 1584 seguidos
Link: libro.uruguayenvinos.com
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// 1. Prisma Schema Actualizado
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  role        Role?    // superadmin o colaborador
  image       String?
  isOnboarded Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Eliminar: workspaces, invitations
}

// Eliminar completamente:
// - model Workspace
// - model WorkspaceUser
// - model WorkspaceInvitation

enum Role {
  superadmin
  colaborador // NUEVO
}

// Eliminar: enum WorkspaceRole
```

### Task List (Orden de Implementación)
```yaml
Task 1: Backup y Preparación
COMMANDS:
  - git status (verificar estado limpio)
  - git branch feature/transform-to-personal-site
  - git checkout feature/transform-to-personal-site
VALIDATE: En nueva rama

Task 2: Actualizar Prisma Schema
MODIFY prisma/schema.prisma:
  - REMOVE: model Workspace, WorkspaceUser, WorkspaceInvitation
  - REMOVE: enum WorkspaceRole
  - ADD: colaborador to enum Role
  - REMOVE: relaciones workspaces de User
RUN: pnpm prisma db push
VALIDATE: pnpm prisma studio (verificar schema)

Task 3: Eliminar Servicios de Workspace
DELETE:
  - src/services/workspace-service.ts
  - src/services/invitation-service.ts (o simplificar si se usa para colaboradores)
MODIFY src/services/dashboard-service.ts:
  - Eliminar métricas de workspaces
  - Simplificar a usuarios totales y colaboradores

Task 4: Actualizar User Service
MODIFY src/services/user-service.ts:
  - ADD: soporte para rol colaborador
  - UPDATE: createUser para aceptar rol
  - REMOVE: referencias a workspaces

Task 5: Simplificar Middleware
MODIFY src/middleware.ts:
  - REMOVE: lógica de workspace (currentWorkspace)
  - SIMPLIFY: redirecciones
  - Superadmin → /admin
  - Colaborador → /admin (o futura área de blog)
  - No autenticado → /login

Task 6: Eliminar Rutas de Workspace
DELETE directorio completo:
  - src/app/w/
  - src/app/invite/ (si no se usa para colaboradores)
REMOVE imports en otros archivos

Task 7: Eliminar Componentes de Workspace
DELETE:
  - src/components/workspace-*.tsx (todos)
  - src/components/emails/workspace-invitation-email.tsx
SEARCH & REMOVE: imports huérfanos

Task 8: Crear Landing Page
CREATE src/app/page.tsx:
  - Server Component (sin "use client")
  - Hero section con info de Gabi
  - Mensaje "Estamos construyendo..."
  - Enlaces a redes/libro
  - Diseño minimalista

Task 9: Crear Componentes Landing
CREATE src/components/landing/:
  - hero-section.tsx
  - social-links.tsx
  - under-construction.tsx
USE: componentes shadcn/ui existentes

Task 10: Actualizar Admin Dashboard
MODIFY src/app/admin/page.tsx:
  - REMOVE: métricas de workspaces
  - SHOW: total usuarios, colaboradores
  - SIMPLIFY: UI sin secciones workspace

Task 11: Actualizar Admin Users
MODIFY src/app/admin/users/:
  - ADD: selector de rol (superadmin/colaborador)
  - UPDATE: formularios para incluir rol
  - REMOVE: referencias a workspaces

Task 12: Actualizar Auth Types
MODIFY src/types/auth.ts:
  - REMOVE: WorkspaceRole
  - UPDATE: tipos para incluir colaborador
  - REMOVE: currentWorkspace de sesión

Task 13: Limpiar Imports y Types
SEARCH proyecto completo:
  - Buscar "workspace" (case insensitive)
  - Buscar "Workspace" 
  - Eliminar imports huérfanos
  - Actualizar tipos

Task 14: Actualizar UI/UX
MODIFY:
  - src/components/nav-bar.tsx (si existe)
  - src/app/admin/components/admin-sidebar.tsx
  - Eliminar referencias a workspaces
  - Actualizar navegación

Task 15: Testing y Validación
RUN:
  - pnpm run lint
  - pnpm run typecheck
  - pnpm run build
FIX: Cualquier error antes de continuar
```

### Per-Task Code Examples
```typescript
// Task 8: Landing Page
// src/app/page.tsx
import { Button } from "@/components/ui/button"
import { Instagram, Book, Wine } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Gabi Zimmer</h1>
        <p className="text-2xl text-muted-foreground mb-8">
          <Wine className="inline w-6 h-6 mr-2" />
          Comunico sobre vinos
        </p>
        
        <div className="space-y-4 mb-12">
          <p>✨ Fundadora @tinta.wine</p>
          <p>🇺🇾 Somm, Educadora & Autora de #uruguayenvinos</p>
          <p>🍃 Catadora para Tim Atkin MW</p>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-semibold mb-4">
            Estamos construyendo el nuevo sitio de gabizimmer.com
          </h2>
          <p className="text-muted-foreground">
            Pronto encontrarás aquí contenido sobre vinos, catas y más
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <a href="https://instagram.com/gabizimmer__" target="_blank">
              <Instagram className="w-4 h-4 mr-2" />
              Instagram
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://libro.uruguayenvinos.com" target="_blank">
              <Book className="w-4 h-4 mr-2" />
              Mi Libro
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Task 4: User Service Update
// src/services/user-service.ts (fragmento)
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(["superadmin", "colaborador"]).optional(),
})

export async function inviteColaborador(email: string) {
  const user = await createUser({
    email,
    role: "colaborador"
  })
  
  // Enviar email de invitación
  await sendInvitationEmail(user.email)
  
  return user
}
```

### Integration Points
```yaml
DATABASE:
  - Migration: pnpm prisma db push
  - Reset si necesario: pnpm prisma db push --force-reset
  
AUTH:
  - Mantener OTP flow
  - Actualizar tipos de sesión
  - Roles: superadmin, colaborador
  
UI:
  - Usar shadcn/ui components existentes
  - Mantener dark mode
  - Diseño responsive

EMAIL:
  - Adaptar templates sin workspaces
  - Mantener OTP emails
```

## Validation Loop

### Level 1: Syntax & Types
```bash
pnpm run lint
pnpm run typecheck
# Expected: 0 errores
```

### Level 2: Database
```bash
pnpm prisma validate
pnpm prisma db push
pnpm prisma studio
# Verificar: Schema sin workspaces, rol colaborador existe
```

### Level 3: Build
```bash
pnpm run build
# Expected: Build exitoso sin warnings
```

### Level 4: Runtime
```bash
pnpm run dev
# Test:
# - Landing en http://localhost:3000
# - Login flow funciona
# - Admin panel sin workspaces
# - Crear colaborador funciona
```

### Level 5: User Flow
- [ ] Landing page muestra info de Gabi
- [ ] Login como superadmin → /admin
- [ ] Dashboard sin métricas de workspace
- [ ] Crear colaborador exitoso
- [ ] Colaborador puede hacer login
- [ ] Onboarding funciona para colaboradores

## Final Checklist

### Eliminación Completa de Workspaces
- [ ] Schema Prisma sin modelos workspace
- [ ] Servicios workspace eliminados
- [ ] Rutas /w/ eliminadas
- [ ] Componentes workspace-* eliminados
- [ ] Imports y tipos actualizados
- [ ] UI sin referencias a workspaces

### Sistema de Autenticación
- [ ] Rol colaborador agregado
- [ ] Middleware simplificado
- [ ] Redirecciones correctas por rol
- [ ] Onboarding mantenido

### Landing Page
- [ ] Información de Gabi visible
- [ ] Mensaje "construyendo" presente
- [ ] Enlaces a redes sociales
- [ ] Diseño minimalista y profesional
- [ ] Responsive en móvil

### Calidad de Código
- [ ] Sin errores de TypeScript
- [ ] Sin errores de Lint
- [ ] Build de producción exitoso
- [ ] Sin imports huérfanos
- [ ] Sin código muerto

## Anti-Patterns to Avoid

### Durante la Eliminación
- ❌ NO dejar imports de workspace huérfanos
- ❌ NO olvidar actualizar tipos TypeScript
- ❌ NO mantener lógica condicional de workspaces
- ❌ NO dejar componentes UI con referencias muertas

### En la Implementación
- ❌ NO complicar la landing page
- ❌ NO cambiar versiones de dependencias
- ❌ NO modificar el flujo de autenticación OTP
- ❌ NO crear nuevos patrones, seguir los existentes

### Score de Confianza: 9/10

Este PRP tiene un alto nivel de detalle y claridad. La única consideración es que al ser una transformación mayor (eliminación de multitenant), pueden surgir dependencias ocultas no identificadas en el análisis inicial. Sin embargo, la estructura del PRP permite adaptación durante la implementación.