import '@testing-library/jest-dom';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';

import { UserRole } from '@/shared/domain/enums';
import type { User } from '@/shared/domain/types';
import { renderApp } from '../helpers/renderHelper';
import { queryClient } from '@/shared/hooks/queryClient';

// USWDS Modal uses focus-trap-react which requires real tabbable nodes. In JSDOM
// that requirement is never met, so we replace the trap with a plain passthrough.
vi.mock('focus-trap-react', () => ({
  default: ({ children }: { children: unknown }) => children,
}));

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
    queryClient.clear();
    mockGetDemoUsers.mockResolvedValue(demoUsers);
    mockReset.mockResolvedValue(undefined);
  });

  // Type: Component integration test
  // What this checks: When the page loads, it fetches the list of admins from the server and fills
  // the dropdown automatically. This test makes sure that selecting an admin from the list and
  // clicking "Login" actually sends their email and the demo password to the login service.
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

  // Type: Component integration test
  // What this checks: The dropdown lets you switch between multiple admins. This test makes sure
  // that when you pick a different admin and click "Login", the correct admin's email is sent —
  // not the default or the previously selected one.
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

  // Type: Render / smoke test
  // What this checks: A basic sanity check that the "Reset Demo Data" button is visible on the
  // page. It does not test what happens when the button is clicked — it only confirms the button
  // exists.
  it('shows reset demo data button', async () => {
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });

    renderApp(history);

    // Verify reset button exists
    const resetButton = screen.getByRole('button', { name: /reset demo data/i })
    expect(resetButton).toBeDefined();
  });

  // Type: Integration test
  // What this checks: Clicking "Reset Demo Data" opens a confirmation modal. Confirming calls
  // the reset API and then closes the modal. This verifies the full open → confirm → close cycle.
  it('opens reset modal and confirms data reset', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });
    renderApp(history);

    await screen.findByRole('option', { name: /demo admin/i });

    await user.click(screen.getByRole('button', { name: /reset demo data/i }));
    // USWDS hides/shows the modal via CSS class (not aria-hidden), so we check the wrapper class
    await waitFor(() => expect(screen.getByRole('dialog')).toHaveClass('is-visible'));

    await user.click(screen.getByRole('button', { name: /yes, reset data/i }));
    expect(mockReset).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(screen.getByRole('dialog')).toHaveClass('is-hidden'));
  });

  // Type: Integration test
  // What this checks: Clicking "Cancel" in the reset modal closes the modal without calling the
  // reset API. This verifies that cancelling leaves all data untouched.
  it('cancels reset modal without resetting data', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });
    renderApp(history);

    await screen.findByRole('option', { name: /demo admin/i });

    await user.click(screen.getByRole('button', { name: /reset demo data/i }));
    await waitFor(() => expect(screen.getByRole('dialog')).toHaveClass('is-visible'));

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockReset).not.toHaveBeenCalled();

    await waitFor(() => expect(screen.getByRole('dialog')).toHaveClass('is-hidden'));
  });

  // Type: Integration test
  // What this checks: If the reset API call fails, the page shows an alert message to the user.
  // This ensures failures are never silently swallowed — the user always gets feedback.
  it('shows alert when reset API fails', async () => {
    mockReset.mockRejectedValue(new Error('boom'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });
    renderApp(history);

    await screen.findByRole('option', { name: /demo admin/i });

    await user.click(screen.getByRole('button', { name: /reset demo data/i }));
    await screen.findByRole('heading', { name: /confirm reset/i });
    await user.click(screen.getByRole('button', { name: /yes, reset data/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });
    expect(mockReset).toHaveBeenCalledTimes(1);

    alertSpy.mockRestore();
  });

  // Type: Unit test
  // What this checks: The "Login" button starts out disabled when no admin is selected. This
  // prevents the form from being submitted before the user has made a choice.
  it('disables login button when no admin is selected', async () => {
    mockGetDemoUsers.mockResolvedValue([]);
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });
    renderApp(history);

    await waitFor(() => expect(mockGetDemoUsers).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: /login as selected admin/i })).toBeDisabled();
  });

  // Type: Unit test
  // What this checks: Users who are not admins should never appear in the login dropdown. This
  // prevents non-admin accounts from being selectable on the demo login page.
  it('does not show non-admin users in the dropdown', async () => {
    mockGetDemoUsers.mockResolvedValue([
      ...demoUsers,
      {
        id: 'user-1',
        email: 'regular@example.com',
        firstName: 'Regular',
        lastName: 'User',
        role: UserRole.USER,
      },
    ]);
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });
    renderApp(history);

    await screen.findByRole('option', { name: /demo admin/i });
    expect(screen.queryByRole('option', { name: /regular user/i })).not.toBeInTheDocument();
  });

  // Type: Integration test
  // What this checks: Clicking "Go to Caregiver Home" navigates to the root route without
  // requiring login. This verifies the navigation shortcut works for exploring the caregiver view.
  it('navigates to caregiver home when clicking the shortcut button', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });
    renderApp(history);

    await user.click(screen.getByRole('button', { name: /go to caregiver home/i }));

    expect(history.location.pathname).toBe('/');
  });

  // Type: Unit test
  // What this checks: When the admin list loads, the first admin is automatically pre-selected in
  // the dropdown so the user can log in immediately without having to manually choose.
  it('auto-selects the first admin in the dropdown on load', async () => {
    const history = createMemoryHistory({ initialEntries: ['/demo-login'] });
    renderApp(history);

    const userSelect = await screen.findByLabelText(/^user$/i, { selector: 'select' });
    await screen.findByRole('option', { name: /demo admin/i });

    expect((userSelect as HTMLSelectElement).value).toBe(demoUsers[0].email);
  });
});
