# PRP: Rediseño Global de Header y Footer

## Goal
Crear un header y footer globales unificados para todo el sitio gabizimmer.com, eliminando la duplicación actual en `/blog/layout.tsx` y centralizando en `/app/layout.tsx`. El header debe incluir el logo oficial de Gabi Zimmer con soporte para dark/light mode, navegación simple (Inicio/Blog) y un toggle de tema visible como ícono (luna en light mode, sol en dark mode). El footer debe ser extraído como componente reutilizable y aplicado globalmente.

## Why
- **Consistencia Visual**: Un solo header/footer para todo el sitio mejora la cohesión de marca
- **Mantenibilidad**: Elimina duplicación de código entre `/blog/layout.tsx` y futuros layouts
- **Branding Correcto**: Implementa el logo oficial de Gabi Zimmer en lugar del ícono genérico Wine
- **UX Mejorada**: Toggle de tema accesible desde cualquier página con ícono intuitivo
- **Arquitectura Limpia**: Sigue el principio DRY y facilita futuras actualizaciones

## What
Sistema de navegación global que:
- Muestra logo oficial de Gabi Zimmer con soporte dark/light mode automático
- Navegación simple con enlaces a Inicio (/) y Blog (/blog)
- Toggle de tema visible como ícono simple (luna/sol) sin dropdown
- Footer extraído como componente independiente con enlaces actualizados
- Mantiene diseño responsive y accesible
- Preserva animaciones y transiciones existentes

### Success Criteria
- [ ] Header visible en todas las páginas (/, /blog, /admin, etc.)
- [ ] Logo cambia automáticamente entre versiones light/dark según tema
- [ ] Toggle de tema funcional: luna en light mode → click → sol en dark mode
- [ ] Footer global con enlaces a categorías actualizados
- [ ] Sin regresión en responsive design (mobile/tablet/desktop)
- [ ] Build de producción exitoso sin warnings
- [ ] Navegación activa destacada según ruta actual
- [ ] Tests manuales en light/dark mode funcionando

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Arquitectura en capas y patrones de co-ubicación
  
- file: /docs/features.md
  why: Especificaciones exactas de la feature solicitada
  lines: 83-104
  
- file: /src/app/layout.tsx
  why: Layout raíz donde se integrará el header/footer global
  
- file: /src/app/blog/layout.tsx
  why: Header y footer actuales del blog a refactorizar
  
- file: /src/components/theme-toggle.tsx
  why: Componente de toggle existente a simplificar
  
- file: /src/app/globals.css
  why: Variables CSS y clases utility para estilos
  
- file: /docs/sistema-diseno-gz.md
  why: Sistema de diseño y tokens para consistencia
  lines: 1-150
  
- url: https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates
  why: Layouts anidados en Next.js 15
  section: "Root Layout"
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── layout.tsx              # Layout raíz (sin header/footer actual)
│   ├── blog/
│   │   └── layout.tsx          # Contiene header/footer del blog
│   └── admin/
│       └── components/
│           └── admin-header.tsx # Header del admin con theme toggle
├── components/
│   ├── theme-toggle.tsx        # Toggle con dropdown (a simplificar)
│   └── theme-provider.tsx      # Provider de next-themes
└── public/
    └── logos/
        ├── gabi-zimmer-logo.png         # Logo para light mode
        └── gabi-zimmer-logo-amarillo.png # Logo para dark mode
```

### Desired Codebase Tree
```bash
src/
├── app/
│   ├── layout.tsx              # Con <Header /> y <Footer /> globales
│   └── blog/
│       └── layout.tsx          # Sin header/footer (solo children)
├── components/
│   ├── layout/
│   │   ├── header.tsx          # Header global nuevo
│   │   └── footer.tsx          # Footer extraído y refactorizado
│   ├── theme-toggle-icon.tsx  # Toggle simplificado (solo ícono)
│   └── theme-provider.tsx      # Sin cambios
└── public/logos/               # Sin cambios
```

### Known Gotchas & Patterns
```typescript
// PATTERN: Componente cliente para interactividad
"use client" // Necesario para useTheme() y useState()

// PATTERN: Logo responsive con soporte dark mode
import Image from "next/image"
import { useTheme } from "next-themes"

export function Logo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-[120px] h-[40px]" /> // Placeholder
  
  const logoSrc = resolvedTheme === 'dark' 
    ? '/logos/gabi-zimmer-logo-amarillo.png'
    : '/logos/gabi-zimmer-logo.png'
    
  return <Image src={logoSrc} alt="Gabi Zimmer" width={120} height={40} />
}

// PATTERN: Active link highlighting
import { usePathname } from 'next/navigation'

const pathname = usePathname()
const isActive = pathname === href || pathname.startsWith(`${href}/`)

// PATTERN: Theme toggle icon simple (luna/sol según estado)
export function ThemeToggleIcon() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  if (!mounted) return <Button variant="ghost" size="icon" disabled />
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }
  
  // Mostrar luna en light mode (para cambiar a dark)
  // Mostrar sol en dark mode (para cambiar a light)
  const isDark = resolvedTheme === 'dark'
  
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}

