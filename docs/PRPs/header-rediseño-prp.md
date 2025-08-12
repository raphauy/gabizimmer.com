# PRP: Rediseño del Header del Blog

## Goal
Crear un header mejorado que reemplace el componente `blog-navigation.tsx` actual, integrando el logo oficial de Gabi Zimmer (en lugar del icono Wine actual), manteniendo toda la funcionalidad existente (navegación, theme toggle, categorías dropdown, responsive design) mientras se mejora significativamente la identidad visual y se elimina el botón de Instagram según especificaciones.

## Why
- **Identidad de marca fuerte**: El sitio actual usa solo un icono genérico de vino, perdiendo la oportunidad de establecer la marca personal de Gabi Zimmer
- **Profesionalización visual**: Los logos oficiales disponibles proporcionan una imagen más profesional y distintiva
- **Coherencia de branding**: Alinear el header con la identidad visual establecida en los materiales gráficos
- **Mejora UX**: Un header más atractivo visualmente mejora la primera impresión y navegabilidad del blog
- **Optimización de espacio**: Eliminar el botón Instagram permite más espacio para elementos esenciales

## What
Un header rediseñado que:
- **Integra el logo oficial** `GZ_LogotipoVI_verdeoscuro.png` como elemento principal de branding
- **Mantiene toda la funcionalidad actual**: navegación sticky, backdrop-blur, theme toggle, categorías dropdown, responsive design, active states
- **Elimina el botón Instagram** como solicitado
- **Mejora la presentación visual** manteniendo el estilo minimal existente
- **Funciona perfectamente en ambos temas** (light/dark) y todos los dispositivos
- **Conserva la navegación por categorías** con el mismo dropdown moderno actual

### Success Criteria
- [ ] Logo oficial de Gabi Zimmer integrado correctamente en el header
- [ ] Todas las funcionalidades actuales del `BlogNavigation` mantenidas (sticky, backdrop-blur, theme toggle, navigation menu, responsive design)
- [ ] Dropdown de categorías funciona exactamente igual que antes
- [ ] Botón de Instagram eliminado completamente
- [ ] Header funciona perfectamente en light/dark mode
- [ ] Responsive design mantiene usabilidad en móviles
- [ ] Active states y navegación funcionan sin cambios
- [ ] Build del proyecto exitoso sin errores TypeScript/lint

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /home/raphael/desarrollo/gabizimmer.com/src/components/blog/blog-navigation.tsx
  why: CRÍTICO - Componente actual a rediseñar, mantener toda su funcionalidad
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/app/globals.css
  why: CRÍTICO - Variables de tema wine-* personalizadas y sistema de dark mode
  
- file: /home/raphael/desarrollo/gabizimmer.com/docs/resources/Logotipos/GZ_LogotipoVI_verdeoscuro.png
  why: CRÍTICO - Logo principal a integrar en el header
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/components/theme-toggle.tsx
  why: IMPORTANTE - Componente de theme toggle que debe mantenerse funcional
  
- file: /home/raphael/desarrollo/gabizimmer.com/src/components/ui/navigation-menu.tsx
  why: IMPORTANTE - Componente shadcn/ui base del dropdown de categorías
  
- file: /home/raphael/desarrollo/gabizimmer.com/CLAUDE.md
  why: IMPORTANTE - Contexto del proyecto, stack tecnológico y convenciones
```

### Current Codebase Tree
```bash
src/
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── navigation-menu.tsx # NavigationMenu component usado
│   │   ├── button.tsx          # Button component
│   │   └── ...
│   ├── blog/
│   │   └── blog-navigation.tsx # COMPONENTE A REDISEÑAR
│   └── theme-toggle.tsx        # ThemeToggle component
├── app/
│   ├── globals.css            # Variables de tema wine-* y dark mode
│   └── blog/
│       └── layout.tsx         # Usa BlogNavigation
└── lib/
    └── utils.ts              # cn() utility function
```

### Desired Codebase Tree
```bash
# Estructura después de implementación
src/components/blog/
├── blog-navigation.tsx         # REDISEÑADO con logo oficial
└── blog-logo.tsx              # NUEVO - Componente logo separado

public/
└── logos/                     # NUEVO - Directorio para assets del logo
    └── gabi-zimmer-logo.png   # Logo optimizado para web
```

### Known Gotchas & Patterns
```typescript
// PATTERN: Componente actual usa "use client" al inicio
"use client"

// PATTERN: Estructura del componente actual a mantener
<nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      {/* Logo - AQUÍ CAMBIAR */}
      {/* Navigation Menu - MANTENER IGUAL */}
      {/* Actions - MANTENER pero SIN Instagram */}

