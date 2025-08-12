import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">Gabi Zimmer</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Comunico sobre vinos
        </p>
        
        <div className="space-y-2 text-sm">
          <div>✨ Fundadora  <Link href="https://tinta.wine" target="_blank" rel="noopener noreferrer">tinta.wine</Link></div>
          <p>Somm, Educadora & Autora de #uruguayenvinos</p>
          <p>Catadora para Tim Atkin MW</p>
        </div>

        <Link href="/blog" >
          <Button variant="link" className="mt-8">
            Ver Blog
          </Button>
        </Link>
      </div>
    </div>
  )
}
