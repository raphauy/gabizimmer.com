# 📖 Especificaciones UI - Blog Gabi Zimmer

## 🎯 Objetivo

Especificaciones técnicas detalladas para implementar la interface completa del blog público de Gabi Zimmer, basado en el sistema de diseño existente y componentes shadcn/ui v4.

## 📋 Índice

- [A) Página de Post Individual](#a-página-de-post-individual)
- [B) Componente PostContent](#b-componente-postcontent)
- [C) Página Índice del Blog](#c-página-índice-del-blog)
- [D) Componentes Auxiliares](#d-componentes-auxiliares)
- [E) Sistema de Comentarios](#e-sistema-de-comentarios)
- [F) Especificaciones Responsive](#f-especificaciones-responsive)

---

## A) Página de Post Individual 
**Ruta**: `/blog/[categorySlug]/[postSlug]`

### A.1 Layout General

```tsx
// Estructura completa de la página
<main className="min-h-screen bg-background">
  {/* Header del Blog */}
  <BlogHeader />
  
  {/* Container principal */}
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-8">
    
    {/* Breadcrumb */}
    <PostBreadcrumb />
    
    {/* Contenido principal en grid */}
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 lg:gap-12">
      
      {/* Artículo principal */}
      <article className="min-w-0">
        <PostHeader />
        <PostContent />
        <PostFooter />
        <PostNavigation />
      </article>
      
      {/* Sidebar */}
      <aside className="space-y-6">
        <AuthorCard />
        <RelatedPosts />
        <CategoryList />
        <TagCloud />
      </aside>
      
    </div>
    
    {/* Sistema de comentarios */}
    <section className="mt-16 border-t border-border pt-8">
      <CommentsSection />
    </section>
    
  </div>
</main>
```

### A.2 PostHeader (Cabecera del Post)

```tsx
// components/blog/post-header.tsx
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Clock, Eye } from "lucide-react"

<header className="space-y-6 mb-8">
  
  {/* Categoría */}
  <Badge 
    variant="secondary" 
    className="bg-wine-primary/10 text-wine-primary hover:bg-wine-primary/20"
  >
    {post.category.name}
  </Badge>
  
  {/* Título principal */}
  <h1 className="font-jost text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
    {post.title}
  </h1>
  
  {/* Excerpt si existe */}
  {post.excerpt && (
    <p className="text-xl text-muted-foreground leading-relaxed">
      {post.excerpt}
    </p>
  )}
  
  {/* Metadata del post */}
  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
    
    {/* Autor */}
    <div className="flex items-center gap-2">
      <Avatar className="w-8 h-8">
        <AvatarImage src={post.author.image} alt={post.author.name} />
        <AvatarFallback className="text-xs">
          {post.author.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <span className="font-medium">{post.author.name}</span>
    </div>
    
    <Separator orientation="vertical" className="h-4" />
    
    {/* Fecha de publicación */}
    <div className="flex items-center gap-1">
      <CalendarDays className="w-4 h-4" />
      <time dateTime={post.publishedAt}>
        {formatDate(post.publishedAt)}
      </time>
    </div>
    
    <Separator orientation="vertical" className="h-4" />
    
    {/* Tiempo de lectura */}
    <div className="flex items-center gap-1">
      <Clock className="w-4 h-4" />
      <span>{post.readingTime} min lectura</span>
    </div>
    
    {/* Views si se implementa */}
    {post.views && (
      <>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{post.views.toLocaleString()} lecturas</span>
        </div>
      </>
    )}
  </div>
  
  {/* Imagen destacada */}
  {post.featuredImageUrl && (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
      <Image
        src={post.featuredImageUrl}
        alt={post.title}
        fill
        className="object-cover"
        priority
      />
    </div>
  )}
  
</header>
```

#### Colores y Estilos:
- **Categoría Badge**: `bg-wine-primary/10 text-wine-primary`
- **Título**: `font-jost text-4xl-6xl font-bold` con color principal
- **Metadata**: `text-muted-foreground` con iconos de Lucide
- **Separadores**: Componente `Separator` de shadcn/ui

### A.3 PostBreadcrumb

```tsx
// components/blog/post-breadcrumb.tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ChevronRight, Home } from "lucide-react"

<Breadcrumb className="mb-6">
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/" className="flex items-center gap-1">
        <Home className="w-4 h-4" />
        Inicio
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator>
      <ChevronRight className="w-4 h-4" />
    </BreadcrumbSeparator>
    <BreadcrumbItem>
      <BreadcrumbLink href="/blog">
        Blog
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator>
      <ChevronRight className="w-4 h-4" />
    </BreadcrumbSeparator>
    <BreadcrumbItem>
      <BreadcrumbLink href={`/blog/${post.category.slug}`}>
        {post.category.name}
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator>
      <ChevronRight className="w-4 h-4" />
    </BreadcrumbSeparator>
    <BreadcrumbItem>
      <BreadcrumbPage className="text-wine-primary">
        {truncate(post.title, 40)}
      </BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

## B) Componente PostContent
**Archivo**: `components/blog/post-content.tsx`

### B.1 Estructura Principal

```tsx
// Componente reutilizable sin comentarios
import { Separator } from "@/components/ui/separator"

interface PostContentProps {
  post: Post
  showNavigation?: boolean
  showFooter?: boolean
  className?: string
}

export function PostContent({ 
  post, 
  showNavigation = true, 
  showFooter = true,
  className 
}: PostContentProps) {
  return (
    <div className={cn("space-y-8", className)}>
      
      {/* Contenido del post */}
      <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
        <NovelRenderer content={post.content} />
      </div>
      
      {/* Tags del post */}
      {post.tags && post.tags.length > 0 && (
        <>
          <Separator />
          <PostTags tags={post.tags} />
        </>
      )}
      
      {/* Footer con compartir */}
      {showFooter && (
        <>
          <Separator />
          <PostFooter post={post} />
        </>
      )}
      
      {/* Navegación anterior/siguiente */}
      {showNavigation && (
        <>
          <Separator />
          <PostNavigation postId={post.id} categorySlug={post.category.slug} />
        </>
      )}
      
    </div>
  )
}
```

### B.2 Estilos Prose para Novel Editor

```css
/* globals.css - Extensiones para Novel content */
.prose-wine {
  /* Headings con colores de marca */
  h1, h2, h3, h4, h5, h6: {
    @apply text-wine-primary font-jost;
  }
  
  /* Párrafos con tipografía editorial */
  p {
    @apply font-noto-serif-tc text-base leading-relaxed mb-4;
  }
  
  /* Links con estilo de marca */
  a {
    @apply text-wine-primary hover:text-wine-accent underline underline-offset-4 decoration-wine-primary/30 hover:decoration-wine-accent transition-colors;
  }
  
  /* Blockquotes elegantes */
  blockquote {
    @apply border-l-4 border-wine-primary bg-wine-primary/5 pl-6 py-4 italic font-noto-serif text-lg;
  }
  
  /* Listas estilizadas */
  ul, ol {
    @apply space-y-2;
  }
  
  /* Código */
  code {
    @apply bg-muted px-2 py-1 rounded text-sm font-mono;
  }
  
  /* Imágenes responsive */
  img {
    @apply rounded-lg shadow-md mx-auto;
  }
}
```

### B.3 PostTags Component

```tsx
// components/blog/post-tags.tsx
import { Badge } from "@/components/ui/badge"
import { Hash } from "lucide-react"

interface PostTagsProps {
  tags: string[]
}

export function PostTags({ tags }: PostTagsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Hash className="w-4 h-4" />
        <span>Etiquetas:</span>
      </div>
      
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="hover:bg-wine-primary/10 hover:text-wine-primary hover:border-wine-primary transition-colors cursor-pointer"
          asChild
        >
          <Link href={`/blog?tag=${encodeURIComponent(tag)}`}>
            {tag}
          </Link>
        </Badge>
      ))}
    </div>
  )
}
```

---

## C) Página Índice del Blog
**Ruta**: `/blog`

### C.1 Layout Principal

```tsx
// app/blog/page.tsx
<main className="min-h-screen bg-background">
  
  {/* Header del Blog */}
  <BlogHeader />
  
  {/* Hero Section */}
  <BlogHero />
  
  {/* Container principal */}
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
    
    {/* Post destacado */}
    <section className="mb-16">
      <FeaturedPost post={featuredPost} />
    </section>
    
    {/* Filtros y búsqueda */}
    <section className="mb-8">
      <BlogFilters />
    </section>
    
    {/* Grid de posts */}
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} variant="default" />
        ))}
      </div>
    </section>
    
    {/* Paginación */}
    <section className="flex justify-center">
      <BlogPagination />
    </section>
    
  </div>
  