// PATTERN: Logo actual (A REEMPLAZAR)
<Link href="/" className="flex items-center gap-3 font-bold text-xl">
  <Wine className="h-8 w-8 text-wine-accent" />
  <span className="hidden sm:block">Gabi Zimmer</span>
</Link>

// PATTERN: Theme toggle y mobile search (MANTENER)
<div className="flex items-center gap-2">
  <Button variant="ghost" size="sm" asChild className="md:hidden">
    <Link href="/blog/search">
      <Search className="h-4 w-4" />
    </Link>
  </Button>
  <ThemeToggle />
  {/* ELIMINAR: Button Instagram */}
</div>

// GOTCHA: NavigationMenu usa patrones específicos de shadcn/ui
<NavigationMenuTrigger>
  <Grape className="h-4 w-4 mr-2" />
  Categorías
</NavigationMenuTrigger>

// GOTCHA: Active states usan pathname checking
const isActive = (path: string) => {
  return pathname.startsWith(path)
}

// GOTCHA: Responsive design patterns establecidos
className="hidden md:flex"  // Desktop only
className="md:hidden"       // Mobile only
className="hidden sm:block" // Text visible on small+

// PATTERN: Variables CSS wine-* ya disponibles
text-wine-accent    // Para elementos de acento
from-wine-accent/20 to-wine-secondary/20 // Para gradientes

// GOTCHA: Logo debe ser optimizado para web
// - Tamaño apropiado (altura ~32px para h-8)
// - Formato web-optimized
// - Responsive behavior

// PATTERN: Componente separado para logo reutilizable
interface BlogLogoProps {
  className?: string
  showText?: boolean
}

export function BlogLogo({ className, showText = true }: BlogLogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <img 
        src="/logos/gabi-zimmer-logo.png"
        alt="Gabi Zimmer"
        className="h-8 w-auto"
      />
      {showText && (
        <span className="font-bold text-xl hidden sm:block">Gabi Zimmer</span>
      )}
    </Link>
  )
}
```

## Implementation Blueprint

### Assets Preparation
```yaml
# Logo Asset Management
SOURCE: /home/raphael/desarrollo/gabizimmer.com/docs/resources/Logotipos/GZ_LogotipoVI_verdeoscuro.png
DESTINATION: /home/raphael/desarrollo/gabizimmer.com/public/logos/gabi-zimmer-logo.png
OPTIMIZATION: 
  - Resize apropiado para header (altura ~32-40px)
  - Formato PNG optimizado
  - Calidad alta pero peso web-friendly
```

### Component Structure
```typescript
// src/components/blog/blog-logo.tsx
interface BlogLogoProps {
  className?: string
  showText?: boolean
}

export function BlogLogo({ className, showText = true }: BlogLogoProps) {
  return (
    <Link 
      href="/" 
      className={cn("flex items-center gap-3 font-bold text-xl", className)}
    >
      <img 
        src="/logos/gabi-zimmer-logo.png"
        alt="Gabi Zimmer"
        className="h-8 w-auto dark:brightness-110"
        loading="eager"
      />
      {showText && (
        <span className="hidden sm:block">Gabi Zimmer</span>
      )}
    </Link>
  )
}

// src/components/blog/blog-navigation.tsx - MODIFICADO
import { BlogLogo } from './blog-logo'

// Reemplazar la sección Logo actual:
// OLD:
<Link href="/" className="flex items-center gap-3 font-bold text-xl">
  <Wine className="h-8 w-8 text-wine-accent" />
  <span className="hidden sm:block">Gabi Zimmer</span>
</Link>

// NEW:
<BlogLogo />
```

### Task List (Orden de Implementación)
```yaml
Task 1: Preparación de Assets
COPY docs/resources/Logotipos/GZ_LogotipoVI_verdeoscuro.png:
  - DESTINATION: public/logos/gabi-zimmer-logo.png
  - VERIFY: Logo es legible y apropiado para header
  - TEST: Acceso desde navegador en /logos/gabi-zimmer-logo.png

Task 2: Crear Componente BlogLogo
CREATE src/components/blog/blog-logo.tsx:
  - IMPLEMENT: Componente reutilizable con logo oficial
  - PROPS: className opcional, showText boolean
  - RESPONSIVE: Ocultar texto en pantallas pequeñas
  - ACCESSIBILITY: Alt text apropiado
  - DARK MODE: Considerar brightness ajuste si necesario

