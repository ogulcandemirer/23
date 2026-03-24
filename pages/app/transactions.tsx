import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/router';
import AppLayout from 'components/AppLayout';
import { useExpenseTracker } from 'contexts/expense-tracker.context';
import { Transaction, TransactionType } from 'types/expense-tracker';

type FilterType = 'all' | TransactionType;
type SortField = 'date' | 'amount';
type SortDir = 'asc' | 'desc';

const EMPTY_FORM = {
  type: 'expense' as TransactionType,
  amount: '',
  category: '',
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
};

export default function TransactionsPage() {
  const router = useRouter();
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction, formatAmount } = useExpenseTracker();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Open add modal from query param
  useEffect(() => {
    if (router.query.add === 'true') {
      openAddModal();
      router.replace('/app/transactions', undefined, { shallow: true });
    }
  }, [router.query.add]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === form.type || c.type === 'both'),
    [categories, form.type],
  );

  const displayedTransactions = useMemo(() => {
    let result = [...transactions];
    if (search) result = result.filter((t) => t.description.toLowerCase().includes(search.toLowerCase()));
    if (filterType !== 'all') result = result.filter((t) => t.type === filterType);
    if (filterCategory) result = result.filter((t) => t.category === filterCategory);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else cmp = a.amount - b.amount;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [transactions, search, filterType, filterCategory, sortField, sortDir]);

  const totalFiltered = useMemo(
    () => ({
      income: displayedTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: displayedTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }),
    [displayedTransactions],
  );

  function openAddModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }

  function openEditModal(txn: Transaction) {
    setEditingId(txn.id);
    setForm({
      type: txn.type,
      amount: String(txn.amount),
      category: txn.category,
      description: txn.description,
      date: txn.date,
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Geçerli bir tutar girin';
    if (!form.category) e.category = 'Kategori seçin';
    if (!form.description.trim()) e.description = 'Açıklama girin';
    if (!form.date) e.date = 'Tarih seçin';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim(),
      date: form.date,
    };
    if (editingId) updateTransaction(editingId, data);
    else addTransaction(data);
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    deleteTransaction(id);
    setDeleteConfirm(null);
  }

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  }

  const getCat = (id: string) => categories.find((c) => c.id === id);

  return (
    <PageContent>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarLeft>
          <SearchBox>
            <SearchIconWrap><SearchIcon /></SearchIconWrap>
            <SearchInput placeholder="İşlem ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </SearchBox>
          <FilterSelect value={filterType} onChange={(e) => setFilterType(e.target.value as FilterType)}>
            <option value="all">Tümü</option>
            <option value="income">Gelir</option>
            <option value="expense">Gider</option>
          </FilterSelect>
          <FilterSelect value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">Tüm Kategoriler</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </FilterSelect>
        </ToolbarLeft>
        <AddButton onClick={openAddModal}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          İşlem Ekle
        </AddButton>
      </Toolbar>

      {/* Summary Bar */}
      <SummaryBar>
        <SummaryItem>
          <SummaryLabel>Bulunan İşlem</SummaryLabel>
          <SummaryValue>{displayedTransactions.length}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Gelir</SummaryLabel>
          <SummaryValue $color="#10B981">+{formatAmount(totalFiltered.income)}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Gider</SummaryLabel>
          <SummaryValue $color="#EF4444">-{formatAmount(totalFiltered.expense)}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Net</SummaryLabel>
          <SummaryValue $color={totalFiltered.income - totalFiltered.expense >= 0 ? '#10B981' : '#EF4444'}>
            {formatAmount(totalFiltered.income - totalFiltered.expense)}
          </SummaryValue>
        </SummaryItem>
      </SummaryBar>

      {/* Table */}
      <TableCard>
        <TableHeader>
          <THCell style={{ flex: 3 }}>Açıklama</THCell>
          <THCell style={{ flex: 2 }}>Kategori</THCell>
          <THCell style={{ flex: 1, cursor: 'pointer' }} onClick={() => toggleSort('date')}>
            Tarih {sortField === 'date' ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
          </THCell>
          <THCell style={{ flex: 1, cursor: 'pointer', textAlign: 'right' }} onClick={() => toggleSort('amount')}>
            Tutar {sortField === 'amount' ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
          </THCell>
          <THCell style={{ width: 80, flexShrink: 0 }}></THCell>
        </TableHeader>

        {displayedTransactions.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📊</EmptyIcon>
            <p>İşlem bulunamadı</p>
            <EmptyBtn onClick={openAddModal}>İlk İşlemi Ekle</EmptyBtn>
          </EmptyState>
        ) : (
          displayedTransactions.map((txn) => {
            const cat = getCat(txn.category);
            return (
              <TRow key={txn.id}>
                <TCell style={{ flex: 3 }}>
                  <TRowLeft>
                    <TIcon $color={cat?.color ?? '#6B7280'}>{cat?.icon ?? '📦'}</TIcon>
                    <TDesc>
                      <TName>{txn.description}</TName>
                      <TBadge $type={txn.type}>{txn.type === 'income' ? 'Gelir' : 'Gider'}</TBadge>
                    </TDesc>
                  </TRowLeft>
                </TCell>
                <TCell style={{ flex: 2 }}>
                  <CatName $color={cat?.color ?? '#6B7280'}>{cat?.icon} {cat?.name ?? '-'}</CatName>
                </TCell>
                <TCell style={{ flex: 1 }}>
                  <DateText>{format(new Date(txn.date), 'd MMM yy', { locale: tr })}</DateText>
                </TCell>
                <TCell style={{ flex: 1, textAlign: 'right' }}>
                  <AmountText $type={txn.type}>
                    {txn.type === 'income' ? '+' : '-'}{formatAmount(txn.amount)}
                  </AmountText>
                </TCell>
                <TCell style={{ width: 80, flexShrink: 0, justifyContent: 'flex-end' }}>
                  <ActionButtons>
                    <ActionBtn onClick={() => openEditModal(txn)} title="Düzenle">
                      <EditIcon />
                    </ActionBtn>
                    <ActionBtn $danger onClick={() => setDeleteConfirm(txn.id)} title="Sil">
                      <DeleteIcon />
                    </ActionBtn>
                  </ActionButtons>
                </TCell>
              </TRow>
            );
          })
        )}
      </TableCard>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <ModalOverlay onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <Modal>
            <ModalHeader>
              <ModalTitle>{editingId ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}</ModalTitle>
              <CloseBtn onClick={() => setModalOpen(false)}>✕</CloseBtn>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              {/* Type Toggle */}
              <TypeToggle>
                <TypeBtn
                  type="button"
                  $active={form.type === 'income'}
                  $color="#10B981"
                  onClick={() => setForm((f) => ({ ...f, type: 'income', category: '' }))}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                  </svg>
                  Gelir
                </TypeBtn>
                <TypeBtn
                  type="button"
                  $active={form.type === 'expense'}
                  $color="#EF4444"
                  onClick={() => setForm((f) => ({ ...f, type: 'expense', category: '' }))}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
                  </svg>
                  Gider
                </TypeBtn>
              </TypeToggle>

              <FormGrid>
                <FormField>
                  <Label>Tutar</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    min="0"
                    step="0.01"
                    $error={!!errors.amount}
                  />
                  {errors.amount && <ErrorMsg>{errors.amount}</ErrorMsg>}
                </FormField>

                <FormField>
                  <Label>Tarih</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    $error={!!errors.date}
                  />
                  {errors.date && <ErrorMsg>{errors.date}</ErrorMsg>}
                </FormField>

                <FormField style={{ gridColumn: '1 / -1' }}>
                  <Label>Kategori</Label>
                  <Select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    $error={!!errors.category}
                  >
                    <option value="">Kategori seçin...</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </Select>
                  {errors.category && <ErrorMsg>{errors.category}</ErrorMsg>}
                </FormField>

                <FormField style={{ gridColumn: '1 / -1' }}>
                  <Label>Açıklama</Label>
                  <Input
                    type="text"
                    placeholder="İşlem açıklaması..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    $error={!!errors.description}
                  />
                  {errors.description && <ErrorMsg>{errors.description}</ErrorMsg>}
                </FormField>
              </FormGrid>

              <ModalActions>
                <CancelBtn type="button" onClick={() => setModalOpen(false)}>İptal</CancelBtn>
                <SubmitBtn type="submit" $type={form.type}>
                  {editingId ? 'Güncelle' : (form.type === 'income' ? 'Gelir Ekle' : 'Gider Ekle')}
                </SubmitBtn>
              </ModalActions>
            </form>
          </Modal>
        </ModalOverlay>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ModalOverlay onClick={() => setDeleteConfirm(null)}>
          <ConfirmModal onClick={(e) => e.stopPropagation()}>
            <ConfirmIcon>🗑️</ConfirmIcon>
            <ConfirmTitle>İşlemi Sil</ConfirmTitle>
            <ConfirmText>Bu işlemi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</ConfirmText>
            <ConfirmActions>
              <CancelBtn onClick={() => setDeleteConfirm(null)}>İptal</CancelBtn>
              <DangerBtn onClick={() => handleDelete(deleteConfirm)}>Sil</DangerBtn>
            </ConfirmActions>
          </ConfirmModal>
        </ModalOverlay>
      )}
    </PageContent>
  );
}

