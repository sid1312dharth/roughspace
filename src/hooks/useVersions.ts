import { useCallback } from 'react';
import { useAppStore } from '@/store';
import * as dbService from '@/services/database';
import type { Version } from '@/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function useVersions(documentId: string | null) {
  const { addToast } = useAppStore();

  const versions = useLiveQuery(
    () =>
      documentId
        ? db.versions
            .where('document_id')
            .equals(documentId)
            .reverse()
            .sortBy('created_at')
        : Promise.resolve([] as Version[]),
    [documentId]
  );

  const versionCount = useLiveQuery(
    () =>
      documentId
        ? db.versions.where('document_id').equals(documentId).count()
        : Promise.resolve(0),
    [documentId]
  );

  const createVersion = useCallback(
    async (title: string, content: string, description?: string) => {
      if (!documentId) return null;
      try {
        const version = await dbService.createVersion(documentId, title, content, description);
        return version;
      } catch {
        addToast({ type: 'error', title: 'Failed to create version' });
        return null;
      }
    },
    [documentId, addToast]
  );

  const restoreVersion = useCallback(
    async (versionId: string) => {
      if (!documentId) return false;
      try {
        const version = await dbService.getVersion(versionId);
        const currentDoc = await dbService.getDocument(documentId);
        if (!version || !currentDoc) return false;

        // Save current state as a version before restoring
        await dbService.createVersion(
          documentId,
          currentDoc.title,
          currentDoc.content,
          'Before restore'
        );

        // Restore
        await dbService.updateDocumentContent(documentId, version.content, version.title);
        addToast({ type: 'success', title: 'Version restored' });
        return true;
      } catch {
        addToast({ type: 'error', title: 'Failed to restore version' });
        return false;
      }
    },
    [documentId, addToast]
  );

  const getVersion = useCallback(async (id: string) => {
    return dbService.getVersion(id);
  }, []);

  return {
    versions: versions ?? [],
    versionCount: versionCount ?? 0,
    createVersion,
    restoreVersion,
    getVersion,
  };
}
