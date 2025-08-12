'use client'

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Monitor, Tablet, Smartphone } from "lucide-react"

type Viewport = 'mobile' | 'tablet' | 'desktop'

interface PostPreviewViewportProps {
  viewport: Viewport
  onViewportChange: (viewport: Viewport) => void
}

export function PostPreviewViewport({ viewport, onViewportChange }: PostPreviewViewportProps) {
  return (
    <div className="flex items-center justify-center mb-4">
      <ToggleGroup 
        type="single" 
        value={viewport}
        onValueChange={(value) => value && onViewportChange(value as Viewport)}
        variant="outline"
      >
        <ToggleGroupItem value="mobile" aria-label="Vista móvil">
          <Smartphone className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="tablet" aria-label="Vista tablet">
          <Tablet className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="desktop" aria-label="Vista escritorio">
          <Monitor className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}