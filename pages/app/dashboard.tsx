import React, { useMemo } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import AppLayout from 'components/AppLayout';
import { useExpenseTracker } from 'contexts/expense-tracker.context';
import { Transaction, MonthlyData, CategoryData } from 'types/expense-tracker';

// ──────────── Main Page ────────────

export default function DashboardPage() {
  const {
    transactions,
    categories,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    getMonthlyData,
    getCategoryBreakdown,
    formatAmount,
  } = useExpenseTracker();

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const balance = getBalance();
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  const monthlyData = getMonthlyData(6);
  const expenseBreakdown = getCategoryBreakdown('expense', 1);
  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8),
    [transactions],
  );

  return (
    <PageContent>
      {/* Stats */}
      <StatsGrid>
        <StatCard $color="#6366F1">
          <StatIcon $color="rgba(99,102,241,0.12)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </StatIcon>
          <StatContent>
            <StatLabel>Genel Bakiye</StatLabel>
            <StatValue $positive={balance >= 0}>{formatAmount(balance)}</StatValue>
            <StatSub>{savingsRate >= 0 ? `%${savingsRate} tasarruf oranı` : 'Bütçe aşıldı'}</StatSub>
          </StatContent>
        </StatCard>

        <StatCard $color="#10B981">
          <StatIcon $color="rgba(16,185,129,0.12)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </StatIcon>
          <StatContent>
            <StatLabel>Toplam Gelir</StatLabel>
            <StatValue $positive={true}>{formatAmount(totalIncome)}</StatValue>
            <StatSub>Tüm zamanlar</StatSub>
          </StatContent>
        </StatCard>

        <StatCard $color="#EF4444">
          <StatIcon $color="rgba(239,68,68,0.12)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          </StatIcon>
          <StatContent>
            <StatLabel>Toplam Gider</StatLabel>
            <StatValue $positive={false}>{formatAmount(totalExpense)}</StatValue>
            <StatSub>Tüm zamanlar</StatSub>
          </StatContent>
        </StatCard>

        <StatCard $color="#F59E0B">
          <StatIcon $color="rgba(245,158,11,0.12)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </StatIcon>
          <StatContent>
            <StatLabel>İşlem Sayısı</StatLabel>
            <StatValue $positive={true}>{transactions.length}</StatValue>
            <StatSub>Toplam kayıt</StatSub>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Charts Row */}
      <ChartsRow>
        <ChartCard>
          <CardHeader>
            <CardTitle>Aylık Gelir / Gider</CardTitle>
            <ChartLegend>
              <LegendItem><LegendDot $color="#10B981" />Gelir</LegendItem>
              <LegendItem><LegendDot $color="#EF4444" />Gider</LegendItem>
            </ChartLegend>
          </CardHeader>
          <BarChartContainer>
            <BarChart data={monthlyData} formatAmount={formatAmount} />
          </BarChartContainer>
        </ChartCard>

        <ChartCard $narrow>
          <CardHeader>
            <CardTitle>Gider Dağılımı</CardTitle>
          </CardHeader>
          {expenseBreakdown.length > 0 ? (
            <>
              <DonutChartContainer>
                <DonutChart data={expenseBreakdown} total={totalExpense} formatAmount={formatAmount} />
              </DonutChartContainer>
              <CategoryLegend>
                {expenseBreakdown.slice(0, 5).map((item) => (
                  <CategoryLegendItem key={item.category}>
                    <CategoryDot $color={item.color} />
                    <CategoryName>{item.category}</CategoryName>
                    <CategoryPct>{item.percentage}%</CategoryPct>
                  </CategoryLegendItem>
                ))}
              </CategoryLegend>
            </>
          ) : (
            <EmptyState>Henüz gider yok</EmptyState>
          )}
        </ChartCard>
      </ChartsRow>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Son İşlemler</CardTitle>
          <ViewAllLink href="/app/transactions">Tümünü gör →</ViewAllLink>
        </CardHeader>
        <TransactionTable>
          {recentTransactions.length === 0 ? (
            <EmptyState>Henüz işlem yok</EmptyState>
          ) : (
            recentTransactions.map((txn) => (
              <TransactionRow key={txn.id} txn={txn} categories={categories} formatAmount={formatAmount} />
            ))
          )}
        </TransactionTable>
      </Card>
    </PageContent>
  );
}

