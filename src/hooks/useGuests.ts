import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

type Guest = Database['public']['Tables']['guests']['Row'];
type GuestInsert = Database['public']['Tables']['guests']['Insert'];
type GuestUpdate = Database['public']['Tables']['guests']['Update'];

export interface GuestWithStats extends Guest {
  total_stays?: number;
  total_spent?: number;
  last_visit?: string | null;
}

export interface GuestPreferences {
  room_type?: string;
  floor_preference?: 'low' | 'mid' | 'high';
  bed_type?: 'single' | 'double' | 'king' | 'twin';
  smoking?: boolean;
  dietary_restrictions?: string[];
  special_amenities?: string[];
  notes?: string;
}

export interface SearchFilters {
  searchTerm?: string;
  nationality?: string;
  isActive?: boolean;
  hasEmail?: boolean;
  hasPhone?: boolean;
}

/**
 * Custom hook for managing guest operations
 * Provides CRUD operations, search, and filtering capabilities
 */
export function useGuests(filters?: SearchFilters) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all guests with optional filtering
  const { data: guests, isLoading, error } = useQuery({
    queryKey: ['guests', filters],
    queryFn: async () => {
      let query = supabase
        .from('guests')
        .select(`
          *,
          reservations(count)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.searchTerm) {
        const term = `%${filters.searchTerm}%`;
        query = query.or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`);
      }

      if (filters?.nationality) {
        query = query.eq('nationality', filters.nationality);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.hasEmail) {
        query = query.not('email', 'is', null);
      }

      if (filters?.hasPhone) {
        query = query.not('phone', 'is', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include stats
      return (data || []).map(guest => ({
        ...guest,
        total_stays: Array.isArray(guest.reservations) ? guest.reservations.length : 0,
      })) as GuestWithStats[];
    },
    staleTime: 30000, // 30 seconds
  });

  // Create guest mutation
  const createGuest = useMutation({
    mutationFn: async (newGuest: Omit<GuestInsert, 'created_by'>) => {
      if (!user?.id) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('guests')
        .insert({
          ...newGuest,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Guest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  // Update guest mutation
  const updateGuest = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: GuestUpdate }) => {
      const { data, error } = await supabase
        .from('guests')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Guest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  // Soft delete guest (set is_active to false)
  const deleteGuest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guests')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  // Restore guest (set is_active to true)
  const restoreGuest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guests')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  // Merge duplicate guests
  const mergeGuests = useMutation({
    mutationFn: async ({ keepId, removeId }: { keepId: string; removeId: string }) => {
      // Transfer all reservations to the kept guest
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({ guest_id: keepId })
        .eq('guest_id', removeId);

      if (reservationError) throw reservationError;

      // Transfer all documents to the kept guest  
      const { error: documentsError } = await supabase
        .from('guest_documents')
        .update({ guest_id: keepId })
        .eq('guest_id', removeId);

      if (documentsError) throw documentsError;

      // Delete the duplicate guest
      const { error: deleteError } = await supabase
        .from('guests')
        .delete()
        .eq('id', removeId);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  // Export guests to CSV
  const exportToCSV = (guestsToExport: Guest[]) => {
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'ID Number',
      'Nationality',
      'Date of Birth',
      'Created At',
    ];

    const rows = guestsToExport.map(guest => [
      guest.id,
      guest.first_name,
      guest.last_name,
      guest.email || '',
      guest.phone || '',
      guest.id_number || '',
      guest.nationality || '',
      guest.date_of_birth || '',
      guest.created_at,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `guests_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    guests: guests || [],
    isLoading,
    error,
    createGuest,
    updateGuest,
    deleteGuest,
    restoreGuest,
    mergeGuests,
    exportToCSV,
  };
}

/**
 * Custom hook for fetching a single guest with detailed information
 */
export function useGuest(guestId: string | undefined) {
  return useQuery({
    queryKey: ['guest', guestId],
    queryFn: async () => {
      if (!guestId) throw new Error('Guest ID is required');

      const { data, error } = await supabase
        .from('guests')
        .select(`
          *,
          reservations (
            id,
            check_in_date,
            check_out_date,
            status,
            total_amount,
            room_id,
            rooms (
              room_number,
              room_type_id,
              room_types (
                name
              )
            )
          ),
          guest_documents (
            id,
            document_type,
            document_name,
            file_size,
            created_at
          )
        `)
        .eq('id', guestId)
        .single();

      if (error) throw error;
      return data as GuestWithStats & {
        reservations: any[];
        guest_documents: any[];
      };
    },
    enabled: !!guestId,
    staleTime: 30000,
  });
}

/**
 * Custom hook for detecting potential duplicate guests
 */
export function useDuplicateDetection(guest: Partial<GuestInsert>) {
  return useQuery({
    queryKey: ['duplicate-guests', guest.email, guest.phone, guest.id_number],
    queryFn: async () => {
      if (!guest.email && !guest.phone && !guest.id_number) {
        return [];
      }

      let query = supabase.from('guests').select('*');

      // Build OR conditions for potential duplicates
      const conditions: string[] = [];
      if (guest.email) conditions.push(`email.eq.${guest.email}`);
      if (guest.phone) conditions.push(`phone.eq.${guest.phone}`);
      if (guest.id_number) conditions.push(`id_number.eq.${guest.id_number}`);

      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Guest[];
    },
    enabled: !!(guest.email || guest.phone || guest.id_number),
    staleTime: 0, // Always fetch fresh data for duplicate detection
  });
}
