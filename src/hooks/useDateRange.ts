import { useUiStore } from '@/store/ui.store';

export function useDateRange() {
  const activeDateRange = useUiStore((s) => s.activeDateRange);
  const setActiveDateRange = useUiStore((s) => s.setActiveDateRange);

  return { activeDateRange, setActiveDateRange };
}
