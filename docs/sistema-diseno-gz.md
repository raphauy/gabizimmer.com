# 🍷 Sistema de Diseño - Gabi Zimmer

## 1. Introducción

### 1.1 Propósito del Sistema

Este sistema de diseño unifica la identidad visual de **Gabi Zimmer** con la implementación técnica del blog, proporcionando una guía exhaustiva para desarrolladores frontend. Establece design tokens, componentes, patrones y mejores prácticas para mantener consistencia visual y técnica en todo el proyecto.

### 1.2 Valores de Marca

Los valores fundamentales que guían todas las decisiones de diseño:

- **Autenticidad**: Comunicación genuina y transparente sobre vinos
- **Alegría**: Transmitir el placer y disfrute del mundo del vino
- **Simplicidad**: Hacer accesible el conocimiento enológico
- **Experiencia**: Basado en conocimiento profundo y vivencias reales
- **Empatía**: Conectar con productores, distribuidores y consumidores
- **Consciencia**: Respeto por el medio ambiente y la vitivinicultura sostenible

### 1.3 Principios de Diseño

1. **Elegancia Simple**: Interfaces limpias que reflejan la sofisticación del vino sin pretensiones
2. **Accesibilidad Universal**: WCAG AA compliance, contenido legible para todos
3. **Mobile-First**: Diseño responsive que prioriza la experiencia móvil
4. **Performance**: Optimización para carga rápida y experiencia fluida
5. **Consistencia Visual**: Uso coherente de colores, tipografías y componentes

### 1.4 Compatibilidad con shadcn/ui v4

Este sistema está **100% construido sobre shadcn/ui v4**, garantizando:

- ✅ Componentes base de alta calidad con Radix UI
- ✅ Integración perfecta con Tailwind CSS v4
- ✅ Type safety con TypeScript
- ✅ Accesibilidad incorporada
- ✅ Customización mediante Class Variance Authority (CVA)
- ✅ Dark mode nativo

### 1.5 Cómo Usar Este Documento

```typescript
// Estructura del documento
// 1. Valores y principios (contexto)
// 2. Identidad visual (marca)
// 3. Design tokens (variables)
// 4. Componentes (implementación)
// 5. Patrones (composición)
// 6. Recursos (assets)
// 7. Guías (mejores prácticas)
// 8. Herramientas (ecosistema)
```

## 2. Identidad Visual

### 2.1 Historia de la Marca

**Gabi Zimmer** es una experta en vinos y vitivinicultura uruguaya, apasionada por los procesos, historias, personas, naturaleza y características que hacen a la calidad de los vinos uruguayos. Su misión es apoyar a productores en Uruguay para mejorar la comercialización de vinos uruguayos a través de la comunicación, visibilización y promoción.

### 2.2 Conceptos Clave

#### Acciones de Marca
- **Explorar**: Descubrir nuevos vinos y regiones
- **Aprender/Enseñar**: Compartir conocimiento enológico
- **Compartir**: Difundir la cultura del vino
- **Disfrutar**: Celebrar el placer del vino
- **Ayudar/Acercar**: Conectar productores con consumidores
- **Liderar/Empoderar**: Fortalecer la industria vitivinícola
- **Comunicar/Visibilizar**: Dar voz al vino uruguayo

#### Pilares Temáticos
- **Vitivinicultura**: Técnica y tradición
- **Uruguay**: Identidad nacional y terroir único
- **Medio ambiente**: Sostenibilidad y consciencia ecológica
- **Colectivo**: Comunidad y colaboración
- **Historias**: Narrativas humanas detrás del vino
- **Saberes**: Conocimiento ancestral y moderno

### 2.3 Públicos Objetivo

1. **Productores locales**: Bodegas y viñedos uruguayos
2. **Distribuidores**: Nacionales e internacionales
3. **Consumidores**: 25-65 años, nivel socioeconómico medio/alto
4. **Profesionales**: Sommeliers, gastrónomos, periodistas especializados
5. **Entusiastas**: Amantes del vino en búsqueda de conocimiento

### 2.4 Mensajes Clave

- 🇬🇧 **"Hello everybody! I spread the word about Uruguayan wine."**
- 🇪🇸 **"¡Hola a todos! Comunico sobre el vino uruguayo."**

## 3. Design Tokens

### 3.1 Colores

#### Paleta Principal - Marca Gabi Zimmer

