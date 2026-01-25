// tests/setup.ts
import { Prisma, PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { rm } from 'fs'
import { beforeAll, afterAll, beforeEach } from 'vitest'

export const prisma = new PrismaClient();

beforeAll(async () => {
  console.log('🧹 Clearing database...')
  prisma.$connect();
  const tables = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name NOT LIKE 'sqlite_%'
    AND name NOT LIKE '_prisma%'
  `
  
  for (const { name } of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${name}"`)
  }
  console.log('✅ DB clear complete')
})

// Run after all tests
afterAll(async () => {
  // console.log('🔌 Disconnecting DB...')
  prisma.$disconnect();
  // console.log('✅ DB disconnect complete')
})