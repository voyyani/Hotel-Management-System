import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'receptionist':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'housekeeping':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = [
    { name: 'Total Rooms', value: '50', icon: '🏨', color: 'from-blue-500 to-indigo-600' },
    { name: 'Occupied', value: '35', icon: '✅', color: 'from-green-500 to-emerald-600' },
    { name: 'Available', value: '15', icon: '🆓', color: 'from-purple-500 to-pink-600' },
    { name: 'Revenue Today', value: '$4,230', icon: '💰', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-2">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">HMS</span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="border-b-2 border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/rooms')}
                  className="border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Rooms
                </button>
                <button
                  onClick={() => navigate('/guests')}
                  className="border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Guests
                </button>
                <button
                  onClick={() => navigate('/reservations')}
                  className="border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Reservations
                </button>
                <button
                  onClick={() => navigate('/front-desk')}
                  className="border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Front Desk
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Analytics
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{profile?.full_name || user?.email}</span>
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

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