| Nombre | HEX | OKLCH | CSS Variable | Tailwind Class | Uso |
|--------|-----|-------|--------------|----------------|-----|
| **Amarillo GZ** | #EAE559 | oklch(0.89 0.16 104) | `--gabi-yellow` | `text-gabi-yellow` | Acentos principales, CTAs destacados |
| **Azul GZ** | #0170BB | oklch(0.51 0.14 242) | `--gabi-blue` | `text-gabi-blue` | Links, elementos interactivos |
| **Naranja GZ** | #FF915E | oklch(0.72 0.15 43) | `--gabi-orange` | `text-gabi-orange` | Alertas positivas, highlights |
| **Verde Oscuro** | #35472A | oklch(0.35 0.08 130) | `--gabi-dark-green` | `text-gabi-dark-green` | Textos principales, fondos oscuros |
| **Verde Claro** | #E7F0BC | oklch(0.93 0.09 110) | `--gabi-light-green` | `text-gabi-light-green` | Fondos suaves, cards secundarias |

#### Paleta Temática - Vinos (Existente en el Proyecto)

| Nombre | Light Mode | Dark Mode | CSS Variable | Uso |
|--------|------------|-----------|--------------|-----|
| **Wine Primary** | oklch(0.5 0.15 320) | oklch(0.7 0.15 320) | `--wine-primary` | Color principal del tema vino |
| **Wine Secondary** | oklch(0.7 0.12 340) | oklch(0.6 0.12 340) | `--wine-secondary` | Elementos secundarios, fondos |
| **Wine Accent** | oklch(0.6 0.18 300) | oklch(0.65 0.18 300) | `--wine-accent` | CTAs, elementos destacados |
| **Wine Muted** | oklch(0.9 0.05 320) | oklch(0.25 0.05 320) | `--wine-muted` | Fondos sutiles, bordes |

#### Colores Funcionales shadcn/ui

| Token | Light Mode | Dark Mode | Uso |
|-------|------------|-----------|-----|
| `--background` | oklch(1 0 0) | oklch(0.145 0 0) | Fondo principal |
| `--foreground` | oklch(0.145 0 0) | oklch(0.985 0 0) | Texto principal |
| `--card` | oklch(1 0 0) | oklch(0.205 0 0) | Fondo de cards |
| `--primary` | oklch(0.205 0 0) | oklch(0.922 0 0) | Acciones primarias |
| `--muted` | oklch(0.97 0 0) | oklch(0.269 0 0) | Elementos secundarios |
| `--accent` | oklch(0.97 0 0) | oklch(0.269 0 0) | Acentos UI |
| `--destructive` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | Acciones destructivas |

#### Uso en Código con shadcn/ui

```tsx
// Extendiendo componentes shadcn/ui con colores de marca
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Botón con colores de vino
<Button 
  className={cn(
    "bg-wine-primary hover:bg-wine-accent",
    "text-white transition-colors"
  )}
>
  🍷 Descubrir Vinos
</Button>

// Badge con colores de marca
<Badge className="bg-gabi-yellow text-gabi-dark-green">
  Nuevo
</Badge>

// Variables CSS para componentes custom
<div 
  style={{
    backgroundColor: 'var(--wine-primary)',
    color: 'var(--gabi-yellow)'
  }}
>
  Contenido estilizado
</div>
```

### 3.2 Tipografía

#### Familias Tipográficas Oficiales

| Familia | Peso | Estilo | Google Fonts | Uso |
|---------|------|--------|--------------|-----|
| **Space Mono** | 700 | Italic | `Space+Mono:ital,wght@1,700` | Logotipo exclusivamente |
| **Jost** | 400, 500, 700 | Normal | `Jost:wght@400;500;700` | UI, headings, navegación |
| **Noto Serif** | 700 | Bold Italic | `Noto+Serif:ital,wght@1,700` | Destacados, quotes |
| **Noto Serif TC** | 500 | Medium | `Noto+Serif+TC:wght@500` | Contenido editorial largo |

#### Configuración en Next.js

```tsx
// src/app/layout.tsx
import { Jost, Noto_Serif, Space_Mono } from 'next/font/google'

const jost = Jost({ 
  subsets: ['latin'],
  variable: '--font-jost',
  weight: ['400', '500', '700']
})

const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
  variable: '--font-noto-serif',
  weight: ['700'],
  style: ['italic']
})

const spaceMono = Space_Mono({ 
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['700'],
  style: ['italic']
})
```

#### Escala Tipográfica

| Nivel | Tamaño | Line Height | Tailwind Class | Uso |
|-------|--------|-------------|----------------|-----|
| **Display** | 72px | 1 | `text-7xl` | Hero titles |
| **H1** | 48px | 1.2 | `text-5xl` | Page titles |
| **H2** | 36px | 1.25 | `text-4xl` | Section headers |
| **H3** | 30px | 1.3 | `text-3xl` | Subsections |
| **H4** | 24px | 1.4 | `text-2xl` | Card titles |
| **H5** | 20px | 1.5 | `text-xl` | Subtitles |
| **Body** | 16px | 1.6 | `text-base` | Contenido principal |
| **Small** | 14px | 1.5 | `text-sm` | Captions, labels |
| **Tiny** | 12px | 1.5 | `text-xs` | Metadata, badges |

