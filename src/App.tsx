import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { PERMISSIONS } from './types/database';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import RoomsPage from './pages/RoomsPage';
import GuestsPage from './pages/GuestsPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { BillingPage } from './pages/BillingPage';
import FrontDeskPage from './pages/FrontDeskPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes - All wrapped with AppLayout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute 
                  requiredRoles={['admin', 'manager', 'receptionist', 'housekeeping']}
                  requiredPermissions={[PERMISSIONS.ROOMS_VIEW]}
                >
                  <AppLayout>
                    <RoomsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/guests"
              element={
                <ProtectedRoute 
                  requiredRoles={['admin', 'manager', 'receptionist']}
                  requiredPermissions={[PERMISSIONS.GUESTS_VIEW]}
                >
                  <AppLayout>
                    <GuestsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservations"
              element={
                <ProtectedRoute 
                  requiredRoles={['admin', 'manager', 'receptionist', 'accounts']}
                  requiredPermissions={[PERMISSIONS.RESERVATIONS_VIEW]}
                >
                  <AppLayout>
                    <ReservationsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/front-desk"
              element={
                <ProtectedRoute 
                  requiredRoles={['admin', 'manager', 'receptionist']}
                  requiredPermissions={[PERMISSIONS.FRONTDESK_ACCESS]}
                >
                  <AppLayout>
                    <FrontDeskPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute 
                  requiredRoles={['admin', 'manager', 'receptionist', 'accounts']}
                  requiredPermissions={[PERMISSIONS.BILLING_VIEW]}
                >
                  <AppLayout>
                    <BillingPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute 
                  requiredRoles={['admin', 'manager', 'accounts']}
                  requiredPermissions={[PERMISSIONS.ANALYTICS_VIEW]}
                >
                  <AppLayout>
                    <AnalyticsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
