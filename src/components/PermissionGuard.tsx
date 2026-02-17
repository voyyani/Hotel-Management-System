import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: ReactNode;
  permissions?: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showUnauthorized?: boolean;
}

/**
 * PermissionGuard - Conditionally render children based on user permissions
 * 
 * @param children - Content to render if user has permission
 * @param permissions - Single permission string or array of permissions to check
 * @param requireAll - If true, user must have ALL permissions. If false, user needs ANY permission (default: false)
 * @param fallback - Optional content to render if user lacks permission
 * @param showUnauthorized - If true, shows "unauthorized" message instead of nothing (default: false)
 * 
 * @example
 * <PermissionGuard permissions="rooms.delete">
 *   <DeleteButton />
 * </PermissionGuard>
 * 
 * @example
 * <PermissionGuard permissions={['billing.view', 'analytics.view']} requireAll={false}>
 *   <FinancialSection />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback = null,
  showUnauthorized = false,
}: PermissionGuardProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  // If no permissions specified, render children
  if (!permissions) {
    return <>{children}</>;
  }

  let hasAccess = false;

  // Check permissions
  if (typeof permissions === 'string') {
    hasAccess = hasPermission(permissions);
  } else if (Array.isArray(permissions)) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // Render based on access
  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have permission
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUnauthorized) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">
          You don't have permission to view this content.
        </p>
      </div>
    );
  }

  return null;
}
