# gabizimmer.com - Features Implementadas

## Overview del Proyecto

### Propósito
Blog personal de Gabi Zimmer para publicar contenido editorial sobre vino, gastronomía, viajes y cultura. Debe permitir a Gabi y colaboradores crear, editar, publicar y moderar contenido con una experiencia moderna, rápida y accesible para lectores.

### Objetivos de Producto (V1)
- Publicación de artículos con edición WYSIWYG y almacenamiento final en Markdown/MDX.
- Flujo editorial: borrador → revisión → publicación → actualización.
- Lectura pública rápida, accesible, SEO-first y mobile-first.
- Sistema de comentarios con moderación.
- Roles y permisos para autoría y colaboración.
- Observabilidad básica: métricas de lectura, tiempo en página y suscripciones al newsletter (si aplica).

### Audiencia
- Lectores interesados en vino y gastronomía (principal).
- Profesionales del sector y prensa (secundaria).
- Colaboradores/autores invitados (interno).

## Features de Administrador (`/admin/*`)

### 1. Sistema de Gestión de Categorías (`/admin/categories`)
- **CRUD completo de categorías del blog**:
  - Crear categoría con nombre, slug único y descripción opcional
  - Editar categorías existentes manteniendo relaciones con posts
  - Listar categorías con conteo de posts asociados y ordenamiento alfabético
  - Eliminar categorías solo si no tienen posts asociados (protección de integridad)
- **Validación avanzada de slug**:
  - Auto-generación de slug desde nombre con normalización de acentos
  - Verificación de unicidad en tiempo real con indicadores visuales
  - Formato lowercase con guiones, sin caracteres especiales
- **Interfaz con componentes shadcn/ui v4**:
  - Tabla responsive con nombres clickeables que enlazan a edición
  - Formularios con validación en tiempo real y límites de caracteres
  - Loading states con skeleton components
  - Modal de confirmación para eliminación con explicación de restricciones
  - Toast notifications para feedback de todas las operaciones
- **Integración con navegación**:
  - Badge en sidebar mostrando cantidad total de categorías
  - Breadcrumbs en páginas de crear/editar
- **Solo accesible para superadmin**

## Infraestructura Técnica

### Servicios Backend
- `category-service.ts` - CRUD de categorías, validaciones Zod, verificación de unicidad de slug, protección contra eliminación con posts asociados

### Modelos de Base de Datos
- **Category** (id, name, slug, description, posts[], createdAt, updatedAt)

### Sistema de Diseño (`/docs/sistema-diseno-gz.md`)
- **Sistema completo basado en la identidad de marca Gabi Zimmer**:
  - Documentación exhaustiva con valores de marca, principios de diseño y conceptos clave
  - Design tokens: paleta de colores (Amarillo GZ, Azul GZ, Naranja GZ, Verde Oscuro, Verde Claro)
  - Tipografía oficial: Space Mono (logo), Jost (UI), Noto Serif (contenido editorial)
  - Sistema de espaciado base 8px con escala completa
- **Integración 100% con shadcn/ui v4**:
  - 21 componentes base instalados y documentados
  - Guías de extensión de componentes con CVA (Class Variance Authority)
  - Patrones de composición para blog (PostCard, CategoryBadge, TagCloud)
  - Dark mode nativo con variables CSS personalizadas
- **Recursos visuales disponibles**:
  - 6 variantes de logotipo en diferentes colores
  - 30+ iconos temáticos de vino y gastronomía
  - Gradientes de marca definidos (wine-primary, wine-accent, gabi-brand)
- **Guías de implementación completas**:
  - Integración con Next.js 15 y React Server Components
  - Accesibilidad WCAG AA con checklist
  - Performance best practices y optimización
  - Workflow de desarrollo y troubleshooting

## 🚀 Siguientes Features a Implementar

<!-- Esta sección será actualizada dinámicamente como parte del proceso de desarrollo con agentes 
Template (no borrar):
<FEATURE number="1" status="PENDING" prp-file-path="">
...
/docs/sistema-diseno-gz.md
</FEATURE>
-->

<FEATURE number="1" status="PRP-DONE" prp-file-path="/docs/PRPs/chat-principal-prp.md">
Crear un chat para la página principal, debe tener solo el chat, además del header y el footer.
El chat será utilizando Vercel AI SDK versión 5 (https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
Esta primera versión será sin persistencia de mensajes, un route simple que solo genere la respuesta para el usuario del blog, como indica la doc: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot

Tengo otro proyecto donde utilizo un chat del ai sdk para un simulador, el proyecto Bond, quiero que el chat del blog se vea como el chat del simulador de Bond, aquí te dejo info para que veas cómo está hecho allí, es mucho más complejo porque utiliza RAG, tool calls, persistencia de mensajes, etc. Pero debes ver para tomar la escencia de lo que quiero, un greeting igual al de Bond, un input con curvas igual al multimodal input de Bond pero sin los botones (archivos, herramientas, etc).
Aquí te dejo info de Bond:
/home/raphael/desarrollo/bond/docs/features.md
/home/raphael/desarrollo/bond/src/app/a/[slug]/manage/agents/[id]/simulator/chat-interface.tsx

Sientete libre de explorar Bond para que el chat se vea igual.

El modelo a utilizar en el blog es openai/gpt-5-mini con AI Gatewai de Vercel, ej:
import { streamText } from 'ai'

const result = streamText({
  model: 'openai/gpt-5-mini',
  prompt: 'What is the history of the San Francisco Mission-style burrito?'
})
Ya tengo configurada en el .env la api key: AI_GATEWAY_API_KEY
</FEATURE>