Task 3: Modificar BlogNavigation - Logo Section
MODIFY src/components/blog/blog-navigation.tsx:
  - IMPORT: BlogLogo component
  - REPLACE: Sección logo actual (Wine icon) con BlogLogo
  - MAINTAIN: Misma estructura y clases del contenedor
  - VERIFY: Link a "/" funciona igual

Task 4: Modificar BlogNavigation - Actions Section  
MODIFY src/components/blog/blog-navigation.tsx:
  - REMOVE: Button Instagram completamente
  - MAINTAIN: Mobile search button y ThemeToggle
  - VERIFY: Gap y spacing correcto sin Instagram button

Task 5: Optimización Visual
ADJUST src/components/blog/blog-navigation.tsx:
  - FINE-TUNE: Espaciado y alineación con nuevo logo
  - TEST: Responsive behavior en different screen sizes
  - VERIFY: Dark mode compatibility del logo
  - ENSURE: Active states y hover effects funcionan

Task 6: Testing y Validación
TEST en navegador:
  - VERIFY: Header visible en todas las páginas del blog
  - TEST: Sticky behavior mantenido
  - VERIFY: Theme toggle funciona correctamente
  - TEST: Categorías dropdown funciona igual
  - VERIFY: Mobile responsive design
  - TEST: Navigation active states
  - VERIFY: Logo loading performance

Task 7: Cleanup
VERIFY src/components/blog/blog-navigation.tsx:
  - REMOVE: Import de Wine icon (ya no usado)
  - CLEAN: Comentarios y código innecesario
  - FORMAT: Código limpio y bien estructurado
```

### Per-Task Pseudocode
```typescript
// Task 1: Asset Preparation
// COPY logo file to public directory
cp docs/resources/Logotipos/GZ_LogotipoVI_verdeoscuro.png public/logos/gabi-zimmer-logo.png

// Task 2: BlogLogo Component
// src/components/blog/blog-logo.tsx
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BlogLogoProps {
  className?: string
  showText?: boolean
}

export function BlogLogo({ className, showText = true }: BlogLogoProps) {
  return (
    <Link 
      href="/" 
      className={cn("flex items-center gap-3 font-bold text-xl", className)}
    >
      <img 
        src="/logos/gabi-zimmer-logo.png"
        alt="Gabi Zimmer"
        className="h-8 w-auto"
        loading="eager"
      />
      {showText && (
        <span className="hidden sm:block">Gabi Zimmer</span>
      )}
    </Link>
  )
}

// Task 3 & 4: BlogNavigation Modifications
// src/components/blog/blog-navigation.tsx

// ADD import:
import { BlogLogo } from './blog-logo'

// REMOVE import:
// Wine ya no se usa

// REPLACE logo section (líneas ~36-40):
// FROM:
<Link href="/" className="flex items-center gap-3 font-bold text-xl">
  <Wine className="h-8 w-8 text-wine-accent" />
  <span className="hidden sm:block">Gabi Zimmer</span>
</Link>

// TO:
<BlogLogo />

// REMOVE Instagram button (líneas ~133-143):
// DELETE completamente:
<Button variant="outline" size="sm" asChild className="hidden sm:flex">
  <a 
    href="https://instagram.com/gabizimmer__" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    <User className="h-4 w-4 mr-2" />
    Instagram
  </a>
</Button>

// MAINTAIN structure:
<div className="flex items-center gap-2">
  {/* Mobile search button */}
  <Button variant="ghost" size="sm" asChild className="md:hidden">
    <Link href="/blog/search">
      <Search className="h-4 w-4" />
    </Link>
  </Button>
  
  <ThemeToggle />
  
  {/* Instagram button REMOVED */}
</div>
```

### Integration Points
```yaml
LAYOUT INTEGRATION:
  - src/app/blog/layout.tsx ya usa BlogNavigation
  - No changes needed, funciona automáticamente

ROUTING INTEGRATION:
  - Logo link sigue dirigiendo a "/" (home)
  - Navegación interna mantiene isActive() logic

THEME INTEGRATION:
  - Logo debe funcionar en light/dark themes
  - Puede necesitar brightness adjustment para dark mode
  - Variables wine-* siguen disponibles para otros elementos

RESPONSIVE INTEGRATION:
  - Logo mantiene h-8 height para consistency
  - Text hiding en sm: breakpoint mantenido
  - Mobile navigation behavior sin cambios
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar PRIMERO - corregir errores antes de continuar
pnpm run lint          # ESLint - Expected: 0 errores
pnpm run typecheck     # TypeScript - Expected: 0 errores
```

### Level 2: Asset Loading
```bash
# Verificar logo accesible
curl -I http://localhost:3000/logos/gabi-zimmer-logo.png
# Expected: 200 OK response

