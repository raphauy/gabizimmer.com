# Análisis Exhaustivo del Codebase - CRUD de Categorías gabizimmer.com

**Fecha**: 2025-01-11  
**Analista**: Claude Research Engineer  
**Objetivo**: Extraer patrones arquitectónicos críticos para el PRP del CRUD de categorías

## Resumen Ejecutivo

El codebase de gabizimmer.com sigue una **arquitectura en capas estricta** con separación clara de responsabilidades, patrones de co-ubicación modular y uso intensivo de Next.js 15 con App Router, React Server Components y TypeScript. El análisis revela reglas arquitectónicas no negociables que deben aplicarse al CRUD de categorías.

### Hallazgos Críticos
- **Arquitectura en 3 capas**: Servicios (acceso a datos), Lógica de negocio, Presentación
- **Co-ubicación modular**: Cada feature incluye componentes, acciones y validaciones en su directorio
- **Validaciones Zod obligatorias**: Todos los servicios incluyen schemas de validación
- **Server Actions sobre API Routes**: Patrón preferido para operaciones CRUD
- **Autenticación basada en roles**: Solo superadmin puede acceder a funciones administrativas

## 1. Arquitectura en Capas Estricta

### Reglas No Negociables

**✅ Capa de Servicios (`src/services/`)**
- **ÚNICA** capa autorizada para usar Prisma directamente
- Todos los servicios siguen el patrón: `[dominio]-service.ts`
- Validaciones Zod al inicio del archivo
- Tipos derivados de schemas Zod
- Una función por operación CRUD

**❌ Prohibiciones Absolutas**
```typescript
// ❌ NUNCA hacer esto en componentes, lib/, app/
import { prisma } from "@/lib/prisma"

// ✅ SIEMPRE usar servicios
import { getCategoryById } from "@/services/category-service"
```

### Patrón de Servicio Establecido

**Ejemplo de `auth-service.ts` (líneas 1-80):**
```typescript
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { type OtpToken } from "@prisma/client"

// ✅ Validaciones al inicio del archivo
export const createOtpSchema = z.object({
  userId: z.string().min(1, "User ID requerido"),
  token: z.string().length(6, "Token debe tener 6 dígitos"),
  expiresAt: z.date()
})

// Tipos derivados de schemas
export type CreateOtpData = z.infer<typeof createOtpSchema>

// Funciones específicas con validación
export async function createOtpToken(data: CreateOtpData): Promise<OtpToken> {
  const validated = createOtpSchema.parse(data)
  return await prisma.otpToken.create({
    data: validated
  })
}
```

**Patrón replicado en `user-service.ts` (líneas 1-148):**
```typescript
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Role, type User } from "@prisma/client"

export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "Nombre requerido").optional(),
  image: z.string().url().nullable().optional(),
  isOnboarded: z.boolean().optional(),
  role: z.nativeEnum(Role).nullable().optional()
})

export type CreateUserData = z.infer<typeof createUserSchema>

export async function createUser(data: CreateUserData): Promise<User> {
  const validated = createUserSchema.parse(data)
  return await prisma.user.create({
    data: validated
  })
}
```

## 2. Estructura Modular Co-Ubicada

### Patrón Establecido en `/admin/users/`

**Estructura observada:**
```
src/app/admin/users/
├── actions.ts              # Server actions
├── page.tsx               # RSC principal
├── user-form.tsx          # Componente de formulario
├── users-list.tsx         # RSC para listado
├── users-table-skeleton.tsx # Loading estado
├── user-actions-client.tsx # Client actions
└── new/
    └── page.tsx           # Crear usuario
```

### Server Actions Pattern

**En `actions.ts` (líneas 1-118):**
```typescript
"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { getAllUsers, deleteUser } from "@/services/user-service"

export async function getUsersAction() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    const users = await getAllUsers()
    return { success: true, users }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error obteniendo usuarios" 
    }
  }
}
```

**Patrón crítico identificado:**
1. Directiva `"use server"` al inicio
2. Validación de autenticación y rol en cada action
3. Manejo de errores con try-catch
4. `revalidatePath()` después de mutaciones
5. Retorno estructurado `{ success, data/error }`

### React Server Components

**En `users-list.tsx` (líneas 25-129):**
```typescript
export async function UsersList() {
  const users = await getAllUsers() // Directo en RSC

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          {/* Renderizado estático */}
        </Table>
      </div>
    </div>
  )
}
```

**En `page.tsx` (líneas 9-42):**
```typescript
export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema y sus roles
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<UsersTableSkeleton />}>
            <UsersList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Client Components Pattern

**En `user-form.tsx` (líneas 1-93):**
```typescript
"use client"

import { useState } from "react"
import { createUserAction } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function UserForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    
    try {
      const result = await createUserAction(formData)
      
      if (result.success) {
        toast.success(result.message)
        router.push("/admin/users")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error creando usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Form inputs */}
    </form>
  )
}
```

## 3. Modelo de Datos - Schema Prisma

### Modelo Category Existente

**En `prisma/schema.prisma` (líneas 54-64):**
```prisma
model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  posts       Post[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("categories")
}
```

**Características del modelo:**
- ID tipo `cuid()` (patrón establecido)
- Campo `slug` único para URLs amigables
- Descripción opcional
- Relación one-to-many con Posts
- Timestamps automáticos
- Mapeo a tabla `categories`

### Relación con Posts

**En `schema.prisma` (líneas 90-91):**
```prisma
categoryId    String
category      Category    @relation(fields: [categoryId], references: [id])
```

## 4. Autenticación y Autorización

### Middleware de Protección

**En `middleware.ts` (líneas 46-50):**
```typescript
// Role-based access control
// Only superadmins can access /admin
if (nextUrl.pathname.startsWith("/admin") && userRole !== "superadmin") {
  return NextResponse.redirect(new URL("/", nextUrl))
}
```

### Auth Service Integration

**En `lib/auth.ts` (líneas 48-58):**
```typescript
callbacks: {
  async signIn({ user }) {
    const existingUser = await getUserByEmail(user.email!)
    
    if (!existingUser) {
      return false
    }
    
    return true
  }
}
```

### Validación en Server Actions

**Patrón obligatorio identificado en todas las actions:**
```typescript
const session = await auth()

