import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/store';
import * as dbService from '@/services/database';
import type { } from '@/types';

export function useAutosave(documentId: string | null) {
  const { setSaveStatus, addToast } = useAppStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastContentRef = useRef<string>('');
  const lastTitleRef = useRef<string>('');
  const versionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastVersionTimeRef = useRef<number>(0);

  // Cleanup on unmount or document change
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (versionTimerRef.current) clearTimeout(versionTimerRef.current);
    };
  }, [documentId]);

  const save = useCallback(
    async (content: string, title: string) => {
      if (!documentId) return;

      // Skip if nothing changed
      if (content === lastContentRef.current && title === lastTitleRef.current) {
        return;
      }

      setSaveStatus('saving');

      try {
        await dbService.updateDocumentContent(documentId, content, title);
        lastContentRef.current = content;
        lastTitleRef.current = title;
        setSaveStatus('saved');

        // Auto-create version every 5 minutes of active editing
        const now = Date.now();
        if (now - lastVersionTimeRef.current > 5 * 60 * 1000) {
          lastVersionTimeRef.current = now;
          await dbService.createVersion(
            documentId,
            title || 'Untitled Document',
            content,
            'Auto-saved version'
          );
        }
      } catch {
        setSaveStatus('error');
        addToast({
          type: 'error',
          title: 'Failed to save',
          description: 'Your changes are being retried.',
        });
      }
    },
    [documentId, setSaveStatus, addToast]
  );

  const debouncedSave = useCallback(
    (content: string, title: string) => {
      setSaveStatus('typing');

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        save(content, title);
      }, 800);
    },
    [save, setSaveStatus]
  );

  const forceSave = useCallback(
    async (content: string, title: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      await save(content, title);
    },
    [save]
  );

  const createManualVersion = useCallback(
    async (title: string, content: string) => {
      if (!documentId) return;
      try {
        await dbService.createVersion(documentId, title, content, 'Manual save');
        addToast({ type: 'success', title: 'Version saved' });
        lastVersionTimeRef.current = Date.now();
      } catch {
        addToast({ type: 'error', title: 'Failed to save version' });
      }
    },
    [documentId, addToast]
  );

  return {
    debouncedSave,
    forceSave,
    createManualVersion,
  };
}