// PATTERN: Sticky header con backdrop blur (mantener)
className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"

// PATTERN: Container responsive consistente
className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// No requiere cambios en modelos de datos
// Esta es una refactorización UI pura
```

### Task List (Orden de Implementación)
```yaml
Task 1: Crear componente ThemeToggleIcon simplificado
CREATE src/components/theme-toggle-icon.tsx:
  - "use client" al inicio
  - ELIMINAR DropdownMenu completamente
  - IMPLEMENTAR toggle directo light/dark con onClick
  - LÓGICA: Luna en light mode, Sol en dark mode
  - USAR resolvedTheme para estado actual real
  - VALIDAR mounted state para evitar hydration mismatch
  - NO usar animaciones de rotación complejas

Task 2: Crear componente Header global
CREATE src/components/layout/header.tsx:
  - "use client" al inicio (necesario para hooks)
  - ESTRUCTURA: Logo izquierda | Nav + Theme derecha
  - LOGO: Componente interno que detecta tema
  - NAV: Links simples sin iconos (Inicio, Blog)
  - THEME: Usar ThemeToggleIcon nuevo (visible siempre)
  - ACTIVE: Destacar link activo con usePathname
  - RESPONSIVE: Mobile-first, mantener patrones actuales
  - STICKY: Preservar comportamiento y blur actual

Task 3: Extraer y refactorizar Footer
CREATE src/components/layout/footer.tsx:
  - COPIAR contenido actual de blog/layout.tsx
  - ACTUALIZAR enlaces rápidos según especificación:
    - Uruguay: /blog/uruguay  
    - Viajes: /blog/viajes
    - Noticias: /blog/noticias
    - Opinión: /blog/opinion
  - MANTENER estructura 3 columnas responsive
  - PRESERVAR enlaces sociales y copyright
  - NO necesita "use client" (sin interactividad)

Task 4: Integrar Header y Footer en layout raíz
MODIFY src/app/layout.tsx:
  - IMPORT Header y Footer nuevos
  - ESTRUCTURA:
    <ThemeProvider>
      <body>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </ThemeProvider>
  - ASEGURAR flex layout para sticky footer

Task 5: Limpiar blog layout
MODIFY src/app/blog/layout.tsx:
  - ELIMINAR todo el header actual
  - ELIMINAR todo el footer actual  
  - ELIMINAR imports no utilizados (Link, Wine, etc.)
  - MANTENER solo estructura necesaria para children
  - PRESERVAR cualquier provider o wrapper específico del blog

Task 6: Ajustar estilos del main content
MODIFY src/app/globals.css (si necesario):
  - VERIFICAR min-height para sticky footer
  - AJUSTAR padding-top si header height cambió
  - CONFIRMAR variables CSS funcionan

Task 7: Testing manual completo
VALIDATE en navegador:
  - Theme toggle muestra luna en light mode
  - Click en luna → cambia a dark mode → muestra sol
  - Click en sol → cambia a light mode → muestra luna
  - Logo cambia correctamente con tema
  - Links activos se destacan apropiadamente
  - Responsive design en móvil/tablet/desktop
  - No hay saltos visuales al cambiar tema
  - Footer se mantiene al fondo en páginas cortas

Task 8: Build de producción
RUN comandos:
  - pnpm run lint
  - pnpm run typecheck  
  - pnpm run build
  - VERIFY: Sin errores ni warnings
```

### Per-Task Pseudocode
```typescript
// Task 1: ThemeToggleIcon
// src/components/theme-toggle-icon.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggleIcon() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  
  // Evitar hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <div className="h-5 w-5" />
      </Button>
    )
  }
  
  const isDark = resolvedTheme === 'dark'
  
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
}

// Task 2: Header Component
// src/components/layout/header.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { ThemeToggleIcon } from "@/components/theme-toggle-icon"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function Header() {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  
  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/blog', label: 'Blog' }
  ]
  
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {mounted ? (
              <Image
                src={resolvedTheme === 'dark' 
                  ? '/logos/gabi-zimmer-logo-amarillo.png'
                  : '/logos/gabi-zimmer-logo.png'}
                alt="Gabi Zimmer"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            ) : (
              <div className="h-10 w-[120px] animate-pulse bg-muted rounded" />
            )}
          </Link>
          
          {/* Nav + Theme Toggle */}
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {navItems.map(item => {
                const isActive = pathname === item.href || 
                               (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive 
                        ? "text-foreground" 
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <ThemeToggleIcon />
          </div>
        </div>
      </div>
    </header>
  )
}

// Task 3: Footer Component
// src/components/layout/footer.tsx
import Link from "next/link"
import { Instagram, Twitter } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Sobre */}
          <div>
            <h3 className="font-semibold mb-4">Sobre Gabi Zimmer</h3>
            <p className="text-sm text-muted-foreground">
              Comunicadora especializada en vinos uruguayos, compartiendo historias 
              y conocimiento sobre la vitivinicultura de Uruguay.
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="https://instagram.com/gabizimmer" target="_blank">
                <Instagram className="h-5 w-5 hover:text-primary transition-colors" />
              </Link>
              <Link href="https://twitter.com/gabizimmer" target="_blank">
                <Twitter className="h-5 w-5 hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
          
          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog/uruguay" className="text-muted-foreground hover:text-primary transition-colors">
                  Uruguay
                </Link>
              </li>
              <li>
                <Link href="/blog/viajes" className="text-muted-foreground hover:text-primary transition-colors">
                  Viajes
                </Link>
              </li>
              <li>
                <Link href="/blog/noticias" className="text-muted-foreground hover:text-primary transition-colors">
                  Noticias
                </Link>
              </li>
              <li>
                <Link href="/blog/opinion" className="text-muted-foreground hover:text-primary transition-colors">
                  Opinión
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Columna 3: Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Suscríbete para recibir las últimas novedades sobre vinos uruguayos.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Próximamente disponible
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} Gabi Zimmer. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
```

### Integration Points
```yaml
LAYOUT:
  - location: src/app/layout.tsx
  - import: components/layout/header y footer
  - structure: Header → main → Footer
  
