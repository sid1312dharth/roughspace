import { useEffect, useRef, } from 'react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function Toast() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: { id: string; type: string; title: string; description?: string; duration?: number };
  onDismiss: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, toast.duration || 4000);
    return () => clearTimeout(timerRef.current);
  }, [toast.duration, onDismiss]);

  const colors = {
    success: 'border-l-[var(--color-success)]',
    error: 'border-l-[var(--color-error)]',
    warning: 'border-l-[var(--color-warning)]',
    info: 'border-l-[var(--color-info)]',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={cn(
        'toast-enter flex items-start gap-3 p-3 rounded-xl border-l-4',
        'bg-[var(--color-surface-elevated)] shadow-lg',
        'border border-[var(--color-border)]',
        colors[toast.type as keyof typeof colors] || colors.info
      )}
      role="alert"
    >
      <span className="text-sm mt-0.5">{icons[toast.type as keyof typeof icons] || 'ℹ'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)]">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)]"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
