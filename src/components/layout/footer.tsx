import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna 1: Sobre */}
          <div>
            <h3 className="font-semibold mb-2">Sobre Gabi Zimmer</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Comunicadora especializada en vinos uruguayos, compartiendo historias 
              y conocimiento sobre la vitivinicultura de Uruguay.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com/gabizimmer__" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-wine-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                </svg>
              </a>
              <a 
                href="https://twitter.com/gabizimmer__" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-wine-primary transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/in/gabi-zimmer/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-wine-primary transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h3 className="font-semibold mb-2">Enlaces Rápidos</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/blog/uruguay" className="text-muted-foreground hover:text-wine-primary transition-colors">
                  Uruguay
                </Link>
              </li>
              <li>
                <Link href="/blog/viajes" className="text-muted-foreground hover:text-wine-primary transition-colors">
                  Viajes
                </Link>
              </li>
              <li>
                <Link href="/blog/noticias" className="text-muted-foreground hover:text-wine-primary transition-colors">
                  Noticias
                </Link>
              </li>
              <li>
                <Link href="/blog/opinion" className="text-muted-foreground hover:text-wine-primary transition-colors">
                  Opinión
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Columna 3: Newsletter */}
          <div>
            <h3 className="font-semibold mb-2">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Suscríbete para recibir las últimas novedades sobre vinos uruguayos.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Próximamente disponible
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} Gabi Zimmer. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}