# PRP: Sistema de Diseño Completo para gabizimmer.com

## Goal
Crear un sistema de diseño documentado y completo en `/docs/sistema-diseno-gz.md` que unifique la identidad visual de Gabi Zimmer con la implementación técnica del proyecto, proporcionando una guía exhaustiva para desarrolladores frontend con todos los design tokens, componentes, patrones y mejores prácticas para mantener consistencia visual y técnica en todo el proyecto.

## Why
- **Consistencia visual**: Alinear la implementación técnica actual con la identidad de marca establecida de Gabi Zimmer
- **Eficiencia de desarrollo**: Proporcionar una referencia única para todos los desarrolladores frontend
- **Escalabilidad**: Establecer patrones reutilizables para futuras features del blog
- **Mantenibilidad**: Documentar decisiones de diseño y su implementación técnica
- **Branding cohesivo**: Integrar los colores, tipografías e iconografía oficiales de Gabi Zimmer
- **Compatibilidad shadcn/ui**: Asegurar total alineación con el ecosistema shadcn/ui v4 que es la base de componentes del proyecto

## What
Generar un archivo markdown completo que documente:
- Design tokens (colores, tipografías, espaciado, sombras) compatibles con shadcn/ui
- Componentes UI y sus variantes basados en shadcn/ui v4
- Patrones de diseño y mejores prácticas alineados con shadcn/ui
- Guías de uso con ejemplos de código usando componentes shadcn/ui
- Integración de la identidad visual de Gabi Zimmer con el sistema shadcn/ui
- Referencias a recursos visuales (logos, iconos)
- Extensiones y customizaciones sobre la base de shadcn/ui

### Success Criteria
- [ ] Archivo `/docs/sistema-diseno-gz.md` creado con documentación completa
- [ ] Todos los colores de la identidad visual integrados como design tokens compatibles con shadcn/ui
- [ ] Tipografías de marca documentadas con fallbacks apropiados
- [ ] Componentes shadcn/ui existentes documentados con ejemplos de uso
- [ ] Guías de implementación para nuevos componentes siguiendo patrones de shadcn/ui
- [ ] Referencias visuales a logos e iconos incluidas
- [ ] Sistema compatible con dark mode (usando el sistema de temas de shadcn/ui)
- [ ] Documentación de cómo extender componentes shadcn/ui con la identidad de marca
- [ ] Documentación accesible para desarrolladores sin contexto previo
- [ ] `pnpm run build` exitoso sin errores

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Arquitectura en capas estricta del proyecto
  
- file: /docs/features.md
  why: Visión general del proyecto y features planificadas
  
- file: /docs/resources/Identidad-GabiZimmer.txt
  why: CRÍTICO - Paleta oficial, tipografías y valores de marca
  
- file: /BLOG-DESIGN-SYSTEM.md
  why: Sistema de diseño del blog ya documentado
  
- file: /src/app/globals.css
  why: Variables CSS y design tokens actuales
  
- file: /tailwind.config.ts
  why: Configuración de Tailwind CSS v4
  
- file: /docs/research/sistema-diseno-nextjs-15-2025.md
  why: Mejores prácticas investigadas para sistemas de diseño
  
- file: /src/components/ui/button.tsx
  why: Ejemplo de componente shadcn/ui implementado
```

### Current Codebase Tree
```bash
docs/
├── resources/
│   ├── Identidad-GabiZimmer.txt    # Identidad visual oficial
│   ├── Logotipos/                  # 13 variantes de logo
│   └── Iconos/                     # 30+ iconos temáticos
├── research/
│   └── sistema-diseno-nextjs-15-2025.md
└── BLOG-DESIGN-SYSTEM.md           # Sistema parcial existente

src/
├── app/
│   └── globals.css                 # Variables CSS actuales
├── components/
│   ├── ui/                         # 22 componentes shadcn/ui
│   └── blog/                       # Componentes blog planificados
└── lib/
    └── utils.ts                    # Utilidades y cn()
```

### Desired Codebase Tree
```bash
docs/
├── sistema-diseno-gz.md            # [NUEVO] Sistema completo
├── resources/                      # [EXISTENTE] Assets visuales
└── research/                       # [EXISTENTE] Investigación

