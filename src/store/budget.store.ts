import { create } from 'zustand';
import type { Budget, BudgetStatus } from '@/types';
import type { IBudgetRepository } from '@/repositories/IBudgetRepository';

interface BudgetState {
  budgets: Budget[];
  budgetStatus: BudgetStatus[];
  isLoading: boolean;
  repository: IBudgetRepository | null;

  setRepository: (repo: IBudgetRepository) => void;
  fetch: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  add: (budget: Budget) => void;
  update: (budget: Budget) => void;
  remove: (id: string) => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  budgetStatus: [],
  isLoading: false,
  repository: null,

  setRepository: (repo) => set({ repository: repo }),

  fetch: async () => {
    const { repository } = get();
    if (!repository) return;
    set({ isLoading: true });
    try {
      const [budgets, budgetStatus] = await Promise.all([
        repository.getAll(),
        repository.getStatus(),
      ]);
      set({ budgets, budgetStatus });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshStatus: async () => {
    const { repository } = get();
    if (!repository) return;
    const budgetStatus = await repository.getStatus();
    set({ budgetStatus });
  },

  add: (budget) => set((state) => ({ budgets: [...state.budgets, budget] })),

  update: (budget) =>
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === budget.id ? budget : b)),
    })),

  remove: (id) =>
    set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) })),
}));
