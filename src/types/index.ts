// ─── Document Types ───────────────────────────────────────────────

export type SyncStatus = 'local' | 'pending' | 'synced' | 'conflict' | 'error';
export type SaveStatus = 'idle' | 'typing' | 'saving' | 'saved' | 'error';
export type ViewMode = 'edit' | 'read' | 'focus';
export type ThemeMode = 'light' | 'dark' | 'system';
export type SortBy = 'last_opened' | 'last_modified' | 'title' | 'created';
export type SortOrder = 'asc' | 'desc';

export interface Document {
  id: string;
  user_id?: string;
  folder_id: string | null;
  title: string;
  content: string; // TipTap JSON string
  is_favorite: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  last_opened_at: string;
  version: number;
  sync_status: SyncStatus;
  word_count: number;
  character_count: number;
}

// ─── Folder Types ──────────────────────────────────────────────────

export interface Folder {
  id: string;
  user_id?: string;
  parent_id: string | null;
  name: string;
  created_at: string;
  updated_at: string;
  is_expanded?: boolean;
}

export interface FolderTreeNode extends Folder {
  children: FolderTreeNode[];
  document_count: number;
}

// ─── Tag Types ─────────────────────────────────────────────────────

export interface Tag {
  id: string;
  user_id?: string;
  name: string;
  color: string;
  created_at: string;
}

export interface DocumentTag {
  document_id: string;
  tag_id: string;
}

// ─── Version Types ─────────────────────────────────────────────────

export interface Version {
  id: string;
  document_id: string;
  user_id?: string;
  title: string;
  content: string;
  created_at: string;
  version_number: number;
  change_description?: string;
}

// ─── Attachment Types ──────────────────────────────────────────────

export interface Attachment {
  id: string;
  document_id: string;
  user_id?: string;
  filename: string;
  storage_path: string;
  mime_type: string;
  size: number;
  data?: ArrayBuffer; // For local storage
  created_at: string;
}

// ─── Sync Queue Types ──────────────────────────────────────────────

export type SyncOperation = 'create' | 'update' | 'delete';
export type EntityType = 'document' | 'folder' | 'tag' | 'document_tag' | 'attachment';

export interface SyncQueueItem {
  id?: number; // Auto-incremented
  user_id?: string;
  entity_type: EntityType;
  entity_id: string;
  operation: SyncOperation;
  payload: string; // JSON serialized
  created_at: string;
  synced_at?: string;
}

// ─── User Preferences ─────────────────────────────────────────────

export interface UserPreferences {
  id: string;
  theme: ThemeMode;
  editor_font_family: string;
  editor_font_size: number;
  editor_line_spacing: number;
  editor_width: 'narrow' | 'medium' | 'wide' | 'full';
  spell_check: boolean;
  autosave_interval: number; // ms
  sidebar_width: number;
  sidebar_collapsed: boolean;
  compact_layout: boolean;
  default_folder_id: string | null;
  default_sort_by: SortBy;
  default_sort_order: SortOrder;
  confirm_before_delete: boolean;
  auto_open_last_document: boolean;
  last_document_id: string | null;
  trash_auto_delete_days: number; // 0 = never
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  id: 'default',
  theme: 'dark',
  editor_font_family: 'Inter',
  editor_font_size: 16,
  editor_line_spacing: 1.75,
  editor_width: 'medium',
  spell_check: true,
  autosave_interval: 800,
  sidebar_width: 280,
  sidebar_collapsed: false,
  compact_layout: false,
  default_folder_id: null,
  default_sort_by: 'last_modified',
  default_sort_order: 'desc',
  confirm_before_delete: true,
  auto_open_last_document: true,
  last_document_id: null,
  trash_auto_delete_days: 30,
};

// ─── Search Types ──────────────────────────────────────────────────

export interface SearchFilters {
  query: string;
  folder_id?: string | null;
  tag_ids?: string[];
  is_favorite?: boolean;
  modified_after?: string;
  modified_before?: string;
}

export interface SearchResult {
  document: Document;
  matches: {
    field: 'title' | 'content';
    snippet: string;
  }[];
}

// ─── Command Palette Types ─────────────────────────────────────────

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  category: 'document' | 'navigation' | 'editor' | 'settings' | 'view';
  action: () => void;
}

// ─── UI State Types ────────────────────────────────────────────────

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}
