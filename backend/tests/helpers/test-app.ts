// tests/helpers/test-app.ts
import { type FastifyInstance } from 'fastify'
import { buildServer, type ServerDependencies } from '@/server.js'
import { prisma } from './test-setup.js';
import { SESSION_COOKIE_NAME } from '@/api/plugins/userAuth.js';
import { expect } from 'vitest';
import { UserService } from '@/service/userService.js';
import { AuthService } from '@/service/authService.js';

/**
 * Creates a fresh Fastify app instance for testing
 */
export async function createTestApp(): Promise<{ app: FastifyInstance, appDependencies: ServerDependencies }> {
  const userService = new UserService(prisma);
  const authService = new AuthService(prisma);
  const app = buildServer({ logger: false }, { 
    prisma, userService, authService
  });
  
  await app.ready()
  return { app, appDependencies: { userService, authService }};
}

export async function login(app: FastifyInstance, email: string, password: string): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/login',
    payload: { email, password },
  });

  expect(response.statusCode).toBe(200);

  type InjectedCookie = { name: string; value: string };
  const cookies = response.cookies as InjectedCookie[] | undefined;
  const cookieRecord = cookies?.find((cookie) => cookie.name === SESSION_COOKIE_NAME);

  if (!cookieRecord?.value) {
    const header = response.headers['set-cookie'];
    const raw = Array.isArray(header) ? header[0] : header;
    const value = raw?.split(';')[0]?.split('=')[1];
    if (!value) {
      throw new Error('Session cookie not set');
    }
    return `${SESSION_COOKIE_NAME}=${value}`;
  }

  return `${SESSION_COOKIE_NAME}=${cookieRecord.value}`;
}

/**
 * Helper to clear specific tables
 */
export async function clearTable(tableName: string) {
  await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}"`)
}

/**
 * Cleanup helper
 */
export async function closeTestApp(app: FastifyInstance) {
  await app.close()
}
