import { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Globe, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDialogProps {
  isOpen: boolean;
  onSave: (url: string, alt?: string) => void;
  onClose: () => void;
}

export function ImageDialog({ isOpen, onSave, onClose }: ImageDialogProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = activeTab === 'upload' ? previewUrl : imageUrl.trim();
    if (!finalUrl) return;

    onSave(finalUrl, altText.trim() || undefined);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setImageUrl('');
    setAltText('');
    setPreviewUrl(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={() => { handleReset(); onClose(); }} 
      />
      <div className="relative w-full max-w-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 backdrop-blur-2xl z-10 animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-sm">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text)]">
              Insert Image
            </h3>
          </div>
          <button
            onClick={() => { handleReset(); onClose(); }}
            className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'upload'
                ? 'bg-[var(--color-surface-elevated)] text-[var(--color-primary)] shadow-sm font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            )}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'url'
                ? 'bg-[var(--color-surface-elevated)] text-[var(--color-primary)] shadow-sm font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            )}
          >
            <Globe className="w-4 h-4" />
            Image URL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'upload' ? (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all',
                  isDragging 
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/20' 
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-bg)]/50'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative group max-h-48 overflow-hidden rounded-xl">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-48 object-contain rounded-xl shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                      <span className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/60">
                        Click to change image
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3.5 rounded-2xl bg-[var(--color-bg-tertiary)] mb-3 text-[var(--color-text-secondary)]">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
                      Choose an image or drag & drop
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      PNG, JPG, WebP, GIF, SVG (embedded offline)
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                  Image Web Link
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className={cn(
                    'w-full px-3.5 py-2.5 rounded-xl text-sm',
                    'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]',
                    'focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]',
                    'placeholder:text-[var(--color-text-tertiary)] transition-all'
                  )}
                />
              </div>

              {previewUrl && (
                <div className="max-h-36 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-center p-2">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    onError={() => setPreviewUrl(null)}
                    className="max-h-32 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              Alt Text / Caption (optional)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image..."
              className={cn(
                'w-full px-3.5 py-2.5 rounded-xl text-sm',
                'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]',
                'focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]',
                'placeholder:text-[var(--color-text-tertiary)] transition-all'
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => { handleReset(); onClose(); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={activeTab === 'upload' ? !previewUrl : !imageUrl.trim()}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-sm',
                'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]',
                'hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
              )}
            >
              <Check className="w-4 h-4" />
              Insert Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
