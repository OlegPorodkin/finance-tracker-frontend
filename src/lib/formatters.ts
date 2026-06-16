export function formatCurrency(amountInCents: number | undefined | null, currency: string): string {
  if (amountInCents == null || isNaN(amountInCents)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountInCents / 100);
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(year, month - 1, day));
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
