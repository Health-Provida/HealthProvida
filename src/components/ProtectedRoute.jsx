/**
 * ProtectedRoute.jsx
 * ──────────────────────────────────────────────────────────────
 * Route guard component that checks auth state and role before
 * rendering children. Redirects unauthenticated users to /login
 * and unauthorized users to / with a toast message.
 * ──────────────────────────────────────────────────────────────
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ADMIN_ROLES = ['super_admin', 'admin', 'moderator'];

/**
 * @param {Object} props
 * @param {string} [props.requiredRole] - A specific role required ('admin', 'super_admin', 'moderator', 'provider')
 * @param {string[]} [props.allowedRoles] - Array of roles that are allowed
 * @param {boolean} [props.requireAuth] - Just require authentication, no role check (default true)
 * @param {React.ReactNode} props.children
 */
export default function ProtectedRoute({ 
  requiredRole, 
  allowedRoles,
  requireAuth = true, 
  children 
}) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is resolving
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check specific role requirement
  if (requiredRole) {
    // For 'admin' requirement, allow any admin-tier role
    if (requiredRole === 'admin') {
      if (!ADMIN_ROLES.includes(role)) {
        return <Navigate to="/" replace />;
      }
    } else if (role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  // Check allowed roles array
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
