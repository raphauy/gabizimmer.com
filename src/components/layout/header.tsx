"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { ThemeToggleIcon } from "@/components/theme-toggle-icon"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function Header() {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  
  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'Sobre Gabi' }
  ]
  
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {mounted ? (
              <Image
                src={resolvedTheme === 'dark' 
                  ? '/logos/gabi-zimmer-logo-amarillo.png'
                  : '/logos/gabi-zimmer-logo.png'}
                alt="Gabi Zimmer"
                width={100}
                height={32}
                className="h-8 w-auto object-contain"
                priority
                unoptimized
              />
            ) : (
              <div className="h-10 w-[120px] animate-pulse bg-muted rounded" />
            )}
          </Link>
          
          {/* Nav + Theme Toggle */}
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {navItems.map(item => {
                const isActive = pathname === item.href || 
                               (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive 
                        ? "text-foreground" 
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <ThemeToggleIcon />
          </div>
        </div>
      </div>
    </header>
  )
}