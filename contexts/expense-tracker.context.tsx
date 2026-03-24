import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Transaction, Category, AppSettings, MonthlyData, CategoryData, TransactionType } from 'types/expense-tracker';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-salary', name: 'Maaş', color: '#6366F1', icon: '💼', type: 'income' },
  { id: 'cat-freelance', name: 'Serbest Çalışma', color: '#8B5CF6', icon: '💻', type: 'income' },
  { id: 'cat-investment', name: 'Yatırım Geliri', color: '#06B6D4', icon: '📈', type: 'income' },
  { id: 'cat-rental', name: 'Kira Geliri', color: '#0EA5E9', icon: '🏠', type: 'income' },
  { id: 'cat-other-income', name: 'Diğer Gelir', color: '#14B8A6', icon: '💰', type: 'income' },
  { id: 'cat-food', name: 'Yiyecek & İçecek', color: '#F59E0B', icon: '🍔', type: 'expense' },
  { id: 'cat-transport', name: 'Ulaşım', color: '#3B82F6', icon: '🚗', type: 'expense' },
  { id: 'cat-housing', name: 'Konut & Kira', color: '#84CC16', icon: '🏘️', type: 'expense' },
  { id: 'cat-entertainment', name: 'Eğlence', color: '#F43F5E', icon: '🎬', type: 'expense' },
  { id: 'cat-health', name: 'Sağlık', color: '#10B981', icon: '⚕️', type: 'expense' },
  { id: 'cat-shopping', name: 'Alışveriş', color: '#EC4899', icon: '🛍️', type: 'expense' },
  { id: 'cat-education', name: 'Eğitim', color: '#F97316', icon: '📚', type: 'expense' },
  { id: 'cat-bills', name: 'Faturalar', color: '#EF4444', icon: '📄', type: 'expense' },
  { id: 'cat-other-expense', name: 'Diğer Gider', color: '#6B7280', icon: '📦', type: 'expense' },
];

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'TRY',
  currencySymbol: '₺',
  userName: 'Kullanıcı',
  email: 'kullanici@example.com',
};

function generateSampleData(): Transaction[] {
  const now = new Date();
  const transactions: Transaction[] = [];
  let idCounter = 1;

  const addTransaction = (
    type: TransactionType,
    amount: number,
    category: string,
    description: string,
    daysAgo: number,
  ) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    transactions.push({
      id: `sample-${idCounter++}`,
      type,
      amount,
      category,
      description,
      date: format(date, 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
    });
  };

  // Current month
  addTransaction('income', 25000, 'cat-salary', 'Aylık maaş', 2);
  addTransaction('expense', 3200, 'cat-housing', 'Kira ödemesi', 3);
  addTransaction('expense', 850, 'cat-food', 'Market alışverişi', 4);
  addTransaction('expense', 320, 'cat-transport', 'Akbil yükleme', 5);
  addTransaction('income', 4500, 'cat-freelance', 'Web tasarım projesi', 6);
  addTransaction('expense', 450, 'cat-entertainment', 'Netflix, Spotify abonelik', 7);
  addTransaction('expense', 280, 'cat-health', 'Diş hekimi muayenesi', 8);
  addTransaction('expense', 1200, 'cat-shopping', 'Giyim alışverişi', 9);
  addTransaction('expense', 650, 'cat-bills', 'Elektrik, su, internet', 10);

  // Last month
  addTransaction('income', 25000, 'cat-salary', 'Aylık maaş', 35);
  addTransaction('expense', 3200, 'cat-housing', 'Kira ödemesi', 36);
  addTransaction('expense', 920, 'cat-food', 'Market alışverişi', 38);
  addTransaction('income', 2800, 'cat-freelance', 'Logo tasarım', 40);
  addTransaction('expense', 380, 'cat-transport', 'Yakıt', 42);
  addTransaction('expense', 750, 'cat-entertainment', 'Sinema ve yemek', 44);
  addTransaction('expense', 1500, 'cat-education', 'Online kurs', 45);
  addTransaction('expense', 590, 'cat-bills', 'Faturalar', 46);
  addTransaction('income', 1200, 'cat-investment', 'Temettü geliri', 48);
  addTransaction('expense', 430, 'cat-health', 'İlaç', 50);

  // 2 months ago
  addTransaction('income', 25000, 'cat-salary', 'Aylık maaş', 65);
  addTransaction('expense', 3200, 'cat-housing', 'Kira ödemesi', 66);
  addTransaction('expense', 1100, 'cat-food', 'Market alışverişi', 68);
  addTransaction('expense', 2500, 'cat-shopping', 'Elektronik alışveriş', 70);
  addTransaction('income', 6000, 'cat-freelance', 'Mobil uygulama', 72);
  addTransaction('expense', 500, 'cat-transport', 'Araç bakım', 74);
  addTransaction('expense', 680, 'cat-bills', 'Faturalar', 76);
  addTransaction('expense', 320, 'cat-entertainment', 'Kitap ve dergi', 78);

  // 3 months ago
  addTransaction('income', 25000, 'cat-salary', 'Aylık maaş', 95);
  addTransaction('expense', 3200, 'cat-housing', 'Kira ödemesi', 96);
  addTransaction('expense', 980, 'cat-food', 'Market alışverişi', 98);
  addTransaction('income', 3500, 'cat-investment', 'Hisse senedi getirisi', 100);
  addTransaction('expense', 450, 'cat-transport', 'Toplu taşıma', 102);
  addTransaction('expense', 1800, 'cat-health', 'Gözlük', 104);
  addTransaction('expense', 720, 'cat-bills', 'Faturalar', 106);

  return transactions;
}

