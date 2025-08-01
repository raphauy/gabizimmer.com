import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Role, type User } from "@prisma/client"

// Tipo personalizado para usuarios con role como string (para compatibilidad con NextAuth)
export type UserWithStringRole = Omit<User, 'role'> & { role: string }

// ✅ Validaciones al inicio del archivo
export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "Nombre requerido").optional(),
  image: z.string().url().nullable().optional(),
  isOnboarded: z.boolean().optional(),
  role: z.nativeEnum(Role).nullable().optional() // superadmin o colaborador
})

export const updateUserSchema = createUserSchema.partial()

// Tipos derivados de schemas
export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({ 
    where: { id } 
  })
}


/**
 * Obtiene un usuario por email
 */
export async function getUserByEmail(email: string): Promise<UserWithStringRole | null> {
  const user = await prisma.user.findUnique({ 
    where: { email } 
  })
  
  if (!user) return null
  
  // Convertir rol null a cadena vacía para compatibilidad con NextAuth
  return {
    ...user,
    role: user.role || ""
  } as UserWithStringRole
}

/**
 * Obtiene todos los usuarios
 */
export async function getAllUsers(): Promise<UserWithStringRole[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
  
  // Convertir roles null a cadena vacía para compatibilidad con NextAuth
  return users.map(user => ({
    ...user,
    role: user.role || ""
  }) as UserWithStringRole)
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(data: CreateUserData): Promise<User> {
  const validated = createUserSchema.parse(data)
  return await prisma.user.create({
    data: validated
  })
}

/**
 * Actualiza un usuario existente
 */
export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  const validated = updateUserSchema.parse(data)
  return await prisma.user.update({
    where: { id },
    data: validated
  })
}

/**
 * Elimina un usuario
 */
export async function deleteUser(id: string): Promise<User> {
  return await prisma.user.delete({
    where: { id }
  })
}

/**
 * Obtiene un usuario para autenticación (función específica para auth)
 */
export async function getUserForAuth(email: string): Promise<UserWithStringRole | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      isOnboarded: true,
      createdAt: true,
      updatedAt: true
    }
  })
  
  if (!user) return null
  
  // Convertir rol null a cadena vacía para compatibilidad con NextAuth
  return {
    ...user,
    role: user.role || ""
  } as UserWithStringRole
}

/**
 * Crea un colaborador (función específica para invitar colaboradores)
 */
export async function createColaborador(email: string, name?: string): Promise<User> {
  return await createUser({
    email,
    name,
    role: "colaborador"
  })
}

/**
 * Obtiene todos los colaboradores
 */
export async function getColaboradores(): Promise<UserWithStringRole[]> {
  const users = await prisma.user.findMany({
    where: {
      role: "colaborador"
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return users.map(user => ({
    ...user,
    role: user.role || ""
  }) as UserWithStringRole)
}