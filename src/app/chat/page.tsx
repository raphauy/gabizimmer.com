import { BondWidget } from "@/components/bond-widget"
import { Footer } from "@/components/layout/footer"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat con el Asistente de Vinos | Gabi Zimmer',
  description: 'Conversa con nuestro asistente especializado en vinos uruguayos, maridajes, catas y recomendaciones personalizadas.',
  keywords: ['vinos uruguayos', 'chat', 'Gabi Zimmer', 'maridajes', 'catas', 'tannat', 'asistente virtual'],
}

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-1 items-center justify-center p-4">
        <BondWidget />
      </div>
      <Footer />
    </div>
  )
}