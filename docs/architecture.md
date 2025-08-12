# Arquitectura en Capas - gabizimmer.com

Este proyecto utiliza una arquitectura en capas estricta para mantener separación de responsabilidades, escalabilidad y mantenibilidad. Está alineada con Next.js 15 (App Router), React Server Components, Prisma y Auth.js v5.

## Estructura de Capas

### Capa de Servicios (`src/services/`)
- Responsabilidad: Única capa que puede usar Prisma directamente
- Contenido: Operaciones CRUD, lógica de base de datos y orquestación de persistencia
- Archivos existentes: `auth-service.ts`, `user-service.ts`, `email-service.ts`, `upload-service.ts`, `dashboard-service.ts`
- Archivos planeados (blog): `blog-service.ts`, `category-service.ts`, `tag-service.ts`, `newsletter-service.ts`, `search-service.ts`
- Importaciones permitidas: `@prisma/client`, `@/lib/prisma`

```typescript
// ✅ CORRECTO: En src/services/user-service.ts o blog-service.ts
import { prisma } from "@/lib/prisma"

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({ where: { email } })
}

// Ejemplo blog (cuando el schema incluya Post)
export async function getPostBySlug(slug: string) {
  return await prisma.post.findUnique({ where: { slug } })
}
```

### Capa de Lógica de Negocio (`src/lib/`, `src/app/` y server actions)
- Responsabilidad: Lógica de aplicación, validaciones con Zod, Auth.js v5 (OTP), orquestación de contenido del blog (MDX + metadatos en BD), caching/ISR
- Importaciones: Solo servicios (nunca Prisma directamente)
- Prohibido: `import { prisma }` o cualquier uso directo de Prisma fuera de `src/services/`

```typescript
// ✅ CORRECTO: En src/lib/auth.ts (ya implementado)
import { getUserByEmail, getUserForAuth } from "@/services/user-service"
import { verifyOtpToken } from "@/services/auth-service"

// ❌ INCORRECTO: Usar Prisma directamente aquí
// import { prisma } from "@/lib/prisma"
```

### Capa de Presentación (Componentes React)
- Responsabilidad: UI, estado del cliente, interacciones
- Importaciones: Hooks, utils, y llamadas a servicios vía Server Components/Actions
- Prohibido: Prisma directo y lógica de base de datos

## Organización Modular por Features

El blog se organiza por features, co-ubicando UI, acciones del servidor y componentes específicos.

### Estructura Modular - Admin

```
src/app/admin/
├── layout.tsx
├── posts/
│   ├── page.tsx               # Listado de posts
│   ├── actions.ts             # Server actions de posts
│   ├── post-form.tsx          # Formulario crear/editar
│   ├── post-actions-client.tsx# Acciones cliente (borrar, publicar)
│   ├── posts-list.tsx         # RSC para tabla/lista
│   ├── posts-skeleton.tsx
│   └── new/
│       └── page.tsx           # Crear post
├── categories/
│   ├── page.tsx
│   └── actions.ts
├── tags/
│   ├── page.tsx
│   └── actions.ts
└── settings/
    └── page.tsx
```

### Estructura Modular - Público (Blog)

```
src/app/
├── blog/
│   ├── page.tsx                # Listado principal (ISR)
│   ├── loading.tsx
│   ├── [slug]/
│   │   ├── page.tsx            # Post individual (shell estático + partes dinámicas)
│   │   └── loading.tsx
│   ├── categoria/
│   │   └── [category]/page.tsx
│   └── tag/
│       └── [tag]/page.tsx
└── newsletter/
    ├── subscribe/page.tsx
    └── unsubscribe/page.tsx
```

## Patrones de Co-ubicación

### 1) Server Actions co-ubicadas
```typescript
// src/app/admin/posts/actions.ts
"use server"

import { createPost, updatePost, deletePost, publishPost } from "@/services/blog-service"
import { revalidatePath } from "next/cache"

export async function createPostAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const post = await createPost(data)
  revalidatePath("/admin/posts")
  revalidatePath(`/blog/${post.slug}`)
  return post
}
```

### 2) Componentes específicos de feature
```typescript
// src/app/admin/posts/post-form.tsx
import { useState } from "react"
import { createPostAction } from "./actions"

export function PostForm({ post, isEdit = false }: { post?: any; isEdit?: boolean }) {
  async function onSubmit(formData: FormData) {
    await createPostAction(formData)
  }
  // ... inputs controlados, editor WYSIWYG, etc.
  return null
}
```

## Servicios + Validaciones co-ubicadas

### Patrón de servicio con Zod
```typescript
// src/services/blog-service.ts
import { z } from "zod"
import { prisma } from "@/lib/prisma"

export const createPostSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  slug: z.string().min(1, "Slug requerido"),
  excerpt: z.string().optional(),
  contentPath: z.string().min(1, "Ruta de contenido MDX requerida"),
  featuredImage: z.string().url().optional(),
  language: z.enum(["es", "en", "pt"]).default("es"),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
  publishedAt: z.coerce.date().optional()
})

export type CreatePostData = z.infer<typeof createPostSchema>

export async function createPost(data: CreatePostData) {
  const validated = createPostSchema.parse(data)
  // Requiere que el schema Prisma incluya el modelo Post
  return await prisma.post.create({ data: validated })
}
```


## Reglas estrictas

### ✅ Hacer
- Crear servicios específicos por dominio: `blog-service.ts`, `category-service.ts`, `tag-service.ts`, etc.
- Co-ubicar validaciones Zod al inicio de cada servicio
- Usar tipos explícitos en servicios (`CreatePostData`, etc.)
- Usar Server Actions en lugar de API routes cuando aplique
- Mantener servicios enfocados en un solo modelo/dominio

### ❌ No hacer
- Importar `prisma` fuera de `src/services/`
- Crear queries de Prisma en componentes, `src/lib/` o archivos de rutas
- Mezclar responsabilidades de múltiples dominios en un servicio
- Introducir complejidad prematura o reutilización sin necesidad

## Beneficios de esta Arquitectura

- Mantenibilidad: Cambios en BD solo afectan servicios
- Modularidad: Features auto-contenidas fáciles de escalar
- Testabilidad: Servicios mockeables y validaciones explícitas
- Tipado: TypeScript fuerte a través de capas
- Developer Experience: Patrones repetibles y predecibles
- SEO y performance: ISR, metadata dinámica y assets optimizados

---