# No se modifican archivos de código, solo documentación
```

### Known Gotchas & Patterns
```markdown
# CRITICAL: Identidad Visual de Gabi Zimmer
# Colores oficiales que DEBEN integrarse:
- Amarillo: #EAE559
- Azul: #0170BB  
- Naranja: #FF915E
- Verde oscuro: #35472A
- Verde claro: #E7F0BC

# Tipografías oficiales:
- Space Mono Bold Italic (logotipo)
- Jost (Regular, Medium, Bold) - textos
- Noto Serif Bold Italic - destacados
- Noto Serif TC Medium - contenido largo

# PATTERN: Variables CSS en espacio OKLCH
# El proyecto usa OKLCH para mejor consistencia de color
--wine-primary: oklch(0.5 0.15 320);

# PATTERN: Tema de vinos ya establecido
# Mantener gradientes morado-rosa existentes
bg-gradient-to-br from-purple-50 to-pink-50

# GOTCHA: No modificar archivos de código
# Solo crear documentación, no cambiar implementación

# PATTERN: Componentes shadcn/ui v4
# 22 componentes ya instalados con estilo "new-york"
# El sistema de diseño DEBE ser 100% compatible con shadcn/ui
# Todos los tokens deben funcionar con componentes shadcn/ui
# Las extensiones deben seguir las convenciones de shadcn/ui
```

## Implementation Blueprint

### Data Structure
```markdown
# Estructura del documento sistema-diseno-gz.md

## 1. Introducción
- Propósito del sistema
- Valores de marca
- Principios de diseño
- Compatibilidad con shadcn/ui v4

## 2. Identidad Visual
- Historia de la marca
- Conceptos clave
- Públicos objetivo

## 3. Design Tokens (Compatible con shadcn/ui)
### 3.1 Colores
- Paleta principal (brand)
- Paleta de vinos (temática)
- Colores funcionales de shadcn/ui
- Integración con variables CSS de shadcn/ui
- Dark mode (usando el sistema de temas de shadcn/ui)

### 3.2 Tipografía
- Familias tipográficas
- Escalas y tamaños
- Pesos y estilos
- Uso por contexto

### 3.3 Espaciado
- Sistema de espaciado
- Márgenes y padding
- Gaps y spacing

### 3.4 Efectos
- Sombras
- Bordes y radios
- Gradientes
- Transiciones

## 4. Componentes (Basados en shadcn/ui)
### 4.1 Componentes Base shadcn/ui
- Button (variantes y estados de shadcn/ui)
- Input y formularios (componentes shadcn/ui)
- Cards y contenedores (Card de shadcn/ui)
- Navegación (NavigationMenu de shadcn/ui)
- Todos los 22 componentes shadcn/ui instalados

### 4.2 Componentes de Blog (Extensiones de shadcn/ui)
- PostCard (basado en Card de shadcn/ui)
- CategoryBadge (basado en Badge de shadcn/ui)
- TagCloud (usando Badge y Button de shadcn/ui)
- CommentSystem (con componentes shadcn/ui)

### 4.3 Componentes Especiales
- GabiSignature
- WineRating
- TastingNotes

## 5. Patrones de Diseño
- Layouts responsive
- Grids y flexbox
- Estados de loading
- Feedback al usuario

## 6. Recursos Visuales
- Logotipos y uso
- Iconografía
- Imágenes y fotografía

## 7. Guías de Implementación
- Cómo extender componentes shadcn/ui
- Código de ejemplo con shadcn/ui
- Mejores prácticas de shadcn/ui
- Accesibilidad (WCAG AA con shadcn/ui)
- Performance con React Server Components

## 8. Herramientas y Ecosistema
- shadcn/ui v4 (componente library principal)
- Tailwind CSS v4 (styling framework)
- Lucide icons (iconografía oficial de shadcn/ui)
- Class Variance Authority (CVA para variantes)
- Radix UI (primitivos de shadcn/ui)
```

### Task List
```yaml
Task 1: Analizar recursos de identidad
READ /docs/resources/Identidad-GabiZimmer.txt:
  - Extraer TODOS los valores de marca
  - Documentar colores hexadecimales exactos
  - Listar tipografías y sus usos
  - Identificar conceptos y valores clave

