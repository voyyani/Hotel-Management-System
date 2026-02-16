import { useState } from 'react';
import { 
  UserPlus, 
  LogIn, 
  LogOut, 
  DoorOpen,
  Clock,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ArrivalsDeparturesDashboard } from '@/components/ArrivalsDeparturesDashboard';
import { CheckInWizard } from '@/components/CheckInWizard';
import { CheckOutWizard } from '@/components/CheckOutWizard';
import { WalkInFlow } from '@/components/WalkInFlow';
import { RoomChangeModal } from '@/components/RoomChangeModal';
import type { ReservationWithDetails } from '@/types/database';

type ModalType = 'checkin' | 'checkout' | 'walkin' | 'room-change' | null;

export default function FrontDeskPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithDetails | null>(null);

  // Fetch today's statistics
  const { data: stats } = useQuery({
    queryKey: ['front-desk-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      // Get today's arrivals
      const { data: arrivals } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed'])
        .gte('check_in_date', today)
        .lte('check_in_date', tomorrow);

      // Get today's departures
      const { data: departures } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'checked_in')
        .gte('check_out_date', today)
        .lte('check_out_date', tomorrow);

      // Get current occupancy
      const { data: occupiedRooms } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'checked_in');

      const { data: totalRooms } = await supabase
        .from('rooms')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'maintenance');

      // Get pending check-ins (not yet checked in today)
      const { data: pending } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'confirmed')
        .lte('check_in_date', today);

      return {
        expectedArrivals: arrivals?.length || 0,
        expectedDepartures: departures?.length || 0,
        currentOccupancy: occupiedRooms?.length || 0,
        totalRooms: totalRooms?.length || 0,
        pendingCheckIns: pending?.length || 0,
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const occupancyRate = stats
    ? Math.round((stats.currentOccupancy / stats.totalRooms) * 100)
    : 0;

  const handleCheckInClick = (reservation: ReservationWithDetails) => {
    setSelectedReservation(reservation);
    setActiveModal('checkin');
  };

  const handleCheckOutClick = (reservation: ReservationWithDetails) => {
    setSelectedReservation(reservation);
    setActiveModal('checkout');
  };

  const handleWalkInComplete = (reservationId: string) => {
    console.log('Walk-in booking created:', reservationId);
    setActiveModal(null);
    // Optionally open check-in wizard for the new reservation
  };

  const handleModalClose = () => {
    setActiveModal(null);
    setSelectedReservation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Front Desk</h1>
            <p className="text-gray-600 mt-1">
              Manage check-ins, check-outs, and guest services
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-sm text-gray-600">Today's Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expected Arrivals</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.expectedArrivals || 0}
                </p>
              </div>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <LogIn className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expected Departures</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.expectedDepartures || 0}
                </p>
              </div>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <LogOut className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Occupancy</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.currentOccupancy || 0}/{stats?.totalRooms || 0}
                </p>
              </div>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
                <DoorOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupancy Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{occupancyRate}%</p>
              </div>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Check-ins</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.pendingCheckIns || 0}
                </p>
              </div>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveModal('walkin')}
              className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Walk-in Guest</p>
                <p className="text-xs text-gray-500 mt-1">Book & check-in</p>
              </div>
            </button>

            <button
              onClick={() => {
                // This would open a modal to search/select reservation
                alert('Search for reservation to check-in');
              }}
              className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Check-in Guest</p>
                <p className="text-xs text-gray-500 mt-1">Process arrival</p>
              </div>
            </button>

            <button
              onClick={() => {
                // This would open a modal to search/select reservation
                alert('Search for guest to check-out');
              }}
              className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <LogOut className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Check-out Guest</p>
                <p className="text-xs text-gray-500 mt-1">Process departure</p>
              </div>
            </button>

            <button
              onClick={() => {
                // This would open a modal to search/select reservation
                if (selectedReservation) {
                  setActiveModal('room-change');
                } else {
                  alert('Please select a checked-in guest first');
                }
              }}
              className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all group"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors">
                <DoorOpen className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Change Room</p>
                <p className="text-xs text-gray-500 mt-1">Transfer guest</p>
              </div>
            </button>
          </div>
        </div>

        {/* Arrivals & Departures Dashboard */}
        <ArrivalsDeparturesDashboard
          onCheckInClick={handleCheckInClick}
          onCheckOutClick={handleCheckOutClick}
        />

        {/* Status Legend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Guide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-700">Expected Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-700">Expected Tomorrow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-gray-700">Late Check-out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-gray-700">On Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'checkin' && selectedReservation && (
        <CheckInWizard
          reservation={selectedReservation}
          onComplete={handleModalClose}
          onCancel={handleModalClose}
        />
      )}

      {activeModal === 'checkout' && selectedReservation && (
        <CheckOutWizard
          reservation={selectedReservation}
          onComplete={handleModalClose}
          onCancel={handleModalClose}
        />
      )}

      {activeModal === 'walkin' && (
        <WalkInFlow onComplete={handleWalkInComplete} onCancel={handleModalClose} />
      )}

      {activeModal === 'room-change' && selectedReservation && (
        <RoomChangeModal
          reservation={selectedReservation}
          onComplete={handleModalClose}
          onCancel={handleModalClose}
        />
      )}
    </div>
  );
}
