import { useTransactionStore } from '@/store/transaction.store';

export function useTransactions() {
  const page = useTransactionStore((s) => s.page);
  const isLoading = useTransactionStore((s) => s.isLoading);
  const fetch = useTransactionStore((s) => s.fetch);
  const createTransaction = useTransactionStore((s) => s.createTransaction);
  const updateById = useTransactionStore((s) => s.updateById);
  const deleteById = useTransactionStore((s) => s.deleteById);

  return { page, isLoading, fetch, createTransaction, updateById, deleteById };
}
