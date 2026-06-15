import { useBudgetStore } from '@/store/budget.store';

export function useBudgets() {
  const budgets = useBudgetStore((s) => s.budgets);
  const budgetStatus = useBudgetStore((s) => s.budgetStatus);
  const isLoading = useBudgetStore((s) => s.isLoading);
  const fetch = useBudgetStore((s) => s.fetch);
  const create = useBudgetStore((s) => s.create);
  const updateById = useBudgetStore((s) => s.updateById);
  const deleteById = useBudgetStore((s) => s.deleteById);

  return { budgets, budgetStatus, isLoading, fetch, create, updateById, deleteById };
}