#### Uso en Componentes

```tsx
// Heading con tipografía de marca
<h1 className="font-jost text-5xl font-bold text-wine-primary">
  Descubre el Vino Uruguayo
</h1>

// Quote destacado
<blockquote className="font-noto-serif italic text-xl text-wine-secondary">
  "El vino es poesía embotellada"
</blockquote>

// Contenido editorial
<article className="font-noto-serif-tc text-base leading-relaxed">
  {content}
</article>
```

### 3.3 Espaciado

#### Sistema de Espaciado Base 8px

| Token | Valor | Rem | Tailwind | Uso |
|-------|-------|-----|----------|-----|
| `space-0` | 0px | 0 | `p-0` | Sin espacio |
| `space-1` | 4px | 0.25rem | `p-1` | Espacios mínimos |
| `space-2` | 8px | 0.5rem | `p-2` | Padding interno pequeño |
| `space-3` | 12px | 0.75rem | `p-3` | Gaps en elementos inline |
| `space-4` | 16px | 1rem | `p-4` | Padding estándar |
| `space-5` | 20px | 1.25rem | `p-5` | Separación media |
| `space-6` | 24px | 1.5rem | `p-6` | Padding cards |
| `space-8` | 32px | 2rem | `p-8` | Separación secciones |
| `space-10` | 40px | 2.5rem | `p-10` | Espaciado grande |
| `space-12` | 48px | 3rem | `p-12` | Hero padding |
| `space-16` | 64px | 4rem | `p-16` | Separación mayor |
| `space-20` | 80px | 5rem | `p-20` | Espaciado XL |
| `space-24` | 96px | 6rem | `p-24` | Separación máxima |

#### Patrones de Espaciado

```tsx
// Card con espaciado consistente
<Card className="p-6 space-y-4">
  <CardHeader className="pb-3">
    <CardTitle className="text-2xl">Título</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2">
    {/* Contenido con separación vertical */}
  </CardContent>
</Card>

// Grid con gaps
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Items del grid */}
</div>

// Sección con márgenes
<section className="py-16 px-4 md:px-8">
  {/* Contenido de sección */}
</section>
```

### 3.4 Efectos

#### Sombras

| Token | Valor | Tailwind | Uso |
|-------|-------|----------|-----|
| `shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `shadow-xs` | Elevación mínima |
| `shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | `shadow-sm` | Cards sutiles |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | `shadow-md` | Cards estándar |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | `shadow-lg` | Dropdowns, modals |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | `shadow-xl` | Elementos flotantes |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | `shadow-2xl` | Hero cards |

#### Border Radius

| Token | Valor | Tailwind | Uso |
|-------|-------|----------|-----|
| `radius-none` | 0 | `rounded-none` | Sin bordes redondeados |
| `radius-sm` | 0.125rem | `rounded-sm` | Bordes sutiles |
| `radius-md` | 0.375rem | `rounded-md` | Botones, inputs |
| `radius-lg` | 0.5rem | `rounded-lg` | Cards |
| `radius-xl` | 0.75rem | `rounded-xl` | Contenedores grandes |
| `radius-2xl` | 1rem | `rounded-2xl` | Modales |
| `radius-full` | 9999px | `rounded-full` | Avatares, badges |

#### Gradientes de Marca

```css
/* Gradiente principal morado-rosa */
.gradient-wine-primary {
  background: linear-gradient(
    135deg,
    var(--wine-primary) 0%,
    var(--wine-secondary) 100%
  );
}

/* Gradiente accent */
.gradient-wine-accent {
  background: linear-gradient(
    135deg,
    var(--wine-accent) 0%,
    var(--wine-primary) 100%
  );
}

/* Gradiente marca Gabi */
.gradient-gabi-brand {
  background: linear-gradient(
    90deg,
    var(--gabi-yellow) 0%,
    var(--gabi-orange) 50%,
    var(--gabi-blue) 100%
  );
}
```

#### Transiciones

```tsx
// Transición estándar
<Button className="transition-colors duration-200">
  Hover me
</Button>

// Transición completa
<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
  Card interactiva
</Card>

// Animaciones con tw-animate
<div className="animate-in fade-in duration-500">
  Contenido animado
</div>
```

## 4. Componentes

### 4.1 Componentes Base shadcn/ui (21 Instalados)

#### Componentes de Formulario

