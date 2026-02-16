import { RoomWithType } from '@/hooks/useRooms';
import { useUpdateRoomStatus } from '@/hooks/useRooms';
import { RoomStatus } from '@/types/database';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface RoomDetailsModalProps {
  room: RoomWithType;
  open: boolean;
  onClose: () => void;
}

const statusOptions: { value: RoomStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'text-green-600' },
  { value: 'occupied', label: 'Occupied', color: 'text-red-600' },
  { value: 'cleaning', label: 'Cleaning', color: 'text-yellow-600' },
  { value: 'maintenance', label: 'Maintenance', color: 'text-gray-600' },
];

export function RoomDetailsModal({ room, open, onClose }: RoomDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus>(room.status);
  const [notes, setNotes] = useState(room.notes || '');
  const updateStatus = useUpdateRoomStatus();

  const handleUpdateStatus = async () => {
    try {
      await updateStatus.mutateAsync({
        roomId: room.id,
        status: selectedStatus,
        notes: notes || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update room status:', error);
    }
  };

  const currentStatusConfig = statusOptions.find((s) => s.value === room.status);
  const isStatusChanged = selectedStatus !== room.status;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Room {room.room_number}</span>
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
              {currentStatusConfig?.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room Information */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Room Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-600">Room Number</label>
                <p className="mt-1 text-base font-semibold">{room.room_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Floor</label>
                <p className="mt-1 text-base">Floor {room.floor}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Room Type</label>
                <p className="mt-1 text-base">{room.room_types.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Base Price</label>
                <p className="mt-1 text-base font-semibold">
                  ${room.room_types.base_price.toFixed(2)} / night
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Max Capacity</label>
                <p className="mt-1 text-base">
                  {room.room_types.max_adults} Adults, {room.room_types.max_children} Children
                </p>
              </div>
              {room.last_cleaned_at && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Cleaned</label>
                  <p className="mt-1 text-base">
                    {format(new Date(room.last_cleaned_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Room Type Description */}
          {room.room_types.description && (
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="mt-1 text-base text-gray-700">{room.room_types.description}</p>
            </div>
          )}

          {/* Amenities */}
          {room.room_types.amenities && Array.isArray(room.room_types.amenities) && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {(room.room_types.amenities as string[]).map((amenity, index) => (
                  <Badge key={index} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Status Management */}
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-lg font-semibold">Update Room Status</h3>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                New Status
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as RoomStatus)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this room..."
              />
            </div>

            {isStatusChanged && (
              <div className="rounded-md bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  Status will change from{' '}
                  <span className="font-semibold">{currentStatusConfig?.label}</span> to{' '}
                  <span className="font-semibold">
                    {statusOptions.find((s) => s.value === selectedStatus)?.label}
                  </span>
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose} disabled={updateStatus.isPending}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={updateStatus.isPending || !isStatusChanged}
              >
                {updateStatus.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>

          {/* Current Notes */}
          {room.notes && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Current Notes
              </label>
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-sm text-gray-700">{room.notes}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
            <div className="grid grid-cols-2 gap-2">
              <div>
                Created: {format(new Date(room.created_at), 'MMM dd, yyyy HH:mm')}
              </div>
              <div>
                Updated: {format(new Date(room.updated_at), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
