import { type Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import {
  Bold, Italic, Underline, Strikethrough, Code, Highlighter,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Quote, Minus,
  Undo, Redo, Heading1, Heading2, Heading3,
  Link as LinkIcon, Image as ImageIcon, Search
} from 'lucide-react';
import { TableControls } from './TableControls';

interface EditorToolbarProps {
  editor: Editor | null;
  onOpenLink?: () => void;
  onOpenImage?: () => void;
  onToggleFindReplace?: () => void;
  isFindReplaceOpen?: boolean;
}

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  icon: Icon,
  title 
}: { 
  onClick: () => void, 
  isActive?: boolean, 
  disabled?: boolean, 
  icon: any,
  title: string 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'p-2 rounded-lg text-[var(--color-text-secondary)] transition-all duration-200',
      'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed',
      isActive && 'bg-[var(--color-bg-active)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-border)]'
    )}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const Divider = () => <div className="w-px h-6 bg-[var(--color-border)] mx-1" />;

export function EditorToolbar({ 
  editor,
  onOpenLink,
  onOpenImage,
  onToggleFindReplace,
  isFindReplaceOpen = false,
}: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-6 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)]/60 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={Undo}
        />
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={Redo}
        />
      </div>

      <Divider />

      <div className="flex items-center gap-1">
        <ToolbarButton
          title="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={Heading1}
        />
        <ToolbarButton
          title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
        />
        <ToolbarButton
          title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={Heading3}
        />
      </div>

      <Divider />

      <div className="flex items-center gap-1">
        <ToolbarButton
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
        />
        <ToolbarButton
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
        />
        <ToolbarButton
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={Underline}
        />
        <ToolbarButton
          title="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={Strikethrough}
        />
        <ToolbarButton
          title="Highlight"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          icon={Highlighter}
        />
        <ToolbarButton
          title="Code"
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          icon={Code}
        />
      </div>

      <Divider />

      <div className="flex items-center gap-1">
        <ToolbarButton
          title="Align Left"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={AlignLeft}
        />
        <ToolbarButton
          title="Align Center"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={AlignCenter}
        />
        <ToolbarButton
          title="Align Right"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={AlignRight}
        />
        <ToolbarButton
          title="Justify"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          icon={AlignJustify}
        />
      </div>

      <Divider />

      <div className="flex items-center gap-1">
        <ToolbarButton
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
        />
        <ToolbarButton
          title="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
        />
        <ToolbarButton
          title="Task List"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          icon={CheckSquare}
        />
      </div>

      <Divider />

      {/* Insert items: Link, Image, Table */}
      <div className="flex items-center gap-1">
        {onOpenLink && (
          <ToolbarButton
            title="Insert Link (Ctrl+K)"
            onClick={onOpenLink}
            isActive={editor.isActive('link')}
            icon={LinkIcon}
          />
        )}
        {onOpenImage && (
          <ToolbarButton
            title="Insert Image"
            onClick={onOpenImage}
            icon={ImageIcon}
          />
        )}
        <TableControls editor={editor} />
      </div>

      <Divider />

      <div className="flex items-center gap-1">
        <ToolbarButton
          title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={Quote}
        />
        <ToolbarButton
          title="Horizontal Rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={Minus}
        />
      </div>

      {onToggleFindReplace && (
        <>
          <div className="ml-auto" />
          <ToolbarButton
            title="Find and Replace (Ctrl+F)"
            onClick={onToggleFindReplace}
            isActive={isFindReplaceOpen}
            icon={Search}
          />
        </>
      )}
    </div>
  );
}

