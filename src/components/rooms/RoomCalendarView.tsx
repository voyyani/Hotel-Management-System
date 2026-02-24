import { useState } from 'react';
import { useRooms } from '@/hooks/useRooms';
import { RoomStatus } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

export function RoomCalendarView() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { data: rooms, isLoading } = useRooms();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const handlePrevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-red-500';
      case 'cleaning':
        return 'bg-yellow-500';
      case 'maintenance':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <CardTitle>Weekly Room Calendar</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevWeek}
              className="rounded-md border border-gray-300 p-2 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleToday}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={handleNextWeek}
              className="rounded-md border border-gray-300 p-2 hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="sticky left-0 z-10 bg-gray-50 border-r border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Room
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.toISOString()}
                      className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[120px]"
                    >
                      <div>{format(day, 'EEE')}</div>
                      <div className="text-xs font-normal text-gray-600">
                        {format(day, 'MMM dd')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms?.map((room) => (
                  <tr key={room.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="sticky left-0 z-10 bg-white border-r border-gray-200 px-4 py-3 hover:bg-gray-50">
                      <div className="font-medium text-gray-900">{room.room_number}</div>
                      <div className="text-xs text-gray-500">{room.room_types.name}</div>
                    </td>
                    {weekDays.map((day) => (
                      <td key={day.toISOString()} className="px-2 py-2 text-center">
                        <div
                          className={`mx-auto h-12 w-12 rounded-lg ${getStatusColor(
                            room.status
                          )} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                          title={`${room.status} - ${format(day, 'MMM dd, yyyy')}`}
                        >
                          <span className="text-xs font-medium text-white">
                            {room.status === 'occupied' ? '●' : '○'}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium text-gray-700">Status:</span>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-500"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-red-500"></div>
                <span className="text-gray-600">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-yellow-500"></div>
                <span className="text-gray-600">Cleaning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-500"></div>
                <span className="text-gray-600">Maintenance</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
