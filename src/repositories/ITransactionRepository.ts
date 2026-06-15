import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest, TransactionFilters } from '@/types';
import type { PageResponse } from '@/types';

export interface ITransactionRepository {
  getAll(filters: TransactionFilters): Promise<PageResponse<Transaction>>;
  getById(id: string): Promise<Transaction>;
  create(data: CreateTransactionRequest): Promise<Transaction>;
  update(id: string, data: UpdateTransactionRequest): Promise<Transaction>;
  delete(id: string): Promise<void>;
}