| Componente | Archivo | Variantes | Uso Principal |
|------------|---------|-----------|---------------|
| **Button** | `button.tsx` | default, destructive, outline, secondary, ghost, link | Acciones e interacciones |
| **Input** | `input.tsx` | - | Campos de texto |
| **Label** | `label.tsx` | - | Etiquetas de formularios |
| **Select** | `select.tsx` | - | Dropdowns de selección |
| **Textarea** | `textarea.tsx` | - | Texto multilínea |

#### Componentes de Display

| Componente | Archivo | Características | Uso Principal |
|------------|---------|-----------------|---------------|
| **Avatar** | `avatar.tsx` | Imagen con fallback | Fotos de perfil |
| **Badge** | `badge.tsx` | default, secondary, destructive, outline | Tags, estados |
| **Card** | `card.tsx` | Header, Content, Footer | Contenedores de contenido |
| **Table** | `table.tsx` | Header, Body, Row, Cell | Datos tabulares |
| **Separator** | `separator.tsx` | horizontal, vertical | Divisores visuales |
| **Skeleton** | `skeleton.tsx` | - | Loading states |

#### Componentes de Navegación

| Componente | Archivo | Características | Uso Principal |
|------------|---------|-----------------|---------------|
| **Navigation Menu** | `navigation-menu.tsx` | Trigger, Content, Link | Menú principal |
| **Command** | `command.tsx` | Search, List, Item | Búsqueda y comandos |
| **Sidebar** | `sidebar.tsx` | Collapsible, Items, Footer | Panel lateral admin |

#### Componentes de Feedback

| Componente | Archivo | Características | Uso Principal |
|------------|---------|-----------------|---------------|
| **Dialog** | `dialog.tsx` | Trigger, Content, Actions | Modales |
| **Dropdown Menu** | `dropdown-menu.tsx` | Trigger, Items, Separator | Menús contextuales |
| **Popover** | `popover.tsx` | Trigger, Content | Tooltips complejos |
| **Sheet** | `sheet.tsx` | Side panel | Paneles laterales |
| **Tooltip** | `tooltip.tsx` | Trigger, Content | Ayuda contextual |
| **Sonner** | `sonner.tsx` | success, error, info | Notificaciones toast |

#### Componente Especial

| Componente | Archivo | Características | Uso Principal |
|------------|---------|-----------------|---------------|
| **Image Upload** | `image-upload.tsx` | Drag & drop, preview | Carga de imágenes |

### 4.2 Componentes de Blog (Extensiones shadcn/ui)

#### PostCard (Basado en Card de shadcn/ui)

```tsx
// Uso del componente PostCard
import { PostCard } from "@/components/blog/post-card"

// Variante destacada
<PostCard 
  post={featuredPost} 
  variant="featured"
  className="gradient-wine-primary text-white"
/>

// Variante compacta
<PostCard 
  post={post} 
  variant="compact"
/>

// Implementación base
interface PostCardProps {
  post: Post
  variant?: "default" | "featured" | "compact"
  showAuthor?: boolean
  showReadTime?: boolean
}
```

#### CategoryBadge (Extensión de Badge)

```tsx
// Uso con colores predefinidos por categoría
<CategoryBadge 
  category="vinos" 
  className="bg-wine-primary"
/>

// Múltiples categorías
<div className="flex gap-2">
  <CategoryBadge category="tintos" />
  <CategoryBadge category="blancos" />
  <CategoryBadge category="rosados" />
</div>
```

#### TagCloud (Composición con Badge)

```tsx
// Nube de tags con tamaños variables
<TagCloud 
  tags={popularTags} 
  variant="cloud"
  maxDisplay={20}
/>

// Lista vertical de tags
<TagCloud 
  tags={allTags} 
  variant="list"
  showCount
/>
```

### 4.3 Componentes Especiales de Marca

#### GabiSignature

```tsx
// Firma de Gabi Zimmer
<GabiSignature 
  size="lg"
  showIcon
  className="text-wine-primary"
/>

// Variantes disponibles
type GabiSignatureProps = {
  size?: "sm" | "md" | "lg" | "xl"
  style?: "script" | "elegant" | "minimal"
  showIcon?: boolean
}
```

#### WineRating

```tsx
// Sistema de rating para vinos
<WineRating 
  rating={4.5} 
  maxRating={5}
  size="md"
  color="var(--gabi-yellow)"
/>
```

#### TastingNotes

```tsx
// Notas de cata estructuradas
<TastingNotes
  wine={wine}
  notes={{
    visual: "Color rubí intenso con reflejos violáceos",
    aroma: "Frutas rojas maduras, especias, vainilla",
    taste: "Taninos suaves, acidez equilibrada",
    pairing: "Carnes rojas, quesos maduros"
  }}
/>
```

## 5. Patrones de Diseño

