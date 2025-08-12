# 🗄️ MySQL Database - WordPress Gabizimmer

Esta documentación explica cómo acceder a la base de datos MySQL con el contenido original de WordPress para el blog gabizimmer.com.

## 📋 Información General

- **Base de datos**: `gabizimmer_com_manual`
- **Origen**: Backup SQL del WordPress original
- **Contenido**: 46 posts, metadatos, imágenes, usuarios, etc.
- **Uso**: Consultas adicionales o re-extracción de contenido

## 🐳 Levantar Contenedor MySQL

### Comando Docker

```bash
docker run --name gabizimmer-mysql \
  -e MYSQL_ROOT_PASSWORD=gabizimmer123 \
  -e MYSQL_DATABASE=gabizimmer_com_manual \
  -p 3306:3306 \
  -d mysql:8.0
```

### Esperar Inicialización
```bash
# Esperar ~30 segundos para que MySQL inicie completamente
sleep 30
```

## 📥 Importar Backup SQL

**Requisito**: Tener el archivo `gabizimmer_backup.sql` en la ruta correcta.

```bash
# Importar el backup SQL al contenedor
docker exec -i gabizimmer-mysql \
  mysql -u root -pgabizimmer123 gabizimmer_com_manual \
  < /path/to/gabizimmer_backup.sql
```

**Ruta por defecto del backup**: `/home/raphael/desarrollo/backups/wp-gz/gabizimmer_backup.sql`

## 🔐 Credenciales de Conexión

### Desde Host (localhost)
```
Host: 127.0.0.1
Port: 3306
Usuario: root
Contraseña: gabizimmer123
Base de datos: gabizimmer_com_manual
Charset: utf8mb4
```

### Desde Python (mysql-connector)
```python
mysql_config = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': 'gabizimmer123',
    'database': 'gabizimmer_com_manual',
    'charset': 'utf8mb4',
    'use_unicode': True
}
```

### Desde CLI
```bash
# Conectarse directamente al MySQL
docker exec -it gabizimmer-mysql mysql -u root -pgabizimmer123 gabizimmer_com_manual

# O desde host (si tienes cliente MySQL instalado)
mysql -h 127.0.0.1 -P 3306 -u root -pgabizimmer123 gabizimmer_com_manual
```

## 📊 Tablas Principales

### Posts y Contenido
- `wp_posts` - Posts, páginas, attachments (46 posts publicados)
- `wp_postmeta` - Metadatos de posts (SEO, imágenes destacadas)
- `wp_comments` - Comentarios del blog
- `wp_commentmeta` - Metadatos de comentarios

### Taxonomías
- `wp_terms` - Términos (categorías, tags)
- `wp_term_taxonomy` - Tipos de taxonomía
- `wp_term_relationships` - Relaciones posts-términos

### Usuarios y Configuración
- `wp_users` - Usuarios del blog
- `wp_usermeta` - Metadatos de usuarios
- `wp_options` - Configuración de WordPress

## 🔍 Consultas Útiles

### Ver todos los posts publicados
```sql
SELECT ID, post_title, post_date, post_name 
FROM wp_posts 
WHERE post_type = 'post' AND post_status = 'publish' 
ORDER BY post_date DESC;
```

### Ver imágenes destacadas
```sql
SELECT p.ID, p.post_title, pm.meta_value as featured_image_id
FROM wp_posts p
LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id 
WHERE pm.meta_key = '_thumbnail_id' 
AND p.post_type = 'post' 
AND p.post_status = 'publish';
```

### Ver categorías más usadas
```sql
SELECT t.name, COUNT(*) as count
FROM wp_terms t
JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
JOIN wp_posts p ON tr.object_id = p.ID
WHERE tt.taxonomy = 'category' 
AND p.post_type = 'post' 
AND p.post_status = 'publish'
GROUP BY t.term_id, t.name
ORDER BY count DESC;
```

### Ver URLs de imágenes por ID
```sql
SELECT ID, guid, post_title, post_date
FROM wp_posts 
WHERE post_type = 'attachment' 
AND ID IN (4993, 5013, 4980, 4938) -- IDs de ejemplo
ORDER BY ID;
```

## 🧹 Limpieza

### Parar y eliminar contenedor
```bash
# Parar contenedor
docker stop gabizimmer-mysql

# Eliminar contenedor
docker rm gabizimmer-mysql

# Limpiar volúmenes (opcional)
docker volume prune
```

## ⚠️ Notas Importantes

1. **Puerto 3306**: Asegúrate de que no haya otro MySQL corriendo en el puerto 3306
2. **Memoria**: El contenedor MySQL puede consumir bastante RAM
3. **Datos temporales**: Los datos se perderán al eliminar el contenedor
4. **Backup**: Siempre mantener una copia del archivo `gabizimmer_backup.sql`

## 🔧 Troubleshooting

### Error: "Can't connect to MySQL server"
```bash
# Verificar que el contenedor esté corriendo
docker ps | grep gabizimmer-mysql

# Ver logs del contenedor
docker logs gabizimmer-mysql

# Reiniciar contenedor
docker restart gabizimmer-mysql
```

### Error: "Access denied"
```bash
# Verificar variables de entorno
docker inspect gabizimmer-mysql | grep -A 10 "Env"

# Recrear contenedor con credenciales correctas
docker rm -f gabizimmer-mysql
# ... ejecutar comando de creación nuevamente
```

### Base de datos vacía después de import
```bash
# Verificar que el archivo SQL existe y tiene contenido
ls -la /path/to/gabizimmer_backup.sql

# Verificar importación
docker exec -it gabizimmer-mysql mysql -u root -pgabizimmer123 -e "USE gabizimmer_com_manual; SHOW TABLES;"
```

## 📅 Última Actualización

- **Fecha**: 2025-08-10
- **Migración**: Completada exitosamente (46 posts extraídos)
- **Extractor usado**: `final-complete-extractor-fixed.py`

---

*Esta base de datos fue utilizada para la migración completa del blog gabizimmer.com de WordPress a Next.js MDX* 🍷