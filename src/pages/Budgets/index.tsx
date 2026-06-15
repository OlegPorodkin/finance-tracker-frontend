import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, TrendingUp } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useAuthStore } from '@/store/auth.store';
import type { Budget } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BudgetModal } from './BudgetModal';

const PERIOD_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
};

export function BudgetsPage() {
  const { budgets, budgetStatus, isLoading, fetch, create, updateById, deleteById } = useBudgets();
  const { categories } = useCategories();
  const currency = useAuthStore((s) => s.user?.currency ?? 'USD');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch();
  }, [fetch]);

  function openCreate() {
    setEditingBudget(null);
    setIsModalOpen(true);
  }

  function openEdit(budget: Budget) {
    setEditingBudget(budget);
    setIsModalOpen(true);
  }

  async function handleModalSubmit(data: Parameters<typeof create>[0]) {
    if (editingBudget) {
      await updateById(editingBudget.id, data);
    } else {
      await create(data);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    await deleteById(deletingId);
    setDeletingId(null);
  }

  const deletingBudget = budgets.find((b) => b.id === deletingId);
  const deletingCategory = categories.find((c) => c.id === deletingBudget?.categoryId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} />
          Add budget
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : budgets.length === 0 ? (
        <EmptyState
          title="No budgets yet"
          description="Create a budget to track your spending limits."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const status = budgetStatus.find((s) => s.budgetId === budget.id);
            const category = categories.find((c) => c.id === budget.categoryId);
            const pct = status ? Math.min(status.percentage, 100) : 0;
            const isExceeded = status?.isExceeded ?? false;
            const isAlert = status?.isAlertThresholdReached ?? false;

            return (
              <div
                key={budget.id}
                className={cn(
                  'rounded-lg border bg-card p-5 space-y-4',
                  isExceeded && 'border-destructive/50',
                  isAlert && !isExceeded && 'border-yellow-400/50'
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {category && (
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <CategoryIcon iconName={category.icon} color={category.color} size={18} />
                      </div>
                    )}
                    <div>
                      <p className="font-medium leading-tight">{category?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {PERIOD_LABELS[budget.period]}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(budget)}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeletingId(budget.id)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>

                {/* Status badge */}
                {isExceeded && (
                  <Badge variant="destructive" className="gap-1 text-xs w-fit">
                    <AlertTriangle size={11} />
                    Over budget
                  </Badge>
                )}
                {isAlert && !isExceeded && (
                  <Badge className="gap-1 text-xs w-fit bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    <AlertTriangle size={11} />
                    Approaching limit
                  </Badge>
                )}

                {/* Progress */}
                <div className="space-y-2">
                  <Progress
                    value={pct}
                    className={cn(
                      'h-2',
                      isExceeded
                        ? '[&>div]:bg-destructive'
                        : isAlert
                        ? '[&>div]:bg-yellow-500'
                        : '[&>div]:bg-primary'
                    )}
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {status
                        ? formatCurrency(status.spentAmountInCents, currency)
                        : '—'}{' '}
                      spent
                    </span>
                    <span className="font-medium">
                      {formatCurrency(budget.limitAmountInCents, currency)} limit
                    </span>
                  </div>
                </div>

                {/* Footer: percentage + alert threshold */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                  <span className="flex items-center gap-1">
                    <TrendingUp size={11} />
                    {status ? formatPercent(status.percentage) : '0%'} used
                  </span>
                  <span>Alert at {budget.alertThreshold}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BudgetModal
        open={isModalOpen}
        budget={editingBudget}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title={`Delete budget for "${deletingCategory?.name ?? '—'}"?`}
        description="This will remove the budget. Your transactions will not be affected."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