### 5.1 Layouts Responsive

#### Grid System

```tsx
// Grid responsive con breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {posts.map(post => (
    <PostCard key={post.id} post={post} />
  ))}
</div>

// Layout de blog con sidebar
<div className="flex flex-col lg:flex-row gap-8">
  <main className="flex-1 min-w-0">
    {/* Contenido principal */}
  </main>
  <aside className="w-full lg:w-80 space-y-6">
    {/* Sidebar */}
  </aside>
</div>
```

#### Container Pattern

```tsx
// Container con máximo ancho y padding responsive
<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
  {/* Contenido */}
</div>

// Sección con padding vertical consistente
<section className="py-12 md:py-16 lg:py-20">
  <div className="container">
    {/* Contenido de sección */}
  </div>
</section>
```

### 5.2 Estados de Loading

#### Skeleton Patterns

```tsx
// Loading de PostCard
function PostCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <CardContent className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

// Loading de lista completa
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {Array.from({ length: 6 }).map((_, i) => (
    <PostCardSkeleton key={i} />
  ))}
</div>
```

### 5.3 Feedback al Usuario

#### Toast Notifications

```tsx
// Éxito
toast.success("🍷 Post publicado exitosamente", {
  description: "Tu artículo ya está disponible para los lectores"
})

// Error
toast.error("Error al guardar", {
  description: "Por favor, intenta nuevamente"
})

// Loading con promesa
toast.promise(savePost(), {
  loading: "Guardando post...",
  success: "Post guardado",
  error: "Error al guardar"
})
```

#### Estados de Formulario

```tsx
// Validación en tiempo real
<Input
  {...register("email")}
  aria-invalid={!!errors.email}
  className={cn(
    errors.email && "border-destructive focus:ring-destructive"
  )}
/>
{errors.email && (
  <p className="text-sm text-destructive mt-1">
    {errors.email.message}
  </p>
)}
```

### 5.4 Micro-interacciones

#### Hover Effects

```tsx
// Card con elevación en hover
<Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
  {/* Contenido */}
</Card>

// Botón con cambio de color
<Button className="bg-wine-primary hover:bg-wine-accent transition-colors duration-200">
  Explorar
</Button>

// Link con underline animado
<a className="text-wine-primary hover:text-wine-accent transition-colors relative group">
  Leer más
  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-wine-accent transition-all duration-200 group-hover:w-full" />
</a>
```

## 6. Recursos Visuales

### 6.1 Logotipos

#### Variantes Disponibles

| Archivo | Descripción | Uso Recomendado |
|---------|-------------|-----------------|
| `GZ_Logotipo-firma.png` | Firma personal | Footer, about page |
| `GZ_LogotipoVI_amarillo.png` | Logo amarillo | Fondos oscuros |
| `GZ_LogotipoVI_azul.png` | Logo azul | Fondos claros |
| `GZ_LogotipoVI_naranja.png` | Logo naranja | Acentos especiales |
| `GZ_LogotipoVI_verdeclaro.png` | Logo verde claro | Fondos medios |
| `GZ_LogotipoVI_verdeoscuro.png` | Logo verde oscuro | Fondos claros |
| `GZ_LogotipoVII-[color].png` | Variante alternativa | Aplicaciones especiales |

#### Uso en Código

```tsx
// Logo principal en header
<Image
  src="/docs/resources/Logotipos/GZ_LogotipoVI_amarillo.png"
  alt="Gabi Zimmer"
  width={180}
  height={60}
  className="h-12 w-auto"
/>

// Logo responsive con dark mode
<picture>
  <source
    media="(prefers-color-scheme: dark)"
    srcSet="/docs/resources/Logotipos/GZ_LogotipoVI_amarillo.png"
  />
  <source
    media="(prefers-color-scheme: light)"
    srcSet="/docs/resources/Logotipos/GZ_LogotipoVI_verdeoscuro.png"
  />
  <img src="/docs/resources/Logotipos/GZ_LogotipoVI_verdeoscuro.png" alt="Gabi Zimmer" />
</picture>
```

### 6.2 Iconografía Temática

#### Iconos Disponibles (30+)