</main>
```

### C.2 BlogHero Section

```tsx
// components/blog/blog-hero.tsx
<section className="relative py-20 bg-gradient-to-br from-wine-primary via-wine-secondary to-wine-accent">
  
  {/* Overlay pattern */}
  <div className="absolute inset-0 bg-black/10"></div>
  
  <div className="container relative z-10 text-center text-white">
    
    {/* Título principal */}
    <h1 className="font-jost text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
      Blog Gabi Zimmer
    </h1>
    
    {/* Subtítulo */}
    <p className="text-xl md:text-2xl font-noto-serif italic mb-8 max-w-2xl mx-auto">
      Explorando el mundo del vino uruguayo con pasión y conocimiento
    </p>
    
    {/* CTA */}
    <Button 
      size="lg" 
      variant="outline" 
      className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-wine-primary transition-colors"
      asChild
    >
      <Link href="#posts">
        <Wine className="w-5 h-5 mr-2" />
        Descubrir Posts
      </Link>
    </Button>
    
  </div>
  
</section>
```

### C.3 BlogFilters Component

```tsx
// components/blog/blog-filters.tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

<div className="space-y-6">
  
  {/* Barra de búsqueda */}
  <div className="relative max-w-md">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input 
      placeholder="Buscar posts..." 
      className="pl-10"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
  
  {/* Filtros por categoría */}
  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
    <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full">
      <TabsTrigger value="all">Todos</TabsTrigger>
      <TabsTrigger value="vinos">Vinos</TabsTrigger>
      <TabsTrigger value="bodegas">Bodegas</TabsTrigger>
      <TabsTrigger value="catas">Catas</TabsTrigger>
      <TabsTrigger value="maridajes">Maridajes</TabsTrigger>
      <TabsTrigger value="viajes">Viajes</TabsTrigger>
    </TabsList>
  </Tabs>
  
  {/* Ordenamiento */}
  <div className="flex items-center gap-4">
    <span className="text-sm text-muted-foreground">Ordenar por:</span>
    <Select value={sortBy} onValueChange={setSortBy}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="date-desc">Más recientes</SelectItem>
        <SelectItem value="date-asc">Más antiguos</SelectItem>
        <SelectItem value="title-asc">A-Z</SelectItem>
        <SelectItem value="title-desc">Z-A</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
