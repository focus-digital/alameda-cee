import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';

import { createTestApp, login, closeTestApp, clearTable } from '../helpers/test-app.js';
import { prisma } from '../helpers/test-setup.js';
import { AuthService } from '@/service/authService.js';
import {
  ProviderType,
  CareType,
  AgeRange,
  InterestStatus,
  ContactMethod,
  PreferredLanguage,
} from '@/domain/enums.js';

describe('Interest routes', () => {
  let app: FastifyInstance | undefined;
  let adminCookie: string;
  let userCookie: string;
  let providerId: string;

  beforeAll(async () => {
    await clearTable('InterestNote');
    await clearTable('Interest');
    await clearTable('Provider');
    await clearTable('User');

    // Create test users
    const passwordHash = await AuthService.hashPassword('super-secret');
    const adminPasswordHash = await AuthService.hashPassword('super-admin');

    await prisma.user.create({
      data: {
        email: 'family@example.com',
        firstName: 'Family',
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

    // Create a test provider
    const provider = await prisma.provider.create({
      data: {
        name: 'Test Provider',
        type: ProviderType.FAMILY_CHILD_CARE,
        address: '123 Test St',
        city: 'Oakland',
        zipCode: '94601',
        acceptsSubsidy: true,
        ageRangesServed: JSON.stringify([AgeRange.INFANT, AgeRange.TODDLER]),
        careTypesOffered: JSON.stringify([CareType.FULL_DAY]),
        isActive: true,
      },
    });
    providerId = provider.id;

    ({ app } = await createTestApp());
    userCookie = await login(app, 'family@example.com', 'super-secret');
    adminCookie = await login(app, 'admin@example.com', 'super-admin');
  });

  beforeEach(async () => {
    await clearTable('InterestNote');
    await clearTable('Interest');
  });

  it('allows public interest submission (no auth required)', async () => {
    const response = await app!.inject({
      method: 'POST',
      url: '/interests',
      payload: {
        providerId,
        householdZipCode: '94601',
        childAgeRange: AgeRange.INFANT,
        careTypePreference: CareType.FULL_DAY,
        householdSize: 3,
        incomeRange: '$30k-$50k',
        contactMethod: ContactMethod.EMAIL,
        contactEmail: 'family@test.com',
        preferredLanguage: PreferredLanguage.ENGLISH,
        notes: 'Test submission',
      },
    });

    expect(response.statusCode).toBe(201);
    const interest = response.json();
    expect(interest.providerId).toBe(providerId);
    expect(interest.status).toBe(InterestStatus.NEW);
    expect(interest.isComplete).toBe(true); // Has all required fields
  });

  it('accepts incomplete interest submissions', async () => {
    const response = await app!.inject({
      method: 'POST',
      url: '/interests',
      payload: {
        providerId, // Only required field
      },
    });

    expect(response.statusCode).toBe(201);
    const interest = response.json();
    expect(interest.isComplete).toBe(false); // Missing required fields for completeness
  });

  it('requires admin auth to list interests', async () => {
    // Create an interest first
    await app!.inject({
      method: 'POST',
      url: '/interests',
      payload: { providerId },
    });

    // No auth should fail
    const noAuthResponse = await app!.inject({
      method: 'GET',
      url: '/interests',
    });
    expect(noAuthResponse.statusCode).toBe(401);

    // User auth should fail
    const userResponse = await app!.inject({
      method: 'GET',
      url: '/interests',
      headers: { cookie: userCookie },
    });
    expect(userResponse.statusCode).toBe(403);

    // Admin auth should succeed
    const adminResponse = await app!.inject({
      method: 'GET',
      url: '/interests',
      headers: { cookie: adminCookie },
    });
    expect(adminResponse.statusCode).toBe(200);
    expect(adminResponse.json()).toHaveLength(1);
  });

  it('allows admin to update interest status', async () => {
    const createResponse = await app!.inject({
      method: 'POST',
      url: '/interests',
      payload: { providerId },
    });
    const interestId = createResponse.json().id;

    const updateResponse = await app!.inject({
      method: 'POST',
      url: `/interests/${interestId}/status`,
      headers: { cookie: adminCookie },
      payload: { status: InterestStatus.IN_PROGRESS },
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json().status).toBe(InterestStatus.IN_PROGRESS);
  });

  it('allows admin to add notes to interest', async () => {
    const createResponse = await app!.inject({
      method: 'POST',
      url: '/interests',
      payload: { providerId },
    });
    const interestId = createResponse.json().id;

    const noteResponse = await app!.inject({
      method: 'POST',
      url: `/interests/${interestId}/notes`,
      headers: { cookie: adminCookie },
      payload: { content: 'Called family, left voicemail' },
    });

    expect(noteResponse.statusCode).toBe(201);
    expect(noteResponse.json().content).toBe('Called family, left voicemail');

    // Verify note appears in interest detail
    const detailResponse = await app!.inject({
      method: 'GET',
      url: `/interests/${interestId}`,
      headers: { cookie: adminCookie },
    });
    expect(detailResponse.json().adminNotes).toHaveLength(1);
  });

  it('exports interests as CSV for admin', async () => {
    await app!.inject({
      method: 'POST',
      url: '/interests',
      payload: {
        providerId,
        contactEmail: 'test@example.com',
      },
    });

    const exportResponse = await app!.inject({
      method: 'GET',
      url: '/interests/export',
      headers: { cookie: adminCookie },
    });

    expect(exportResponse.statusCode).toBe(200);
    expect(exportResponse.headers['content-type']).toBe('text/csv');
    expect(exportResponse.headers['content-disposition']).toContain('interests-export.csv');
    expect(exportResponse.body).toContain('ID,Provider');
  });

  it('returns 404 for non-existent interest', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: '/interests/00000000-0000-0000-0000-000000000000',
      headers: { cookie: adminCookie },
    });

    expect(response.statusCode).toBe(404);
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app);
    }
    await clearTable('InterestNote');
    await clearTable('Interest');
    await clearTable('Provider');
    await clearTable('User');
  });
});
