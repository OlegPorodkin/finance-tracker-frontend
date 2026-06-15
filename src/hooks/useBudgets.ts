import { useBudgetStore } from '@/store/budget.store';

export function useBudgets() {
  const budgets = useBudgetStore((s) => s.budgets);
  const budgetStatus = useBudgetStore((s) => s.budgetStatus);
  const isLoading = useBudgetStore((s) => s.isLoading);
  const fetch = useBudgetStore((s) => s.fetch);
  const refreshStatus = useBudgetStore((s) => s.refreshStatus);
  const add = useBudgetStore((s) => s.add);
  const update = useBudgetStore((s) => s.update);
  const remove = useBudgetStore((s) => s.remove);

  return { budgets, budgetStatus, isLoading, fetch, refreshStatus, add, update, remove };
}
