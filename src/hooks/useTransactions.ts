import { useTransactionStore } from '@/store/transaction.store';
import type { TransactionFilters } from '@/types';

export function useTransactions(filters: TransactionFilters = {}) {
  const page = useTransactionStore((s) => s.page);
  const isLoading = useTransactionStore((s) => s.isLoading);
  const fetch = useTransactionStore((s) => s.fetch);
  const add = useTransactionStore((s) => s.add);
  const update = useTransactionStore((s) => s.update);
  const remove = useTransactionStore((s) => s.remove);

  return { page, isLoading, fetch, add, update, remove, filters };
}
