import { useState } from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle2,
  LogOut,
  AlertCircle,
  Filter
} from 'lucide-react';
import { useUpcomingCheckIns, useUpcomingCheckOuts, useCheckIn, useCheckOut } from '@/hooks/useReservations';
import type { ReservationWithDetails } from '@/types/database';

interface ArrivalsDeparturesDashboardProps {
  onCheckInClick?: (reservation: ReservationWithDetails) => void;
  onCheckOutClick?: (reservation: ReservationWithDetails) => void;
}

export function ArrivalsDeparturesDashboard({ 
  onCheckInClick, 
  onCheckOutClick 
}: ArrivalsDeparturesDashboardProps) {
  const [activeTab, setActiveTab] = useState<'arrivals' | 'departures'>('arrivals');
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'both'>('today');
  
  const { data: upcomingCheckIns, isLoading: loadingCheckIns } = useUpcomingCheckIns();
  const { data: upcomingCheckOuts, isLoading: loadingCheckOuts } = useUpcomingCheckOuts();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  // Filter by date
  const filterByDate = (reservations: ReservationWithDetails[]) => {
    if (!reservations) return [];
    
    if (dateFilter === 'today') {
      return reservations.filter(r => 
        isToday(new Date(activeTab === 'arrivals' ? r.check_in_date : r.check_out_date))
      );
    } else if (dateFilter === 'tomorrow') {
      return reservations.filter(r => 
        isTomorrow(new Date(activeTab === 'arrivals' ? r.check_in_date : r.check_out_date))
      );
    }
    return reservations;
  };

  const filteredArrivals = filterByDate(upcomingCheckIns || []);
  const filteredDepartures = filterByDate(upcomingCheckOuts || []);

  const currentData = activeTab === 'arrivals' ? filteredArrivals : filteredDepartures;
  const isLoading = activeTab === 'arrivals' ? loadingCheckIns : loadingCheckOuts;

  const handleQuickCheckIn = async (reservationId: string) => {
    try {
      await checkInMutation.mutateAsync(reservationId);
    } catch (error) {
      console.error('Quick check-in failed:', error);
    }
  };

  const handleQuickCheckOut = async (reservationId: string) => {
    try {
      await checkOutMutation.mutateAsync(reservationId);
    } catch (error) {
      console.error('Quick check-out failed:', error);
    }
  };

  const getDateBadge = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) {
      return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Today</span>;
    } else if (isTomorrow(d)) {
      return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">Tomorrow</span>;
    }
    return null;
  };

  const getLateCheckOutBadge = (checkOutDate: string) => {
    const now = new Date();
    const checkOut = new Date(checkOutDate);
    const defaultCheckOutTime = new Date(checkOut);
    defaultCheckOutTime.setHours(11, 0, 0); // Assume 11 AM checkout

    if (now > defaultCheckOutTime && isToday(checkOut)) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Late Checkout
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('arrivals')}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'arrivals'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Arrivals ({filteredArrivals.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('departures')}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'departures'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Departures ({filteredDepartures.length})
              </div>
            </button>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'today' | 'tomorrow' | 'both')}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today Only</option>
              <option value="tomorrow">Tomorrow Only</option>
              <option value="both">Today & Tomorrow</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : currentData.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No {activeTab} scheduled
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {activeTab === 'arrivals' 
                ? 'There are no guests scheduled to arrive for the selected period.'
                : 'There are no guests scheduled to depart for the selected period.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentData.map((reservation) => (
              <div
                key={reservation.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  {/* Guest Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {reservation.guest?.first_name} {reservation.guest?.last_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getDateBadge(
                            activeTab === 'arrivals' 
                              ? reservation.check_in_date 
                              : reservation.check_out_date
                          )}
                          {activeTab === 'departures' && getLateCheckOutBadge(reservation.check_out_date)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      {/* Contact Info */}
                      {reservation.guest?.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          {reservation.guest.email}
                        </div>
                      )}
                      {reservation.guest?.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          {reservation.guest.phone}
                        </div>
                      )}

                      {/* Room Info */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        Room {reservation.room?.room_number} - {reservation.room?.room_type?.name}
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        {activeTab === 'arrivals' ? 'Check-in: ' : 'Check-out: '}
                        {format(
                          new Date(activeTab === 'arrivals' ? reservation.check_in_date : reservation.check_out_date),
                          'MMM dd, yyyy'
                        )}
                      </div>

                      {/* Guest Count */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        {reservation.num_adults} Adult{reservation.num_adults !== 1 ? 's' : ''}
                        {reservation.num_children > 0 && `, ${reservation.num_children} Child${reservation.num_children !== 1 ? 'ren' : ''}`}
                      </div>

                      {/* Stay Duration */}
                      {activeTab === 'arrivals' && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {Math.ceil(
                            (new Date(reservation.check_out_date).getTime() - 
                             new Date(reservation.check_in_date).getTime()) / 
                            (1000 * 60 * 60 * 24)
                          )} night{Math.ceil(
                            (new Date(reservation.check_out_date).getTime() - 
                             new Date(reservation.check_in_date).getTime()) / 
                            (1000 * 60 * 60 * 24)
                          ) !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {/* Special Requests */}
                    {reservation.special_requests && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <strong>Special Requests:</strong> {reservation.special_requests}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-4 flex flex-col gap-2">
                    {activeTab === 'arrivals' ? (
                      <>
                        <button
                          onClick={() => onCheckInClick?.(reservation)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Check In
                        </button>
                        <button
                          onClick={() => handleQuickCheckIn(reservation.id)}
                          disabled={checkInMutation.isPending}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          Quick Check-in
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onCheckOutClick?.(reservation)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Check Out
                        </button>
                        <button
                          onClick={() => handleQuickCheckOut(reservation.id)}
                          disabled={checkOutMutation.isPending}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          Quick Check-out
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
