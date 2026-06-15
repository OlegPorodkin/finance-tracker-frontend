export const PAGE_SIZE = 50;

export const CURRENCY_OPTIONS = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'KZT', name: 'Kazakhstani Tenge' },
  { code: 'UAH', name: 'Ukrainian Hryvnia' },
] as const;

export const CURRENCIES = CURRENCY_OPTIONS.map((c) => c.code);

export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;

export const BUDGET_PERIODS = ['WEEKLY', 'MONTHLY', 'YEARLY'] as const;

export const CATEGORY_ICONS = [
  'ShoppingCart', 'ShoppingBag', 'Utensils', 'Coffee', 'Car', 'Home',
  'Heart', 'Briefcase', 'Wallet', 'CreditCard', 'DollarSign', 'TrendingUp',
  'PiggyBank', 'Zap', 'Wifi', 'Phone', 'Music', 'Film', 'Gift', 'Plane',
  'Train', 'Bus', 'Baby', 'Dumbbell', 'BookOpen', 'Gamepad2', 'Monitor',
  'Shirt', 'Wrench', 'ArrowDownLeft', 'ArrowUpRight', 'Landmark',
] as const;

export const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#0ea5e9',
  '#84cc16', '#f43f5e',
] as const;
