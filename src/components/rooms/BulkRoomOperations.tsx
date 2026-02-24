import { useState } from 'react';
import { useRooms, useUpdateRoomStatus } from '@/hooks/useRooms';
import { RoomStatus } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, RefreshCw, AlertTriangle } from 'lucide-react';

export function BulkRoomOperations() {
  const { data: rooms } = useRooms();
  const updateStatus = useUpdateRoomStatus();
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<RoomStatus>('available');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleRoom = (roomId: string) => {
    const newSelection = new Set(selectedRoomIds);
    if (newSelection.has(roomId)) {
      newSelection.delete(roomId);
    } else {
      newSelection.add(roomId);
    }
    setSelectedRoomIds(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedRoomIds.size === rooms?.length) {
      setSelectedRoomIds(new Set());
    } else {
      setSelectedRoomIds(new Set(rooms?.map((r) => r.id) || []));
    }
  };

  const handleSelectByStatus = (status: RoomStatus) => {
    const roomsWithStatus = rooms?.filter((r) => r.status === status) || [];
    setSelectedRoomIds(new Set(roomsWithStatus.map((r) => r.id)));
  };

  const handleBulkUpdate = async () => {
    if (selectedRoomIds.size === 0) {
      alert('Please select at least one room');
      return;
    }

    if (!confirm(`Update ${selectedRoomIds.size} room(s) to ${bulkStatus}?`)) {
      return;
    }

    setIsProcessing(true);
    const errors: string[] = [];

    for (const roomId of selectedRoomIds) {
      try {
        await updateStatus.mutateAsync({
          roomId,
          status: bulkStatus,
        });
      } catch (error) {
        const room = rooms?.find((r) => r.id === roomId);
        errors.push(room?.room_number || roomId);
      }
    }

    setIsProcessing(false);
    setSelectedRoomIds(new Set());

    if (errors.length > 0) {
      alert(`Failed to update rooms: ${errors.join(', ')}`);
    } else {
      alert(`Successfully updated ${selectedRoomIds.size} room(s)`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-gray-600" />
            <CardTitle>Bulk Operations</CardTitle>
          </div>
          <Badge variant="secondary">{selectedRoomIds.size} selected</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Quick Select
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedRoomIds.size === rooms?.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectByStatus('available')}
            >
              Available Rooms
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectByStatus('cleaning')}
            >
              Cleaning Rooms
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectByStatus('maintenance')}
            >
              Maintenance Rooms
            </Button>
          </div>
        </div>

        {/* Room Selection List */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select Rooms ({selectedRoomIds.size}/{rooms?.length || 0})
          </label>
          <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200">
            <div className="divide-y divide-gray-100">
              {rooms?.map((room) => (
                <label
                  key={room.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedRoomIds.has(room.id)}
                    onCheckedChange={() => handleToggleRoom(room.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{room.room_number}</span>
                      <Badge
                        variant={
                          room.status === 'available'
                            ? 'success'
                            : room.status === 'occupied'
                            ? 'destructive'
                            : room.status === 'cleaning'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {room.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">{room.room_types.name}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Bulk Action */}
        {selectedRoomIds.size > 0 && (
          <div className="space-y-3 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Bulk Status Update
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {selectedRoomIds.size} room(s) will be updated
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                New Status
              </label>
              <Select
                value={bulkStatus}
                onValueChange={(value) => setBulkStatus(value as RoomStatus)}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </Select>
            </div>

            <Button
              onClick={handleBulkUpdate}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Update {selectedRoomIds.size} Room(s)</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Badge({ children, variant }: { children: React.ReactNode; variant?: string }) {
  const variantClasses = {
    success: 'bg-green-100 text-green-800',
    destructive: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    secondary: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        variantClasses[variant as keyof typeof variantClasses] || variantClasses.secondary
      }`}
    >
      {children}
    </span>
  );
}
