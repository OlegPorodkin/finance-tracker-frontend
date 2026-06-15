import { Menu, Download, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { triggerFileDownload } from '@/lib/download';
import { logout } from '@/api/auth.api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopBar() {
  const navigate = useNavigate();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const activeDateRange = useUiStore((s) => s.activeDateRange);
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);

  function handleExport() {
    triggerFileDownload(
      `/api/v1/transactions/export?from=${activeDateRange.from}&to=${activeDateRange.to}&format=csv`
    );
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      logoutStore();
      navigate('/login', { replace: true });
    }
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4">
      <button onClick={toggleSidebar} className="rounded p-1 hover:bg-accent">
        <Menu size={20} />
      </button>
      <div className="flex-1" />
      <button
        onClick={handleExport}
        className="flex items-center gap-2 rounded px-3 py-1.5 text-sm hover:bg-accent"
      >
        <Download size={16} />
        Export CSV
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded px-3 py-1.5 text-sm hover:bg-accent">
          <User size={16} />
          {user?.name}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled className="text-muted-foreground text-xs">
            {user?.email}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
            <LogOut size={16} />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
