import { useEffect } from 'react';
import { useAppStore } from '@/store';

export function useOffline() {
  const { isOnline, setOnline, addToast } = useAppStore();

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      addToast({
        type: 'success',
        title: 'Back online',
        description: 'Synchronizing changes...',
      });
    };

    const handleOffline = () => {
      setOnline(false);
      addToast({
        type: 'warning',
        title: 'You are offline',
        description: 'Changes will be saved locally.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline, addToast]);

  return { isOnline };
}
