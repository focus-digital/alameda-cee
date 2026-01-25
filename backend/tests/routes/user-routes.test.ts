import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';

import { createTestApp, login, closeTestApp, clearTable } from '../helpers/test-app.js';
import { prisma } from '../helpers/test-setup.js';
import { AuthService } from '@/service/authService.js';

describe('User routes', () => {
  let app: FastifyInstance;
  let cookie: string;

  beforeAll(async () => {
    const passwordHash = await AuthService.hashPassword('super-secret');
    await clearTable('User');
    await prisma.user.create({
      data: {
        email: 'agent@example.com',
        firstName: 'Agent',
        lastName: 'User',
        passwordHash,
        role: 'USER',
      },
    });
    ({ app } = await createTestApp());
    cookie = await login(app, 'agent@example.com', 'super-secret');
  });

  it('returns current user when authenticated', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users/me',
      headers: { cookie },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      email: 'agent@example.com',
      firstName: 'Agent',
      lastName: 'User',
      role: 'USER',
    });
  });

  it('returns 401 when not authenticated', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users/me',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ error: 'Unauthorized' });
  });

  afterAll(async () => {
    await closeTestApp(app);
    await clearTable('User');
  });
});
