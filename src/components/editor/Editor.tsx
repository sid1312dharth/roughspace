import { EditorContent } from '@tiptap/react';
import { BubbleMenu as TipTapBubbleMenu } from '@tiptap/react/menus';
import { useEditor } from '@/hooks/useEditor';
import { EditorToolbar } from './EditorToolbar';
import { LinkDialog } from './LinkDialog';
import { ImageDialog } from './ImageDialog';
import { FindReplaceBar } from './FindReplaceBar';
import { InlineTemplateStarter } from './InlineTemplateStarter';
import { cn } from '@/lib/utils';
import { 
  Bold, Italic, Underline, Strikethrough, Sparkles, Loader2, 
  Wand2, CheckCheck, RefreshCw, AlignLeft, Link as LinkIcon, Clock 
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { processWithAI, type AIAction } from '@/services/ai';
import { useAppStore } from '@/store';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export function Editor({ content, onChange, readOnly = false }: EditorProps) {
  const editor = useEditor(content, onChange);
  const { addToast } = useAppStore();
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);

  // Modal & Overlay states
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkInitialUrl, setLinkInitialUrl] = useState('');
  const [isExistingLink, setIsExistingLink] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);

  // Set editable state whenever readOnly or editor changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  const handleOpenLinkDialog = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    setLinkInitialUrl(previousUrl || '');
    setIsExistingLink(editor.isActive('link'));
    setLinkDialogOpen(true);
  }, [editor]);

  const handleSaveLink = (url: string, openInNewTab: boolean) => {
    if (!editor) return;
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url, target: openInNewTab ? '_blank' : null })
      .run();
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  const handleSaveImage = (url: string, alt?: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url, alt: alt || '' }).run();
  };

  // Listen to custom events from Slash Commands or shortcuts
  useEffect(() => {
    const onOpenLink = () => handleOpenLinkDialog();
    const onOpenImage = () => setImageDialogOpen(true);

    window.addEventListener('roughspace:open-link-dialog', onOpenLink);
    window.addEventListener('roughspace:open-image-dialog', onOpenImage);

    return () => {
      window.removeEventListener('roughspace:open-link-dialog', onOpenLink);
      window.removeEventListener('roughspace:open-image-dialog', onOpenImage);
    };
  }, [handleOpenLinkDialog]);

  // Keyboard shortcut listener for Ctrl+F in editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        // Prevent default browser find if editor or editor-container is active
        const activeEl = document.activeElement;
        const isEditorFocused = activeEl && (activeEl.closest('.tiptap') || activeEl.closest('.editor-container'));
        if (isEditorFocused || findReplaceOpen) {
          e.preventDefault();
          setFindReplaceOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [findReplaceOpen]);

  const handleAIAction = async (action: AIAction) => {
    if (!editor) return;
    const selection = editor.state.selection;
    if (selection.empty) {
      addToast({ type: 'error', title: 'Please select some text first.' });
      return;
    }

    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      const result = await processWithAI(text, action);
      
      // Replace or append based on action
      if (action === 'continue') {
        editor.chain().focus().insertContentAt(selection.to, `\n\n${result}`).run();
      } else {
        editor.chain().focus().insertContent(result).run();
      }
      
      addToast({ type: 'success', title: 'AI successfully updated the text.' });
      setAiMenuOpen(false);
    } catch (error: any) {
      addToast({ type: 'error', title: 'AI Error', description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!editor) {
    return null;
  }

  const bubbleMenuProps = {
    editor,
    tippyOptions: { duration: 100 },
    className: cn(
      'flex items-center gap-1 p-1.5 rounded-xl shadow-2xl',
      'bg-[var(--color-surface-elevated)]/90 backdrop-blur-xl border border-[var(--color-border)] transition-all duration-200'
    ),
  };

  const words = editor.storage.characterCount.words();
  const characters = editor.storage.characterCount.characters();
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {!readOnly && (
        <EditorToolbar 
          editor={editor}
          onOpenLink={handleOpenLinkDialog}
          onOpenImage={() => setImageDialogOpen(true)}
          onToggleFindReplace={() => setFindReplaceOpen(!findReplaceOpen)}
          isFindReplaceOpen={findReplaceOpen}
        />
      )}

      {/* Find & Replace Bar */}
      <FindReplaceBar
        editor={editor}
        isOpen={findReplaceOpen}
        onClose={() => setFindReplaceOpen(false)}
      />
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative custom-scrollbar editor-container">
        <div className="max-w-4xl mx-auto bg-[var(--color-surface)]/80 backdrop-blur-xl sm:shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:sm:shadow-[0_8px_40px_rgb(0,0,0,0.2)] sm:border sm:border-[var(--color-border)] rounded-3xl min-h-[800px] p-6 sm:p-12 sm:px-16 mb-12 transition-all duration-500">
          {editor && (
            <TipTapBubbleMenu {...bubbleMenuProps}>
              {!aiMenuOpen ? (
                <>
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn('p-1.5 rounded hover:bg-[var(--color-bg-hover)]', editor.isActive('bold') && 'bg-[var(--color-bg-active)] text-[var(--color-primary)]')}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn('p-1.5 rounded hover:bg-[var(--color-bg-hover)]', editor.isActive('italic') && 'bg-[var(--color-bg-active)] text-[var(--color-primary)]')}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={cn('p-1.5 rounded hover:bg-[var(--color-bg-hover)]', editor.isActive('underline') && 'bg-[var(--color-bg-active)] text-[var(--color-primary)]')}
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={cn('p-1.5 rounded hover:bg-[var(--color-bg-hover)]', editor.isActive('strike') && 'bg-[var(--color-bg-active)] text-[var(--color-primary)]')}
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleOpenLinkDialog}
                    className={cn('p-1.5 rounded hover:bg-[var(--color-bg-hover)]', editor.isActive('link') && 'bg-[var(--color-bg-active)] text-[var(--color-primary)]')}
                    title="Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-[var(--color-border)] mx-1" />
                  <button
                    onClick={() => setAiMenuOpen(true)}
                    className="p-1.5 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-500 transition-colors flex items-center gap-1"
                    title="Ask AI to Improve"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col min-w-[200px] py-1">
                  {isProcessing ? (
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-secondary)]">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                      <span>AI is thinking...</span>
                    </div>
                  ) : (
                    <>
                      <div className="px-3 py-1.5 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>AI Actions</span>
                        <button onClick={() => setAiMenuOpen(false)} className="hover:text-[var(--color-text)] transition-colors">✕</button>
                      </div>
                      <button
                        onClick={() => handleAIAction('improve')}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-bg-hover)] transition-colors text-left"
                      >
                        <Wand2 className="w-4 h-4 text-purple-500" />
                        <span>Improve writing</span>
                      </button>
                      <button
                        onClick={() => handleAIAction('grammar')}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-bg-hover)] transition-colors text-left"
                      >
                        <CheckCheck className="w-4 h-4 text-blue-500" />
                        <span>Fix grammar & spelling</span>
                      </button>
                      <button
                        onClick={() => handleAIAction('summarize')}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-bg-hover)] transition-colors text-left"
                      >
                        <AlignLeft className="w-4 h-4 text-emerald-500" />
                        <span>Summarize</span>
                      </button>
                      <button
                        onClick={() => handleAIAction('continue')}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-bg-hover)] transition-colors text-left"
                      >
                        <RefreshCw className="w-4 h-4 text-amber-500" />
                        <span>Continue writing</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </TipTapBubbleMenu>
          )}

          {editor.isEmpty && showTemplates && !readOnly && (
            <InlineTemplateStarter
              onApplyTemplate={(tpl) => {
                editor.commands.setContent(tpl.content);
                setShowTemplates(false);
              }}
              onDismiss={() => setShowTemplates(false)}
            />
          )}

          <EditorContent editor={editor} />
        </div>
      </div>
      
      {/* Modals */}
      <LinkDialog
        isOpen={linkDialogOpen}
        initialUrl={linkInitialUrl}
        isExistingLink={isExistingLink}
        onSave={handleSaveLink}
        onRemove={handleRemoveLink}
        onClose={() => setLinkDialogOpen(false)}
      />

      <ImageDialog
        isOpen={imageDialogOpen}
        onSave={handleSaveImage}
        onClose={() => setImageDialogOpen(false)}
      />

      {/* Status Bar */}
      <div className="px-6 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl text-xs font-medium text-[var(--color-text-tertiary)] flex justify-between z-10 transition-all duration-300">
        <div className="flex items-center gap-3">
          <span>{words} words · {characters} characters</span>
          <span className="hidden sm:flex items-center gap-1 text-[var(--color-text-tertiary)]">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            ~{readingTime} min read
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{readOnly ? 'Reading Mode' : 'Editing Mode'}</span>
        </div>
      </div>
    </div>
  );
}

