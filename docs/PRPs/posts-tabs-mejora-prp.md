# PRP: Mejora de Tabs en Formulario de Posts

## Goal
Reorganizar y mejorar la experiencia de edición de posts mediante la reestructuración de los tabs existentes, implementando un selector de categorías con búsqueda (Command), mejorando el drag & drop de imágenes, optimizando el editor Novel y ajustando las URLs de SEO para la nueva estructura `/blog/[categorySlug]/[postSlug]`.

## Why
- **Mejor organización**: Separar "Datos básicos" del "Contenido" mejora el flujo de trabajo editorial
- **UX mejorada**: Command selector para categorías es más eficiente con muchas categorías
- **Editor optimizado**: Maximizar espacio del Novel editor mejora la experiencia de escritura
- **Drag & drop moderno**: Mejora significativa en la carga de imágenes destacadas
- **SEO mejorado**: URLs con categoría mejoran estructura del sitio y navegabilidad

## What
Modificar el formulario de creación/edición de posts reorganizando los 3 tabs actuales con mejoras específicas en cada uno:

### Success Criteria
- [ ] Tab "Datos básicos" contiene: título, slug, categoría (command selector), idioma, resumen e imagen (drag & drop)
- [ ] Tab "Contenido" muestra solo el editor Novel ocupando todo el espacio disponible
- [ ] Tab "SEO" actualizado con preview de URL nueva: `/blog/[categorySlug]/[postSlug]`
- [ ] Command selector de categorías funcional con búsqueda en tiempo real
- [ ] Drag & drop de imagen con zona visual y preview mejorado
- [ ] Editor Novel sin padding superior excesivo y altura maximizada
- [ ] Todos los tests pasan sin errores de lint o types
- [ ] Validaciones y server actions funcionando correctamente

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Reglas arquitectónicas estrictas del proyecto
  
- file: /docs/features.md
  why: Estado actual del proyecto y feature a implementar
  
- file: /docs/sistema-diseno-gz.md
  why: Sistema de diseño completo para UI consistente
  
- file: prisma/schema.prisma
  why: Modelo Post y Category para entender relaciones
  
- file: src/app/admin/posts/post-form.tsx
  why: Componente principal a modificar (tabs actuales líneas 223-411)
  
- file: src/app/admin/posts/post-editor.tsx
  why: Editor Novel actual para entender integración
  
- file: src/app/admin/posts/post-image-upload.tsx
  why: Componente de upload actual a mejorar con drag & drop
  
- file: src/services/post-service.ts
  why: Servicios y validaciones existentes
  
- file: src/services/category-service.ts
  why: Para obtener categorías para el selector
  
- url: https://ui.shadcn.com/docs/components/command
  why: Documentación del componente Command
  section: "Command with Popover (Combobox)"
  
- url: https://novel.sh/docs
  why: Documentación de Novel editor
  section: "Editor configuration"
```

### Current Codebase Structure
```bash
src/app/admin/posts/
├── page.tsx                 # Listado de posts
├── new/page.tsx            # Crear nuevo post
├── [id]/edit/page.tsx      # Editar post existente
├── post-form.tsx           # ARCHIVO PRINCIPAL A MODIFICAR
├── post-editor.tsx         # Editor Novel (modificar CSS)
├── post-image-upload.tsx   # Upload imagen (añadir drag & drop)
├── post-skeleton.tsx       # Loading states
└── actions.ts              # Server actions
```

### Current Tab Structure (post-form.tsx)
```typescript
// ACTUAL - 3 tabs
<Tabs defaultValue="content" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="content">Contenido</TabsTrigger>
    <TabsTrigger value="media">Multimedia</TabsTrigger>
    <TabsTrigger value="seo">SEO</TabsTrigger>
  </TabsList>
  
  // Tab 1: Contenido - título, slug, categoría, idioma, resumen, editor
  // Tab 2: Multimedia - imagen destacada
  // Tab 3: SEO - título SEO, descripción, preview
