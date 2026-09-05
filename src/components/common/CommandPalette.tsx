import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '@/store';
import { useDocuments } from '@/hooks/useDocuments';
import { DOCUMENT_TEMPLATES } from '@/data/templates';
import { cn } from '@/lib/utils';
import {
  Search,
  FileText,
  FolderOpen,
  Plus,
  Star,
  Clock,
  Settings,
  Sun,
  Moon,
  Maximize2,
  Trash2,
  BookOpen,
  X,
  Sparkles,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: string;
  action: () => void;
}

export function CommandPalette() {
  const navigate = useNavigate();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    theme,
    setTheme,
    toggleFocusMode,
    toggleReadingMode,
  } = useAppStore();
  const { createDocument, createDocumentFromTemplate } = useDocuments();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'new-doc',
      label: 'Create Document',
      icon: <Plus className="w-4 h-4" />,
      shortcut: 'Ctrl+N',
      category: 'Document',
      action: async () => {
        const doc = await createDocument();
        if (doc) navigate(`/editor/${doc.id}`);
      },
    },
    ...DOCUMENT_TEMPLATES.map((t) => ({
      id: `template-${t.id}`,
      label: `New ${t.title}`,
      description: t.description,
      icon: <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />,
      category: 'Templates',
      action: async () => {
        const doc = await createDocumentFromTemplate(t);
        if (doc) navigate(`/editor/${doc.id}`);
      },
    })),
    {
      id: 'search',
      label: 'Search Documents',
      icon: <Search className="w-4 h-4" />,
      shortcut: 'Ctrl+F',
      category: 'Navigation',
      action: () => {
        setCommandPaletteOpen(false);
        useAppStore.getState().setSearchOpen(true);
      },
    },
    {
      id: 'home',
      label: 'Go to Home',
      icon: <FileText className="w-4 h-4" />,
      category: 'Navigation',
      action: () => navigate('/'),
    },
    {
      id: 'recent',
      label: 'Open Recent',
      icon: <Clock className="w-4 h-4" />,
      category: 'Navigation',
      action: () => navigate('/recent'),
    },
    {
      id: 'favorites',
      label: 'Open Favorites',
      icon: <Star className="w-4 h-4" />,
      category: 'Navigation',
      action: () => navigate('/favorites'),
    },
    {
      id: 'documents',
      label: 'All Documents',
      icon: <FolderOpen className="w-4 h-4" />,
      category: 'Navigation',
      action: () => navigate('/documents'),
    },
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      category: 'View',
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    {
      id: 'focus-mode',
      label: 'Toggle Focus Mode',
      icon: <Maximize2 className="w-4 h-4" />,
      shortcut: 'Ctrl+Shift+F',
      category: 'View',
      action: () => toggleFocusMode(),
    },
    {
      id: 'reading-mode',
      label: 'Toggle Reading Mode',
      icon: <BookOpen className="w-4 h-4" />,
      category: 'View',
      action: () => toggleReadingMode(),
    },
    {
      id: 'trash',
      label: 'Open Trash',
      icon: <Trash2 className="w-4 h-4" />,
      category: 'Navigation',
      action: () => navigate('/trash'),
    },
    {
      id: 'settings',
      label: 'Open Settings',
      icon: <Settings className="w-4 h-4" />,
      category: 'Settings',
      action: () => navigate('/settings'),
    },
  ];

  const filteredCommands = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = useCallback(
    (command: CommandItem) => {
      setCommandPaletteOpen(false);
      command.action();
    },
    [setCommandPaletteOpen]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      executeCommand(filteredCommands[selectedIndex]);
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="absolute inset-0 bg-[var(--color-bg-overlay)]"
        onClick={() => setCommandPaletteOpen(false)}
      />
      <div
        className={cn(
          'relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden',
          'bg-[var(--color-surface)] border border-[var(--color-border)]',
          'shadow-xl animate-scale-in'
        )}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-[var(--color-border)]">
          <Search className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className={cn(
              'flex-1 py-3.5 bg-transparent border-none outline-none text-sm',
              'text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]'
            )}
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded hover:bg-[var(--color-bg-hover)]"
          >
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        </div>

        {/* Commands List */}
        <div ref={listRef} className="max-h-[300px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[var(--color-text-tertiary)] text-center">
              No commands found
            </p>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                onClick={() => executeCommand(command)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors',
                  index === selectedIndex
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]'
                )}
              >
                <span className="text-[var(--color-text-tertiary)]">{command.icon}</span>
                <span className="flex-1 text-left">{command.label}</span>
                {command.shortcut && (
                  <kbd className="text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded font-mono">
                    {command.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
