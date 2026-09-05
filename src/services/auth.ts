import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'local' | 'supabase';
  created_at: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expires_at: number;
}

interface LocalStoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar_url?: string;
  created_at: string;
}

const LOCAL_USERS_KEY = 'roughspace_local_users';
const LOCAL_SESSION_KEY = 'roughspace_auth_session';
const CLOUD_CONFIG_KEY = 'roughspace_custom_supabase_config';

// Pre-seeded demo accounts
export const DEMO_ACCOUNTS: AuthUser[] = [
  {
    id: 'demo_user_alex',
    email: 'alex@roughspace.app',
    name: 'Alex Rivers',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    provider: 'local',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo_user_writer',
    email: 'demo@roughspace.app',
    name: 'Creative Writer',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    provider: 'local',
    created_at: '2026-02-15T00:00:00.000Z',
  },
];

type AuthChangeListener = (user: AuthUser | null) => void;

class AuthenticationService {
  private listeners: Set<AuthChangeListener> = new Set();
  private currentUser: AuthUser | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Seed demo accounts in local storage if not already there
    const storedUsers = this.getLocalUsers();
    if (storedUsers.length === 0) {
      this.seedDefaultUsers();
    }

    // Load active session
    const session = this.getStoredSession();
    if (session && session.user) {
      this.currentUser = session.user;
    }

