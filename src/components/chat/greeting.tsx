
export function Greeting() {
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto px-8 w-full flex flex-col items-center justify-center text-center"
    >
      <div className="text-2xl font-semibold">
        Hola, soy el asistente de <span className="text-gabi-dark-green font-bold">Gabi Zimmer</span>
      </div>
      <div className="text-2xl text-muted-foreground mt-1">
        ¿En qué te puedo ayudar hoy?
      </div>
      <p className="text-sm text-muted-foreground mt-4 max-w-md">
        Puedo ayudarte con información del blog para sugerirte artículos.
      </p>
    </div>
  )
}