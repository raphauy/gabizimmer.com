# PRP: CRUD de Categorías para Admin

## Goal
Implementar un sistema CRUD completo para la gestión de categorías del blog en el panel de administración, siguiendo exactamente los patrones arquitectónicos establecidos en el proyecto gabizimmer.com. Al finalizar debe existir:

- Módulo completo co-ubicado en `src/app/admin/categories/`
- Servicio `category-service.ts` con validaciones Zod
- Interfaz admin para crear, listar, editar y eliminar categorías
- UI consistente con el diseño existente del panel admin
- Validaciones robustas (slug único, nombre requerido)
- Protección de datos (no eliminar categorías con posts asociados)

## Why
- **Organización de contenido**: Permitir a Gabi y colaboradores categorizar posts del blog
- **SEO y navegación**: URLs estructuradas como `/blog/categoria/vinos` 
- **Experiencia de usuario**: Lectores pueden filtrar contenido por temas de interés
- **Gestión editorial**: Facilitar la administración y organización de contenido
- **Escalabilidad**: Base sólida para el sistema de taxonomía del blog

## What
Sistema de administración de categorías con:

### Funcionalidades Principales
- **Listado paginado** de categorías con búsqueda
- **Crear nueva categoría** con nombre, slug único y descripción opcional
- **Editar categoría existente** manteniendo relaciones con posts
- **Eliminar categoría** solo si no tiene posts asociados
- **Validación de slug único** en tiempo real
- **Conteo de posts** asociados por categoría

### Success Criteria
- [ ] Category service implementado con validaciones Zod completas
- [ ] Módulo admin/categories funcional con todas las operaciones CRUD
- [ ] UI consistente con el patrón establecido en admin/users
- [ ] Slug único validado tanto en frontend como backend
- [ ] No se pueden eliminar categorías con posts asociados
- [ ] Server Actions implementadas con manejo de errores robusto
- [ ] Tests unitarios para el service layer
- [ ] Navegación actualizada en admin sidebar
- [ ] Build exitoso sin errores de lint/types

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Reglas arquitectónicas estrictas que debe seguir el PRP
  
- file: /docs/features.md
  why: Estado actual del proyecto y features implementadas
  
- file: /docs/sistema-diseno-gz.md
  why: CRÍTICO - Sistema de diseño oficial con componentes, colores y patrones UI
  
- file: prisma/schema.prisma
  why: Modelo Category ya definido, relaciones con Post
  
- file: src/services/user-service.ts
  why: Patrón de servicios a seguir, validaciones Zod co-ubicadas
  
- file: src/app/admin/users/page.tsx
  why: Patrón RSC con Suspense establecido
  
- file: src/app/admin/users/actions.ts
  why: Estructura de Server Actions con autenticación
  
- file: src/app/admin/users/users-list.tsx
  why: Patrón RSC para listado con Table components
  
- file: src/app/admin/users/user-form.tsx
  why: Patrón de formularios con validación y estados loading
  
- file: src/app/admin/components/admin-sidebar.tsx
  why: Actualizar navegación con link a categories
```

### Current Codebase Tree
```bash
# Ejecutar: tree -I 'node_modules|.git|.next' -L 3
src/
├── app/
│   ├── admin/
│   │   ├── components/         # AdminSidebar, AdminHeader
│   │   ├── users/             # Módulo completo de referencia
│   │   └── page.tsx           # Dashboard principal
│   ├── globals.css
│   └── layout.tsx
├── services/
│   ├── user-service.ts        # Patrón a seguir
│   ├── auth-service.ts        # Validaciones Zod
│   └── dashboard-service.ts   # Métricas
├── components/
│   └── ui/                    # shadcn/ui components
└── lib/
    ├── auth.ts
    └── prisma.ts              # SOLO services pueden importar
