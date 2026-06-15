export interface Summary {
  totalIncomeInCents: number;
  totalExpenseInCents: number;
  balanceInCents: number;
  currency: string;
  from: string;
  to: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  type: 'INCOME' | 'EXPENSE';
  totalAmountInCents: number;
  percentage: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  totalIncomeInCents: number;
  totalExpenseInCents: number;
}

export interface DateRange {
  from: string;
  to: string;
}
