"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { 
  Loader2, 
  Check, 
  X, 
  RefreshCw,
  Save
} from "lucide-react"
import { 
  generateSlugAction, 
  checkSlugAction, 
  createPostAction, 
  updatePostAction 
} from "./actions"
import { PostImageUpload } from "./post-image-upload"
import { CategorySelector } from "./category-selector"
import { type PostWithRelations } from "@/services/post-service"
import { type Category, type PostStatus } from "@prisma/client"
import dynamic from "next/dynamic"
import { PostEditorSkeleton } from "./post-editor"
import { type JSONContent } from "novel"

// Cargar el editor dinámicamente para evitar SSR
const DynamicPostEditor = dynamic(
  () => import("./post-editor").then((mod) => mod.PostEditor),
  { 
    ssr: false,
    loading: () => <PostEditorSkeleton />
  }
)

interface PostFormProps {
  post?: PostWithRelations
  categories: Category[]
  isEdit?: boolean
}

export function PostForm({ post, categories, isEdit = false }: PostFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Estados del formulario
  const [title, setTitle] = useState(post?.title || "")
  const [slug, setSlug] = useState(post?.slug || "")
  const [content, setContent] = useState<JSONContent>(
    (post?.content as JSONContent) || { type: 'doc', content: [] }
  )
  const [excerpt, setExcerpt] = useState(post?.excerpt || "")
  const [categoryId, setCategoryId] = useState(post?.categoryId || "")
  const [language, setLanguage] = useState<"ES" | "EN">(post?.language || "ES")
  const [status, setStatus] = useState<PostStatus>(post?.status || "DRAFT")
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featuredImageUrl || null)
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || "")
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || "")
  
  // Estados de validación
  const [slugTouched, setSlugTouched] = useState(false)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugIsUnique, setSlugIsUnique] = useState<boolean | null>(null)

  // Manejar hidratación del cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-generar slug desde título
  useEffect(() => {
    if (!isEdit && !slugTouched && title) {
      generateSlugAction(title).then(newSlug => {
        setSlug(newSlug)
      })
    }
  }, [title, slugTouched, isEdit])

  // Verificar unicidad del slug con debounce
  useEffect(() => {
    if (!slug) {
      setSlugIsUnique(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true)
      try {
        const result = await checkSlugAction(
          slug, 
          language as "ES" | "EN", 
          post?.id
        )
        if (result.success) {
          setSlugIsUnique(result.isUnique)
        }
      } catch (error) {
        console.error("Error checking slug:", error)
      } finally {
        setIsCheckingSlug(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [slug, language, post?.id])

  const handleRegenerateSlug = useCallback(async () => {
    if (title) {
      const newSlug = await generateSlugAction(title)
      setSlug(newSlug)
      setSlugTouched(false)
      toast.info("Slug regenerado")
    }
  }, [title])

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error("El título es requerido")
      return false
    }
    if (!slug.trim()) {
      toast.error("El slug es requerido")
      return false
    }
    if (slugIsUnique === false) {
      toast.error("El slug debe ser único para el idioma seleccionado")
      return false
    }
    if (!categoryId) {
      toast.error("Debes seleccionar una categoría")
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const postData = {
        title: title.trim(),
        slug: slug.trim(),
        content,
        excerpt: excerpt.trim() || null,
        status,
        language: language as "ES" | "EN",
        featuredImageUrl,
        categoryId,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null
      }

      const result = isEdit && post
        ? await updatePostAction(post.id, postData)
        : await createPostAction(postData)

      if (result.success) {
        toast.success(result.message)
        if (!isEdit) {
          router.push(`/admin/posts/${result.post?.id}/edit`)
        } else if (status === "PUBLISHED") {
          router.push("/admin/posts")
        }
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al guardar el post")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={isEdit ? "content" : "basic"} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Datos básicos</TabsTrigger>
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-6">
          {/* Título */}
          <div>
            <Label htmlFor="title">
              Título ({title.length}/200)
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del post"
              maxLength={200}
              className="font-medium"
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug" className="flex items-center gap-2">
              Slug URL
              {isCheckingSlug && <Loader2 className="h-3 w-3 animate-spin" />}
              {!isCheckingSlug && slugIsUnique === true && (
                <Check className="h-3 w-3 text-green-600" />
              )}
              {!isCheckingSlug && slugIsUnique === false && (
                <X className="h-3 w-3 text-red-600" />
              )}
            </Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugTouched(true)
                }}
                placeholder="slug-del-post"
                className={slugIsUnique === false ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRegenerateSlug}
                title="Regenerar slug desde título"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {slugIsUnique === false && (
              <p className="text-sm text-destructive mt-1">
                Este slug ya existe para el idioma seleccionado
              </p>
            )}
          </div>

          {/* Categoría, Idioma y Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Categoría</Label>
              <CategorySelector
                value={categoryId}
                onChange={setCategoryId}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="language">Idioma</Label>
              <Select value={language} onValueChange={(value) => setLanguage(value as "ES" | "EN")}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ES">Español</SelectItem>
                  <SelectItem value="EN">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as PostStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                      Borrador
                    </div>
                  </SelectItem>
                  <SelectItem value="PUBLISHED">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      Publicado
                    </div>
                  </SelectItem>
                  <SelectItem value="ARCHIVED">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                      Archivado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resumen */}
          <div>
            <Label htmlFor="excerpt">
              Resumen ({excerpt.length}/300)
            </Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Breve descripción del post..."
              maxLength={300}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Aparecerá en el listado del blog y redes sociales
            </p>
          </div>

          {/* Imagen destacada */}
          <PostImageUpload
            imageUrl={featuredImageUrl}
            onImageChange={setFeaturedImageUrl}
            postId={post?.id}
          />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          {isMounted ? (
            <DynamicPostEditor
              content={content}
              onChange={setContent}
              onSave={handleSave}
            />
          ) : (
            <PostEditorSkeleton />
          )}
        </TabsContent>


        <TabsContent value="seo" className="space-y-4 mt-6">
          <div>
            <Label htmlFor="seo-title">
              Título SEO ({seoTitle.length}/60)
            </Label>
            <Input
              id="seo-title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title || "Título para motores de búsqueda"}
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Si está vacío, se usará el título del post
            </p>
          </div>

          <div>
            <Label htmlFor="seo-description">
              Descripción SEO ({seoDescription.length}/160)
            </Label>
            <Textarea
              id="seo-description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder={excerpt || "Descripción para motores de búsqueda"}
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Si está vacía, se usará el resumen del post
            </p>
          </div>

          {/* Preview SEO */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="text-sm font-semibold mb-2">Vista previa en Google</h4>
            <div className="space-y-1">
              <p className="text-blue-600 text-sm font-medium line-clamp-1">
                {seoTitle || title || "Título del post"}
              </p>
              <p className="text-green-700 text-xs">
                gabizimmer.com/blog/{categories.find(c => c.id === categoryId)?.slug || "categoria"}/{slug || "slug-del-post"}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {seoDescription || excerpt || "Descripción del post que aparecerá en los resultados de búsqueda..."}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Botones de acción */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/posts")}
        >
          Cancelar
        </Button>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving || slugIsUnique === false}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {status === "PUBLISHED" ? (isEdit ? "Actualizar y Publicar" : "Guardar y Publicar") : 
                 status === "ARCHIVED" ? "Archivar" : 
                 "Guardar Borrador"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}