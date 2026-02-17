import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  // const [viewAsRole] = useState<string | null>(null);

  // Determine which role's dashboard to show
  // const effectiveRole = viewAsRole || profile?.role;

  // Managers can switch between different dashboard views
  // const canSwitchView = profile?.role === 'manager' || profile?.role === 'admin';

  const stats = [
    { name: 'Total Rooms', value: '50', icon: '🏨', color: 'from-blue-500 to-indigo-600' },
    { name: 'Occupied', value: '35', icon: '✅', color: 'from-green-500 to-emerald-600' },
    { name: 'Available', value: '15', icon: '🆓', color: 'from-purple-500 to-pink-600' },
    { name: 'Revenue Today', value: '$4,230', icon: '💰', color: 'from-amber-500 to-orange-600' },
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
              Today's Check-ins
            </h2>
            <div className="space-y-3">
              {[
                { name: 'John Doe', room: '201', time: '2:00 PM', status: 'completed' },
                { name: 'Jane Smith', room: '305', time: '3:30 PM', status: 'pending' },
                { name: 'Bob Johnson', room: '412', time: '4:15 PM', status: 'pending' },
              ].map((checkin, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {checkin.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{checkin.name}</p>
                      <p className="text-sm text-gray-500">Room {checkin.room} · {checkin.time}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      checkin.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {checkin.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Check-outs */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Check-outs
            </h2>
            <div className="space-y-3">
              {[
                { name: 'Alice Cooper', room: '102', time: '11:00 AM', status: 'completed' },
                { name: 'Charlie Brown', room: '204', time: '12:00 PM', status: 'in-progress' },
              ].map((checkout, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                      {checkout.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{checkout.name}</p>
                      <p className="text-sm text-gray-500">Room {checkout.room} · {checkout.time}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      checkout.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {checkout.status}
                  </span>
                </div>
              ))}
            </div>
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
