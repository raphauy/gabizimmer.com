'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CategorySelectorProps {
  categories: Array<{ slug: string; name: string }>
  currentCategory?: string
}

export function CategorySelector({ 
  categories, 
  currentCategory
}: CategorySelectorProps) {
  const router = useRouter()
  const currentValue = currentCategory || 'all'
  const visibleCategories = categories.slice(0, 9)
  const remainingCount = categories.length - 9
  
  // Para el dropdown de mobile
  const handleMobileChange = (value: string) => {
    if (value === 'all') {
      router.push('/blog')
    } else {
      router.push(`/blog/${value}`)
    }
  }
  
  return (
    <>
      {/* Desktop - Píldoras horizontales */}
      <div className="hidden md:flex items-center gap-2">
        {visibleCategories.map((category) => (
          <Link
            key={category.slug}
            href={category.slug === 'all' ? '/blog' : `/blog/${category.slug}`}
            className={cn(
              "h-9 px-4 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer inline-flex items-center",
              currentValue === category.slug
                ? "bg-foreground text-background"
                : "hover:bg-foreground hover:text-background"
            )}
          >
            {category.name}
          </Link>
        ))}
        {remainingCount > 0 && (
          <span className="px-3 text-sm text-muted-foreground">
            +{remainingCount}
          </span>
        )}
      </div>

      {/* Mobile - Dropdown */}
      <div className="md:hidden">
        <Select value={currentValue} onValueChange={handleMobileChange}>
          <SelectTrigger className="w-[180px] bg-background border rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}