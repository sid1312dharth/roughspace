import { useDocuments } from '@/hooks/useDocuments';
import { useAppStore } from '@/store';
import { cn, formatRelativeDate } from '@/lib/utils';
import { Trash2, RotateCcw, AlertTriangle, Menu } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/common/EmptyState';

export function Trash() {
  const { trash, restoreDocument, permanentlyDeleteDocument, emptyTrash } = useDocuments();
  const { setMobileMenuOpen } = useAppStore();
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-[var(--color-bg-hover)]" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <Trash2 className="w-5 h-5 text-[var(--color-text-tertiary)]" />
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Trash</h1>
          <span className="text-sm text-[var(--color-text-tertiary)]">{trash.length}</span>
        </div>
        {trash.length > 0 && !confirmEmpty && (
          <button onClick={() => setConfirmEmpty(true)} className="text-sm text-[var(--color-error)] hover:underline">
            Empty Trash
          </button>
        )}
        {confirmEmpty && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-error)]">Delete all permanently?</span>
            <button onClick={() => { emptyTrash(); setConfirmEmpty(false); }} className="px-3 py-1 text-sm rounded-lg bg-[var(--color-error)] text-white">
              Yes, Empty
            </button>
            <button onClick={() => setConfirmEmpty(false)} className="px-3 py-1 text-sm rounded-lg border border-[var(--color-border)]">
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-4">
        {trash.length === 0 ? (
          <EmptyState
            icon={Trash2}
            title="Trash is empty"
            description="Deleted documents will appear here"
          />
        ) : (
          <div className="space-y-1">
            {trash.map((doc) => (
              <div key={doc.id} className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl',
                'hover:bg-[var(--color-bg-hover)] transition-colors group'
              )}>
                <Trash2 className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{doc.title || 'Untitled Document'}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Deleted {doc.deleted_at ? formatRelativeDate(doc.deleted_at) : 'recently'}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => restoreDocument(doc.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg hover:bg-[var(--color-bg-active)] text-[var(--color-primary)]"
                    aria-label="Restore"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                  <button
                    onClick={() => permanentlyDeleteDocument(doc.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg hover:bg-[var(--color-bg-active)] text-[var(--color-error)]"
                    aria-label="Delete permanently"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
