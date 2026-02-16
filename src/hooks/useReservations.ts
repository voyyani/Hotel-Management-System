import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { 
  Reservation, 
  ReservationInsert, 
  ReservationUpdate,
  ReservationWithDetails,
  ReservationFilters 
} from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook for managing reservations with comprehensive CRUD operations
 */
export function useReservations(filters?: ReservationFilters) {
  const query = useQuery({
    queryKey: ['reservations', filters],
    queryFn: async () => {
      let query = supabase
        .from('reservations')
        .select(`
          *,
          guest:guests!guest_id (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          room:rooms!room_id (
            id,
            room_number,
            floor,
            room_type:room_types!room_type_id (
              id,
              name,
              base_price
            )
          ),
          created_by_profile:profiles!created_by (
            id,
            full_name
          )
        `)
        .order('check_in_date', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        
        if (filters.room_number) {
          // Join search - handled in post-processing
        }
        
        if (filters.check_in_from) {
          query = query.gte('check_in_date', filters.check_in_from);
        }
        
        if (filters.check_in_to) {
          query = query.lte('check_in_date', filters.check_in_to);
        }
        
        if (filters.check_out_from) {
          query = query.gte('check_out_date', filters.check_out_from);
        }
        
        if (filters.check_out_to) {
          query = query.lte('check_out_date', filters.check_out_to);
        }
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching reservations:', error);
        throw error;
      }

      let results = data as ReservationWithDetails[];

      // Post-process filters
      if (filters?.guest_name) {
        const searchLower = filters.guest_name.toLowerCase();
        results = results.filter(r => {
          if (!r.guest) return false;
          const fullName = `${r.guest.first_name} ${r.guest.last_name}`.toLowerCase();
          return fullName.includes(searchLower) || 
                 r.guest.email?.toLowerCase().includes(searchLower) ||
                 r.guest.phone?.toLowerCase().includes(searchLower);
        });
      }

      if (filters?.room_number) {
        const searchLower = filters.room_number.toLowerCase();
        results = results.filter(r => 
          r.room?.room_number?.toLowerCase().includes(searchLower)
        );
      }

      return results;
    },
    staleTime: 30000, // 30 seconds
  });

  return {
    reservations: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook to fetch a single reservation by ID
 */
export function useReservation(reservationId?: string) {
  return useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: async () => {
      if (!reservationId) return null;

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          guest:guests!guest_id (
            id,
            first_name,
            last_name,
            email,
            phone,
            nationality,
            preferences
          ),
          room:rooms!room_id (
            id,
            room_number,
            floor,
            status,
            room_type:room_types!room_type_id (
              id,
              name,
              base_price,
              max_adults,
              max_children,
              amenities
            )
          ),
          created_by_profile:profiles!created_by (
            id,
            full_name,
            email
          )
        `)
        .eq('id', reservationId)
        .single();

      if (error) {
        console.error('Error fetching reservation:', error);
        throw error;
      }

      return data as ReservationWithDetails;
    },
    enabled: !!reservationId,
    staleTime: 30000,
  });
}

/**
 * Hook to create a new reservation
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reservation: Omit<ReservationInsert, 'created_by'>) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Check room availability first
      const { data: isAvailable, error: availError } = await supabase
        .rpc('check_room_availability', {
          p_room_id: reservation.room_id,
          p_check_in: reservation.check_in_date,
          p_check_out: reservation.check_out_date,
        });

      if (availError) {
        console.error('Error checking availability:', availError);
        throw new Error('Failed to check room availability');
      }

      if (!isAvailable) {
        throw new Error('Room is not available for the selected dates');
      }

      // Create reservation
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          ...reservation,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reservation:', error);
        throw error;
      }

      return data as Reservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['available-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room-status'] });
    },
  });
}

/**
 * Hook to update an existing reservation
 */
export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string
      updates: ReservationUpdate 
    }) => {
      // If dates or room changed, check availability
      if (updates.room_id || updates.check_in_date || updates.check_out_date) {
        const { data: current } = await supabase
          .from('reservations')
          .select('room_id, check_in_date, check_out_date')
          .eq('id', id)
          .single();

        if (current) {
          const roomId = updates.room_id || current.room_id;
          const checkIn = updates.check_in_date || current.check_in_date;
          const checkOut = updates.check_out_date || current.check_out_date;

          const { data: isAvailable, error: availError } = await supabase
            .rpc('check_room_availability', {
              p_room_id: roomId,
              p_check_in: checkIn,
              p_check_out: checkOut,
              p_exclude_reservation_id: id,
            });

          if (availError) {
            console.error('Error checking availability:', availError);
            throw new Error('Failed to check room availability');
          }

          if (!isAvailable) {
            throw new Error('Room is not available for the selected dates');
          }
        }
      }

      const { data, error } = await supabase
        .from('reservations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reservation:', error);
        throw error;
      }

      return data as Reservation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['available-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room-status'] });
    },
  });
}

/**
 * Hook to cancel a reservation
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: string) => {
      const { data, error } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservationId)
        .select()
        .single();

      if (error) {
        console.error('Error cancelling reservation:', error);
        throw error;
      }

      return data as Reservation;
    },
    onSuccess: (_, reservationId) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['available-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room-status'] });
    },
  });
}

/**
 * Hook to check in a guest
 */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: string) => {
      // Update reservation status and actual_check_in
      const { data: reservation, error: resError } = await supabase
        .from('reservations')
        .update({
          status: 'checked_in',
          actual_check_in: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservationId)
        .select('room_id')
        .single();

      if (resError) {
        console.error('Error checking in:', resError);
        throw resError;
      }

      // Update room status to occupied
      const { error: roomError } = await supabase
        .from('rooms')
        .update({
          status: 'occupied',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservation.room_id);

      if (roomError) {
        console.error('Error updating room status:', roomError);
        throw roomError;
      }

      return reservation;
    },
    onSuccess: (_, reservationId) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room-status'] });
    },
  });
}

/**
 * Hook to check out a guest
 */
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: string) => {
      // Update reservation status and actual_check_out
      const { data: reservation, error: resError } = await supabase
        .from('reservations')
        .update({
          status: 'checked_out',
          actual_check_out: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservationId)
        .select('room_id')
        .single();

      if (resError) {
        console.error('Error checking out:', resError);
        throw resError;
      }

      // Update room status to cleaning
      const { error: roomError } = await supabase
        .from('rooms')
        .update({
          status: 'cleaning',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservation.room_id);

      if (roomError) {
        console.error('Error updating room status:', roomError);
        throw roomError;
      }

      return reservation;
    },
    onSuccess: (_, reservationId) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room-status'] });
    },
  });
}

/**
 * Hook to get upcoming check-ins (today and tomorrow)
 */
export function useUpcomingCheckIns() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['upcoming-checkins', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          guest:guests!guest_id (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          room:rooms!room_id (
            id,
            room_number,
            floor,
            room_type:room_types!room_type_id (
              id,
              name
            )
          )
        `)
        .in('status', ['pending', 'confirmed'])
        .gte('check_in_date', today)
        .lte('check_in_date', tomorrow)
        .order('check_in_date', { ascending: true });

      if (error) {
        console.error('Error fetching upcoming check-ins:', error);
        throw error;
      }

      return data as ReservationWithDetails[];
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // refetch every 5 minutes
  });
}