| Icono | Archivo | Concepto | Uso Sugerido |
|-------|---------|----------|--------------|
| 🍇 | `GZ_Iconos-01_Viñedo.png` | Viñedo | Categoría viñedos |
| 🍷 | `GZ_Iconos-02_Vinos.png` | Vinos | Categoría general vinos |
| 🍾 | `GZ_Iconos-03_Tannat.png` | Tannat | Variedad específica |
| 👤 | `GZ_Iconos-04_Gabi.png` | Gabi | Perfil, about |
| 💡 | `GZ_Iconos-05_Tips.png` | Tips | Consejos, recomendaciones |
| 📚 | `GZ_Iconos-06_Libro.png` | Libro | Recursos, biblioteca |
| 🎙️ | `GZ_Iconos-07_Podcasts.png` | Podcasts | Contenido audio |
| 💬 | `GZ_Iconos-08_Testimonios.png` | Testimonios | Reviews, opiniones |
| 🇺🇾 | `GZ_Iconos-09_Uruguay.png` | Uruguay | Contenido nacional |
| 🏆 | `GZ_Iconos-10_Jurado.png` | Jurado | Premios, competencias |
| ✈️ | `GZ_Iconos-11_Viajes.png` | Viajes | Enoturismo |
| 📢 | `GZ_Iconos-12_MarketingComunicacion.png` | Marketing | Comunicación |
| 📊 | `GZ_Iconos-13_Informes.png` | Informes | Analytics, reportes |

#### Implementación con Iconos

```tsx
// Uso de iconos temáticos
<div className="flex items-center gap-2">
  <Image 
    src="/docs/resources/Iconos/GZ_Iconos-02_Vinos.png"
    alt="Vinos"
    width={24}
    height={24}
  />
  <span>Categoría Vinos</span>
</div>

// Iconos con Lucide (complementario)
import { Wine, Grape, MapPin, Calendar } from "lucide-react"

<div className="flex gap-4">
  <Wine className="w-5 h-5 text-wine-primary" />
  <Grape className="w-5 h-5 text-gabi-green" />
</div>
```

### 6.3 Guías de Uso de Marca

#### Área de Resguardo

```css
/* Espaciado mínimo alrededor del logo */
.logo-container {
  padding: calc(var(--logo-height) * 0.25);
  /* El área de resguardo es 25% del alto del logo */
}
```

#### Tamaños Mínimos

- **Digital**: Mínimo 120px de ancho
- **Mobile**: Mínimo 100px de ancho
- **Favicon**: 32x32px versión simplificada

#### Usos Incorrectos a Evitar

- ❌ No distorsionar las proporciones
- ❌ No cambiar los colores oficiales
- ❌ No agregar efectos o sombras
- ❌ No usar sobre fondos que comprometan legibilidad
- ❌ No combinar variantes de color en una misma aplicación

## 7. Guías de Implementación

### 7.1 Cómo Extender Componentes shadcn/ui

#### Patrón Base de Extensión

```tsx
// 1. Importar componente base de shadcn/ui
import { Button as BaseButton, buttonVariants } from "@/components/ui/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 2. Crear variantes adicionales para vinos
const wineButtonVariants = cva(
  "", // No override base styles
  {
    variants: {
      wineType: {
        tinto: "bg-red-700 hover:bg-red-800 text-white",
        blanco: "bg-amber-100 hover:bg-amber-200 text-amber-900",
        rosado: "bg-pink-200 hover:bg-pink-300 text-pink-900",
        espumoso: "bg-blue-100 hover:bg-blue-200 text-blue-900"
      }
    }
  }
)

// 3. Componente extendido
interface WineButtonProps 
  extends React.ComponentProps<typeof BaseButton>,
    VariantProps<typeof wineButtonVariants> {}

export function WineButton({ 
  className, 
  wineType, 
  ...props 
}: WineButtonProps) {
  return (
    <BaseButton
      className={cn(
        wineButtonVariants({ wineType }),
        className
      )}
      {...props}
    />
  )
}
```

### 7.2 Uso de Class Variance Authority (CVA)

#### Configuración de Variantes Complejas

```tsx
const componentVariants = cva(
  // Base styles (siempre aplicados)
  "rounded-lg border transition-all duration-200",
  {
    // Variantes
    variants: {
      intent: {
        primary: "bg-wine-primary text-white",
        secondary: "bg-wine-secondary text-wine-primary"
      },
      size: {
        sm: "text-sm py-1 px-2",
        md: "text-base py-2 px-4",
        lg: "text-lg py-3 px-6"
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto"
      }
    },
    // Compound variants (combinaciones específicas)
    compoundVariants: [
      {
        intent: "primary",
        size: "lg",
        className: "font-bold uppercase tracking-wider"
      }
    ],
    // Valores por defecto
    defaultVariants: {
      intent: "primary",
      size: "md",
      fullWidth: false
    }
  }
)
```

### 7.3 Integración con Next.js 15 y RSC

#### Server Components

