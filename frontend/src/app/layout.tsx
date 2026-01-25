import { Identifier, IdentifierLinkItem, IdentifierLinks, IdentifierMasthead, Link } from '@trussworks/react-uswds';
import { useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { PageHeader } from './components/header';
import { useAuth } from '@/shared/hooks/auth-queries';

type AppLayoutProps = {
  children?: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, logout } = useAuth();
  
  const identifierLinks = [
    { text: 'About', href: '/about' },
    { text: 'Contact', href: '/accessibility' },
    { text: 'Privacy policy', href: '/privacy' },
  ];

  return (
    <div className="app-shell">
      <a className="usa-skipnav" href="#main-content">
        Skip to main content
      </a>
      {/* <GovBanner /> */}

      <PageHeader user={user} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} onLogout={() => logout()} />
      
      <div className="app-main">
        {children ? children : <Outlet /> }
      </div>

      <Identifier className="app-footer">
        <IdentifierMasthead aria-label="Agency identifier">
        </IdentifierMasthead>
        <IdentifierLinks navProps={{
        'aria-label': 'Important links'
      }}>
          {identifierLinks.map((link) => (
            <IdentifierLinkItem key={link.text}>
              <Link href={link.href}>{link.text}</Link>
            </IdentifierLinkItem>
          ))}
        </IdentifierLinks>
      </Identifier>
    </div>
  );
}
