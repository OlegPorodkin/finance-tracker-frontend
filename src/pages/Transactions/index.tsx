import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useDateRange } from '@/hooks/useDateRange';
import { useAnalyticsStore } from '@/store/analytics.store';
import { useBudgetStore } from '@/store/budget.store';
import type { Transaction } from '@/types';
import { PAGE_SIZE } from '@/lib/constants';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TransactionModal } from './TransactionModal';

const ALL = 'ALL';

export function TransactionsPage() {
  const { page, isLoading, fetch, createTransaction, updateById, deleteById } = useTransactions();
  const { categories, active: activeCategories } = useCategories();
  const { activeDateRange, setActiveDateRange } = useDateRange();
  const invalidateAnalytics = useAnalyticsStore((s) => s.invalidate);
  const refreshBudgetStatus = useBudgetStore((s) => s.refreshStatus);

  const [type, setType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>(ALL);
  const [categoryId, setCategoryId] = useState(ALL);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(0);
  }, [type, categoryId, debouncedSearch, activeDateRange]);

  useEffect(() => {
    fetch({
      type: type !== ALL ? type : undefined,
      categoryId: categoryId !== ALL ? categoryId : undefined,
      from: activeDateRange.from,
      to: activeDateRange.to,
      search: debouncedSearch || undefined,
      page: currentPage,
      size: PAGE_SIZE,
    });
  }, [type, categoryId, activeDateRange, debouncedSearch, currentPage, fetch]);

  function openCreate() {
    setEditingTransaction(null);
    setIsModalOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }

  async function handleModalSubmit(data: Parameters<typeof createTransaction>[0]) {
    if (editingTransaction) {
      await updateById(editingTransaction.id, data);
    } else {
      await createTransaction(data);
    }
    invalidateAnalytics();
    refreshBudgetStatus();
  }

  async function handleDelete() {
    if (!deletingId) return;
    await deleteById(deletingId);
    setDeletingId(null);
    invalidateAnalytics();
    refreshBudgetStatus();
  }

  function resetFilters() {
    setType(ALL);
    setCategoryId(ALL);
    setSearch('');
  }

  const hasFilters = type !== ALL || categoryId !== ALL || search !== '';
  const transactions = page?.content ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} />
          Add transaction
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {activeCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="w-36"
          value={activeDateRange.from}
          onChange={(e) => setActiveDateRange({ ...activeDateRange, from: e.target.value })}
        />
        <span className="text-muted-foreground text-sm">—</span>
        <Input
          type="date"
          className="w-36"
          value={activeDateRange.to}
          onChange={(e) => setActiveDateRange({ ...activeDateRange, to: e.target.value })}
        />

        <Input
          placeholder="Search…"
          className="w-48"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X size={14} />
            Reset
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Try adjusting the filters or add a new transaction."
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => {
                  const category = categories.find((c) => c.id === t.categoryId);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {formatDate(t.date)}
                      </TableCell>
                      <TableCell className="font-medium">{t.description}</TableCell>
                      <TableCell>
                        {category ? (
                          <span className="flex items-center gap-1.5">
                            <CategoryIcon iconName={category.icon} color={category.color} />
                            <span className="text-sm">{category.name}</span>
                            {category.isDeleted && (
                              <Badge variant="secondary" className="text-xs">Deleted</Badge>
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'font-medium',
                            t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'
                          )}
                        >
                          {t.type === 'INCOME' ? '+' : '−'}
                          <CurrencyDisplay amountInCents={t.amountInCents} />
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(t)}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeletingId(t.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {page && page.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {page.totalElements} transaction{page.totalElements !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft size={14} />
                </Button>
                <span>
                  {currentPage + 1} / {page.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={currentPage >= page.totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <TransactionModal
        open={isModalOpen}
        transaction={editingTransaction}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete transaction"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
