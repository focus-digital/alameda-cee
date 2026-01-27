import type { User } from "@/shared/domain/types"
import { useState } from 'react';
import { ExtendedNav, Header, Menu, NavDropDownButton, NavMenuButton, Title } from '@trussworks/react-uswds';

type HeaderProps = {
  user: User | null;
  mobileNavOpen: boolean;
  setMobileNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
}

export function PageHeader({ user, mobileNavOpen, setMobileNavOpen, onLogout }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuItems = [
    <a key="logout" onClick={onLogout} style={{ cursor: 'pointer' }}>
      Logout
    </a>
  ];

  const primaryNavItems = [
    <>
      <NavDropDownButton
        key="userMenu"
        menuId="user-menu"
        isOpen={userMenuOpen}
        onToggle={() => setUserMenuOpen(prev => !prev)}
        label={user?.firstName ?? user?.email ?? 'Account'}
      />
      <Menu
        id="user-menu"
        items={userMenuItems}
        isOpen={userMenuOpen}
      />
    </>
  ];
  const secondaryNavItems: React.ReactNode[] = []

  const toggleMobileNav = (): void => {
    setMobileNavOpen(prevOpen => !prevOpen);
  };

  return (
    <Header basic showMobileOverlay={mobileNavOpen}>
      <div className="usa-nav-container">
        <div className="usa-navbar">
          <Title id="basic-logo">
            <a href="/demo-login" title="Admin Login" aria-label="Admin Login">
              {'Alameda CEE Demo'}
            </a>
          </Title>
          {user !== null && (
            <NavMenuButton onClick={toggleMobileNav} label="Menu" />
          )}
        </div>
        {(user !== null) && (
          <ExtendedNav aria-label="Primary navigation" primaryItems={primaryNavItems} secondaryItems={secondaryNavItems} onToggleMobileNav={toggleMobileNav} mobileExpanded={mobileNavOpen}>
          </ExtendedNav>
        )}        
      </div>
    </Header>
  )
}
