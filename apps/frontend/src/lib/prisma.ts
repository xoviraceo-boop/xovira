import { PrismaClient } from '@xovira/database/src/generated/prisma/client';

declare global {
  var prisma: PrismaClient | undefined
}

export const client = globalThis.prisma || new PrismaClient()
//if (process.env.NODE_ENV !== 'production') globalThis.prisma = client

export const prisma = client
export default prisma



