export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amountInCents: number;
  currency: string;
  date: string;
  description: string;
  categoryId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  type: 'INCOME' | 'EXPENSE';
  amountInCents: number;
  currency: string;
  date: string;
  description: string;
  categoryId: string;
  notes?: string;
}

export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {}

export interface TransactionFilters {
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}
