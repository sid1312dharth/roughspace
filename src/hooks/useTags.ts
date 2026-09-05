import { useCallback, useEffect } from 'react';
import { useAppStore } from '@/store';
import * as dbService from '@/services/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function useTags() {
  const { setTags, addToast } = useAppStore();

  const tags = useLiveQuery(() => db.tags.toArray(), []);

  useEffect(() => {
    if (tags) setTags(tags);
  }, [tags, setTags]);

  const createTag = useCallback(
    async (name: string) => {
      try {
        const tag = await dbService.createTag(name);
        addToast({ type: 'success', title: `Tag "${name}" created` });
        return tag;
      } catch {
        addToast({ type: 'error', title: 'Failed to create tag' });
        return null;
      }
    },
    [addToast]
  );

  const renameTag = useCallback(
    async (id: string, name: string) => {
      try {
        await dbService.updateTag(id, { name });
      } catch {
        addToast({ type: 'error', title: 'Failed to rename tag' });
      }
    },
    [addToast]
  );

  const deleteTag = useCallback(
    async (id: string) => {
      try {
        await dbService.deleteTag(id);
        addToast({ type: 'success', title: 'Tag deleted' });
      } catch {
        addToast({ type: 'error', title: 'Failed to delete tag' });
      }
    },
    [addToast]
  );

  const addTagToDoc = useCallback(
    async (documentId: string, tagId: string) => {
      try {
        await dbService.addTagToDocument(documentId, tagId);
      } catch {
        addToast({ type: 'error', title: 'Failed to add tag' });
      }
    },
    [addToast]
  );

  const removeTagFromDoc = useCallback(
    async (documentId: string, tagId: string) => {
      try {
        await dbService.removeTagFromDocument(documentId, tagId);
      } catch {
        addToast({ type: 'error', title: 'Failed to remove tag' });
      }
    },
    [addToast]
  );

  const getDocTags = useCallback(async (documentId: string) => {
    return dbService.getDocumentTags(documentId);
  }, []);

  return {
    tags: tags ?? [],
    createTag,
    renameTag,
    deleteTag,
    addTagToDocument: addTagToDoc,
    removeTagFromDocument: removeTagFromDoc,
    getDocumentTags: getDocTags,
  };
}