</Tabs>
```

### Desired Tab Structure
```typescript
// NUEVA ESTRUCTURA - 3 tabs reorganizados
<Tabs defaultValue="basic" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="basic">Datos básicos</TabsTrigger>
    <TabsTrigger value="content">Contenido</TabsTrigger>
    <TabsTrigger value="seo">SEO</TabsTrigger>
  </TabsList>
  
  // Tab 1: Datos básicos - título, slug, categoría (command), idioma, resumen, imagen (drag & drop)
  // Tab 2: Contenido - SOLO editor Novel full height
  // Tab 3: SEO - título, descripción, preview con nueva URL
</Tabs>
```

### Known Implementation Patterns
```typescript
// PATTERN: Command Selector (Combobox) para Categorías
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Estructura básica del Combobox
<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" className="justify-between">
      {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "Seleccionar categoría..."}
      <ChevronsUpDown className="opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="p-0">
    <Command>
      <CommandInput placeholder="Buscar categoría..." />
      <CommandList>
        <CommandEmpty>No se encontraron categorías</CommandEmpty>
        <CommandGroup>
          {categories.map((category) => (
            <CommandItem
              key={category.id}
              onSelect={() => {
                setCategoryId(category.id)
                setOpen(false)
              }}
            >
              <Check className={cn("mr-2", categoryId === category.id ? "opacity-100" : "opacity-0")} />
              {category.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>

// PATTERN: Drag & Drop para Imagen
const [isDragging, setIsDragging] = useState(false)

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault()
  setIsDragging(true)
}

const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault()
  setIsDragging(false)
}

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault()
  setIsDragging(false)
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    handleFileUpload(file)
  }
}

// UI del área de drop
<div
  className={cn(
    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
    "hover:border-primary hover:bg-primary/5"
  )}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
  {!previewUrl ? (
    <>
      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">
        Arrastra una imagen o haz clic para seleccionar
      </p>
      <input type="file" className="hidden" onChange={handleFileSelect} />
    </>
  ) : (
    // Preview de imagen
  )}
</div>

// PATTERN: Editor Novel Full Height
// En post-editor.tsx modificar el EditorContent
<EditorContent 
  className={cn(
    "min-h-[500px] h-[calc(100vh-400px)]", // Altura dinámica
    "px-8 py-4", // Reducir padding superior
    "prose prose-stone dark:prose-invert",
    "focus:outline-none"
  )}
/>

// GOTCHA: El editor Novel se carga dinámicamente (SSR disabled)
const DynamicPostEditor = dynamic(() => import("./post-editor"), { 
  ssr: false,
  loading: () => <PostEditorSkeleton />
})
```

## Implementation Blueprint

### Data Models & Types
```typescript
// No changes needed to Prisma schema
// Post model already has categoryId relation

// Types for category selector
interface Category {
  id: string
  name: string
  slug: string
}

// Enhanced image upload props
interface EnhancedImageUploadProps {
  imageUrl: string | null | undefined
  onImageChange: (url: string | null) => void
  postId?: string
  className?: string
  enableDragDrop?: boolean // New prop
}
```

### Task List (Orden de Implementación)

```yaml
Task 1: Install Command Component if needed
CHECK if exists: src/components/ui/command.tsx
IF NOT EXISTS:
  RUN: pnpm dlx shadcn@latest add command popover
VALIDATE: Components installed correctly

Task 2: Create Category Command Selector Component
CREATE src/app/admin/posts/category-selector.tsx:
  - Import Command, Popover components
  - Fetch categories using getAllCategories()
  - Implement search/filter functionality
  - Handle selection with callback
  - Add loading and empty states
  - Style with shadcn/ui patterns

Task 3: Enhance Image Upload with Drag & Drop
MODIFY src/app/admin/posts/post-image-upload.tsx:
  - ADD drag event handlers (dragover, dragleave, drop)
  - ADD visual feedback for drag states
  - ENHANCE UI with drop zone styling
  - MAINTAIN existing upload functionality
  - ADD better preview with overlay controls
  - Test with various image formats

