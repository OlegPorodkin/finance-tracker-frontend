import { create } from 'zustand';
import type { Summary, CategoryBreakdown, DailyTrend, DateRange } from '@/types';
import type { IAnalyticsRepository } from '@/repositories/IAnalyticsRepository';

interface AnalyticsState {
  summary: Summary | null;
  byCategory: CategoryBreakdown[];
  dailyTrend: DailyTrend[];
  openingBalance: number;
  isStale: boolean;
  isLoading: boolean;
  repository: IAnalyticsRepository | null;
  lastFetchedRange: DateRange | null;

  setRepository: (repo: IAnalyticsRepository) => void;
  invalidate: () => void;
  fetchIfStale: (range: DateRange) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  summary: null,
  byCategory: [],
  dailyTrend: [],
  openingBalance: 0,
  isStale: true,
  isLoading: false,
  repository: null,
  lastFetchedRange: null,

  setRepository: (repo) => set({ repository: repo }),

  invalidate: () => set({ isStale: true }),

  fetchIfStale: async (range) => {
    const { repository, isStale, isLoading, lastFetchedRange } = get();
    if (!repository || isLoading) return;

    const rangeChanged =
      !lastFetchedRange ||
      lastFetchedRange.from !== range.from ||
      lastFetchedRange.to !== range.to;

    if (!isStale && !rangeChanged) return;

    set({ isLoading: true });
    try {
      const [summary, byCategory, dailyTrend, openingBalance] = await Promise.all([
        repository.getSummary(range),
        repository.getByCategory(range),
        repository.getDailyTrend(range),
        repository.getOpeningBalance(range),
      ]);
      set({ summary, byCategory, dailyTrend, openingBalance, isStale: false, lastFetchedRange: range });
    } finally {
      set({ isLoading: false });
    }
  },
}));
