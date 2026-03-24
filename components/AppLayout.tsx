import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import styled, { createGlobalStyle } from 'styled-components';
import { useExpenseTracker } from 'contexts/expense-tracker.context';

const AppGlobalStyle = createGlobalStyle`
  :root {
    --app-sidebar-width: 260px;
    --app-header-height: 64px;
    --app-bg: #F1F5F9;
    --app-card: #FFFFFF;
    --app-sidebar-bg: #0F172A;
    --app-sidebar-text: rgba(255,255,255,0.7);
    --app-sidebar-active: #6366F1;
    --app-income: #10B981;
    --app-expense: #EF4444;
    --app-border: #E2E8F0;
    --app-text: #0F172A;
    --app-text-muted: #64748B;
    --app-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.06);
    --app-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.05);
    --app-radius: 12px;
  }
`;

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
}

const navItems = [
  { href: '/app/dashboard', label: 'Panel', icon: <DashboardIcon /> },
  { href: '/app/transactions', label: 'İşlemler', icon: <TransactionsIcon /> },
  { href: '/app/reports', label: 'Raporlar', icon: <ReportsIcon /> },
  { href: '/app/categories', label: 'Kategoriler', icon: <CategoriesIcon /> },
  { href: '/app/settings', label: 'Ayarlar', icon: <SettingsIcon /> },
];

export default function AppLayout({ children, title }: AppLayoutProps) {
  const router = useRouter();
  const { settings } = useExpenseTracker();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  return (
    <>
      <Head>
        <title>{title} | Fintrack</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AppGlobalStyle />
      <LayoutRoot>
        <Overlay $open={sidebarOpen} onClick={() => setSidebarOpen(false)} />
        <Sidebar $open={sidebarOpen}>
          <SidebarHeader>
            <LogoMark>F</LogoMark>
            <LogoText>Fintrack</LogoText>
          </SidebarHeader>

          <Nav>
            {navItems.map((item) => {
              const active = router.pathname === item.href;
              return (
                <NextLink key={item.href} href={item.href} passHref>
                  <NavLink $active={active}>
                    <NavIcon>{item.icon}</NavIcon>
                    <span>{item.label}</span>
                    {active && <ActiveIndicator />}
                  </NavLink>
                </NextLink>
              );
            })}
          </Nav>

          <SidebarFooter>
            <UserAvatar>{settings.userName.charAt(0).toUpperCase()}</UserAvatar>
            <UserInfo>
              <UserName>{settings.userName}</UserName>
              <UserEmail>{settings.email}</UserEmail>
            </UserInfo>
          </SidebarFooter>
        </Sidebar>

        <MainArea>
          <Header>
            <HeaderLeft>
              <HamburgerButton onClick={() => setSidebarOpen(true)} aria-label="Menüyü aç">
                <HamburgerIcon />
              </HamburgerButton>
              <PageTitle>{title}</PageTitle>
            </HeaderLeft>
            <HeaderRight>
              <NextLink href="/app/transactions?add=true" passHref>
                <QuickAddLink>
                  <PlusIcon />
                  <span>İşlem Ekle</span>
                </QuickAddLink>
              </NextLink>
            </HeaderRight>
          </Header>

          <Content>{children}</Content>
        </MainArea>
      </LayoutRoot>
    </>
  );
}

// ──────────── Icons ────────────

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function TransactionsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ──────────── Styled Components ────────────

const LayoutRoot = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--app-bg);
  font-family: 'Poppins', sans-serif;
`;

const Overlay = styled.div<{ $open: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${(p) => (p.$open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }
`;

const Sidebar = styled.nav<{ $open: boolean }>`
  width: var(--app-sidebar-width);
  min-height: 100vh;
  background: var(--app-sidebar-bg);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
  z-index: 999;

  @media (max-width: 768px) {
    position: fixed;
    left: ${(p) => (p.$open ? '0' : '-280px')};
    top: 0;
    height: 100%;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const SidebarHeader = styled.div`
  padding: 2.4rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const LogoMark = styled.div`
  width: 36px;
  height: 36px;
  background: #6366F1;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.6rem;
  flex-shrink: 0;
`;

const LogoText = styled.span`
  color: white;
  font-weight: 700;
  font-size: 1.8rem;
  letter-spacing: -0.5px;
`;

const Nav = styled.div`
  flex: 1;
  padding: 1.6rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const NavLink = styled.a<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.1rem 1.4rem;
  border-radius: 10px;
  color: ${(p) => (p.$active ? '#fff' : 'var(--app-sidebar-text)')};
  background: ${(p) => (p.$active ? 'rgba(99, 102, 241, 0.2)' : 'transparent')};
  text-decoration: none;
  font-size: 1.4rem;
  font-weight: ${(p) => (p.$active ? '600' : '400')};
  transition: all 0.15s;
  position: relative;

  svg {
    color: ${(p) => (p.$active ? '#6366F1' : 'var(--app-sidebar-text)')};
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: white;
    svg { color: white; }
  }
`;

const NavIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActiveIndicator = styled.span`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #6366F1;
  border-radius: 2px 0 0 2px;
`;

const SidebarFooter = styled.div`
  padding: 1.6rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.4rem;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  min-width: 0;
`;

const UserName = styled.p`
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

const UserEmail = styled.p`
  color: var(--app-sidebar-text);
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

const MainArea = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  height: var(--app-header-height);
  background: white;
  border-bottom: 1px solid var(--app-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2.4rem;
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 1.6rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.4rem;
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 0.6rem;
  cursor: pointer;
  color: var(--app-text);
  border-radius: 8px;

  @media (max-width: 768px) {
    display: flex;
  }

  &:hover { background: var(--app-bg); }
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--app-text);
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const QuickAddLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: #6366F1;
  color: white;
  text-decoration: none;
  padding: 0.8rem 1.6rem;
  border-radius: 10px;
  font-size: 1.3rem;
  font-weight: 600;
  transition: background 0.15s, transform 0.15s;

  &:hover {
    background: #4F46E5;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    span { display: none; }
    padding: 0.8rem;
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 2.4rem;

  @media (max-width: 480px) {
    padding: 1.6rem;
  }
`;
