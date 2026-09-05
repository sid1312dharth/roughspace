import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center min-h-[300px]', className)}>
      <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br from-[var(--color-bg-tertiary)] to-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-[var(--shadow-glow)]">
        <Icon className="w-6 h-6 text-[var(--color-primary)]" />
      </div>
      <h3 className="text-base font-medium text-[var(--color-text)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-tertiary)] max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
