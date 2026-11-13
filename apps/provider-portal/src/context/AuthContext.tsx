/**
 * AuthContext.tsx
 * ──────────────────────────────────────────────────────────────
 * Provides authentication state and methods to the provider portal.
 *
 * Auth model: passwordless email OTP (same as the patient portal).
 *  - signIn  → sends a 6-digit OTP to the user's email
 *  - verifyOtp → verifies the OTP and establishes session
 *  - Only users with profile.role === 'provider' can access the portal
 *
 * Exposes: signIn, verifyOtp, signOut, user, profile, loading,
 *          isAuthenticated, isProvider.
 * ──────────────────────────────────────────────────────────────
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { resetClinicId } from "@/lib/supabase-services";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

interface AuthResult {
  data?: unknown;
  error?: { message: string } | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isProvider: boolean;
  signIn: (email: string) => Promise<AuthResult>;
  verifyOtp: (email: string, token: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, avatar_url, role, created_at")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("[ProviderAuth] Failed to fetch profile:", error);
        setProfile(null);
        return;
      }
      setProfile(data as Profile);
    } catch (err) {
      console.error("[ProviderAuth] Profile fetch exception:", err);
      setProfile(null);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } catch (err) {
        console.error("[ProviderAuth] Init error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        if (event === "SIGNED_IN") {
          // Small delay to allow the profile trigger to create the row on signup
          setTimeout(() => fetchProfile(newSession.user.id), 500);
        } else {
          await fetchProfile(newSession.user.id);
        }
      } else {
        setProfile(null);
      }

      if (event === "SIGNED_OUT") {
        setProfile(null);
        resetClinicId();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // ─── Auth Methods ────────────────────────────────────────

  const signIn = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { error: { message: "Supabase not configured" } };

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    return { data, error };
  }, []);

  const verifyOtp = useCallback(
    async (email: string, token: string): Promise<AuthResult> => {
      if (!supabase) return { error: { message: "Supabase not configured" } };

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      return { data, error };
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    resetClinicId();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  // ─── Computed Values ────────────────────────────────────────

  const value = useMemo<AuthContextValue>(() => {
    const role = profile?.role ?? "patient";

    return {
      user,
      session,
      profile,
      loading,
      isAuthenticated: !!session,
      isProvider: role === "provider",
      signIn,
      verifyOtp,
      signOut,
      refreshProfile,
    };
  }, [user, session, profile, loading, signIn, verifyOtp, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state and methods.
 * Must be used within an <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