# Test en navegador
open http://localhost:3000/logos/gabi-zimmer-logo.png
# Expected: Logo se muestra correctamente
```

### Level 3: Component Integration
```bash
# Dev server
pnpm run dev

# Test páginas principales
curl http://localhost:3000/blog
# Expected: HTML con nuevo logo en header

# Browser testing checklist:
# - Logo visible y clicable
# - Theme toggle funciona
# - Categorías dropdown funciona  
# - Mobile responsive
# - Instagram button eliminado
# - Active states en navegación
```

### Level 4: Cross-browser Testing
```bash
# Test múltiples breakpoints
# - Mobile (320px+)
# - Tablet (768px+) 
# - Desktop (1024px+)

# Test themes
# - Light mode: logo legible
# - Dark mode: logo legible (ajustar brightness si necesario)
# - System theme: funciona automáticamente
```

### Level 5: Production Build
```bash
pnpm run build
# Expected: Build exitoso sin warnings

pnpm run start
# Test en http://localhost:3000/blog
# Expected: Header funciona perfectamente en production
```

## Final Checklist

### Visual & Branding
- [ ] Logo oficial de Gabi Zimmer integrado correctamente
- [ ] Logo es legible en ambos themes (light/dark)
- [ ] Logo tiene tamaño apropiado (altura consistente con h-8)
- [ ] Tipografía "Gabi Zimmer" mantiene estilo actual
- [ ] Espaciado y alineación visuales correctos

### Funcionalidad Mantenida
- [ ] Header sticky funciona igual que antes
- [ ] Backdrop blur effect mantenido
- [ ] Theme toggle completamente funcional
- [ ] Navigation menu active states funcionan
- [ ] Categorías dropdown igual que antes (Vinos, Bodegas, Enoturismo)
- [ ] Mobile search button funcional
- [ ] Responsive design sin regresiones

### Cambios Solicitados
- [ ] Botón Instagram completamente eliminado
- [ ] Logo de vino (Wine icon) reemplazado por logo oficial
- [ ] Header mantiene estilo minimal
- [ ] No se agregaron elementos no solicitados

### Calidad Técnica
- [ ] Sin errores TypeScript o lint
- [ ] Build de producción exitoso
- [ ] Assets optimizados para web
- [ ] Componente BlogLogo reutilizable creado
- [ ] Código limpio y bien estructurado
- [ ] Performance del logo loading optimizada

## Anti-Patterns to Avoid

### Cambios NO Permitidos
- ❌ NO modificar el NavigationMenu dropdown de categorías
- ❌ NO cambiar la funcionalidad del theme toggle
- ❌ NO alterar el responsive behavior existente
- ❌ NO cambiar los active states de navegación
- ❌ NO modificar el sticky/backdrop-blur behavior
- ❌ NO agregar elementos no solicitados (como nuevo botón Instagram)

### Assets & Performance
- ❌ NO usar logos de muy alta resolución que impacten performance
- ❌ NO hardcodear rutas absolutas en lugar de usar Next.js image optimization (si es necesario)
- ❌ NO dejar logos de test o assets temporales en el build
- ❌ NO usar formatos de imagen inadecuados para web

### Estructura & Mantenibilidad  
- ❌ NO duplicar código del BlogNavigation
- ❌ NO crear componentes innecesarios si el cambio es simple
- ❌ NO romper la separación de responsabilidades existente
- ❌ NO hardcodear valores que deberían usar variables CSS existentes

## Score de Confianza: 9/10

**Justificación del Score Alto:**
- **Contexto Exhaustivo**: Se proporciona el componente actual completo, todas las variables CSS, logos disponibles y patrones establecidos
- **Cambios Bien Definidos**: Modificaciones específicas y limitadas (reemplazar logo, eliminar Instagram)
- **Funcionalidad Clara**: Se mantiene 95% del código existente, solo se cambian elementos específicos
- **Assets Disponibles**: Logo óptimo identificado y accesible
- **Validación Detallada**: Loops de testing completos y verificables
- **Patterns Establecidos**: Se siguen exactamente los patrones actuales del proyecto

**Único Punto de Riesgo (Score -1):** Posible ajuste menor de brightness del logo para dark mode que podría requerir refinamiento visual, pero es fácilmente solucionable.

**Resultado Esperado:** Header rediseñado funcional en primera implementación, con alta probabilidad de zero iterations necesarias.