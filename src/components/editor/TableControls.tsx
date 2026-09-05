import { useState, useRef, useEffect } from 'react';
import { type Editor } from '@tiptap/react';
import { 
  Table as TableIcon, 
  Plus, 
  Trash2, 
  Rows, 
  Columns, 
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableControlsProps {
  editor: Editor | null;
}

export function TableControls({ editor }: TableControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverGrid, setHoverGrid] = useState({ rows: 3, cols: 3 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!editor) return null;

  const isInsideTable = editor.isActive('table');

  const insertTable = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Table Options"
        className={cn(
          'flex items-center gap-1 p-2 rounded-lg text-[var(--color-text-secondary)] transition-all duration-200',
          'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]',
          (isInsideTable || isOpen) && 'bg-[var(--color-bg-active)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-border)]'
        )}
      >
        <TableIcon className="w-4 h-4" />
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-[var(--color-surface-elevated)] backdrop-blur-2xl border border-[var(--color-border)] rounded-2xl shadow-2xl z-30 p-3 animate-scale-in origin-top-left">
          {!isInsideTable ? (
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Insert Table
                </span>
                <span className="text-[var(--color-primary)] font-bold">
                  {hoverGrid.rows} × {hoverGrid.cols}
                </span>
              </div>

              {/* Grid Selector */}
              <div 
                className="grid grid-cols-6 gap-1 p-2 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] justify-items-center mb-3"
                onMouseLeave={() => setHoverGrid({ rows: 3, cols: 3 })}
              >
                {Array.from({ length: 6 }).map((_, rIdx) =>
                  Array.from({ length: 6 }).map((_, cIdx) => {
                    const row = rIdx + 1;
                    const col = cIdx + 1;
                    const isSelected = row <= hoverGrid.rows && col <= hoverGrid.cols;
                    return (
                      <button
                        key={`${rIdx}-${cIdx}`}
                        type="button"
                        onMouseEnter={() => setHoverGrid({ rows: row, cols: col })}
                        onClick={() => insertTable(row, col)}
                        className={cn(
                          'w-7 h-7 rounded-md transition-colors border',
                          isSelected
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-xs'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary-light)]'
                        )}
                      />
                    );
                  })
                )}
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => insertTable(2, 2)}
                  className="px-2 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border)] transition-colors text-center"
                >
                  2 × 2
                </button>
                <button
                  type="button"
                  onClick={() => insertTable(3, 3)}
                  className="px-2 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border)] transition-colors text-center"
                >
                  3 × 3
                </button>
                <button
                  type="button"
                  onClick={() => insertTable(4, 4)}
                  className="px-2 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border)] transition-colors text-center"
                >
                  4 × 4
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1 flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                <span>Table Actions</span>
                <span className="text-[10px] text-emerald-500 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">Active</span>
              </div>

              {/* Rows */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().addRowBefore().run(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors text-left"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Insert row above</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().addRowAfter().run(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors text-left"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Insert row below</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().deleteRow().run(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors text-left"
                >
                  <Rows className="w-3.5 h-3.5" />
                  <span>Delete current row</span>
                </button>
              </div>

              <div className="h-px bg-[var(--color-border)] my-1" />

              {/* Columns */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().addColumnBefore().run(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors text-left"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-500" />
                  <span>Insert column left</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().addColumnAfter().run(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors text-left"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-500" />
                  <span>Insert column right</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().deleteColumn().run(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors text-left"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Delete current column</span>
                </button>
              </div>

              <div className="h-px bg-[var(--color-border)] my-1" />

              {/* Header Toggles & Delete Table */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().toggleHeaderRow().run(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors text-left"
                >
                  <Rows className="w-3.5 h-3.5" />
                  <span>Toggle header row</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().deleteTable().run(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete table</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
