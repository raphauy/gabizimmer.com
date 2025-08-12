import { Footer } from "@/components/layout/footer";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      {children}
      <Footer />
    </div>
  )
}