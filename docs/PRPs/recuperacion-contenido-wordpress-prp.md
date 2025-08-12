# PRP: Script de Recuperación de Contenido WordPress

## Goal
Crear un script Python que extraiga un post específico (ID 5121) de la base de datos MySQL restaurada del WordPress de Gabi Zimmer y genere un archivo Markdown completo con su contenido, metadatos y las imágenes correctamente referenciadas y copiadas desde la carpeta WordPress.

## Why
- **Validación de datos**: Verificar que podemos acceder correctamente al contenido completo del blog hackeado
- **Prueba de concepto**: Establecer el patrón para la futura migración masiva de todos los posts
- **Preservación del contenido**: Asegurar que no se pierda el contenido valioso del blog original
- **Base para feature futura**: Crear la infraestructura que usaremos para implementar el sistema de blog completo

## What
Un script Python que debe:
- Conectar a MySQL y extraer el post ID 5121 con todos sus metadatos
- Procesar las imágenes referenciadas y copiarlas a una ubicación accesible
- Generar un archivo Markdown estructurado con front matter
- Validar que el contenido sea correcto y las imágenes se visualicen

### Success Criteria
- [ ] Script se conecta exitosamente a la base de datos MySQL
- [ ] Extrae el post ID 5121 con título, contenido, fecha, autor, categorías y tags
- [ ] Identifica y procesa todas las imágenes referenciadas en el post
- [ ] Copia las imágenes desde wp-content/uploads a una ubicación temporal
- [ ] Genera archivo Markdown válido con front matter YAML
- [ ] Las imágenes se pueden visualizar correctamente en el Markdown generado
- [ ] El script ejecuta sin errores y produce output legible

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: docs/resources/MYSQL-DATABASE-INFO.md
  why: CRÍTICO - Credenciales y estructura de la base de datos MySQL
  
- file: docs/features.md
  why: Contexto del proyecto y feature específica que estamos implementando
  
- file: CLAUDE.md
  why: Stack tecnológico del proyecto y convenciones
```

### Current Codebase Tree
```bash
# Ubicaciones relevantes actuales
/home/raphael/desarrollo/gabizimmer.com/
├── scripts/                          # VACÍA - aquí va nuestro script
├── docs/
│   └── resources/
│       └── MYSQL-DATABASE-INFO.md    # Credenciales MySQL
├── scripts_old/                      # Scripts previos de referencia
│   ├── final-complete-extractor-fixed.py
│   └── gabizimmer-blog-final/        # Posts ya extraídos (para referencia)
└── /home/raphael/desarrollo/backups/wp-gz/
    ├── gabizimmer_backup.sql         # Base de datos restaurada
    └── gabizimmer.com_hacked/
        └── wp-content/uploads/       # Imágenes organizadas por año/mes
```

### Desired Codebase Tree
```bash
# Archivos que debe generar el script
scripts/
├── recuperar-post-5121.py           # Script principal
├── requirements.txt                 # Dependencias Python
├── output/                          # Carpeta de salida
│   ├── post-5121.md                # Archivo Markdown generado
│   └── images/                      # Imágenes copiadas
│       ├── imagen1.jpg
│       ├── imagen2.png
│       └── ...
└── README.md                        # Documentación del script
```

### Known Gotchas & Patterns
```python
# CRITICAL: Configuración de conexión MySQL (docs/resources/MYSQL-DATABASE-INFO.md)
mysql_config = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root', 
    'password': 'gabizimmer123',
    'database': 'gabizimmer_com_manual',
    'charset': 'utf8mb4',
    'use_unicode': True
}

# PATTERN: Estructura de tablas WordPress
# wp_posts: post_title, post_content, post_date, post_name, post_author
# wp_postmeta: meta_key='_thumbnail_id' para imagen destacada
# wp_terms + wp_term_relationships: categorías y tags
# wp_users: display_name del autor

# GOTCHA: Rutas de imágenes WordPress
# Base: /home/raphael/desarrollo/backups/wp-gz/gabizimmer.com_hacked/wp-content/uploads/
# Estructura: uploads/YYYY/MM/archivo.jpg
# Múltiples tamaños: archivo.jpg, archivo-300x200.jpg, etc.

