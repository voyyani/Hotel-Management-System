import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  Calendar,
  DoorOpen,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Hotel,
  X,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'desktop' | 'mobile';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  name: string;
  icon: typeof Home;
  path: string;
  badge?: number | string;
  requiredRoles?: string[];
}

export function Sidebar({ isOpen, onClose, variant = 'desktop', isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { role } = usePermissions();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
    onClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'mobile') {
      onClose();
    }
  };

  // Define navigation items based on role
  const allNavItems: NavItem[] = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Front Desk', icon: DoorOpen, path: '/front-desk', requiredRoles: ['admin', 'manager', 'receptionist'] },
    { name: 'Rooms', icon: Hotel, path: '/rooms', requiredRoles: ['admin', 'manager', 'receptionist', 'housekeeping'] },
    { name: 'Guests', icon: Users, path: '/guests', requiredRoles: ['admin', 'manager', 'receptionist'] },
    { name: 'Reservations', icon: Calendar, path: '/reservations', requiredRoles: ['admin', 'manager', 'receptionist', 'accounts'] },
    { name: 'Billing', icon: Receipt, path: '/billing', requiredRoles: ['admin', 'manager', 'receptionist', 'accounts'] },
    { name: 'Analytics', icon: BarChart3, path: '/analytics', requiredRoles: ['admin', 'manager', 'accounts'] },
    { name: 'Settings', icon: Settings, path: '/settings', requiredRoles: ['admin', 'manager'] },
  ];

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item => {
    if (!item.requiredRoles) return true;
    return item.requiredRoles.includes(role || '');
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'manager':
        return 'bg-blue-500';
      case 'receptionist':
        return 'bg-green-500';
      case 'accounts':
        return 'bg-purple-500';
      case 'housekeeping':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const sidebarClasses = cn(
    'flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300',
    {
      // Desktop styles
      'w-64': variant === 'desktop' && !isCollapsed,
      'w-20': variant === 'desktop' && isCollapsed,
      
      // Mobile styles
      'fixed inset-y-0 left-0 z-50 w-80 transform': variant === 'mobile',
      'translate-x-0': variant === 'mobile' && isOpen,
      '-translate-x-full': variant === 'mobile' && !isOpen,
    }
  );

  return (
    <>
      {/* Mobile overlay */}
      {variant === 'mobile' && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-2">
                <Hotel className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">HMS</h1>
                <p className="text-xs text-slate-400">Hotel Management</p>
              </div>
            </div>
          )}
          
          {isCollapsed && variant === 'desktop' && (
            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-2 mx-auto">
              <Hotel className="w-6 h-6" />
            </div>
          )}

          {/* Close button for mobile */}
          {variant === 'mobile' && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Collapse toggle for desktop */}
          {variant === 'desktop' && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* User Info */}
        {profile && !isCollapsed && (
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile.full_name || profile.email}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={cn('w-2 h-2 rounded-full', getRoleBadgeColor(profile.role))} />
                  <span className="text-xs text-slate-400 capitalize">
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed user indicator */}
        {profile && isCollapsed && variant === 'desktop' && (
          <div className="p-4 border-b border-slate-700 flex justify-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className={cn('absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900', getRoleBadgeColor(profile.role))} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      {
                        'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg': isActive,
                        'text-slate-300 hover:bg-slate-700 hover:text-white': !isActive,
                        'justify-center': isCollapsed,
                      }
                    )}
                  >
                    <Icon className={cn('w-5 h-5 flex-shrink-0', { 'mx-auto': isCollapsed })} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">
                          {item.name}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => handleNavigation('/profile')}
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors mb-2',
              { 'justify-center': isCollapsed }
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Profile</span>}
          </button>
          
          <button
            onClick={handleSignOut}
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors',
              { 'justify-center': isCollapsed }
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
