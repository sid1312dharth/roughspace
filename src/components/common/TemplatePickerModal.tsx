import { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Users, 
  Layers, 
  Lightbulb, 
  Sun, 
  PenTool, 
  Calendar, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { DOCUMENT_TEMPLATES, type DocumentTemplate } from '@/data/templates';
import { cn } from '@/lib/utils';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DocumentTemplate) => void;
}

const ICON_MAP: Record<string, any> = {
  Users,
  Layers,
  Lightbulb,
  Sun,
  PenTool,
  Calendar,
};

export function TemplatePickerModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplatePickerModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'work', label: 'Work & Teams' },
    { id: 'planning', label: 'Planning & Specs' },
    { id: 'creative', label: 'Creative & Writing' },
    { id: 'personal', label: 'Personal & Habits' },
  ];

  const filteredTemplates = useMemo(() => {
    return DOCUMENT_TEMPLATES.filter((t) => {
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        (t.badge && t.badge.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl z-10 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                Document Templates
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Start with a structured blueprint designed for speed and clarity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]/30">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                  selectedCategory === cat.id
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex items-center min-w-[200px]">
            <Search className="absolute left-3 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className={cn(
                'w-full pl-9 pr-3 py-1.5 rounded-xl text-xs',
                'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]',
                'focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]',
                'placeholder:text-[var(--color-text-tertiary)] transition-all'
              )}
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => {
                const IconComponent = ICON_MAP[template.icon] || Sparkles;
                return (
                  <div
                    key={template.id}
                    onClick={() => {
                      onSelectTemplate(template);
                      onClose();
                    }}
                    className={cn(
                      'group relative flex flex-col justify-between p-5 rounded-2xl cursor-pointer',
                      'bg-[var(--color-surface)] border border-[var(--color-border)]',
                      'hover:border-[var(--color-primary)] hover:shadow-xl hover:-translate-y-0.5',
                      'transition-all duration-300'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                          style={{ backgroundColor: template.color }}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        {template.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                            {template.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[var(--color-text)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
                        {template.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-xs font-semibold text-[var(--color-primary)]">
                      <span>Use this template</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-[var(--color-text-tertiary)]">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No templates match your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
