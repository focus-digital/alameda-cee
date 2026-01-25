import { queryClient } from '@/shared/hooks/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { aiDevtoolsPlugin } from '@tanstack/react-ai-devtools'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const content = (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.VITE_ENV === 'local' ? (
        <>
          <TanStackDevtools
            plugins={[
              {
                name: 'TanStack Query',
                render: <ReactQueryDevtoolsPanel />,
                defaultOpen: true
              },
              aiDevtoolsPlugin(),
            ]}
            // this config is important to connect to the server event bus
            eventBusConfig={{
              connectToServerBus: true,
            }}
          />
        </>
      ) : null}
    </QueryClientProvider>
  );

  return content;
}