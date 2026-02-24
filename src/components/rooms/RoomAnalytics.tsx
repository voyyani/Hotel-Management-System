import { useRooms } from '@/hooks/useRooms';
import { useRoomTypes } from '@/hooks/useRoomTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Home,
  Users,
  Clock
} from 'lucide-react';
import { useMemo } from 'react';

export function RoomAnalytics() {
  const { data: rooms } = useRooms();
  const { data: roomTypes } = useRoomTypes();

  const analytics = useMemo(() => {
    if (!rooms || !roomTypes) return null;

    const statusBreakdown = {
      available: rooms.filter((r) => r.status === 'available').length,
      occupied: rooms.filter((r) => r.status === 'occupied').length,
      cleaning: rooms.filter((r) => r.status === 'cleaning').length,
      maintenance: rooms.filter((r) => r.status === 'maintenance').length,
    };

    const occupancyRate = rooms.length > 0
      ? ((statusBreakdown.occupied / rooms.length) * 100).toFixed(1)
      : '0.0';

    const revenueRate = rooms.length > 0
      ? (((statusBreakdown.occupied + statusBreakdown.cleaning) / rooms.length) * 100).toFixed(1)
      : '0.0';

    // Calculate by room type
    const typeBreakdown = roomTypes.map((type) => {
      const typeRooms = rooms.filter((r) => r.room_type_id === type.id);
      const occupied = typeRooms.filter((r) => r.status === 'occupied').length;
      return {
        name: type.name,
        total: typeRooms.length,
        occupied,
        available: typeRooms.filter((r) => r.status === 'available').length,
        occupancyRate: typeRooms.length > 0 ? ((occupied / typeRooms.length) * 100).toFixed(1) : '0.0',
        potentialRevenue: typeRooms.length * type.base_price,
        actualRevenue: occupied * type.base_price,
      };
    });

    // Calculate by floor
    const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);
    const floorBreakdown = floors.map((floor) => {
      const floorRooms = rooms.filter((r) => r.floor === floor);
      const occupied = floorRooms.filter((r) => r.status === 'occupied').length;
      return {
        floor,
        total: floorRooms.length,
        occupied,
        available: floorRooms.filter((r) => r.status === 'available').length,
        cleaning: floorRooms.filter((r) => r.status === 'cleaning').length,
        maintenance: floorRooms.filter((r) => r.status === 'maintenance').length,
        occupancyRate: floorRooms.length > 0 ? ((occupied / floorRooms.length) * 100).toFixed(1) : '0.0',
      };
    });

    const totalPotentialRevenue = typeBreakdown.reduce((sum, t) => sum + t.potentialRevenue, 0);
    const totalActualRevenue = typeBreakdown.reduce((sum, t) => sum + t.actualRevenue, 0);

    return {
      statusBreakdown,
      occupancyRate,
      revenueRate,
      typeBreakdown,
      floorBreakdown,
      totalPotentialRevenue,
      totalActualRevenue,
      totalRooms: rooms.length,
    };
  }, [rooms, roomTypes]);

  if (!analytics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.statusBreakdown.available} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.statusBreakdown.occupied} occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.revenueRate}%</div>
            <p className="text-xs text-muted-foreground">
              ${analytics.totalActualRevenue.toFixed(0)}/night
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Housekeeping</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.statusBreakdown.cleaning}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.statusBreakdown.maintenance} in maintenance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Room Type Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <CardTitle>Performance by Room Type</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.typeBreakdown.map((type) => (
              <div key={type.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{type.name}</span>
                      <span className="text-sm text-gray-600">
                        {type.occupied}/{type.total} ({type.occupancyRate}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${type.occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 pl-1">
                  <span>Revenue: ${type.actualRevenue.toFixed(0)}</span>
                  <span>Potential: ${type.potentialRevenue.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Floor Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <CardTitle>Performance by Floor</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Floor</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900">Occupied</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900">Available</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900">Cleaning</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900">Maintenance</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900">Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {analytics.floorBreakdown.map((floor) => (
                  <tr key={floor.floor} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Floor {floor.floor}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{floor.total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        {floor.occupied}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        {floor.available}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                        {floor.cleaning}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                        {floor.maintenance}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      {floor.occupancyRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
