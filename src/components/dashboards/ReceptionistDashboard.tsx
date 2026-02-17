import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const todayStats = [
    { name: 'Check-ins Today', value: '12', icon: '📥', color: 'from-blue-500 to-indigo-600' },
    { name: 'Check-outs Today', value: '8', icon: '📤', color: 'from-purple-500 to-pink-600' },
    { name: 'Available Rooms', value: '15', icon: '🏨', color: 'from-green-500 to-emerald-600' },
    { name: 'Pending Tasks', value: '5', icon: '⏰', color: 'from-orange-500 to-red-600' },
  ];

  const upcomingCheckIns = [
    { guest: 'Sarah Johnson', room: '305', time: '2:00 PM', status: 'confirmed', phone: '+1234567890' },
    { guest: 'Michael Brown', room: '412', time: '3:30 PM', status: 'confirmed', phone: '+1234567891' },
    { guest: 'Emma Wilson', room: '208', time: '4:00 PM', status: 'pending', phone: '+1234567892' },
  ];

  const upcomingCheckOuts = [
    { guest: 'Mike Chen', room: '201', time: '11:00 AM', status: 'ready', balance: '$0' },
    { guest: 'Lisa Anderson', room: '315', time: '12:00 PM', status: 'pending-payment', balance: '$450' },
  ];

  const roomStatus = [
    { type: 'Clean', count: 15, color: 'bg-green-100 text-green-800 border-green-200' },
    { type: 'Occupied', count: 35, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { type: 'Cleaning', count: 8, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { type: 'Maintenance', count: 2, color: 'bg-red-100 text-red-800 border-red-200' },
  ];

  const quickActions = [
    { name: 'Walk-in Check-in', icon: '🚶', action: () => navigate('/front-desk'), color: 'from-blue-500 to-indigo-600' },
    { name: 'Quick Check-out', icon: '✓', action: () => navigate('/front-desk'), color: 'from-green-500 to-emerald-600' },
    { name: 'Room Search', icon: '🔎', action: () => navigate('/rooms'), color: 'from-purple-500 to-pink-600' },
    { name: 'Guest Lookup', icon: '👤', action: () => navigate('/guests'), color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Front Desk Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage check-ins, check-outs, and guest services
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              {profile?.role?.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {todayStats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shadow-lg`}
                  >
                    {stat.icon}
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={action.action}
              className="group flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div
                className={`w-16 h-16 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-3xl mb-3 shadow-lg group-hover:scale-110 transition-transform`}
              >
                {action.icon}
              </div>
              <span className="text-sm font-semibold text-gray-900 text-center">{action.name}</span>
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Check-ins */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📥</span>
                Today's Check-ins
              </h2>
              <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {upcomingCheckIns.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {upcomingCheckIns.map((checkIn, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{checkIn.guest}</p>
                      <p className="text-sm text-gray-600">Room {checkIn.room} · {checkIn.time}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        checkIn.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {checkIn.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm">
                      Check In
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                      Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Check-outs */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📤</span>
                Today's Check-outs
              </h2>
              <span className="text-sm font-medium px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                {upcomingCheckOuts.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {upcomingCheckOuts.map((checkOut, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{checkOut.guest}</p>
                      <p className="text-sm text-gray-600">Room {checkOut.room} · {checkOut.time}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        checkOut.status === 'ready'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {checkOut.balance !== '$0' ? checkOut.balance : 'Paid'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm">
                      Check Out
                    </button>
                    {checkOut.balance !== '$0' && (
                      <button className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-medium text-sm">
                        Billing
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Room Status Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Status Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roomStatus.map((status) => (
              <div
                key={status.type}
                className={`p-6 rounded-xl border ${status.color} text-center hover:shadow-lg transition-all transform hover:-translate-y-1`}
              >
                <p className="text-3xl font-bold mb-2">{status.count}</p>
                <p className="text-sm font-medium">{status.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
