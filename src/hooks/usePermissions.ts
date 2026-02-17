import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS, UserRole } from '@/types/database';

/**
 * Custom hook for managing role-based permissions
 * Provides methods to check if current user has specific permissions
 */
export function usePermissions() {
  const { profile } = useAuth();

  // Cache permission checks based on profile role
  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      if (!profile) return false;
      
      // Admin and Manager have all permissions
      if (profile.role === 'admin' || profile.role === 'manager') {
        return true;
      }

      // Role-specific permissions
      const rolePermissions = getRolePermissions(profile.role);
      return rolePermissions.includes(permission);
    };
  }, [profile]);

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccessRoute = (route: string): boolean => {
    if (!profile) return false;

    // Admin and Manager can access all routes
    if (profile.role === 'admin' || profile.role === 'manager') {
      return true;
    }

    // Route-specific access control
    const routeAccessMap: Record<string, UserRole[]> = {
      '/dashboard': ['admin', 'manager', 'receptionist', 'accounts', 'housekeeping'],
      '/rooms': ['admin', 'manager', 'receptionist', 'housekeeping'],
      '/guests': ['admin', 'manager', 'receptionist'],
      '/reservations': ['admin', 'manager', 'receptionist', 'accounts'],
      '/front-desk': ['admin', 'manager', 'receptionist'],
      '/billing': ['admin', 'manager', 'receptionist', 'accounts'],
      '/analytics': ['admin', 'manager', 'accounts'],
      '/settings': ['admin', 'manager'],
      '/users': ['admin', 'manager'],
    };

    const allowedRoles = routeAccessMap[route];
    return allowedRoles ? allowedRoles.includes(profile.role) : false;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    role: profile?.role,
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager',
    isReceptionist: profile?.role === 'receptionist',
    isAccounts: profile?.role === 'accounts',
    isHousekeeping: profile?.role === 'housekeeping',
  };
}

/**
 * Helper function to get permissions by role
 * This defines what actions each role can perform
 */
function getRolePermissions(role: UserRole): string[] {
  const rolePermissionMap: Record<UserRole, string[]> = {
    // Admin has all permissions (handled separately)
    admin: Object.values(PERMISSIONS),
    
    // Manager has all permissions (handled separately)
    manager: Object.values(PERMISSIONS),
    
    // Receptionist - Front desk operations
    receptionist: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.ROOMS_VIEW,
      PERMISSIONS.GUESTS_VIEW,
      PERMISSIONS.GUESTS_CREATE,
      PERMISSIONS.GUESTS_UPDATE,
      PERMISSIONS.RESERVATIONS_VIEW,
      PERMISSIONS.RESERVATIONS_CREATE,
      PERMISSIONS.RESERVATIONS_UPDATE,
      PERMISSIONS.FRONTDESK_ACCESS,
      PERMISSIONS.FRONTDESK_CHECKIN,
      PERMISSIONS.FRONTDESK_CHECKOUT,
      PERMISSIONS.FRONTDESK_ROOM_CHANGE,
      PERMISSIONS.BILLING_VIEW,
    ],
    
    // Accounts - Financial operations
    accounts: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.ROOMS_VIEW,
      PERMISSIONS.GUESTS_VIEW,
      PERMISSIONS.RESERVATIONS_VIEW,
      PERMISSIONS.BILLING_VIEW,
      PERMISSIONS.BILLING_CREATE,
      PERMISSIONS.BILLING_UPDATE,
      PERMISSIONS.BILLING_PROCESS_PAYMENT,
      PERMISSIONS.BILLING_REFUND,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.ANALYTICS_FINANCIAL,
      PERMISSIONS.ANALYTICS_OPERATIONAL,
    ],
    
    // Housekeeping - Room cleaning and maintenance
    housekeeping: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.ROOMS_VIEW,
      PERMISSIONS.ROOMS_UPDATE_STATUS,
      PERMISSIONS.RESERVATIONS_VIEW,
    ],
  };

  return rolePermissionMap[role] || [];
}
