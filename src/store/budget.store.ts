import { create } from 'zustand';
import type { Budget, BudgetStatus, CreateBudgetRequest, UpdateBudgetRequest } from '@/types';
import type { IBudgetRepository } from '@/repositories/IBudgetRepository';

interface BudgetState {
  budgets: Budget[];
  budgetStatus: BudgetStatus[];
  isLoading: boolean;
  repository: IBudgetRepository | null;

  setRepository: (repo: IBudgetRepository) => void;
  fetch: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  create: (data: CreateBudgetRequest) => Promise<Budget>;
  updateById: (id: string, data: UpdateBudgetRequest) => Promise<Budget>;
  deleteById: (id: string) => Promise<void>;

  // local state helpers
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

  create: async (data) => {
    const { repository } = get();
    if (!repository) throw new Error('Repository not set');
    const budget = await repository.create(data);
    get().add(budget);
    await get().refreshStatus();
    return budget;
  },

  updateById: async (id, data) => {
    const { repository } = get();
    if (!repository) throw new Error('Repository not set');
    const budget = await repository.update(id, data);
    get().update(budget);
    await get().refreshStatus();
    return budget;
  },

  deleteById: async (id) => {
    const { repository } = get();
    if (!repository) throw new Error('Repository not set');
    await repository.delete(id);
    get().remove(id);
    await get().refreshStatus();
  },

  add: (budget) => set((state) => ({ budgets: [...state.budgets, budget] })),

  update: (budget) =>
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === budget.id ? budget : b)),
    })),

  remove: (id) =>
    set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) })),
}));
