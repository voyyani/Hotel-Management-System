import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReservations, useCancelReservation, useCheckIn, useCheckOut } from '@/hooks/useReservations';
import type { ReservationFilters, ReservationStatus } from '@/types/database';
import { Calendar, User, Home, Search, X } from 'lucide-react';
import { format } from 'date-fns';

interface ReservationListProps {
  onViewDetails?: (reservationId: string) => void;
}

export function ReservationList({ onViewDetails }: ReservationListProps) {
  const [filters, setFilters] = useState<ReservationFilters>({
    status: 'all',
    guest_name: '',
  });

  const { reservations, isLoading } = useReservations(filters);
  const cancelMutation = useCancelReservation();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const getStatusColor = (status: ReservationStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      checked_in: 'bg-green-100 text-green-800',
      checked_out: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      await cancelMutation.mutateAsync(id);
    }
  };

  const handleCheckIn = async (id: string) => {
    if (confirm('Check in this guest?')) {
      await checkInMutation.mutateAsync(id);
    }
  };

  const handleCheckOut = async (id: string) => {
    if (confirm('Check out this guest?')) {
      await checkOutMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search guest..."
              value={filters.guest_name}
              onChange={(e) => setFilters({ ...filters, guest_name: e.target.value })}
              className="pl-10"
            />
            {filters.guest_name && (
              <button
                onClick={() => setFilters({ ...filters, guest_name: '' })}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => setFilters({ ...filters, status: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked_in">Checked In</SelectItem>
              <SelectItem value="checked_out">Checked Out</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : reservations && reservations.length > 0 ? (
        <div className="space-y-3">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      ID: {reservation.id.slice(0, 8)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          {reservation.guest?.first_name} {reservation.guest?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{reservation.guest?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Home className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Room {reservation.room?.room_number}</p>
                        <p className="text-xs text-gray-500">
                          {reservation.room?.room_type?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(reservation.check_in_date), 'MMM dd')} →{' '}
                          {format(new Date(reservation.check_out_date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {reservation.num_adults}A + {reservation.num_children}C
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-600">
                      KES {reservation.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails?.(reservation.id)}
                  >
                    View Details
                  </Button>

                  {reservation.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => handleCheckIn(reservation.id)}
                      disabled={checkInMutation.isPending}
                    >
                      Check In
                    </Button>
                  )}

                  {reservation.status === 'checked_in' && (
                    <Button
                      size="sm"
                      onClick={() => handleCheckOut(reservation.id)}
                      disabled={checkOutMutation.isPending}
                    >
                      Check Out
                    </Button>
                  )}

                  {['pending', 'confirmed'].includes(reservation.status) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancel(reservation.id)}
                      disabled={cancelMutation.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No reservations found</p>
        </Card>
      )}
    </div>
  );
}