THEME:
  - provider: Ya configurado en layout.tsx
  - toggle: Nuevo componente con ícono simple
  - persistence: localStorage via next-themes
  - icons: Luna (light) → Sol (dark)
  
NAVIGATION:
  - active detection: usePathname hook
  - highlight: Diferente color/weight para activo
  - responsive: Mantener patrones actuales

ASSETS:
  - logos: public/logos/ ya disponibles
  - optimization: Image component con priority
  - dark mode: Detección automática con resolvedTheme
```

## Validation Loop

### Level 1: Syntax & Types
```bash
pnpm run lint
pnpm run typecheck
# Expected: 0 errores
```

### Level 2: Component Isolation
```bash
# Test individual components
pnpm run dev
# Navigate to:
# - http://localhost:3000 (header/footer visible)
# - http://localhost:3000/blog (sin duplicación)
# - http://localhost:3000/admin (header global + admin layout)
```

### Level 3: Theme Testing
```typescript
// Manual testing checklist:
// 1. Light mode: Ícono luna visible
// 2. Click luna → cambia a dark mode
// 3. Dark mode: Ícono sol visible
// 4. Click sol → cambia a light mode
// 5. Logo cambia con tema automáticamente
// 6. Refresh → tema persiste
```

### Level 4: Responsive Testing
```bash
# Chrome DevTools responsive mode
# Test breakpoints:
# - Mobile: 375px
# - Tablet: 768px  
# - Desktop: 1440px
# Verify: Logo size, nav layout, theme toggle visible
```

### Level 5: Production Build
```bash
pnpm run build
# Expected: Build exitoso sin warnings

pnpm run start
# Test en http://localhost:3000
# Verify: Todo funciona igual que en dev
```

## Final Checklist

### Arquitectura
- [ ] Header y Footer en `src/components/layout/`
- [ ] Componentes cliente con "use client"
- [ ] Sin imports de Prisma (no aplica aquí)
- [ ] Estructura modular respetada

### Funcionalidad
- [ ] Logo oficial con soporte dark/light
- [ ] Toggle tema visible como ícono (luna/sol)
- [ ] Luna visible en light mode (para ir a dark)
- [ ] Sol visible en dark mode (para ir a light)
- [ ] Navegación con links activos destacados
- [ ] Footer con enlaces actualizados
- [ ] Header sticky con backdrop blur
- [ ] Responsive en todos los breakpoints

### Calidad de Código
- [ ] Sin errores de lint/types
- [ ] Build de producción exitoso
- [ ] Sin console.log de debug
- [ ] Comentarios mínimos y relevantes
- [ ] Imports organizados y limpios

### UX/UI
- [ ] Ícono de tema intuitivo y visible
- [ ] Sin flash of unstyled content (FOUC)
- [ ] Placeholder mientras carga tema
- [ ] Accesibilidad con aria-labels
- [ ] Focus states visibles en botón de tema

## Anti-Patterns to Avoid

### Componentes
- ❌ NO ocultar el toggle de tema
- ❌ NO usar dropdown para theme toggle
- ❌ NO mostrar ambos íconos simultáneamente
- ❌ NO olvidar mounted check (causa hydration mismatch)
- ❌ NO usar animaciones complejas de rotación

### Estilos
- ❌ NO usar clases CSS custom fuera del sistema
- ❌ NO hardcodear colores (usar variables CSS)
- ❌ NO romper el diseño responsive existente
- ❌ NO hacer el ícono muy pequeño o difícil de clickear

### Performance
- ❌ NO cargar ambos logos (solo el necesario)
- ❌ NO re-renderizar innecesariamente
- ❌ NO olvidar priority en logo principal
- ❌ NO crear múltiples theme providers

## Score de Confianza: 9/10

Este PRP tiene alta probabilidad de éxito porque:
- ✅ Refactorización simple de componentes existentes
- ✅ No requiere cambios en backend o datos
- ✅ Patrones claros ya establecidos en el proyecto
- ✅ Assets (logos) ya disponibles
- ✅ Sistema de tema ya funcionando
- ✅ Ejemplos de código específicos incluidos
- ✅ Lógica de toggle clara: luna→dark, sol→light