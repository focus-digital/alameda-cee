import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';

import { createTestApp, login, closeTestApp, clearTable } from '../helpers/test-app.js';
import { prisma } from '../helpers/test-setup.js';
import { AuthService } from '@/service/authService.js';
import { ApplicationStatus, LeaveType } from '@/domain/enums.js';

describe('Application routes', () => {
  let app: FastifyInstance | undefined;
  let userCookie: string;
  let adminCookie: string;

  beforeAll(async () => {
    await clearTable('Application');
    await clearTable('User');
    const passwordHash = await AuthService.hashPassword('super-secret');
    const adminPasswordHash = await AuthService.hashPassword('super-admin');

    await prisma.user.create({
      data: {
        email: 'applicant@example.com',
        firstName: 'Applicant',
        lastName: 'User',
        role: 'USER',
        passwordHash,
      },
    });

    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        passwordHash: adminPasswordHash,
      },
    });

    ({ app } = await createTestApp());
    userCookie = await login(app, 'applicant@example.com', 'super-secret');
    adminCookie = await login(app, 'admin@example.com', 'super-admin');
  });

  beforeEach(async () => {
    await clearTable('Application');
  });

  it('allows a user to submit and list their own applications', async () => {
    const submitResponse = await app!.inject({
      method: 'POST',
      url: '/applications',
      headers: { cookie: userCookie },
      payload: {
        leaveType: LeaveType.ChildBirthBonding,
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2025-01-10T00:00:00.000Z',
      },
    });

    expect(submitResponse.statusCode).toBe(201);
    const created = submitResponse.json();
    expect(created.status).toBe(ApplicationStatus.UNDER_REVIEW);

    const listResponse = await app!.inject({
      method: 'GET',
      url: '/applications',
      headers: { cookie: userCookie },
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toHaveLength(1);
    expect(listResponse.json()[0].userId).toBe(created.userId);
  });

  it('returns all applications for admins with pending included', async () => {
    // Create two applications, then adjudicate one
    const first = await app!.inject({
      method: 'POST',
      url: '/applications',
      headers: { cookie: userCookie },
      payload: {
        leaveType: LeaveType.SeriousIllness,
        startDate: '2025-02-01T00:00:00.000Z',
      },
    });
    const firstId = first.json().id;

    await app!.inject({
      method: 'POST',
      url: `/applications/${firstId}/adjudicate`,
      headers: { cookie: adminCookie },
      payload: { status: ApplicationStatus.APPROVED },
    });

    await app!.inject({
      method: 'POST',
      url: '/applications',
      headers: { cookie: userCookie },
      payload: {
        leaveType: LeaveType.Caregiver,
        startDate: '2025-03-01T00:00:00.000Z',
      },
    });

    const adminList = await app!.inject({
      method: 'GET',
      url: '/applications',
      headers: { cookie: adminCookie },
    });

    const adminItems = adminList.json();
    const statuses = adminItems.map((item: any) => item.status);
    expect(statuses).toContain(ApplicationStatus.UNDER_REVIEW);
    expect(statuses).toContain(ApplicationStatus.APPROVED);
    expect(adminItems).toHaveLength(2);
  });

  it('allows users to withdraw their own applications and blocks others', async () => {
    const response = await app!.inject({
      method: 'POST',
      url: '/applications',
      headers: { cookie: userCookie },
      payload: {
        leaveType: LeaveType.ChildBirthRecovery,
        startDate: '2025-04-01T00:00:00.000Z',
      },
    });
    const applicationId = response.json().id;

    const withdrawResponse = await app!.inject({
      method: 'POST',
      url: `/applications/${applicationId}/withdraw`,
      headers: { cookie: userCookie },
    });

    expect(withdrawResponse.statusCode).toBe(200);
    expect(withdrawResponse.json().status).toBe(ApplicationStatus.WITHDRAWN);

    const adminWithdraw = await app!.inject({
      method: 'POST',
      url: `/applications/${applicationId}/withdraw`,
      headers: { cookie: adminCookie },
    });
    expect(adminWithdraw.statusCode).toBe(403);
  });

  it('allows admins to adjudicate and blocks users', async () => {
    const createResponse = await app!.inject({
      method: 'POST',
      url: '/applications',
      headers: { cookie: userCookie },
      payload: {
        leaveType: LeaveType.SeriousSurgery,
        startDate: '2025-05-01T00:00:00.000Z',
      },
    });
    const applicationId = createResponse.json().id;

    const userAdjudicate = await app!.inject({
      method: 'POST',
      url: `/applications/${applicationId}/adjudicate`,
      headers: { cookie: userCookie },
      payload: { status: ApplicationStatus.DENIED },
    });
    expect(userAdjudicate.statusCode).toBe(403);

    const adminAdjudicate = await app!.inject({
      method: 'POST',
      url: `/applications/${applicationId}/adjudicate`,
      headers: { cookie: adminCookie },
      payload: { status: ApplicationStatus.DENIED },
    });
    expect(adminAdjudicate.statusCode).toBe(200);
    expect(adminAdjudicate.json().status).toBe(ApplicationStatus.DENIED);
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app);
    }
    await clearTable('Application');
    await clearTable('User');
  });
});
