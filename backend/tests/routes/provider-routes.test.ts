import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';

import { createTestApp, closeTestApp, clearTable } from '../helpers/test-app.js';
import { prisma } from '../helpers/test-setup.js';
import { ProviderType, CareType, AgeRange } from '@/domain/enums.js';

describe('Provider routes', () => {
  let app: FastifyInstance | undefined;

  beforeAll(async () => {
    await clearTable('Interest');
    await clearTable('Provider');

    // Create sample providers
    await prisma.provider.createMany({
      data: [
        {
          name: 'Test Family Care',
          type: ProviderType.FAMILY_CHILD_CARE,
          address: '123 Test St',
          city: 'Oakland',
          zipCode: '94601',
          latitude: 37.7751,
          longitude: -122.2246,
          phone: '(510) 555-0001',
          acceptsSubsidy: true,
          ageRangesServed: JSON.stringify([AgeRange.INFANT, AgeRange.TODDLER]),
          careTypesOffered: JSON.stringify([CareType.FULL_DAY]),
          isActive: true,
        },
        {
          name: 'Test Center',
          type: ProviderType.CENTER_BASED,
          address: '456 Test Ave',
          city: 'Oakland',
          zipCode: '94612',
          latitude: 37.8044,
          longitude: -122.2712,
          acceptsSubsidy: true,
          ageRangesServed: JSON.stringify([AgeRange.PRESCHOOL, AgeRange.SCHOOL_AGE]),
          careTypesOffered: JSON.stringify([CareType.FULL_DAY, CareType.BEFORE_AFTER_SCHOOL]),
          isActive: true,
        },
        {
          name: 'Inactive Provider',
          type: ProviderType.CENTER_BASED,
          address: '789 Inactive St',
          city: 'Oakland',
          zipCode: '94601',
          acceptsSubsidy: false,
          ageRangesServed: JSON.stringify([AgeRange.TODDLER]),
          careTypesOffered: JSON.stringify([CareType.PART_DAY]),
          isActive: false,
        },
      ],
    });

    ({ app } = await createTestApp());
  });

  it('returns active providers (public, no auth required)', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: '/providers',
    });

    expect(response.statusCode).toBe(200);
    const providers = response.json();
    // Should only return active providers
    expect(providers).toHaveLength(2);
    expect(providers.every((p: { isActive: boolean }) => p.isActive)).toBe(true);
  });

  it('filters providers by zipCode', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: '/providers?zipCode=94601',
    });

    expect(response.statusCode).toBe(200);
    const providers = response.json();
    expect(providers).toHaveLength(1);
    expect(providers[0].zipCode).toBe('94601');
  });

  it('filters providers by type', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: '/providers?type=CENTER_BASED',
    });

    expect(response.statusCode).toBe(200);
    const providers = response.json();
    expect(providers).toHaveLength(1);
    expect(providers[0].type).toBe(ProviderType.CENTER_BASED);
  });

  it('filters providers by ageRanges', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: '/providers?ageRanges=INFANT',
    });

    expect(response.statusCode).toBe(200);
    const providers = response.json();
    expect(providers).toHaveLength(1);
    expect(providers[0].ageRangesServed).toContain(AgeRange.INFANT);
  });

  it('filters providers by careTypes', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: '/providers?careTypes=BEFORE_AFTER_SCHOOL',
    });

    expect(response.statusCode).toBe(200);
    const providers = response.json();
    expect(providers).toHaveLength(1);
    expect(providers[0].careTypesOffered).toContain(CareType.BEFORE_AFTER_SCHOOL);
  });

  it('returns a single provider by ID (public)', async () => {
    const listResponse = await app!.inject({
      method: 'GET',
      url: '/providers',
    });
    const providers = listResponse.json();
    const providerId = providers[0].id;

    const response = await app!.inject({
      method: 'GET',
      url: `/providers/${providerId}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe(providerId);
  });

  it('returns 404 for non-existent provider', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: '/providers/00000000-0000-0000-0000-000000000000',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe('Provider not found');
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app);
    }
    await clearTable('Interest');
    await clearTable('Provider');
  });
});
