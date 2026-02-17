import { useAuth } from '@/contexts/AuthContext';

export function HousekeepingDashboard() {
  // const navigate = useNavigate();
  const { profile } = useAuth();

  const taskStats = [
    { name: 'Pending Rooms', value: '8', icon: '⏰', color: 'from-orange-500 to-red-600' },
    { name: 'In Progress', value: '5', icon: '🧹', color: 'from-blue-500 to-indigo-600' },
    { name: 'Completed Today', value: '18', icon: '✅', color: 'from-green-500 to-emerald-600' },
    { name: 'Maintenance', value: '2', icon: '🔧', color: 'from-purple-500 to-pink-600' },
  ];

  const pendingRooms = [
    { room: '201', type: 'Deluxe', status: 'checkout', priority: 'high', time: '30 min ago' },
    { room: '305', type: 'Suite', status: 'checkout', priority: 'high', time: '45 min ago' },
    { room: '412', type: 'Standard', status: 'stayover', priority: 'medium', time: '1 hour ago' },
    { room: '208', type: 'Deluxe', status: 'checkout', priority: 'high', time: '1.5 hours ago' },
    { room: '315', type: 'Suite', status: 'stayover', priority: 'medium', time: '2 hours ago' },
  ];

  const inProgressRooms = [
    { room: '106', type: 'Standard', staff: 'Emma Watson', progress: 75, startedAt: '10:30 AM' },
    { room: '214', type: 'Deluxe', staff: 'John Smith', progress: 50, startedAt: '11:00 AM' },
    { room: '401', type: 'Suite', staff: 'Sarah Lee', progress: 30, startedAt: '11:30 AM' },
  ];

  const maintenanceRequests = [
    { room: '315', issue: 'AC not cooling', priority: 'high', reported: '9:00 AM', status: 'assigned' },
    { room: '412', issue: 'Leaking faucet', priority: 'medium', reported: '10:30 AM', status: 'pending' },
  ];

  const teamMembers = [
    { name: 'Emma Watson', rooms: 6, status: 'active', avatar: 'EW' },
    { name: 'John Smith', rooms: 5, status: 'active', avatar: 'JS' },
    { name: 'Sarah Lee', rooms: 4, status: 'break', avatar: 'SL' },
    { name: 'Mike Johnson', rooms: 3, status: 'active', avatar: 'MJ' },
  ];

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Housekeeping Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Room cleaning and maintenance operations
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
              {profile?.role?.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {taskStats.map((stat) => (
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pending Rooms */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🧹</span>
                Rooms to Clean
              </h2>
              <span className="text-sm font-medium px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
                {pendingRooms.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {pendingRooms.map((room) => (
                <div
                  key={room.room}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {room.room}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{room.type}</p>
                      <p className="text-sm text-gray-600">
                        {room.status === 'checkout' ? '📤 Check-out' : '🔄 Stay-over'} · {room.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        room.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {room.priority}
                    </span>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm">
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Status</h2>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.rooms} rooms cleaned</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* In Progress Rooms */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            Cleaning In Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inProgressRooms.map((room) => (
              <div
                key={room.room}
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {room.room}
                  </div>
                  <span className="text-xs text-gray-500">{room.startedAt}</span>
                </div>
                <p className="font-medium text-gray-900 mb-1">{room.type}</p>
                <p className="text-sm text-gray-600 mb-3">Assigned to {room.staff}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-blue-600">{room.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all"
                      style={{ width: `${room.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              Maintenance Requests
            </h2>
            <span className="text-sm font-medium px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
              {maintenanceRequests.length} pending
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenanceRequests.map((request, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {request.room}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{request.issue}</p>
                      <p className="text-xs text-gray-600">Reported at {request.reported}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {request.priority}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm">
                    {request.status === 'assigned' ? 'View Details' : 'Assign'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
