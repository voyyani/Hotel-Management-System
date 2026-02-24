import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { OnboardingModal } from '@/components/OnboardingModal';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { profile } = useAuth();
  const { isConfigured, isLoading: settingsLoading, hotelName } = useSystemSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding modal for admins if system is not configured
  const shouldShowOnboarding = 
    !settingsLoading && 
    !isConfigured && 
    profile?.role === 'admin' &&
    showOnboarding === false;

  if (shouldShowOnboarding && !showOnboarding) {
    setShowOnboarding(true);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Onboarding Modal */}
      {showOnboarding && !isConfigured && profile?.role === 'admin' && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar
          isOpen={true}
          onClose={() => {}}
          variant="desktop"
          isCollapsed={desktopSidebarCollapsed}
          onToggleCollapse={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          variant="mobile"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - Only visible on mobile */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">{hotelName || 'HMS'}</h1>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
