import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { useUiStore } from '@/store/ui.store';

export function AppShell() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
