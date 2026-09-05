import { useNavigate } from 'react-router';
import { useDocuments } from '@/hooks/useDocuments';
import { useAppStore } from '@/store';
import { cn, formatRelativeDate, truncateText, stripHtml } from '@/lib/utils';
import { Clock, FileText, Star, Menu } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

export function Recent() {
  const navigate = useNavigate();
  const { recent, toggleFavorite } = useDocuments();
  const { setMobileMenuOpen } = useAppStore();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)]">
        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-[var(--color-bg-hover)]" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        <Clock className="w-5 h-5 text-[var(--color-text-tertiary)]" />
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Recent</h1>
      </div>

      <div className="px-6 py-4">
        {recent.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No recent documents"
            description="Documents you open will appear here"
          />
        ) : (
          <div className="space-y-1">
            {recent.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/editor/${doc.id}`)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left',
                  'hover:bg-[var(--color-bg-hover)] transition-colors group'
                )}
              >
                <FileText className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{doc.title || 'Untitled Document'}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] truncate">{truncateText(stripHtml(doc.content), 80) || 'Empty document'}</p>
                </div>
                <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">{formatRelativeDate(doc.last_opened_at)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id); }}
                  className="p-1 rounded hover:bg-[var(--color-bg-active)] shrink-0"
                  aria-label="Toggle favorite"
                >
                  <Star className={cn('w-4 h-4', doc.is_favorite ? 'text-amber-400 fill-amber-400' : 'text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100')} />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
