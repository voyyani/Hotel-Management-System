import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ManagerDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const kpis = [
    {
      name: 'Total Revenue',
      value: '$45,231',
      change: '+20.1%',
      trend: 'up',
      icon: '💰',
      color: 'from-green-500 to-emerald-600',
    },
    {
      name: 'Occupancy Rate',
      value: '87%',
      change: '+12.5%',
      trend: 'up',
      icon: '📈',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      name: 'Available Rooms',
      value: '15',
      change: '-5',
      trend: 'neutral',
      icon: '🏨',
      color: 'from-purple-500 to-pink-600',
    },
    {
      name: 'Active Reservations',
      value: '38',
      change: '+8',
      trend: 'up',
      icon: '📅',
      color: 'from-amber-500 to-orange-600',
    },
    {
      name: 'Staff Online',
      value: '12/15',
      change: '80%',
      trend: 'up',
      icon: '👨‍💼',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      name: 'Guest Satisfaction',
      value: '4.8/5',
      change: '+0.2',
      trend: 'up',
      icon: '⭐',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const quickActions = [
    { name: 'Front Desk', path: '/front-desk', icon: '🔑', color: 'from-blue-500 to-indigo-600' },
    { name: 'Reservations', path: '/reservations', icon: '📅', color: 'from-purple-500 to-pink-600' },
    { name: 'Rooms', path: '/rooms', icon: '🏨', color: 'from-green-500 to-emerald-600' },
    { name: 'Guests', path: '/guests', icon: '👥', color: 'from-amber-500 to-orange-600' },
    { name: 'Billing', path: '/billing', icon: '💳', color: 'from-red-500 to-rose-600' },
    { name: 'Analytics', path: '/analytics', icon: '📊', color: 'from-indigo-500 to-purple-600' },
  ];

  const upcomingEvents = [
    { type: 'check-in', guest: 'Sarah Johnson', room: '305', time: '2:00 PM', priority: 'high' },
    { type: 'maintenance', room: '412', task: 'AC Repair', time: '3:30 PM', priority: 'medium' },
    { type: 'check-out', guest: 'Mike Chen', room: '201', time: '11:00 AM', priority: 'normal' },
    { type: 'meeting', title: 'Staff Meeting', time: '5:00 PM', priority: 'high' },
  ];

  const staffPerformance = [
    { name: 'Emma Watson', role: 'Receptionist', tasks: 24, rating: 4.9 },
    { name: 'John Smith', role: 'Housekeeping', tasks: 18, rating: 4.7 },
    { name: 'Lisa Brown', role: 'Accounts', tasks: 12, rating: 4.8 },
  ];

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Manager Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Complete overview and control of all operations
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              {profile?.role?.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpis.map((kpi) => (
            <div
              key={kpi.name}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-2xl shadow-lg`}
                  >
                    {kpi.icon}
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {kpi.trend === 'up' && '↗'}
                    {kpi.trend === 'down' && '↘'}
                    {kpi.change}
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{kpi.name}</p>
                <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
                      event.type === 'check-in' ? 'bg-blue-100' :
                      event.type === 'check-out' ? 'bg-purple-100' :
                      event.type === 'maintenance' ? 'bg-orange-100' :
                      'bg-green-100'
                    }`}>
                      {event.type === 'check-in' && '📥'}
                      {event.type === 'check-out' && '📤'}
                      {event.type === 'maintenance' && '🔧'}
                      {event.type === 'meeting' && '👥'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {event.type === 'check-in' || event.type === 'check-out' ? event.guest : event.type === 'maintenance' ? event.task : event.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {event.room ? `Room ${event.room} · ` : ''}{event.time}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.priority === 'high' ? 'bg-red-100 text-red-800' :
                    event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Performance */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performers</h2>
            <div className="space-y-4">
              {staffPerformance.map((staff, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{staff.name}</p>
                        <p className="text-xs text-gray-600">{staff.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <span className="text-sm font-bold">{staff.rating}</span>
                      <span>⭐</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tasks completed:</span>
                    <span className="font-semibold text-gray-900">{staff.tasks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => navigate(action.path)}
                className="group flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mb-3 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-gray-900">{action.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
