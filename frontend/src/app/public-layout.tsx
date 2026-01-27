import { Button, Identifier, IdentifierLinkItem, IdentifierLinks, IdentifierMasthead, Link } from '@trussworks/react-uswds';
import { useState, type ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { PublicHeader } from './components/public-header';

type PublicLayoutProps = {
  children?: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>(() => {
    // Check session storage for saved language preference
    const saved = sessionStorage.getItem('cee_language');
    return (saved === 'es' ? 'es' : 'en');
  });

  const handleLanguageChange = (lang: 'en' | 'es') => {
    setLanguage(lang);
    sessionStorage.setItem('cee_language', lang);
  };

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  const loginRoute = isDemoMode ? '/demo-login' : '/login';

  const identifierLinks = language === 'en'
    ? [
        { text: 'About', href: '/about' },
        { text: 'Accessibility', href: '/accessibility' },
        { text: 'Privacy Policy', href: '/privacy' },
      ]
    : [
        { text: 'Acerca de', href: '/about' },
        { text: 'Accesibilidad', href: '/accessibility' },
        { text: 'Politica de Privacidad', href: '/privacy' },
      ];

  return (
    <div className="app-shell">
      <a className="usa-skipnav" href="#main-content">
        {language === 'en' ? 'Skip to main content' : 'Saltar al contenido principal'}
      </a>

      <PublicHeader
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      <main id="main-content" className="app-main padding-bottom-6">
        {children ? children : <Outlet context={{ language }} />}
      </main>

      <Identifier className="app-footer">
        <div className="usa-identifier__container margin-top-3 margin-bottom-2">
          <Button
            type="button"
            outline
            onClick={() => navigate(loginRoute)}
            className="usa-button--inverse font-body-2xs"
          >
            {language === 'en' ? 'Admin Login' : 'Inicio de Admin'}
          </Button>
        </div>
        <IdentifierLinks navProps={{ 'aria-label': 'Important links' }}>
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
