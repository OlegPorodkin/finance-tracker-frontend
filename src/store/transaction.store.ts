import { create } from 'zustand';
import type { Transaction, TransactionFilters } from '@/types';
import type { PageResponse } from '@/types';
import type { ITransactionRepository } from '@/repositories/ITransactionRepository';

interface TransactionState {
  page: PageResponse<Transaction> | null;
  isLoading: boolean;
  repository: ITransactionRepository | null;

  setRepository: (repo: ITransactionRepository) => void;
  fetch: (filters: TransactionFilters) => Promise<void>;
  add: (transaction: Transaction) => void;
  update: (transaction: Transaction) => void;
  remove: (id: string) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  page: null,
  isLoading: false,
  repository: null,

  setRepository: (repo) => set({ repository: repo }),

  fetch: async (filters) => {
    const { repository } = get();
    if (!repository) return;
    set({ isLoading: true });
    try {
      const page = await repository.getAll(filters);
      set({ page });
    } finally {
      set({ isLoading: false });
    }
  },

  add: (transaction) =>
    set((state) => {
      if (!state.page) return {};
      return { page: { ...state.page, content: [transaction, ...state.page.content] } };
    }),

  update: (transaction) =>
    set((state) => {
      if (!state.page) return {};
      return {
        page: {
          ...state.page,
          content: state.page.content.map((t) => (t.id === transaction.id ? transaction : t)),
        },
      };
    }),

  remove: (id) =>
    set((state) => {
      if (!state.page) return {};
      return {
        page: {
          ...state.page,
          content: state.page.content.filter((t) => t.id !== id),
          totalElements: state.page.totalElements - 1,
        },
      };
    }),
}));
