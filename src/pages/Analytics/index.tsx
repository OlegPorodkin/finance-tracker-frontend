import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, parseISO } from 'date-fns';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDateRange } from '@/hooks/useDateRange';
import { useAuthStore } from '@/store/auth.store';
import { getBalanceChartData } from '@/lib/analytics';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface BalancePoint {
  date: string;
  balance: number;
  openingBalance: number;
  income: number;
  expense: number;
  hasTransactions: boolean;
}

function BalanceTooltip({
  active, payload, label, currency,
}: {
  active?: boolean;
  payload?: Array<{ payload: BalancePoint }>;
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm text-sm min-w-[190px] space-y-1">
      <p className="font-medium">{format(parseISO(label), 'MMM d, yyyy')}</p>
      {d.hasTransactions && (
        <>
          <div className="flex justify-between gap-6 text-muted-foreground">
            <span>Opening</span>
            <span>{formatCurrency(Math.round(d.openingBalance * 100), currency)}</span>
          </div>
          {d.income > 0 && (
            <div className="flex justify-between gap-6 text-green-600">
              <span>Income</span>
              <span>+{formatCurrency(Math.round(d.income * 100), currency)}</span>
            </div>
          )}
          {d.expense > 0 && (
            <div className="flex justify-between gap-6 text-red-500">
              <span>Expenses</span>
              <span>−{formatCurrency(Math.round(d.expense * 100), currency)}</span>
            </div>
          )}
          <div className="border-t" />
        </>
      )}
      <div className="flex justify-between gap-6 font-semibold">
        <span>Balance</span>
        <span>{formatCurrency(Math.round(d.balance * 100), currency)}</span>
      </div>
    </div>
  );
}

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
  const { summary, byCategory, dailyTrend, openingBalance, isLoading } = useAnalytics();
  const { activeDateRange, setActiveDateRange } = useDateRange();
  const currency = useAuthStore((s) => s.user?.currency ?? 'USD');
  const [breakdownType, setBreakdownType] = useState<BreakdownType>('EXPENSE');

  const balanceData = getBalanceChartData(dailyTrend, openingBalance);
  const tickInterval = balanceData.length <= 14 ? 0 : Math.ceil(balanceData.length / 8);
  const filteredByType = byCategory
    .filter((b) => b.type === breakdownType)
    .sort((a, b) => b.totalAmountInCents - a.totalAmountInCents);
  const typeTotal = filteredByType.reduce((s, i) => s + i.totalAmountInCents, 0);
  const breakdownItems = filteredByType.map((item) => ({
    ...item,
    percentage: typeTotal > 0 ? (item.totalAmountInCents / typeTotal) * 100 : 0,
  }));

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

      {/* Balance chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">Loading…</div>
          ) : balanceData.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
              No data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={balanceData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  interval={tickInterval}
                  tickFormatter={(d: string) => format(parseISO(d), 'MMM d')}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCurrency(Math.round(v * 100), currency).replace(/\.00$/, '')}
                  width={80}
                />
                <Tooltip content={(props: any) => <BalanceTooltip {...props} currency={currency} />} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#gradBalance)"
                  dot={(props: any) => {
                    if (!props.payload.hasTransactions) return <g key={props.key} />;
                    return (
                      <circle
                        key={props.key}
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill="#6366f1"
                        stroke="white"
                        strokeWidth={1.5}
                      />
                    );
                  }}
                  activeDot={{ r: 5, fill: '#6366f1' }}
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
