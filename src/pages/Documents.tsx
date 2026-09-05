import { useNavigate, useSearchParams } from 'react-router';
import { useDocuments } from '@/hooks/useDocuments';
import { useAppStore } from '@/store';
import { cn, formatRelativeDate, truncateText, stripHtml } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  FileText,
  Star,
  Plus,
  MoreVertical,
  Menu,
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { useState, useRef, useEffect } from 'react';
import type { Document } from '@/types';

export function Documents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folder');
  const tagId = searchParams.get('tag');
  const { createDocument, deleteDocument, duplicateDocument, toggleFavorite } = useDocuments();
  const { setMobileMenuOpen, setActiveFolderId, setActiveTagId } = useAppStore();
  const { folders, tags } = useAppStore();
  const [contextMenu, setContextMenu] = useState<{ docId: string; x: number; y: number } | null>(null);

  const documents = useLiveQuery(async () => {
    let docs = await db.documents.where('is_deleted').equals(0).toArray();

    if (folderId) {
      docs = docs.filter((d) => d.folder_id === folderId);
    }

    if (tagId) {
      const docTags = await db.document_tags.where('tag_id').equals(tagId).toArray();
      const docIds = new Set(docTags.map((dt) => dt.document_id));
      docs = docs.filter((d) => docIds.has(d.id));
    }

    return docs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [folderId, tagId]);

  useEffect(() => {
    if (folderId) setActiveFolderId(folderId);
    if (tagId) setActiveTagId(tagId);
    return () => {
      setActiveFolderId(null);
      setActiveTagId(null);
    };
  }, [folderId, tagId, setActiveFolderId, setActiveTagId]);

  const currentFolder = folderId ? folders.find((f) => f.id === folderId) : null;
  const currentTag = tagId ? tags.find((t) => t.id === tagId) : null;
  const title = currentFolder?.name || (currentTag ? `#${currentTag.name}` : 'All Documents');

  const handleNewDoc = async () => {
    const doc = await createDocument(folderId);
    if (doc) navigate(`/editor/${doc.id}`);
  };

  const handleContextAction = async (action: string, docId: string) => {
    setContextMenu(null);
    switch (action) {
      case 'open':
        navigate(`/editor/${docId}`);
        break;
      case 'duplicate':
        await duplicateDocument(docId);
        break;
      case 'favorite':
        await toggleFavorite(docId);
        break;
      case 'delete':
        await deleteDocument(docId);
        break;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--color-bg-hover)]"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">{title}</h1>
          <span className="text-sm text-[var(--color-text-tertiary)]">
            {documents?.length ?? 0} documents
          </span>
        </div>
        <button
          onClick={handleNewDoc}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
            'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
            'transition-colors shadow-sm'
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Document</span>
        </button>
      </div>

      {/* Document List */}
      <div className="px-6 py-4">
        {(!documents || documents.length === 0) ? (
          <EmptyState
            icon={FileText}
            title={currentFolder ? `No documents in "${currentFolder.name}"` : 'No documents yet'}
            description={currentFolder ? 'Create your first document in this folder.' : 'Start writing your first document.'}
            action={
              <button onClick={handleNewDoc} className={cn(
                'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium',
                'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
                'transition-colors shadow-sm'
              )}>
                <Plus className="w-4 h-4" />
                Create Document
              </button>
            }
          />
        ) : (
          <div className="space-y-1">
            {documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                onClick={() => navigate(`/editor/${doc.id}`)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ docId: doc.id, x: e.clientX, y: e.clientY });
                }}
                onToggleFavorite={() => toggleFavorite(doc.id)}
                onMore={(rect) => setContextMenu({ docId: doc.id, x: rect.right, y: rect.bottom })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenuOverlay
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          actions={[
            { label: 'Open', action: () => handleContextAction('open', contextMenu.docId) },
            { label: 'Duplicate', action: () => handleContextAction('duplicate', contextMenu.docId) },
            { label: 'Toggle Favorite', action: () => handleContextAction('favorite', contextMenu.docId) },
            { type: 'divider' },
            { label: 'Move to Trash', action: () => handleContextAction('delete', contextMenu.docId), danger: true },
          ]}
        />
      )}
    </div>
  );
}

function DocumentRow({
  doc,
  onClick,
  onContextMenu,
  onToggleFavorite,
  onMore,
}: {
  doc: Document;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onToggleFavorite: () => void;
  onMore: (rect: DOMRect) => void;
}) {
  const moreRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer',
        'hover:bg-[var(--color-bg-hover)] transition-colors group'
      )}
    >
      <FileText className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)] truncate">
          {doc.title || 'Untitled Document'}
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)] truncate">
          {truncateText(stripHtml(doc.content), 80) || 'Empty document'}
        </p>
      </div>
      <span className="text-xs text-[var(--color-text-tertiary)] shrink-0 hidden sm:block">
        {formatRelativeDate(doc.updated_at)}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="p-1 rounded hover:bg-[var(--color-bg-active)] shrink-0"
        aria-label="Toggle favorite"
      >
        <Star
          className={cn(
            'w-4 h-4',
            doc.is_favorite ? 'text-amber-400 fill-amber-400' : 'text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100'
          )}
        />
      </button>
      <button
        ref={moreRef}
        onClick={(e) => {
          e.stopPropagation();
          onMore(moreRef.current!.getBoundingClientRect());
        }}
        className="p-1 rounded hover:bg-[var(--color-bg-active)] shrink-0 opacity-0 group-hover:opacity-100"
        aria-label="More actions"
      >
        <MoreVertical className="w-4 h-4 text-[var(--color-text-tertiary)]" />
      </button>
    </div>
  );
}

function ContextMenuOverlay({
  x,
  y,
  onClose,
  actions,
}: {
  x: number;
  y: number;
  onClose: () => void;
  actions: Array<{ label?: string; action?: () => void; danger?: boolean; type?: string }>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  // Adjust position to stay in viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 250);

  return (
    <div
      ref={ref}
      className={cn(
        'fixed z-50 py-1.5 min-w-[180px] rounded-xl',
        'bg-[var(--color-surface-elevated)] border border-[var(--color-border)]',
        'shadow-lg animate-scale-in'
      )}
      style={{ left: adjustedX, top: adjustedY }}
    >
      {actions.map((item, i) =>
        item.type === 'divider' ? (
          <div key={i} className="h-px bg-[var(--color-border)] my-1" />
        ) : (
          <button
            key={i}
            onClick={item.action}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 text-sm',
              'hover:bg-[var(--color-bg-hover)] transition-colors',
              item.danger ? 'text-[var(--color-error)]' : 'text-[var(--color-text)]'
            )}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
