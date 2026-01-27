import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ExtendedNav, Header, Menu, NavDropDownButton, NavMenuButton, Title } from '@trussworks/react-uswds';

type PublicHeaderProps = {
  mobileNavOpen: boolean;
  setMobileNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
  language: 'en' | 'es';
  onLanguageChange: (lang: 'en' | 'es') => void;
}

const translations = {
  en: {
    eligibility: 'Check Eligibility',
    findProviders: 'Find Providers',
    title: 'Alameda CEE Demo',
  },
  es: {
    eligibility: 'Verificar Elegibilidad',
    findProviders: 'Buscar Proveedores',
    title: 'Alameda CEE Demo',
  },
};

const languageLabels = {
  en: 'English',
  es: 'Español',
};

export function PublicHeader({ mobileNavOpen, setMobileNavOpen, language, onLanguageChange }: PublicHeaderProps) {
  const t = translations[language];
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const closeMobileNav = () => setMobileNavOpen(false);

  const languageMenuItems = [
    <a
      key="lang-en"
      onClick={() => {
        onLanguageChange('en');
        setLangMenuOpen(false);
        closeMobileNav();
      }}
      style={{ cursor: 'pointer' }}
    >
      English
    </a>,
    <a
      key="lang-es"
      onClick={() => {
        onLanguageChange('es');
        setLangMenuOpen(false);
        closeMobileNav();
      }}
      style={{ cursor: 'pointer' }}
    >
      Español
    </a>,
  ];

  const primaryNavItems = [
    <RouterLink key="nav_eligibility" className="usa-nav__link" to="/eligibility" onClick={closeMobileNav}>
      <span>{t.eligibility}</span>
    </RouterLink>,
    <RouterLink key="nav_providers" className="usa-nav__link" to="/providers" onClick={closeMobileNav}>
      <span>{t.findProviders}</span>
    </RouterLink>,
    <>
      <NavDropDownButton
        key="lang-menu"
        menuId="language-menu"
        isOpen={langMenuOpen}
        onToggle={() => setLangMenuOpen(prev => !prev)}
        label={languageLabels[language]}
      />
      <Menu
        id="language-menu"
        items={languageMenuItems}
        isOpen={langMenuOpen}
      />
    </>,
  ];

  const secondaryNavItems: React.ReactNode[] = [];

  const toggleMobileNav = (): void => {
    setMobileNavOpen(prevOpen => !prevOpen);
  };

  return (
    <Header basic showMobileOverlay={mobileNavOpen}>
      <div className="usa-nav-container">
        <div className="usa-navbar">
          <Title id="basic-logo">
            <RouterLink to="/" title="Home" aria-label="Home">
              {t.title}
            </RouterLink>
          </Title>
          <NavMenuButton onClick={toggleMobileNav} label="Menu" />
        </div>
        <ExtendedNav
          aria-label="Primary navigation"
          primaryItems={primaryNavItems}
          secondaryItems={secondaryNavItems}
          onToggleMobileNav={toggleMobileNav}
          mobileExpanded={mobileNavOpen}
        />
      </div>
    </Header>
  );
}
