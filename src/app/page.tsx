import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: 'Sitio personal de Gabi Zimmer',
  description: 'Sitio personal de Gabi Zimmer, somm, educadora y autora de #uruguayenvinos',
  keywords: ['vinos uruguayos', 'chat', 'Gabi Zimmer', 'maridajes', 'catas', 'tannat', 'asistente virtual'],
}

// export default function HomePage() {
//   return (
//     <div className="h-[calc(100vh-8rem)]">
//       <ChatInterface />
//     </div>
//   )
// }

export default function HomePage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-1 items-center justify-center">
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
      <Footer />
    </div>
  )
}