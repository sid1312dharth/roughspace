import { useCallback, useEffect, } from 'react';
import { useAppStore } from '@/store';
import * as dbService from '@/services/database';
import type { DocumentTemplate } from '@/data/templates';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function useDocuments() {
  const {
    setDocuments,
    addDocumentToList,
    removeDocumentFromList,
    addToast,
  } = useAppStore();

  // Live query for all non-deleted documents
  const documents = useLiveQuery(
    () => db.documents.where('is_deleted').equals(0).reverse().sortBy('updated_at'),
    []
  );

  const favorites = useLiveQuery(
    () => db.documents.filter((d) => d.is_favorite && !d.is_deleted).toArray(),
    []
  );

  const recent = useLiveQuery(
    () =>
      db.documents
        .where('is_deleted')
        .equals(0)
        .toArray()
        .then((docs) =>
          docs
            .sort((a, b) => new Date(b.last_opened_at).getTime() - new Date(a.last_opened_at).getTime())
            .slice(0, 20)
        ),
    []
  );

  const trash = useLiveQuery(
    () => db.documents.where('is_deleted').equals(1).toArray(),
    []
  );

  useEffect(() => {
    if (documents) setDocuments(documents);
  }, [documents, setDocuments]);

  const createDocument = useCallback(
    async (folderId?: string | null) => {
      try {
        const doc = await dbService.createDocument({
          folder_id: folderId ?? null,
        });
        addDocumentToList(doc);
        return doc;
      } catch {
        addToast({ type: 'error', title: 'Failed to create document' });
        return null;
      }
    },
    [addDocumentToList, addToast]
  );

  const createDocumentFromTemplate = useCallback(
    async (template: DocumentTemplate, folderId?: string | null) => {
      try {
        const doc = await dbService.createDocument({
          folder_id: folderId ?? null,
          title: template.defaultTitle,
          content: template.content,
        });
        addDocumentToList(doc);
        return doc;
      } catch {
        addToast({ type: 'error', title: 'Failed to create document from template' });
        return null;
      }
    },
    [addDocumentToList, addToast]
  );

  const deleteDoc = useCallback(
    async (id: string) => {
      try {
        await dbService.deleteDocument(id);
        removeDocumentFromList(id);
        addToast({ type: 'success', title: 'Moved to Trash' });
      } catch {
        addToast({ type: 'error', title: 'Failed to delete document' });
      }
    },
    [removeDocumentFromList, addToast]
  );

  const restoreDoc = useCallback(
    async (id: string) => {
      try {
        await dbService.restoreDocument(id);
        addToast({ type: 'success', title: 'Document restored' });
      } catch {
        addToast({ type: 'error', title: 'Failed to restore document' });
      }
    },
    [addToast]
  );

  const permanentlyDeleteDoc = useCallback(
    async (id: string) => {
      try {
        await dbService.permanentlyDeleteDocument(id);
        addToast({ type: 'success', title: 'Document permanently deleted' });
      } catch {
        addToast({ type: 'error', title: 'Failed to delete document' });
      }
    },
    [addToast]
  );

  const duplicateDoc = useCallback(
    async (id: string) => {
      try {
        const doc = await dbService.duplicateDocument(id);
        if (doc) {
          addDocumentToList(doc);
          addToast({ type: 'success', title: 'Document duplicated' });
          return doc;
        }
      } catch {
        addToast({ type: 'error', title: 'Failed to duplicate document' });
      }
      return null;
    },
    [addDocumentToList, addToast]
  );

  const moveDoc = useCallback(
    async (id: string, folderId: string | null) => {
      try {
        await dbService.moveDocument(id, folderId);
        addToast({ type: 'success', title: 'Document moved' });
      } catch {
        addToast({ type: 'error', title: 'Failed to move document' });
      }
    },
    [addToast]
  );

  const toggleFav = useCallback(
    async (id: string) => {
      try {
        const isFav = await dbService.toggleFavorite(id);
        addToast({
          type: 'success',
          title: isFav ? 'Added to Favorites' : 'Removed from Favorites',
        });
        return isFav;
      } catch {
        addToast({ type: 'error', title: 'Failed to update favorite' });
        return false;
      }
    },
    [addToast]
  );

  const emptyTrashAction = useCallback(async () => {
    try {
      await dbService.emptyTrash();
      addToast({ type: 'success', title: 'Trash emptied' });
    } catch {
      addToast({ type: 'error', title: 'Failed to empty trash' });
    }
  }, [addToast]);

  const searchDocs = useCallback(async (query: string) => {
    return dbService.searchDocuments({ query });
  }, []);

  return {
    documents: documents ?? [],
    favorites: favorites ?? [],
    recent: recent ?? [],
    trash: trash ?? [],
    createDocument,
    createDocumentFromTemplate,
    deleteDocument: deleteDoc,
    restoreDocument: restoreDoc,
    permanentlyDeleteDocument: permanentlyDeleteDoc,
    duplicateDocument: duplicateDoc,
    moveDocument: moveDoc,
    toggleFavorite: toggleFav,
    emptyTrash: emptyTrashAction,
    searchDocuments: searchDocs,
  };
}
