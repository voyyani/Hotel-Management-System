import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvailabilitySearch } from '@/components/reservations/AvailabilitySearch';
import { ReservationForm } from '@/components/reservations/ReservationForm';
import { ReservationList } from '@/components/reservations/ReservationList';
import { useCreateReservation, useReservation } from '@/hooks/useReservations';
import type { AvailabilitySearchFilters } from '@/types/database';
import { Plus, Calendar } from 'lucide-react';

export function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<string>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{
    id: string;
    number: string;
    price: number;
    filters: AvailabilitySearchFilters;
  } | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);

  const createMutation = useCreateReservation();
  const { data: selectedReservation } = useReservation(selectedReservationId || undefined);

  const handleRoomSelect = (roomId: string, filters: AvailabilitySearchFilters) => {
    // In a real implementation, we'd get room details
    setSelectedRoom({
      id: roomId,
      number: 'TBD', // Would come from room data
      price: 0, // Would come from room data
      filters,
    });
    setShowCreateModal(true);
  };

  const handleCreateReservation = async (reservation: any) => {
    try {
      await createMutation.mutateAsync(reservation);
      setShowCreateModal(false);
      setSelectedRoom(null);
      setActiveTab('list');
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Failed to create reservation. Please try again.');
    }
  };

  const handleViewDetails = (reservationId: string) => {
    setSelectedReservationId(reservationId);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600 mt-1">Manage bookings and room assignments</p>
        </div>
        <Button onClick={() => setActiveTab('search')}>
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            All Reservations
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Booking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <ReservationList onViewDetails={handleViewDetails} />
        </TabsContent>

        <TabsContent value="search">
          <AvailabilitySearch onRoomSelect={handleRoomSelect} />
        </TabsContent>
      </Tabs>

      {/* Create Reservation Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Reservation</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <ReservationForm
              roomId={selectedRoom.id}
              roomNumber={selectedRoom.number}
              basePrice={selectedRoom.price}
              initialFilters={selectedRoom.filters}
              onSubmit={handleCreateReservation}
              onCancel={() => {
                setShowCreateModal(false);
                setSelectedRoom(null);
              }}
              isSubmitting={createMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reservation Details Modal */}
      <Dialog open={!!selectedReservationId} onOpenChange={() => setSelectedReservationId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Guest</p>
                  <p className="font-medium">
                    {selectedReservation.guest?.first_name} {selectedReservation.guest?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room</p>
                  <p className="font-medium">
                    Room {selectedReservation.room?.room_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-medium">{selectedReservation.check_in_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-medium">{selectedReservation.check_out_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{selectedReservation.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium text-blue-600">
                    KES {selectedReservation.total_amount.toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedReservation.special_requests && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Special Requests</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">
                    {selectedReservation.special_requests}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
