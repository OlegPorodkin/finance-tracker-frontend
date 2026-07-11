export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Budget {
  id: string;
  categoryId: string;
  limitAmountInCents: number;
  period: BudgetPeriod;
  startDate: string;
  alertThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetStatus {
  id: string;
  categoryId: string;
  period: BudgetPeriod;
  limitAmountInCents: number;
  spentInCents: number;
  remainingInCents: number;
  alertThreshold: number;
  spentPercentage: number;
  alertTriggered: boolean;
  startDate: string;
  endDate: string;
}

export interface CreateBudgetRequest {
  categoryId: string;
  limitAmountInCents: number;
  period: BudgetPeriod;
  startDate: string;
  alertThreshold: number;
}

export interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {}
