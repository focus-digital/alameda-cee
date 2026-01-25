import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';

import { createTestApp, login, closeTestApp, clearTable } from '../helpers/test-app.js';
import { prisma } from '../helpers/test-setup.js';
import { SESSION_COOKIE_NAME } from '@/api/plugins/userAuth.js';
import { AuthService, InvalidCredentialsError } from '@/service/authService.js';

describe('Auth routes', () => {
  let app: FastifyInstance;
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await AuthService.hashPassword('super-secret');
    // Seed a default user
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
  });

  it('logs in and returns a session cookie', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: { email: 'agent@example.com', password: 'super-secret' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      email: 'agent@example.com',
      firstName: 'Agent',
      lastName: 'User',
      role: 'USER',
    });

    const rawCookie = response.cookies.find((c) => c.name === SESSION_COOKIE_NAME);
    expect(rawCookie?.value).toBeDefined();
  });

  it('rejects invalid credentials with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: { email: 'agent@example.com', password: 'wrong' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ error: new InvalidCredentialsError().message });
  });

  it('clears the session on logout', async () => {
    const cookie = await login(app, 'agent@example.com', 'super-secret');

    const response = await app.inject({
      method: 'POST',
      url: '/logout',
      headers: { cookie },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });

    const cleared = response.cookies.find((c) => c.name === SESSION_COOKIE_NAME);
    expect(cleared?.value).toBe('');
  });

  afterAll(async () => {
    await closeTestApp(app);
    await clearTable('User');
  });
});
