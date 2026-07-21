/**
 * AuthContext.jsx
 * ──────────────────────────────────────────────────────────────
 * Provides authentication state and methods to the entire app.
 * 
 * Auth model: passwordless email OTP.
 *  - signIn  → sends a 6-digit OTP to the user's email
 *  - signInVerifyOtp → verifies the OTP and establishes session
 *  - Users are auto-created on first OTP sign-in by Supabase.
 *  - Password is optional and can be set/changed in-app while
 *    already authenticated (no reset email needed).
 *
 * Exposes: signIn, signInVerifyOtp, signOut, verifyOtp,
 *          updatePassword, refreshProfile,
 *          isAdmin, isProvider, isSuperAdmin, isModerator,
 *          hasAdminWrite, adminRole, isProfileIncomplete.
 * ──────────────────────────────────────────────────────────────
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase';

const AuthContext = createContext(null);

const ADMIN_ROLES = ['super_admin', 'admin', 'moderator'];
const ADMIN_WRITE_ROLES = ['super_admin', 'admin'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the user's profile from the profiles table
  const fetchProfile = useCallback(async (userId) => {
    if (!supabase || !userId) {
      setProfile(null);
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url, role, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('AuthContext: Failed to fetch profile:', error);
        setProfile(null);
        return null;
      }
      setProfile(data);
      return data;
    } catch (err) {
      console.error('AuthContext: Profile fetch exception:', err);
      setProfile(null);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Small delay to allow the profile trigger to create the row on signup
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

  // ─── Auth Methods ────────────────────────────────────────

  /**
   * Send a 6-digit OTP to the user's email.
   * If the user doesn't exist, Supabase auto-creates the account.
   * @param {{ email: string }} params
   */
  const signIn = useCallback(async ({ email }) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    return { data, error };
  }, []);

  /**
   * Verify a 6-digit OTP code sent to email during sign-in.
   * On success, establishes the session (auto-login).
   * @param {{ email: string, token: string }} params
   */
  const signInVerifyOtp = useCallback(async ({ email, token }) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    return { data, error };
  }, []);

  /**
   * Verify an OTP code (6-digit) sent to email during signup.
   * Kept for backward compatibility with older signup-type flows.
   * @param {{ email: string, token: string }} params
   */
  const verifyOtp = useCallback(async ({ email, token }) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    return { data, error };
  }, []);

  /**
   * Update the user's password while already authenticated.
   * No reset email required — works directly with the current session.
   * @param {string} newPassword
   */
  const updatePassword = useCallback(async (newPassword) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };

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

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      return await fetchProfile(user.id);
    }
    return null;
  }, [user, fetchProfile]);

  // ─── Computed Role Checks ────────────────────────────────

  const value = useMemo(() => {
    const role = profile?.role ?? 'patient';
    const isProfileIncomplete = !profile?.full_name || profile.full_name.trim() === '';

    return {
      user,
      session,
      profile,
      loading,
      // Auth methods
      signIn,
      signInVerifyOtp,
      signOut,
      updatePassword,
      refreshProfile,
      verifyOtp,
      // Profile state
      isProfileIncomplete,
      // Role checks
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

/**
 * Hook to access auth state and methods.
 * Must be used within an <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