</div>
```

---

## D) Componentes Auxiliares

### D.1 PostCard (3 Variantes)

```tsx
// components/blog/post-card.tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Clock } from "lucide-react"

const postCardVariants = cva(
  "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
  {
    variants: {
      variant: {
        featured: "col-span-full lg:col-span-2 row-span-2",
        default: "",
        compact: "flex flex-row gap-4 p-4"
      }
    }
  }
)

interface PostCardProps {
  post: Post
  variant?: "featured" | "default" | "compact"
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  
  if (variant === "featured") {
    return (
      <Card className={postCardVariants({ variant })}>
        
        <div className="grid lg:grid-cols-2 gap-6 h-full">
          
          {/* Imagen */}
          <div className="relative aspect-video lg:aspect-auto rounded-lg overflow-hidden bg-muted">
            <Image
              src={post.featuredImageUrl || '/placeholder-wine.jpg'}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-wine-primary text-white">
                Destacado
              </Badge>
            </div>
          </div>
          
          {/* Contenido */}
          <CardContent className="p-6 flex flex-col justify-between">
            
            <div className="space-y-4">
              
              {/* Categoría */}
              <Badge variant="outline" className="w-fit">
                {post.category.name}
              </Badge>
              
              {/* Título */}
              <h2 className="font-jost text-2xl lg:text-3xl font-bold text-foreground group-hover:text-wine-primary transition-colors">
                {post.title}
              </h2>
              
              {/* Excerpt */}
              <p className="text-muted-foreground line-clamp-3">
                {post.excerpt}
              </p>
              
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-4 mt-auto">
              
              {/* Autor */}
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={post.author.image} />
                  <AvatarFallback className="text-xs">{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{post.author.name}</span>
              </div>
              
              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  <time>{formatDate(post.publishedAt)}</time>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.readingTime}m</span>
                </div>
              </div>
              
            </div>
            
          </CardContent>
          
        </div>
        
      </Card>
    )
  }
  
