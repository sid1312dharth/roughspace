import { db } from '@/lib/db';
import type {
  Document,
  Folder,
  Tag,
  DocumentTag,
  Version,
  Attachment,
  UserPreferences,
  SearchFilters,
  SyncStatus,
} from '@/types';
import { DEFAULT_PREFERENCES } from '@/types';
import { generateId, now, stripHtml, countWords, countCharacters } from '@/lib/utils';

// ─── Documents ─────────────────────────────────────────────────────

export async function createDocument(
  partial: Partial<Document> = {}
): Promise<Document> {
  const timestamp = now();
  const doc: Document = {
    id: generateId(),
    folder_id: null,
    title: '',
    content: '',
    is_favorite: false,
    is_deleted: false,
    created_at: timestamp,
    updated_at: timestamp,
    last_opened_at: timestamp,
    version: 1,
    sync_status: 'local' as SyncStatus,
    word_count: 0,
    character_count: 0,
    ...partial,
  };
  await db.documents.add(doc);
  return doc;
}

export async function getDocument(id: string): Promise<Document | undefined> {
  return db.documents.get(id);
}

export async function updateDocument(
  id: string,
  changes: Partial<Document>
): Promise<void> {
  await db.documents.update(id, {
    ...changes,
    updated_at: now(),
  });
}

export async function updateDocumentContent(
  id: string,
  content: string,
  title?: string
): Promise<void> {
  const plainText = stripHtml(content);
  await db.documents.update(id, {
    content,
    ...(title !== undefined && { title }),
    updated_at: now(),
    word_count: countWords(plainText),
    character_count: countCharacters(plainText),
  });
}

export async function deleteDocument(id: string): Promise<void> {
  await db.documents.update(id, {
    is_deleted: true,
    deleted_at: now(),
    updated_at: now(),
  });
}

export async function permanentlyDeleteDocument(id: string): Promise<void> {
  await db.transaction('rw', [db.documents, db.document_tags, db.versions, db.attachments], async () => {
    await db.document_tags.where('document_id').equals(id).delete();
    await db.versions.where('document_id').equals(id).delete();
    await db.attachments.where('document_id').equals(id).delete();
    await db.documents.delete(id);
  });
}

export async function restoreDocument(id: string): Promise<void> {
  await db.documents.update(id, {
    is_deleted: false,
    deleted_at: undefined,
    updated_at: now(),
  });
}

export async function duplicateDocument(id: string): Promise<Document | undefined> {
  const original = await db.documents.get(id);
  if (!original) return undefined;

  const timestamp = now();
  const duplicate: Document = {
    ...original,
    id: generateId(),
    title: original.title ? `${original.title} Copy` : 'Untitled Document Copy',
    created_at: timestamp,
    updated_at: timestamp,
    last_opened_at: timestamp,
    is_favorite: false,
    version: 1,
    sync_status: 'local',
  };
  await db.documents.add(duplicate);

  // Copy tags
  const tags = await db.document_tags.where('document_id').equals(id).toArray();
  if (tags.length > 0) {
    await db.document_tags.bulkAdd(
      tags.map((t) => ({ document_id: duplicate.id, tag_id: t.tag_id }))
    );
  }

  return duplicate;
}

export async function moveDocument(id: string, folderId: string | null): Promise<void> {
  await db.documents.update(id, {
    folder_id: folderId,
    updated_at: now(),
  });
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const doc = await db.documents.get(id);
  if (!doc) return false;
  const newValue = !doc.is_favorite;
  await db.documents.update(id, { is_favorite: newValue, updated_at: now() });
  return newValue;
}

export async function touchDocument(id: string): Promise<void> {
  await db.documents.update(id, { last_opened_at: now() });
}

export async function getAllDocuments(): Promise<Document[]> {
  return db.documents
    .where('is_deleted')
    .equals(0)
    .reverse()
    .sortBy('updated_at');
}

export async function getDocumentsByFolder(folderId: string | null): Promise<Document[]> {
  if (folderId === null) {
    return db.documents
      .where('is_deleted')
      .equals(0)
      .filter((d) => d.folder_id === null)
      .reverse()
      .sortBy('updated_at');
  }
  return db.documents
    .where({ folder_id: folderId, is_deleted: false })
    .reverse()
    .sortBy('updated_at');
}

