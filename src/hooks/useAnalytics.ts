import { useEffect } from 'react';
import { useAnalyticsStore } from '@/store/analytics.store';
import { useUiStore } from '@/store/ui.store';

export function useAnalytics() {
  const summary = useAnalyticsStore((s) => s.summary);
  const byCategory = useAnalyticsStore((s) => s.byCategory);
  const monthlyTrend = useAnalyticsStore((s) => s.monthlyTrend);
  const isLoading = useAnalyticsStore((s) => s.isLoading);
  const fetchIfStale = useAnalyticsStore((s) => s.fetchIfStale);
  const activeDateRange = useUiStore((s) => s.activeDateRange);

  useEffect(() => {
    fetchIfStale(activeDateRange);
  }, [fetchIfStale, activeDateRange]);

  return { summary, byCategory, monthlyTrend, isLoading };
}
