import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, BarChart2, Wallet, Tag, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui.store';

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

function NavLinks({ showLabels, onNav }: { showLabels: boolean; onNav?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-2">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNav}
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
          {showLabels && label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar({ open }: SidebarProps) {
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useUiStore((s) => s.closeMobileSidebar);

  return (
    <>
      {/* Mobile drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobileSidebar} />
          <aside className="absolute bottom-0 left-0 top-0 z-10 flex w-56 flex-col border-r bg-card">
            <div className="flex h-14 items-center justify-between px-4 font-semibold">
              Finance Tracker
              <button onClick={closeMobileSidebar} className="rounded p-1 hover:bg-accent">
                <X size={18} />
              </button>
            </div>
            <NavLinks showLabels onNav={closeMobileSidebar} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={cn('hidden flex-col border-r bg-card md:flex', open ? 'w-56' : 'w-16')}>
        <div className="flex h-14 items-center px-4 font-semibold">
          {open && 'Finance Tracker'}
        </div>
        <NavLinks showLabels={open} />
      </aside>
    </>
  );
}