export async function getFavoriteDocuments(): Promise<Document[]> {
  return db.documents
    .where({ is_favorite: true, is_deleted: false })
    .reverse()
    .sortBy('updated_at');
}

export async function getRecentDocuments(limit = 20): Promise<Document[]> {
  const all = await db.documents
    .where('is_deleted')
    .equals(0)
    .toArray();
  return all
    .sort((a, b) => new Date(b.last_opened_at).getTime() - new Date(a.last_opened_at).getTime())
    .slice(0, limit);
}

export async function getTrashDocuments(): Promise<Document[]> {
  return db.documents
    .where('is_deleted')
    .equals(1)
    .reverse()
    .sortBy('deleted_at');
}

export async function emptyTrash(): Promise<void> {
  const trashed = await db.documents.where('is_deleted').equals(1).toArray();
  await db.transaction('rw', [db.documents, db.document_tags, db.versions, db.attachments], async () => {
    for (const doc of trashed) {
      await db.document_tags.where('document_id').equals(doc.id).delete();
      await db.versions.where('document_id').equals(doc.id).delete();
      await db.attachments.where('document_id').equals(doc.id).delete();
    }
    await db.documents.where('is_deleted').equals(1).delete();
  });
}

export async function searchDocuments(filters: SearchFilters): Promise<Document[]> {
  let results = await db.documents.where('is_deleted').equals(0).toArray();

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        stripHtml(d.content).toLowerCase().includes(q)
    );
  }

  if (filters.folder_id !== undefined) {
    results = results.filter((d) => d.folder_id === filters.folder_id);
  }

  if (filters.is_favorite !== undefined) {
    results = results.filter((d) => d.is_favorite === filters.is_favorite);
  }

  if (filters.tag_ids && filters.tag_ids.length > 0) {
    const docTags = await db.document_tags.toArray();
    const docIdsWithTags = new Set(
      docTags
        .filter((dt) => filters.tag_ids!.includes(dt.tag_id))
        .map((dt) => dt.document_id)
    );
    results = results.filter((d) => docIdsWithTags.has(d.id));
  }

  if (filters.modified_after) {
    const after = new Date(filters.modified_after).getTime();
    results = results.filter((d) => new Date(d.updated_at).getTime() >= after);
  }

  if (filters.modified_before) {
    const before = new Date(filters.modified_before).getTime();
    results = results.filter((d) => new Date(d.updated_at).getTime() <= before);
  }

  return results.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export async function getDocumentCount(): Promise<number> {
  return db.documents.where('is_deleted').equals(0).count();
}

// ─── Folders ───────────────────────────────────────────────────────

export async function createFolder(
  name: string,
  parentId: string | null = null
): Promise<Folder> {
  const timestamp = now();
  const folder: Folder = {
    id: generateId(),
    parent_id: parentId,
    name,
    created_at: timestamp,
    updated_at: timestamp,
    is_expanded: true,
  };
  await db.folders.add(folder);
  return folder;
}

export async function getFolder(id: string): Promise<Folder | undefined> {
  return db.folders.get(id);
}

export async function updateFolder(id: string, changes: Partial<Folder>): Promise<void> {
  await db.folders.update(id, { ...changes, updated_at: now() });
}

export async function deleteFolder(id: string, moveDocsTo: 'parent' | 'trash'): Promise<void> {
  const folder = await db.folders.get(id);
  if (!folder) return;

  await db.transaction('rw', [db.documents, db.folders], async () => {
    // Move documents
    const docs = await db.documents.where('folder_id').equals(id).toArray();
    for (const doc of docs) {
      if (moveDocsTo === 'parent') {
        await db.documents.update(doc.id, { folder_id: folder.parent_id, updated_at: now() });
      } else {
        await db.documents.update(doc.id, { is_deleted: true, deleted_at: now(), updated_at: now() });
      }
    }

    // Move child folders to parent
    const children = await db.folders.where('parent_id').equals(id).toArray();
    for (const child of children) {
      await db.folders.update(child.id, { parent_id: folder.parent_id, updated_at: now() });
    }

    // Delete folder
    await db.folders.delete(id);
  });
}

