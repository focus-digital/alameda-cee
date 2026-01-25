/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Router } from 'react-router-dom';
import { MemoryHistory } from 'history';
import { AppProviders } from '@/app/providers';
import { AppRouter } from '@/app/router';
import { render } from '@testing-library/react';

type HistoryRouterProps = {
  history: MemoryHistory;
  children: React.ReactNode;
};

function HistoryRouter({ history, children }: HistoryRouterProps) {
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });

  React.useLayoutEffect(() => {
    return history.listen(({ location, action }) => {
      setState({ location, action });
    });
  }, [history]);

  return (
    <Router
      location={state.location}
      navigationType={state.action}
      navigator={history}
    >
      {children}
    </Router>
  );
}

export function renderApp(history: MemoryHistory) {
  return render(
    <AppProviders>
      <HistoryRouter history={history}>
        <AppRouter />
      </HistoryRouter>
    </AppProviders>,
  );
}
