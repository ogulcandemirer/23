import Head from 'next/head';
import React, { useMemo, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import TransactionModal from '../../components/Tracker/TransactionModal';
import { ExpenseTrackerProvider, Transaction, useExpenseTracker } from '../../contexts/expense-tracker.context';

// ─── Global ──────────────────────────────────────────────────────────────────
const GlobalReset = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
const AppWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
`;

const Sidebar = styled.aside<{ $open: boolean }>`
  width: 256px;
  min-height: 100vh;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    transform: ${({ $open }) => $open ? 'translateX(0)' : 'translateX(-100%)'};
    box-shadow: ${({ $open }) => $open ? '4px 0 24px rgba(0,0,0,0.3)' : 'none'};
  }
`;

const SidebarOverlay = styled.div<{ $visible: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${({ $visible }) => $visible ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 99;
  }
`;

const Logo = styled.div`
  padding: 28px 24px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
`;

const LogoMark = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
`;

const LogoText = styled.span`
  font-size: 1.125rem;
  font-weight: 700;
  color: #fff;
`;

const LogoSub = styled.span`
  font-size: 0.65rem;
  color: #94a3b8;
  display: block;
  margin-top: 1px;
`;

const Nav = styled.nav`
  padding: 16px 12px;
  flex: 1;
`;

const NavLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 12px;
  margin-bottom: 8px;
  margin-top: 16px;
`;

const NavItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: ${({ $active }) => $active ? 'rgba(99, 102, 241, 0.15)' : 'transparent'};
  color: ${({ $active }) => $active ? '#818cf8' : '#94a3b8'};
  font-size: 0.9375rem;
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  position: relative;
  margin-bottom: 2px;

  &:hover {
    background: rgba(255,255,255,0.06);
    color: #e2e8f0;
  }

  ${({ $active }) => $active && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: #6366f1;
      border-radius: 0 3px 3px 0;
    }
  `}
`;

const NavIcon = styled.span`
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
`;

const SidebarBottom = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.08);
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

const UserInfo = styled.div``;

const UserName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
`;

const UserSub = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

const MainArea = styled.main`
  flex: 1;
  margin-left: 256px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const TopBar = styled.header`
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HamburgerBtn = styled.button`
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  @media (max-width: 768px) { display: flex; }
`;

const PageTitle = styled.h1`
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
  &:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); }
  &:active { transform: translateY(0); }
`;

const Content = styled.div`
  padding: 28px 24px;
  flex: 1;

  @media (max-width: 640px) {
    padding: 20px 16px;
  }
`;

// ─── Dashboard Components ─────────────────────────────────────────────────────
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr 1fr; gap: 12px; }
`;

const SummaryCard = styled.div<{ $accent: string }>`
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $accent }) => $accent};
    border-radius: 16px 16px 0 0;
  }
`;

const CardIcon = styled.div<{ $bg: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 12px;
`;

const CardLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
`;

const CardValue = styled.div<{ $color?: string }>`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ $color }) => $color || '#0f172a'};
  line-height: 1.2;

  @media (max-width: 480px) { font-size: 1.2rem; }
`;

const CardSub = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 2px;
`;

const GridTwo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 20px 20px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 700;
  color: #0f172a;
`;

const SectionBadge = styled.span<{ $color: string }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ $color }) => $color};
  background: ${({ $color }) => $color}18;
  padding: 3px 8px;
  border-radius: 6px;
`;

// Monthly Chart
const ChartWrap = styled.div`
  padding: 0 20px 20px;
`;

const ChartBars = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 140px;
`;

const BarGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
`;

const BarInner = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: 3px;
`;

const Bar = styled.div<{ $height: number; $color: string }>`
  flex: 1;
  height: ${({ $height }) => $height}%;
  min-height: 2px;
  background: ${({ $color }) => $color};
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
`;

const BarLabel = styled.div`
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
`;

const ChartLegend = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 12px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
`;

// Category Breakdown
const CategoryList = styled.div`
  padding: 0 20px 20px;
`;

const CategoryRow = styled.div`
  margin-bottom: 14px;
  &:last-child { margin-bottom: 0; }
