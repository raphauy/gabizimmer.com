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

### 2. Sistema de Gestión de Posts (`/admin/posts`)
- **CRUD completo de posts del blog con editor avanzado**:
  - Crear posts con editor rico Novel.sh y upload de imágenes a Vercel Blob
  - Editar posts existentes con preservación de relaciones y metadatos
  - Listar posts con tabla responsive, filtros por estado, autor y categoría
  - Eliminar posts con protección de integridad (no permite eliminar si tiene comentarios)
- **Editor Novel.sh integrado**:
  - Editor WYSIWYG con soporte completo de markdown y rich text
  - Upload de imágenes inline directo a Vercel Blob durante edición
  - Auto-guardado con indicadores visuales de estado
  - Cálculo automático de tiempo de lectura basado en contenido
- **Gestión de estados de publicación**:
  - Estados: DRAFT (borrador), PUBLISHED (publicado), ARCHIVED (archivado)
  - Flujo automático de publishedAt al cambiar de borrador a publicado
  - Badge visual con colores diferenciados por estado
  - Filtrado y ordenamiento por estado y fecha
- **Validación avanzada de slug único por idioma**:
  - Auto-generación de slug desde título con normalización de acentos
  - Verificación de unicidad en tiempo real con indicadores visuales (✓/✗)
  - Botón regenerar slug desde título actualizado
  - Soporte multiidioma (ES/EN) con unicidad por idioma
- **Featured images y SEO**:
  - Upload/replace/delete de imagen destacada con preview
  - Metadatos SEO: título (60 chars), descripción (160 chars)
  - Excerpt/resumen con límite de 300 caracteres
  - Contadores de caracteres en tiempo real
- **Integración con sistema existente**:
  - Relación con categorías existentes via selector
  - Autoría automática desde sesión autenticada
  - Badge en sidebar mostrando count total de posts
  - Breadcrumbs en páginas crear/editar
- **Interfaz consistente con sistema de diseño**:
  - Componentes shadcn/ui v4 con tema wine colors
  - Loading states con skeleton components
  - Toast notifications para feedback de operaciones
  - Modal de confirmación para eliminación
  - Responsive design y dark mode completo
- **Accesible para superadmin y colaboradores (solo superadmin puede eliminar)**

## Features Públicas

### 1. Chat con Asistente de Vinos (página principal `/`)
- **Conversación con IA especializada en vinos uruguayos**:
  - Chat en tiempo real usando Vercel AI SDK v5 con GPT-5-mini
  - Respuestas especializadas sobre vinos, maridajes, catas y bodegas uruguayas
  - Sistema prompt personalizado para experiencia como asistente de Gabi Zimmer
  - Sin persistencia de mensajes (conversación temporal)
- **Interfaz adaptada del diseño Bond**:
  - Greeting personalizado con introducción de Gabi Zimmer
  - Área de input con bordes redondeados y placeholder temático
  - Mensajes del usuario con fondo verde oscuro del sistema de diseño
  - Mensajes del asistente con avatar personalizado (vinedo-icon.png)
  - Indicador de typing con puntos animados en verde
- **Experiencia optimizada**:
  - Texto simple renderizado sin spacing extra para mensajes compactos
  - Contenido markdown para respuestas complejas del asistente
  - Layout con header y footer del sitio principal
  - Enfoque automático en textarea después de enviar mensaje
- **Accesible públicamente sin autenticación requerida en la página principal**

## Infraestructura Técnica

### Servicios Backend
- `category-service.ts` - CRUD de categorías, validaciones Zod, verificación de unicidad de slug, protección contra eliminación con posts asociados
- `post-service.ts` - CRUD completo de posts, validaciones Zod avanzadas, verificación de unicidad de slug por idioma, cálculo de tiempo de lectura, protección de integridad referencial, gestión de estados de publicación
- `upload-service.ts` - Upload de imágenes featured y contenido a Vercel Blob con organización por carpetas

### APIs de Chat
- `/api/chat` - Endpoint para streaming de respuestas de IA usando Vercel AI Gateway, configurado con GPT-5-mini y sistema prompt especializado en vinos uruguayos

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
</FEATURE>
-->

<FEATURE number="1" status="CREATING-PRP" prp-file-path="">
Implementar un preview de un post en la parte de edición o creación.
Está previsto un componente que se usa para ver un post que no tiene la parte de comentarios ni de relacionados, utilizar ese. Quiero que su contenido se vea igual a como se verá cuando esté publicado.
Utilizar el agente UI/UX para ver dónde poner el botón de preview y la vista, además de la navegación para que sea fácil e intuitivo para el usuario.
</FEATURE>

<FEATURE number="2" status="PENDING" prp-file-path="">
Implementar la parte de visualización y moderación de comentarios en /admin
</FEATURE>
