import { useCallback, useEffect } from 'react';
import { useAppStore } from '@/store';
import * as dbService from '@/services/database';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function useFolders() {
  const {
    setFolders,
    setFolderTree,
    toggleFolderExpanded,
    addToast,
  } = useAppStore();

  const folders = useLiveQuery(() => db.folders.toArray(), []);

  useEffect(() => {
    if (folders) {
      setFolders(folders);
      dbService.buildFolderTree(folders).then(setFolderTree);
    }
  }, [folders, setFolders, setFolderTree]);

  const createFolder = useCallback(
    async (name: string, parentId: string | null = null) => {
      try {
        const folder = await dbService.createFolder(name, parentId);
        addToast({ type: 'success', title: `Folder "${name}" created` });
        return folder;
      } catch {
        addToast({ type: 'error', title: 'Failed to create folder' });
        return null;
      }
    },
    [addToast]
  );

  const renameFolder = useCallback(
    async (id: string, name: string) => {
      try {
        await dbService.updateFolder(id, { name });
        addToast({ type: 'success', title: 'Folder renamed' });
      } catch {
        addToast({ type: 'error', title: 'Failed to rename folder' });
      }
    },
    [addToast]
  );

  const deleteFolderAction = useCallback(
    async (id: string, moveDocsTo: 'parent' | 'trash') => {
      try {
        await dbService.deleteFolder(id, moveDocsTo);
        addToast({ type: 'success', title: 'Folder deleted' });
      } catch {
        addToast({ type: 'error', title: 'Failed to delete folder' });
      }
    },
    [addToast]
  );

  const moveFolder = useCallback(
    async (id: string, parentId: string | null) => {
      try {
        await dbService.updateFolder(id, { parent_id: parentId });
        addToast({ type: 'success', title: 'Folder moved' });
      } catch {
        addToast({ type: 'error', title: 'Failed to move folder' });
      }
    },
    [addToast]
  );

  const getFolderPath = useCallback(async (folderId: string) => {
    return dbService.getFolderPath(folderId);
  }, []);

  return {
    folders: folders ?? [],
    createFolder,
    renameFolder,
    deleteFolder: deleteFolderAction,
    moveFolder,
    toggleFolderExpanded,
    getFolderPath,
  };
}
