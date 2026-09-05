import { Outlet } from 'react-router';
import { FileDropZone } from '@/components/files/FileDropZone';
import { Toast } from '@/components/common/Toast';
import { CommandPalette } from '@/components/common/CommandPalette';
import { SearchDialog } from '@/components/common/SearchDialog';
import { useTheme } from '@/hooks/useTheme';
import { useOffline } from '@/hooks/useOffline';
import { useAppStore } from '@/store';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  useTheme();
  useOffline();
  const { viewMode } = useAppStore();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K — Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        useAppStore.getState().setCommandPaletteOpen(true);
      }
      // Ctrl+Shift+F — Focus Mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        useAppStore.getState().toggleFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <FileDropZone>
      <div
        className={cn(
          'flex h-full w-full bg-[var(--color-bg)] overflow-hidden p-0 md:p-2 md:pl-0 gap-2 transition-all duration-300',
          viewMode === 'focus' && 'focus-mode md:p-0',
          viewMode === 'read' && 'reading-mode'
        )}
      >
        {viewMode !== 'focus' && <Sidebar />}
        
        <main className={cn(
          "flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-bg-secondary)] transition-all duration-300 relative",
          viewMode !== 'focus' && "md:rounded-2xl md:border md:border-[var(--color-border)] shadow-2xl md:shadow-[var(--shadow-glow)]"
        )}>
          {!useAppStore().isOnline && (
            <div className="bg-[var(--color-warning)] text-white text-xs font-medium py-1.5 px-4 text-center">
              You are offline. Changes will be saved locally.
            </div>
          )}
          <Outlet />
        </main>

        {/* Global Overlays */}
        <Toast />
        <CommandPalette />
        <SearchDialog />
      </div>
    </FileDropZone>
  );
}
