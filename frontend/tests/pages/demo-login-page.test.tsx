import { describe, expect, it, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';

import { UserRole } from '@/shared/domain/enums';
import type { User } from '@/shared/domain/types';
import { renderApp } from '../helpers/renderHelper';

const { mockLogin, mockReset, mockGetDemoUsers } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockReset: vi.fn(),
  mockGetDemoUsers: vi.fn(),
}));

const demoUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@example.com',
    firstName: 'Demo',
    lastName: 'Admin',
    role: UserRole.ADMIN,
  },
  {
    id: 'admin-2',
    email: 'admin2@example.com',
    firstName: 'Second',
    lastName: 'Admin',
    role: UserRole.ADMIN,
  },
];

vi.mock('@/shared/hooks/auth-queries', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: mockLogin,
    logout: vi.fn(),
  }),
}));

vi.mock('@/shared/api/demo-api', () => ({
  getDemoUsers: mockGetDemoUsers,
  resetDemoData: mockReset,
}));

describe('DemoLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDemoUsers.mockResolvedValue(demoUsers);
    mockReset.mockResolvedValue(undefined);
  });

  it('prefills admin list and logs in selected admin', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });

    renderApp(history)

    expect(screen.getByRole('heading', { name: /demo admin login/i })).toBeInTheDocument();
    const userSelect = await screen.findByLabelText(/^user$/i, { selector: 'select' });
    await screen.findByRole('option', { name: /demo admin/i });
    await user.selectOptions(userSelect, 'admin@example.com');
    await user.click(screen.getByRole('button', { name: /login as selected admin/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'secret123',
    });
  });

  it('can select different admin from dropdown', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });

    renderApp(history)

    const userSelect = await screen.findByLabelText(/^user$/i, { selector: 'select' });
    await screen.findByRole('option', { name: /second admin/i });
    await user.selectOptions(userSelect, 'admin2@example.com');
    await user.click(screen.getByRole('button', { name: /login as selected admin/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'admin2@example.com',
      password: 'secret123',
    });
  });

  it('shows reset demo data button', async () => {
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });

    renderApp(history);

    // Verify reset button exists
    const resetButton = screen.getByRole('button', { name: /reset demo data/i })
    expect(resetButton).toBeDefined();
  });
});
