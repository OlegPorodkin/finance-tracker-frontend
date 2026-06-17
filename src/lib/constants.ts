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
  // Еда
  'Utensils', 'Coffee', 'Pizza', 'Apple', 'Beer', 'Cookie', 'ChefHat',
  // Транспорт
  'Car', 'Train', 'Bus', 'Plane', 'Bike', 'Fuel', 'Anchor',
  // Покупки
  'ShoppingCart', 'ShoppingBag', 'Shirt', 'Package', 'Tag',
  // Жильё
  'Home', 'Lightbulb', 'Hammer', 'Key', 'Wrench',
  // Развлечения
  'Film', 'Music', 'Gamepad2', 'Tv', 'Headphones', 'Clapperboard', 'PartyPopper',
  // Здоровье
  'Heart', 'Dumbbell', 'Baby', 'Pill', 'Stethoscope', 'Salad',
  // Финансы
  'Wallet', 'CreditCard', 'DollarSign', 'TrendingUp', 'TrendingDown',
  'PiggyBank', 'Landmark', 'Banknote', 'Receipt', 'Award',
  // Работа
  'Briefcase', 'BarChart2', 'FileText', 'Laptop', 'Monitor', 'Sofa',
  // Образование
  'BookOpen', 'GraduationCap', 'Pencil',
  // Путешествия
  'Globe', 'Map', 'Hotel', 'Umbrella',
  // Технологии
  'Zap', 'Wifi', 'Phone',
  // Другое
  'PawPrint', 'Leaf', 'Sun', 'Star', 'Gift', 'ArrowDownLeft', 'ArrowUpRight',
] as const;

export const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#0ea5e9',
  '#84cc16', '#f43f5e',
] as const;
