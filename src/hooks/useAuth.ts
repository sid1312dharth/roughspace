import { useEffect, useState } from 'react';
import { authService, type AuthUser } from '@/services/auth';
import { useAppStore } from '@/store';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const { setUserId, setCloudMode } = useAppStore();

  useEffect(() => {
    // Subscribe to auth service events
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setUserId(currentUser?.id ?? null);
      setCloudMode(currentUser?.provider === 'supabase');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUserId, setCloudMode]);

  const signIn = async (email: string, password: string, rememberMe = true) => {
    setLoading(true);
    try {
      return await authService.signIn(email, password, rememberMe);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      return await authService.signUp(name, email, password);
    } finally {
      setLoading(false);
    }
  };

  const signInWithDemo = async (demoId?: string) => {
    setLoading(true);
    try {
      return await authService.signInWithDemo(demoId);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { name?: string; avatar_url?: string }) => {
    return await authService.updateProfile(updates);
  };

  return {
    user,
    session: user ? { user } : null,
    loading,
    isCloudMode: user?.provider === 'supabase',
    signIn,
    signUp,
    signInWithDemo,
    signOut,
    updateProfile,
    isSupabaseConfigured: authService.isSupabaseConfigured(),
  };
}