`;

const CategoryRowTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const CategoryName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
`;

const CategoryDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const CategoryAmt = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
`;

const ProgressBar = styled.div`
  height: 6px;
  background: #f1f5f9;
  border-radius: 99px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ $color }) => $color};
  border-radius: 99px;
  transition: width 0.5s ease;
`;

// Recent / Transaction list
const TxList = styled.div``;

const TxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.1s;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafafa; }
`;

const TxIconWrap = styled.div<{ $type: 'income' | 'expense' }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ $type }) => $type === 'income' ? '#ecfdf5' : '#fff5f5'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
`;

const TxInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TxDesc = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TxMeta = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 2px;
`;

const TxRight = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const TxAmount = styled.div<{ $type: 'income' | 'expense' }>`
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${({ $type }) => $type === 'income' ? '#10b981' : '#ef4444'};
`;

const TxDate = styled.div`
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 2px;
`;

// Transaction actions
const TxActions = styled.div`
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  ${TxItem}:hover & { opacity: 1; }

  @media (max-width: 640px) { opacity: 1; }
`;

const ActionBtn = styled.button<{ $variant?: 'danger' }>`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid ${({ $variant }) => $variant === 'danger' ? '#fecaca' : '#e2e8f0'};
  background: ${({ $variant }) => $variant === 'danger' ? '#fff5f5' : '#f8fafc'};
  color: ${({ $variant }) => $variant === 'danger' ? '#ef4444' : '#64748b'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.15s;
  &:hover {
    background: ${({ $variant }) => $variant === 'danger' ? '#fef2f2' : '#f1f5f9'};
    transform: scale(1.05);
  }
`;