```

### Desired Codebase Tree
```bash
# Archivos nuevos y su responsabilidad
src/
├── services/
│   └── category-service.ts     # CRUD + lógica, acceso a BD
├── app/
│   └── admin/categories/      # Módulo co-ubicado completo
│       ├── page.tsx           # RSC principal con Suspense
│       ├── actions.ts         # Server actions para CRUD
│       ├── categories-list.tsx # RSC para tabla de datos
│       ├── category-form.tsx   # Formulario crear/editar
│       ├── categories-skeleton.tsx # Loading state
│       ├── category-actions-client.tsx # Delete/Edit client
│       └── new/
│           └── page.tsx       # Crear categoría
│       └── [id]/
│           └── edit/
│               └── page.tsx   # Editar categoría
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Arquitectura en capas estricta (docs/architecture.md)
// - SOLO services/ puede importar prisma (@/lib/prisma)
// - Componentes/lib/auth NUNCA importan prisma directamente
// - RSC fetchea datos → pasa props a cliente
// - Server Actions en lugar de API routes
// - Co-ubicación modular: todo de una feature junto

// PATTERN: Validaciones Zod co-ubicadas al inicio del servicio
// src/services/category-service.ts
export const createCategorySchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100, "Máximo 100 caracteres"),
  slug: z.string()
    .min(1, "Slug requerido")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug debe ser lowercase con guiones"),
  description: z.string().nullable().optional()
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryData = z.infer<typeof createCategorySchema>
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>

// GOTCHA: Validar slug único antes de crear/actualizar
export async function getCategoryBySlug(slug: string) {
  return await prisma.category.findUnique({ where: { slug } })
}

// PATTERN: Co-ubicación modular - estructura por feature
src/app/admin/categories/
├── page.tsx                    # RSC lista con Suspense
├── actions.ts                  # Server actions co-ubicadas
├── categories-list.tsx         # RSC fetch datos
├── category-form.tsx          # Formulario crear/editar
├── category-actions-client.tsx # Componente cliente
├── categories-skeleton.tsx    # Loading skeleton
├── new/page.tsx              # Crear
└── [id]/edit/page.tsx        # Editar

// PATTERN: Server Actions authentication pattern
"use server"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createCategoryAction(formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }
    
    // Validación y creación
    revalidatePath("/admin/categories")
    return { success: true, category: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error creando categoría" 
    }
  }
}

// GOTCHA: Modelo Category ya existe en Prisma
model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique  // ← Validación de unicidad crítica
  description String?
  posts       Post[]   // ← No eliminar si tiene posts
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@map("categories")
}

// PATTERN: No eliminar categorías con posts asociados
export async function deleteCategoryAction(categoryId: string) {
  // Verificar si tiene posts asociados
  const postsCount = await prisma.post.count({
    where: { categoryId }
  })
  
  if (postsCount > 0) {
    throw new Error(`No se puede eliminar: la categoría tiene ${postsCount} post(s) asociado(s)`)
  }
  
  return await deleteCategory(categoryId)
}
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// 1. Prisma Schema (YA EXISTE - NO MODIFICAR)
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

// 2. Zod Validations (en category-service.ts)
export const createCategorySchema = z.object({
  name: z.string()
    .min(1, "Nombre requerido")
    .max(100, "Máximo 100 caracteres")
    .trim(),
  slug: z.string()
    .min(1, "Slug requerido") 
    .max(100, "Máximo 100 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug debe ser lowercase con guiones")
    .trim(),
  description: z.string()
    .max(500, "Máximo 500 caracteres")
    .nullable()
    .optional()
})

export const updateCategorySchema = createCategorySchema.partial()

// 3. TypeScript Types
export type CreateCategoryData = z.infer<typeof createCategorySchema>
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>
export type CategoryWithPostCount = Category & { _count: { posts: number } }
```

### Task List (Orden de Implementación)
```yaml
Task 1: Service Layer (Arquitectura en Capas)
CREATE src/services/category-service.ts:
  - PATTERN: Copiar estructura exacta de user-service.ts
  - VALIDATIONS: Zod schemas co-ubicados al inicio
  - TYPES: Derivar de schemas (CreateCategoryData, UpdateCategoryData)
  - IMPLEMENT: createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory
  - UNIQUE VALIDATION: getCategoryBySlug para validar unicidad
  - EXTRA: getCategoriesWithPostCount para mostrar conteo
  - ONLY LAYER: Que puede importar @/lib/prisma

Task 2: Módulo Co-ubicado - Estructura Base
CREATE src/app/admin/categories/:
  - PATTERN: Co-ubicación modular (docs/architecture.md)
  - ESTRUCTURA: Todo relacionado con categories junto
  - COPIAR: Estructura exacta de admin/users/