```tsx
// app/blog/page.tsx - Server Component
import { PostCard } from "@/components/blog/post-card"
import { getPosts } from "@/services/blog-service"

export default async function BlogPage() {
  const posts = await getPosts() // Fetch en servidor
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

#### Client Components

```tsx
// components/blog/like-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false)
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLiked(!liked)}
      className={cn(
        "gap-1",
        liked && "text-red-500"
      )}
    >
      <Heart className={cn("w-4 h-4", liked && "fill-current")} />
      Like
    </Button>
  )
}
```

### 7.4 Dark Mode con shadcn/ui

#### Implementación del Theme Toggle

```tsx
// components/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

#### Variables CSS para Dark Mode

```css
/* globals.css */
:root {
  --wine-primary: oklch(0.5 0.15 320);
  --wine-text: oklch(0.15 0 0);
}

.dark {
  --wine-primary: oklch(0.7 0.15 320);
  --wine-text: oklch(0.9 0 0);
}

/* Uso en componentes */
.wine-card {
  background-color: var(--wine-primary);
  color: var(--wine-text);
}
```

### 7.5 Accesibilidad (WCAG AA)

#### Checklist de Accesibilidad

```tsx
// ✅ Contraste de color adecuado
<Button className="bg-wine-primary text-white">
  {/* Contraste 4.5:1 mínimo */}
</Button>

// ✅ Navegación por teclado
<Card 
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>

// ✅ ARIA labels descriptivos
<Button aria-label="Agregar vino tinto al carrito">
  <Wine className="w-4 h-4" />
</Button>

// ✅ Estados focus visibles
<Input 
  className="focus:ring-2 focus:ring-wine-primary focus:ring-offset-2"
/>

// ✅ Textos alternativos
<Image 
  src="/wine.jpg" 
  alt="Botella de vino Tannat 2020 de Bodega Garzón"
/>

// ✅ Estructura semántica
<article>
  <header>
    <h1>Título del Post</h1>
    <time dateTime="2024-01-15">15 de enero, 2024</time>
  </header>
  <main>{content}</main>
  <footer>{author}</footer>
</article>
```

### 7.6 Performance Best Practices

#### Optimización de Componentes

```tsx
// Lazy loading de componentes pesados
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(
  () => import('@/components/blog/rich-text-editor'),
  { 
    loading: () => <Skeleton className="h-96" />,
    ssr: false 
  }
)

// Memoización de componentes
import { memo } from 'react'

export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Renderizado costoso
  return <div>{/* ... */}</div>
})

// Optimización de imágenes
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // Para imágenes above the fold
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

## 8. Herramientas y Ecosistema

### 8.1 Stack Principal

#### shadcn/ui v4
- **Versión**: Última (v4)
- **Estilo**: new-york
- **Componentes**: 21 instalados
- **Documentación**: [ui.shadcn.com](https://ui.shadcn.com)

```bash
# Agregar nuevos componentes
npx shadcn@latest add [component-name]

