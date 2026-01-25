import type { PrismaClient } from '@prisma/client';

import {
  UserRole,
} from '@/domain/enums.js';
import { AuthService } from '@/service/authService.js';
import { UserService } from '@/service/userService.js';

const DEFAULT_PASSWORD = await AuthService.hashPassword('secret123');

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction([
    prisma.application.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function runDemoSeed(prisma: PrismaClient): Promise<void> {
  console.log('Running demo seed');

  const userService = new UserService(prisma);
  
  await createUsers(userService);

  console.log('Done with demo seed');
}

async function createUsers(userService: UserService) {
  console.log('Creating users'); 
  await userService.ensureUser({
    email: 'jdoe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
    passwordHash: DEFAULT_PASSWORD,
  });
  
  await userService.ensureUser({
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    passwordHash: DEFAULT_PASSWORD,
  });

  console.log('Done creating users');
}
