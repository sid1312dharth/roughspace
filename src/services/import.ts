import { marked } from 'marked';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { Document } from '@/types';

// Read file as text
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export const importService = {
  /**
   * Import a file (TXT, MD, HTML) and return the resulting HTML content and parsed title
   */
  importFile: async (file: File): Promise<{ title: string; htmlContent: string }> => {
    const text = await readFileAsText(file);
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    // Default title is filename without extension
    const title = file.name.replace(/\.[^/.]+$/, "");
    let htmlContent = '';

    if (extension === 'md' || extension === 'markdown') {
      htmlContent = await marked.parse(text);
    } else if (extension === 'html' || extension === 'htm') {
      // Very basic cleanup (could be improved with a sanitizer like DOMPurify)
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      htmlContent = doc.body.innerHTML || text;
    } else if (extension === 'txt') {
      // Escape HTML and convert newlines to paragraphs
      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      htmlContent = escaped.split('\n').map(line => `<p>${line}</p>`).join('');
    } else {
      throw new Error('Unsupported file format. Please use .txt, .md, or .html');
    }

    return { title, htmlContent };
  },

  /**
   * Import a JSON backup file and restore the workspace
   */
  importWorkspaceBackup: async (file: File) => {
    const text = await readFileAsText(file);
    
    try {
      const backup = JSON.parse(text);
      if (!backup.data || !backup.data.documents) {
        throw new Error('Invalid backup format');
      }

      const { documents, folders, tags, document_tags } = backup.data;

      await db.transaction('rw', db.documents, db.folders, db.tags, db.document_tags, async () => {
        // We can either clear and restore, or merge. Let's merge for safety,
        // but normally a "restore" wipes current state or avoids conflicts.
        // For simplicity, we just put() everything (upsert).
        
        if (folders?.length) await db.folders.bulkPut(folders);
        if (tags?.length) await db.tags.bulkPut(tags);
        if (documents?.length) await db.documents.bulkPut(documents);
        if (document_tags?.length) await db.document_tags.bulkPut(document_tags);
      });

      return true;
    } catch (e) {
      console.error('Backup import failed', e);
      throw new Error('Failed to parse or restore backup file.');
    }
  },

  /**
   * Create a new document from an imported file
   */
  createDocumentFromFile: async (file: File, folderId?: string): Promise<string> => {
    const { title, htmlContent } = await importService.importFile(file);
    
    const newDoc: Document = {
      id: uuidv4(),
      title,
      content: htmlContent,
      folder_id: folderId || null,
      is_favorite: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_opened_at: new Date().toISOString(),
      version: 1,
      sync_status: 'local',
      word_count: htmlContent.replace(/<[^>]*>?/gm, '').trim().split(/\s+/).filter(w => w.length > 0).length,
      character_count: htmlContent.replace(/<[^>]*>?/gm, '').length,
    };

    await db.documents.add(newDoc);
    return newDoc.id;
  }
};
