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
  budgetId: string;
  categoryId: string;
  spentAmountInCents: number;
  limitAmountInCents: number;
  percentage: number;
  isExceeded: boolean;
  isAlertThresholdReached: boolean;
}

export interface CreateBudgetRequest {
  categoryId: string;
  limitAmountInCents: number;
  period: BudgetPeriod;
  startDate: string;
  alertThreshold: number;
}

export interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {}
