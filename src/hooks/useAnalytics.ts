import { useEffect } from 'react';
import { useAnalyticsStore } from '@/store/analytics.store';
import { useCategoryStore } from '@/store/category.store';
import { useUiStore } from '@/store/ui.store';

export function useAnalytics() {
  const summary = useAnalyticsStore((s) => s.summary);
  const byCategory = useAnalyticsStore((s) => s.byCategory);
  const dailyTrend = useAnalyticsStore((s) => s.dailyTrend);
  const openingBalance = useAnalyticsStore((s) => s.openingBalance);
  const isLoading = useAnalyticsStore((s) => s.isLoading);
  const fetchIfStale = useAnalyticsStore((s) => s.fetchIfStale);
  const activeDateRange = useUiStore((s) => s.activeDateRange);
  const categories = useCategoryStore((s) => s.categories);

  useEffect(() => {
    fetchIfStale(activeDateRange);
  }, [fetchIfStale, activeDateRange]);

  // Backend CategoryBreakdown omits type/color/icon — join with category store
  const enrichedByCategory = byCategory.map((item) => {
    const cat = categories.find((c) => c.id === item.categoryId);
    return {
      ...item,
      type: (cat?.type ?? item.type) as 'INCOME' | 'EXPENSE',
      categoryName: cat?.name ?? item.categoryName,
      categoryColor: cat?.color ?? item.categoryColor,
      categoryIcon: cat?.icon ?? item.categoryIcon,
    };
  });

  return { summary, byCategory: enrichedByCategory, dailyTrend, openingBalance, isLoading };
}