import { create } from 'zustand';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types';
import type { ICategoryRepository } from '@/repositories/ICategoryRepository';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  repository: ICategoryRepository | null;

  setRepository: (repo: ICategoryRepository) => void;
  initialize: () => Promise<void>;
  create: (data: CreateCategoryRequest) => Promise<Category>;
  updateById: (id: string, data: UpdateCategoryRequest) => Promise<Category>;
  deleteById: (id: string) => Promise<void>;

  // local state helpers
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

  create: async (data) => {
    const { repository } = get();
    if (!repository) throw new Error('Repository not set');
    const category = await repository.create(data);
    get().add(category);
    return category;
  },

  updateById: async (id, data) => {
    const { repository } = get();
    if (!repository) throw new Error('Repository not set');
    const category = await repository.update(id, data);
    get().update(category);
    return category;
  },

  deleteById: async (id) => {
    const { repository } = get();
    if (!repository) throw new Error('Repository not set');
    await repository.delete(id);
    get().remove(id);
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
