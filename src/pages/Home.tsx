import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useDocuments } from '@/hooks/useDocuments';
import { useAppStore } from '@/store';
import { 
  cn, 
  getGreeting, 
  formatRelativeDate, 
  truncateText, 
  stripHtml,
  countWords 
} from '@/lib/utils';
import {
  Plus,
  FileText,
  Star,
  Clock,
  Menu,
  ChevronRight,
  Sparkles,
  Layers,
  TrendingUp,
  Folder,
  LayoutGrid,
  Lightbulb,
  Sun,
  Users,
  PenTool,
  ArrowUpRight
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { TemplatePickerModal } from '@/components/common/TemplatePickerModal';
import { DOCUMENT_TEMPLATES, type DocumentTemplate } from '@/data/templates';
import { motion } from 'framer-motion';

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 350, damping: 25 } 
  }
};

const TEMPLATE_ICONS: Record<string, any> = {
  Users,
  Layers,
  Lightbulb,
  Sun,
  PenTool,
};

export function Home() {
  const navigate = useNavigate();
  const { documents, recent, favorites, createDocument, createDocumentFromTemplate, toggleFavorite } = useDocuments();
  const { setMobileMenuOpen, folderTree, tags } = useAppStore();
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Compute live workspace analytics
  const totalWords = useMemo(() => {
    return documents.reduce((acc, d) => {
      if (d.word_count) return acc + d.word_count;
      if (d.content) return acc + countWords(stripHtml(d.content));
      return acc;
    }, 0);
  }, [documents]);

  const handleNewDoc = async () => {
    const doc = await createDocument();
    if (doc) navigate(`/editor/${doc.id}`);
  };

  const handleSelectTemplate = async (template: DocumentTemplate) => {
    const doc = await createDocumentFromTemplate(template);
    if (doc) navigate(`/editor/${doc.id}`);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-20">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)]"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-xs font-bold">
            R
          </div>
          <h1 className="text-base font-bold text-[var(--color-text)]">RoughSpace</h1>
        </div>
        <div className="w-9" />
      </div>

      <motion.div 
        className="max-w-5xl mx-auto px-6 py-10 sm:py-14 space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Hero Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)] mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              {todayFormatted}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
              {getGreeting()} <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-1.5">
              Welcome back to your workspace. What will you create today?
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setTemplateModalOpen(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold',
                'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)]',
                'hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-hover)] shadow-xs transition-all'
              )}
            >
              <LayoutGrid className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Browse Templates</span>
            </button>

            <button
              onClick={handleNewDoc}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white shadow-lg',
                'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]',
                'hover:opacity-95 hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition-all'
              )}
            >
              <Plus className="w-4 h-4" />
              <span>New Document</span>
            </button>
          </div>
        </motion.div>

        {/* Workspace Stat Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Documents */}
          <div 
            onClick={() => navigate('/documents')}
            className={cn(
              'p-5 rounded-3xl cursor-pointer group transition-all duration-300',
              'bg-[var(--color-surface)]/70 backdrop-blur-xl border border-[var(--color-border)]',
              'hover:border-[var(--color-primary)] hover:shadow-xl hover:-translate-y-1'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Documents
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-tight">
              {documents.length}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)] mt-1 group-hover:text-[var(--color-primary)] transition-colors">
              <span>View all files</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 2: Total Words Written */}
          <div className={cn(
            'p-5 rounded-3xl transition-all duration-300',
            'bg-[var(--color-surface)]/70 backdrop-blur-xl border border-[var(--color-border)]',
            'hover:shadow-xl hover:-translate-y-1'
          )}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Words Written
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-tight">
              {totalWords.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1">
              Across workspace
            </div>
          </div>

          {/* Card 3: Favorites */}
          <div 
            onClick={() => navigate('/favorites')}
            className={cn(
              'p-5 rounded-3xl cursor-pointer group transition-all duration-300',
              'bg-[var(--color-surface)]/70 backdrop-blur-xl border border-[var(--color-border)]',
              'hover:border-amber-400/50 hover:shadow-xl hover:-translate-y-1'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Favorites
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                <Star className="w-4 h-4 fill-amber-500/20" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-tight">
              {favorites.length}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)] mt-1 group-hover:text-amber-500 transition-colors">
              <span>Pinned notes</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 4: Categories & Folders */}
          <div className={cn(
            'p-5 rounded-3xl transition-all duration-300',
            'bg-[var(--color-surface)]/70 backdrop-blur-xl border border-[var(--color-border)]',
            'hover:shadow-xl hover:-translate-y-1'
          )}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Organization
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform">
                <Folder className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-tight">
              {folderTree.length + tags.length}
            </div>
            <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1">
              {folderTree.length} folders · {tags.length} tags
            </div>
          </div>
        </motion.div>

        {/* Quick Templates Shelf */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Quick-Start Templates
              </h2>
            </div>
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1 transition-colors"
            >
              View all 6 templates <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {DOCUMENT_TEMPLATES.slice(0, 4).map((tpl) => {
              const IconComp = TEMPLATE_ICONS[tpl.icon] || Sparkles;
              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={cn(
                    'group p-4 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between',
                    'bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-border)]',
                    'hover:border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-1'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: tpl.color }}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      {tpl.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]">
                          {tpl.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                      {tpl.title}
                    </h3>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary)] pt-3 mt-2 border-t border-[var(--color-border)]/60 opacity-80 group-hover:opacity-100">
                    <span>Use template</span>
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Recent Documents */}
        {recent.length > 0 && (
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                <Clock className="w-4 h-4" />
                Recent Documents
              </h2>
              <button
                onClick={() => navigate('/recent')}
                className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1 transition-colors"
              >
                View all recent <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recent.slice(0, 6).map((doc) => {
                const words = doc.word_count || countWords(stripHtml(doc.content));
                const readingMins = Math.max(1, Math.ceil(words / 200));

                return (
                  <div
                    key={doc.id}
                    onClick={() => navigate(`/editor/${doc.id}`)}
                    className={cn(
                      'flex flex-col justify-between p-5 rounded-3xl text-left cursor-pointer group transition-all duration-300',
                      'bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-border)]',
                      'hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-primary)]/40'
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-xl bg-[var(--color-bg-tertiary)] group-hover:bg-[var(--color-primary-light)] transition-colors shrink-0">
                            <FileText className="w-4 h-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors" />
                          </div>
                          <h3 className="font-bold text-sm text-[var(--color-text)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                            {doc.title || 'Untitled Document'}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(doc.id);
                          }}
                          className="p-1 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors shrink-0"
                          title={doc.is_favorite ? 'Remove favorite' : 'Mark favorite'}
                        >
                          <Star className={cn('w-4 h-4 transition-transform group-hover:scale-110', doc.is_favorite ? 'text-amber-400 fill-amber-400' : 'text-[var(--color-text-tertiary)]')} />
                        </button>
                      </div>

                      <p className="text-xs text-[var(--color-text-tertiary)] line-clamp-3 leading-relaxed mb-4">
                        {truncateText(stripHtml(doc.content), 120) || 'Empty document — start typing...'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]/60 text-[11px] text-[var(--color-text-tertiary)]">
                      <span>{formatRelativeDate(doc.updated_at)}</span>
                      <span className="font-medium bg-[var(--color-bg)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                        {words} words · ~{readingMins}m
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Empty State when no documents exist */}
        {recent.length === 0 && (
          <motion.div variants={itemVariants} className="py-12">
            <EmptyState
              icon={FileText}
              title="Your workspace is fresh and clean"
              description="Create your first document or start with one of our pre-built templates."
              action={
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTemplateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-all"
                  >
                    <LayoutGrid className="w-4 h-4 text-[var(--color-primary)]" />
                    Browse Templates
                  </button>
                  <button
                    onClick={handleNewDoc}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create Blank Document
                  </button>
                </div>
              }
            />
          </motion.div>
        )}

        {/* Inspiration Quote */}
        <motion.div 
          variants={itemVariants}
          className="p-5 rounded-3xl bg-gradient-to-r from-[var(--color-primary-light)]/20 via-transparent to-[var(--color-primary-light)]/10 border border-[var(--color-border)] flex items-center justify-between gap-4 text-xs text-[var(--color-text-secondary)]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-primary)] text-white shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p className="italic">
              “Either write something worth reading or do something worth writing.” — Benjamin Franklin
            </p>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-semibold text-[var(--color-primary)]">
            RoughSpace Pro
          </span>
        </motion.div>
      </motion.div>

      {/* Template Picker Modal */}
      <TemplatePickerModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
