import { describe, expect, it, beforeEach, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { createMemoryHistory } from 'history';

import { ApplicationStatus, LeaveType, UserRole } from '@/shared/domain/enums';
import { renderApp } from '../helpers/renderHelper';

type MockUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

type MockApplication = {
  id: string;
  userId: string;
  leaveType: LeaveType;
  status: ApplicationStatus;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

let currentUser: MockUser;
let applicationsMock: MockApplication[];

vi.mock('@/shared/hooks/auth-queries', () => {
  return {
    useAuth: () => ({
      user: currentUser,
      isAuthenticated: !!currentUser,
      login: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

vi.mock('@/shared/hooks/application-queries', () => {
  return {
    useApplications: () => ({
      data: applicationsMock,
      isLoading: false,
    }),
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    currentUser = {
      id: 'user-1',
      email: 'agent@example.com',
      firstName: 'Agent',
      lastName: 'User',
      role: UserRole.USER,
    };
    applicationsMock = [];
  });

  it('shows the user first name in the header and home content', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });

    renderApp(history);

    expect(await screen.findByText(/home page/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome back, agent/i)).toBeInTheDocument();
    const banners = await screen.findAllByRole('banner');
    const appHeader = banners[banners.length - 1];
    expect(within(appHeader).getByText(/agent/i)).toBeInTheDocument();
  });

  it('shows summary counts and link', async () => {
    applicationsMock = [
      {
        id: 'app-1',
        userId: 'user-1',
        leaveType: LeaveType.Caregiver,
        status: ApplicationStatus.UNDER_REVIEW,
        startDate: new Date('2025-01-01').toISOString(),
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'app-2',
        userId: 'user-1',
        leaveType: LeaveType.SeriousIllness,
        status: ApplicationStatus.APPROVED,
        startDate: new Date('2025-02-01').toISOString(),
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const history = createMemoryHistory({ initialEntries: ['/'] });

    renderApp(history);

    expect(await screen.findByText(/home page/i)).toBeInTheDocument();
    const summaryText = screen.getByText((content) => content.includes('applications completed'));
    expect(summaryText.textContent).toContain('1 applications completed');
    expect(summaryText.textContent).toContain('1 applications pending');
    expect(screen.getByRole('link', { name: /view or create application/i })).toBeInTheDocument();
  });
});
