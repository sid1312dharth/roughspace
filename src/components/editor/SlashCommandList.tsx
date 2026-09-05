import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';

interface CommandItem {
  title: string;
  description: string;
  icon: any;
  command: (props: any) => void;
}

interface CommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export const SlashCommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  return (
    <div className="flex flex-col bg-[var(--color-surface-elevated)] backdrop-blur-xl border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden py-1 w-64">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            key={index}
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-left w-full transition-colors',
              index === selectedIndex ? 'bg-[var(--color-bg-hover)]' : 'hover:bg-[var(--color-bg-hover)]'
            )}
            onClick={() => selectItem(index)}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]">
              <item.icon className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[var(--color-text)]">{item.title}</span>
              <span className="text-xs text-[var(--color-text-tertiary)]">{item.description}</span>
            </div>
          </button>
        ))
      ) : (
        <div className="px-4 py-3 text-sm text-[var(--color-text-tertiary)] text-center">
          No results
        </div>
      )}
    </div>
  );
});

SlashCommandList.displayName = 'SlashCommandList';
