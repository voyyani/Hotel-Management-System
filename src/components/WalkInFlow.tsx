import { useState } from 'react';
import { 
  X, 
  Search, 
  UserPlus, 
  Users, 
  CheckCircle2 
} from 'lucide-react';
import { useGuests } from '@/hooks/useGuests';
import { useAvailableRooms } from '@/hooks/useAvailability';
import { useCreateReservation } from '@/hooks/useReservations';
import type { ReservationInsert } from '@/types/database';

interface WalkInFlowProps {
  onComplete: (reservationId: string) => void;
  onCancel: () => void;
}

type FlowStep = 'guest-search' | 'guest-create' | 'availability' | 'confirm';

interface GuestResult {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
}

export function WalkInFlow({ onComplete, onCancel }: WalkInFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('guest-search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<GuestResult | null>(null);
  
  // New guest form
  const [newGuest, setNewGuest] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nationality: '',
  });

  // Booking details
  const [bookingDetails, setBookingDetails] = useState({
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    num_adults: 1,
    num_children: 0,
    selected_room_id: '',
  });

  const { guests, isLoading: searchingGuests, createGuest } = useGuests();
  const { data: availableRooms, isLoading: loadingRooms } = useAvailableRooms({
    check_in_date: bookingDetails.check_in_date!,
    check_out_date: bookingDetails.check_out_date!,
    num_adults: bookingDetails.num_adults,
    num_children: bookingDetails.num_children,
  });
  const createReservationMutation = useCreateReservation();

  // Filter guests by search query
  const filteredGuests = searchQuery
    ? guests?.filter((g: GuestResult) => {
        const query = searchQuery.toLowerCase();
        const fullName = `${g.first_name} ${g.last_name}`.toLowerCase();
        return (
          fullName.includes(query) ||
          g.email?.toLowerCase().includes(query) ||
          g.phone?.toLowerCase().includes(query)
        );
      })
    : [];

  const handleSelectGuest = (guest: GuestResult) => {
    setSelectedGuest(guest);
    setCurrentStep('availability');
  };

  const handleCreateGuest = async () => {
    try {
      const created = await createGuest.mutateAsync(newGuest);
      setSelectedGuest(created as GuestResult);
      setCurrentStep('availability');
    } catch (error) {
      console.error('Failed to create guest:', error);
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setBookingDetails({ ...bookingDetails, selected_room_id: roomId });
    setCurrentStep('confirm');
  };

  const handleConfirmBooking = async () => {
    if (!selectedGuest || !bookingDetails.selected_room_id || !bookingDetails.check_in_date || !bookingDetails.check_out_date) return;

    try {
      // Calculate total amount (placeholder - should use actual pricing logic)
      const nights = Math.ceil(
        (new Date(bookingDetails.check_out_date).getTime() - new Date(bookingDetails.check_in_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalAmount = nights * 100; // Placeholder rate

      const reservationData: ReservationInsert = {
        guest_id: selectedGuest.id,
        room_id: bookingDetails.selected_room_id,
        check_in_date: bookingDetails.check_in_date,
        check_out_date: bookingDetails.check_out_date,
        num_adults: bookingDetails.num_adults,
        num_children: bookingDetails.num_children,
        status: 'confirmed',
        total_amount: totalAmount,
        created_by: 'system', // TODO: Use actual user ID
      };
      const reservation = await createReservationMutation.mutateAsync(reservationData);
      onComplete(reservation.id);
    } catch (error) {
      console.error('Failed to create reservation:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'guest-search':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for Guest
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {searchQuery && (
              <div className="border border-gray-200 rounded-lg divide-y max-h-64 overflow-y-auto">
                {searchingGuests ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : filteredGuests && filteredGuests.length > 0 ? (
                  filteredGuests.map((guest) => (
                    <button
                      key={guest.id}
                      onClick={() => handleSelectGuest(guest)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {guest.first_name} {guest.last_name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {guest.email && <span>{guest.email}</span>}
                        {guest.email && guest.phone && <span className="mx-2">•</span>}
                        {guest.phone && <span>{guest.phone}</span>}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No guests found</div>
                )}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('guest-create')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <UserPlus className="h-5 w-5" />
              Create New Guest
            </button>
          </div>
        );

      case 'guest-create':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={newGuest.first_name}
                  onChange={(e) => setNewGuest({ ...newGuest, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={newGuest.last_name}
                  onChange={(e) => setNewGuest({ ...newGuest, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={newGuest.email}
                onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={newGuest.phone}
                onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <input
                type="text"
                value={newGuest.nationality}
                onChange={(e) => setNewGuest({ ...newGuest, nationality: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setCurrentStep('guest-search')}
                className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={handleCreateGuest}
                disabled={
                  !newGuest.first_name ||
                  !newGuest.last_name ||
                  !newGuest.email ||
                  !newGuest.phone ||
                  createGuest.isPending
                }
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createGuest.isPending ? 'Creating...' : 'Continue'}
              </button>
            </div>
          </div>
        );

      case 'availability':
        return (
          <div className="space-y-6">
            {selectedGuest && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guest</p>
                    <p className="font-medium text-gray-900">
                      {selectedGuest.first_name} {selectedGuest.last_name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={bookingDetails.check_in_date}
                  onChange={(e) =>
                    setBookingDetails({ ...bookingDetails, check_in_date: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={bookingDetails.check_out_date}
                  onChange={(e) =>
                    setBookingDetails({ ...bookingDetails, check_out_date: e.target.value })
                  }
                  min={bookingDetails.check_in_date}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adults
                </label>
                <select
                  value={bookingDetails.num_adults}
                  onChange={(e) =>
                    setBookingDetails({ ...bookingDetails, num_adults: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Children
                </label>
                <select
                  value={bookingDetails.num_children}
                  onChange={(e) =>
                    setBookingDetails({ ...bookingDetails, num_children: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[0, 1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Rooms
              </label>
              {loadingRooms ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : availableRooms && availableRooms.length > 0 ? (
                <div className="grid gap-3 max-h-64 overflow-y-auto">
                  {availableRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleSelectRoom(room.id)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Room {room.room_number}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {room.room_type_name} • Floor {room.floor}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Max: {room.max_adults} adults, {room.max_children} children
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            ${room.base_price}
                          </p>
                          <p className="text-xs text-gray-500">per night</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No rooms available for selected dates
                </div>
              )}
            </div>
          </div>
        );

      case 'confirm':
        const selectedRoom = availableRooms?.find(
          (r) => r.id === bookingDetails.selected_room_id
        );
        const nights = Math.ceil(
          (new Date(bookingDetails.check_out_date!).getTime() -
            new Date(bookingDetails.check_in_date!).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const subtotal = nights * (selectedRoom?.base_price || 0);
        const tax = subtotal * 0.16; // 16% VAT
        const total = subtotal + tax;

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Confirm Walk-in Booking
              </h3>
              <p className="text-gray-600">Review the booking details before confirming</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Guest</p>
                <p className="font-medium text-gray-900">
                  {selectedGuest?.first_name} {selectedGuest?.last_name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-medium text-gray-900">
                    {new Date(bookingDetails.check_in_date!).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-medium text-gray-900">
                    {new Date(bookingDetails.check_out_date!).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Room</p>
                <p className="font-medium text-gray-900">
                  Room {selectedRoom?.room_number} - {selectedRoom?.room_type_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Guests</p>
                <p className="font-medium text-gray-900">
                  {bookingDetails.num_adults} Adult
                  {bookingDetails.num_adults !== 1 ? 's' : ''}
                  {bookingDetails.num_children > 0 &&
                    `, ${bookingDetails.num_children} Child${
                      bookingDetails.num_children !== 1 ? 'ren' : ''
                    }`}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>
                    {nights} night{nights !== 1 ? 's' : ''} × ${selectedRoom?.base_price}
                  </span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (16%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('availability')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={createReservationMutation.isPending}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {createReservationMutation.isPending ? (
                  'Creating...'
                ) : (
                  <>
                    Confirm & Check In
                    <CheckCircle2 className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Walk-in Guest</h2>
            <p className="text-sm text-gray-600 mt-1">Quick booking for walk-in guests</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{renderStepContent()}</div>
      </div>
    </div>
  );
}