# PATTERN: Front matter YAML para Markdown
---
title: "Título del post"
slug: "slug-del-post"  
date: "2023-08-19"
author: "Gabi Zimmer"
categories: ["Opinion", "Latinoamerica"]
tags: []
language: "es"  # Detectar idioma del contenido
featured_image: "./images/imagen-destacada.jpg"
---

# GOTCHA: Contenido WordPress puede tener shortcodes y HTML
# Necesita limpieza: [gallery], <p>, etc.
# Convertir URLs absolutas a relativas para imágenes

# PATTERN: Estructura del post específico (ID 5121)
POST_ID = 5121
EXPECTED_TITLE = "Cultura Gastronómica en Latinoamérica: un vehículo de empoderamiento cultural"
EXPECTED_SLUG = "cultura-gastronomica-en-latinoamerica-un-vehiculo-de-empoderamiento-cultural"
EXPECTED_DATE = "2023-08-19T10:49:39"
EXPECTED_CATEGORIES = ["Opinion", "Latinoamerica"]
```

## Implementation Blueprint

### Data Structure Analysis
```sql
-- Post principal (ID 5121)
SELECT p.ID, p.post_title, p.post_content, p.post_date, p.post_name, 
       p.post_author, u.display_name
FROM wp_posts p
LEFT JOIN wp_users u ON p.post_author = u.ID
WHERE p.ID = 5121 AND p.post_type = 'post';

-- Imagen destacada
SELECT pm.meta_value as featured_image_id
FROM wp_postmeta pm 
WHERE pm.post_id = 5121 AND pm.meta_key = '_thumbnail_id';

-- Categorías y tags
SELECT t.name, tt.taxonomy
FROM wp_terms t
JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id  
JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
WHERE tr.object_id = 5121;

-- URL de imagen destacada
SELECT guid FROM wp_posts WHERE ID = [featured_image_id] AND post_type = 'attachment';
```

### Task List (Orden de Implementación)
```yaml
Task 1: Configuración del Entorno
CREATE scripts/requirements.txt:
  - mysql-connector-python>=8.0.0
  - python-dateutil>=2.8.0
  - Pillow>=9.0.0 (para procesar imágenes)
  - markdownify>=0.11.0 (convertir HTML a Markdown)

CREATE scripts/README.md:
  - Documentación del script
  - Instrucciones de instalación
  - Ejemplos de uso

Task 2: Estructura Base del Script  
CREATE scripts/recuperar-post-5121.py:
  - Importar dependencias
  - Configurar logging
  - Definir constantes (POST_ID, rutas)
  - Función main() con manejo de errores

Task 3: Conexión a Base de Datos
IMPLEMENT connect_to_database():
  - Usar credenciales de MYSQL-DATABASE-INFO.md
  - Test de conexión
  - Manejo robusto de errores
  - Context manager para auto-cerrar conexión

Task 4: Extracción de Datos del Post
IMPLEMENT extract_post_data(connection, post_id):
  - Query principal del post
  - Extraer metadatos (categorías, tags, imagen destacada)
  - Validar que el post existe
  - RETURN diccionario con toda la data

Task 5: Procesamiento de Imágenes
IMPLEMENT process_images(post_content, featured_image_id):
  - Identificar todas las imágenes en el contenido HTML
  - Localizar archivos físicos en wp-content/uploads/
  - Copiar imágenes a scripts/output/images/
  - Actualizar URLs en el contenido
  - RETURN contenido actualizado + lista de imágenes

Task 6: Conversión a Markdown
IMPLEMENT convert_to_markdown(post_data, processed_content):
  - Generar front matter YAML
  - Convertir HTML a Markdown limpio
  - Detectar idioma del contenido
  - Estructurar el archivo final

Task 7: Generación de Archivos
IMPLEMENT save_markdown_file():
  - Crear estructura de carpetas output/
  - Escribir archivo Markdown
  - Generar reporte de procesamiento
  - Validar que las imágenes son accesibles

