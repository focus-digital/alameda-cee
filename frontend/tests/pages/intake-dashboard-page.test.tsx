import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';

import { UserRole, InterestStatus, AgeRange, CareType, PreferredLanguage, ProviderType } from '@/shared/domain/enums';
import type { Interest, Provider } from '@/shared/domain/types';
import { renderApp } from '../helpers/renderHelper';

const mockProvider: Provider = {
  id: 'provider-1',
  name: 'Sunshine Child Care',
  type: ProviderType.CENTER_BASED,
  address: '123 Main St',
  city: 'Oakland',
  zipCode: '94501',
  latitude: 37.8,
  longitude: -122.2,
  phone: '(510) 555-0101',
  email: null,
  website: null,
  descriptionEn: null,
  descriptionEs: null,
  acceptsSubsidy: true,
  ageRangesServed: [AgeRange.INFANT],
  careTypesOffered: [CareType.FULL_DAY],
  serviceAttributes: null,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockInterests: Interest[] = [
  {
    id: 'interest-1',
    providerId: 'provider-1',
    provider: mockProvider,
    householdZipCode: '94501',
    childAgeRange: AgeRange.INFANT,
    careTypePreference: CareType.FULL_DAY,
    householdSize: 3,
    incomeRange: 'Under $30,000',
    desiredStartDate: '2024-03-01',
    eligibilityIndicator: 'LIKELY_ELIGIBLE',
    contactMethod: null,
    contactPhone: '(510) 555-1234',
    contactEmail: 'family@example.com',
    preferredLanguage: PreferredLanguage.ENGLISH,
    notes: null,
    status: InterestStatus.NEW,
    isComplete: true,
    submittedAt: '2024-01-15T10:00:00.000Z',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'interest-2',
    providerId: 'provider-1',
    provider: mockProvider,
    householdZipCode: '94502',
    childAgeRange: AgeRange.TODDLER,
    careTypePreference: CareType.PART_DAY,
    householdSize: 4,
    incomeRange: '$30,000 - $50,000',
    desiredStartDate: null,
    eligibilityIndicator: null,
    contactMethod: null,
    contactPhone: null,
    contactEmail: 'another@example.com',
    preferredLanguage: PreferredLanguage.SPANISH,
    notes: null,
    status: InterestStatus.IN_PROGRESS,
    isComplete: false,
    submittedAt: '2024-01-16T10:00:00.000Z',
    createdAt: '2024-01-16T10:00:00.000Z',
    updatedAt: '2024-01-16T10:00:00.000Z',
  },
];

vi.mock('@/shared/hooks/auth-queries', () => ({
  useAuth: () => ({
    user: {
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks/interest-queries', () => ({
  useInterests: () => ({
    data: mockInterests,
    isLoading: false,
    error: null,
  }),
  useInterest: () => ({
    data: mockInterests[0],
    isLoading: false,
    error: null,
  }),
  useUpdateInterestStatus: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useAddInterestNote: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useSubmitInterest: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

describe('IntakeDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page heading', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/dashboard'] });

    renderApp(history);

    expect(await screen.findByRole('heading', { name: /interest submissions/i })).toBeInTheDocument();
  });

  it('shows submission count', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/dashboard'] });

    renderApp(history);

    // The count is in a <strong> tag, so we need to find it separately
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(screen.getByText(/submissions? found/i)).toBeInTheDocument();
  });

  it('displays status filter dropdown', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/dashboard'] });

    renderApp(history);

    expect(await screen.findByLabelText(/filter by status/i)).toBeInTheDocument();
  });

  it('shows export CSV button', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/dashboard'] });

    renderApp(history);

    expect(await screen.findByRole('button', { name: /export csv/i })).toBeInTheDocument();
  });

  it('displays submissions table with provider names', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/dashboard'] });

    renderApp(history);

    // Both interests have the same provider, so we use findAllByText
    const providerCells = await screen.findAllByText('Sunshine Child Care');
    expect(providerCells.length).toBe(2);
  });

  it('shows status tags for submissions', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/dashboard'] });

    renderApp(history);

    // Wait for table to render
    await screen.findByRole('table');
    // Check for status tags within the table
    const newTags = screen.getAllByText('New');
    expect(newTags.length).toBeGreaterThanOrEqual(1);
    const inProgressTags = screen.getAllByText('In Progress');
    expect(inProgressTags.length).toBeGreaterThanOrEqual(1);
  });

  it('has view links for each submission', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/dashboard'] });

    renderApp(history);

    const viewButtons = await screen.findAllByRole('button', { name: /view/i });
    expect(viewButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('can filter by status', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/admin/dashboard'] });

    renderApp(history);

    const statusFilter = await screen.findByLabelText(/filter by status/i);
    await user.selectOptions(statusFilter, 'NEW');

    expect(statusFilter).toHaveValue('NEW');
  });
});
