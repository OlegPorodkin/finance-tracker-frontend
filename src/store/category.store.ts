import { create } from 'zustand';
import type { Category } from '@/types';
import type { ICategoryRepository } from '@/repositories/ICategoryRepository';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  repository: ICategoryRepository | null;

  setRepository: (repo: ICategoryRepository) => void;
  initialize: () => Promise<void>;
  add: (category: Category) => void;
  update: (category: Category) => void;
  remove: (id: string) => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  repository: null,

  setRepository: (repo) => set({ repository: repo }),

  initialize: async () => {
    const { repository } = get();
    if (!repository) return;
    set({ isLoading: true });
    try {
      const categories = await repository.getAll();
      set({ categories });
    } finally {
      set({ isLoading: false });
    }
  },

  add: (category) => set((state) => ({ categories: [...state.categories, category] })),

  update: (category) =>
    set((state) => ({
      categories: state.categories.map((c) => (c.id === category.id ? category : c)),
    })),

  remove: (id) =>
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, isDeleted: true } : c)),
    })),
}));
