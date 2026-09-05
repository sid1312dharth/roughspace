import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Editor as TiptapEditor } from '@/components/editor/Editor';
import { useAppStore } from '@/store';
import { useAutosave } from '@/hooks/useAutosave';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Loader2, Star, Trash2, Download, History, Maximize2, BookOpen } from 'lucide-react';
import * as dbService from '@/services/database';
import { exportService } from '@/services/export';
import { VersionHistory } from '@/components/editor/VersionHistory';

export function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { viewMode } = useAppStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Fetch document
  const doc = useLiveQuery(
    () => id ? db.documents.get(id) : Promise.resolve(undefined as any),
    [id]
  );

  // Hook up autosave
  const { debouncedSave } = useAutosave(id || null);
  const { saveStatus } = useAppStore();

  // Initialize state when document loads
  useEffect(() => {
    if (doc && !isLoaded) {
      setTitle(doc.title);
      setContent(doc.content);
      setIsLoaded(true);
    }
  }, [doc, isLoaded]);

  // Trigger autosave when title or content changes
  useEffect(() => {
    if (isLoaded) {
      debouncedSave(content, title);
    }
  }, [content, title, debouncedSave, isLoaded]);

  // Handle document not found or deleted
  useEffect(() => {
    if (doc === undefined && isLoaded) {
      navigate('/documents');
    } else if (doc && doc.is_deleted) {
      navigate('/trash');
    }
  }, [doc, isLoaded, navigate]);

  const handleToggleFavorite = async () => {
    if (!id || !doc) return;
    await dbService.updateDocument(id, { is_favorite: !doc.is_favorite });
  };

  const handleDelete = async () => {
    if (!id) return;
    await dbService.updateDocument(id, {
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    });
    navigate('/documents');
  };

  if (!doc && !isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-bg-secondary)] relative">
      {/* Topbar */}
      {viewMode !== 'focus' && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-2xl z-10 transition-all duration-300">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate('/documents')}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Document"
              className={cn(
                'text-xl font-bold bg-transparent border-none outline-none tracking-tight',
                'text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]',
                'focus:bg-[var(--color-bg-hover)] px-3 py-1.5 rounded-lg transition-colors w-full max-w-xl'
              )}
              readOnly={viewMode === 'read'}
            />

            {/* Save Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-tertiary)] text-xs font-medium text-[var(--color-text-secondary)] shadow-inner">
              {saveStatus === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-primary)]" />}
              {saveStatus === 'saved' && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" />}
              {saveStatus === 'idle' && <CheckCircle2 className="w-3.5 h-3.5 opacity-40" />}
              {saveStatus === 'error' && <span className="w-2 h-2 rounded-full bg-[var(--color-error)]" />}
              <span className="capitalize">{saveStatus}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 relative">
            <div className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="p-2.5 rounded-xl hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                title="Export Document"
              >
                <Download className="w-4 h-4" />
              </button>
              
              {exportMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setExportMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-40 bg-[var(--color-surface-elevated)] backdrop-blur-xl border border-[var(--color-border)] rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-scale-in origin-top-right">
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-bg-hover)] transition-colors"
                      onClick={() => { exportService.exportToTxt(title, content); setExportMenuOpen(false); }}
                    >
                      Export as TXT
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-bg-hover)] transition-colors"
                      onClick={() => { exportService.exportToMarkdown(title, content); setExportMenuOpen(false); }}
                    >
                      Export as Markdown
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-bg-hover)] transition-colors"
                      onClick={() => { exportService.exportToHtml(title, content); setExportMenuOpen(false); }}
                    >
                      Export as HTML
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <button
              onClick={() => useAppStore.getState().toggleReadingMode()}
              className="p-2.5 rounded-xl hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors hidden sm:block"
              title="Reading Mode"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <button
              onClick={() => useAppStore.getState().toggleFocusMode()}
              className="p-2.5 rounded-xl hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors hidden sm:block"
              title="Focus Mode (Ctrl+Shift+F)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setHistoryOpen(true)}
              className="p-2.5 rounded-xl hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors hidden sm:block"
              title="Version History"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleFavorite}
              className="p-2.5 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors group"
              title={doc?.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={cn('w-4 h-4 transition-transform group-hover:scale-110', doc?.is_favorite ? 'text-amber-400 fill-amber-400' : 'text-[var(--color-text-secondary)] group-hover:text-amber-400')} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl hover:bg-red-500/10 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
              title="Move to trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden relative">
        {isLoaded && (
          <TiptapEditor
            content={content}
            onChange={setContent}
            readOnly={viewMode === 'read'}
          />
        )}
        
        {historyOpen && id && (
          <VersionHistory
            documentId={id}
            currentTitle={title}
            currentContent={content}
            onClose={() => setHistoryOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
