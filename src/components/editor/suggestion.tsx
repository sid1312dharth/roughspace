import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { SlashCommandList } from './SlashCommandList';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Code, 
  Quote, 
  Table, 
  Image as ImageIcon, 
  Minus,
  Link as LinkIcon
} from 'lucide-react';

export const suggestion = {
  items: ({ query }: { query: string }) => {
    return [
      {
        title: 'Heading 1',
        description: 'Big section heading.',
        icon: Heading1,
        keywords: ['h1', 'heading', 'title'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
        },
      },
      {
        title: 'Heading 2',
        description: 'Medium section heading.',
        icon: Heading2,
        keywords: ['h2', 'heading', 'subtitle'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
        },
      },
      {
        title: 'Heading 3',
        description: 'Small section heading.',
        icon: Heading3,
        keywords: ['h3', 'heading', 'subheading'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
        },
      },
      {
        title: 'Bullet List',
        description: 'Create a simple bulleted list.',
        icon: List,
        keywords: ['bullet', 'list', 'unordered'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
      },
      {
        title: 'Numbered List',
        description: 'Create a list with numbering.',
        icon: ListOrdered,
        keywords: ['ordered', 'list', 'number', '1.'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
      },
      {
        title: 'Task List',
        description: 'Track tasks with a to-do list.',
        icon: CheckSquare,
        keywords: ['todo', 'task', 'checkbox'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
      },
      {
        title: 'Table',
        description: 'Insert a 3x3 table with headers.',
        icon: Table,
        keywords: ['table', 'grid', 'column', 'row'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
      },
      {
        title: 'Image',
        description: 'Insert an image via URL or upload.',
        icon: ImageIcon,
        keywords: ['image', 'picture', 'photo', 'upload'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).run();
          window.dispatchEvent(new CustomEvent('roughspace:open-image-dialog'));
        },
      },
      {
        title: 'Link',
        description: 'Insert a web link.',
        icon: LinkIcon,
        keywords: ['link', 'url', 'href'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).run();
          window.dispatchEvent(new CustomEvent('roughspace:open-link-dialog'));
        },
      },
      {
        title: 'Quote',
        description: 'Capture a blockquote.',
        icon: Quote,
        keywords: ['quote', 'blockquote', 'cite'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
      },
      {
        title: 'Code Block',
        description: 'Capture a syntax code snippet.',
        icon: Code,
        keywords: ['code', 'snippet', 'pre'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        },
      },
      {
        title: 'Divider',
        description: 'Visual horizontal separator.',
        icon: Minus,
        keywords: ['divider', 'line', 'hr', 'horizontal', 'separator'],
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
      },
    ]
      .filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(q)))
        );
      })
      .slice(0, 10);
  },

  render: () => {
    let component: ReactRenderer;
    let popup: any[];

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(SlashCommandList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }

        return (component.ref as any)?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