TransactionsPage.getLayout = (page: React.ReactNode) => <AppLayout title="İşlemler">{page}</AppLayout>;

// ──────────── Icons ────────────
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function DeleteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ──────────── Styled ────────────
const PageContent = styled.div`display: flex; flex-direction: column; gap: 1.6rem;`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  flex-wrap: wrap;
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  flex: 1;
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
`;

const SearchIconWrap = styled.span`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.9rem 1.2rem 0.9rem 3.8rem;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 1.3rem;
  background: white;
  color: #0F172A;
  outline: none;
  transition: border-color 0.15s;
  &:focus { border-color: #6366F1; }
  &::placeholder { color: #94A3B8; }
`;

const FilterSelect = styled.select`
  padding: 0.9rem 1.4rem;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 1.3rem;
  background: white;
  color: #0F172A;
  cursor: pointer;
  outline: none;
  &:focus { border-color: #6366F1; }
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: #6366F1;
  color: white;
  border: none;
  padding: 0.9rem 1.8rem;
  border-radius: 10px;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  &:hover { background: #4F46E5; }
`;

const SummaryBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.2rem;
  @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
`;

const SummaryItem = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.4rem 1.6rem;
  box-shadow: var(--app-shadow);
`;

const SummaryLabel = styled.p`font-size: 1.1rem; color: #64748B; margin: 0 0 0.3rem;`;

const SummaryValue = styled.p<{ $color?: string }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(p) => p.$color ?? '#0F172A'};
  margin: 0;
`;

const TableCard = styled.div`
  background: white;
  border-radius: var(--app-radius);
  box-shadow: var(--app-shadow);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1.2rem 2rem;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  gap: 1rem;
  @media (max-width: 640px) { display: none; }
`;

const THCell = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  user-select: none;
`;

const TRow = styled.div`
  display: flex;
  align-items: center;
  padding: 1.4rem 2rem;
  gap: 1rem;
  border-bottom: 1px solid #F1F5F9;
  transition: background 0.1s;
  &:last-child { border-bottom: none; }
  &:hover { background: #FAFBFF; }

  @media (max-width: 640px) {
    flex-wrap: wrap;
    padding: 1.2rem 1.6rem;
  }
`;

const TCell = styled.div`
  display: flex;
  align-items: center;
`;

const TRowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  min-width: 0;
`;

const TIcon = styled.div<{ $color: string }>`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${(p) => p.$color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  flex-shrink: 0;
`;

const TDesc = styled.div`display: flex; flex-direction: column; gap: 0.3rem; min-width: 0;`;

const TName = styled.span`
  font-size: 1.3rem;
  font-weight: 600;
  color: #0F172A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TBadge = styled.span<{ $type: string }>`
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  width: fit-content;
  background: ${(p) => p.$type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};
  color: ${(p) => p.$type === 'income' ? '#10B981' : '#EF4444'};
`;

const CatName = styled.span<{ $color: string }>`
  font-size: 1.2rem;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DateText = styled.span`font-size: 1.2rem; color: #64748B;`;

const AmountText = styled.span<{ $type: string }>`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${(p) => p.$type === 'income' ? '#10B981' : '#EF4444'};
`;

const ActionButtons = styled.div`display: flex; gap: 0.4rem;`;

const ActionBtn = styled.button<{ $danger?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: ${(p) => p.$danger ? '#FEF2F2' : '#F8FAFC'};
  color: ${(p) => p.$danger ? '#EF4444' : '#64748B'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: ${(p) => p.$danger ? '#EF4444' : '#E2E8F0'};
    color: ${(p) => p.$danger ? 'white' : '#0F172A'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  color: #94A3B8;
`;

const EmptyIcon = styled.div`font-size: 4rem; margin-bottom: 1.2rem;`;

const EmptyBtn = styled.button`
  margin-top: 1.6rem;
  background: #6366F1;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #4F46E5; }
`;

// Modal
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2.4rem;
  border-bottom: 1px solid #E2E8F0;
`;

const ModalTitle = styled.h2`font-size: 1.7rem; font-weight: 700; color: #0F172A; margin: 0;`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.6rem;
  color: #94A3B8;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  &:hover { background: #F1F5F9; color: #0F172A; }
`;

const TypeToggle = styled.div`
  display: flex;
  gap: 0;
  padding: 2rem 2.4rem 0;
`;

const TypeBtn = styled.button<{ $active: boolean; $color: string }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1rem;
  border: 2px solid ${(p) => p.$active ? p.$color : '#E2E8F0'};
  background: ${(p) => p.$active ? p.$color + '15' : 'white'};
  color: ${(p) => p.$active ? p.$color : '#64748B'};
  font-size: 1.3rem;
  font-weight: ${(p) => p.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.15s;

  &:first-child { border-radius: 10px 0 0 10px; }
  &:last-child { border-radius: 0 10px 10px 0; }
  &:hover { border-color: ${(p) => p.$color}; }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.6rem;
  padding: 2rem 2.4rem;
`;

const FormField = styled.div`display: flex; flex-direction: column; gap: 0.6rem;`;

const Label = styled.label`font-size: 1.2rem; font-weight: 600; color: #374151;`;

const Input = styled.input<{ $error?: boolean }>`
  padding: 1rem 1.2rem;
  border: 1.5px solid ${(p) => p.$error ? '#EF4444' : '#E2E8F0'};
  border-radius: 10px;
  font-size: 1.3rem;
  color: #0F172A;
  outline: none;
  transition: border-color 0.15s;
  &:focus { border-color: ${(p) => p.$error ? '#EF4444' : '#6366F1'}; }
`;

const Select = styled.select<{ $error?: boolean }>`
  padding: 1rem 1.2rem;
  border: 1.5px solid ${(p) => p.$error ? '#EF4444' : '#E2E8F0'};
  border-radius: 10px;
  font-size: 1.3rem;
  color: #0F172A;
  background: white;
  cursor: pointer;
  outline: none;
  &:focus { border-color: ${(p) => p.$error ? '#EF4444' : '#6366F1'}; }
`;

const ErrorMsg = styled.span`font-size: 1.1rem; color: #EF4444;`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.6rem 2.4rem;
  border-top: 1px solid #E2E8F0;
`;

const CancelBtn = styled.button`
  padding: 1rem 2rem;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  background: white;
  color: #64748B;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #F8FAFC; }
`;

const SubmitBtn = styled.button<{ $type: string }>`
  padding: 1rem 2.4rem;
  border: none;
  border-radius: 10px;
  background: ${(p) => p.$type === 'income' ? '#10B981' : '#6366F1'};
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { opacity: 0.9; }
`;

const ConfirmModal = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3rem 2.4rem;
  text-align: center;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
`;

const ConfirmIcon = styled.div`font-size: 4rem; margin-bottom: 1.2rem;`;
const ConfirmTitle = styled.h2`font-size: 1.8rem; font-weight: 700; margin: 0 0 0.8rem; color: #0F172A;`;
const ConfirmText = styled.p`font-size: 1.3rem; color: #64748B; margin: 0 0 2rem;`;
const ConfirmActions = styled.div`display: flex; gap: 1rem; justify-content: center;`;
const DangerBtn = styled.button`
  padding: 1rem 2.4rem;
  border: none;
  border-radius: 10px;
  background: #EF4444;
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #DC2626; }
`;