interface ExpenseTrackerContextType {
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, c: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  getTotalIncome: (transactions?: Transaction[]) => number;
  getTotalExpense: (transactions?: Transaction[]) => number;
  getBalance: (transactions?: Transaction[]) => number;
  getMonthlyData: (months?: number) => MonthlyData[];
  getCategoryBreakdown: (type: TransactionType, monthsAgo?: number) => CategoryData[];
  formatAmount: (amount: number) => string;
  clearAllData: () => void;
}

const ExpenseTrackerContext = createContext<ExpenseTrackerContextType | null>(null);

export function ExpenseTrackerProvider({ children }: PropsWithChildren) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTransactions = localStorage.getItem('et_transactions');
    const savedCategories = localStorage.getItem('et_categories');
    const savedSettings = localStorage.getItem('et_settings');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      const sample = generateSampleData();
      setTransactions(sample);
      localStorage.setItem('et_transactions', JSON.stringify(sample));
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      localStorage.setItem('et_categories', JSON.stringify(DEFAULT_CATEGORIES));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      localStorage.setItem('et_settings', JSON.stringify(DEFAULT_SETTINGS));
    }

    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem('et_transactions', JSON.stringify(transactions));
  }, [transactions, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem('et_categories', JSON.stringify(categories));
  }, [categories, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem('et_settings', JSON.stringify(settings));
  }, [settings, initialized]);

  const addTransaction = (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, t: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions((prev) => prev.map((txn) => (txn.id === id ? { ...txn, ...t } : txn)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((txn) => txn.id !== id));
  };

  const addCategory = (c: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...c,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: string, c: Omit<Category, 'id'>) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...c } : cat)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const updateSettings = (s: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...s }));
  };

  const clearAllData = () => {
    const sample = generateSampleData();
    setTransactions(sample);
    setCategories(DEFAULT_CATEGORIES);
    setSettings(DEFAULT_SETTINGS);
  };

  const getTotalIncome = (txns = transactions) =>
    txns.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  const getTotalExpense = (txns = transactions) =>
    txns.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const getBalance = (txns = transactions) => getTotalIncome(txns) - getTotalExpense(txns);

  const getMonthlyData = (months = 6): MonthlyData[] => {
    const result: MonthlyData[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthTxns = transactions.filter((t) => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
      result.push({
        month: format(date, 'MMM', { locale: tr }),
        income: getTotalIncome(monthTxns),
        expense: getTotalExpense(monthTxns),
      });
    }
    return result;
  };

  const getCategoryBreakdown = (type: TransactionType, monthsAgo = 0): CategoryData[] => {
    let filtered = transactions.filter((t) => t.type === type);
    if (monthsAgo > 0) {
      const date = subMonths(new Date(), monthsAgo - 1);
      const start = startOfMonth(date);
      const end = endOfMonth(new Date());
      filtered = filtered.filter((t) => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
    }
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    const map: Record<string, number> = {};
    filtered.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          category: cat?.name ?? catId,
          color: cat?.color ?? '#6B7280',
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <ExpenseTrackerContext.Provider
      value={{
        transactions,
        categories,
        settings,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        getTotalIncome,
        getTotalExpense,
        getBalance,
        getMonthlyData,
        getCategoryBreakdown,
        formatAmount,
        clearAllData,
      }}
    >
      {children}
    </ExpenseTrackerContext.Provider>
  );
}

export function useExpenseTracker() {
  const ctx = useContext(ExpenseTrackerContext);
  if (!ctx) throw new Error('useExpenseTracker must be used within ExpenseTrackerProvider');
  return ctx;
}
