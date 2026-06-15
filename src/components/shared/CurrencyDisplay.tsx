import { useAuthStore } from '@/store/auth.store';
import { formatCurrency } from '@/lib/formatters';

interface CurrencyDisplayProps {
  amountInCents: number;
  className?: string;
}

export function CurrencyDisplay({ amountInCents, className }: CurrencyDisplayProps) {
  const currency = useAuthStore((s) => s.user?.currency ?? 'USD');
  return <span className={className}>{formatCurrency(amountInCents, currency)}</span>;
}