// Filter Bar (Transactions view)
const FilterBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 180px;
  padding: 9px 14px 9px 36px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 12px center;
  color: #0f172a;
  &:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
  &::placeholder { color: #94a3b8; }
`;

const FilterSelect = styled.select`
  padding: 9px 32px 9px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #475569;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center;
  appearance: none;
  cursor: pointer;
  &:focus { outline: none; border-color: #6366f1; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #94a3b8;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  font-size: 0.9375rem;
  color: #64748b;
  font-weight: 500;
`;

const EmptySub = styled.p`
  font-size: 0.8125rem;
  color: #94a3b8;
  margin-top: 4px;
`;

// Confirm Dialog
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ConfirmDialog = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 24px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0,0,0,0.2);
`;

const ConfirmIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 12px;
`;

const ConfirmTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
`;

const ConfirmText = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ConfirmCancelBtn = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #f1f5f9; }
`;

const ConfirmDeleteBtn = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: none;
  background: #ef4444;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #dc2626; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

const CATEGORY_ICONS: Record<string, string> = {
  'Maaş': '💼', 'Freelance': '💻', 'Yatırım': '📈', 'Kira Geliri': '🏠', 'Yan Gelir': '💡', 'Prim': '🏆',
  'Kira': '🏠', 'Market': '🛒', 'Ulaşım': '🚌', 'Fatura': '⚡', 'Restoran': '🍽️', 'Eğlence': '🎭',
  'Sağlık': '🏥', 'Eğitim': '📚', 'Giyim': '👕', 'Alışveriş': '🛍️', 'Spor': '🏋️', 'Sigorta': '🛡️',
};

function getCatIcon(cat: string) {
  return CATEGORY_ICONS[cat] || '💰';
}

// ─── App ──────────────────────────────────────────────────────────────────────
type View = 'dashboard' | 'transactions';

function TrackerApp() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, summary, expenseByCategory, monthlyData } = useExpenseTracker();
  const [view, setView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'' | 'income' | 'expense'>('');
  const [filterCat, setFilterCat] = useState('');

  const maxMonthly = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 1);

  const filteredTx = useMemo(() => {
    return transactions.filter(t => {
      if (filterType && t.type !== filterType) return false;
      if (filterCat && t.category !== filterCat) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterCat, search]);

  const allCategories = useMemo(() => Array.from(new Set(transactions.map(t => t.category))).sort(), [transactions]);

  function openAdd() { setEditTarget(null); setModalOpen(true); }
  function openEdit(t: Transaction) { setEditTarget(t); setModalOpen(true); }
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  function handleDelete(id: string) { setDeleteConfirmId(id); }
  function confirmDelete() { if (deleteConfirmId) { deleteTransaction(deleteConfirmId); setDeleteConfirmId(null); } }
  function cancelDelete() { setDeleteConfirmId(null); }
  function handleSubmit(data: Omit<Transaction, 'id' | 'createdAt'>) {
    if (editTarget) updateTransaction(editTarget.id, data);
    else addTransaction(data);
  }

  const viewLabels: Record<View, string> = { dashboard: 'Genel Bakış', transactions: 'İşlemler' };

  return (
    <AppWrapper>
      <SidebarOverlay $visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Sidebar $open={sidebarOpen}>
        <Logo>
          <LogoMark>
            <LogoIcon>💰</LogoIcon>
            <div>
              <LogoText>FinTrack</LogoText>
              <LogoSub>Gelir & Gider Takip</LogoSub>
            </div>
          </LogoMark>
        </Logo>

        <Nav>
          <NavLabel>Ana Menü</NavLabel>
          {([
            ['dashboard', '📊', 'Genel Bakış'],
            ['transactions', '📋', 'İşlemler'],
          ] as [View, string, string][]).map(([id, icon, label]) => (
            <NavItem key={id} $active={view === id} onClick={() => { setView(id); setSidebarOpen(false); }}>
              <NavIcon>{icon}</NavIcon>
              {label}
            </NavItem>
          ))}

          <NavLabel>Hızlı İşlem</NavLabel>
          <NavItem onClick={() => { openAdd(); setSidebarOpen(false); }}>
            <NavIcon>➕</NavIcon>
            Yeni İşlem Ekle
          </NavItem>
        </Nav>

        <SidebarBottom>
          <UserCard>
            <Avatar>U</Avatar>
            <UserInfo>
              <UserName>Kullanıcı</UserName>
              <UserSub>Kişisel Hesap</UserSub>
            </UserInfo>
          </UserCard>
        </SidebarBottom>
      </Sidebar>

      <MainArea>
        <TopBar>
          <TopBarLeft>
            <HamburgerBtn onClick={() => setSidebarOpen(o => !o)}>☰</HamburgerBtn>
            <PageTitle>{viewLabels[view]}</PageTitle>
          </TopBarLeft>
          <AddBtn onClick={openAdd}>
            <span>+</span>
            <span>Yeni İşlem</span>
          </AddBtn>
        </TopBar>

        <Content>
          {view === 'dashboard' && (
            <>
              {/* Summary Cards */}
              <SummaryGrid>
                <SummaryCard $accent="#10b981">
                  <CardIcon $bg="#ecfdf5">💹</CardIcon>
                  <CardLabel>Toplam Gelir</CardLabel>
                  <CardValue $color="#10b981">₺{fmt(summary.totalIncome)}</CardValue>
                  <CardSub>{transactions.filter(t => t.type === 'income').length} işlem</CardSub>
                </SummaryCard>
                <SummaryCard $accent="#ef4444">
                  <CardIcon $bg="#fff5f5">📉</CardIcon>
                  <CardLabel>Toplam Gider</CardLabel>
                  <CardValue $color="#ef4444">₺{fmt(summary.totalExpense)}</CardValue>
                  <CardSub>{transactions.filter(t => t.type === 'expense').length} işlem</CardSub>
                </SummaryCard>
                <SummaryCard $accent={summary.balance >= 0 ? '#6366f1' : '#f97316'}>
                  <CardIcon $bg={summary.balance >= 0 ? '#eef2ff' : '#fff7ed'}>
                    {summary.balance >= 0 ? '🏦' : '⚠️'}
                  </CardIcon>
                  <CardLabel>Net Bakiye</CardLabel>
                  <CardValue $color={summary.balance >= 0 ? '#6366f1' : '#f97316'}>
                    {summary.balance >= 0 ? '+' : ''}₺{fmt(summary.balance)}
                  </CardValue>
                  <CardSub>{summary.balance >= 0 ? 'Pozitif bakiye' : 'Negatif bakiye'}</CardSub>
                </SummaryCard>
                <SummaryCard $accent="#8b5cf6">
                  <CardIcon $bg="#f5f3ff">📊</CardIcon>
                  <CardLabel>Toplam İşlem</CardLabel>
                  <CardValue>{summary.count}</CardValue>
                  <CardSub>Tüm zamanlar</CardSub>
                </SummaryCard>
              </SummaryGrid>

              {/* Charts Row */}
              <GridTwo>
                {/* Monthly Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Aylık Özet</CardTitle>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <SectionBadge $color="#10b981">Gelir</SectionBadge>
                      <SectionBadge $color="#ef4444">Gider</SectionBadge>
                    </div>
                  </CardHeader>
                  <ChartWrap>
                    <ChartBars>
                      {monthlyData.map((m) => (
                        <BarGroup key={m.month}>
                          <BarInner>
                            <Bar $height={(m.income / maxMonthly) * 100} $color="#10b981" title={`Gelir: ₺${fmt(m.income)}`} />
                            <Bar $height={(m.expense / maxMonthly) * 100} $color="#ef4444" title={`Gider: ₺${fmt(m.expense)}`} />
                          </BarInner>
                          <BarLabel>{m.month}</BarLabel>
                        </BarGroup>
                      ))}
                    </ChartBars>
                    <ChartLegend>
                      <LegendItem><LegendDot $color="#10b981" /> Gelir</LegendItem>
                      <LegendItem><LegendDot $color="#ef4444" /> Gider</LegendItem>
                    </ChartLegend>
                  </ChartWrap>
                </Card>

                {/* Expense by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gider Kategorileri</CardTitle>
                    <SectionBadge $color="#ef4444">Bu Dönem</SectionBadge>
                  </CardHeader>
                  <CategoryList>
                    {expenseByCategory.length === 0 && (
                      <EmptyState style={{ padding: '20px' }}>
                        <EmptyText>Henüz gider yok</EmptyText>
                      </EmptyState>
                    )}
                    {expenseByCategory.slice(0, 5).map((c) => (
                      <CategoryRow key={c.category}>
                        <CategoryRowTop>
                          <CategoryName>
                            <CategoryDot $color={c.color} />
                            {c.category}
                          </CategoryName>
                          <CategoryAmt>₺{fmt(c.amount)}</CategoryAmt>
                        </CategoryRowTop>
                        <ProgressBar>
                          <ProgressFill $width={c.percentage} $color={c.color} />
                        </ProgressBar>
                      </CategoryRow>
                    ))}
                  </CategoryList>
                </Card>
              </GridTwo>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Son İşlemler</CardTitle>
                  <button
                    onClick={() => setView('transactions')}
                    style={{ fontSize: '0.8125rem', color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Tümünü Gör →
                  </button>
                </CardHeader>
                <TxList>
                  {transactions.length === 0 && (
                    <EmptyState>
                      <EmptyIcon>📭</EmptyIcon>
                      <EmptyText>Henüz işlem yok</EmptyText>
                      <EmptySub>Yeni bir işlem ekleyerek başlayın</EmptySub>
                    </EmptyState>
                  )}
                  {transactions.slice(0, 8).map((t) => (
                    <TxItem key={t.id}>
                      <TxIconWrap $type={t.type}>{getCatIcon(t.category)}</TxIconWrap>
                      <TxInfo>
                        <TxDesc>{t.description || t.category}</TxDesc>
                        <TxMeta>{t.category}</TxMeta>
                      </TxInfo>
                      <TxRight>
                        <TxAmount $type={t.type}>{t.type === 'income' ? '+' : '-'}₺{fmt(t.amount)}</TxAmount>
                        <TxDate>{fmtDate(t.date)}</TxDate>
                      </TxRight>
                      <TxActions>
                        <ActionBtn onClick={() => openEdit(t)} title="Düzenle">✏️</ActionBtn>
                        <ActionBtn $variant="danger" onClick={() => handleDelete(t.id)} title="Sil">🗑️</ActionBtn>
                      </TxActions>
                    </TxItem>
                  ))}
                </TxList>
              </Card>
            </>
          )}

          {view === 'transactions' && (
            <>
              <FilterBar>
                <SearchInput
                  type="text"
                  placeholder="İşlem ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FilterSelect value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                  <option value="">Tüm Türler</option>
                  <option value="income">Gelir</option>
                  <option value="expense">Gider</option>
                </FilterSelect>
                <FilterSelect value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
                  <option value="">Tüm Kategoriler</option>
                  {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </FilterSelect>
              </FilterBar>

              <Card>
                <TxList>
                  {filteredTx.length === 0 && (
                    <EmptyState>
                      <EmptyIcon>{search || filterType || filterCat ? '🔍' : '📭'}</EmptyIcon>
                      <EmptyText>{search || filterType || filterCat ? 'Sonuç bulunamadı' : 'Henüz işlem yok'}</EmptyText>
                      <EmptySub>{search || filterType || filterCat ? 'Farklı filtreler deneyin' : 'Yeni bir işlem ekleyerek başlayın'}</EmptySub>
                    </EmptyState>
                  )}
                  {filteredTx.map((t) => (
                    <TxItem key={t.id}>
                      <TxIconWrap $type={t.type}>{getCatIcon(t.category)}</TxIconWrap>
                      <TxInfo>
                        <TxDesc>{t.description || t.category}</TxDesc>
                        <TxMeta>{t.category} • {fmtDate(t.date)}</TxMeta>
                      </TxInfo>
                      <TxRight>
                        <TxAmount $type={t.type}>{t.type === 'income' ? '+' : '-'}₺{fmt(t.amount)}</TxAmount>
                        <TxDate>{t.type === 'income' ? 'Gelir' : 'Gider'}</TxDate>
                      </TxRight>
                      <TxActions>
                        <ActionBtn onClick={() => openEdit(t)} title="Düzenle">✏️</ActionBtn>
                        <ActionBtn $variant="danger" onClick={() => handleDelete(t.id)} title="Sil">🗑️</ActionBtn>
                      </TxActions>
                    </TxItem>
                  ))}
                </TxList>
              </Card>

              {filteredTx.length > 0 && (
                <div style={{ marginTop: 12, textAlign: 'right', fontSize: '0.8125rem', color: '#94a3b8' }}>
                  {filteredTx.length} işlem gösteriliyor
                  {filteredTx.filter(t => t.type === 'income').length > 0 && ` • Gelir: ₺${fmt(filteredTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}`}
                  {filteredTx.filter(t => t.type === 'expense').length > 0 && ` • Gider: ₺${fmt(filteredTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}`}
                </div>
              )}
            </>
          )}
        </Content>
      </MainArea>

      {modalOpen && (
        <TransactionModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          initialData={editTarget}
        />
      )}

      {deleteConfirmId && (
        <Overlay onClick={cancelDelete}>
          <ConfirmDialog onClick={(e) => e.stopPropagation()}>
            <ConfirmIcon>🗑️</ConfirmIcon>
            <ConfirmTitle>İşlemi Sil</ConfirmTitle>
            <ConfirmText>Bu işlemi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</ConfirmText>
            <ConfirmActions>
              <ConfirmCancelBtn onClick={cancelDelete}>İptal</ConfirmCancelBtn>
              <ConfirmDeleteBtn onClick={confirmDelete}>Evet, Sil</ConfirmDeleteBtn>
            </ConfirmActions>
          </ConfirmDialog>
        </Overlay>
      )}
    </AppWrapper>
  );
}

export default function TrackerPage() {
  return (
    <>
      <GlobalReset />
      <Head>
        <title>FinTrack — Gelir & Gider Takip</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Modern gelir ve gider takip sistemi" />
      </Head>
      <ExpenseTrackerProvider>
        <TrackerApp />
      </ExpenseTrackerProvider>
    </>
  );
}
