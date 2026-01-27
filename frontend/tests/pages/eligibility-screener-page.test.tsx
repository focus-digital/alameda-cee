import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';

import { renderApp } from '../helpers/renderHelper';

vi.mock('@/shared/hooks/auth-queries', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('EligibilityScreenerPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders the first step with ZIP code input', async () => {
    const history = createMemoryHistory({ initialEntries: ['/eligibility'] });

    renderApp(history);

    expect(await screen.findByRole('heading', { name: /child care eligibility screener/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/what is your zip code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('shows error for invalid ZIP code', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/eligibility'] });

    renderApp(history);

    const zipInput = await screen.findByLabelText(/what is your zip code/i);
    await user.type(zipInput, '00000');

    expect(screen.getByText(/please enter a valid alameda county zip code/i)).toBeInTheDocument();
  });

  it('allows navigation to step 2 with valid ZIP', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/eligibility'] });

    renderApp(history);

    const zipInput = await screen.findByLabelText(/what is your zip code/i);
    await user.type(zipInput, '94501');

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Step 2 should now be visible
    expect(await screen.findByText(/what is the age of the child/i)).toBeInTheDocument();
  });

  it('completes full flow and shows results', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/eligibility'] });

    renderApp(history);

    // Step 1: ZIP code
    const zipInput = await screen.findByLabelText(/what is your zip code/i);
    await user.type(zipInput, '94501');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: Child info
    await user.click(await screen.findByLabelText(/infant/i));
    await user.click(screen.getByLabelText(/full day/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: Household
    await user.selectOptions(await screen.findByLabelText(/how many people/i), '3');
    await user.click(screen.getByLabelText(/under \$30,000/i));
    await user.click(screen.getByRole('button', { name: /see results/i }));

    // Step 4: Results
    expect(await screen.findByRole('heading', { name: /your screening results/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /find providers/i })).toBeInTheDocument();
  });

  it('navigates to providers page when clicking Find Providers', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/eligibility'] });

    renderApp(history);

    // Complete the flow quickly
    await user.type(await screen.findByLabelText(/what is your zip code/i), '94501');
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.click(await screen.findByLabelText(/infant/i));
    await user.click(screen.getByLabelText(/full day/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.selectOptions(await screen.findByLabelText(/how many people/i), '3');
    await user.click(screen.getByLabelText(/under \$30,000/i));
    await user.click(screen.getByRole('button', { name: /see results/i }));

    // Click Find Providers
    await user.click(await screen.findByRole('button', { name: /find providers/i }));

    expect(history.location.pathname).toBe('/providers');
  });
});
