"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getCategoriesAction } from "./actions"
import { type Category } from "@prisma/client"

interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CategorySelector({ value, onChange, className }: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await getCategoriesAction()
        if (result.success) {
          setCategories(result.categories)
        } else {
          console.error("Error loading categories:", result.error)
        }
      } catch (error) {
        console.error("Error loading categories:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCategories()
  }, [])

  const selectedCategory = categories.find(category => category.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : selectedCategory ? (
            selectedCategory.name
          ) : (
            "Seleccionar categoría..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar categoría..." />
          <CommandList>
            <CommandEmpty>No se encontraron categorías</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onChange(category.id)
                    setOpen(false)
                  }}
                >
                  <Check 
                    className={cn(
                      "mr-2 h-4 w-4", 
                      value === category.id ? "opacity-100" : "opacity-0"
                    )} 
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}