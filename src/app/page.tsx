import { Button } from "@/components/ui/button"
import { Instagram, Book, Wine } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Gabi Zimmer</h1>
        <p className="text-2xl text-muted-foreground mb-8">
          <Wine className="inline w-6 h-6 mr-2" />
          Comunico sobre vinos
        </p>
        
        <div className="space-y-4 mb-12">
          <p>✨ Fundadora @tinta.wine</p>
          <p>🇺🇾 Somm, Educadora & Autora de #uruguayenvinos</p>
          <p>🍃 Catadora para Tim Atkin MW</p>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-8 mb-8 border border-purple-200/50 dark:border-purple-800/30 shadow-sm">
          <h2 className="text-3xl font-semibold mb-4">
            Estamos construyendo el nuevo sitio de gabizimmer.com
          </h2>
          <p className="text-muted-foreground">
            Pronto encontrarás aquí contenido sobre vinos, catas y más
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button asChild className="w-32">
            <a href="https://instagram.com/gabizimmer__" target="_blank" rel="noopener noreferrer">
              <Instagram className="w-4 h-4 mr-2" />
              Instagram
            </a>
          </Button>
          <Button asChild className="w-32">
            <a href="https://libro.uruguayenvinos.com" target="_blank" rel="noopener noreferrer">
              <Book className="w-4 h-4 mr-2" />
              Mi Libro
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
