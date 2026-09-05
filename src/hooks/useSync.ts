import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { SyncService } from '@/services/sync';

export function useSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Initial sync on mount or user change
    SyncService.sync();

    // Sync every 1 minute
    const interval = setInterval(() => {
      SyncService.sync();
    }, 60000);

    // Sync when window regains focus
    const handleFocus = () => {
      SyncService.sync();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleFocus);
    };
  }, [user]);
}
