/**
 * AuthContext.jsx
 * ──────────────────────────────────────────────────────────────
 * Provides authentication state and methods to the entire app.
 * 
 * Manages: user session, profile (including role), loading state.
 * Exposes: signUp, signIn, signOut, resetPassword, verifyOtp,
 *          checkPhoneExists, isAdmin, isProvider,
 *          isSuperAdmin, isModerator, hasAdminWrite, adminRole.
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

  const signUp = useCallback(async ({ email, password, firstName, lastName, dateOfBirth, phone, optOutPromo }) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };

    const fullName = `${firstName} ${lastName}`.trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth || null,
          phone: phone || null,
          promo_opt_out: optOutPromo || false,
        },
      },
    });

    return { data, error };
  }, []);

  /**
   * Check if a phone number already exists in the profiles table.
   * @param {string} phone
   * @returns {Promise<{exists: boolean, error?: object}>}
   */
  const checkPhoneExists = useCallback(async (phone) => {
    if (!supabase || !phone?.trim()) return { exists: false };

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone.trim())
      .limit(1);

    if (error) return { exists: false, error };
    return { exists: data && data.length > 0 };
  }, []);

  /**
   * Verify an OTP code (6-digit) sent to email during signup.
   * On success, automatically logs the user in.
   * @param {{ email: string, token: string }} params
   * @returns {Promise<{data?: object, error?: object}>}
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

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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

  const resetPassword = useCallback(async (email) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { data, error };
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
    return {
      user,
      session,
      profile,
      loading,
      // Auth methods
      signUp,
      signIn,
      signOut,
      resetPassword,
      refreshProfile,
      checkPhoneExists,
      verifyOtp,
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
  }, [user, session, profile, loading, signUp, signIn, signOut, resetPassword, refreshProfile, checkPhoneExists, verifyOtp]);

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