export async function getAllFolders(): Promise<Folder[]> {
  return db.folders.toArray();
}

export async function buildFolderTree(folders: Folder[]): Promise<import('@/types').FolderTreeNode[]> {
  const docCounts = new Map<string, number>();
  const docs = await db.documents.where('is_deleted').equals(0).toArray();
  for (const doc of docs) {
    if (doc.folder_id) {
      docCounts.set(doc.folder_id, (docCounts.get(doc.folder_id) || 0) + 1);
    }
  }

  const map = new Map<string, import('@/types').FolderTreeNode>();
  for (const f of folders) {
    map.set(f.id, {
      ...f,
      children: [],
      document_count: docCounts.get(f.id) || 0,
    });
  }

  const roots: import('@/types').FolderTreeNode[] = [];
  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  roots.sort((a, b) => a.name.localeCompare(b.name));
  return roots;
}

export async function getFolderPath(folderId: string): Promise<Folder[]> {
  const path: Folder[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder: Folder | undefined = await db.folders.get(currentId);
    if (!folder) break;
    path.unshift(folder);
    currentId = folder.parent_id;
  }

  return path;
}

// ─── Tags ──────────────────────────────────────────────────────────

const TAG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#64748b', '#78716c',
];

export async function createTag(name: string): Promise<Tag> {
  const existingTags = await db.tags.toArray();
  const color = TAG_COLORS[existingTags.length % TAG_COLORS.length];
  const tag: Tag = {
    id: generateId(),
    name,
    color,
    created_at: now(),
  };
  await db.tags.add(tag);
  return tag;
}

export async function updateTag(id: string, changes: Partial<Tag>): Promise<void> {
  await db.tags.update(id, changes);
}

export async function deleteTag(id: string): Promise<void> {
  await db.transaction('rw', [db.tags, db.document_tags], async () => {
    await db.document_tags.where('tag_id').equals(id).delete();
    await db.tags.delete(id);
  });
}

export async function getAllTags(): Promise<Tag[]> {
  return db.tags.toArray();
}

export async function addTagToDocument(documentId: string, tagId: string): Promise<void> {
  const existing = await db.document_tags
    .where({ document_id: documentId, tag_id: tagId })
    .first();
  if (!existing) {
    await db.document_tags.add({ document_id: documentId, tag_id: tagId });
  }
}

export async function removeTagFromDocument(documentId: string, tagId: string): Promise<void> {
  await db.document_tags
    .where({ document_id: documentId, tag_id: tagId })
    .delete();
}

export async function getDocumentTags(documentId: string): Promise<Tag[]> {
  const docTags = await db.document_tags.where('document_id').equals(documentId).toArray();
  const tagIds = docTags.map((dt) => dt.tag_id);
  if (tagIds.length === 0) return [];
  return db.tags.where('id').anyOf(tagIds).toArray();
}

export async function getTagDocumentCount(tagId: string): Promise<number> {
  return db.document_tags.where('tag_id').equals(tagId).count();
}

// ─── Versions ──────────────────────────────────────────────────────

export async function createVersion(
  documentId: string,
  title: string,
  content: string,
  changeDescription?: string
): Promise<Version> {
  const existing = await db.versions
    .where('document_id')
    .equals(documentId)
    .toArray();
  const version: Version = {
    id: generateId(),
    document_id: documentId,
    title,
    content,
    created_at: now(),
    version_number: existing.length + 1,
    change_description: changeDescription,
  };
  await db.versions.add(version);
  return version;
}

export async function getDocumentVersions(documentId: string): Promise<Version[]> {
  return db.versions
    .where('document_id')
    .equals(documentId)
    .reverse()
    .sortBy('created_at');
}

export async function getVersion(id: string): Promise<Version | undefined> {
  return db.versions.get(id);
}

export async function deleteVersion(id: string): Promise<void> {
  await db.versions.delete(id);
}

export async function getVersionCount(documentId: string): Promise<number> {
  return db.versions.where('document_id').equals(documentId).count();
}

// ─── Attachments ───────────────────────────────────────────────────

