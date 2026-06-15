import client from '../client';
import type { ITransactionRepository } from '@/repositories/ITransactionRepository';
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest, TransactionFilters } from '@/types';
import type { PageResponse } from '@/types';

export class ApiTransactionRepository implements ITransactionRepository {
  async getAll(filters: TransactionFilters): Promise<PageResponse<Transaction>> {
    const response = await client.get<PageResponse<Transaction>>('/transactions', { params: filters });
    return response.data;
  }

  async getById(id: string): Promise<Transaction> {
    const response = await client.get<Transaction>(`/transactions/${id}`);
    return response.data;
  }

  async create(data: CreateTransactionRequest): Promise<Transaction> {
    const response = await client.post<Transaction>('/transactions', data);
    return response.data;
  }

  async update(id: string, data: UpdateTransactionRequest): Promise<Transaction> {
    const response = await client.put<Transaction>(`/transactions/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await client.delete(`/transactions/${id}`);
  }
}
