import { useRooms } from '@/hooks/useRooms';
import { RoomCard } from './RoomCard';
import { RoomStatus } from '@/types/database';
import { useState } from 'react';
import { RoomDetailsModal } from './RoomDetailsModal';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RoomGrid() {
  const { data: rooms, isLoading, error } = useRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedRoom = rooms?.find((room) => room.id === selectedRoomId);

  // Get unique floors
  const floors = Array.from(new Set(rooms?.map((room) => room.floor) || [])).sort(
    (a, b) => a - b
  );

  // Filter rooms
  const filteredRooms = rooms?.filter((room) => {
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesFloor = floorFilter === 'all' || room.floor.toString() === floorFilter;
    const matchesSearch =
      searchQuery === '' ||
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.room_types.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesFloor && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: rooms?.length || 0,
    available: rooms?.filter((r) => r.status === 'available').length || 0,
    occupied: rooms?.filter((r) => r.status === 'occupied').length || 0,
    cleaning: rooms?.filter((r) => r.status === 'cleaning').length || 0,
    maintenance: rooms?.filter((r) => r.status === 'maintenance').length || 0,
  };

  const occupancyRate = stats.total > 0 
    ? Math.round((stats.occupied / stats.total) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">
          Error loading rooms: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cleaning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.cleaning}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search
              </label>
              <Input
                type="text"
                placeholder="Room number or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as RoomStatus | 'all')}
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </Select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Floor
              </label>
              <Select
                value={floorFilter}
                onValueChange={(value) => setFloorFilter(value)}
              >
                <option value="all">All Floors</option>
                {floors.map((floor) => (
                  <option key={floor} value={floor.toString()}>
                    Floor {floor}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          
          {filteredRooms && filteredRooms.length !== rooms?.length && (
            <div className="mt-4 flex items-center justify-between rounded-md bg-blue-50 px-4 py-2">
              <span className="text-sm text-blue-800">
                Showing {filteredRooms.length} of {rooms?.length} rooms
              </span>
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setFloorFilter('all');
                  setSearchQuery('');
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room Grid */}
      {filteredRooms && filteredRooms.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              roomNumber={room.room_number}
              roomType={room.room_types.name}
              status={room.status}
              floor={room.floor}
              onClick={() => setSelectedRoomId(room.id)}
              isSelected={selectedRoomId === room.id}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No rooms found matching your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Room Details Modal */}
      {selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          open={!!selectedRoomId}
          onClose={() => setSelectedRoomId(null)}
        />
      )}
    </div>
  );
}
