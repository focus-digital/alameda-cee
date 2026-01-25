import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@trussworks/react-uswds/lib/uswds.css'
import '@trussworks/react-uswds/lib/index.css'
import './index.css'
import App from './App'
import { AppProviders } from './providers'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)