Task 2: Auditar implementación actual
READ /src/app/globals.css:
  - Mapear variables CSS existentes
  - Identificar colores de vino definidos
  - Documentar sistema de espaciado actual
READ /BLOG-DESIGN-SYSTEM.md:
  - Extraer componentes ya documentados
  - Identificar patrones establecidos

Task 3: Crear sección de introducción
WRITE en sistema-diseno-gz.md:
  - Propósito y alcance
  - Valores de marca de Gabi Zimmer
  - Principios de diseño (simplicidad, autenticidad, alegría)
  - Compatibilidad total con shadcn/ui v4
  - Cómo usar este documento con componentes shadcn/ui

Task 4: Documentar Design Tokens - Colores
SECTION Colores:
  - Convertir colores HEX a OKLCH
  - Crear tabla de colores de marca
  - Documentar colores de vino existentes
  - Mapear a variables CSS de shadcn/ui
  - Especificar cómo usar con componentes shadcn/ui
  - Incluir valores para dark mode (sistema de shadcn/ui)

Task 5: Documentar Design Tokens - Tipografía  
SECTION Tipografía:
  - Mapear tipografías de identidad a Google Fonts
  - Definir escala tipográfica (xs a 6xl)
  - Especificar usos (headings, body, captions)
  - Proporcionar código CSS/Tailwind

Task 6: Documentar Design Tokens - Espaciado
SECTION Espaciado:
  - Sistema de 4px/8px base
  - Escala de espaciado (0 a 96)
  - Patrones de margin/padding
  - Gaps para grids y flex

Task 7: Documentar Componentes Base shadcn/ui
SECTION Componentes:
  - Listar 22 componentes shadcn/ui instalados
  - Documentar variantes de Button de shadcn/ui
  - Ejemplos de cómo extender componentes shadcn/ui con colores de marca
  - Cómo crear variantes custom manteniendo compatibilidad con shadcn/ui
  - Estados (hover, focus, disabled) siguiendo patrones de shadcn/ui

Task 8: Documentar Componentes de Blog (Extensiones shadcn/ui)
EXTRACT from BLOG-DESIGN-SYSTEM.md:
  - PostCard basado en Card de shadcn/ui
  - CategoryBadge extendiendo Badge de shadcn/ui
  - TagCloud usando componentes shadcn/ui
  - Sistema de comentarios con componentes shadcn/ui
  - Cómo estos componentes extienden shadcn/ui sin romper compatibilidad

Task 9: Crear sección de Recursos Visuales
SECTION Recursos:
  - Listar logos disponibles en /docs/resources/Logotipos/
  - Documentar iconos en /docs/resources/Iconos/
  - Guías de uso de logos
  - Área de resguardo

Task 10: Añadir Guías de Implementación con shadcn/ui
SECTION Implementación:
  - Cómo extender componentes shadcn/ui correctamente
  - Ejemplos de código usando cn() de shadcn/ui
  - Uso de Class Variance Authority (CVA) como en shadcn/ui
  - Integración con Next.js y shadcn/ui
  - Dark mode patterns siguiendo el sistema de shadcn/ui

Task 11: Validación final
VERIFY:
  - Todos los colores de identidad incluidos
  - Tipografías documentadas
  - Componentes con ejemplos
  - Referencias a archivos de recursos
  - Formato markdown correcto
```

### Per-Task Pseudocode
```markdown
# Task 4: Colores - Ejemplo de documentación
## 3.1 Colores

### Paleta Principal - Marca Gabi Zimmer

| Nombre | HEX | OKLCH | CSS Variable | Uso |
|--------|-----|-------|--------------|-----|
| Amarillo GZ | #EAE559 | oklch(0.89 0.16 104) | --gabi-yellow | Acentos, CTA principal |
| Azul GZ | #0170BB | oklch(0.51 0.14 242) | --gabi-blue | Links, elementos interactivos |
| Naranja GZ | #FF915E | oklch(0.72 0.15 43) | --gabi-orange | Alertas positivas, highlights |
| Verde Oscuro | #35472A | oklch(0.35 0.08 130) | --gabi-dark-green | Textos, fondos oscuros |
| Verde Claro | #E7F0BC | oklch(0.93 0.09 110) | --gabi-light-green | Fondos suaves, cards |

### Paleta Temática - Vinos

