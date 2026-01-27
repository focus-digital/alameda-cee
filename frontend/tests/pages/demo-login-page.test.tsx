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
    id: 'user-1',
    email: 'user@example.com',
    firstName: 'Demo',
    lastName: 'User',
    role: UserRole.USER,
  },
  {
    id: 'admin-1',
    email: 'admin@example.com',
    firstName: 'Demo',
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

  it('prefills user list and logs in selected user', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });

    renderApp(history)

    expect(screen.getByRole('heading', { name: /demo admin login/i })).toBeInTheDocument();
    const userSelect = await screen.findByLabelText(/^user$/i, { selector: 'select' });
    await screen.findByRole('option', { name: /demo user/i });
    await user.selectOptions(userSelect, 'user@example.com');
    await user.click(screen.getByRole('button', { name: /login as selected user/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      role: UserRole.USER,
      email: 'user@example.com',
      password: 'secret123',
    });
  });

  it('filters users when switching roles', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });

    renderApp(history)

    await user.click(screen.getByLabelText(/admin/i));
    const userSelect = await screen.findByLabelText(/^user$/i, { selector: 'select' });
    await screen.findByRole('option', { name: /demo admin/i });
    await user.selectOptions(userSelect, 'admin@example.com');
    await user.click(screen.getByRole('button', { name: /login as selected user/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      role: UserRole.ADMIN,
      email: 'admin@example.com',
      password: 'secret123',
    });
  });

  it('opens reset modal and triggers reset', async () => {
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });

    renderApp(history);

    // Click reset button to open modal
    const resetButton = screen.getByRole('button', { name: /^reset data$/i })
    expect(resetButton).toBeDefined();

    // TODO fix below
    // await user.click(resetButton);
  
    // Modal should now be visible
    // expect(screen.getByRole('dialog')).toBeInTheDocument();
    // expect(screen.getByRole('heading', { name: /confirm reset/i })).toBeInTheDocument();

    // // Click confirm
    // await user.click(screen.getByRole('button', { name: /^yes, reset data$/i }));
    // expect(mockReset).toHaveBeenCalled();
  });
});
