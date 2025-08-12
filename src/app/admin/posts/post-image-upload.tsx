"use client"

import { useState } from "react"
import { uploadFeaturedImage, replaceFeaturedImage } from "@/services/upload-service"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface PostImageUploadProps {
  imageUrl: string | null | undefined
  onImageChange: (url: string | null) => void
  postId?: string
  className?: string
}

export function PostImageUpload({ 
  imageUrl, 
  onImageChange, 
  postId,
  className 
}: PostImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl || null)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = async (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor selecciona un archivo de imagen")
      return
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("La imagen no puede ser mayor a 5MB")
      return
    }

    setIsUploading(true)

    try {
      // Crear preview local inmediato
      const localPreviewUrl = URL.createObjectURL(file)
      setPreviewUrl(localPreviewUrl)

      // Usar un ID temporal si no hay postId
      const uploadId = postId || `temp-${Date.now()}`
      
      // Subir o reemplazar imagen
      const result = imageUrl 
        ? await replaceFeaturedImage({ 
            file, 
            postId: uploadId, 
            currentImageUrl: imageUrl 
          })
        : await uploadFeaturedImage(file, uploadId)

      // Limpiar URL temporal
      URL.revokeObjectURL(localPreviewUrl)
      
      // Actualizar con URL real
      setPreviewUrl(result.url)
      onImageChange(result.url)
      toast.success("Imagen subida exitosamente")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Error al subir la imagen")
      setPreviewUrl(imageUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      await processFile(file)
    } else {
      toast.error("Por favor arrastra un archivo de imagen")
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageChange(null)
    toast.info("Imagen eliminada")
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label htmlFor="featured-image">Imagen Destacada</Label>
        <p className="text-sm text-muted-foreground">
          Imagen principal que aparecerá en el listado del blog (máximo 5MB)
        </p>
      </div>

      {previewUrl ? (
        <div className="relative group">
          <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
            <Image
              src={previewUrl}
              alt="Imagen destacada"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemoveImage}
              disabled={isUploading}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('featured-image')?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Cambiar imagen
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="relative group cursor-pointer"
          onClick={() => !isUploading && document.getElementById('featured-image')?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={cn(
            "aspect-video rounded-lg border-2 border-dashed transition-colors flex items-center justify-center",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
            "bg-muted/50"
          )}>
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Subiendo...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {isDragging ? "Suelta la imagen aquí" : "Arrastra una imagen o haz clic para seleccionar"}
                </span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG o WebP (máx. 5MB)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <input
        id="featured-image"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />
    </div>
  )
}