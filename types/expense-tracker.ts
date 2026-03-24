export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: TransactionType | 'both';
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  userName: string;
  email: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryData {
  category: string;
  color: string;
  amount: number;
  percentage: number;
}
