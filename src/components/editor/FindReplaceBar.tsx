import { useState, useEffect, useCallback, useRef } from 'react';
import { type Editor } from '@tiptap/react';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Replace, 
  X, 
  CaseSensitive
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FindReplaceBarProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
}

interface MatchRange {
  from: number;
  to: number;
}

export function FindReplaceBar({ editor, isOpen, onClose }: FindReplaceBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [matches, setMatches] = useState<MatchRange[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [showReplace, setShowReplace] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Select match in editor
  const selectMatch = useCallback((match: MatchRange) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .setTextSelection({ from: match.from, to: match.to })
      .scrollIntoView()
      .run();
  }, [editor]);

  // Scan document for matches
  const findMatches = useCallback(() => {
    if (!editor || !searchTerm.trim()) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const doc = editor.state.doc;
    const found: MatchRange[] = [];
    const query = isCaseSensitive ? searchTerm : searchTerm.toLowerCase();

    doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        const text = isCaseSensitive ? node.text : node.text.toLowerCase();
        let index = text.indexOf(query);
        while (index !== -1) {
          const from = pos + index;
          const to = from + query.length;
          found.push({ from, to });
          index = text.indexOf(query, index + 1);
        }
      }
    });

    setMatches(found);
    if (found.length > 0) {
      setCurrentMatchIndex(0);
      selectMatch(found[0]);
    } else {
      setCurrentMatchIndex(-1);
    }
  }, [editor, searchTerm, isCaseSensitive, selectMatch]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
      findMatches();
    } else {
      setSearchTerm('');
      setReplaceTerm('');
      setMatches([]);
      setCurrentMatchIndex(-1);
    }
  }, [isOpen, findMatches]);

  const handleNext = () => {
    if (matches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIdx);
    selectMatch(matches[nextIdx]);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prevIdx);
    selectMatch(matches[prevIdx]);
  };

  const handleReplace = () => {
    if (!editor || matches.length === 0 || currentMatchIndex === -1) return;
    const currentMatch = matches[currentMatchIndex];

    editor
      .chain()
      .focus()
      .insertContentAt({ from: currentMatch.from, to: currentMatch.to }, replaceTerm)
      .run();

    // Re-scan matches
    findMatches();
  };

  const handleReplaceAll = () => {
    if (!editor || matches.length === 0) return;

    // Replace from bottom to top to preserve index positions
    const sorted = [...matches].sort((a, b) => b.from - a.from);
    const tr = editor.state.tr;

    for (const match of sorted) {
      tr.insertText(replaceTerm, match.from, match.to);
    }

    editor.view.dispatch(tr);
    findMatches();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-3 right-6 z-30 max-w-sm w-full bg-[var(--color-surface-elevated)] backdrop-blur-2xl border border-[var(--color-border)] rounded-2xl shadow-2xl p-3 animate-slide-in transition-all">
      {/* Search Line */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-[var(--color-text-tertiary)] pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) handlePrev();
                else handleNext();
              }
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Find in document..."
            className={cn(
              'w-full pl-8 pr-16 py-1.5 rounded-xl text-xs',
              'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]',
              'focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]',
              'placeholder:text-[var(--color-text-tertiary)]'
            )}
          />

          {/* Count Badge */}
          {searchTerm && (
            <span className="absolute right-2 text-[10px] font-medium text-[var(--color-text-tertiary)] select-none">
              {matches.length > 0 ? `${currentMatchIndex + 1} / ${matches.length}` : '0 results'}
            </span>
          )}
        </div>

        {/* Case Sensitivity */}
        <button
          type="button"
          onClick={() => setIsCaseSensitive(!isCaseSensitive)}
          title="Match Case"
          className={cn(
            'p-1.5 rounded-lg text-xs transition-colors',
            isCaseSensitive
              ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold'
              : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)]'
          )}
        >
          <CaseSensitive className="w-3.5 h-3.5" />
        </button>

        {/* Navigation */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={matches.length === 0}
          title="Previous match (Shift+Enter)"
          className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={matches.length === 0}
          title="Next match (Enter)"
          className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Replace */}
        <button
          type="button"
          onClick={() => setShowReplace(!showReplace)}
          title={showReplace ? 'Hide Replace' : 'Show Replace'}
          className={cn(
            'p-1.5 rounded-lg text-xs transition-colors',
            showReplace
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
          )}
        >
          <Replace className="w-3.5 h-3.5" />
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          title="Close (Esc)"
          className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Replace Line */}
      {showReplace && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--color-border)] animate-fade-in">
          <input
            type="text"
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleReplace();
              }
            }}
            placeholder="Replace with..."
            className={cn(
              'flex-1 px-3 py-1.5 rounded-xl text-xs',
              'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]',
              'focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]',
              'placeholder:text-[var(--color-text-tertiary)]'
            )}
          />

          <button
            type="button"
            onClick={handleReplace}
            disabled={matches.length === 0}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-bg)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text)] disabled:opacity-30 disabled:hover:bg-[var(--color-bg)] transition-colors"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={handleReplaceAll}
            disabled={matches.length === 0}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:opacity-30 transition-colors"
          >
            All
          </button>
        </div>
      )}
    </div>
  );
}
