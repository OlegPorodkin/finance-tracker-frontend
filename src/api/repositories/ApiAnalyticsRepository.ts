import client from '../client';
import { parseISO, eachDayOfInterval, format, subDays } from 'date-fns';
import type { IAnalyticsRepository } from '@/repositories/IAnalyticsRepository';
import type { Summary, CategoryBreakdown, DailyTrend, DateRange, PageResponse, Transaction } from '@/types';

interface RawSummary {
  incomeInCents: number;
  expenseInCents: number;
  netInCents: number;
  currency: string;
}

export class ApiAnalyticsRepository implements IAnalyticsRepository {
  private async fetchTransactions(range: DateRange): Promise<Transaction[]> {
    const all: Transaction[] = [];
    let page = 0;
    const size = 500;
    while (true) {
      const res = await client.get<PageResponse<Transaction>>('/transactions', {
        params: { from: range.from, to: range.to, size, page },
      });
      all.push(...res.data.content);
      if (page >= res.data.totalPages - 1) break;
      page++;
    }
    return all;
  }

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
    const transactions = await this.fetchTransactions(range);

    const byCat = new Map<string, { amount: number; type: 'INCOME' | 'EXPENSE' }>();
    for (const tx of transactions) {
      const entry = byCat.get(tx.categoryId);
      if (!entry) {
        byCat.set(tx.categoryId, { amount: tx.amountInCents, type: tx.type });
      } else {
        entry.amount += tx.amountInCents;
      }
    }

    const totals = { INCOME: 0, EXPENSE: 0 };
    for (const { amount, type } of byCat.values()) {
      totals[type] += amount;
    }

    return Array.from(byCat.entries()).map(([categoryId, { amount, type }]) => ({
      categoryId,
      categoryName: categoryId,
      totalAmountInCents: amount,
      percentage: totals[type] > 0 ? (amount / totals[type]) * 100 : 0,
      type,
      categoryColor: '#6b7280',
      categoryIcon: 'DollarSign',
    }));
  }

  async getDailyTrend(range: DateRange): Promise<DailyTrend[]> {
    const transactions = await this.fetchTransactions(range);

    const byDate = new Map<string, { income: number; expense: number }>();
    for (const tx of transactions) {
      const entry = byDate.get(tx.date) ?? { income: 0, expense: 0 };
      if (tx.type === 'INCOME') entry.income += tx.amountInCents;
      else entry.expense += tx.amountInCents;
      byDate.set(tx.date, entry);
    }

    const days = eachDayOfInterval({ start: parseISO(range.from), end: parseISO(range.to) });
    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const entry = byDate.get(dateStr);
      return {
        date: dateStr,
        totalIncomeInCents: entry?.income ?? 0,
        totalExpenseInCents: entry?.expense ?? 0,
        hasTransactions: !!entry,
      };
    });
  }

  async getOpeningBalance(range: DateRange): Promise<number> {
    const beforeDate = format(subDays(parseISO(range.from), 1), 'yyyy-MM-dd');
    const response = await client.get<RawSummary>('/analytics/summary', {
      params: { from: '2000-01-01', to: beforeDate },
    });
    return response.data.netInCents ?? 0;
  }
}
