import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import type { UserRole } from '@/types/database';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  requireAll?: boolean; // Require all permissions or just one
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles,
  requiredPermissions,
  requireAll = false,
  fallback
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const { hasAnyPermission, hasAllPermissions } = usePermissions();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles && profile && !requiredRoles.includes(profile.role)) {
    return renderUnauthorized(fallback, `Your role (${profile.role}) is not authorized for this resource.`);
  }

  // Check permission-based access
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      const permissionsList = requiredPermissions.join(', ');
      const message = requireAll
        ? `You need all of these permissions: ${permissionsList}`
        : `You need at least one of these permissions: ${permissionsList}`;
      return renderUnauthorized(fallback, message);
    }
  }

  return <>{children}</>;
}

// Helper function to render unauthorized access UI
function renderUnauthorized(fallback: ReactNode | undefined, message: string) {
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="space-x-3">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
