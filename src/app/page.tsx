import { Metadata } from "next"
import { Footer } from "@/components/layout/footer"
import { BondWidget } from "@/components/bond-widget"

export const metadata: Metadata = {
  title: 'Sitio personal de Gabi Zimmer',
  description: 'Sitio personal de Gabi Zimmer, somm, educadora y autora de #uruguayenvinos',
  keywords: ['vinos uruguayos', 'chat', 'Gabi Zimmer', 'maridajes', 'catas', 'tannat', 'asistente virtual'],
}

export default function HomePage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-1 items-center justify-center p-4">
        <BondWidget />
      </div>
      <Footer />
    </div>
  )
}