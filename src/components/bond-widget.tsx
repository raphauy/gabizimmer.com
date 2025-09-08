'use client'

import { useEffect } from 'react'

export function BondWidget() {
  useEffect(() => {
    const iframe = document.createElement('iframe')
    iframe.src = 'https://bondsquad.ai/widget/gabi-zimmer/blog'
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = 'none'
    iframe.style.borderRadius = '12px'
    iframe.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    iframe.title = 'Chat de soporte'
    
    const container = document.getElementById('bond-widget-blog')
    if (container) {
      container.appendChild(iframe)
    }
  }, [])

  return (
    <div 
      id="bond-widget-blog" 
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}
    />
  )
}