import { Metadata } from "next"
import { Suspense } from 'react'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedPosts } from '@/components/home/featured-posts'
import { PostsSkeleton } from '@/components/home/posts-skeleton'
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: 'Gabi Zimmer | Comunicadora de Vinos',
  description: 'Gabi Zimmer es comunicadora, sommelière y educadora certificada WSET, con más de una década de experiencia en el mundo del vino.',
  keywords: ['Gabi Zimmer', 'vinos uruguayos', 'sommelière', 'WSET', 'comunicación', 'vino', 'Tinta', 'Uruguay'],
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <HeroSection />
        <Suspense fallback={<PostsSkeleton />}>
          <FeaturedPosts />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}