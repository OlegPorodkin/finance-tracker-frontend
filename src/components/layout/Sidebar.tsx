import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, BarChart2, Wallet, Tag, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/budgets', label: 'Budgets', icon: Wallet },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ open }: SidebarProps) {
  return (
    <aside className={cn('hidden flex-col border-r bg-card md:flex', open ? 'w-56' : 'w-16')}>
      <div className="flex h-14 items-center px-4 font-semibold">
        {open && 'Finance Tracker'}
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <Icon size={18} />
            {open && label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
