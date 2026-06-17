import { create } from 'zustand';
import type { DateRange } from '@/types';
import { format, startOfMonth, endOfMonth } from 'date-fns';

function defaultRange(): DateRange {
  const now = new Date();
  return {
    from: format(startOfMonth(now), 'yyyy-MM-dd'),
    to: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
}

interface UiState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  activeDateRange: DateRange;
  isInitializing: boolean;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setActiveDateRange: (range: DateRange) => void;
  setIsInitializing: (value: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  activeDateRange: defaultRange(),
  isInitializing: true,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  setActiveDateRange: (range) => set({ activeDateRange: range }),
  setIsInitializing: (value) => set({ isInitializing: value }),
}));
