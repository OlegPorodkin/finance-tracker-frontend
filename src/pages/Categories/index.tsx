import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CategoryModal } from './CategoryModal';

const ALL = 'ALL' as const;
type TypeFilter = typeof ALL | 'INCOME' | 'EXPENSE';

export function CategoriesPage() {
  const { active, create, updateById, deleteById } = useCategories();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = typeFilter === ALL ? active : active.filter((c) => c.type === typeFilter);

  function openCreate() {
    setEditingCategory(null);
    setIsModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setIsModalOpen(true);
  }

  async function handleModalSubmit(data: Parameters<typeof create>[0]) {
    if (editingCategory) {
      await updateById(editingCategory.id, data);
    } else {
      await create(data);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    await deleteById(deletingId);
    setDeletingId(null);
  }

  const deletingCategory = active.find((c) => c.id === deletingId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} />
          Add category
        </Button>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-1 rounded-lg border p-1 w-fit">
        {(['ALL', 'INCOME', 'EXPENSE'] as TypeFilter[]).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              typeFilter === t
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t === ALL ? 'All' : t === 'INCOME' ? 'Income' : 'Expense'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No categories"
          description="Add your first category to get started."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-4"
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: category.color + '20' }}
              >
                <CategoryIcon iconName={category.icon} color={category.color} size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{category.name}</p>
                <Badge
                  variant="secondary"
                  className={cn(
                    'mt-0.5 text-xs',
                    category.type === 'INCOME'
                      ? 'text-green-600 bg-green-50'
                      : 'text-red-500 bg-red-50'
                  )}
                >
                  {category.type === 'INCOME' ? 'Income' : 'Expense'}
                </Badge>
              </div>

              <div className="flex flex-shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openEdit(category)}
                >
                  <Pencil size={14} />
                </Button>
                {!category.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeletingId(category.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        open={isModalOpen}
        category={editingCategory}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title={`Delete "${deletingCategory?.name}"?`}
        description="Transactions with this category will remain but the category will be marked as deleted."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
