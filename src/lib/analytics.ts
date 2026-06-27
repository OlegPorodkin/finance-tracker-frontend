import type { CategoryBreakdown, DailyTrend } from '@/types';

export function getPieChartData(byCategory: CategoryBreakdown[]) {
  return byCategory.map((item) => ({
    name: item.categoryName,
    value: item.totalAmountInCents,
    color: item.categoryColor,
  }));
}

export function getBalanceChartData(dailyTrend: DailyTrend[], openingBalanceCents: number) {
  let running = openingBalanceCents;
  return dailyTrend.map((item) => {
    const openingBalance = running;
    running += item.totalIncomeInCents - item.totalExpenseInCents;
    return {
      date: item.date,
      balance: running / 100,
      openingBalance: openingBalance / 100,
      income: item.totalIncomeInCents / 100,
      expense: item.totalExpenseInCents / 100,
      hasTransactions: item.hasTransactions,
    };
  });
}
