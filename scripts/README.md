# Scripts de Migración - gabizimmer.com

## 📋 Descripción

Scripts para migrar contenido de WordPress a gabizimmer.com con conversión automática de Markdown a JSON Novel (TipTap).

## 🚀 Scripts Disponibles

### 1. Conversión Individual

Convierte un post markdown individual a la base de datos.

```bash
pnpm run convert:post <ruta-archivo-markdown>
```

**Ejemplo:**
```bash
pnpm run convert:post docs/resources/migrated-posts/post-1555.md
```

### 2. Migración Masiva

Convierte todos los posts markdown que no han sido migrados aún.

```bash
pnpm run migrate:all-posts
```

## 📁 Estructura de Archivos

```
scripts/
├── README.md                           # Esta documentación
├── convert-markdown-to-novel.ts        # Script principal individual
├── migrate-all-posts.ts               # Script de migración masiva
└── lib/
    ├── markdown-parser.ts              # Parser de front matter + imágenes
    ├── novel-converter.ts              # Conversor markdown → JSON Novel
    └── image-processor.ts              # Subida de imágenes a Vercel Blob
```

## 🔧 Funcionalidades

### ✅ Conversión de Contenido
- **Markdown → Novel JSON**: Convierte párrafos, headings, listas, blockquotes
- **Preserva formato**: Bold, italic, links, code inline
- **Maneja imágenes**: Detecta y procesa imágenes en contenido

### ✅ Gestión de Imágenes
- **Subida automática**: Sube imágenes locales a Vercel Blob Storage
- **Imagen destacada**: Primera imagen o la marcada como "featured"
- **URLs actualizadas**: Reemplaza rutas locales con URLs de Blob
- **Procesamiento paralelo**: Hasta 3 imágenes simultáneas

### ✅ Gestión de Metadatos
- **Front matter YAML**: Extrae título, slug, categorías, etc.
- **Categorías automáticas**: Crea categorías si no existen
- **Autor automático**: Detecta usuario Gabi como autor
- **Mapeo de status**: published → PUBLISHED, draft → DRAFT
- **Idiomas**: Soporte para ES/EN
- **SEO**: Procesa seoTitle y seoDescription

### ✅ Validaciones y Seguridad
- **Validaciones Zod**: Usa servicios existentes con validaciones
- **Arquitectura en capas**: Respeta reglas del proyecto
- **Manejo de errores**: Feedback detallado de errores
- **Transacciones**: Rollback en caso de fallas

## 📄 Formato de Posts Markdown

### Front Matter Requerido

```yaml
---
title: "Título del Post"
date: "2019-07-22 07:01:32"
slug: "slug-del-post"
categories: ["Categoría"]
lang: "en"  # o "es"
status: "published"  # o "draft"
author: "Gabi Zimmer"
featuredImage: "./images/imagen.jpg"  # opcional
excerpt: "Descripción corta"  # opcional
seoTitle: "Título SEO"  # opcional
seoDescription: "Descripción SEO"  # opcional
---
```

### Contenido Soportado

```markdown
# Headings (H1-H6)

**Texto en negrita** y *texto en cursiva*

[Enlaces](https://ejemplo.com)

`código inline`

> Blockquotes para citas

- Lista con viñetas
- Segundo elemento

1. Lista numerada
2. Segundo elemento

![Descripción](./images/imagen.jpg)
```

## 🎯 Salida del Script

### Conversión Exitosa
```
✅ Post creado: Título del Post
📝 ID: cme76kx2v00025bdjzirx9tpv
🔗 Slug: slug-del-post  
🌐 Idioma: EN
📊 Status: PUBLISHED
🖼️  Imágenes subidas: 2
📁 Categoría: Wine (nueva)
👤 Autor: Gabi Zimmer

🎉 Conversión completada exitosamente
```

### Con Errores
```
❌ Error en conversión
Error: El post debe tener al menos una categoría

Stack trace:
[detalles del error...]
```

## ⚠️ Manejo de Errores

### Errores Comunes

1. **Front matter inválido**
   ```
   Error parseando markdown: Front matter debe tener un título válido
   ```

2. **Imagen no encontrada**
   ```
   ⚠ imagen.jpg: Archivo no encontrado: /path/to/image.jpg
   ```

3. **Slug duplicado**
   ```
   El slug "slug-existente" ya existe para el idioma EN
   ```

4. **Base de datos**
   ```
   No se encontró usuario superadmin. Ejecuta el seed primero.
   ```

### Soluciones

- **Verificar estructura**: Asegurar que front matter tiene todos los campos requeridos
- **Rutas de imágenes**: Verificar que las rutas en markdown apuntan a archivos existentes
- **Base de datos**: Ejecutar `pnpm db:seed` para crear usuarios iniciales
- **Variables de entorno**: Verificar que `BLOB_READ_WRITE_TOKEN` está configurado

## 🔄 Flujo de Migración

### 1. Preparación
```bash
# 1. Verificar base de datos
pnpm db:push
pnpm db:seed

# 2. Verificar variables de entorno
# DATABASE_URL, BLOB_READ_WRITE_TOKEN, etc.

# 3. Validar sintaxis
pnpm run typecheck
```

### 2. Prueba Individual
```bash
# Probar con un post específico
pnpm run convert:post docs/resources/migrated-posts/post-1555.md
```

### 3. Migración Masiva
```bash
# Migrar todos los posts pendientes
pnpm run migrate:all-posts
```

### 4. Verificación
```bash
# Verificar en Prisma Studio
pnpm prisma studio

# Verificar estructura JSON en tabla Post
# Verificar imágenes en Vercel Blob Dashboard
```

## 📊 Estadísticas de Migración

El script genera estadísticas detalladas:

- ✅ Posts convertidos exitosamente
- ⚠️ Posts con advertencias
- ❌ Posts con errores
- 🖼️ Total de imágenes subidas
- 📁 Categorías creadas
- ⏱️ Tiempo total de migración

## 🛠️ Desarrollo

### Agregar Soporte para Nuevos Elementos

**1. Novel Converter** (`scripts/lib/novel-converter.ts`)
```typescript
// Agregar nuevo tipo de nodo
case 'customElement':
  return {
    type: 'customElement',
    attrs: { /* atributos */ },
    content: [/* contenido */]
  }
```

**2. Markdown Parser** (`scripts/lib/markdown-parser.ts`)
```typescript
// Agregar extracción de nuevos metadatos
function validateFrontMatter(data: any) {
  // Agregar validación para nuevo campo
  customField: data.customField?.trim() || undefined
}
```

### Testing

```bash
# Verificar tipos
pnpm run typecheck

# Linting
pnpm run lint

# Test individual
pnpm run convert:post docs/resources/migrated-posts/post-test.md
```

## 🎯 Próximos Pasos

1. **Migración completa**: Ejecutar migración masiva de todos los posts
2. **Verificación**: Revisar posts migrados en admin panel
3. **Optimizaciones**: Mejorar performance para lotes grandes
4. **Tags**: Implementar soporte para tags (actualmente solo categorías)
5. **Comentarios**: Migrar comentarios de WordPress si es necesario

## 📞 Soporte

Si encuentras errores durante la migración:

1. Verificar logs detallados en terminal
2. Revisar estructura del archivo markdown
3. Validar que todas las dependencias estén instaladas
4. Verificar variables de entorno y conexión a BD

---

**Desarrollado para gabizimmer.com** 🍷
*Migración automatizada de contenido WordPress a Next.js + Novel*