import type { User } from "@/shared/domain/types"
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
    <RouterLink key="primaryNav_0" className="usa-nav__link" to="/"><span>Home</span></RouterLink>,
    <RouterLink key="primaryNav_1" className="usa-nav__link" to="/applications"><span>Applications</span></RouterLink>,
    <RouterLink key="primaryNav_2" className="usa-nav__link" to="/assistance"><span>Help</span></RouterLink>,
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
            <a href="javascript:void(0);" title="Home" aria-label="Home">
              {'<Project title>'}
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
