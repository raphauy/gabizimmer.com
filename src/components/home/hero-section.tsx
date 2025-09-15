import Image from 'next/image'

export function HeroSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden">
            <Image
              src="/gabi.jpg"
              alt="Gabi Zimmer"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gabi-dark-green font-jost">
              Gabi Zimmer
            </h1>
            <div className="prose prose-lg max-w-none space-y-4 text-foreground">
              <p className="font-noto-serif">
                Gabi Zimmer es comunicadora, sommelière y educadora certificada WSET, con más de una década de experiencia en el mundo del vino. Fundó Tinta, agencia especializada en marketing digital y comunicación para bodegas, y Tinta Academy, la primera escuela en Uruguay aprobada por WSET, que acerca cualificaciones internacionales a la región.
              </p>
              <p className="font-noto-serif">
                En su recorrido, ha combinado formación académica en Londres con una amplia experiencia internacional, participando como jurado en concursos, desarrollando proyectos para productores de distintos países y liderando iniciativas que buscan tender puentes entre el vino, la educación y la cultura.
              </p>
              <p className="font-noto-serif">
                Actualmente, Gabi es catadora de Tim Atkin MW para Uruguay y Brasil; dirige proyectos de comunicación y enoturismo en América del Sur, trabajando junto a bodegas, instituciones y referentes del sector. Su misión es clara: dar visibilidad a las historias del vino, reducir la brecha digital y abrir nuevas oportunidades para productores y profesionales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}