import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';

import {
  UserRole,
  InterestStatus,
  AgeRange,
  CareType,
  ContactMethod,
  PreferredLanguage,
  ProviderType,
} from '@/shared/domain/enums';
import type { Interest, Provider, InterestNote } from '@/shared/domain/types';
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

const mockNotes: InterestNote[] = [
  {
    id: 'note-1',
    interestId: 'interest-1',
    authorId: 'admin-1',
    content: 'Called family, left voicemail.',
    createdAt: '2024-01-16T14:00:00.000Z',
  },
];

const mockInterest: Interest = {
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
  contactMethod: ContactMethod.PHONE,
  contactPhone: '(510) 555-1234',
  contactEmail: 'family@example.com',
  preferredLanguage: PreferredLanguage.ENGLISH,
  notes: 'Please contact in the morning.',
  status: InterestStatus.NEW,
  isComplete: true,
  submittedAt: '2024-01-15T10:00:00.000Z',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
  adminNotes: mockNotes,
};

const mockUpdateStatus = vi.fn();
const mockAddNote = vi.fn();

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
    data: [mockInterest],
    isLoading: false,
    error: null,
  }),
  useInterest: () => ({
    data: mockInterest,
    isLoading: false,
    error: null,
  }),
  useUpdateInterestStatus: () => ({
    mutateAsync: mockUpdateStatus,
    isPending: false,
    error: null,
  }),
  useAddInterestNote: () => ({
    mutateAsync: mockAddNote,
    isPending: false,
    error: null,
  }),
  useSubmitInterest: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

describe('InterestDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page heading', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/interests/interest-1'] });

    renderApp(history);

    expect(await screen.findByRole('heading', { name: /interest submission details/i })).toBeInTheDocument();
  });

  it('shows back to dashboard link', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/interests/interest-1'] });

    renderApp(history);

    expect(await screen.findByText(/back to dashboard/i)).toBeInTheDocument();
  });

  it('displays provider information', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/interests/interest-1'] });

    renderApp(history);

    expect(await screen.findByText('Sunshine Child Care')).toBeInTheDocument();
    expect(screen.getByText(/123 main st/i)).toBeInTheDocument();
  });

  it('shows status section with update dropdown', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/interests/interest-1'] });

    renderApp(history);

    expect(await screen.findByRole('heading', { name: /^status$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/update status/i)).toBeInTheDocument();
  });

  it('displays family information', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/interests/interest-1'] });

    renderApp(history);

    expect(await screen.findByRole('heading', { name: /family information/i })).toBeInTheDocument();
    expect(screen.getByText('94501')).toBeInTheDocument();
    expect(screen.getByText(/infant/i)).toBeInTheDocument();
  });

  it('shows contact information', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/interests/interest-1'] });

    renderApp(history);

    expect(await screen.findByRole('heading', { name: /contact information/i })).toBeInTheDocument();
    expect(screen.getByText('(510) 555-1234')).toBeInTheDocument();
    expect(screen.getByText('family@example.com')).toBeInTheDocument();
  });

  it('displays admin notes section', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/interests/interest-1'] });

    renderApp(history);

    expect(await screen.findByRole('heading', { name: /admin notes/i })).toBeInTheDocument();
    expect(screen.getByText(/called family, left voicemail/i)).toBeInTheDocument();
  });

  it('shows add note form', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/interests/interest-1'] });

    renderApp(history);

    expect(await screen.findByLabelText(/add note/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^add note$/i })).toBeInTheDocument();
  });

  it('can update status', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/admin/interests/interest-1'] });

    renderApp(history);

    const statusSelect = await screen.findByLabelText(/update status/i);
    await user.selectOptions(statusSelect, InterestStatus.CONTACTED);

    expect(mockUpdateStatus).toHaveBeenCalledWith({
      id: 'interest-1',
      status: InterestStatus.CONTACTED,
    });
  });

  it('can add a note', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/admin/interests/interest-1'] });

    renderApp(history);

    const noteInput = await screen.findByLabelText(/add note/i);
    await user.type(noteInput, 'Follow up scheduled for tomorrow.');

    const addButton = screen.getByRole('button', { name: /^add note$/i });
    await user.click(addButton);

    expect(mockAddNote).toHaveBeenCalledWith({
      interestId: 'interest-1',
      content: 'Follow up scheduled for tomorrow.',
    });
  });
});