Task 8: Script de Validación
CREATE scripts/validar-output.py:
  - Verificar que el Markdown es válido
  - Test de imágenes (existen y son accesibles)
  - Comparar con datos originales
  - Generar reporte de calidad

Task 9: Documentación Final
UPDATE scripts/README.md:
  - Resultados obtenidos
  - Estadísticas de procesamiento
  - Screenshots del output
  - Notas para futura migración masiva

Task 10: Testing y Refinamiento
RUN tests completos:
  - Ejecutar con POST_ID 5121
  - Validar output generado
  - Verificar imágenes en Markdown viewer
  - Documentar cualquier issue encontrado
```

### Per-Task Pseudocode
```python
# Task 2: Estructura Base
#!/usr/bin/env python3
"""
Script para recuperar post específico del WordPress de Gabi Zimmer
Extrae post ID 5121 con imágenes desde base de datos MySQL restaurada
"""

import mysql.connector
import os
import shutil
import re
import logging
from pathlib import Path
from datetime import datetime

# Configuración
POST_ID = 5121
MYSQL_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306, 
    'user': 'root',
    'password': 'gabizimmer123',
    'database': 'gabizimmer_com_manual',
    'charset': 'utf8mb4',
    'use_unicode': True
}

WP_UPLOADS_PATH = Path("/home/raphael/desarrollo/backups/wp-gz/gabizimmer.com_hacked/wp-content/uploads")
OUTPUT_DIR = Path("scripts/output")
IMAGES_DIR = OUTPUT_DIR / "images"

def main():
    """Función principal del script"""
    try:
        setup_logging()
        setup_directories()
        
        with connect_to_database() as conn:
            post_data = extract_post_data(conn, POST_ID)
            processed_content, images = process_images(post_data['content'], post_data.get('featured_image_id'))
            markdown_content = convert_to_markdown(post_data, processed_content)
            save_markdown_file(markdown_content, f"post-{POST_ID}.md")
            
        generate_report(post_data, images)
        logging.info(f"✅ Post {POST_ID} extraído exitosamente")
        
    except Exception as e:
        logging.error(f"❌ Error procesando post {POST_ID}: {e}")
        raise

# Task 3: Conexión a DB
def connect_to_database():
    """Conecta a la base de datos MySQL"""
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        logging.info("✅ Conexión a MySQL exitosa")
        return conn
    except mysql.connector.Error as e:
        logging.error(f"❌ Error conectando a MySQL: {e}")
        raise

# Task 4: Extracción de datos
def extract_post_data(connection, post_id):
    """Extrae todos los datos del post desde MySQL"""
    cursor = connection.cursor(dictionary=True)
    
    # Post principal
    post_query = """
        SELECT p.ID, p.post_title, p.post_content, p.post_date, p.post_name,
               p.post_author, u.display_name as author_name
        FROM wp_posts p
        LEFT JOIN wp_users u ON p.post_author = u.ID  
        WHERE p.ID = %s AND p.post_type = 'post'
    """
    cursor.execute(post_query, (post_id,))
    post = cursor.fetchone()
    
    if not post:
        raise ValueError(f"Post {post_id} no encontrado")
    
    # Metadatos adicionales
    post['categories'] = get_post_categories(cursor, post_id)
    post['tags'] = get_post_tags(cursor, post_id) 
    post['featured_image_id'] = get_featured_image_id(cursor, post_id)
    
    cursor.close()
    return post
```

### Integration Points
```yaml
MYSQL_CONTAINER:
  - setup: docker run con credenciales correctas
  - test: conexión desde Python
  - queries: validar estructura de tablas WordPress

WORDPRESS_FILES:
  - path: /home/raphael/desarrollo/backups/wp-gz/gabizimmer.com_hacked/wp-content/uploads/
  - structure: uploads/YYYY/MM/archivo.ext
  - images: múltiples tamaños generados por WordPress
  
OUTPUT_VALIDATION:
  - markdown: sintaxis válida con front matter YAML
  - images: copiadas y accesibles
  - content: HTML convertido correctamente a Markdown