Task 4: Optimize Novel Editor Styling
MODIFY src/app/admin/posts/post-editor.tsx:
  - ADJUST EditorContent className
  - REMOVE excessive top padding (currently too much space)
  - ADD dynamic height calculation: h-[calc(100vh-400px)]
  - ENSURE min-height for usability
  - TEST responsiveness on different screens

Task 5: Reorganize Tabs Structure
MODIFY src/app/admin/posts/post-form.tsx:
  - CHANGE tab values: "content" → "basic", keep "content", keep "seo"
  - CHANGE tab labels accordingly
  - MOVE fields between tabs:
    * TO "basic": título, slug, categoría, idioma, resumen, imagen
    * TO "content": ONLY Novel editor
    * KEEP "seo": but update URL preview

Task 6: Implement Tab 1 - Datos Básicos
IN src/app/admin/posts/post-form.tsx (TabsContent value="basic"):
  - KEEP: título input with character counter
  - KEEP: slug input with validation
  - REPLACE: category select → CategorySelector component
  - KEEP: language selector
  - KEEP: excerpt textarea with counter
  - MOVE: image upload from "media" tab
  - ARRANGE: logical field order

Task 7: Implement Tab 2 - Contenido
IN src/app/admin/posts/post-form.tsx (TabsContent value="content"):
  - REMOVE: all fields except editor
  - REMOVE: "Contenido del post" label
  - ADD: full-height wrapper div
  - ENSURE: editor fills available space
  - ADD: className for max height utilization

Task 8: Update Tab 3 - SEO
IN src/app/admin/posts/post-form.tsx (TabsContent value="seo"):
  - KEEP: SEO title and description
  - UPDATE: URL preview to show /blog/[categorySlug]/[postSlug]
  - FETCH: category slug for preview
  - ADD: dynamic URL construction
  - STYLE: maintain Google preview styling

Task 9: Update Form State Management
MODIFY src/app/admin/posts/post-form.tsx:
  - ENSURE: categoryId state updates from new selector
  - MAINTAIN: all validations
  - TEST: form submission with new structure
  - VERIFY: data persistence on tab switches

Task 10: Testing & Validation
TEST all scenarios:
  - Create new post with all fields
  - Edit existing post
  - Category search and selection
  - Image drag & drop
  - Tab switching preserves data
  - Form validation works
  - Server actions execute correctly
RUN: pnpm run lint && pnpm run typecheck
```

### Per-Task Implementation Details

```typescript
// Task 2: Category Selector Component
// src/app/admin/posts/category-selector.tsx
"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getAllCategories } from "@/services/category-service"

interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CategorySelector({ value, onChange, className }: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllCategories().then(cats => {
      setCategories(cats)
      setLoading(false)
    })
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...</>
          ) : value ? (
            categories.find(c => c.id === value)?.name || "Seleccionar categoría..."
          ) : (
            "Seleccionar categoría..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar categoría..." />
          <CommandList>
            <CommandEmpty>No se encontraron categorías</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onChange(category.id)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === category.id ? "opacity-100" : "opacity-0")} />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Task 3: Enhanced Image Upload
// Modifications to src/app/admin/posts/post-image-upload.tsx
// ADD these handlers and state:
const [isDragging, setIsDragging] = useState(false)

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragging(true)
}

const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragging(false)
}

const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragging(false)
  
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    await processFile(file) // Existing upload logic
  } else {
    toast.error("Por favor arrastra un archivo de imagen")
  }
}