if (!session?.user || session.user.role !== "superadmin") {
  throw new Error("No autorizado")
}
```

## 5. Patrones UI/UX Establecidos

### Layout Admin

**En `admin/layout.tsx` (líneas 5-22):**
```typescript
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AdminSidebar>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-none lg:max-w-6xl lg:mx-auto">
            {children}
          </div>
        </main>
      </AdminSidebar>
    </SessionProvider>
  )
}
```

### Componentes shadcn/ui Utilizados

- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`
- `Button`, `Input`, `Label`, `Select`
- `Badge`, `Avatar`, `Skeleton`
- `Dialog`, `Sheet`, `Tooltip`
- `toast` (sonner) para notificaciones

### Patrón de Estados Loading

**En `users-table-skeleton.tsx`:**
- Skeleton components para estados de carga
- Suspense boundaries en páginas principales
- Loading states en formularios con `useState`

## 6. Convenciones TypeScript

### Tipos del Sistema

**En `types/next-auth.d.ts` (líneas 1-21):**
```typescript
declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string | null
    role: string // "superadmin" o "" para usuarios normales
  }
  
  interface Session {
    user: User
  }
}
```

### Tipos de Servicio

**Patrón establecido:**
```typescript
// Tipos derivados de Zod schemas
export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>

// Tipos personalizados para compatibilidad
export type UserWithStringRole = Omit<User, 'role'> & { role: string }
```

## 7. Configuración Prisma

### Client Setup

**En `lib/prisma.ts` (líneas 1-13):**
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 8. Estructura de Servicios Dashboard

### Metrics Service Pattern

**En `dashboard-service.ts` (líneas 1-51):**
```typescript
import { prisma } from "@/lib/prisma"

export interface AdminDashboardMetrics {
  totalUsers: number
  colaboradores: number
  activeUsers: number
  superadmins: number
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const [totalUsers, colaboradores, activeUsers, superadmins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "colaborador" } }),
    prisma.user.count({ where: { isOnboarded: true } }),
    prisma.user.count({ where: { role: "superadmin" } })
  ])

  return { totalUsers, colaboradores, activeUsers, superadmins }
}
```

## Recomendaciones para CRUD de Categorías

### 1. Estructura de Archivos Obligatoria

```
src/app/admin/categories/
├── actions.ts              # Server actions (CRUD operations)
├── page.tsx               # Página principal con listado
├── category-form.tsx      # Formulario crear/editar
├── categories-list.tsx    # RSC para tabla
├── categories-skeleton.tsx # Loading state
├── category-actions-client.tsx # Client actions (delete, etc)
└── new/
    └── page.tsx           # Crear categoría
└── [id]/
    └── edit/
        └── page.tsx       # Editar categoría
```

### 2. Category Service Obligatorio

```typescript
// src/services/category-service.ts
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { type Category } from "@prisma/client"

export const createCategorySchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  slug: z.string().min(1, "Slug requerido"),
  description: z.string().nullable().optional()
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryData = z.infer<typeof createCategorySchema>
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>

export async function createCategory(data: CreateCategoryData): Promise<Category> {
  const validated = createCategorySchema.parse(data)
  return await prisma.category.create({ data: validated })
}

// Más funciones CRUD...
```

### 3. Server Actions Pattern

```typescript
// src/app/admin/categories/actions.ts
"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createCategory, getAllCategories } from "@/services/category-service"

export async function createCategoryAction(formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    // Validación y creación
    const result = await createCategory(/* datos */)
    
    revalidatePath("/admin/categories")
    return { success: true, category: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error creando categoría" 
    }
  }
}
```

### 4. Validaciones Críticas

- **Slug único**: Validar en servidor antes de crear/actualizar
- **Nombre requerido**: Validación Zod y frontend
- **Autorización superadmin**: En todas las operaciones de escritura
- **Relaciones intactas**: No permitir eliminar categorías con posts asociados

### 5. UI Components Requeridos

- Seguir patrón established con `Card`, `Table`, `Button`
- Implementar skeleton loading states
- Toast notifications con sonner
- Form validation con estados loading
- Modal/Sheet para confirmaciones de eliminación

## Conclusiones

El codebase tiene patrones extremadamente consistentes que **DEBEN** respetarse:

1. **Arquitectura en capas estricta** - Solo servicios acceden a Prisma
2. **Co-ubicación modular** - Cada feature auto-contenida
3. **Server Actions preferidas** sobre API routes
4. **Validaciones Zod obligatorias** en servicios
5. **Autorización por rol** en todas las operaciones admin
6. **RSC + Client Components** híbrido establecido
7. **TypeScript estricto** con tipos derivados de Zod

**El CRUD de categorías debe seguir estos patrones EXACTAMENTE** para mantener coherencia arquitectónica y aprovechar la infraestructura existente.

---

**Referencias consultadas:**
- `/docs/architecture.md` - Reglas arquitectónicas oficiales
- `prisma/schema.prisma` - Modelo de datos establecido
- `src/services/` - Patrones de servicios existentes
- `src/app/admin/users/` - Implementación CRUD de referencia
- `middleware.ts` - Sistema de autenticación y autorización