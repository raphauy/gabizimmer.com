import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear superadmin (Gabi)
  const superadmin = await prisma.user.upsert({
    where: { email: 'gabi@gabizimmer.com' },
    update: {
      role: Role.superadmin,
    },
    create: {
      email: 'gabi@gabizimmer.com',
      name: 'Gabi Zimmer',
      role: Role.superadmin,
      isOnboarded: true,
    },
  })

  console.log('Superadmin (Gabi) created:', superadmin)

  // Crear superadmin (Rapha)
  const rapha = await prisma.user.upsert({
    where: { email: 'rapha.uy@rapha.uy' },
    update: {
      role: Role.superadmin,
    },
    create: {
      email: 'rapha.uy@rapha.uy',
      name: 'Rapha',
      role: Role.superadmin,
      isOnboarded: true,
    },
  })

  console.log('Superadmin (Rapha) created:', rapha)

  // Crear colaborador de ejemplo
  const colaborador = await prisma.user.upsert({
    where: { email: 'colaborador@gabizimmer.com' },
    update: {},
    create: {
      email: 'colaborador@gabizimmer.com',
      name: 'Colaborador de Ejemplo',
      role: Role.colaborador,
      isOnboarded: false,
    },
  })

  console.log('Colaborador created:', colaborador)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })