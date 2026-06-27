import type { Summary, CategoryBreakdown, DailyTrend, DateRange } from '@/types';

export interface IAnalyticsRepository {
  getSummary(range: DateRange): Promise<Summary>;
  getByCategory(range: DateRange): Promise<CategoryBreakdown[]>;
  getDailyTrend(range: DateRange): Promise<DailyTrend[]>;
  getOpeningBalance(range: DateRange): Promise<number>;
}
