import Dexie, { type EntityTable } from 'dexie';
import type {
  Document,
  Folder,
  Tag,
  DocumentTag,
  Version,
  Attachment,
  SyncQueueItem,
  UserPreferences,
} from '@/types';

const db = new Dexie('MyWritingPadDB') as Dexie & {
  documents: EntityTable<Document, 'id'>;
  folders: EntityTable<Folder, 'id'>;
  tags: EntityTable<Tag, 'id'>;
  document_tags: EntityTable<DocumentTag, 'document_id'>;
  versions: EntityTable<Version, 'id'>;
  attachments: EntityTable<Attachment, 'id'>;
  sync_queue: EntityTable<SyncQueueItem, 'id'>;
  preferences: EntityTable<UserPreferences, 'id'>;
};

db.version(1).stores({
  documents: 'id, user_id, folder_id, title, is_favorite, is_deleted, created_at, updated_at, last_opened_at, sync_status',
  folders: 'id, user_id, parent_id, name, created_at',
  tags: 'id, user_id, name, created_at',
  document_tags: '[document_id+tag_id], document_id, tag_id',
  versions: 'id, document_id, created_at, version_number',
  attachments: 'id, document_id, user_id, filename, created_at',
  sync_queue: '++id, user_id, entity_type, entity_id, operation, created_at, synced_at',
  preferences: 'id',
});

export { db };
