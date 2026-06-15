import { create } from 'zustand';
import type { Summary, CategoryBreakdown, MonthlyTrend, DateRange } from '@/types';
import type { IAnalyticsRepository } from '@/repositories/IAnalyticsRepository';

interface AnalyticsState {
  summary: Summary | null;
  byCategory: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
  isStale: boolean;
  isLoading: boolean;
  repository: IAnalyticsRepository | null;

  setRepository: (repo: IAnalyticsRepository) => void;
  invalidate: () => void;
  fetchIfStale: (range: DateRange) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  summary: null,
  byCategory: [],
  monthlyTrend: [],
  isStale: true,
  isLoading: false,
  repository: null,

  setRepository: (repo) => set({ repository: repo }),

  invalidate: () => set({ isStale: true }),

  fetchIfStale: async (range) => {
    const { repository, isStale, isLoading } = get();
    if (!repository || !isStale || isLoading) return;
    set({ isLoading: true });
    try {
      const [summary, byCategory, monthlyTrend] = await Promise.all([
        repository.getSummary(range),
        repository.getByCategory(range),
        repository.getMonthlyTrend(range),
      ]);
      set({ summary, byCategory, monthlyTrend, isStale: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
