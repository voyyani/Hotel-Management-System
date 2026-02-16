import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGuests } from '@/hooks/useGuests';
import { useCalculateReservationTotal } from '@/hooks/useAvailability';
import type { AvailabilitySearchFilters, ReservationInsert } from '@/types/database';

interface ReservationFormProps {
  roomId?: string;
  roomNumber?: string;
  basePrice?: number;
  initialFilters?: AvailabilitySearchFilters;
  onSubmit: (reservation: Omit<ReservationInsert, 'created_by'>) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function ReservationForm({
  roomId,
  roomNumber,
  basePrice,
  initialFilters,
  onSubmit,
  onCancel,
  isSubmitting,
}: ReservationFormProps) {
  const { guests } = useGuests();

  const [formData, setFormData] = useState({
    guest_id: '',
    room_id: roomId || '',
    check_in_date: initialFilters?.check_in_date || '',
    check_out_date: initialFilters?.check_out_date || '',
    num_adults: initialFilters?.num_adults || 1,
    num_children: initialFilters?.num_children || 0,
    special_requests: '',
    status: 'pending' as const,
  });

  const { data: calculated } = useCalculateReservationTotal(
    formData.check_in_date,
    formData.check_out_date,
    basePrice
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.guest_id || !formData.room_id) {
      alert('Please select a guest and room');
      return;
    }

    onSubmit({
      ...formData,
      total_amount: calculated?.total || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Room Info */}
      {roomNumber && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">Selected Room</p>
              <p className="text-lg font-bold text-blue-900">Room {roomNumber}</p>
            </div>
            {basePrice && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Base Rate</p>
                <p className="text-xl font-bold text-blue-600">
                  KES {basePrice.toLocaleString()}/night
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Guest Selection */}
      <div className="space-y-2">
        <Label htmlFor="guest">Guest *</Label>
        <Select
          value={formData.guest_id}
          onValueChange={(value) => setFormData({ ...formData, guest_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a guest" />
          </SelectTrigger>
          <SelectContent>
            {guests?.map((guest) => (
              <SelectItem key={guest.id} value={guest.id}>
               {guest.first_name} {guest.last_name}
                {guest.email && ` (${guest.email})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="check-in">Check-in Date *</Label>
          <Input
            id="check-in"
            type="date"
            value={formData.check_in_date}
            onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="check-out">Check-out Date *</Label>
          <Input
            id="check-out"
            type="date"
            value={formData.check_out_date}
            onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
            min={formData.check_in_date || new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

      {/* Guest Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="adults">Number of Adults *</Label>
          <Select
            value={formData.num_adults.toString()}
            onValueChange={(value) => setFormData({ ...formData, num_adults: parseInt(value) })}
          >
            <SelectTrigger>
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

        <div className="space-y-2">
          <Label htmlFor="children">Number of Children</Label>
          <Select
            value={formData.num_children.toString()}
            onValueChange={(value) => setFormData({ ...formData, num_children: parseInt(value) })}
          >
            <SelectTrigger>
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

      {/* Special Requests */}
      <div className="space-y-2">
        <Label htmlFor="requests">Special Requests</Label>
        <textarea
          id="requests"
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          className="w-full min-h-[80px] px-3 py-2 border rounded-md"
          placeholder="Any special requests or preferences..."
        />
      </div>

      {/* Price Summary */}
      {calculated && calculated.nights > 0 && (
        <Card className="p-4 bg-gray-50">
          <h4 className="font-semibold mb-3">Price Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {calculated.nights} night{calculated.nights > 1 ? 's' : ''} × KES {basePrice?.toLocaleString()}
              </span>
              <span className="font-medium">KES {calculated.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VAT (16%)</span>
              <span className="font-medium">KES {calculated.tax.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-lg text-blue-600">
                KES {calculated.total.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Reservation...' : 'Create Reservation'}
        </Button>
      </div>
    </form>
  );
}