Task 3: RSC Principal  
CREATE src/app/admin/categories/page.tsx:
  - COPY EXACT pattern from: src/app/admin/users/page.tsx
  - REPLACE: "Usuarios" → "Categorías", "users" → "categories"
  - SUSPENSE boundary con CategoriesSkeleton
  - NO 'use client' (RSC por defecto)
  - BUTTON: Link a /admin/categories/new

Task 4: RSC Data Fetching
CREATE src/app/admin/categories/categories-list.tsx:
  - ASYNC server component
  - CALL: getCategoriesWithPostCount() desde service
  - TABLE: Mostrar name, slug, posts count, actions
  - NO importar prisma directamente
  - USAR: shadcn/ui Table components

Task 5: Server Actions Co-ubicadas
CREATE src/app/admin/categories/actions.ts:
  - 'use server' al inicio
  - COPY PATTERN: src/app/admin/users/actions.ts
  - ACTIONS: createCategoryAction, updateCategoryAction, deleteCategoryAction
  - AUTH: Validar superadmin en cada action
  - UNIQUE: Validar slug único antes de crear/actualizar
  - PROTECT: No eliminar si tiene posts asociados
  - REVALIDATE: revalidatePath después de cambios
  - ERROR HANDLING: Try-catch con mensajes descriptivos

Task 6: Client Components Co-ubicados
CREATE src/app/admin/categories/category-actions-client.tsx:
  - 'use client' al inicio
  - RECEIVE: categories como props
  - HANDLE: Delete confirmations, edit navigation
  - USE: Dialog/AlertDialog para confirmaciones
  - TOAST: Notifications con sonner
  - STATE: Loading states durante operaciones

Task 7: Forms Co-ubicados
CREATE src/app/admin/categories/category-form.tsx:
  - FORM: Para crear/editar categorías
  - VALIDATION: Client-side con Zod
  - SLUG: Auto-generate from name con función slugify
  - USE: Server actions del módulo
  - LOADING: States durante submit
  - CONSISTENT: Con otros forms del proyecto

Task 8: Skeleton Co-ubicado
CREATE src/app/admin/categories/categories-skeleton.tsx:
  - LOADING state para table
  - COPY PATTERN: users-table-skeleton.tsx
  - CONSISTENT: Con diseño establecido

Task 9: Sub-páginas del Módulo
CREATE src/app/admin/categories/new/page.tsx:
  - FORM: Para crear nueva categoría
  - LAYOUT: Consistent con users/new/page.tsx
  - NAVIGATION: Breadcrumbs y botón volver

CREATE src/app/admin/categories/[id]/edit/page.tsx:
  - FORM: Pre-poblado para editar
  - VALIDATION: ID exists antes de mostrar form
  - ERROR: 404 si categoría no existe

Task 10: Update Navigation
MODIFY src/app/admin/components/admin-sidebar.tsx:
  - ADD: Link a categorías en sección apropiada
  - ICON: Usar Folder o FolderOpen de lucide-react
  - ORDER: Lógico en la navegación (después de posts, antes de settings)
```

### Per-Task Pseudocode
```typescript
// Task 1: Service Layer
// src/services/category-service.ts
import { prisma } from '@/lib/prisma' // SOLO services importan prisma
import { z } from 'zod'
import { type Category } from '@prisma/client'

// Validaciones al inicio
const createCategorySchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  slug: z.string().min(1, "Slug requerido").regex(/^[a-z0-9-]+$/, "Slug inválido"),
  description: z.string().nullable().optional()
})

export async function createCategory(data: unknown) {
  // PATTERN: Validar primero
  const validated = createCategorySchema.parse(data)
  
  // UNIQUE: Verificar slug no existe
  const existing = await getCategoryBySlug(validated.slug)
  if (existing) {
    throw new Error('Ya existe una categoría con este slug')
  }
  
  // PATTERN: Try-catch para errores de BD
  try {
    const category = await prisma.category.create({
      data: validated
    })
    return category
  } catch (error) {
    // PATTERN: Log pero no exponer detalles
    console.error('Error creating category:', error)
    throw new Error('Error al crear categoría')
  }
}

// Task 5: Server Actions
// src/app/admin/categories/actions.ts
"use server"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache" 
import { createCategory } from "@/services/category-service"