# Ejemplo
npx shadcn@latest add calendar
```

#### Tailwind CSS v4
- **Configuración**: Zero-config
- **PostCSS**: @tailwindcss/postcss
- **IntelliSense**: Extensión VSCode recomendada

```json
// .vscode/settings.json
{
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### Lucide Icons
- **Instalado**: Como parte de shadcn/ui
- **Uso**: Iconografía consistente
- **Tamaño**: Tree-shakeable

```tsx
import { Wine, Grape, Star, Heart } from "lucide-react"

// Uso consistente
<Wine className="w-5 h-5" />
```

### 8.2 Herramientas de Desarrollo

#### Class Variance Authority (CVA)
```bash
# Ya instalado con shadcn/ui
# Para uso directo
import { cva } from "class-variance-authority"
```

#### cn() Utility
```tsx
// lib/utils.ts (ya incluido)
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### Radix UI Primitives
- **Incluido en**: shadcn/ui
- **Propósito**: Componentes accesibles sin estilo
- **Beneficio**: Comportamiento robusto

### 8.3 Herramientas de Validación

#### TypeScript
```json
// tsconfig.json - configuración estricta
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

#### ESLint
```bash
# Validación de código
pnpm run lint
```

#### Build Validation
```bash
# Verificar que todo compila
pnpm run typecheck
pnpm run build
```

### 8.4 Recursos de Aprendizaje

#### Documentación Oficial
- [Next.js 15 Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [CVA Documentation](https://cva.style/docs)

#### Ejemplos y Templates
- [shadcn/ui Examples](https://ui.shadcn.com/examples)
- [Tailwind UI Patterns](https://tailwindui.com/components)
- [Next.js Templates](https://vercel.com/templates/next.js)

#### Comunidad
- [shadcn Discord](https://discord.gg/shadcn)
- [Next.js Discord](https://discord.gg/nextjs)
- [Tailwind CSS Discord](https://discord.gg/tailwindcss)

### 8.5 Workflow de Desarrollo

#### 1. Desarrollo Local
```bash
# Iniciar desarrollo
pnpm dev

# Ver en navegador
open http://localhost:3000
```

#### 2. Agregar Componentes
```bash
# Buscar componente en shadcn/ui
npx shadcn@latest add [component]

# Extender con variantes de marca
# Crear archivo en components/wine/
```

#### 3. Validación
```bash
# Lint
pnpm run lint

# Type check
pnpm run typecheck

# Build test
pnpm run build
```

#### 4. Documentación
- Actualizar este documento con nuevos componentes
- Agregar ejemplos de uso
- Documentar decisiones de diseño

## 9. Anexos

### 9.1 Tabla de Conversión de Colores

| Nombre | HEX | RGB | HSL | OKLCH |
|--------|-----|-----|-----|-------|
| Amarillo GZ | #EAE559 | rgb(234, 229, 89) | hsl(58, 78%, 63%) | oklch(0.89 0.16 104) |
| Azul GZ | #0170BB | rgb(1, 112, 187) | hsl(204, 99%, 37%) | oklch(0.51 0.14 242) |
| Naranja GZ | #FF915E | rgb(255, 145, 94) | hsl(19, 100%, 68%) | oklch(0.72 0.15 43) |
| Verde Oscuro | #35472A | rgb(53, 71, 42) | hsl(97, 26%, 22%) | oklch(0.35 0.08 130) |
| Verde Claro | #E7F0BC | rgb(231, 240, 188) | hsl(70, 63%, 84%) | oklch(0.93 0.09 110) |

### 9.2 Snippets Útiles

#### Componente Base Template
```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

const componentVariants = cva(
  "base-styles",
  {
    variants: {
      variant: {
        default: "default-styles"
      },
      size: {
        default: "default-size"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

interface ComponentProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Component.displayName = "Component"

export { Component }
```

### 9.3 Comandos Rápidos

```bash
# Desarrollo
pnpm dev                      # Iniciar servidor de desarrollo
pnpm build                    # Build de producción
pnpm start                    # Iniciar servidor de producción

# Validación
pnpm run lint                 # ESLint
pnpm run typecheck           # TypeScript check

# Base de datos
pnpm prisma db push          # Sincronizar schema
pnpm prisma studio           # Ver datos

# Componentes
npx shadcn@latest add [name]  # Agregar componente shadcn/ui
npx shadcn@latest diff [name] # Ver cambios en componente

# Git
git status                    # Estado actual
git add -A                    # Agregar todos los cambios
git commit -m "mensaje"       # Commit
```

### 9.4 Troubleshooting Común

#### Problema: Colores no se aplican
```tsx
// ❌ Incorrecto - Tailwind no puede detectar clases dinámicas
<div className={`bg-${color}-500`}>

// ✅ Correcto - Clases completas
<div className={color === 'wine' ? 'bg-wine-500' : 'bg-gray-500'}>

// ✅ O usar style para valores dinámicos
<div style={{ backgroundColor: `var(--${color})` }}>
```

#### Problema: Dark mode no funciona
```tsx
// Verificar ThemeProvider en layout.tsx
import { ThemeProvider } from "next-themes"

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

#### Problema: CVA types no funcionan
```tsx
// Asegurar importación correcta
import { cva, type VariantProps } from "class-variance-authority"

// Exportar types del componente
export type ButtonProps = VariantProps<typeof buttonVariants>
```

## 10. Conclusión

Este sistema de diseño proporciona una base sólida y escalable para el blog de Gabi Zimmer, combinando:

- ✅ **Identidad Visual Única**: Colores y tipografías que reflejan la marca
- ✅ **Componentes Robustos**: Basados en shadcn/ui v4 con extensiones personalizadas
- ✅ **Developer Experience**: TypeScript, IntelliSense, hot reload
- ✅ **Accesibilidad**: WCAG AA compliance en todos los componentes
- ✅ **Performance**: Optimizado para Next.js 15 y React Server Components
- ✅ **Escalabilidad**: Arquitectura preparada para crecimiento futuro
- ✅ **Documentación Completa**: Guías claras y ejemplos prácticos

### Mantenimiento

Este documento debe actualizarse cuando:
- Se agreguen nuevos componentes shadcn/ui
- Se creen extensiones de componentes para el blog
- Se modifiquen los design tokens
- Se actualicen las dependencias principales
- Se descubran nuevos patrones o mejores prácticas

### Contacto

Para consultas sobre este sistema de diseño o sugerencias de mejora, el código está disponible en el repositorio del proyecto.

---

**Sistema de Diseño v1.0.0**  
**Última actualización**: Agosto 2025  
**Compatible con**: Next.js 15, shadcn/ui v4, Tailwind CSS v4

🍷 *Desarrollado con pasión por el vino y el buen código*