/**
 * Hook to get upcoming check-outs (today and tomorrow)
 */
export function useUpcomingCheckOuts() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['upcoming-checkouts', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          guest:guests!guest_id (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          room:rooms!room_id (
            id,
            room_number,
            floor,
            room_type:room_types!room_type_id (
              id,
              name
            )
          )
        `)
        .eq('status', 'checked_in')
        .gte('check_out_date', today)
        .lte('check_out_date', tomorrow)
        .order('check_out_date', { ascending: true });

      if (error) {
        console.error('Error fetching upcoming check-outs:', error);
        throw error;
      }

      return data as ReservationWithDetails[];
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // refetch every 5 minutes
  });
}

/**
 * Hook to get guest's reservation history
 */
export function useGuestReservations(guestId?: string) {
  return useQuery({
    queryKey: ['guest-reservations', guestId],
    queryFn: async () => {
      if (!guestId) return [];

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          room:rooms!room_id (
            id,
            room_number,
            floor,
            room_type:room_types!room_type_id (
              id,
              name,
              base_price
            )
          )
        `)
        .eq('guest_id', guestId)
        .order('check_in_date', { ascending: false });

      if (error) {
        console.error('Error fetching guest reservations:', error);
        throw error;
      }

      return data as ReservationWithDetails[];
    },
    enabled: !!guestId,
    staleTime: 30000,
  });
}
