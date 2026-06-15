import { Menu, Download } from 'lucide-react';
import { useUiStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { triggerFileDownload } from '@/lib/download';
import { useUiStore as useDateRangeStore } from '@/store/ui.store';

export function TopBar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const activeDateRange = useDateRangeStore((s) => s.activeDateRange);

  function handleExport() {
    triggerFileDownload(
      `/api/v1/transactions/export?from=${activeDateRange.from}&to=${activeDateRange.to}&format=csv`
    );
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4">
      <button onClick={toggleSidebar} className="rounded p-1 hover:bg-accent">
        <Menu size={20} />
      </button>
      <div className="flex-1" />
      <button onClick={handleExport} className="flex items-center gap-2 rounded px-3 py-1.5 text-sm hover:bg-accent">
        <Download size={16} />
        Export CSV
      </button>
      <span className="text-sm text-muted-foreground">{user?.name}</span>
    </header>
  );
}
