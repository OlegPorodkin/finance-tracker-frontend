import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDateRange } from '@/hooks/useDateRange';
import { useAuthStore } from '@/store/auth.store';
import { getTrendChartData } from '@/lib/analytics';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

const PRESETS = [
  { label: 'This month',   range: () => ({ from: fmt(startOfMonth(new Date())), to: fmt(endOfMonth(new Date())) }) },
  { label: 'Last month',   range: () => ({ from: fmt(startOfMonth(subMonths(new Date(), 1))), to: fmt(endOfMonth(subMonths(new Date(), 1))) }) },
  { label: 'Last 3 months', range: () => ({ from: fmt(startOfMonth(subMonths(new Date(), 2))), to: fmt(endOfMonth(new Date())) }) },
  { label: 'Last 6 months', range: () => ({ from: fmt(startOfMonth(subMonths(new Date(), 5))), to: fmt(endOfMonth(new Date())) }) },
  { label: 'This year',    range: () => ({ from: fmt(startOfYear(new Date())), to: fmt(endOfYear(new Date())) }) },
] as const;

type BreakdownType = 'EXPENSE' | 'INCOME';

export function AnalyticsPage() {
  const { summary, byCategory, monthlyTrend, isLoading } = useAnalytics();
  const { activeDateRange, setActiveDateRange } = useDateRange();
  const currency = useAuthStore((s) => s.user?.currency ?? 'USD');
  const [breakdownType, setBreakdownType] = useState<BreakdownType>('EXPENSE');

  const trendData = getTrendChartData(monthlyTrend);
  const breakdownItems = byCategory
    .filter((b) => b.type === breakdownType)
    .sort((a, b) => b.totalAmountInCents - a.totalAmountInCents);

  const activePreset = PRESETS.find(
    (p) => p.range().from === activeDateRange.from && p.range().to === activeDateRange.to
  )?.label;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      {/* Date controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setActiveDateRange(preset.range())}
              className={cn(
                'rounded-full border px-3 py-1 text-sm transition-colors',
                activePreset === preset.label
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-accent text-muted-foreground'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-40"
            value={activeDateRange.from}
            onChange={(e) => setActiveDateRange({ ...activeDateRange, from: e.target.value })}
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="date"
            className="w-40"
            value={activeDateRange.to}
            onChange={(e) => setActiveDateRange({ ...activeDateRange, to: e.target.value })}
          />
          {summary && (
            <span className="ml-2 text-sm text-muted-foreground">
              Balance:{' '}
              <span className={cn('font-medium', summary.balanceInCents >= 0 ? 'text-green-600' : 'text-red-500')}>
                {formatCurrency(summary.balanceInCents, currency)}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Income vs Expenses by month</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">Loading…</div>
          ) : trendData.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
              No data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCurrency(v * 100, currency).replace(/\.00$/, '')}
                  width={72}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value * 100, currency),
                    name === 'income' ? 'Income' : 'Expenses',
                  ]}
                />
                <Legend formatter={(v) => (v === 'income' ? 'Income' : 'Expenses')} />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#gradIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#gradExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Breakdown by category</CardTitle>
          <div className="flex gap-1 rounded-lg border p-1">
            {(['EXPENSE', 'INCOME'] as BreakdownType[]).map((t) => (
              <button
                key={t}
                onClick={() => setBreakdownType(t)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  breakdownType === t
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t === 'EXPENSE' ? 'Expenses' : 'Income'}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : breakdownItems.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No {breakdownType.toLowerCase()} data for this period
            </div>
          ) : (
            <div className="space-y-4">
              {breakdownItems.map((item) => (
                <div key={item.categoryId} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <CategoryIcon
                        iconName={item.categoryIcon}
                        color={item.categoryColor}
                        size={15}
                      />
                      {item.categoryName}
                    </span>
                    <span className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">
                        {formatPercent(item.percentage)}
                      </span>
                      <span className="font-medium w-24 text-right">
                        {formatCurrency(item.totalAmountInCents, currency)}
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.categoryColor,
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* Totals row */}
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className="font-semibold">
                  {formatCurrency(
                    breakdownItems.reduce((s, i) => s + i.totalAmountInCents, 0),
                    currency
                  )}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
