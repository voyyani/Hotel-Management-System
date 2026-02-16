import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAvailableRooms, useRoomTypesWithAvailability } from '@/hooks/useAvailability';
import type { AvailabilitySearchFilters } from '@/types/database';
import { Calendar, Users, Bed, ChevronRight } from 'lucide-react';

interface AvailabilitySearchProps {
  onRoomSelect?: (roomId: string, filters: AvailabilitySearchFilters) => void;
}

export function AvailabilitySearch({ onRoomSelect }: AvailabilitySearchProps) {
  const [filters, setFilters] = useState<AvailabilitySearchFilters>({
    check_in_date: '',
    check_out_date: '',
    num_adults: 1,
    num_children: 0,
  });

  const { data: availableRooms, isLoading: roomsLoading } = useAvailableRooms(
    filters.check_in_date && filters.check_out_date ? filters : undefined
  );

  const { data: roomTypes } = useRoomTypesWithAvailability(
    filters.check_in_date,
    filters.check_out_date
  );

  const handleSearch = () => {
    // Trigger refetch by updating filters
    setFilters({ ...filters });
  };

  const handleRoomTypeFilter = (roomTypeId: string) => {
    setFilters({ ...filters, room_type_id: roomTypeId === 'all' ? undefined : roomTypeId });
  };

  // Calculate min dates
  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = filters.check_in_date || today;

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Search Available Rooms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="check-in">Check-in Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="check-in"
                type="date"
                min={today}
                value={filters.check_in_date}
                onChange={(e) => setFilters({ ...filters, check_in_date: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="check-out">Check-out Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="check-out"
                type="date"
                min={minCheckOut}
                value={filters.check_out_date}
                onChange={(e) => setFilters({ ...filters, check_out_date: e.target.value })}
                className="pl-10"
                disabled={!filters.check_in_date}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adults">Adults</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Select
                value={filters.num_adults.toString()}
                onValueChange={(value) => setFilters({ ...filters, num_adults: parseInt(value) })}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Adult{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="children">Children</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Select
                value={filters.num_children.toString()}
                onValueChange={(value) => setFilters({ ...filters, num_children: parseInt(value) })}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Child' : 'Children'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              className="w-full"
              disabled={!filters.check_in_date || !filters.check_out_date}
            >
              Search Rooms
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Room Type Filters */}
      {roomTypes && roomTypes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={!filters.room_type_id ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRoomTypeFilter('all')}
          >
            All Types
          </Button>
          {roomTypes.map((type) => (
            <Button
              key={type.id}
              variant={filters.room_type_id === type.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleRoomTypeFilter(type.id)}
            >
              {type.name}
              {type.available_count !== null && (
                <span className="ml-2 text-xs opacity-75">
                  ({type.available_count})
                </span>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Results */}
      {roomsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for available rooms...</p>
        </div>
      ) : availableRooms && availableRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableRooms.map((room) => (
            <Card key={room.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-lg">Room {room.room_number}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{room.room_type_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    KES {room.base_price.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">per night</p>
                </div>
              </div>

              <div className="border-t pt-3 mb-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Floor {room.floor}</span>
                  <span>Max: {room.max_adults}A + {room.max_children}C</span>
                </div>
              </div>

              <Button
                onClick={() => onRoomSelect?.(room.id, filters)}
                className="w-full"
              >
                Select Room
              </Button>
            </Card>
          ))}
        </div>
      ) : filters.check_in_date && filters.check_out_date ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Bed className="h-16 w-16 mx-auto opacity-30" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No rooms available
          </h3>
          <p className="text-gray-600">
            No rooms match your search criteria. Try different dates or guest count.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
