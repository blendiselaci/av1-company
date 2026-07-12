import { PrismaClient } from '@prisma/client'
import { isDevelopment } from './env'

/** Single shared Prisma client instance for the whole process. */
export const prisma = new PrismaClient({
  log: isDevelopment ? ['warn', 'error'] : ['error'],
})

export async function connectDatabase(): Promise<void> {
  await prisma.$connect()
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}