export async function createCategoryAction(formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    
    const category = await createCategory({ name, slug, description })
    
    revalidatePath("/admin/categories")
    return { success: true, category, message: "Categoría creada correctamente" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error creando categoría" 
    }
  }
}

// Task 4: RSC Data Fetching
// src/app/admin/categories/categories-list.tsx
import { getCategoriesWithPostCount } from '@/services/category-service'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'

export async function CategoriesList() {
  // PATTERN: Server component puede llamar servicios
  const categories = await getCategoriesWithPostCount()
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-jost font-medium">Nombre</TableHead>
          <TableHead className="font-jost font-medium">Slug</TableHead>
          <TableHead className="font-jost font-medium">Posts</TableHead>
          <TableHead className="text-right font-jost font-medium">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map(category => (
          <TableRow key={category.id} className="hover:bg-muted/50">
            <TableCell className="font-jost font-medium">{category.name}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="font-mono text-xs">
                {category.slug}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-wine-primary">
                {category._count.posts} posts
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Integration Points
```yaml
DATABASE:
  - model: Category ya existe en schema
  - migration: No requiere cambios de schema
  - validation: pnpm prisma studio para verificar datos

AUTH:
  - protect routes: middleware.ts ya protege /admin/*
  - role check: session.user.role === 'superadmin' en cada action
  - error handling: Throw "No autorizado" si no es superadmin

UI:
  - design system: /docs/sistema-diseno-gz.md (OBLIGATORIO seguir)
  - components: shadcn/ui v4 existentes (Table, Card, Button, Form, Badge)
  - colors: wine theme variables (--wine-primary, --wine-secondary)  
  - typography: font-jost para UI, espaciado sistema base 8px
  - dark mode: automático with ThemeProvider ya configurado
  - responsive: mobile-first con breakpoints establecidos
  - icons: lucide-react (Folder, FolderOpen, Edit, Trash2, Plus)
  - spacing: usar tokens del sistema (p-4, p-6, space-y-4)
  - shadows: shadow-md para cards, shadow-lg para modals

NAVIGATION:
  - admin sidebar: agregar link en sección apropiada
  - breadcrumbs: consistent con otros módulos
  - active states: highlight cuando esté en /admin/categories

BUSINESS RULES:
  - slug unique: validar en service antes de crear/actualizar
  - no delete with posts: verificar relaciones antes de eliminar
  - superadmin only: todas las operaciones CRUD
  - input sanitization: trim strings, normalize slugs
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar PRIMERO - corregir errores antes de continuar
pnpm run lint          # ESLint
pnpm run typecheck     # TypeScript
# Expected: 0 errores, 0 warnings
```

### Level 2: Database
```bash
# Validar que modelo Category funciona
pnpm prisma studio
# Expected: Ver tabla categories, crear/editar registros manualmente
```

### Level 3: Unit Tests
```typescript
// CREATE src/services/__tests__/category-service.test.ts
import { createCategory, getAllCategories, getCategoryBySlug } from '../category-service'

describe('CategoryService', () => {
  test('creates category with valid data', async () => {
    const data = { name: 'Vinos', slug: 'vinos', description: 'Todo sobre vinos' }
    const result = await createCategory(data)
    expect(result.name).toBe('Vinos')
    expect(result.slug).toBe('vinos')
  })
  
  test('rejects invalid slug format', async () => {
    const data = { name: 'Test', slug: 'INVALID SLUG!' }
    await expect(createCategory(data)).rejects.toThrow('Slug inválido')
  })
  
  test('rejects duplicate slug', async () => {
    await createCategory({ name: 'Test', slug: 'test-slug' })
    const duplicate = { name: 'Test 2', slug: 'test-slug' }
    await expect(createCategory(duplicate)).rejects.toThrow('Ya existe una categoría')
  })
})
```

### Level 4: Integration
```bash
# Dev server
pnpm run dev

# Test páginas cargan
# Expected: http://localhost:3000/admin/categories (lista)
# Expected: http://localhost:3000/admin/categories/new (formulario)

# Test funcionalidad
# 1. Crear categoría nueva
# 2. Editar categoría existente  
# 3. Intentar eliminar categoría con posts (debe fallar)
# 4. Eliminar categoría sin posts (debe funcionar)
```

### Level 5: Production Build
```bash
pnpm run build
# Expected: Build exitoso sin warnings críticos

pnpm run start
# Test en http://localhost:3000/admin/categories
# Expected: Funcionalidad completa en modo producción
```

## Final Checklist

### Arquitectura en Capas (docs/architecture.md)
- [ ] Solo services/ importa @/lib/prisma
- [ ] Validaciones Zod co-ubicadas al inicio del servicio
- [ ] Tipos derivados de schemas Zod
- [ ] Server Actions en lugar de API routes
- [ ] Co-ubicación modular: toda la feature junta
- [ ] Service enfocado solo en Category domain

### Calidad de Código
- [ ] Todos los tests unitarios pasan
- [ ] Sin errores de lint/typecheck
- [ ] Slug único validado en servidor
- [ ] No eliminar categorías con posts asociados
- [ ] Manejo de errores robusto en Server Actions
- [ ] Loading states en todos los formularios
- [ ] Toast notifications para feedback

### Estructura Modular
- [ ] page.tsx (RSC principal sin 'use client')
- [ ] categories-list.tsx (RSC data fetching)
- [ ] actions.ts (Server actions co-ubicadas)
- [ ] category-actions-client.tsx (componente cliente)
- [ ] category-form.tsx (formulario crear/editar)
- [ ] categories-skeleton.tsx (loading state)
- [ ] new/page.tsx y [id]/edit/page.tsx (sub-páginas)

### Business Logic
- [ ] Auto-generar slug desde nombre en formulario
- [ ] Validar slug único antes de crear/actualizar
- [ ] Mostrar conteo de posts por categoría
- [ ] Proteger eliminación si tiene posts asociados
- [ ] Autorización superadmin en todas las operaciones

### UI/UX Consistency
- [ ] Sistema de diseño /docs/sistema-diseno-gz.md aplicado
- [ ] Consistent con patrón admin/users establecido
- [ ] shadcn/ui v4 components correctos (Table, Card, Button, Form, Badge)
- [ ] Colores wine theme (--wine-primary, --wine-secondary)
- [ ] Tipografía font-jost para UI headings y labels
- [ ] Espaciado sistema base 8px (p-4, p-6, space-y-4)
- [ ] Dark mode compatible con ThemeProvider existente
- [ ] Responsive design mobile-first con breakpoints
- [ ] Iconos lucide-react consistentes (Folder, Edit, Trash2)
- [ ] Navegación actualizada en sidebar con icono apropiado

## Anti-Patterns to Avoid

### Arquitectura en Capas (docs/architecture.md)
- ❌ NO importar `@/lib/prisma` fuera de `src/services/`
- ❌ NO crear queries Prisma en componentes, lib o auth
- ❌ NO usar API routes cuando Server Actions son apropiadas
- ❌ NO separar validaciones Zod de su servicio correspondiente
- ❌ NO crear servicios que manejen múltiples dominios sin relación

### Patrones del Proyecto
- ❌ NO usar 'use client' en pages principales (RSC por defecto)
- ❌ NO crear nuevos patrones si ya existen establecidos
- ❌ NO skipear validaciones Zod co-ubicadas en servicios
- ❌ NO exponer errores de BD directamente al usuario
- ❌ NO permitir eliminar categorías con posts asociados
- ❌ NO olvidar revalidatePath después de mutaciones
- ❌ NO mezclar features en un solo módulo (co-ubicación estricta)

### Data Integrity
- ❌ NO permitir slugs duplicados
- ❌ NO permitir slugs con caracteres inválidos para URLs
- ❌ NO eliminar datos sin verificar relaciones
- ❌ NO crear categorías sin validación de autorización

---

**Score de Confianza**: 9/10

Este PRP proporciona contexto exhaustivo, patrones establecidos del proyecto, ejemplos de código específicos y validaciones ejecutables. Un agente de IA con acceso al codebase debería poder implementar exitosamente el CRUD de categorías en una sola pasada siguiendo estas instrucciones.

**Referencias consultadas**:
- `/docs/architecture.md` - Reglas arquitectónicas oficiales
- `prisma/schema.prisma` - Modelo Category existente  
- `src/services/user-service.ts` - Patrón de servicios a replicar
- `src/app/admin/users/` - Módulo de referencia completo
- Análisis exhaustivo del codebase en `/docs/research/analisis-codebase-categorias-crud-2025.md`