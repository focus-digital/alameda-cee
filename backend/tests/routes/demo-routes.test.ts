import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';

import { createTestApp, closeTestApp, clearTable } from '../helpers/test-app.js';
import { prisma } from '../helpers/test-setup.js';
import { AuthService } from '@/service/authService.js';
import { UserRole } from '@/domain/enums.js';

describe('Demo routes', () => {
  let app: FastifyInstance | undefined;

  beforeAll(async () => {
    process.env.DEMO_MODE = 'true';
    await clearTable('User');
    const passwordHash = await AuthService.hashPassword('demo-pass');
    await prisma.user.create({
      data: {
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        role: UserRole.USER,
        passwordHash,
      },
    });
    ({ app } = await createTestApp());
  });

  it('lists demo users', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: '/demo/users',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((user: any) => user.email === 'demo@example.com')).toBe(true);
  });

  it('resets and seeds the demo database', async () => {
    const response = await app!.inject({
      method: 'POST',
      url: '/demo/reset',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  afterAll(async () => {
    process.env.DEMO_MODE = undefined;
    if (app) {
      await closeTestApp(app);
    }
    await clearTable('User');
  });
});
