import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export class SyncService {
  private static syncing = false;

  static async sync() {
    if (this.syncing) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    this.syncing = true;
    try {
      await this.pushLocalChanges(user.id);
      await this.pullCloudChanges(user.id);
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      this.syncing = false;
    }
  }

  private static async pushLocalChanges(userId: string) {
    const documents = await db.documents.toArray();
    const folders = await db.folders.toArray();
    const tags = await db.tags.toArray();

    // Push documents
    const myDocs = documents.filter(d => d.user_id === userId);
    if (myDocs.length > 0) {
      const { error } = await supabase.from('documents').upsert(myDocs);
      if (error) console.error("Error syncing documents to cloud:", error);
    }

    // Push folders
    const myFolders = folders.filter(f => f.user_id === userId);
    if (myFolders.length > 0) {
      const { error } = await supabase.from('folders').upsert(myFolders);
      if (error) console.error("Error syncing folders to cloud:", error);
    }

    // Push tags
    const myTags = tags.filter(t => t.user_id === userId);
    if (myTags.length > 0) {
      const { error } = await supabase.from('tags').upsert(myTags);
      if (error) console.error("Error syncing tags to cloud:", error);
    }
  }

  private static async pullCloudChanges(userId: string) {
    // Sync documents
    const { data: cloudDocs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId);

    if (!docsError && cloudDocs) {
      await db.transaction('rw', db.documents, async () => {
        for (const cloudDoc of cloudDocs) {
          const localDoc = await db.documents.get(cloudDoc.id);
          if (!localDoc || new Date(cloudDoc.updated_at) > new Date(localDoc.updated_at)) {
            await db.documents.put(cloudDoc);
          }
        }
      });
    }

    // Sync folders
    const { data: cloudFolders, error: foldersError } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId);
      
    if (!foldersError && cloudFolders) {
      await db.transaction('rw', db.folders, async () => {
        for (const cloudFolder of cloudFolders) {
          const localFolder = await db.folders.get(cloudFolder.id);
          if (!localFolder) {
            await db.folders.put(cloudFolder);
          }
        }
      });
    }

    // Sync tags
    const { data: cloudTags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId);
      
    if (!tagsError && cloudTags) {
      await db.transaction('rw', db.tags, async () => {
        for (const cloudTag of cloudTags) {
          const localTag = await db.tags.get(cloudTag.id);
          if (!localTag) {
            await db.tags.put(cloudTag);
          }
        }
      });
    }
  }
}