| Nombre | Light Mode | Dark Mode | Uso |
|--------|------------|-----------|-----|
| Wine Primary | oklch(0.5 0.15 320) | oklch(0.7 0.15 320) | Color principal del tema |
| Wine Secondary | oklch(0.7 0.12 340) | oklch(0.6 0.12 340) | Elementos secundarios |
| Wine Accent | oklch(0.6 0.18 300) | oklch(0.65 0.18 300) | CTAs, highlights |
| Wine Muted | oklch(0.9 0.05 320) | oklch(0.25 0.05 320) | Fondos, bordes |

### Uso en Código con shadcn/ui

```tsx
// Usando con componentes shadcn/ui
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Extendiendo Button de shadcn/ui con colores de marca
<Button 
  className={cn(
    "bg-wine-primary hover:bg-wine-accent",
    "text-white"
  )}
>
  Descubrir Vinos
</Button>

// Variables CSS compatibles con shadcn/ui
/* Tailwind classes disponibles */
.text-wine-primary
.bg-wine-secondary
.border-wine-accent
.hover:bg-wine-primary

/* CSS Variables para componentes custom */
var(--wine-primary)
var(--gabi-yellow)
```

# Task 5: Tipografía - Ejemplo
## 3.2 Tipografía

### Familias Tipográficas

#### Marca Principal
```css
/* Logotipo - No usar en UI general */
font-family: 'Space Mono', monospace;
font-weight: 700;
font-style: italic;
```

#### Textos Generales
```css
/* Headings y UI */
font-family: 'Jost', sans-serif;
/* Pesos disponibles: 400 (Regular), 500 (Medium), 700 (Bold) */

/* Contenido editorial largo */
font-family: 'Noto Serif', serif;
/* Para destacados: font-weight: 700; font-style: italic; */
```

### Escala Tipográfica

| Nivel | Tamaño | Line Height | Uso | Clase Tailwind |
|-------|--------|-------------|-----|----------------|
| Display | 72px | 1 | Hero titles | text-7xl |
| H1 | 48px | 1.2 | Page titles | text-5xl |
| H2 | 36px | 1.25 | Section headers | text-4xl |
| H3 | 30px | 1.3 | Subsections | text-3xl |
| H4 | 24px | 1.4 | Card titles | text-2xl |
| H5 | 20px | 1.5 | Subtitles | text-xl |
| Body | 16px | 1.6 | Contenido | text-base |
| Small | 14px | 1.5 | Captions | text-sm |
| Tiny | 12px | 1.5 | Labels | text-xs |
```

### Integration Points
```yaml
FONTS:
  - Google Fonts CDN para web fonts
  - next/font para optimización en Next.js
  - Fallbacks: system-ui, -apple-system

DARK MODE:
  - Todos los colores con variante dark
  - Usar Tailwind dark: prefix
  - CSS variables automáticas

COMPONENTES shadcn/ui:
  - Todos los componentes en /src/components/ui/ son de shadcn/ui
  - Usar cn() utility de shadcn/ui para combinar clases
  - Extender componentes con CVA como hace shadcn/ui
  - Mantener compatibilidad total con el ecosistema shadcn/ui
  - Patrones de BLOG-DESIGN-SYSTEM.md basados en shadcn/ui
```

## Validation Loop

### Level 1: Verificación de Contenido
```bash
# Verificar que el archivo existe
ls -la /docs/sistema-diseno-gz.md
# Expected: Archivo creado

# Verificar tamaño apropiado (debe ser exhaustivo)
wc -l /docs/sistema-diseno-gz.md
# Expected: 800+ líneas
```

### Level 2: Validación de Markdown
```bash
# Verificar sintaxis markdown
# No hay herramienta instalada, verificar manualmente:
# - Headers correctos (# ## ###)
# - Tablas formateadas
# - Code blocks con syntax highlighting
# - Enlaces funcionando
```

### Level 3: Completitud
```checklist
- [ ] Todos los colores de Identidad-GabiZimmer.txt incluidos
- [ ] Las 4 familias tipográficas documentadas
- [ ] 22 componentes shadcn/ui listados
- [ ] Componentes de blog de BLOG-DESIGN-SYSTEM.md
- [ ] Referencias a logos en /docs/resources/Logotipos/
- [ ] Referencias a iconos en /docs/resources/Iconos/
- [ ] Ejemplos de código para cada sección
- [ ] Guías de dark mode
- [ ] Patrones de accesibilidad
```

### Level 4: Usabilidad
```yaml
Verificar mentalmente:
- ¿Puede un desarrollador sin contexto entender el sistema?
- ¿Están todos los valores necesarios para implementar?
- ¿Los ejemplos son copy-paste ready?
- ¿Las referencias a archivos son absolutas y correctas?
```

### Level 5: Build del Proyecto
```bash
# Verificar que no rompimos nada
pnpm run build
# Expected: Build exitoso

