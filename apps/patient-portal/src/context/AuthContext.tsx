/**
 * AuthContext.tsx
 * ──────────────────────────────────────────────────────────────
 * Provides authentication state and methods to the entire app.
 * ──────────────────────────────────────────────────────────────
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  date_of_birth: string | null;
  bio: string | null;
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (params: { email: string }) => Promise<{ data: any; error: any }>;
  signInVerifyOtp: (params: { email: string; token: string }) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ data: any; error: any }>;
  refreshProfile: () => Promise<Profile | null>;
  verifyOtp: (params: { email: string; token: string }) => Promise<{ data: any; error: any }>;
  isProfileIncomplete: boolean;
  isAuthenticated: boolean;
  role: string;
  isAdmin: boolean;
  isProvider: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  hasAdminWrite: boolean;
  adminRole: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_ROLES = ['super_admin', 'admin', 'moderator'];
const ADMIN_WRITE_ROLES = ['super_admin', 'admin'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!supabase || !userId) {
      setProfile(null);
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url, role, created_at, date_of_birth, bio')
        .eq('id', userId)
        .single();

      console.log('[AuthContext DEBUG] fetchProfile result:', { userId, data, error });
      console.log('[AuthContext DEBUG] role from DB:', data?.role);

      if (error) {
        console.error('AuthContext: Failed to fetch profile:', error);
        setProfile(null);
        return null;
      }
      setProfile(data as Profile);
      return data as Profile;
    } catch (err) {
      console.error('AuthContext: Profile fetch exception:', err);
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const client = supabase;

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await client.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } catch (err) {
        console.error('AuthContext: Init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          if (event === 'SIGNED_IN') {
            setTimeout(() => fetchProfile(newSession.user.id), 500);
          } else {
            await fetchProfile(newSession.user.id);
          }
        } else {
          setProfile(null);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async ({ email }: { email: string }) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    return { data, error };
  }, []);

  const signInVerifyOtp = useCallback(async ({ email, token }: { email: string; token: string }) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    return { data, error };
  }, []);

  const verifyOtp = useCallback(async ({ email, token }: { email: string; token: string }) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    return { data, error };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (user?.id) {
      return await fetchProfile(user.id);
    }
    return null;
  }, [user, fetchProfile]);

  const value = useMemo((): AuthContextValue => {
    const role = profile?.role ?? 'patient';
    const isProfileIncomplete = !profile?.full_name || profile.full_name.trim() === '';

    console.log('[AuthContext DEBUG] useMemo recalc:', {
      'profile?.role': profile?.role,
      resolvedRole: role,
      isAdmin: ADMIN_ROLES.includes(role),
      isProvider: role === 'provider',
      isSuperAdmin: role === 'super_admin',
      isAuthenticated: !!session,
      hasProfile: !!profile,
    });

    return {
      user,
      session,
      profile,
      loading,
      signIn,
      signInVerifyOtp,
      signOut,
      updatePassword,
      refreshProfile,
      verifyOtp,
      isProfileIncomplete,
      isAuthenticated: !!session,
      role,
      isAdmin: ADMIN_ROLES.includes(role),
      isProvider: role === 'provider',
      isSuperAdmin: role === 'super_admin',
      isModerator: role === 'moderator',
      hasAdminWrite: ADMIN_WRITE_ROLES.includes(role),
      adminRole: ADMIN_ROLES.includes(role) ? role : null,
    };
  }, [user, session, profile, loading, signIn, signInVerifyOtp, signOut, updatePassword, refreshProfile, verifyOtp]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
