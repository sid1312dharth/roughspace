import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Link as LinkIcon, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkDialogProps {
  isOpen: boolean;
  initialUrl?: string;
  initialText?: string;
  isExistingLink?: boolean;
  onSave: (url: string, openInNewTab: boolean) => void;
  onRemove?: () => void;
  onClose: () => void;
}

export function LinkDialog({
  isOpen,
  initialUrl = '',
  isExistingLink = false,
  onSave,
  onRemove,
  onClose,
}: LinkDialogProps) {
  const [url, setUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl || '');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialUrl]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith('mailto:') && !finalUrl.startsWith('#')) {
      finalUrl = `https://${finalUrl}`;
    }

    onSave(finalUrl, openInNewTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 backdrop-blur-2xl z-10 animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-sm">
              <LinkIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text)]">
              {isExistingLink ? 'Edit Link' : 'Insert Link'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              Destination URL
            </label>
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-xl text-sm',
                  'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]',
                  'focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]',
                  'placeholder:text-[var(--color-text-tertiary)] transition-all'
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)]"
              />
              <span className="flex items-center gap-1.5">
                Open in new tab
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)] gap-2">
            {isExistingLink && onRemove ? (
              <button
                type="button"
                onClick={() => {
                  onRemove();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Link
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!url.trim()}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm',
                  'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]',
                  'hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                )}
              >
                {isExistingLink ? 'Update Link' : 'Insert Link'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
