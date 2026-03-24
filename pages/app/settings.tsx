import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import AppLayout from 'components/AppLayout';
import { useExpenseTracker } from 'contexts/expense-tracker.context';

const CURRENCIES = [
  { code: 'TRY', symbol: '₺', name: 'Türk Lirası' },
  { code: 'USD', symbol: '$', name: 'Amerikan Doları' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini' },
  { code: 'JPY', symbol: '¥', name: 'Japon Yeni' },
  { code: 'CHF', symbol: 'Fr', name: 'İsviçre Frangı' },
  { code: 'CAD', symbol: 'CA$', name: 'Kanada Doları' },
  { code: 'AUD', symbol: 'A$', name: 'Avustralya Doları' },
];

export default function SettingsPage() {
  const { settings, transactions, categories, updateSettings, clearAllData } = useExpenseTracker();
  const [profileForm, setProfileForm] = useState({ userName: settings.userName, email: settings.email });
  const [profileSaved, setProfileSaved] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateSettings({ userName: profileForm.userName, email: profileForm.email });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  function handleCurrencyChange(code: string) {
    const cur = CURRENCIES.find((c) => c.code === code);
    if (cur) updateSettings({ currency: cur.code, currencySymbol: cur.symbol });
  }

  function handleClearData() {
    clearAllData();
    setClearConfirm(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  }

  function exportData() {
    const data = { transactions, categories, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState('');

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.transactions) localStorage.setItem('et_transactions', JSON.stringify(data.transactions));
        if (data.categories) localStorage.setItem('et_categories', JSON.stringify(data.categories));
        if (data.settings) localStorage.setItem('et_settings', JSON.stringify(data.settings));
        setImportMsg('Veriler başarıyla içe aktarıldı. Sayfayı yenileyin.');
      } catch {
        setImportMsg('Geçersiz dosya formatı.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <PageContent>
      <PageSub>Hesap ve uygulama tercihlerinizi yönetin</PageSub>

      <SettingsGrid>
        {/* Profile */}
        <Section>
          <SectionHeader>
            <SectionIcon>👤</SectionIcon>
            <SectionTitle>Profil Bilgileri</SectionTitle>
          </SectionHeader>
          <form onSubmit={saveProfile}>
            <FieldGroup>
              <FormField>
                <Label>Ad Soyad</Label>
                <Input
                  type="text"
                  value={profileForm.userName}
                  onChange={(e) => setProfileForm((f) => ({ ...f, userName: e.target.value }))}
                  placeholder="Ad Soyad"
                />
              </FormField>
              <FormField>
                <Label>E-posta</Label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </FormField>
            </FieldGroup>
            <SaveBtn type="submit">
              {profileSaved ? '✓ Kaydedildi!' : 'Değişiklikleri Kaydet'}
            </SaveBtn>
          </form>
        </Section>

        {/* Currency */}
        <Section>
          <SectionHeader>
            <SectionIcon>💱</SectionIcon>
            <SectionTitle>Para Birimi</SectionTitle>
          </SectionHeader>
          <CurrencyGrid>
            {CURRENCIES.map((cur) => (
              <CurrencyCard
                key={cur.code}
                $selected={settings.currency === cur.code}
                onClick={() => handleCurrencyChange(cur.code)}
              >
                <CurrencySymbol $selected={settings.currency === cur.code}>{cur.symbol}</CurrencySymbol>
                <CurrencyCode>{cur.code}</CurrencyCode>
                <CurrencyName>{cur.name}</CurrencyName>
                {settings.currency === cur.code && <SelectedCheck>✓</SelectedCheck>}
              </CurrencyCard>
            ))}
          </CurrencyGrid>
        </Section>

        {/* Data Management */}
        <Section>
          <SectionHeader>
            <SectionIcon>📦</SectionIcon>
            <SectionTitle>Veri Yönetimi</SectionTitle>
          </SectionHeader>

          <DataStats>
            <DataStat>
              <DataStatValue>{transactions.length}</DataStatValue>
              <DataStatLabel>İşlem</DataStatLabel>
            </DataStat>
            <DataStat>
              <DataStatValue>{categories.length}</DataStatValue>
              <DataStatLabel>Kategori</DataStatLabel>
            </DataStat>
          </DataStats>

          <DataActions>
            <DataActionBtn onClick={exportData}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Veriyi Dışa Aktar (JSON)
            </DataActionBtn>

            <DataActionBtn onClick={() => fileInputRef.current?.click()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Veriyi İçe Aktar (JSON)
            </DataActionBtn>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />

            {importMsg && <ImportMsg>{importMsg}</ImportMsg>}

            <DangerActionBtn onClick={() => setClearConfirm(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
              Tüm Verileri Sıfırla
            </DangerActionBtn>

            {cleared && <SuccessMsg>✓ Veriler örnek verilerle sıfırlandı.</SuccessMsg>}
          </DataActions>
        </Section>

        {/* App Info */}
        <Section>
          <SectionHeader>
            <SectionIcon>ℹ️</SectionIcon>
            <SectionTitle>Uygulama Hakkında</SectionTitle>
          </SectionHeader>
          <InfoList>
            <InfoRow>
              <InfoLabel>Uygulama</InfoLabel>
              <InfoValue>Fintrack</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Versiyon</InfoLabel>
              <InfoValue>1.0.0</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Veri Depolama</InfoLabel>
              <InfoValue>Yerel Depolama (localStorage)</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Platform</InfoLabel>
              <InfoValue>Web Uygulaması</InfoValue>
            </InfoRow>
          </InfoList>
          <AboutText>
            Fintrack, kişisel gelir ve gider takibinizi kolaylaştırmak için tasarlanmış modern bir finansal yönetim uygulamasıdır.
            Tüm verileriniz güvenli bir şekilde cihazınızda saklanır.
          </AboutText>
        </Section>
      </SettingsGrid>

      {/* Clear Confirm Modal */}
      {clearConfirm && (
        <ModalOverlay onClick={() => setClearConfirm(false)}>
          <ConfirmModal onClick={(e) => e.stopPropagation()}>
            <ConfirmIcon>⚠️</ConfirmIcon>
            <ConfirmTitle>Verileri Sıfırla</ConfirmTitle>
            <ConfirmText>
              Tüm işlem ve kategori verileri silinecek ve örnek verilerle değiştirilecektir. Bu işlem geri alınamaz.
            </ConfirmText>
            <ConfirmActions>
              <CancelBtn onClick={() => setClearConfirm(false)}>İptal</CancelBtn>
              <DangerBtn onClick={handleClearData}>Sıfırla</DangerBtn>
            </ConfirmActions>
          </ConfirmModal>
        </ModalOverlay>
      )}
    </PageContent>
  );
}

SettingsPage.getLayout = (page: React.ReactNode) => <AppLayout title="Ayarlar">{page}</AppLayout>;

// ──────────── Styled ────────────
const PageContent = styled.div`display: flex; flex-direction: column; gap: 2rem;`;
const PageSub = styled.p`font-size: 1.3rem; color: #64748B; margin: 0;`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Section = styled.div`
  background: white;
  border-radius: var(--app-radius);
  padding: 2.4rem;
  box-shadow: var(--app-shadow);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.4rem;
  border-bottom: 1px solid #F1F5F9;
`;

const SectionIcon = styled.span`font-size: 2rem;`;
const SectionTitle = styled.h2`font-size: 1.5rem; font-weight: 700; color: #0F172A; margin: 0;`;

const FieldGroup = styled.div`display: flex; flex-direction: column; gap: 1.4rem; margin-bottom: 2rem;`;
const FormField = styled.div`display: flex; flex-direction: column; gap: 0.6rem;`;
const Label = styled.label`font-size: 1.2rem; font-weight: 600; color: #374151;`;
const Input = styled.input`
  padding: 1rem 1.2rem;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 1.3rem;
  color: #0F172A;
  outline: none;
  &:focus { border-color: #6366F1; }
`;

const SaveBtn = styled.button`
  width: 100%;
  padding: 1.1rem;
  background: #6366F1;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #4F46E5; }
`;

const CurrencyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.8rem;
  @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); }
`;

const CurrencyCard = styled.div<{ $selected: boolean }>`
  position: relative;
  padding: 1.2rem 0.8rem;
  border: 2px solid ${(p) => p.$selected ? '#6366F1' : '#E2E8F0'};
  border-radius: 10px;
  background: ${(p) => p.$selected ? '#EEF2FF' : 'white'};
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
  &:hover { border-color: #6366F1; }
`;

const CurrencySymbol = styled.div<{ $selected: boolean }>`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${(p) => p.$selected ? '#6366F1' : '#0F172A'};
  margin-bottom: 0.2rem;
`;

const CurrencyCode = styled.div`font-size: 1.2rem; font-weight: 600; color: #374151;`;
const CurrencyName = styled.div`font-size: 1rem; color: #94A3B8; margin-top: 0.2rem;`;

const SelectedCheck = styled.div`
  position: absolute;
  top: 0.4rem;
  right: 0.6rem;
  font-size: 1rem;
  color: #6366F1;
  font-weight: 700;
`;

const DataStats = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.4rem;
  background: #F8FAFC;
  border-radius: 10px;
`;

const DataStat = styled.div`text-align: center; flex: 1;`;
const DataStatValue = styled.div`font-size: 2.4rem; font-weight: 700; color: #6366F1;`;
const DataStatLabel = styled.div`font-size: 1.2rem; color: #64748B; margin-top: 0.2rem;`;

const DataActions = styled.div`display: flex; flex-direction: column; gap: 1rem;`;

const DataActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.1rem 1.6rem;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-size: 1.3rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: #6366F1; color: #6366F1; background: #F8F9FF; }
`;

const DangerActionBtn = styled(DataActionBtn)`
  color: #EF4444;
  &:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }
`;

const ImportMsg = styled.p`font-size: 1.2rem; color: #6366F1; padding: 0.8rem; background: #EEF2FF; border-radius: 8px; margin: 0;`;
const SuccessMsg = styled.p`font-size: 1.2rem; color: #10B981; padding: 0.8rem; background: #ECFDF5; border-radius: 8px; margin: 0;`;

const InfoList = styled.div`display: flex; flex-direction: column; gap: 0; margin-bottom: 1.6rem;`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #F1F5F9;
  &:last-child { border-bottom: none; }
`;

const InfoLabel = styled.span`font-size: 1.3rem; color: #64748B;`;
const InfoValue = styled.span`font-size: 1.3rem; font-weight: 600; color: #0F172A;`;

const AboutText = styled.p`font-size: 1.2rem; color: #94A3B8; line-height: 1.7; margin: 0;`;

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
const ConfirmActions = styled.div`display: flex; gap: 1rem; justify-content: center;`;

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
