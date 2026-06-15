import type { Summary, CategoryBreakdown, MonthlyTrend, DateRange } from '@/types';

export interface IAnalyticsRepository {
  getSummary(range: DateRange): Promise<Summary>;
  getByCategory(range: DateRange): Promise<CategoryBreakdown[]>;
  getMonthlyTrend(range: DateRange): Promise<MonthlyTrend[]>;
}
