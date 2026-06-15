import { createElement } from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  color: string;
  size?: number;
}

export function CategoryIcon({ iconName, color, size = 16 }: CategoryIconProps) {
  const Icon = (LucideIcons as Record<string, unknown>)[iconName];
  if (typeof Icon !== 'function') {
    return <span className="inline-block rounded-full" style={{ width: size, height: size, backgroundColor: color }} />;
  }
  return createElement(Icon as React.ElementType, { size, color });
}