```

## Validation Loop

### Level 1: Environment Setup
```bash
# Verificar que MySQL está corriendo
docker ps | grep gabizimmer-mysql
# Expected: contenedor activo

# Instalar dependencias Python
cd scripts
pip install -r requirements.txt
# Expected: instalación exitosa
```

### Level 2: Database Connection
```bash
# Test de conexión a MySQL
python3 -c "import mysql.connector; mysql.connector.connect(host='127.0.0.1', user='root', password='gabizimmer123', database='gabizimmer_com_manual')"
# Expected: sin errores

# Verificar que el post existe
docker exec -it gabizimmer-mysql mysql -u root -pgabizimmer123 gabizimmer_com_manual -e "SELECT ID, post_title FROM wp_posts WHERE ID = 5121;"
# Expected: muestra el post
```

### Level 3: Script Execution
```bash
cd scripts
python3 recuperar-post-5121.py
# Expected: ejecución sin errores, archivos generados en output/
```

### Level 4: Output Validation
```bash
# Verificar estructura generada
ls -la output/
# Expected: post-5121.md y carpeta images/

# Verificar imágenes copiadas
ls -la output/images/
# Expected: archivos de imagen válidos

# Validar Markdown
head -20 output/post-5121.md
# Expected: front matter YAML válido
```

### Level 5: Content Quality
```bash
# Usar validador de Markdown
pip install markdown-validator
markdown-validator output/post-5121.md
# Expected: Markdown válido

# Verificar imágenes son accesibles
python3 validar-output.py
# Expected: todas las imágenes existen y son válidas
```

## Final Checklist

### Datos Extraídos Correctamente
- [ ] Post ID 5121 extraído sin errores
- [ ] Título: "Cultura Gastronómica en Latinoamérica: un vehículo de empoderamiento cultural"  
- [ ] Slug: "cultura-gastronomica-en-latinoamerica-un-vehiculo-de-empoderamiento-cultural"
- [ ] Fecha: "2023-08-19T10:49:39"
- [ ] Autor: "Gabi Zimmer"
- [ ] Categorías: ["Opinion", "Latinoamerica"]
- [ ] Contenido completo extraído
- [ ] Imagen destacada identificada y procesada

### Procesamiento de Imágenes
- [ ] Todas las imágenes del post identificadas
- [ ] Archivos copiados desde wp-content/uploads/
- [ ] URLs actualizadas a rutas relativas
- [ ] Múltiples tamaños de imagen manejados correctamente
- [ ] Imágenes se visualizan en viewer de Markdown

### Archivo de Salida
- [ ] Front matter YAML válido
- [ ] Contenido HTML convertido a Markdown limpio
- [ ] Estructura de archivo organizada y legible
- [ ] Idioma detectado correctamente ("es")
- [ ] Referencias de imágenes funcionan

### Script Robusto
- [ ] Manejo de errores completo
- [ ] Logging informativo 
- [ ] Documentación clara
- [ ] Código reutilizable para otros posts
- [ ] Performance aceptable
- [ ] No deja archivos temporales

## Anti-Patterns to Avoid

### Base de Datos
- ❌ NO usar credenciales hardcodeadas sin validación
- ❌ NO dejar conexiones abiertas sin context manager
- ❌ NO hacer queries sin preparar (SQL injection risk)
- ❌ NO asumir que el post existe sin verificar

### Procesamiento de Imágenes  
- ❌ NO copiar imágenes sin validar que existen
- ❌ NO sobrescribir archivos sin confirmación
- ❌ NO ignorar múltiples tamaños de WordPress
- ❌ NO dejar URLs absolutas en el Markdown

### Calidad del Código
- ❌ NO usar paths hardcodeados sin Path objects
- ❌ NO suprimir errores sin logging
- ❌ NO crear archivos sin validar permisos
- ❌ NO generar Markdown malformado

### Score de Confianza: 9/10

Este PRP proporciona contexto exhaustivo, pasos detallados y validaciones específicas para implementar exitosamente el script de recuperación de contenido en una sola pasada.