import type { Budget, BudgetStatus, CreateBudgetRequest, UpdateBudgetRequest } from '@/types';

export interface IBudgetRepository {
  getAll(): Promise<Budget[]>;
  getById(id: string): Promise<Budget>;
  getStatus(): Promise<BudgetStatus[]>;
  create(data: CreateBudgetRequest): Promise<Budget>;
  update(id: string, data: UpdateBudgetRequest): Promise<Budget>;
  delete(id: string): Promise<void>;
}
