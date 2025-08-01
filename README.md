# gabizimmer.com

Sitio web personal de Gabi Zimmer - Comunicadora de vinos, fundadora de @tinta.wine.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL + Prisma
- NextAuth.js v5 (OTP)
- Resend (emails)

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Configurar base de datos
pnpm prisma db push
pnpm prisma db seed

# Ejecutar
pnpm dev
```

## Variables de entorno

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@gabizimmer.com"
```

## Comandos

```bash
pnpm run lint      # Linting
pnpm run typecheck # Verificar tipos
pnpm run build     # Compilar
```

