import client from '../client';
import type { IBudgetRepository } from '@/repositories/IBudgetRepository';
import type { Budget, BudgetStatus, CreateBudgetRequest, UpdateBudgetRequest } from '@/types';

export class ApiBudgetRepository implements IBudgetRepository {
  async getAll(): Promise<Budget[]> {
    const response = await client.get<Budget[]>('/budgets');
    return response.data;
  }

  async getById(id: string): Promise<Budget> {
    const response = await client.get<Budget>(`/budgets/${id}`);
    return response.data;
  }

  async getStatus(): Promise<BudgetStatus[]> {
    const response = await client.get<BudgetStatus[]>('/budgets/status');
    return response.data;
  }

  async create(data: CreateBudgetRequest): Promise<Budget> {
    const response = await client.post<Budget>('/budgets', data);
    return response.data;
  }

  async update(id: string, data: UpdateBudgetRequest): Promise<Budget> {
    const response = await client.put<Budget>(`/budgets/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await client.delete(`/budgets/${id}`);
  }
}
