import { 
  Users, 
  Layers, 
  Lightbulb, 
  Sun, 
  PenTool, 
  Calendar, 
  Sparkles, 
  FileText 
} from 'lucide-react';
import { DOCUMENT_TEMPLATES, type DocumentTemplate } from '@/data/templates';
import { cn } from '@/lib/utils';

interface InlineTemplateStarterProps {
  onApplyTemplate: (template: DocumentTemplate) => void;
  onDismiss: () => void;
}

const ICON_MAP: Record<string, any> = {
  Users,
  Layers,
  Lightbulb,
  Sun,
  PenTool,
  Calendar,
};

export function InlineTemplateStarter({
  onApplyTemplate,
  onDismiss,
}: InlineTemplateStarterProps) {
  return (
    <div className="mb-8 p-6 rounded-3xl bg-[var(--color-bg-tertiary)]/40 border border-[var(--color-border)] backdrop-blur-xl animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
            Quick Start Templates
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
        >
          Dismiss
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DOCUMENT_TEMPLATES.map((tpl) => {
          const IconComponent = ICON_MAP[tpl.icon] || FileText;
          return (
            <button
              key={tpl.id}
              onClick={() => onApplyTemplate(tpl)}
              className={cn(
                'flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all duration-200 group',
                'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]',
                'hover:shadow-md hover:-translate-y-0.5'
              )}
            >
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs transition-transform group-hover:scale-105"
                style={{ backgroundColor: tpl.color }}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold text-[var(--color-text)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                    {tpl.title}
                  </span>
                  {tpl.badge && (
                    <span className="text-[9px] font-semibold text-[var(--color-text-tertiary)] bg-[var(--color-bg)] px-1.5 py-0.2 rounded border border-[var(--color-border)]">
                      {tpl.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--color-text-tertiary)] line-clamp-2 leading-snug">
                  {tpl.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
