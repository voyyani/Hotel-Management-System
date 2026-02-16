import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { AvailableRoom, AvailabilitySearchFilters } from '@/types/database';

/**
 * Hook to search for available rooms based on date range and guest count
 */
export function useAvailableRooms(filters?: AvailabilitySearchFilters) {
  return useQuery({
    queryKey: ['available-rooms', filters],
    queryFn: async () => {
      if (!filters?.check_in_date || !filters?.check_out_date) {
        return [];
      }

      const minOccupancy = filters.num_adults + filters.num_children;

      const { data, error } = await supabase
        .rpc('find_available_rooms', {
          p_check_in: filters.check_in_date,
          p_check_out: filters.check_out_date,
          p_room_type_id: filters.room_type_id || null,
          p_min_occupancy: minOccupancy,
        });

      if (error) {
        console.error('Error finding available rooms:', error);
        throw error;
      }

      return data as AvailableRoom[];
    },
    enabled: !!filters?.check_in_date && !!filters?.check_out_date,
    staleTime: 60000, // 1 minute - availability changes frequently
  });
}

/**
 * Hook to check if a specific room is available for given dates
 */
export function useCheckRoomAvailability(
  roomId?: string,
  checkIn?: string,
  checkOut?: string,
  excludeReservationId?: string
) {
  return useQuery({
    queryKey: ['room-availability', roomId, checkIn, checkOut, excludeReservationId],
    queryFn: async () => {
      if (!roomId || !checkIn || !checkOut) {
        return null;
      }

      const { data, error } = await supabase
        .rpc('check_room_availability', {
          p_room_id: roomId,
          p_check_in: checkIn,
          p_check_out: checkOut,
          p_exclude_reservation_id: excludeReservationId || null,
        });

      if (error) {
        console.error('Error checking room availability:', error);
        throw error;
      }

      return data as boolean;
    },
    enabled: !!roomId && !!checkIn && !!checkOut,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to calculate nights and total amount for a reservation
 */
export function useCalculateReservationTotal(
  checkIn?: string,
  checkOut?: string,
  basePrice?: number
) {
  return useQuery({
    queryKey: ['calculate-total', checkIn, checkOut, basePrice],
    queryFn: async () => {
      if (!checkIn || !checkOut || !basePrice) {
        return { nights: 0, subtotal: 0, tax: 0, total: 0 };
      }

      // Calculate number of nights
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Calculate amounts
      const subtotal = nights * basePrice;
      // 16% VAT (Kenya standard rate)
      const tax = subtotal * 0.16;
      const total = subtotal + tax;

      return {
        nights,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
      };
    },
    enabled: !!checkIn && !!checkOut && !!basePrice,
    staleTime: Infinity, // Calculation is deterministic, no need to refetch
  });
}

/**
 * Hook to get occupancy rate for a date range
 */
export function useOccupancyRate(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['occupancy-rate', startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) {
        return { occupancy_rate: 0, booked_rooms: 0, total_rooms: 0 };
      }

      // Get total rooms count
      const { count: totalRooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });

      if (roomsError) {
        console.error('Error counting total rooms:', roomsError);
        throw roomsError;
      }

      // Get booked rooms count
      const { data: reservations, error: resError } = await supabase
        .from('reservations')
        .select('room_id')
        .or(`and(check_in_date.lte.${endDate},check_out_date.gte.${startDate})`)
        .in('status', ['confirmed', 'checked_in', 'pending']);

      if (resError) {
        console.error('Error counting booked rooms:', resError);
        throw resError;
      }

      // Get unique room IDs
      const uniqueRooms = new Set(reservations?.map(r => r.room_id) || []);
      const bookedRooms = uniqueRooms.size;

      const occupancyRate = totalRooms && totalRooms > 0 
        ? Math.round((bookedRooms / totalRooms) * 100) 
        : 0;

      return {
        occupancy_rate: occupancyRate,
        booked_rooms: bookedRooms,
        total_rooms: totalRooms || 0,
      };
    },
    enabled: !!startDate && !!endDate,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to get room types with availability count
 */
export function useRoomTypesWithAvailability(checkIn?: string, checkOut?: string) {
  return useQuery({
    queryKey: ['room-types-availability', checkIn, checkOut],
    queryFn: async () => {
      // First get all active room types
      const { data: roomTypes, error: typesError } = await supabase
        .from('room_types')
        .select('*')
        .eq('is_active', true)
        .order('base_price', { ascending: true });

      if (typesError) {
        console.error('Error fetching room types:', typesError);
        throw typesError;
      }

      if (!checkIn || !checkOut) {
        // Return room types without availability info
        return roomTypes.map(rt => ({
          ...rt,
          available_count: null,
        }));
      }

      // Get available rooms for the date range
      const { data: availableRooms, error: availError } = await supabase
        .rpc('find_available_rooms', {
          p_check_in: checkIn,
          p_check_out: checkOut,
          p_room_type_id: null,
          p_min_occupancy: 1,
        });

      if (availError) {
        console.error('Error finding available rooms:', availError);
        throw availError;
      }

      // Count available rooms per room type
      const availabilityMap = new Map<string, number>();
      (availableRooms as AvailableRoom[]).forEach(room => {
        const typeName = room.room_type_name;
        availabilityMap.set(typeName, (availabilityMap.get(typeName) || 0) + 1);
      });

      // Merge availability counts with room types
      return roomTypes.map(rt => ({
        ...rt,
        available_count: availabilityMap.get(rt.name) || 0,
      }));
    },
    enabled: true,
    staleTime: 60000, // 1 minute
  });
}
