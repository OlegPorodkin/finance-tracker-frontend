import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Scale, ArrowRight, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useDateRange } from '@/hooks/useDateRange';
import { useAuthStore } from '@/store/auth.store';
import { getPieChartData } from '@/lib/analytics';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function DashboardPage() {
  const { summary, byCategory, isLoading: analyticsLoading } = useAnalytics();
  const { budgets, budgetStatus, fetch: fetchBudgets } = useBudgets();
  const { page: txPage, fetch: fetchTx } = useTransactions();
  const { categories } = useCategories();
  const { activeDateRange } = useDateRange();
  const currency = useAuthStore((s) => s.user?.currency ?? 'USD');

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  useEffect(() => {
    fetchTx({ from: activeDateRange.from, to: activeDateRange.to, size: 5, page: 0 });
  }, [activeDateRange, fetchTx]);

  const expensePieData = getPieChartData(byCategory.filter((b) => b.type === 'EXPENSE'));
  const recentTransactions = txPage?.content ?? [];
  const topBudgetStatus = budgetStatus.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {activeDateRange.from} — {activeDateRange.to}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Income"
          icon={<TrendingUp size={18} className="text-green-600" />}
          value={summary ? formatCurrency(summary.totalIncomeInCents, currency) : '—'}
          loading={analyticsLoading}
          accent="green"
        />
        <SummaryCard
          title="Expenses"
          icon={<TrendingDown size={18} className="text-red-500" />}
          value={summary ? formatCurrency(summary.totalExpenseInCents, currency) : '—'}
          loading={analyticsLoading}
          accent="red"
        />
        <SummaryCard
          title="Balance"
          icon={<Scale size={18} className="text-primary" />}
          value={summary ? formatCurrency(summary.balanceInCents, currency) : '—'}
          loading={analyticsLoading}
          accent={summary && summary.balanceInCents >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Pie chart + Budget status */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Expense pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expenses by category</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                Loading…
              </div>
            ) : expensePieData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No expense data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={expensePieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {expensePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency)}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Budget status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Budgets</CardTitle>
            <Link
              to="/budgets"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              View all <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {topBudgetStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No budgets set up yet
              </p>
            ) : (
              topBudgetStatus.map((status) => {
                const budget = budgets.find((b) => b.id === status.budgetId);
                const category = categories.find((c) => c.id === status.categoryId);
                const pct = Math.min(status.percentage, 100);
                return (
                  <div key={status.budgetId} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        {category && (
                          <CategoryIcon
                            iconName={category.icon}
                            color={category.color}
                            size={14}
                          />
                        )}
                        {category?.name ?? '—'}
                        {(status.isExceeded || status.isAlertThresholdReached) && (
                          <AlertTriangle
                            size={13}
                            className={status.isExceeded ? 'text-destructive' : 'text-yellow-500'}
                          />
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <CurrencyDisplay amountInCents={status.spentAmountInCents} /> /{' '}
                        {budget && formatCurrency(budget.limitAmountInCents, currency)}
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className={cn(
                        'h-2',
                        status.isExceeded
                          ? '[&>div]:bg-destructive'
                          : status.isAlertThresholdReached
                          ? '[&>div]:bg-yellow-500'
                          : ''
                      )}
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent transactions</CardTitle>
          <Link
            to="/transactions"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            View all <ArrowRight size={12} />
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No transactions for this period
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t) => {
                const category = categories.find((c) => c.id === t.categoryId);
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    {category ? (
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <CategoryIcon iconName={category.icon} color={category.color} size={15} />
                      </div>
                    ) : (
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'
                      )}
                    >
                      {t.type === 'INCOME' ? '+' : '−'}
                      <CurrencyDisplay amountInCents={t.amountInCents} />
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  loading: boolean;
  accent: 'green' | 'red' | 'neutral';
}

function SummaryCard({ title, icon, value, loading, accent }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon}
        </div>
        <p
          className={cn(
            'mt-2 text-2xl font-bold',
            accent === 'green' && 'text-green-600',
            accent === 'red' && 'text-red-500'
          )}
        >
          {loading ? <span className="text-muted-foreground text-lg">—</span> : value}
        </p>
      </CardContent>
    </Card>
  );
}