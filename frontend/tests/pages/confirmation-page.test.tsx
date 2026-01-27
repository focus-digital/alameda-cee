import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
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

describe('ConfirmationPage', () => {
  it('renders thank you message', async () => {
    const history = createMemoryHistory({ initialEntries: ['/confirmation'] });

    renderApp(history);

    expect(await screen.findByRole('heading', { name: /thank you/i })).toBeInTheDocument();
    expect(screen.getByText(/your interest has been submitted successfully/i)).toBeInTheDocument();
  });

  it('shows next steps information', async () => {
    const history = createMemoryHistory({ initialEntries: ['/confirmation'] });

    renderApp(history);

    expect(await screen.findByRole('heading', { name: /what happens next/i })).toBeInTheDocument();
    expect(screen.getByText(/staff member will review/i)).toBeInTheDocument();
  });

  it('shows navigation buttons', async () => {
    const history = createMemoryHistory({ initialEntries: ['/confirmation'] });

    renderApp(history);

    expect(await screen.findByRole('button', { name: /search more providers/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument();
  });

  it('shows disclaimer about demo system', async () => {
    const history = createMemoryHistory({ initialEntries: ['/confirmation'] });

    renderApp(history);

    expect(await screen.findByText(/demonstration system/i)).toBeInTheDocument();
  });
});
