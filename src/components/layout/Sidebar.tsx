import { useState, } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAppStore } from '@/store';
import { useDocuments } from '@/hooks/useDocuments';
import { useFolders } from '@/hooks/useFolders';
import { useTags } from '@/hooks/useTags';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Home,
  Clock,
  Star,
  FileText,
  Trash2,
  Settings,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  Hash,
  PanelLeftClose,
  PanelLeft,
  PenSquare,
  X,
  LayoutGrid,
  LogOut,
  User as UserIcon,
  Sparkles,
  MoreVertical,
} from 'lucide-react';
import type { FolderTreeNode } from '@/types';
import { TemplatePickerModal } from '@/components/common/TemplatePickerModal';
import type { DocumentTemplate } from '@/data/templates';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    setMobileMenuOpen,
    setSearchOpen,
    addToast,
    } = useAppStore();
  const { folderTree } = useAppStore();
  const { tags } = useAppStore();
  const { user, signOut, isCloudMode } = useAuth();
  const { createDocument, createDocumentFromTemplate } = useDocuments();
  const { createFolder, toggleFolderExpanded } = useFolders();
  const { activeTagId, setActiveTagId, activeFolderId, setActiveFolderId } = useAppStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTag, setShowNewTag] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { createTag } = useTags();

  const isActive = (path: string) => location.pathname === path;

  const handleCreateDoc = async () => {
    const doc = await createDocument(activeFolderId);
    if (doc) {
      navigate(`/editor/${doc.id}`);
      setMobileMenuOpen(false);
    }
  };

  const handleSelectTemplate = async (template: DocumentTemplate) => {
    const doc = await createDocumentFromTemplate(template, activeFolderId);
    if (doc) {
      navigate(`/editor/${doc.id}`);
      setMobileMenuOpen(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    await createTag(newTagName.trim());
    setNewTagName('');
    setShowNewTag(false);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/recent', icon: Clock, label: 'Recent' },
    { path: '/favorites', icon: Star, label: 'Favorites' },
    { path: '/documents', icon: FileText, label: 'All Documents' },
  ];

  const renderFolderNode = (node: FolderTreeNode, depth: number = 0) => (
    <div key={node.id} className="space-y-0.5">
      <div
        className={cn(
          'group flex items-center gap-1.5 w-full px-2 py-1.5 text-sm rounded-xl transition-all duration-200 cursor-pointer',
          'hover:bg-[var(--color-sidebar-hover)]',
          activeFolderId === node.id 
            ? 'bg-[var(--color-sidebar-active)] text-[var(--color-primary)] font-medium shadow-xs' 
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
        )}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={() => {
          setActiveFolderId(node.id);
          navigate(`/documents?folder=${node.id}`);
          setMobileMenuOpen(false);
        }}
      >
        {node.children.length > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolderExpanded(node.id);
            }}
            className="p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            {node.is_expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <Folder className={cn(
          "w-4 h-4 shrink-0 transition-colors",
          activeFolderId === node.id ? "text-[var(--color-primary)] fill-[var(--color-primary)]/20" : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]"
        )} />
        <span className="truncate flex-1 text-left text-xs font-medium">{node.name}</span>
        {node.document_count > 0 && (
          <span className="text-[10px] font-semibold text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded-full mr-1">
            {node.document_count}
          </span>
        )}
      </div>
      {node.is_expanded &&
        node.children.map((child) => renderFolderNode(child, depth + 1))}
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <h1 className="text-lg font-bold tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] shadow-[var(--shadow-glow)]">
            <PenSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-gradient">RoughSpace</span>
        </h1>
        <button
          onClick={() => {
            toggleSidebar();
            setMobileMenuOpen(false);
          }}
          className="p-2 rounded-xl hover:bg-[var(--color-sidebar-hover)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
          aria-label="Toggle sidebar"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* New Document Button */}
      <div className="px-4 pt-2">
        <button
          onClick={handleCreateDoc}
          className={cn(
            'flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold',
            'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white',
            'hover:shadow-lg hover:shadow-[var(--color-primary-light)] hover:-translate-y-0.5',
            'transition-all duration-300'
          )}
        >
          <Plus className="w-5 h-5" />
          New Document
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-2">
        <button
          onClick={() => {
            setSearchOpen(true);
            setMobileMenuOpen(false);
          }}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm',
            'border border-[var(--color-border)] text-[var(--color-text-tertiary)]',
            'hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-secondary)]',
            'transition-colors'
          )}
        >
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="ml-auto text-xs bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 pt-3 space-y-1">
        {/* Main Nav */}
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setActiveFolderId(null);
                setActiveTagId(null);
                setMobileMenuOpen(false);
              }}
              className={cn(
                'relative flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-200 font-medium',
                'hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text)]',
                isActive(item.path) && !activeFolderId && !activeTagId
                  ? 'bg-[var(--color-sidebar-active)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              )}
            >
              {isActive(item.path) && !activeFolderId && !activeTagId && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent)]" />
              )}
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}

          <button
            onClick={() => {
              setTemplateModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className={cn(
              'relative flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-200 font-medium',
              'hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text)] text-[var(--color-text-secondary)]'
            )}
          >
            <LayoutGrid className="w-4 h-4 text-[var(--color-primary)]" />
            <span>Templates</span>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2 py-0.5 rounded-full">
              6 New
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--color-sidebar-border)] my-3" />

        {/* Folders */}
        <div>
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Folders
            </span>
            <button
              onClick={() => setShowNewFolder(true)}
              className="p-1 rounded hover:bg-[var(--color-sidebar-hover)] text-[var(--color-text-tertiary)]"
              aria-label="Create folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {showNewFolder && (
            <div className="px-3 pb-1.5">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') setShowNewFolder(false);
                }}
                placeholder="Folder name..."
                className={cn(
                  'w-full px-2.5 py-1.5 text-sm rounded-lg',
                  'bg-[var(--color-bg)] border border-[var(--color-border-focus)]',
                  'outline-none text-[var(--color-text)]',
                  'placeholder:text-[var(--color-text-tertiary)]'
                )}
                autoFocus
              />
            </div>
          )}

          <div className="space-y-0.5">
            {folderTree.map((node) => renderFolderNode(node))}
          </div>

          {folderTree.length === 0 && !showNewFolder && (
            <p className="px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
              No folders yet
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--color-sidebar-border)] my-3" />

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Tags
            </span>
            <button
              onClick={() => setShowNewTag(true)}
              className="p-1 rounded hover:bg-[var(--color-sidebar-hover)] text-[var(--color-text-tertiary)]"
              aria-label="Create tag"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {showNewTag && (
            <div className="px-3 pb-1.5">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTag();
                  if (e.key === 'Escape') setShowNewTag(false);
                }}
                placeholder="Tag name..."
                className={cn(
                  'w-full px-2.5 py-1.5 text-sm rounded-lg',
                  'bg-[var(--color-bg)] border border-[var(--color-border-focus)]',
                  'outline-none text-[var(--color-text)]',
                  'placeholder:text-[var(--color-text-tertiary)]'
                )}
                autoFocus
              />
            </div>
          )}

          <div className="space-y-0.5">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  setActiveTagId(tag.id);
                  navigate(`/documents?tag=${tag.id}`);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-1.5 text-sm rounded-lg transition-colors',
                  'hover:bg-[var(--color-sidebar-hover)]',
                  activeTagId === tag.id && 'bg-[var(--color-sidebar-active)]'
                )}
              >
                <Hash className="w-4 h-4" style={{ color: tag.color }} />
                <span className="truncate">{tag.name}</span>
              </button>
            ))}
          </div>

          {tags.length === 0 && !showNewTag && (
            <p className="px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
              No tags yet
            </p>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-sidebar-border)] px-4 py-2 space-y-0.5">
        <button
          onClick={() => {
            navigate('/trash');
            setMobileMenuOpen(false);
          }}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors',
            'hover:bg-[var(--color-sidebar-hover)]',
            isActive('/trash')
              ? 'text-[var(--color-primary)] font-medium'
              : 'text-[var(--color-text-secondary)]'
          )}
        >
          <Trash2 className="w-4 h-4" />
          <span>Trash</span>
        </button>
        <button
          onClick={() => {
            navigate('/settings');
            setMobileMenuOpen(false);
          }}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors',
            'hover:bg-[var(--color-sidebar-hover)]',
            isActive('/settings')
              ? 'text-[var(--color-primary)] font-medium'
              : 'text-[var(--color-text-secondary)]'
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        {/* Sync Status / Account Profile Card */}
        {user ? (
          <div className="relative pt-1 border-t border-[var(--color-sidebar-border)] mt-1">
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={cn(
                'group flex items-center gap-2.5 w-full p-2 text-xs transition-all rounded-xl cursor-pointer select-none',
                showUserMenu
                  ? 'bg-[var(--color-sidebar-hover)]'
                  : 'hover:bg-[var(--color-sidebar-hover)]'
              )}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || user.email}
                  className="w-8 h-8 rounded-full object-cover border border-[var(--color-border)] shadow-sm shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-xs">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                <div className="flex items-center gap-1.5 w-full">
                  <span className="truncate font-semibold text-[var(--color-text)] text-xs">
                    {user.name || 'Writer'}
                  </span>
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      isCloudMode ? 'bg-[var(--color-success)]' : 'bg-[var(--color-primary)]'
                    )}
                    title={isCloudMode ? 'Cloud Sync Active' : 'Local Account Active'}
                  />
                </div>
                <span className="truncate text-[var(--color-text-tertiary)] text-[11px] w-full">
                  {user.email}
                </span>
              </div>
              <MoreVertical className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text)] shrink-0 transition-colors" />
            </div>

            {/* User Profile Popover */}
            {showUserMenu && (
              <div className="absolute bottom-full left-2 right-2 mb-2 p-2 bg-[var(--color-surface-elevated)] backdrop-blur-2xl border border-[var(--color-border)] rounded-2xl shadow-xl z-50 animate-fade-in text-xs space-y-1">
                <div className="px-2.5 py-2 border-b border-[var(--color-border)] mb-1">
                  <p className="font-semibold text-[var(--color-text)] truncate">{user.name}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">{user.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                    {isCloudMode ? 'Cloud Account' : 'Local Account'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-left text-[var(--color-text)] hover:bg-[var(--color-sidebar-hover)] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={async () => {
                    setShowUserMenu(false);
                    await signOut();
                    addToast({ type: 'success', title: 'Signed out successfully' });
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-left text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="pt-1 border-t border-[var(--color-sidebar-border)] mt-1">
            <div
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }}
              className="group flex items-center gap-3 w-full p-2 text-xs transition-all rounded-xl cursor-pointer hover:bg-[var(--color-sidebar-hover)] select-none border border-transparent hover:border-[var(--color-primary)]/20"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white flex items-center justify-center shrink-0 shadow-sm">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                <span className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  Sign In / Join
                </span>
                <span className="text-[10px] text-[var(--color-text-tertiary)] truncate">
                  Sync docs & settings
                </span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0 opacity-80 group-hover:opacity-100" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'sidebar hidden md:flex flex-col h-full',
          'bg-transparent transition-all duration-300 relative',
          sidebarCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-[280px] min-w-[280px] opacity-100'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-[var(--color-bg-overlay)] backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[300px] bg-[var(--color-surface-elevated)] backdrop-blur-2xl border-r border-[var(--color-border)] shadow-2xl animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Collapsed Toggle */}
      {sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className={cn(
            'hidden md:flex fixed left-4 top-4 z-30 p-2.5 rounded-xl',
            'bg-[var(--color-surface-elevated)]/90 backdrop-blur-xl border border-[var(--color-border)]',
            'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]',
            'shadow-lg shadow-black/5 hover:scale-105 transition-all duration-200'
          )}
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      )}

      {/* Template Picker Modal */}
      <TemplatePickerModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </>
  );
}