// ──────────── Transaction Row ────────────

function TransactionRow({
  txn,
  categories,
  formatAmount,
}: {
  txn: Transaction;
  categories: ReturnType<typeof useExpenseTracker>['categories'];
  formatAmount: (n: number) => string;
}) {
  const cat = categories.find((c) => c.id === txn.category);
  return (
    <TRow>
      <TRowLeft>
        <TIcon $color={cat?.color ?? '#6B7280'}>{cat?.icon ?? '📦'}</TIcon>
        <TInfo>
          <TDesc>{txn.description}</TDesc>
          <TMeta>
            <TBadge $type={txn.type}>{txn.type === 'income' ? 'Gelir' : 'Gider'}</TBadge>
            <span>{cat?.name}</span>
            <span>·</span>
            <span>{format(new Date(txn.date), 'd MMM yyyy', { locale: tr })}</span>
          </TMeta>
        </TInfo>
      </TRowLeft>
      <TAmount $type={txn.type}>
        {txn.type === 'income' ? '+' : '-'}{formatAmount(txn.amount)}
      </TAmount>
    </TRow>
  );
}

// ──────────── Bar Chart ────────────

function BarChart({ data, formatAmount }: { data: MonthlyData[]; formatAmount: (n: number) => string }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);
  const chartH = 160;
  const barW = 18;
  const gap = 6;
  const groupW = barW * 2 + gap + 20;
  const totalW = data.length * groupW + 20;
  const paddingBottom = 28;
  const paddingTop = 10;

  return (
    <svg viewBox={`0 0 ${totalW} ${chartH + paddingBottom + paddingTop}`} style={{ width: '100%', overflow: 'visible' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = paddingTop + chartH - pct * chartH;
        return (
          <line key={i} x1="10" y1={y} x2={totalW - 10} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
        );
      })}
      {data.map((d, i) => {
        const x = i * groupW + 10;
        const incomeH = Math.max((d.income / maxVal) * chartH, d.income > 0 ? 3 : 0);
        const expenseH = Math.max((d.expense / maxVal) * chartH, d.expense > 0 ? 3 : 0);
        const incomeY = paddingTop + chartH - incomeH;
        const expenseY = paddingTop + chartH - expenseH;

        return (
          <g key={i}>
            <rect x={x} y={incomeY} width={barW} height={incomeH} fill="#10B981" rx={4} opacity={0.9}>
              <title>{`Gelir: ${formatAmount(d.income)}`}</title>
            </rect>
            <rect x={x + barW + gap} y={expenseY} width={barW} height={expenseH} fill="#EF4444" rx={4} opacity={0.9}>
              <title>{`Gider: ${formatAmount(d.expense)}`}</title>
            </rect>
            <text
              x={x + barW + gap / 2}
              y={chartH + paddingTop + paddingBottom - 6}
              textAnchor="middle"
              fontSize={11}
              fill="#64748B"
              fontFamily="Poppins, sans-serif"
            >
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ──────────── Donut Chart ────────────

function DonutChart({
  data,
  total,
  formatAmount,
}: {
  data: CategoryData[];
  total: number;
  formatAmount: (n: number) => string;
}) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 65;
  const innerR = 42;

  const slices = useMemo(() => {
    let startAngle = -Math.PI / 2;
    return data.slice(0, 6).map((item) => {
      const pct = total > 0 ? item.amount / total : 0;
      const angle = pct * 2 * Math.PI;
      const endAngle = startAngle + angle;
      const s = startAngle;
      startAngle = endAngle;
      return { ...item, startAngle: s, endAngle, pct };
    });
  }, [data, total]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: 160 }}>
      {slices.map((s, i) => {
        if (s.pct === 0) return null;
        const x1 = cx + outerR * Math.cos(s.startAngle);
        const y1 = cy + outerR * Math.sin(s.startAngle);
        const x2 = cx + outerR * Math.cos(s.endAngle);
        const y2 = cy + outerR * Math.sin(s.endAngle);
        const ix1 = cx + innerR * Math.cos(s.endAngle);
        const iy1 = cy + innerR * Math.sin(s.endAngle);
        const ix2 = cx + innerR * Math.cos(s.startAngle);
        const iy2 = cy + innerR * Math.sin(s.startAngle);
        const largeArc = s.endAngle - s.startAngle > Math.PI ? 1 : 0;
        const d = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
        return <path key={i} d={d} fill={s.color} opacity={0.9}><title>{s.category}: {formatAmount(s.amount)}</title></path>;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={11} fill="#64748B" fontFamily="Poppins, sans-serif">Gider</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={11} fill="#0F172A" fontWeight="600" fontFamily="Poppins, sans-serif">
        {data.length}
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize={10} fill="#64748B" fontFamily="Poppins, sans-serif">kategori</text>
    </svg>
  );
}

DashboardPage.getLayout = (page: React.ReactNode) => <AppLayout title="Panel">{page}</AppLayout>;

// ──────────── Styled Components ────────────

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.6rem;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div<{ $color: string }>`
  background: white;
  border-radius: var(--app-radius);
  padding: 2rem;
  box-shadow: var(--app-shadow);
  display: flex;
  align-items: flex-start;
  gap: 1.6rem;
  border-top: 3px solid ${(p) => p.$color};
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  min-width: 0;
`;

const StatLabel = styled.p`
  font-size: 1.2rem;
  color: #64748B;
  margin: 0 0 0.4rem;
  font-weight: 500;
`;

const StatValue = styled.p<{ $positive: boolean }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${(p) => p.$positive ? '#0F172A' : '#0F172A'};
  margin: 0 0 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatSub = styled.p`
  font-size: 1.1rem;
  color: #94A3B8;
  margin: 0;
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.6rem;

  @media (max-width: 1100px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: white;
  border-radius: var(--app-radius);
  padding: 2rem;
  box-shadow: var(--app-shadow);
`;

const ChartCard = styled(Card)<{ $narrow?: boolean }>``;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.6rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
`;

const ChartLegend = styled.div`
  display: flex;
  gap: 1.6rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.2rem;
  color: #64748B;
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  flex-shrink: 0;
`;

const BarChartContainer = styled.div`
  width: 100%;
  min-height: 180px;
`;

const DonutChartContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.6rem;
`;

const CategoryLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const CategoryLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const CategoryDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: ${(p) => p.$color};
  flex-shrink: 0;
`;

const CategoryName = styled.span`
  font-size: 1.2rem;
  color: #0F172A;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CategoryPct = styled.span`
  font-size: 1.2rem;
  color: #64748B;
  font-weight: 600;
  flex-shrink: 0;
`;

const ViewAllLink = styled.a`
  font-size: 1.2rem;
  color: #6366F1;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;

const TransactionTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const TRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 0;
  border-bottom: 1px solid #F1F5F9;
  gap: 1.2rem;

  &:last-child { border-bottom: none; }
`;

const TRowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  min-width: 0;
  flex: 1;
`;

const TIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${(p) => p.$color}18;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  flex-shrink: 0;
`;

const TInfo = styled.div`
  min-width: 0;
`;

const TDesc = styled.p`
  font-size: 1.3rem;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.1rem;
  color: #94A3B8;
  flex-wrap: wrap;
`;

const TBadge = styled.span<{ $type: string }>`
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  background: ${(p) => p.$type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};
  color: ${(p) => p.$type === 'income' ? '#10B981' : '#EF4444'};
`;

const TAmount = styled.span<{ $type: string }>`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${(p) => p.$type === 'income' ? '#10B981' : '#EF4444'};
  white-space: nowrap;
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #94A3B8;
  font-size: 1.3rem;
  padding: 3rem 0;
`;
