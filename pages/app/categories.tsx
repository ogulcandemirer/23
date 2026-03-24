import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import AppLayout from 'components/AppLayout';
import { useExpenseTracker } from 'contexts/expense-tracker.context';
import { Category, TransactionType } from 'types/expense-tracker';

const PRESET_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
  '#F59E0B', '#10B981', '#14B8A6', '#06B6D4', '#3B82F6',
  '#84CC16', '#64748B',
];

const PRESET_ICONS = [
  '💼', '💻', '📈', '🏠', '🍔', '🚗', '🎬', '⚕️', '🛍️',
  '📚', '📄', '💰', '🎯', '🎮', '✈️', '🏋️', '🐾', '🎵',
  '📦', '🔧', '💡', '🎁', '🌱', '☕',
];

const EMPTY_FORM = {
  name: '',
  color: '#6366F1',
  icon: '📦',
  type: 'expense' as TransactionType | 'both',
};

export default function CategoriesPage() {
  const { categories, transactions, addCategory, updateCategory, deleteCategory } = useExpenseTracker();
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const displayedCategories = useMemo(() => {
    if (filterType === 'all') return categories;
    return categories.filter((c) => c.type === filterType || c.type === 'both');
  }, [categories, filterType]);

  const getCategoryUsage = (catId: string) =>
    transactions.filter((t) => t.category === catId).length;

  function openAddModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }

  function openEditModal(cat: Category) {
    setEditingId(cat.id);
    setForm({ name: cat.name, color: cat.color, icon: cat.icon, type: cat.type });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Kategori adı girin';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (editingId) updateCategory(editingId, form);
    else addCategory(form);
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    deleteCategory(id);
    setDeleteConfirm(null);
  }

  const incomeCount = categories.filter((c) => c.type === 'income').length;
  const expenseCount = categories.filter((c) => c.type === 'expense').length;

  return (
    <PageContent>
      {/* Header */}
      <TopBar>
        <TopBarLeft>
          <PageSub>{categories.length} kategori</PageSub>
          <FilterTabs>
            <FilterTab $active={filterType === 'all'} onClick={() => setFilterType('all')}>
              Tümü ({categories.length})
            </FilterTab>
            <FilterTab $active={filterType === 'income'} onClick={() => setFilterType('income')}>
              Gelir ({incomeCount})
            </FilterTab>
            <FilterTab $active={filterType === 'expense'} onClick={() => setFilterType('expense')}>
              Gider ({expenseCount})
            </FilterTab>
          </FilterTabs>
        </TopBarLeft>
        <AddButton onClick={openAddModal}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Kategori Ekle
        </AddButton>
      </TopBar>

      {/* Grid */}
      <CategoriesGrid>
        {displayedCategories.map((cat) => {
          const usage = getCategoryUsage(cat.id);
          return (
            <CategoryCard key={cat.id} $color={cat.color}>
              <CardTop>
                <CatIcon $color={cat.color}>{cat.icon}</CatIcon>
                <CardActions>
                  <ActionBtn onClick={() => openEditModal(cat)} title="Düzenle">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </ActionBtn>
                  <ActionBtn $danger onClick={() => setDeleteConfirm(cat.id)} title="Sil">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" /><path d="M14 11v6" />
                    </svg>
                  </ActionBtn>
                </CardActions>
              </CardTop>
              <CatName>{cat.name}</CatName>
              <CardMeta>
                <TypeBadge $type={cat.type}>
                  {cat.type === 'income' ? 'Gelir' : cat.type === 'expense' ? 'Gider' : 'Her İkisi'}
                </TypeBadge>
                <UsageText>{usage} işlem</UsageText>
              </CardMeta>
              <UsageBar>
                <UsageFill $color={cat.color} $width={Math.min((usage / Math.max(...categories.map((c) => getCategoryUsage(c.id)), 1)) * 100, 100)} />
              </UsageBar>
            </CategoryCard>
          );
        })}

        {/* Add New Placeholder */}
        <AddCategoryCard onClick={openAddModal}>
          <AddIcon>+</AddIcon>
          <AddText>Yeni Kategori</AddText>
        </AddCategoryCard>
      </CategoriesGrid>

      {/* Modal */}
      {modalOpen && (
        <ModalOverlay onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <Modal>
            <ModalHeader>
              <ModalTitle>{editingId ? 'Kategori Düzenle' : 'Yeni Kategori'}</ModalTitle>
              <CloseBtn onClick={() => setModalOpen(false)}>✕</CloseBtn>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <ModalBody>
                {/* Preview */}
                <PreviewSection>
                  <PreviewCard $color={form.color}>
                    <PreviewIcon>{form.icon}</PreviewIcon>
                    <PreviewName>{form.name || 'Kategori Adı'}</PreviewName>
                  </PreviewCard>
                </PreviewSection>

                <FormField>
                  <Label>Kategori Adı</Label>
                  <Input
                    type="text"
                    placeholder="Kategori adı..."
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    $error={!!errors.name}
                  />
                  {errors.name && <ErrorMsg>{errors.name}</ErrorMsg>}
                </FormField>

                <FormField>
                  <Label>Tür</Label>
                  <TypeToggle>
                    {(['income', 'expense', 'both'] as const).map((t) => (
                      <TypeBtn key={t} type="button" $active={form.type === t} onClick={() => setForm((f) => ({ ...f, type: t }))}>
                        {t === 'income' ? '💰 Gelir' : t === 'expense' ? '💸 Gider' : '↔️ Her İkisi'}
                      </TypeBtn>
                    ))}
                  </TypeToggle>
                </FormField>

                <FormField>
                  <Label>Renk</Label>
                  <ColorGrid>
                    {PRESET_COLORS.map((color) => (
                      <ColorOption
                        key={color}
                        $color={color}
                        $selected={form.color === color}
                        onClick={() => setForm((f) => ({ ...f, color }))}
                        type="button"
                      />
                    ))}
                  </ColorGrid>
                </FormField>

                <FormField>
                  <Label>İkon</Label>
                  <IconGrid>
                    {PRESET_ICONS.map((icon) => (
                      <IconOption
                        key={icon}
                        $selected={form.icon === icon}
                        onClick={() => setForm((f) => ({ ...f, icon }))}
                        type="button"
                      >
                        {icon}
                      </IconOption>
                    ))}
                  </IconGrid>
                </FormField>
              </ModalBody>

              <ModalActions>
                <CancelBtn type="button" onClick={() => setModalOpen(false)}>İptal</CancelBtn>
                <SubmitBtn type="submit">
                  {editingId ? 'Güncelle' : 'Kategori Ekle'}
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
            <ConfirmTitle>Kategoriyi Sil</ConfirmTitle>
            <ConfirmText>
              Bu kategoriyi silmek istediğinizden emin misiniz?
              {getCategoryUsage(deleteConfirm) > 0 && (
                <WarningText>
                  {' '}Bu kategoriye bağlı {getCategoryUsage(deleteConfirm)} işlem var.
                </WarningText>
              )}
            </ConfirmText>
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

CategoriesPage.getLayout = (page: React.ReactNode) => <AppLayout title="Kategoriler">{page}</AppLayout>;

// ──────────── Styled ────────────
const PageContent = styled.div`display: flex; flex-direction: column; gap: 2rem;`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.2rem;
`;

const TopBarLeft = styled.div`display: flex; align-items: center; gap: 1.6rem; flex-wrap: wrap;`;

const PageSub = styled.p`font-size: 1.3rem; color: #64748B; margin: 0;`;

const FilterTabs = styled.div`display: flex; background: white; border: 1.5px solid #E2E8F0; border-radius: 10px; overflow: hidden;`;

const FilterTab = styled.button<{ $active: boolean }>`
  padding: 0.7rem 1.4rem;
  border: none;
  background: ${(p) => p.$active ? '#6366F1' : 'transparent'};
  color: ${(p) => p.$active ? 'white' : '#64748B'};
  font-size: 1.2rem;
  font-weight: ${(p) => p.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  &:hover { background: ${(p) => p.$active ? '#4F46E5' : '#F8FAFC'}; }
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

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.6rem;
`;

const CategoryCard = styled.div<{ $color: string }>`
  background: white;
  border-radius: var(--app-radius);
  padding: 1.8rem;
  box-shadow: var(--app-shadow);
  border-top: 3px solid ${(p) => p.$color};
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover { transform: translateY(-2px); box-shadow: var(--app-shadow-md); }
`;

const CardTop = styled.div`display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.2rem;`;

const CatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${(p) => p.$color}18;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
`;

const CardActions = styled.div`display: flex; gap: 0.4rem;`;

const ActionBtn = styled.button<{ $danger?: boolean }>`
  width: 30px;
  height: 30px;
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

const CatName = styled.h3`font-size: 1.4rem; font-weight: 600; color: #0F172A; margin: 0 0 0.8rem;`;

const CardMeta = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;`;

const TypeBadge = styled.span<{ $type: string }>`
  padding: 0.25rem 0.8rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  background: ${(p) => p.$type === 'income' ? 'rgba(16,185,129,0.1)' : p.$type === 'expense' ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)'};
  color: ${(p) => p.$type === 'income' ? '#10B981' : p.$type === 'expense' ? '#EF4444' : '#6366F1'};
`;

const UsageText = styled.span`font-size: 1.1rem; color: #94A3B8;`;

const UsageBar = styled.div`height: 4px; background: #F1F5F9; border-radius: 2px; overflow: hidden;`;
const UsageFill = styled.div<{ $color: string; $width: number }>`
  height: 100%;
  width: ${(p) => p.$width}%;
  background: ${(p) => p.$color};
  border-radius: 2px;
`;

const AddCategoryCard = styled.div`
  background: white;
  border-radius: var(--app-radius);
  padding: 1.8rem;
  box-shadow: var(--app-shadow);
  border: 2px dashed #CBD5E1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  cursor: pointer;
  min-height: 160px;
  transition: all 0.15s;
  &:hover { border-color: #6366F1; background: #F8F9FF; }
`;

const AddIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  color: #94A3B8;
  font-weight: 300;
`;

const AddText = styled.span`font-size: 1.3rem; color: #94A3B8; font-weight: 500;`;

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
  max-width: 480px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2.4rem;
  border-bottom: 1px solid #E2E8F0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
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
  &:hover { background: #F1F5F9; }
`;

const ModalBody = styled.div`padding: 2rem 2.4rem; display: flex; flex-direction: column; gap: 2rem;`;

const PreviewSection = styled.div`display: flex; justify-content: center;`;

const PreviewCard = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  padding: 1.6rem 2.4rem;
  border-radius: 12px;
  background: ${(p) => p.$color}12;
  border: 2px solid ${(p) => p.$color}40;
`;

const PreviewIcon = styled.div`font-size: 3rem;`;
const PreviewName = styled.span`font-size: 1.3rem; font-weight: 600; color: #0F172A;`;

const FormField = styled.div`display: flex; flex-direction: column; gap: 0.8rem;`;

const Label = styled.label`font-size: 1.2rem; font-weight: 600; color: #374151;`;

const Input = styled.input<{ $error?: boolean }>`
  padding: 1rem 1.2rem;
  border: 1.5px solid ${(p) => p.$error ? '#EF4444' : '#E2E8F0'};
  border-radius: 10px;
  font-size: 1.3rem;
  color: #0F172A;
  outline: none;
  &:focus { border-color: #6366F1; }
`;

const ErrorMsg = styled.span`font-size: 1.1rem; color: #EF4444;`;

const TypeToggle = styled.div`display: flex; gap: 0;`;

const TypeBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.9rem 0.6rem;
  border: 1.5px solid ${(p) => p.$active ? '#6366F1' : '#E2E8F0'};
  background: ${(p) => p.$active ? '#6366F115' : 'white'};
  color: ${(p) => p.$active ? '#6366F1' : '#64748B'};
  font-size: 1.2rem;
  font-weight: ${(p) => p.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.15s;
  &:first-child { border-radius: 10px 0 0 10px; }
  &:last-child { border-radius: 0 10px 10px 0; }
`;

const ColorGrid = styled.div`display: flex; flex-wrap: wrap; gap: 0.8rem;`;

const ColorOption = styled.button<{ $color: string; $selected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${(p) => p.$color};
  border: 3px solid ${(p) => p.$selected ? '#0F172A' : 'transparent'};
  cursor: pointer;
  transition: transform 0.1s;
  &:hover { transform: scale(1.15); }
`;

const IconGrid = styled.div`display: flex; flex-wrap: wrap; gap: 0.6rem;`;

const IconOption = styled.button<{ $selected: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: ${(p) => p.$selected ? '#EEF2FF' : '#F8FAFC'};
  border: 2px solid ${(p) => p.$selected ? '#6366F1' : 'transparent'};
  font-size: 1.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
  &:hover { background: #EEF2FF; }
`;

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

const SubmitBtn = styled.button`
  padding: 1rem 2.4rem;
  border: none;
  border-radius: 10px;
  background: #6366F1;
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #4F46E5; }
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
const ConfirmText = styled.p`font-size: 1.3rem; color: #64748B; margin: 0 0 2rem; line-height: 1.6;`;
const WarningText = styled.span`color: #F59E0B; font-weight: 600;`;
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
