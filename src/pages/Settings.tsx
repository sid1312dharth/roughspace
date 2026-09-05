import { useAppStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { getPreferences, updatePreferences, exportBackup, importBackup, getStorageStats } from '@/services/database';
import { Sun, Moon, Monitor, Menu, Download, Upload, Database, Info, LogOut, Check, Edit2, Shield, Cloud, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth';
import { useState, useEffect, useRef } from 'react';
import type { UserPreferences } from '@/types';
import type { BackupData } from '@/services/database';

export function Settings() {
  const { setMobileMenuOpen, addToast } = useAppStore();
  const { theme, setTheme } = useTheme();
  const { user, signOut, updateProfile, isCloudMode, isSupabaseConfigured, signInWithDemo } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [stats, setStats] = useState<{ documentCount: number; attachmentCount: number; versionCount: number; folderCount: number; tagCount: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile & Cloud State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(() => user?.name || '');
  const [showCloudConfig, setShowCloudConfig] = useState(false);
  const [cloudUrl, setCloudUrl] = useState(() => authService.getCustomCloudConfig()?.url || import.meta.env.VITE_SUPABASE_URL || '');
  const [cloudKey, setCloudKey] = useState(() => authService.getCustomCloudConfig()?.key || import.meta.env.VITE_SUPABASE_ANON_KEY || '');

  useEffect(() => {
    getPreferences().then(setPrefs);
    getStorageStats().then(setStats);
  }, []);

  const updatePref = async (key: keyof UserPreferences, value: unknown) => {
    await updatePreferences({ [key]: value } as Partial<UserPreferences>);
    setPrefs((p) => p ? { ...p, [key]: value } : p);
  };

  const handleExportBackup = async () => {
    try {
      const data = await exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-writing-pad-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast({ type: 'success', title: 'Backup exported' });
    } catch {
      addToast({ type: 'error', title: 'Failed to export backup' });
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data: BackupData = JSON.parse(text);
      if (!data.version || !data.documents) {
        addToast({ type: 'error', title: 'Invalid backup file' });
        return;
      }
      await importBackup(data, 'merge');
      addToast({ type: 'success', title: 'Backup imported (merged)' });
      getStorageStats().then(setStats);
    } catch {
      addToast({ type: 'error', title: 'Failed to import backup' });
    }
    e.target.value = '';
  };

  if (!prefs) return null;

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)]">
        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-[var(--color-bg-hover)]" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Appearance */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-4">
            Appearance
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">Theme</label>
              <div className="flex gap-2">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all',
                      theme === opt.value
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]'
                    )}
                  >
                    <opt.icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-[var(--color-border)]" />

        {/* Editor */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-4">
            Editor
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">Font Size</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={12}
                  max={24}
                  value={prefs.editor_font_size}
                  onChange={(e) => updatePref('editor_font_size', Number(e.target.value))}
                  className="flex-1 accent-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text-secondary)] w-12 text-right">{prefs.editor_font_size}px</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">Line Spacing</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1.25}
                  max={2.5}
                  step={0.25}
                  value={prefs.editor_line_spacing}
                  onChange={(e) => updatePref('editor_line_spacing', Number(e.target.value))}
                  className="flex-1 accent-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text-secondary)] w-12 text-right">{prefs.editor_line_spacing}x</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--color-text)]">Spell Check</label>
              <button
                onClick={() => updatePref('spell_check', !prefs.spell_check)}
                className={cn(
                  'w-11 h-6 rounded-full transition-colors relative',
                  prefs.spell_check ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  prefs.spell_check ? 'translate-x-5' : 'translate-x-0.5'
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--color-text)]">Confirm Before Delete</label>
              <button
                onClick={() => updatePref('confirm_before_delete', !prefs.confirm_before_delete)}
                className={cn(
                  'w-11 h-6 rounded-full transition-colors relative',
                  prefs.confirm_before_delete ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  prefs.confirm_before_delete ? 'translate-x-5' : 'translate-x-0.5'
                )} />
              </button>
            </div>
          </div>
        </section>

        <div className="h-px bg-[var(--color-border)]" />

        {/* Backup & Restore */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-4">
            Import & Export
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleExportBackup}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
                'border border-[var(--color-border)] text-[var(--color-text)]',
                'hover:bg-[var(--color-bg-hover)] transition-colors'
              )}
            >
              <Download className="w-4 h-4" />
              Export Backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
                'border border-[var(--color-border)] text-[var(--color-text)]',
                'hover:bg-[var(--color-bg-hover)] transition-colors'
              )}
            >
              <Upload className="w-4 h-4" />
              Import Backup
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </div>
        </section>

        <div className="h-px bg-[var(--color-border)]" />

        {/* Account / Cloud Sync */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Account & Cloud Sync
            </h2>
            {user && (
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border',
                isCloudMode
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20'
                  : 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]/20'
              )}>
                {isCloudMode ? 'Cloud Synced' : 'Local Account'}
              </span>
            )}
          </div>

          {user ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || user.email}
                        className="w-12 h-12 rounded-2xl object-cover border border-[var(--color-border)] shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white font-bold text-lg flex items-center justify-center shadow-md">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      {isEditingName ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="px-2 py-1 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                            placeholder="Enter name"
                            autoFocus
                          />
                          <button
                            onClick={async () => {
                              if (nameInput.trim()) {
                                await updateProfile({ name: nameInput.trim() });
                                addToast({ type: 'success', title: 'Profile updated' });
                              }
                              setIsEditingName(false);
                            }}
                            className="p-1 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                            title="Save name"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setNameInput(user.name || '');
                              setIsEditingName(false);
                            }}
                            className="p-1 rounded-lg bg-[var(--color-bg)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold text-[var(--color-text)]">
                            {user.name || 'Writer'}
                          </p>
                          <button
                            onClick={() => {
                              setNameInput(user.name || '');
                              setIsEditingName(true);
                            }}
                            className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
                            title="Edit name"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-[var(--color-text-tertiary)]">{user.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await signOut();
                      addToast({ type: 'success', title: 'Signed out successfully' });
                    }}
                    className="self-start sm:self-center flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-error)] border border-[var(--color-error)]/20 hover:bg-[var(--color-error)]/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Account Details Footer */}
                <div className="pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-tertiary)]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>
                      {isCloudMode
                        ? 'Authenticated via Supabase'
                        : 'Secure Local Storage (Zero external trackers)'}
                    </span>
                  </div>
                  <span>
                    Member since {new Date(user.created_at || '2026-01-01').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Cloud Sync Configurator Box */}
              <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cloud className="w-4 h-4 text-[var(--color-primary)]" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text)]">Supabase Cloud Sync</p>
                      <p className="text-[11px] text-[var(--color-text-tertiary)]">
                        {isSupabaseConfigured
                          ? 'Supabase connection is active and configured.'
                          : 'Currently using browser-local offline database.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCloudConfig(!showCloudConfig)}
                    className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    {showCloudConfig ? 'Hide Config' : 'Configure Cloud'}
                  </button>
                </div>

                {showCloudConfig && (
                  <div className="pt-3 border-t border-[var(--color-border)] space-y-3 animate-fade-in">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                        Supabase Project URL
                      </label>
                      <input
                        type="url"
                        value={cloudUrl}
                        onChange={(e) => setCloudUrl(e.target.value)}
                        placeholder="https://xyz.supabase.co"
                        className="w-full px-3 py-1.5 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                        Supabase Anon Key
                      </label>
                      <input
                        type="password"
                        value={cloudKey}
                        onChange={(e) => setCloudKey(e.target.value)}
                        placeholder="eyJhbGciOi..."
                        className="w-full px-3 py-1.5 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCloudUrl('');
                          setCloudKey('');
                          authService.clearCustomCloudConfig();
                          addToast({ type: 'info', title: 'Reverted to local database' });
                        }}
                        className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                      >
                        Clear Custom Config
                      </button>
                      <button
                        onClick={() => {
                          if (cloudUrl && cloudKey) {
                            authService.setCustomCloudConfig(cloudUrl, cloudKey);
                            addToast({ type: 'success', title: 'Cloud Configuration Saved!' });
                            setShowCloudConfig(false);
                          }
                        }}
                        className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                      >
                        Save Cloud Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-[var(--color-text)]">Local Guest Mode</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                    Your documents are stored offline in your browser. Sign in or create an account to personalize your profile and enable cloud syncing.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => signInWithDemo('demo_user_alex')}
                    className="px-3 py-2 border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    1-Click Demo
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
                  >
                    Sign In / Register
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="h-px bg-[var(--color-border)]" />

        {/* Storage */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-4">
            Storage
          </h2>
          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
                <Database className="w-5 h-5 text-[var(--color-primary)] mb-2" />
                <p className="text-2xl font-bold text-[var(--color-text)]">{stats.documentCount}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Documents</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
                <p className="text-2xl font-bold text-[var(--color-text)]">{stats.versionCount}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Versions</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
                <p className="text-2xl font-bold text-[var(--color-text)]">{stats.folderCount}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Folders</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
                <p className="text-2xl font-bold text-[var(--color-text)]">{stats.tagCount}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Tags</p>
              </div>
            </div>
          )}
        </section>

        <div className="h-px bg-[var(--color-border)]" />

        {/* Privacy */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-4">
            Privacy
          </h2>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-secondary)] space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-info)]" />
              <p>Your documents stay in your browser unless cloud synchronization is enabled.</p>
            </div>
            <p className="ml-6">When cloud sync is enabled, your documents are securely stored under your account. Document contents are never collected for analytics.</p>
          </div>
        </section>

        {/* About */}
        <section className="pb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-4">
            About
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            <strong>My Writing Pad</strong> v1.0.0
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            A personal writing and document management application.
          </p>
        </section>
      </div>
    </div>
  );
}
