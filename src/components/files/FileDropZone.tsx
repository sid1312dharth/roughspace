import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { UploadCloud } from 'lucide-react';
import { importService } from '@/services/import';
import { useAppStore } from '@/store';

interface FileDropZoneProps {
  children: React.ReactNode;
}

export function FileDropZone({ children }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useAppStore();

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0]; // Process one file at a time for now

      try {
        if (file.name.endsWith('.json')) {
          // Attempt workspace restore
          await importService.importWorkspaceBackup(file);
          addToast({
            title: 'Backup Restored',
            description: 'Workspace has been successfully restored.',
            type: 'success'
          });
        } else {
          // Import as document
          const newDocId = await importService.createDocumentFromFile(file);
          addToast({
            title: 'Document Imported',
            description: `Successfully imported ${file.name}`,
            type: 'success'
          });
          navigate(`/editor/${newDocId}`);
        }
      } catch (err: any) {
        addToast({
          title: 'Import Failed',
          description: err.message || 'Could not import the file.',
          type: 'error'
        });
      }
    };

    // Attach to window
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [navigate, addToast]);

  return (
    <>
      {children}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-[var(--color-bg-overlay)] backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-[var(--color-surface)] p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border-2 border-dashed border-[var(--color-primary)] animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-1">Drop to import</h3>
              <p className="text-[var(--color-text-secondary)]">Supports .txt, .md, .html, and .json backups</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
