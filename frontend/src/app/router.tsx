import { Suspense } from 'react'
import { Navigate, useLocation, useRoutes } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/auth-queries'
import { AppLayout } from './layout';
import { HomePage } from '@/pages/home/home-page';
import { ApplicationsPage } from '@/pages/applications/applications-page';
import { LoginPage } from '@/pages/auth/login-page';
import { DemoLoginPage } from '@/pages/auth/demo-login-page';
import { AssistancePage } from '@/pages/ai/assistance-page';
import { NotFoundPage } from '@/pages/not-found-page';

const ROUTES = [    
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: '/applications',
        element: <ApplicationsPage />
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/demo-login',
        element: <DemoLoginPage />,
      },
      {
        path: '/assistance',
        element:<AssistancePage />
      }
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

  console.log('location.pathname', location.pathname, !!user, isAlreadyOnLogin);

  const next = `${location.pathname}${location.search}${location.hash}`
  if (!user && !isAlreadyOnLogin) {
    return <Navigate to={loginRoute} replace state={{ from: next }} />
  }
  else if (user && isAlreadyOnLogin) {
    console.log('go to /');
    return <Navigate to="/" replace state={{ from: next }} />
  }  

  return <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>
}
