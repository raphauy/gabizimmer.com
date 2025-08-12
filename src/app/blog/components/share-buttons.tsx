'use client'

import { Button } from '@/components/ui/button'
import { Facebook, Twitter, Linkedin, Link2, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [shareUrls, setShareUrls] = useState<{
    twitter: string
    facebook: string
    linkedin: string
    fullUrl: string
  } | null>(null)
  
  useEffect(() => {
    // Construir URLs solo en el cliente para evitar hidratación incorrecta
    const origin = window.location.origin
    const fullUrl = `${origin}${url}`
    const encodedUrl = encodeURIComponent(fullUrl)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = encodeURIComponent(description || '')
    
    setShareUrls({
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
      fullUrl
    })
  }, [url, title, description])
  
  const handleCopyLink = async () => {
    if (!shareUrls) return
    
    try {
      await navigator.clipboard.writeText(shareUrls.fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }
  
  // No renderizar botones hasta que las URLs estén listas (evita hidratación incorrecta)
  if (!shareUrls) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Compartir este artículo</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-9 h-9 rounded-md border bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <h3 className="text-lg font-semibold">Compartir este artículo</h3>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          asChild
          className="hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]"
        >
          <a
            href={shareUrls.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir en Twitter"
          >
            <Twitter className="h-4 w-4" />
          </a>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          asChild
          className="hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]"
        >
          <a
            href={shareUrls.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir en Facebook"
          >
            <Facebook className="h-4 w-4" />
          </a>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          asChild
          className="hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]"
        >
          <a
            href={shareUrls.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir en LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyLink}
          className="hover:bg-wine-primary/10 hover:text-wine-primary hover:border-wine-primary"
          aria-label="Copiar enlace"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}