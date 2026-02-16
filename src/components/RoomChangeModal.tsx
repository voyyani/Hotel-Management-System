import { useState } from 'react';
import { X, MapPin, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ReservationWithDetails } from '@/types/database';

interface RoomChangeModalProps {
  reservation: ReservationWithDetails;
  onComplete: () => void;
  onCancel: () => void;
}

interface AvailableRoomForChange {
  id: string;
  room_number: string;
  floor: number;
  room_type: {
    id: string;
    name: string;
    base_price: number;
    max_adults: number;
    max_children: number;
  };
  status: string;
}

export function RoomChangeModal({ reservation, onComplete, onCancel }: RoomChangeModalProps) {
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  // Fetch available rooms that meet the reservation requirements
  const { data: availableRooms, isLoading } = useQuery({
    queryKey: ['available-rooms-for-change', reservation.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          id,
          room_number,
          floor,
          status,
          room_type:room_types!room_type_id (
            id,
            name,
            base_price,
            max_adults,
            max_children
          )
        `)
        .eq('status', 'available')
        .neq('id', reservation.room_id);

      if (error) throw error;

      // Filter rooms that can accommodate the guests
      const rooms = data as any[];
      return rooms.filter(
        (room: any) =>
          room.room_type[0]?.max_adults >= reservation.num_adults &&
          room.room_type[0]?.max_children >= reservation.num_children
      ).map((room: any) => ({
        ...room,
        room_type: room.room_type[0]
      })) as AvailableRoomForChange[];
    },
  });

  const changeRoomMutation = useMutation({
    mutationFn: async (newRoomId: string) => {
      // Start a transaction-like sequence
      // 1. Update the reservation with new room
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({
          room_id: newRoomId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservation.id);

      if (reservationError) throw reservationError;

      // 2. Update old room status to available (if checked in)
      if (reservation.status === 'checked_in') {
        const { error: oldRoomError } = await supabase
          .from('rooms')
          .update({
            status: 'available',
            updated_at: new Date().toISOString(),
          })
          .eq('id', reservation.room_id);

        if (oldRoomError) throw oldRoomError;

        // 3. Update new room status to occupied
        const { error: newRoomError } = await supabase
          .from('rooms')
          .update({
            status: 'occupied',
            updated_at: new Date().toISOString(),
          })
          .eq('id', newRoomId);

        if (newRoomError) throw newRoomError;
      }

      return { oldRoomId: reservation.room_id, newRoomId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', reservation.id] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room-status'] });
      onComplete();
    },
  });

  const handleChangeRoom = async () => {
    if (!selectedRoomId) return;
    await changeRoomMutation.mutateAsync(selectedRoomId);
  };

  const selectedRoom = availableRooms?.find((r) => r.id === selectedRoomId);
  const currentRoom = reservation.room;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Change Room</h2>
            <p className="text-sm text-gray-600 mt-1">
              Transfer guest to a different room
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Current Reservation Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Current Reservation</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Guest</p>
                <p className="font-medium text-gray-900">
                  {reservation.guest?.first_name} {reservation.guest?.last_name}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Current Room</p>
                <p className="font-medium text-gray-900">
                  Room {currentRoom?.room_number} - {currentRoom?.room_type?.name}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Guests</p>
                <p className="font-medium text-gray-900">
                  {reservation.num_adults} Adult{reservation.num_adults !== 1 ? 's' : ''}
                  {reservation.num_children > 0 &&
                    `, ${reservation.num_children} Child${reservation.num_children !== 1 ? 'ren' : ''}`}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium text-gray-900 capitalize">{reservation.status}</p>
              </div>
            </div>
          </div>

          {/* Reason for Change */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Room Change *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g., Maintenance issue, guest request, noise complaint..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Available Rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select New Room
            </label>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : availableRooms && availableRooms.length > 0 ? (
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {availableRooms.map((room) => {
                  const isSelected = selectedRoomId === room.id;
                  const priceDiff = room.room_type.base_price - (currentRoom?.room_type?.base_price || 0);
                  const isUpgrade = priceDiff > 0;

                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                              <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">
                                Room {room.room_number}
                              </p>
                              <p className="text-sm text-gray-600">
                                {room.room_type.name} • Floor {room.floor}
                              </p>
                            </div>
                          </div>

                          <div className="ml-13 space-y-1 text-sm text-gray-600">
                            <p>
                              Max: {room.room_type.max_adults} adults, {room.room_type.max_children} children
                            </p>
                            <p className="font-medium text-gray-900">
                              ${room.room_type.base_price} per night
                            </p>
                          </div>

                          {priceDiff !== 0 && (
                            <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              isUpgrade 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {isUpgrade ? (
                                <>
                                  <ArrowRight className="h-3 w-3" />
                                  Upgrade (+${Math.abs(priceDiff)}/night)
                                </>
                              ) : (
                                <>
                                  <ArrowRight className="h-3 w-3 rotate-180" />
                                  Downgrade (-${Math.abs(priceDiff)}/night)
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 ml-4" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600">
                  No suitable rooms available at this time
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  All rooms are either occupied or cannot accommodate {reservation.num_adults} adult
                  {reservation.num_adults !== 1 ? 's' : ''}
                  {reservation.num_children > 0 && ` and ${reservation.num_children} child${reservation.num_children !== 1 ? 'ren' : ''}`}
                </p>
              </div>
            )}
          </div>

          {/* Billing Impact Note */}
          {selectedRoom && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Billing Impact
              </h4>
              <p className="text-sm text-amber-800">
                {selectedRoom.room_type.base_price > (currentRoom?.room_type?.base_price || 0) ? (
                  <>
                    This is an upgrade. Additional charges of $
                    {(selectedRoom.room_type.base_price - (currentRoom?.room_type?.base_price || 0)).toFixed(2)}
                    /night will be applied to the guest's bill for remaining nights.
                  </>
                ) : selectedRoom.room_type.base_price < (currentRoom?.room_type?.base_price || 0) ? (
                  <>
                    This is a downgrade. A credit of $
                    {((currentRoom?.room_type?.base_price || 0) - selectedRoom.room_type.base_price).toFixed(2)}
                    /night will be applied to the guest's bill for remaining nights.
                  </>
                ) : (
                  'No billing changes - same room rate.'
                )}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleChangeRoom}
            disabled={!selectedRoomId || !reason || changeRoomMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {changeRoomMutation.isPending ? (
              'Changing Room...'
            ) : (
              <>
                Confirm Room Change
                <CheckCircle2 className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