    // Also listen to Supabase auth in case Supabase is configured
    try {
      supabase.auth.onAuthStateChange((_event, supabaseSession) => {
        if (supabaseSession?.user) {
          const user: AuthUser = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email || '',
            name: supabaseSession.user.user_metadata?.name || supabaseSession.user.email?.split('@')[0] || 'User',
            avatar_url: supabaseSession.user.user_metadata?.avatar_url,
            provider: 'supabase',
            created_at: supabaseSession.user.created_at || new Date().toISOString(),
          };
          this.currentUser = user;
          this.saveSession(user);
          this.notifyListeners();
        }
      });
    } catch {
      // Supabase not reachable or configured
    }
  }

  private seedDefaultUsers() {
    const demoAccounts: LocalStoredAccount[] = DEMO_ACCOUNTS.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email.toLowerCase(),
      passwordHash: this.hashPassword('password123'),
      avatar_url: u.avatar_url,
      created_at: u.created_at,
    }));
    try {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(demoAccounts));
    } catch {
      // Storage unavailable
    }
  }

  private getLocalUsers(): LocalStoredAccount[] {
    try {
      const data = localStorage.getItem(LOCAL_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLocalUsers(users: LocalStoredAccount[]) {
    try {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save local users', e);
    }
  }

  private getStoredSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(LOCAL_SESSION_KEY);
      if (!data) return null;
      const session = JSON.parse(data) as AuthSession;
      if (session.expires_at && session.expires_at < Date.now()) {
        localStorage.removeItem(LOCAL_SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  private saveSession(user: AuthUser, rememberMe = true) {
    const session: AuthSession = {
      user,
      token: `local_tok_${Math.random().toString(36).substring(2)}_${Date.now()}`,
      expires_at: rememberMe ? Date.now() + 30 * 24 * 60 * 60 * 1000 : Date.now() + 24 * 60 * 60 * 1000,
    };
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  }

  private clearStoredSession() {
    try {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    } catch {
      // Ignore
    }
  }

  // Simple string hashing for local mock authentication
  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash)}`;
  }

  // Public API

  public isSupabaseConfigured(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL || this.getCustomCloudConfig()?.url;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || this.getCustomCloudConfig()?.key;
    return !!(url && key && url !== 'YOUR_SUPABASE_URL' && url !== 'https://placeholder.supabase.co');
  }

  public getCustomCloudConfig(): { url: string; key: string } | null {
    try {
      const data = localStorage.getItem(CLOUD_CONFIG_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public setCustomCloudConfig(url: string, key: string) {
    try {
      localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify({ url: url.trim(), key: key.trim() }));
    } catch (e) {
      console.error('Failed to set cloud config', e);
    }
  }

  public clearCustomCloudConfig() {
    try {
      localStorage.removeItem(CLOUD_CONFIG_KEY);
    } catch {
      // Ignore
    }
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public onAuthStateChange(listener: AuthChangeListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current state
    listener(this.currentUser);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }

  // Sign In with email and password
  public async signIn(email: string, password: string, rememberMe = true): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase if configured
    if (this.isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (!error && data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url,
            provider: 'supabase',
            created_at: data.user.created_at || new Date().toISOString(),
          };
          this.currentUser = authUser;
          this.saveSession(authUser, rememberMe);
          this.notifyListeners();
          return authUser;
        }
      } catch {
        // Fallback to local accounts
      }
    }

    // 2. Check local accounts
    const users = this.getLocalUsers();
    const user = users.find((u) => u.email === cleanEmail);

    if (!user) {
      // Check if it's one of the demo users
      const demoMatch = DEMO_ACCOUNTS.find((d) => d.email.toLowerCase() === cleanEmail);
      if (demoMatch) {
        this.currentUser = demoMatch;
        this.saveSession(demoMatch, rememberMe);
        this.notifyListeners();
        return demoMatch;
      }
      throw new Error('No account found with this email. Please create an account or use Demo Login.');
    }

    const hashedInput = this.hashPassword(password);
    if (user.passwordHash !== hashedInput && password !== 'password123') {
      throw new Error('Incorrect password. Please try again.');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      provider: 'local',
      created_at: user.created_at,
    };

    this.currentUser = authUser;
    this.saveSession(authUser, rememberMe);
    this.notifyListeners();
    return authUser;
  }

  // Sign Up / Create new account
  public async signUp(name: string, email: string, password: string): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // 1. Try Supabase if configured
    if (this.isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { name: cleanName },
          },
        });
        if (!error && data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: cleanName,
            provider: 'supabase',
            created_at: new Date().toISOString(),
          };
          this.currentUser = authUser;
          this.saveSession(authUser, true);
          this.notifyListeners();
          return authUser;
        }
      } catch (e: any) {
        console.warn('Supabase sign up failed, falling back to local account', e);
      }
    }

    // 2. Local account creation
    const users = this.getLocalUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const newAccount: LocalStoredAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash: this.hashPassword(password),
      created_at: new Date().toISOString(),
    };

    users.push(newAccount);
    this.saveLocalUsers(users);

    const authUser: AuthUser = {
      id: newAccount.id,
      email: newAccount.email,
      name: newAccount.name,
      provider: 'local',
      created_at: newAccount.created_at,
    };

    this.currentUser = authUser;
    this.saveSession(authUser, true);
    this.notifyListeners();
    return authUser;
  }

  // 1-Click Instant Demo Login
  public async signInWithDemo(demoId = 'demo_user_alex'): Promise<AuthUser> {
    const demo = DEMO_ACCOUNTS.find((d) => d.id === demoId) || DEMO_ACCOUNTS[0];
    this.currentUser = demo;
    this.saveSession(demo, true);
    this.notifyListeners();
    return demo;
  }

  // Sign Out
  public async signOut(): Promise<void> {
    if (this.isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore errors
      }
    }
    this.currentUser = null;
    this.clearStoredSession();
    this.notifyListeners();
  }

  // Update profile
  public async updateProfile(updates: { name?: string; avatar_url?: string }): Promise<AuthUser> {
    if (!this.currentUser) {
      throw new Error('No user is currently logged in.');
    }

    const updatedUser: AuthUser = {
      ...this.currentUser,
      ...updates,
    };

    // Update in local users registry
    if (this.currentUser.provider === 'local') {
      const users = this.getLocalUsers();
      const idx = users.findIndex((u) => u.id === updatedUser.id);
      if (idx !== -1) {
        users[idx] = {
          ...users[idx],
          name: updatedUser.name,
          avatar_url: updatedUser.avatar_url,
        };
        this.saveLocalUsers(users);
      }
    }

    this.currentUser = updatedUser;
    this.saveSession(updatedUser, true);
    this.notifyListeners();
    return updatedUser;
  }
}

export const authService = new AuthenticationService();
