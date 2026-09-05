import { useNavigate } from 'react-router';
import { useDocuments } from '@/hooks/useDocuments';
import { useAppStore } from '@/store';
import { cn, formatRelativeDate, truncateText, stripHtml } from '@/lib/utils';
import { Star, FileText, Menu } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

export function Favorites() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useDocuments();
  const { setMobileMenuOpen } = useAppStore();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)]">
        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-[var(--color-bg-hover)]" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        <Star className="w-5 h-5 text-amber-400" />
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Favorites</h1>
        <span className="text-sm text-[var(--color-text-tertiary)]">{favorites.length}</span>
      </div>

      <div className="px-6 py-4">
        {favorites.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No favorites yet"
            description="Star documents to see them here"
          />
        ) : (
          <div className="space-y-1">
            {favorites.map((doc) => (
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
                <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">{formatRelativeDate(doc.updated_at)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id); }}
                  className="p-1 rounded hover:bg-[var(--color-bg-active)] shrink-0"
                  aria-label="Remove from favorites"
                >
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
