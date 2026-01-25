// tests/global-setup.ts
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

export async function setup() {
  console.log('🚀 Global setup - runs ONCE')
  
  process.env.DATABASE_URL = 'file:./test.db'
  
  // Run migrations once
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: 'file:./test.db'
    }
  })
  
  // Connect and verify
  const prisma = new PrismaClient()  
  await prisma.$connect()
  await prisma.$disconnect()
  
  console.log('✅ Global setup complete')
}

export async function teardown() {
  console.log('🧹 Global teardown')  
  const { rm } = await import('fs/promises')
  await rm('./test.db', { force: true })
}