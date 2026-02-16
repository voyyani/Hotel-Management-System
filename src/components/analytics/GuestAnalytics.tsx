import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGuestDemographics, useGuestStats } from '@/hooks/useAnalytics';
import { Users, Calendar, TrendingUp, Award } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function GuestAnalytics() {
  const { data: demographics, isLoading: demoLoading } = useGuestDemographics();
  const { data: guestStats, isLoading: statsLoading } = useGuestStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900">Guest Analytics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Guests</p>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          {statsLoading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{guestStats?.totalGuests.toLocaleString()}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">In database</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Avg Stay Duration</p>
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          {statsLoading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{guestStats?.avgStayDuration.toFixed(1)} days</p>
          )}
          <p className="text-sm text-gray-500 mt-1">Average per booking</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Repeat Guest Rate</p>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          {statsLoading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{guestStats?.repeatGuestRate.toFixed(1)}%</p>
          )}
          <p className="text-sm text-gray-500 mt-1">Return customers</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">VIP Guests</p>
            <Award className="h-5 w-5 text-yellow-600" />
          </div>
          {statsLoading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{guestStats?.topGuests.length || 0}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">Top bookers</p>
        </div>
      </div>

      {/* Guest Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Nationalities (Top 10)</h3>
          {demoLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : demographics && demographics.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={demographics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.nationality}: ${entry.percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {demographics.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No nationality data available</p>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Count by Nationality</h3>
          {demoLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : demographics && demographics.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={demographics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nationality" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Guest Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No nationality data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Guests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Guests by Booking Count</h3>
        {statsLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guestStats?.topGuests.map((guest, index) => (
                  <tr key={guest.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {guest.first_name} {guest.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {guest.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {guest.bookingCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (guest.bookingCount || 0) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                        (guest.bookingCount || 0) >= 5 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(guest.bookingCount || 0) >= 10 ? 'VIP' : (guest.bookingCount || 0) >= 5 ? 'Loyal' : 'Regular'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Demographics Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nationality Distribution</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nationality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visual</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {demographics?.map((demo, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {demo.nationality}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {demo.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {demo.percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${demo.percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
