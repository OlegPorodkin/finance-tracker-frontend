import client from '../client';
import type { IAnalyticsRepository } from '@/repositories/IAnalyticsRepository';
import type { Summary, CategoryBreakdown, MonthlyTrend, DateRange } from '@/types';

interface RawSummary {
  incomeInCents: number;
  expenseInCents: number;
  netInCents: number;
  currency: string;
}

interface RawCategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amountInCents: number;
  percentage: number;
}

interface RawMonthlyTrend {
  year: number;
  month: number;
  incomeInCents: number;
  expenseInCents: number;
}

export class ApiAnalyticsRepository implements IAnalyticsRepository {
  async getSummary(range: DateRange): Promise<Summary> {
    const response = await client.get<RawSummary>('/analytics/summary', { params: range });
    const r = response.data;
    return {
      totalIncomeInCents: r.incomeInCents ?? 0,
      totalExpenseInCents: r.expenseInCents ?? 0,
      balanceInCents: r.netInCents ?? 0,
      currency: r.currency ?? 'USD',
      from: range.from,
      to: range.to,
    };
  }

  async getByCategory(range: DateRange): Promise<CategoryBreakdown[]> {
    const response = await client.get<RawCategoryBreakdown[]>('/analytics/by-category', { params: range });
    return response.data.map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      totalAmountInCents: r.amountInCents ?? 0,
      percentage: r.percentage ?? 0,
      // type/color/icon are not in the backend response — enriched in useAnalytics hook
      type: 'EXPENSE' as const,
      categoryColor: '#6b7280',
      categoryIcon: 'DollarSign',
    }));
  }

  async getMonthlyTrend(range: DateRange): Promise<MonthlyTrend[]> {
    const response = await client.get<RawMonthlyTrend[]>('/analytics/monthly-trend', { params: range });
    return response.data.map((r) => ({
      year: r.year,
      month: r.month,
      totalIncomeInCents: r.incomeInCents ?? 0,
      totalExpenseInCents: r.expenseInCents ?? 0,
    }));
  }
}
