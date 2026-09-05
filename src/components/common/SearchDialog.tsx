import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '@/store';
import * as dbService from '@/services/database';
import { cn, formatRelativeDate, truncateText, stripHtml } from '@/lib/utils';
import { Search, FileText, X } from 'lucide-react';
import type { Document } from '@/types';

export function SearchDialog() {
  const navigate = useNavigate();
  const { searchOpen, setSearchOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Document[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const docs = await dbService.searchDocuments({ query: q });
      setResults(docs.slice(0, 20));
    } catch {
      setResults([]);
    }
    setSearching(false);
  }, []);

  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => doSearch(query), 200);
    return () => clearTimeout(searchTimerRef.current);
  }, [query, doSearch]);

  const openDocument = (doc: Document) => {
    setSearchOpen(false);
    navigate(`/editor/${doc.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      openDocument(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-[var(--color-bg-overlay)]"
        onClick={() => setSearchOpen(false)}
      />
      <div
        className={cn(
          'relative w-full max-w-xl mx-4 rounded-2xl overflow-hidden',
          'bg-[var(--color-surface)] border border-[var(--color-border)]',
          'shadow-xl animate-scale-in'
        )}
      >
        <div className="flex items-center gap-3 px-4 border-b border-[var(--color-border)]">
          <Search className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search documents..."
            className={cn(
              'flex-1 py-3.5 bg-transparent border-none outline-none text-sm',
              'text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]'
            )}
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="p-1 rounded hover:bg-[var(--color-bg-hover)]"
          >
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto py-2">
          {!query.trim() ? (
            <p className="px-4 py-8 text-sm text-[var(--color-text-tertiary)] text-center">
              Start typing to search...
            </p>
          ) : searching ? (
            <p className="px-4 py-8 text-sm text-[var(--color-text-tertiary)] text-center">
              Searching...
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-sm text-[var(--color-text-tertiary)] text-center">
              No documents found for "{query}"
            </p>
          ) : (
            results.map((doc, index) => {
              const plainContent = stripHtml(doc.content);
              const queryLower = query.toLowerCase();
              let snippet = '';

              // Find matching snippet
              const contentLower = plainContent.toLowerCase();
              const matchIndex = contentLower.indexOf(queryLower);
              if (matchIndex >= 0) {
                const start = Math.max(0, matchIndex - 40);
                const end = Math.min(plainContent.length, matchIndex + query.length + 40);
                snippet = (start > 0 ? '...' : '') + plainContent.slice(start, end) + (end < plainContent.length ? '...' : '');
              } else {
                snippet = truncateText(plainContent, 100);
              }

              return (
                <button
                  key={doc.id}
                  onClick={() => openDocument(doc)}
                  className={cn(
                    'flex items-start gap-3 w-full px-4 py-3 text-left transition-colors',
                    index === selectedIndex
                      ? 'bg-[var(--color-primary-light)]'
                      : 'hover:bg-[var(--color-bg-hover)]'
                  )}
                >
                  <FileText className="w-4 h-4 mt-0.5 text-[var(--color-text-tertiary)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                      {doc.title || 'Untitled Document'}
                    </p>
                    {snippet && (
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 line-clamp-2">
                        {snippet}
                      </p>
                    )}
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                      {formatRelativeDate(doc.updated_at)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
