import { Suspense } from 'react'
import { Navigate, useLocation, useRoutes } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/auth-queries'
import { AppLayout } from './layout';
import { PublicLayout } from './public-layout';
import { LoginPage } from '@/pages/auth/login-page';
import { DemoLoginPage } from '@/pages/auth/demo-login-page';
import { AssistancePage } from '@/pages/ai/assistance-page';
import { NotFoundPage } from '@/pages/not-found-page';
// CEE Family Flow (Public)
import { EligibilityScreenerPage } from '@/pages/family/eligibility-screener-page';
import { ProviderSearchPage } from '@/pages/family/provider-search-page';
import { ConfirmationPage } from '@/pages/family/confirmation-page';
import { InterestFormPage } from '@/pages/family/interest-form-page';
// CEE Admin Flow
import { IntakeDashboardPage } from '@/pages/admin/intake-dashboard-page';
import { InterestDetailPage } from '@/pages/admin/interest-detail-page';

const ROUTES = [
  // Public CEE routes (no auth required)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <EligibilityScreenerPage />,
      },
      {
        path: 'eligibility',
        element: <EligibilityScreenerPage />,
      },
      {
        path: 'providers',
        element: <ProviderSearchPage />,
      },
      {
        path: 'interest/:providerId',
        element: <InterestFormPage />,
      },
      {
        path: 'confirmation',
        element: <ConfirmationPage />,
      },
    ],
  },
  // Authenticated routes (Admin)
  {
    path: '/admin',
    element: <AppLayout />,
    children: [
      {
        path: 'dashboard',
        element: <IntakeDashboardPage />,
      },
      {
        path: 'interests/:id',
        element: <InterestDetailPage />,
      },
    ]
  },
  // Auth routes
  {
    path: '/login',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ]
  },
  {
    path: '/demo-login',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DemoLoginPage />,
      },
    ]
  },
  {
    path: '/assistance',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <AssistancePage />
      },
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export function AppRouter() {
  const location = useLocation();
  const { user } = useAuth();
  const element = useRoutes(ROUTES);

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  const loginRoute = isDemoMode ? '/demo-login' : '/login';
  const isAlreadyOnLogin = location.pathname.includes(loginRoute);

  // Check if current path is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Redirect to login if accessing admin route without auth
  if (isAdminRoute && !user && !isAlreadyOnLogin) {
    const next = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to={loginRoute} replace state={{ from: next }} />
  }

  // Redirect to admin dashboard after login
  if (user && isAlreadyOnLogin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>
}