# El archivo es solo documentación, no debe afectar el build
```

## Final Checklist

### Contenido Completo
- [ ] Introducción con valores de marca de Gabi Zimmer
- [ ] Declaración explícita de compatibilidad con shadcn/ui v4
- [ ] Colores: marca (5) + vinos (4) + funcionales + integración shadcn/ui
- [ ] Tipografías: 4 familias con escalas y usos
- [ ] Espaciado: sistema completo con ejemplos
- [ ] Componentes: 22 componentes shadcn/ui documentados
- [ ] Extensiones de componentes shadcn/ui para blog
- [ ] Recursos: logos (13) + iconos (30+)
- [ ] Guías de implementación con código shadcn/ui
- [ ] Referencias a archivos existentes

### Calidad Técnica
- [ ] Formato markdown válido
- [ ] Tablas legibles y bien formateadas
- [ ] Code blocks con syntax highlighting
- [ ] Enlaces internos funcionando
- [ ] Compatibilidad con dark mode documentada
- [ ] Ejemplos copy-paste ready

### Alineación con Proyecto
- [ ] Respeta arquitectura en capas (no modifica código)
- [ ] 100% compatible con shadcn/ui v4 instalado
- [ ] Todos los ejemplos usan componentes shadcn/ui
- [ ] Documenta cómo extender componentes shadcn/ui
- [ ] Usa cn() utility de shadcn/ui en ejemplos
- [ ] Usa espacio de color OKLCH como shadcn/ui
- [ ] Mantiene gradientes purple-pink existentes
- [ ] Integra con BLOG-DESIGN-SYSTEM.md
- [ ] Compatible con el sistema de temas de shadcn/ui

## Anti-Patterns to Avoid

### Documentación
- ❌ NO modificar archivos de código fuente
- ❌ NO cambiar variables CSS existentes
- ❌ NO alterar componentes implementados
- ❌ NO crear archivos fuera de /docs/
- ❌ NO omitir colores de la identidad oficial
- ❌ NO inventar valores no presentes en Identidad-GabiZimmer.txt

### Contenido
- ❌ NO usar Lorem Ipsum o placeholders
- ❌ NO dejar secciones incompletas
- ❌ NO omitir dark mode en ninguna sección
- ❌ NO usar colores sin convertir a OKLCH
- ❌ NO documentar componentes no instalados
- ❌ NO crear guías sin ejemplos de código

### Técnico
- ❌ NO usar espacios de color RGB/HSL (usar OKLCH como shadcn/ui)
- ❌ NO hardcodear valores (usar variables CSS)
- ❌ NO ignorar componentes shadcn/ui existentes
- ❌ NO crear componentes que no sigan patrones de shadcn/ui
- ❌ NO romper compatibilidad con shadcn/ui
- ❌ NO romper convenciones de Tailwind v4
- ❌ NO crear dependencias nuevas fuera del ecosistema shadcn/ui
- ❌ NO modificar configuración del proyecto

## Score de Confianza: 9/10

Este PRP tiene un alto nivel de confianza porque:
- ✅ Tarea clara y bien definida (crear documentación)
- ✅ No modifica código existente (solo crea un archivo .md)
- ✅ Todos los recursos necesarios están identificados
- ✅ Ejemplos y patrones claramente especificados
- ✅ Total compatibilidad con shadcn/ui v4 enfatizada
- ✅ Validaciones simples y ejecutables
- ✅ Basado en investigación exhaustiva previa
- ✅ Alineado con el ecosistema shadcn/ui del proyecto

El único punto de complejidad es asegurar la exhaustividad del documento, pero con las referencias proporcionadas es completamente alcanzable en una sola pasada.