// Task 5-8: Tab Reorganization in post-form.tsx
// New structure example:
<Tabs defaultValue="basic" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="basic">Datos básicos</TabsTrigger>
    <TabsTrigger value="content">Contenido</TabsTrigger>
    <TabsTrigger value="seo">SEO</TabsTrigger>
  </TabsList>

  <TabsContent value="basic" className="space-y-4 mt-6">
    {/* Título, Slug, CategorySelector, Idioma, Resumen, ImageUpload */}
  </TabsContent>

  <TabsContent value="content" className="mt-6">
    <div className="h-[calc(100vh-350px)] min-h-[500px]">
      <DynamicPostEditor
        content={content}
        onChange={handleContentChange}
        onAutoSave={handleAutoSave}
      />
    </div>
  </TabsContent>

  <TabsContent value="seo" className="space-y-4 mt-6">
    {/* SEO fields with updated URL preview */}
    <div className="text-sm text-muted-foreground">
      Vista previa: /blog/{categorySlug}/{slug || 'slug-del-post'}
    </div>
  </TabsContent>
</Tabs>
```

### Integration Points
```yaml
COMPONENTS:
  - Command/Popover: Para selector de categorías
  - Tabs: Mantener componente existente
  - Novel Editor: Ajustar CSS únicamente
  - Upload: Mejorar con drag & drop

SERVICES:
  - category-service: getAllCategories() para selector
  - post-service: Sin cambios
  - upload-service: Sin cambios

STATE MANAGEMENT:
  - categoryId: Actualizar con nuevo selector
  - Validaciones: Mantener todas las existentes
  - Auto-save: Mantener funcionalidad actual

SERVER ACTIONS:
  - No requieren cambios
  - Validaciones Zod siguen igual
```

## Validation Loop

### Level 1: Syntax & Types
```bash
pnpm run lint
pnpm run typecheck
# Expected: 0 errors
```

### Level 2: Component Tests
```bash
# Test individual components
# 1. Category selector loads and filters
# 2. Image drag & drop accepts valid files
# 3. Editor height adjusts properly
# 4. Tabs preserve state on switch
```

### Level 3: Integration Tests
```bash
pnpm run dev
# Manual testing:
# 1. Create new post with all fields
# 2. Edit existing post
# 3. Test category search
# 4. Drag & drop image
# 5. Switch tabs - verify data persistence
# 6. Save draft and publish
```

### Level 4: Build Validation
```bash
pnpm run build
# Expected: Build success without warnings
```

## Final Checklist

### Funcionalidad
- [ ] Tab "Datos básicos" contiene todos los campos especificados
- [ ] Command selector de categorías funciona con búsqueda
- [ ] Drag & drop de imagen con feedback visual
- [ ] Tab "Contenido" muestra solo el editor
- [ ] Editor Novel sin padding excesivo y altura maximizada
- [ ] Tab "SEO" con preview de URL actualizado
- [ ] Formulario guarda y publica correctamente

### Calidad de Código
- [ ] Sin errores de lint o TypeScript
- [ ] Componentes reutilizables creados
- [ ] Patrones del proyecto respetados
- [ ] Server actions funcionando
- [ ] Validaciones mantenidas

### UX Improvements
- [ ] Mejor organización de campos
- [ ] Búsqueda rápida de categorías
- [ ] Drag & drop intuitivo
- [ ] Máximo espacio para escritura
- [ ] Transiciones suaves entre tabs

## Anti-Patterns to Avoid

### Component Architecture
- ❌ NO crear componentes fuera del módulo posts
- ❌ NO duplicar lógica de servicios
- ❌ NO romper validaciones existentes
- ❌ NO cambiar server actions innecesariamente

### UI/UX
- ❌ NO cambiar el estilo visual establecido
- ❌ NO remover funcionalidad existente
- ❌ NO hacer el editor más pequeño de 500px
- ❌ NO olvidar estados de loading
- ❌ NO permitir submit con datos inválidos

### Performance
- ❌ NO cargar todas las categorías sin lazy loading
- ❌ NO re-renderizar innecesariamente
- ❌ NO perder el autosave del editor
- ❌ NO hacer requests duplicados

## Confidence Score: 9/10

Este PRP tiene alta probabilidad de éxito porque:
- Usa componentes shadcn/ui estándar (Command, Popover)
- Mantiene la arquitectura existente
- No modifica servicios o modelos
- Cambios principalmente de UI/UX
- Patrones bien documentados y probados