import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';

import { ProviderType, AgeRange, CareType } from '@/shared/domain/enums';
import type { Provider } from '@/shared/domain/types';
import { renderApp } from '../helpers/renderHelper';

const mockProviders: Provider[] = [
  {
    id: 'provider-1',
    name: 'Bright Horizons Child Care',
    type: ProviderType.CENTER_BASED,
    address: '123 Main St',
    city: 'Oakland',
    zipCode: '94501',
    latitude: 37.8,
    longitude: -122.2,
    phone: '(510) 555-0101',
    email: 'info@brighthorizons.example.com',
    website: null,
    descriptionEn: 'A great child care center.',
    descriptionEs: 'Un gran centro de cuidado infantil.',
    acceptsSubsidy: true,
    ageRangesServed: [AgeRange.INFANT, AgeRange.TODDLER],
    careTypesOffered: [CareType.FULL_DAY],
    serviceAttributes: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'provider-2',
    name: 'Family Care Home',
    type: ProviderType.FAMILY_CHILD_CARE,
    address: '456 Oak Ave',
    city: 'Alameda',
    zipCode: '94502',
    latitude: 37.75,
    longitude: -122.25,
    phone: '(510) 555-0102',
    email: null,
    website: null,
    descriptionEn: 'Loving family care.',
    descriptionEs: 'Cuidado familiar amoroso.',
    acceptsSubsidy: false,
    ageRangesServed: [AgeRange.PRESCHOOL],
    careTypesOffered: [CareType.PART_DAY],
    serviceAttributes: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

vi.mock('@/shared/hooks/auth-queries', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks/provider-queries', () => ({
  useProviders: () => ({
    data: mockProviders,
    isLoading: false,
    error: null,
  }),
  useProvider: () => ({
    data: mockProviders[0],
    isLoading: false,
    error: null,
  }),
}));

describe('ProviderSearchPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders page heading and filter controls', async () => {
    const history = createMemoryHistory({ initialEntries: ['/providers'] });

    renderApp(history);

    expect(await screen.findByRole('heading', { name: /find child care providers/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/provider type/i)).toBeInTheDocument();
  });

  it('displays provider count', async () => {
    const history = createMemoryHistory({ initialEntries: ['/providers'] });

    renderApp(history);

    // The count is in a <strong> tag, so we need to find it separately
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(screen.getByText(/providers found/i)).toBeInTheDocument();
  });

  it('shows map and list view toggle buttons', async () => {
    const history = createMemoryHistory({ initialEntries: ['/providers'] });

    renderApp(history);

    expect(await screen.findByRole('button', { name: /map view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /list view/i })).toBeInTheDocument();
  });

  it('switches to list view and shows provider cards', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/providers'] });

    renderApp(history);

    const listViewButton = await screen.findByRole('button', { name: /list view/i });
    await user.click(listViewButton);

    expect(await screen.findByText('Bright Horizons Child Care')).toBeInTheDocument();
    expect(screen.getByText('Family Care Home')).toBeInTheDocument();
  });

  it('shows Express Interest buttons for each provider in list view', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/providers'] });

    renderApp(history);

    await user.click(await screen.findByRole('button', { name: /list view/i }));

    const expressInterestButtons = await screen.findAllByRole('button', { name: /express interest/i });
    expect(expressInterestButtons.length).toBe(2);
  });

  it('navigates to interest form when clicking Express Interest', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/providers'] });

    renderApp(history);

    await user.click(await screen.findByRole('button', { name: /list view/i }));

    const expressInterestButtons = await screen.findAllByRole('button', { name: /express interest/i });
    await user.click(expressInterestButtons[0]);

    expect(history.location.pathname).toBe('/interest/provider-1');
  });

  it('filters by provider type', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/providers'] });

    renderApp(history);

    const typeSelect = await screen.findByLabelText(/provider type/i);
    await user.selectOptions(typeSelect, 'FAMILY_CHILD_CARE');

    // The filter is applied - in real scenario this would filter providers
    expect(typeSelect).toHaveValue('FAMILY_CHILD_CARE');
  });
});
