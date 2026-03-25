import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type TransactionType = 'income' | 'expense';

export const INCOME_CATEGORIES = ['Maaş', 'Freelance', 'Yatırım', 'Kira Geliri', 'Yan Gelir', 'Prim', 'Diğer'];
export const EXPENSE_CATEGORIES = ['Kira', 'Market', 'Ulaşım', 'Fatura', 'Restoran', 'Eğlence', 'Sağlık', 'Eğitim', 'Giyim', 'Alışveriş', 'Spor', 'Sigorta', 'Diğer'];

export type Transaction = {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
};

export type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  count: number;
};

export type CategoryData = {
  category: string;
  amount: number;
  percentage: number;
  color: string;
};

export type MonthlyData = {
  month: string;
  income: number;
  expense: number;
};

type ContextType = {
  transactions: Transaction[];
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  summary: Summary;
  expenseByCategory: CategoryData[];
  incomeByCategory: CategoryData[];
  monthlyData: MonthlyData[];
};

const Context = createContext<ContextType | null>(null);

const STORAGE_KEY = 'saas_tracker_v1';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F97316', '#F59E0B', '#10B981', '#14B8A6', '#06B6D4', '#3B82F6', '#64748B', '#84CC16'];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getSample(): Transaction[] {
  const fmt = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };
  return [
    { id: '1', type: 'income', category: 'Maaş', amount: 25000, description: 'Mart ayı maaşı', date: fmt(0), createdAt: new Date().toISOString() },
    { id: '2', type: 'expense', category: 'Kira', amount: 8500, description: 'Mart ayı kira', date: fmt(1), createdAt: new Date().toISOString() },
    { id: '3', type: 'expense', category: 'Market', amount: 1800, description: 'Haftalık alışveriş', date: fmt(3), createdAt: new Date().toISOString() },
    { id: '4', type: 'income', category: 'Freelance', amount: 5000, description: 'Web sitesi projesi', date: fmt(5), createdAt: new Date().toISOString() },
    { id: '5', type: 'expense', category: 'Fatura', amount: 650, description: 'Elektrik ve su', date: fmt(7), createdAt: new Date().toISOString() },
    { id: '6', type: 'expense', category: 'Ulaşım', amount: 800, description: 'Aylık ulaşım kartı', date: fmt(10), createdAt: new Date().toISOString() },
    { id: '7', type: 'expense', category: 'Restoran', amount: 450, description: 'İş yemeği', date: fmt(12), createdAt: new Date().toISOString() },
    { id: '8', type: 'income', category: 'Yatırım', amount: 1200, description: 'Temettü geliri', date: fmt(15), createdAt: new Date().toISOString() },
    { id: '9', type: 'expense', category: 'Sağlık', amount: 350, description: 'Doktor kontrolü', date: fmt(18), createdAt: new Date().toISOString() },
    { id: '10', type: 'expense', category: 'Eğlence', amount: 600, description: 'Sinema ve kafé', date: fmt(20), createdAt: new Date().toISOString() },
  ];
}

export function ExpenseTrackerProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTransactions(JSON.parse(stored));
      } else {
        const sample = getSample();
        setTransactions(sample);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); } catch {}
    }
  }, [transactions, loaded]);

  const addTransaction = useCallback((data: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions(prev => [{ ...data, id: genId(), createdAt: new Date().toISOString() }, ...prev]);
  }, []);

  const updateTransaction = useCallback((id: string, data: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const summary = useMemo<Summary>(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, count: transactions.length };
  }, [transactions]);

  const expenseByCategory = useMemo<CategoryData[]>(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    const total = summary.totalExpense;
    return Array.from(map.entries())
      .map(([category, amount], i) => ({ category, amount, percentage: total > 0 ? (amount / total) * 100 : 0, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, summary.totalExpense]);

  const incomeByCategory = useMemo<CategoryData[]>(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === 'income').forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    const total = summary.totalIncome;
    return Array.from(map.entries())
      .map(([category, amount], i) => ({ category, amount, percentage: total > 0 ? (amount / total) * 100 : 0, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, summary.totalIncome]);

  const monthlyData = useMemo<MonthlyData[]>(() => {
    const data: MonthlyData[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
      const txs = transactions.filter(t => { const td = new Date(t.date); return td.getFullYear() === year && td.getMonth() === month; });
      data.push({ month: label, income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) });
    }
    return data;
  }, [transactions]);

  return (
    <Context.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, summary, expenseByCategory, incomeByCategory, monthlyData }}>
      {children}
    </Context.Provider>
  );
}

export function useExpenseTracker() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useExpenseTracker must be used within ExpenseTrackerProvider');
  return ctx;
}
