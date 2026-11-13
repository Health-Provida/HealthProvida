/**
 * ProtectedRoute.tsx
 * ──────────────────────────────────────────────────────────────
 * Route guard for the provider portal. Ensures the user is:
 *   1. Authenticated (has an active Supabase session)
 *   2. A provider (profile.role === 'provider')
 *
 * Unauthenticated users → /login
 * Non-provider users → shown an access denied message
 * ──────────────────────────────────────────────────────────────
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isProvider, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is resolving
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but not a provider → show access denied
  if (!isProvider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">
            Access Denied
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            This portal is only available to verified healthcare providers.
            If you believe this is an error, please contact support.
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Go to HealthProvida
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

