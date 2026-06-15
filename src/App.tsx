import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './router';
import { getMe } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { useCategoryStore } from '@/store/category.store';
import { ApiCategoryRepository } from '@/api/repositories/ApiCategoryRepository';
import { ApiTransactionRepository } from '@/api/repositories/ApiTransactionRepository';
import { ApiBudgetRepository } from '@/api/repositories/ApiBudgetRepository';
import { ApiAnalyticsRepository } from '@/api/repositories/ApiAnalyticsRepository';
import { useTransactionStore } from '@/store/transaction.store';
import { useBudgetStore } from '@/store/budget.store';
import { useAnalyticsStore } from '@/store/analytics.store';

const categoryRepo = new ApiCategoryRepository();
const transactionRepo = new ApiTransactionRepository();
const budgetRepo = new ApiBudgetRepository();
const analyticsRepo = new ApiAnalyticsRepository();

export function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const setIsInitializing = useUiStore((s) => s.setIsInitializing);
  const initializeCategories = useCategoryStore((s) => s.initialize);
  const setCategoryRepo = useCategoryStore((s) => s.setRepository);
  const setTransactionRepo = useTransactionStore((s) => s.setRepository);
  const setBudgetRepo = useBudgetStore((s) => s.setRepository);
  const setAnalyticsRepo = useAnalyticsStore((s) => s.setRepository);

  useEffect(() => {
    setCategoryRepo(categoryRepo);
    setTransactionRepo(transactionRepo);
    setBudgetRepo(budgetRepo);
    setAnalyticsRepo(analyticsRepo);

    async function init() {
      try {
        const [user] = await Promise.all([getMe(), initializeCategories()]);
        setUser(user);
      } catch {
        // unauthenticated — PrivateRoute will redirect to /login
      } finally {
        setIsInitializing(false);
      }
    }

    init();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
