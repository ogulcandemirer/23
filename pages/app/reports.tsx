import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import AppLayout from 'components/AppLayout';
import { useExpenseTracker } from 'contexts/expense-tracker.context';
import { MonthlyData, CategoryData } from 'types/expense-tracker';

export default function ReportsPage() {
  const { transactions, categories, getMonthlyData, getCategoryBreakdown, formatAmount } = useExpenseTracker();
  const [period, setPeriod] = useState<3 | 6 | 12>(6);

  const monthlyData = getMonthlyData(period);
  const incomeBreakdown = getCategoryBreakdown('income', period);
  const expenseBreakdown = getCategoryBreakdown('expense', period);

  const periodTransactions = useMemo(() => {
    const start = startOfMonth(subMonths(new Date(), period - 1));
    return transactions.filter((t) => new Date(t.date) >= start);
  }, [transactions, period]);

  const totalIncome = periodTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = periodTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const avgMonthlyExpense = Math.round(totalExpense / period);
  const avgMonthlyIncome = Math.round(totalIncome / period);
  const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;

  const monthlyTableData = useMemo(() => {
    const result = [];
    for (let i = period - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthTxns = transactions.filter((t) => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
      const income = monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      result.push({
        month: format(date, 'MMMM yyyy', { locale: tr }),
        shortMonth: format(date, 'MMM', { locale: tr }),
        income,
        expense,
        net: income - expense,
        txnCount: monthTxns.length,
      });
    }
    return result.reverse();
  }, [transactions, period]);

  return (
    <PageContent>
      {/* Period Selector */}
      <TopBar>
        <PageSub>Finansal özetinizi ve trend analizinizi inceleyin</PageSub>
        <PeriodToggle>
          {([3, 6, 12] as const).map((p) => (
            <PeriodBtn key={p} $active={period === p} onClick={() => setPeriod(p)}>
              Son {p} Ay
            </PeriodBtn>
          ))}
        </PeriodToggle>
      </TopBar>

      {/* KPI Cards */}
      <KpiGrid>
        <KpiCard>
          <KpiIcon $bg="rgba(16,185,129,0.1)">💰</KpiIcon>
          <KpiInfo>
            <KpiLabel>Toplam Gelir</KpiLabel>
            <KpiValue $color="#10B981">{formatAmount(totalIncome)}</KpiValue>
            <KpiSub>Ort. {formatAmount(avgMonthlyIncome)}/ay</KpiSub>
          </KpiInfo>
        </KpiCard>
        <KpiCard>
          <KpiIcon $bg="rgba(239,68,68,0.1)">💸</KpiIcon>
          <KpiInfo>
            <KpiLabel>Toplam Gider</KpiLabel>
            <KpiValue $color="#EF4444">{formatAmount(totalExpense)}</KpiValue>
            <KpiSub>Ort. {formatAmount(avgMonthlyExpense)}/ay</KpiSub>
          </KpiInfo>
        </KpiCard>
        <KpiCard>
          <KpiIcon $bg={netBalance >= 0 ? 'rgba(99,102,241,0.1)' : 'rgba(239,68,68,0.1)'}>📊</KpiIcon>
          <KpiInfo>
            <KpiLabel>Net Bakiye</KpiLabel>
            <KpiValue $color={netBalance >= 0 ? '#6366F1' : '#EF4444'}>{formatAmount(netBalance)}</KpiValue>
            <KpiSub>{netBalance >= 0 ? 'Pozitif bütçe' : 'Bütçe aşımı'}</KpiSub>
          </KpiInfo>
        </KpiCard>
        <KpiCard>
          <KpiIcon $bg="rgba(245,158,11,0.1)">🎯</KpiIcon>
          <KpiInfo>
            <KpiLabel>Tasarruf Oranı</KpiLabel>
            <KpiValue $color="#F59E0B">{savingsRate}%</KpiValue>
            <KpiSub>{savingsRate >= 20 ? 'Harika!' : savingsRate >= 10 ? 'İyi' : 'Geliştirilmeli'}</KpiSub>
          </KpiInfo>
        </KpiCard>
      </KpiGrid>

      {/* Monthly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Aylık Gelir & Gider Karşılaştırması</CardTitle>
          <ChartLegend>
            <LegendItem><LegendDot $color="#10B981" />Gelir</LegendItem>
            <LegendItem><LegendDot $color="#EF4444" />Gider</LegendItem>
            <LegendItem><LegendDot $color="#6366F1" />Net</LegendItem>
          </ChartLegend>
        </CardHeader>
        <BigBarChart data={monthlyData} formatAmount={formatAmount} />
      </Card>

      {/* Category Breakdowns */}
      <TwoColGrid>
        <Card>
          <CardHeader>
            <CardTitle>Gelir Kaynakları</CardTitle>
          </CardHeader>
          <CategoryBreakdownList data={incomeBreakdown} formatAmount={formatAmount} type="income" />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gider Kategorileri</CardTitle>
          </CardHeader>
          <CategoryBreakdownList data={expenseBreakdown} formatAmount={formatAmount} type="expense" />
        </Card>
      </TwoColGrid>

      {/* Monthly Table */}
      <Card>
        <CardHeader>
          <CardTitle>Aylık Özet Tablosu</CardTitle>
        </CardHeader>
        <MonthlyTable>
          <MonthlyTHead>
            <MTRow>
              <MTH>Ay</MTH>
              <MTH>Gelir</MTH>
              <MTH>Gider</MTH>
              <MTH>Net</MTH>
              <MTH>İşlem</MTH>
              <MTH>Durum</MTH>
            </MTRow>
          </MonthlyTHead>
          <tbody>
            {monthlyTableData.map((row, i) => (
              <MTBodyRow key={i}>
                <MTD><MonthName>{row.month}</MonthName></MTD>
                <MTD><IncomeText>+{formatAmount(row.income)}</IncomeText></MTD>
                <MTD><ExpenseText>-{formatAmount(row.expense)}</ExpenseText></MTD>
                <MTD>
                  <NetText $positive={row.net >= 0}>{formatAmount(row.net)}</NetText>
                </MTD>
                <MTD>{row.txnCount} adet</MTD>
                <MTD>
                  <StatusBadge $positive={row.net >= 0}>
                    {row.net >= 0 ? '✓ Pozitif' : '✗ Negatif'}
                  </StatusBadge>
                </MTD>
              </MTBodyRow>
            ))}
          </tbody>
        </MonthlyTable>
      </Card>
    </PageContent>
  );
}

// ──────────── Big Bar Chart ────────────
function BigBarChart({ data, formatAmount }: { data: MonthlyData[]; formatAmount: (n: number) => string }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);
  const chartH = 200;
  const barW = 22;
  const gap = 6;
  const groupW = barW * 2 + gap + 22;
  const totalW = data.length * groupW + 30;
  const pTop = 12;
  const pBottom = 30;

  return (
    <ChartWrapper>
      <svg viewBox={`0 0 ${totalW} ${chartH + pTop + pBottom}`} style={{ width: '100%', overflow: 'visible' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = pTop + chartH - pct * chartH;
          const val = pct * maxVal;
          return (
            <g key={i}>
              <line x1="28" y1={y} x2={totalW} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              <text x="24" y={y + 4} textAnchor="end" fontSize={10} fill="#94A3B8" fontFamily="Poppins, sans-serif">
                {val >= 1000 ? `${Math.round(val / 1000)}K` : Math.round(val)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = i * groupW + 30;
          const incomeH = Math.max((d.income / maxVal) * chartH, d.income > 0 ? 3 : 0);
          const expenseH = Math.max((d.expense / maxVal) * chartH, d.expense > 0 ? 3 : 0);
          return (
            <g key={i}>
              <rect x={x} y={pTop + chartH - incomeH} width={barW} height={incomeH} fill="#10B981" rx={4}>
                <title>Gelir: {formatAmount(d.income)}</title>
              </rect>
              <rect x={x + barW + gap} y={pTop + chartH - expenseH} width={barW} height={expenseH} fill="#EF4444" rx={4}>
                <title>Gider: {formatAmount(d.expense)}</title>
              </rect>
              <text x={x + barW + gap / 2} y={pTop + chartH + pBottom - 6} textAnchor="middle" fontSize={11} fill="#64748B" fontFamily="Poppins, sans-serif">
                {d.month}
              </text>
            </g>
          );
        })}
        {/* Net line */}
        {data.length > 1 && (() => {
          const points = data.map((d, i) => {
            const x = i * groupW + 30 + barW + gap / 2;
            const net = d.income - d.expense;
            const y = pTop + chartH - Math.min(Math.max((net / maxVal) * chartH, 0), chartH);
            return `${x},${y}`;
          });
          return (
            <polyline
              points={points.join(' ')}
              fill="none"
              stroke="#6366F1"
              strokeWidth="2.5"
              strokeDasharray="6 3"
              strokeLinecap="round"
            />
          );
        })()}
      </svg>
    </ChartWrapper>
  );
}

// ──────────── Category Breakdown ────────────
function CategoryBreakdownList({
  data,
  formatAmount,
  type,
}: {
  data: CategoryData[];
  formatAmount: (n: number) => string;
  type: 'income' | 'expense';
}) {
  if (data.length === 0) return <EmptyState>Bu dönemde {type === 'income' ? 'gelir' : 'gider'} yok</EmptyState>;
  const maxAmt = Math.max(...data.map((d) => d.amount));

  return (
    <BreakdownList>
      {data.map((item, i) => (
        <BreakdownItem key={i}>
          <BreakdownTop>
            <BreakdownLeft>
              <BreakdownDot $color={item.color} />
              <BreakdownName>{item.category}</BreakdownName>
            </BreakdownLeft>
            <BreakdownRight>
              <BreakdownAmount>{formatAmount(item.amount)}</BreakdownAmount>
              <BreakdownPct>{item.percentage}%</BreakdownPct>
            </BreakdownRight>
          </BreakdownTop>
          <ProgressBar>
            <ProgressFill $color={item.color} $width={(item.amount / maxAmt) * 100} />
          </ProgressBar>
        </BreakdownItem>
      ))}
    </BreakdownList>
  );
}

ReportsPage.getLayout = (page: React.ReactNode) => <AppLayout title="Raporlar">{page}</AppLayout>;

// ──────────── Styled ────────────
const PageContent = styled.div`display: flex; flex-direction: column; gap: 2rem;`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.2rem;
`;

const PageSub = styled.p`font-size: 1.3rem; color: #64748B; margin: 0;`;

const PeriodToggle = styled.div`
  display: flex;
  background: white;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  overflow: hidden;
`;

const PeriodBtn = styled.button<{ $active: boolean }>`
  padding: 0.8rem 1.6rem;
  border: none;
  background: ${(p) => p.$active ? '#6366F1' : 'transparent'};
  color: ${(p) => p.$active ? 'white' : '#64748B'};
  font-size: 1.2rem;
  font-weight: ${(p) => p.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.15s;
  &:hover { background: ${(p) => p.$active ? '#4F46E5' : '#F8FAFC'}; }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.6rem;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const KpiCard = styled.div`
  background: white;
  border-radius: var(--app-radius);
  padding: 2rem;
  box-shadow: var(--app-shadow);
  display: flex;
  align-items: center;
  gap: 1.6rem;
`;

const KpiIcon = styled.div<{ $bg: string }>`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: ${(p) => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
`;

const KpiInfo = styled.div`min-width: 0;`;
const KpiLabel = styled.p`font-size: 1.1rem; color: #64748B; margin: 0 0 0.2rem; font-weight: 500;`;
const KpiValue = styled.p<{ $color: string }>`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${(p) => p.$color};
  margin: 0 0 0.2rem;
`;
const KpiSub = styled.p`font-size: 1.1rem; color: #94A3B8; margin: 0;`;

const Card = styled.div`
  background: white;
  border-radius: var(--app-radius);
  padding: 2rem;
  box-shadow: var(--app-shadow);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.6rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CardTitle = styled.h2`font-size: 1.5rem; font-weight: 700; color: #0F172A; margin: 0;`;

const ChartLegend = styled.div`display: flex; gap: 1.6rem; flex-wrap: wrap;`;
const LegendItem = styled.div`display: flex; align-items: center; gap: 0.6rem; font-size: 1.2rem; color: #64748B;`;
const LegendDot = styled.span<{ $color: string }>`width: 10px; height: 10px; border-radius: 50%; background: ${(p) => p.$color};`;

const ChartWrapper = styled.div`width: 100%; overflow-x: auto;`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.6rem;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const BreakdownList = styled.div`display: flex; flex-direction: column; gap: 1.2rem;`;

const BreakdownItem = styled.div``;

const BreakdownTop = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;`;
const BreakdownLeft = styled.div`display: flex; align-items: center; gap: 0.8rem;`;
const BreakdownDot = styled.span<{ $color: string }>`width: 10px; height: 10px; border-radius: 3px; background: ${(p) => p.$color}; flex-shrink: 0;`;
const BreakdownName = styled.span`font-size: 1.2rem; color: #0F172A;`;
const BreakdownRight = styled.div`display: flex; align-items: center; gap: 1rem;`;
const BreakdownAmount = styled.span`font-size: 1.3rem; font-weight: 600; color: #0F172A;`;
const BreakdownPct = styled.span`font-size: 1.1rem; color: #64748B; min-width: 36px; text-align: right;`;

const ProgressBar = styled.div`height: 6px; background: #F1F5F9; border-radius: 3px; overflow: hidden;`;
const ProgressFill = styled.div<{ $color: string; $width: number }>`
  height: 100%;
  width: ${(p) => p.$width}%;
  background: ${(p) => p.$color};
  border-radius: 3px;
  transition: width 0.5s ease;
`;

// Monthly Table
const MonthlyTable = styled.table`width: 100%; border-collapse: collapse; overflow-x: auto; display: block;`;
const MonthlyTHead = styled.thead``;
const MTRow = styled.tr``;
const MTH = styled.th`
  text-align: left;
  padding: 1rem 1.4rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #F8FAFC;
  white-space: nowrap;
`;
const MTBodyRow = styled.tr`
  border-bottom: 1px solid #F1F5F9;
  &:last-child { border-bottom: none; }
  &:hover { background: #FAFBFF; }
`;
const MTD = styled.td`padding: 1.2rem 1.4rem; font-size: 1.3rem; color: #374151; white-space: nowrap;`;
const MonthName = styled.span`font-weight: 600; color: #0F172A; text-transform: capitalize;`;
const IncomeText = styled.span`color: #10B981; font-weight: 600;`;
const ExpenseText = styled.span`color: #EF4444; font-weight: 600;`;
const NetText = styled.span<{ $positive: boolean }>`
  color: ${(p) => p.$positive ? '#6366F1' : '#EF4444'};
  font-weight: 700;
`;
const StatusBadge = styled.span<{ $positive: boolean }>`
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: 600;
  background: ${(p) => p.$positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};
  color: ${(p) => p.$positive ? '#10B981' : '#EF4444'};
`;

const EmptyState = styled.div`text-align: center; color: #94A3B8; font-size: 1.3rem; padding: 3rem 0;`;
