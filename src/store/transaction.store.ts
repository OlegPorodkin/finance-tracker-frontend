import { create } from 'zustand';
import type { Transaction, TransactionFilters, CreateTransactionRequest, UpdateTransactionRequest } from '@/types';
import type { PageResponse } from '@/types';
import type { ITransactionRepository } from '@/repositories/ITransactionRepository';
import { useAuthStore } from '@/store/auth.store';

interface TransactionState {
  page: PageResponse<Transaction> | null;
  isLoading: boolean;
  repository: ITransactionRepository | null;

  setRepository: (repo: ITransactionRepository) => void;
  fetch: (filters: TransactionFilters) => Promise<void>;
  createTransaction: (data: Omit<CreateTransactionRequest, 'currency'>) => Promise<Transaction>;
  updateById: (id: string, data: UpdateTransactionRequest) => Promise<Transaction>;
  deleteById: (id: string) => Promise<void>;

  // local state helpers (used after API calls)
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

  createTransaction: async (data) => {
    const { repository } = get();
    if (!repository) throw new Error('Repository not set');
    const currency = useAuthStore.getState().user?.currency ?? 'USD';
    const transaction = await repository.create({ ...data, currency });
    get().add(transaction);
    return transaction;
  },

  updateById: async (id, data) => {
    const { repository } = get();
    if (!repository) throw new Error('Repository not set');
    const transaction = await repository.update(id, data);
    get().update(transaction);
    return transaction;
  },

  deleteById: async (id) => {
    const { repository } = get();
    if (!repository) throw new Error('Repository not set');
    await repository.delete(id);
    get().remove(id);
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
