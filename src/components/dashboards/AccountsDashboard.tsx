import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function AccountsDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const financialMetrics = [
    { name: 'Today\'s Revenue', value: '$4,230', change: '+12%', icon: '💰', color: 'from-green-500 to-emerald-600' },
    { name: 'Weekly Revenue', value: '$28,450', change: '+8%', icon: '📈', color: 'from-blue-500 to-indigo-600' },
    { name: 'Monthly Revenue', value: '$125,680', change: '+15%', icon: '💵', color: 'from-purple-500 to-pink-600' },
    { name: 'Outstanding', value: '$12,340', change: '-5%', icon: '⚠️', color: 'from-orange-500 to-red-600' },
  ];

  const recentTransactions = [
    { id: 'TXN-001', guest: 'Sarah Johnson', amount: '$850', type: 'payment', status: 'completed', time: '10:30 AM' },
    { id: 'TXN-002', guest: 'Mike Chen', amount: '$1,200', type: 'payment', status: 'completed', time: '11:45 AM' },
    { id: 'TXN-003', guest: 'Emma Wilson', amount: '$650', type: 'refund', status: 'pending', time: '1:20 PM' },
    { id: 'TXN-004', guest: 'Lisa Anderson', amount: '$450', type: 'payment', status: 'failed', time: '2:15 PM' },
  ];

  const outstandingPayments = [
    { invoice: 'INV-2401', guest: 'Lisa Anderson', amount: '$450', due: 'Today', room: '315', priority: 'high' },
    { invoice: 'INV-2402', guest: 'Robert Taylor', amount: '$890', due: 'Tomorrow', room: '205', priority: 'medium' },
    { invoice: 'INV-2403', guest: 'David Lee', amount: '$320', due: 'In 3 days', room: '412', priority: 'low' },
  ];

  const performanceMetrics = [
    { metric: 'RevPAR', value: '$156', target: '$150', status: 'above' },
    { metric: 'ADR', value: '$180', target: '$175', status: 'above' },
    { metric: 'Occupancy', value: '87%', target: '85%', status: 'above' },
    { metric: 'Collection Rate', value: '94%', target: '95%', status: 'below' },
  ];

  const quickActions = [
    { name: 'Process Payment', icon: '💳', color: 'from-green-500 to-emerald-600', action: () => navigate('/billing') },
    { name: 'Generate Invoice', icon: '📄', color: 'from-blue-500 to-indigo-600', action: () => navigate('/billing') },
    { name: 'View Reports', icon: '📊', color: 'from-purple-500 to-pink-600', action: () => navigate('/analytics') },
    { name: 'Refund Request', icon: '↩️', color: 'from-orange-500 to-red-600', action: () => navigate('/billing') },
  ];

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Accounts Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Financial overview and payment management
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              {profile?.role?.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">
              Fiscal Period: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {financialMetrics.map((metric) => (
            <div
              key={metric.name}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center text-xl shadow-lg`}
                  >
                    {metric.icon}
                  </div>
                  <span className="text-sm font-semibold text-green-600">{metric.change}</span>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.name}</p>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
              <button
                onClick={() => navigate('/billing')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
                        txn.status === 'completed'
                          ? 'bg-green-100'
                          : txn.status === 'pending'
                          ? 'bg-yellow-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {txn.type === 'payment' ? '💳' : '↩️'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{txn.guest}</p>
                      <p className="text-sm text-gray-500">
                        {txn.id} · {txn.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{txn.amount}</p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        txn.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : txn.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance</h2>
            <div className="space-y-4">
              {performanceMetrics.map((perf) => (
                <div key={perf.metric} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{perf.metric}</span>
                    <span
                      className={`text-xs font-medium ${
                        perf.status === 'above' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {perf.status === 'above' ? '↗' : '↘'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{perf.value}</span>
                    <span className="text-sm text-gray-500">/ {perf.target}</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        perf.status === 'above' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          (parseFloat(perf.value) / parseFloat(perf.target)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outstanding Payments */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Outstanding Payments</h2>
            <span className="text-sm font-medium px-3 py-1 bg-red-100 text-red-800 rounded-full">
              {outstandingPayments.length} pending
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {outstandingPayments.map((payment) => (
              <div
                key={payment.invoice}
                className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : payment.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {payment.priority}
                  </span>
                  <span className="text-xs text-gray-500">{payment.due}</span>
                </div>
                <p className="font-semibold text-gray-900 mb-1">{payment.guest}</p>
                <p className="text-sm text-gray-600 mb-2">Room {payment.room}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">{payment.amount}</span>
                  <button className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-xs font-medium">
                    Collect
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
