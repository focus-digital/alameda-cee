import { PrismaClient } from '@prisma/client';
import { runDemoSeed } from '@/util/seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('seed started');
  await runDemoSeed(prisma);
}

main()
  .catch((error) => {
    console.error('Seeding failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
