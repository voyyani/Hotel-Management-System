import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useKPIData } from '@/hooks/useAnalytics';
import { useTodayCheckIns, useTodayCheckOuts } from '@/hooks/useReservations';
import { format } from 'date-fns';
// import { ManagerDashboard } from '@/components/dashboards/ManagerDashboard';
// import { ReceptionistDashboard } from '@/components/dashboards/ReceptionistDashboard';
// import { AccountsDashboard } from '@/components/dashboards/AccountsDashboard';
// import { HousekeepingDashboard } from '@/components/dashboards/HousekeepingDashboard';

// Helper function for role badge colors
const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin':
    case 'manager':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'receptionist':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'accounts':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'housekeeping':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // Fetch real data from database
  const { data: kpiData, isLoading: isLoadingKPI } = useKPIData();
  const { data: todayCheckIns = [], isLoading: isLoadingCheckIns } = useTodayCheckIns();
  const { data: todayCheckOuts = [], isLoading: isLoadingCheckOuts } = useTodayCheckOuts();

  const stats = [
    { 
      name: 'Total Rooms', 
      value: isLoadingKPI ? '...' : kpiData?.totalRooms?.toString() || '0', 
      icon: '🏨', 
      color: 'from-blue-500 to-indigo-600' 
    },
    { 
      name: 'Occupied', 
      value: isLoadingKPI ? '...' : kpiData?.occupiedRooms?.toString() || '0', 
      icon: '✅', 
      color: 'from-green-500 to-emerald-600' 
    },
    { 
      name: 'Available', 
      value: isLoadingKPI ? '...' : kpiData?.availableRooms?.toString() || '0', 
      icon: '🆓', 
      color: 'from-purple-500 to-pink-600' 
    },
    { 
      name: 'Revenue Today', 
      value: isLoadingKPI 
        ? '...' 
        : `KES ${(kpiData?.todayRevenue || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: '💰', 
      color: 'from-amber-500 to-orange-600' 
    },
  ];

  return (
    <div className="h-full overflow-auto bg-slate-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Here's what's happening with your hotel today.
          </p>
          <div className="mt-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                profile?.role || ''
              )}`}
            >
              {profile?.role?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-3xl shadow-lg`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Check-ins */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Check-ins ({todayCheckIns.length})
            </h2>
            <div className="space-y-3">
              {isLoadingCheckIns ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Loading check-ins...</p>
                </div>
              ) : todayCheckIns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No guests checked in today</p>
                </div>
              ) : (
                todayCheckIns.slice(0, 5).map((reservation) => {
                  const guestName = reservation.guest 
                    ? `${reservation.guest.first_name} ${reservation.guest.last_name}`
                    : 'Unknown Guest';
                  const checkInTime = reservation.actual_check_in 
                    ? format(new Date(reservation.actual_check_in), 'h:mm a')
                    : 'Pending';
                  const isCheckedIn = reservation.status === 'checked_in';
                  
                  return (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {guestName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{guestName}</p>
                          <p className="text-sm text-gray-500">
                            Room {reservation.room?.room_number || 'N/A'} · {checkInTime}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isCheckedIn
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {isCheckedIn ? 'Checked In' : 'Pending'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            {todayCheckIns.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/front-desk')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all {todayCheckIns.length} check-ins →
                </button>
              </div>
            )}
          </div>

          {/* Today's Check-outs */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Check-outs ({todayCheckOuts.length})
            </h2>
            <div className="space-y-3">
              {isLoadingCheckOuts ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Loading check-outs...</p>
                </div>
              ) : todayCheckOuts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No guests checked out today</p>
                </div>
              ) : (
                todayCheckOuts.slice(0, 5).map((reservation) => {
                  const guestName = reservation.guest 
                    ? `${reservation.guest.first_name} ${reservation.guest.last_name}`
                    : 'Unknown Guest';
                  const checkOutTime = reservation.actual_check_out 
                    ? format(new Date(reservation.actual_check_out), 'h:mm a')
                    : 'Pending';
                  const isCheckedOut = reservation.status === 'checked_out';
                  
                  return (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                          {guestName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{guestName}</p>
                          <p className="text-sm text-gray-500">
                            Room {reservation.room?.room_number || 'N/A'} · {checkOutTime}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isCheckedOut
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isCheckedOut ? 'Checked Out' : 'In Progress'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            {todayCheckOuts.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/front-desk')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all {todayCheckOuts.length} check-outs →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/reservations')}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all transform hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl mb-2 shadow-lg"
              >
                📅
              </div>
              <span className="text-sm font-medium text-gray-900">Reservations</span>
            </button>
            <button
              onClick={() => navigate('/front-desk')}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all transform hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl mb-2 shadow-lg"
              >
                🔑
              </div>
              <span className="text-sm font-medium text-gray-900">Front Desk</span>
            </button>
            <button
              onClick={() => navigate('/rooms')}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all transform hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl mb-2 shadow-lg"
              >
                🏨
              </div>
              <span className="text-sm font-medium text-gray-900">Rooms</span>
            </button>
            <button
              onClick={() => navigate('/guests')}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all transform hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl mb-2 shadow-lg"
              >
                👥
              </div>
              <span className="text-sm font-medium text-gray-900">Guests</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
