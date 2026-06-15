import { useCategoryStore } from '@/store/category.store';

export function useCategories() {
  const categories = useCategoryStore((s) => s.categories);
  const isLoading = useCategoryStore((s) => s.isLoading);
  const create = useCategoryStore((s) => s.create);
  const updateById = useCategoryStore((s) => s.updateById);
  const deleteById = useCategoryStore((s) => s.deleteById);

  const active = categories.filter((c) => !c.isDeleted);

  return { categories, active, isLoading, create, updateById, deleteById };
}
