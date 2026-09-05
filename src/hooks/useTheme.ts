import { useEffect } from 'react';
import { useAppStore } from '@/store';
import type { ThemeMode } from '@/types';
import { getPreferences, updatePreferences } from '@/services/database';

export function useTheme() {
  const { theme, setTheme } = useAppStore();

  useEffect(() => {
    // Load saved theme preference
    getPreferences().then((prefs) => {
      setTheme(prefs.theme);
    });
  }, [setTheme]);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (mode: ThemeMode) => {
      if (mode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      } else {
        root.classList.toggle('dark', mode === 'dark');
      }
    };

    applyTheme(theme);

    // Listen for system theme changes
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }
  }, [theme]);

  const changeTheme = async (newTheme: ThemeMode) => {
    setTheme(newTheme);
    await updatePreferences({ theme: newTheme });
  };

  return { theme, setTheme: changeTheme };
}
