import { formatDistanceToNow } from 'date-fns';
import { History, X, Clock, Plus, RotateCcw } from 'lucide-react';
import { useVersions } from '@/hooks/useVersions';
import { useState } from 'react';

interface VersionHistoryProps {
  documentId: string;
  currentTitle: string;
  currentContent: string;
  onClose: () => void;
}

export function VersionHistory({ documentId, currentTitle, currentContent, onClose }: VersionHistoryProps) {
  const { versions, createVersion, restoreVersion } = useVersions(documentId);
  const [description, setDescription] = useState('');

  const handleCreateSnapshot = async () => {
    await createVersion(currentTitle, currentContent, description || 'Manual Snapshot');
    setDescription('');
  };

  const handleRestore = async (versionId: string) => {
    if (confirm('Are you sure you want to restore this version? Your current work will be saved as a snapshot.')) {
      await restoreVersion(versionId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-xl z-50 flex flex-col animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <h3 className="font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-[var(--color-primary)]" />
          Version History
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <h4 className="text-sm font-medium mb-2">Create Snapshot</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Version description (optional)"
            className="flex-1 px-3 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-primary)]"
          />
          <button
            onClick={handleCreateSnapshot}
            className="px-3 py-1.5 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded text-sm hover:bg-[var(--color-primary-hover)] flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {versions.length === 0 ? (
          <div className="text-center p-8 text-[var(--color-text-tertiary)]">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No versions saved yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {versions.map((version) => (
              <div
                key={version.id}
                className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] transition-colors group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono text-[var(--color-text-tertiary)]">
                    v{version.version_number}
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)]" title={new Date(version.created_at).toLocaleString()}>
                    {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm font-medium mb-3">
                  {version.change_description || 'Manual Snapshot'}
                </p>
                <button
                  onClick={() => handleRestore(version.id)}
                  className="w-full py-1.5 px-3 bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] group-hover:bg-[var(--color-primary-light)] group-hover:text-[var(--color-primary)] rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore This Version
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
