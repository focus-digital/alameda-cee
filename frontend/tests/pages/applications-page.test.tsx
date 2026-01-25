import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';

import { ApplicationStatus, LeaveType, UserRole } from '@/shared/domain/enums';
import { renderApp } from '../helpers/renderHelper';

const mockSubmit = vi.fn();
const mockWithdraw = vi.fn();
const mockAdjudicate = vi.fn();

let applicationsMock: Array<{
  id: string;
  userId: string;
  leaveType: LeaveType;
  status: ApplicationStatus;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}>;

type MockUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

let currentUser: MockUser;

vi.mock('@trussworks/react-uswds', async (importActual) => {
  const actual = await importActual<typeof import('@trussworks/react-uswds')>();
  // Simplify DatePicker to a plain input to avoid USWDS JS behaviors in tests
  const DatePicker = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
    function DatePicker(props, ref) {
      return <input type="date" ref={ref} {...props} value={props.value ?? ''} />;
    },
  );
  return { ...actual, DatePicker };
});

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
    useSubmitApplication: () => ({
      mutateAsync: mockSubmit,
      isPending: false,
    }),
    useWithdrawApplication: () => ({
      mutateAsync: mockWithdraw,
      isPending: false,
    }),
    useAdjudicateApplication: () => ({
      mutateAsync: mockAdjudicate,
      isPending: false,
    }),
  };
});

describe('ApplicationsPage', () => {
  beforeEach(() => {
    mockSubmit.mockReset();
    mockWithdraw.mockReset();
    mockAdjudicate.mockReset();
    applicationsMock = [];
    currentUser = {
      id: 'user-1',
      email: 'applicant@example.com',
      firstName: 'Applicant',
      lastName: 'User',
      role: UserRole.USER,
    };
  });

  it('lets a user submit a new application', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/applications'] });

    renderApp(history);

    await user.click(screen.getByRole('button', { name: /new application/i }));
    await user.selectOptions(screen.getByLabelText(/leave type/i), LeaveType.Caregiver);
    await user.type(screen.getByLabelText(/start date/i), '2025-01-01');
    await user.type(screen.getByLabelText(/end date/i), '2025-01-05');
    await user.click(screen.getByRole('button', { name: /submit application/i }));

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({
      leaveType: LeaveType.Caregiver,
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-01-05T00:00:00.000Z',
    });
  });

  it('lets a user withdraw a pending application', async () => {
    applicationsMock = [
      {
        id: 'app-1',
        userId: 'user-1',
        leaveType: LeaveType.SeriousSurgery,
        status: ApplicationStatus.UNDER_REVIEW,
        startDate: new Date('2025-02-01').toISOString(),
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/applications'] });

    renderApp(history);

    const pendingTable = await screen.findByText(/pending applications/i);
    const table = pendingTable.closest('section') as HTMLElement;
    await user.click(within(table).getByRole('button', { name: /withdraw/i }));

    expect(mockWithdraw).toHaveBeenCalledWith('app-1');
  });

  it('renders pending and closed applications for a user', async () => {
    applicationsMock = [
      {
        id: 'app-pending',
        userId: 'user-1',
        leaveType: LeaveType.Caregiver,
        status: ApplicationStatus.UNDER_REVIEW,
        startDate: new Date('2025-04-01').toISOString(),
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'app-closed',
        userId: 'user-1',
        leaveType: LeaveType.SeriousIllness,
        status: ApplicationStatus.APPROVED,
        startDate: new Date('2025-03-01').toISOString(),
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const history = createMemoryHistory({ initialEntries: ['/applications'] });

    renderApp(history);

    const pendingSection = screen.getByText(/pending applications/i).closest('section') as HTMLElement;
    const closedSection = screen.getByText(/closed applications/i).closest('section') as HTMLElement;

    const pendingRows = within(pendingSection).getAllByRole('row').slice(1); // skip header
    const closedRows = within(closedSection).getAllByRole('row').slice(1);

    expect(pendingRows).toHaveLength(1);
    expect(closedRows).toHaveLength(1);
    expect(within(pendingRows[0]).getByText(/caregiver/i)).toBeInTheDocument();
    expect(within(closedRows[0]).getByText(/serious illness/i)).toBeInTheDocument();
  });

  it('lets an admin adjudicate a pending application', async () => {
    currentUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    };
    applicationsMock = [
      {
        id: 'app-2',
        userId: 'user-1',
        leaveType: LeaveType.ChildBirthBonding,
        status: ApplicationStatus.UNDER_REVIEW,
        startDate: new Date('2025-03-01').toISOString(),
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/applications'] });

    renderApp(history);

    await user.click(screen.getByRole('button', { name: /approve/i }));

    expect(mockAdjudicate).toHaveBeenCalledWith({
      id: 'app-2',
      status: ApplicationStatus.APPROVED,
    });
  });

  it('shows admin pending rows', async () => {
    currentUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    };
    applicationsMock = [
      {
        id: 'app-3',
        userId: 'user-1',
        leaveType: LeaveType.AdoptionBonding,
        status: ApplicationStatus.UNDER_REVIEW,
        startDate: new Date('2025-06-01').toISOString(),
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'app-4',
        userId: 'user-1',
        leaveType: LeaveType.SeriousSurgery,
        status: ApplicationStatus.APPROVED,
        startDate: new Date('2025-05-01').toISOString(),
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const history = createMemoryHistory({ initialEntries: ['/applications'] });

    renderApp(history);

    const pendingSection = screen.getByText(/pending applications/i).closest('section') as HTMLElement;
    const pendingRows = within(pendingSection).getAllByRole('row').slice(1);
    expect(pendingRows).toHaveLength(1);
  });

  it('lets an admin deny a pending application', async () => {
    currentUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    };
    applicationsMock = [
      {
        id: 'app-3',
        userId: 'user-1',
        leaveType: LeaveType.AdoptionBonding,
        status: ApplicationStatus.UNDER_REVIEW,
        startDate: new Date('2025-06-01').toISOString(),
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'app-4',
        userId: 'user-1',
        leaveType: LeaveType.SeriousSurgery,
        status: ApplicationStatus.APPROVED,
        startDate: new Date('2025-05-01').toISOString(),
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/applications'] });

    renderApp(history);

    await user.click(screen.getByRole('button', { name: /deny/i }));

    expect(mockAdjudicate).toHaveBeenCalledWith({
      id: 'app-3',
      status: ApplicationStatus.DENIED,
    });
  });
});
