import { create } from 'zustand';
import type {
  Document,
  Folder,
  FolderTreeNode,
  Tag,
  SaveStatus,
  ViewMode,
  ThemeMode,
  SortBy,
  SortOrder,
  ToastMessage,
  } from '@/types';
import { DEFAULT_PREFERENCES as DEFAULTS } from '@/types';

// ─── Document Slice ────────────────────────────────────────────────

interface DocumentSlice {
  documents: Document[];
  activeDocumentId: string | null;
  activeDocument: Document | null;
  saveStatus: SaveStatus;

  setDocuments: (docs: Document[]) => void;
  setActiveDocumentId: (id: string | null) => void;
  setActiveDocument: (doc: Document | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  updateDocumentInList: (doc: Document) => void;
  removeDocumentFromList: (id: string) => void;
  addDocumentToList: (doc: Document) => void;
}

// ─── Folder Slice ──────────────────────────────────────────────────

interface FolderSlice {
  folders: Folder[];
  folderTree: FolderTreeNode[];
  activeFolderId: string | null;

  setFolders: (folders: Folder[]) => void;
  setFolderTree: (tree: FolderTreeNode[]) => void;
  setActiveFolderId: (id: string | null) => void;
  toggleFolderExpanded: (id: string) => void;
}

// ─── Tag Slice ─────────────────────────────────────────────────────

interface TagSlice {
  tags: Tag[];
  activeTagId: string | null;

  setTags: (tags: Tag[]) => void;
  setActiveTagId: (id: string | null) => void;
}

// ─── Editor Slice ──────────────────────────────────────────────────

interface EditorSlice {
  viewMode: ViewMode;
  isToolbarVisible: boolean;
  findReplaceOpen: boolean;

  setViewMode: (mode: ViewMode) => void;
  setToolbarVisible: (visible: boolean) => void;
  setFindReplaceOpen: (open: boolean) => void;
  toggleFocusMode: () => void;
  toggleReadingMode: () => void;
}

// ─── UI Slice ──────────────────────────────────────────────────────

interface UISlice {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  mobileMenuOpen: boolean;
  commandPaletteOpen: boolean;
  searchOpen: boolean;
  toasts: ToastMessage[];
  activeModal: string | null;
  sortBy: SortBy;
  sortOrder: SortOrder;

  setTheme: (theme: ThemeMode) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  setActiveModal: (modal: string | null) => void;
  setSortBy: (sort: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
}

// ─── Sync Slice ────────────────────────────────────────────────────

interface SyncSlice {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: string | null;
  pendingChanges: number;
  isCloudMode: boolean;
  userId: string | null;

  setOnline: (online: boolean) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'synced' | 'error') => void;
  setLastSyncedAt: (date: string | null) => void;
  setPendingChanges: (count: number) => void;
  setCloudMode: (enabled: boolean) => void;
  setUserId: (id: string | null) => void;
}

// ─── Combined Store ────────────────────────────────────────────────

type AppStore = DocumentSlice & FolderSlice & TagSlice & EditorSlice & UISlice & SyncSlice;

export const useAppStore = create<AppStore>()((set) => ({
  // ─── Document State ──────────────────────────────────────────
  documents: [],
  activeDocumentId: null,
  activeDocument: null,
  saveStatus: 'idle',

  setDocuments: (documents) => set({ documents }),
  setActiveDocumentId: (activeDocumentId) => set({ activeDocumentId }),
  setActiveDocument: (activeDocument) => set({ activeDocument }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  updateDocumentInList: (doc) =>
    set((state) => ({
      documents: state.documents.map((d) => (d.id === doc.id ? doc : d)),
      activeDocument: state.activeDocument?.id === doc.id ? doc : state.activeDocument,
    })),
  removeDocumentFromList: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      activeDocument: state.activeDocument?.id === id ? null : state.activeDocument,
      activeDocumentId: state.activeDocumentId === id ? null : state.activeDocumentId,
    })),
  addDocumentToList: (doc) =>
    set((state) => ({ documents: [doc, ...state.documents] })),

  // ─── Folder State ────────────────────────────────────────────
  folders: [],
  folderTree: [],
  activeFolderId: null,

  setFolders: (folders) => set({ folders }),
  setFolderTree: (folderTree) => set({ folderTree }),
  setActiveFolderId: (activeFolderId) => set({ activeFolderId }),
  toggleFolderExpanded: (id) =>
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, is_expanded: !f.is_expanded } : f
      ),
    })),

  // ─── Tag State ───────────────────────────────────────────────
  tags: [],
  activeTagId: null,

  setTags: (tags) => set({ tags }),
  setActiveTagId: (activeTagId) => set({ activeTagId }),

  // ─── Editor State ────────────────────────────────────────────
  viewMode: 'edit',
  isToolbarVisible: true,
  findReplaceOpen: false,

  setViewMode: (viewMode) => set({ viewMode }),
  setToolbarVisible: (isToolbarVisible) => set({ isToolbarVisible }),
  setFindReplaceOpen: (findReplaceOpen) => set({ findReplaceOpen }),
  toggleFocusMode: () =>
    set((state) => ({
      viewMode: state.viewMode === 'focus' ? 'edit' : 'focus',
      sidebarCollapsed: state.viewMode !== 'focus',
    })),
  toggleReadingMode: () =>
    set((state) => ({
      viewMode: state.viewMode === 'read' ? 'edit' : 'read',
    })),

  // ─── UI State ────────────────────────────────────────────────
  theme: 'dark',
  sidebarCollapsed: false,
  sidebarWidth: DEFAULTS.sidebar_width,
  mobileMenuOpen: false,
  commandPaletteOpen: false,
  searchOpen: false,
  toasts: [],
  activeModal: null,
  sortBy: 'last_modified',
  sortOrder: 'desc',

  setTheme: (theme) => set({ theme }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setActiveModal: (activeModal) => set({ activeModal }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),

  // ─── Sync State ──────────────────────────────────────────────
  isOnline: navigator.onLine,
  syncStatus: 'idle',
  lastSyncedAt: null,
  pendingChanges: 0,
  isCloudMode: false,
  userId: null,

  setOnline: (isOnline) => set({ isOnline }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setPendingChanges: (pendingChanges) => set({ pendingChanges }),
  setCloudMode: (isCloudMode) => set({ isCloudMode }),
  setUserId: (userId) => set({ userId }),
}));
