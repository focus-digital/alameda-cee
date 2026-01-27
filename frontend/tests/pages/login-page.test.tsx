import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import React from 'react';

import { LoginPage } from '@/pages/auth/login-page';
import { renderApp } from '../helpers/renderHelper';

type MockUser = { id: string; email: string; firstName: string; lastName: string; role: 'USER' | 'ADMIN' };

const authState: { user: MockUser | null } = { user: null };
const subscribers = new Set<() => void>();
const loginSpy = vi.fn();
const loginBehavior = { shouldSucceed: true };

function setAuthUser(user: MockUser | null) {
  authState.user = user;
  subscribers.forEach((notify) => notify());
}

vi.mock('@/shared/hooks/auth-queries', () => {
  return {
    useAuth: () => {
      const [user, setUser] = React.useState<MockUser | null>(authState.user);

      React.useEffect(() => {
        const notify = () => setUser(authState.user);
        subscribers.add(notify);
        return () => subscribers.delete(notify);
      }, []);

      return {
        user,
        isAuthenticated: !!user,
        login: async (payload: { email: string; password: string }) => {
          loginSpy(payload);
          if (loginBehavior.shouldSucceed) {
            const nextUser = {
              id: 'user-1',
              email: payload.email,
              firstName: 'Agent',
              lastName: 'User',
              role: 'USER',
            };
            setAuthUser(nextUser);
            return nextUser;
          }

          return null;
        },
        logout: async () => setAuthUser(null),
      };
    },
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    setAuthUser(null);
    loginSpy.mockReset();
    loginBehavior.shouldSucceed = true;
    vi.stubEnv('VITE_DEMO_MODE', 'false');
  });

  it('submits email and password to the auth hook', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.clear(emailInput);
    await user.type(emailInput, 'agent@example.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'super-secret');

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(loginSpy).toHaveBeenCalledTimes(1);
    expect(loginSpy).toHaveBeenCalledWith({
      email: 'agent@example.com',
      password: 'super-secret',
    });
  });

  it('redirects to admin dashboard after a successful login', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/login'] });

    renderApp(history);

    await user.clear(screen.getByLabelText(/email address/i));
    await user.type(screen.getByLabelText(/email address/i), 'agent@example.com');
    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/password/i), 'super-secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(loginSpy).toHaveBeenCalledTimes(1);

    expect(await screen.findByRole('heading', { name: /interest submissions/i })).toBeInTheDocument();
  });

  it('stays on the login page when login fails', async () => {
    loginBehavior.shouldSucceed = false;
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/login'] });

    renderApp(history);

    await user.clear(screen.getByLabelText(/email address/i));
    await user.type(screen.getByLabelText(/email address/i), 'agent@example.com');
    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/password/i), 'super-secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(loginSpy).toHaveBeenCalledTimes(1);
    expect(history.location.pathname).toBe('/login');
    expect(screen.queryByText(/interest submissions/i)).not.toBeInTheDocument();
  });

  it('lets the user toggle password visibility', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
