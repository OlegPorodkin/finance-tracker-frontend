import { useCategoryStore } from '@/store/category.store';

export function useCategories() {
  const categories = useCategoryStore((s) => s.categories);
  const isLoading = useCategoryStore((s) => s.isLoading);
  const add = useCategoryStore((s) => s.add);
  const update = useCategoryStore((s) => s.update);
  const remove = useCategoryStore((s) => s.remove);

  const active = categories.filter((c) => !c.isDeleted);

  return { categories, active, isLoading, add, update, remove };
}
