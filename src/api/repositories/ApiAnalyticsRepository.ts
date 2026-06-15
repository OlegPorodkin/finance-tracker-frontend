import client from '../client';
import type { IAnalyticsRepository } from '@/repositories/IAnalyticsRepository';
import type { Summary, CategoryBreakdown, MonthlyTrend, DateRange } from '@/types';

export class ApiAnalyticsRepository implements IAnalyticsRepository {
  async getSummary(range: DateRange): Promise<Summary> {
    const response = await client.get<Summary>('/analytics/summary', { params: range });
    return response.data;
  }

  async getByCategory(range: DateRange): Promise<CategoryBreakdown[]> {
    const response = await client.get<CategoryBreakdown[]>('/analytics/by-category', { params: range });
    return response.data;
  }

  async getMonthlyTrend(range: DateRange): Promise<MonthlyTrend[]> {
    const response = await client.get<MonthlyTrend[]>('/analytics/monthly-trend', { params: range });
    return response.data;
  }
}