export async function createAttachment(
  documentId: string,
  file: File
): Promise<Attachment> {
  const data = await file.arrayBuffer();
  const attachment: Attachment = {
    id: generateId(),
    document_id: documentId,
    filename: file.name,
    storage_path: `local/${documentId}/${file.name}`,
    mime_type: file.type,
    size: file.size,
    data,
    created_at: now(),
  };
  await db.attachments.add(attachment);
  return attachment;
}

export async function getDocumentAttachments(documentId: string): Promise<Attachment[]> {
  return db.attachments.where('document_id').equals(documentId).toArray();
}

export async function deleteAttachment(id: string): Promise<void> {
  await db.attachments.delete(id);
}

export async function getAttachment(id: string): Promise<Attachment | undefined> {
  return db.attachments.get(id);
}

// ─── Preferences ───────────────────────────────────────────────────

export async function getPreferences(): Promise<UserPreferences> {
  const prefs = await db.preferences.get('default');
  if (prefs) return prefs;
  await db.preferences.add(DEFAULT_PREFERENCES);
  return DEFAULT_PREFERENCES;
}

export async function updatePreferences(changes: Partial<UserPreferences>): Promise<void> {
  const existing = await db.preferences.get('default');
  if (existing) {
    await db.preferences.update('default', changes);
  } else {
    await db.preferences.add({ ...DEFAULT_PREFERENCES, ...changes });
  }
}

// ─── Backup & Restore ─────────────────────────────────────────────

export interface BackupData {
  version: string;
  exported_at: string;
  documents: Document[];
  folders: Folder[];
  tags: Tag[];
  document_tags: DocumentTag[];
  versions: Version[];
  preferences: UserPreferences;
}

export async function exportBackup(): Promise<BackupData> {
  const [documents, folders, tags, document_tags, versions, preferences] = await Promise.all([
    db.documents.toArray(),
    db.folders.toArray(),
    db.tags.toArray(),
    db.document_tags.toArray(),
    db.versions.toArray(),
    getPreferences(),
  ]);

  return {
    version: '1.0.0',
    exported_at: now(),
    documents,
    folders,
    tags,
    document_tags,
    versions,
    preferences,
  };
}

export async function importBackup(data: BackupData, mode: 'merge' | 'replace'): Promise<void> {
  if (mode === 'replace') {
    await db.transaction('rw', db.tables, async () => {
      await Promise.all(db.tables.map((t) => t.clear()));
      await db.documents.bulkAdd(data.documents);
      await db.folders.bulkAdd(data.folders);
      await db.tags.bulkAdd(data.tags);
      await db.document_tags.bulkAdd(data.document_tags);
      await db.versions.bulkAdd(data.versions);
      await db.preferences.put(data.preferences);
    });
  } else {
    // Merge: add new items, skip existing
    await db.transaction('rw', db.tables, async () => {
      for (const doc of data.documents) {
        const existing = await db.documents.get(doc.id);
        if (!existing) {
          await db.documents.add(doc);
        } else if (new Date(doc.updated_at) > new Date(existing.updated_at)) {
          await db.documents.put(doc);
        }
      }
      for (const folder of data.folders) {
        const existing = await db.folders.get(folder.id);
        if (!existing) await db.folders.add(folder);
      }
      for (const tag of data.tags) {
        const existing = await db.tags.get(tag.id);
        if (!existing) await db.tags.add(tag);
      }
      for (const dt of data.document_tags) {
        const existing = await db.document_tags
          .where({ document_id: dt.document_id, tag_id: dt.tag_id })
          .first();
        if (!existing) await db.document_tags.add(dt);
      }
      for (const version of data.versions) {
        const existing = await db.versions.get(version.id);
        if (!existing) await db.versions.add(version);
      }
    });
  }
}

// ─── Storage Stats ─────────────────────────────────────────────────

export async function getStorageStats(): Promise<{
  documentCount: number;
  attachmentCount: number;
  versionCount: number;
  folderCount: number;
  tagCount: number;
}> {
  const [documentCount, attachmentCount, versionCount, folderCount, tagCount] = await Promise.all([
    db.documents.count(),
    db.attachments.count(),
    db.versions.count(),
    db.folders.count(),
    db.tags.count(),
  ]);
  return { documentCount, attachmentCount, versionCount, folderCount, tagCount };
}
