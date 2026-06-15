import type { CategoryBreakdown, MonthlyTrend } from '@/types';

export function getPieChartData(byCategory: CategoryBreakdown[]) {
  return byCategory.map((item) => ({
    name: item.categoryName,
    value: item.totalAmountInCents,
    color: item.categoryColor,
  }));
}

export function getTrendChartData(monthlyTrend: MonthlyTrend[]) {
  return monthlyTrend.map((item) => ({
    label: `${item.year}-${String(item.month).padStart(2, '0')}`,
    income: item.totalIncomeInCents / 100,
    expense: item.totalExpenseInCents / 100,
  }));
}