  if (variant === "compact") {
    return (
      <Card className={postCardVariants({ variant })}>
        
        {/* Imagen pequeña */}
        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={post.featuredImageUrl || '/placeholder-wine.jpg'}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0 space-y-1">
          
          <Badge variant="outline" className="w-fit text-xs">
            {post.category.name}
          </Badge>
          
          <h3 className="font-jost font-semibold text-sm leading-tight line-clamp-2 group-hover:text-wine-primary transition-colors">
            {post.title}
          </h3>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <time>{formatDate(post.publishedAt)}</time>
            <span>•</span>
            <span>{post.readingTime}m</span>
          </div>
          
        </div>
        
      </Card>
    )
  }
  
  // Variante default
  return (
    <Card className={postCardVariants({ variant })}>
      
      {/* Imagen */}
      <div className="relative aspect-video rounded-t-lg overflow-hidden bg-muted">
        <Image
          src={post.featuredImageUrl || '/placeholder-wine.jpg'}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      <CardContent className="p-6 space-y-4">
        
        {/* Categoría */}
        <Badge variant="outline" className="w-fit">
          {post.category.name}
        </Badge>
        
        {/* Título */}
        <h3 className="font-jost text-xl font-bold text-foreground group-hover:text-wine-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        {/* Excerpt */}
        <p className="text-muted-foreground text-sm line-clamp-3">
          {post.excerpt}
        </p>
        
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        
        {/* Autor */}
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={post.author.image} />
            <AvatarFallback className="text-xs">{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{post.author.name}</span>
        </div>
        
        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            <time>{formatDate(post.publishedAt)}</time>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{post.readingTime}m</span>
          </div>
        </div>
        
      </CardFooter>
      
    </Card>
  )
}
```

### D.2 AuthorCard (Sidebar)

```tsx
// components/blog/author-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Instagram, ExternalLink } from "lucide-react"

export function AuthorCard({ author }: { author: Author }) {
  return (
    <Card>
      <CardHeader className="text-center">
        
        <Avatar className="w-20 h-20 mx-auto mb-4">
          <AvatarImage src={author.image} alt={author.name} />
          <AvatarFallback className="text-2xl">
            {author.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <CardTitle className="font-jost">{author.name}</CardTitle>
        
        {author.title && (
          <p className="text-sm text-wine-primary font-medium">
            {author.title}
          </p>
        )}
        
      </CardHeader>
      
      <CardContent className="space-y-4">
        
        {/* Bio corta */}
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          {author.bio}
        </p>
        
        {/* Enlaces sociales */}
        <div className="flex gap-2 justify-center">
          
          {author.instagram && (
            <Button variant="outline" size="sm" asChild>
              <a 
                href={`https://instagram.com/${author.instagram}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <Instagram className="w-4 h-4" />
                @{author.instagram}
              </a>
            </Button>
          )}
          
          {author.website && (
            <Button variant="outline" size="sm" asChild>
              <a 
                href={author.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Web
              </a>
            </Button>
          )}
          
        </div>
        
      </CardContent>
    </Card>
  )
}
```

### D.3 RelatedPosts Component

```tsx
// components/blog/related-posts.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RelatedPostsProps {
  currentPostId: string
  categorySlug: string
  limit?: number
}

export function RelatedPosts({ currentPostId, categorySlug, limit = 3 }: RelatedPostsProps) {
  
  const relatedPosts = useRelatedPosts(currentPostId, categorySlug, limit)
  
  if (relatedPosts.length === 0) return null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-jost text-lg">Posts Relacionados</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {relatedPosts.map((post) => (
          <PostCard key={post.id} post={post} variant="compact" />
        ))}
      </CardContent>
    </Card>
  )
}
```

### D.4 ShareButtons Component

```tsx
// components/blog/share-buttons.tsx
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Linkedin, Link, Copy } from "lucide-react"
import { toast } from "sonner"

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("🍷 Link copiado al portapapeles")
    } catch (error) {
      toast.error("Error al copiar el link")
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      
      <span className="text-sm text-muted-foreground mr-2">Compartir:</span>
      
      {/* Facebook */}
      <Button
        variant="outline" 
        size="icon"
        onClick={() => {
          window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        }}
      >
        <Facebook className="w-4 h-4" />
      </Button>
      
      {/* Twitter */}
      <Button
        variant="outline" 
        size="icon"
        onClick={() => {
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
        }}
      >
        <Twitter className="w-4 h-4" />
      </Button>
      
      {/* LinkedIn */}
      <Button
        variant="outline" 
        size="icon"
        onClick={() => {
          window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        }}
      >
        <Linkedin className="w-4 h-4" />
      </Button>
      
      {/* Copiar link */}
      <Button
        variant="outline" 
        size="icon"
        onClick={handleCopyLink}
      >
        <Copy className="w-4 h-4" />
      </Button>
      
    </div>
  )
}
```

---

## E) Sistema de Comentarios

### Análisis de Opciones

#### Opción 1: Comentarios Abajo ✅ **RECOMENDADA**
- **Pros**: Flujo natural de lectura, mejor UX mobile, menos distracciones
- **Contras**: Requiere scroll para comentar

#### Opción 2: Panel Lateral
- **Pros**: Visibilidad constante, comentarios contextuales
- **Contras**: Complicado en mobile, distrae de la lectura

### E.1 Implementación Recomendada (Abajo)

```tsx
// components/blog/comments-section.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Heart, Reply } from "lucide-react"

<section className="space-y-6">
  
  {/* Header */}
  <div className="flex items-center justify-between">
    <h2 className="font-jost text-2xl font-bold flex items-center gap-2">
      <MessageCircle className="w-6 h-6 text-wine-primary" />
      Comentarios ({comments.length})
    </h2>
  </div>
  
  {/* Formulario de comentario */}
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Agregar comentario</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Textarea
        placeholder="¿Qué opinas sobre este post? Comparte tu experiencia..."
        className="min-h-24 resize-none"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Sé respetuoso y constructivo en tus comentarios
        </p>
        <Button 
          onClick={handleSubmitComment}
          disabled={!newComment.trim()}
          className="bg-wine-primary hover:bg-wine-accent"
        >
          Comentar
        </Button>
      </div>
    </CardContent>
  </Card>
  
  {/* Lista de comentarios */}
  <div className="space-y-4">
    {comments.map((comment) => (
      <CommentItem key={comment.id} comment={comment} />
    ))}
  </div>
  
</section>

// Componente individual de comentario
function CommentItem({ comment }: { comment: Comment }) {
  return (
    <Card>
      <CardContent className="p-4">
        
        {/* Header del comentario */}
        <div className="flex items-start gap-3 mb-3">
          
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.author.image} />
            <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <time className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </time>
            </div>
            
            <p className="text-sm text-foreground leading-relaxed">
              {comment.content}
            </p>
            
          </div>
          
        </div>
        
        {/* Acciones */}
        <div className="flex items-center gap-4 ml-11">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
            <Heart className="w-3 h-3 mr-1" />
            {comment.likes || 0}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
            <Reply className="w-3 h-3 mr-1" />
            Responder
          </Button>
        </div>
        
      </CardContent>
    </Card>
  )
}
```

---

## F) Especificaciones Responsive

### F.1 Breakpoints Sistema

```css
/* Basado en Tailwind CSS breakpoints */
sm: 640px   /* Tablet portrait */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop small */
xl: 1280px  /* Desktop large */
2xl: 1536px /* Desktop XL */
```

### F.2 Layout Responsive

```tsx
// Página de post individual
<div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 lg:gap-12">
  <article className="min-w-0">
    {/* Contenido principal */}
  </article>
  <aside className="space-y-6">
    {/* Sidebar - se mueve abajo en mobile */}
  </aside>
</div>

// Grid de posts en index
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {posts.map(post => <PostCard key={post.id} post={post} />)}
</div>

// Post destacado responsive
<Card className="col-span-full lg:col-span-2">
  <div className="grid lg:grid-cols-2 gap-6">
    {/* Imagen y contenido lado a lado en desktop */}
  </div>
</Card>
```

### F.3 Tipografía Responsive

```css
/* Títulos que se adaptan */
.hero-title {
  @apply text-4xl md:text-5xl lg:text-6xl xl:text-7xl;
}

.post-title {
  @apply text-2xl md:text-3xl lg:text-4xl xl:text-5xl;
}

.section-title {
  @apply text-xl md:text-2xl lg:text-3xl;
}
```

### F.4 Espaciado Responsive

```css
/* Padding de secciones */
.section-padding {
  @apply py-8 md:py-12 lg:py-16 xl:py-20;
}

/* Container con padding lateral */
.container-responsive {
  @apply px-4 sm:px-6 lg:px-8;
}

/* Gaps en grids */
.post-grid {
  @apply gap-4 md:gap-6 lg:gap-8;
}
```

---

## 📱 Estados y Interacciones

### Loading States
```tsx
// Skeleton para PostCard
function PostCardSkeleton() {
  return (
    <Card>
      <Skeleton className="aspect-video rounded-t-lg" />
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
```

### Hover Effects
```css
/* Cards con elevación */
.post-card {
  @apply transition-all duration-200 hover:shadow-lg hover:-translate-y-1;
}

/* Links con subrayado animado */
.animated-link {
  @apply relative transition-colors;
}
.animated-link::after {
  @apply absolute bottom-0 left-0 w-0 h-0.5 bg-wine-primary transition-all duration-200;
  content: '';
}
.animated-link:hover::after {
  @apply w-full;
}
```

---

## 🎨 Colores y Temas

### Paleta del Blog
- **Wine Primary**: `oklch(0.5 0.15 320)` - Acciones principales
- **Wine Secondary**: `oklch(0.7 0.12 340)` - Elementos secundarios
- **Wine Accent**: `oklch(0.6 0.18 300)` - CTAs y highlights
- **Gabi Yellow**: `#EAE559` - Acentos especiales
- **Gabi Blue**: `#0170BB` - Enlaces
- **Gabi Orange**: `#FF915E` - Alertas positivas

### Dark Mode
```css
:root {
  --wine-primary: oklch(0.5 0.15 320);
}

.dark {
  --wine-primary: oklch(0.7 0.15 320);
}
```

---

## ✅ Checklist de Implementación

### Componentes Base (shadcn/ui)
- [ ] Card, Badge, Avatar, Button
- [ ] Input, Textarea, Select, Tabs
- [ ] Breadcrumb, Separator, Skeleton
- [ ] Dialog, Popover, Tooltip

### Componentes del Blog
- [ ] PostCard (3 variantes)
- [ ] PostContent (reutilizable)
- [ ] PostHeader con metadata
- [ ] AuthorCard, RelatedPosts
- [ ] ShareButtons, CommentsSection
- [ ] BlogFilters, BlogPagination

### Páginas
- [ ] `/blog` - Índice con grid
- [ ] `/blog/[category]/[slug]` - Post individual
- [ ] Estados de loading
- [ ] Error boundaries

### Responsive
- [ ] Mobile-first approach
- [ ] Grids responsive
- [ ] Tipografía escalable
- [ ] Navegación móvil

### Performance
- [ ] Lazy loading de imágenes
- [ ] Skeleton loading states
- [ ] Componentes memoizados
- [ ] Bundle optimization

---

**📋 Documento creado**: Agosto 2025  
**🔄 Última actualización**: 11 de agosto, 2025  
**🛠️ Compatible con**: Next.js 15, shadcn/ui v4, Tailwind CSS v4

🍷 *Especificaciones técnicas para el blog de Gabi Zimmer - Comunicación del vino uruguayo*