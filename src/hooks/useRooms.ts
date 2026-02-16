import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { useEffect } from 'react';

type Room = Database['public']['Tables']['rooms']['Row'];
type RoomInsert = Database['public']['Tables']['rooms']['Insert'];
type RoomUpdate = Database['public']['Tables']['rooms']['Update'];
type RoomStatus = Database['public']['Enums']['room_status'];

export interface RoomWithType extends Room {
  room_types: {
    id: string;
    name: string;
    description: string | null;
    base_price: number;
    max_adults: number;
    max_children: number;
    amenities: any;
    image_url: string | null;
  };
}

/**
 * Hook to fetch all rooms with their room types
 */
export function useRooms() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          room_types (
            id,
            name,
            description,
            base_price,
            max_adults,
            max_children,
            amenities,
            image_url
          )
        `)
        .order('room_number', { ascending: true });

      if (error) throw error;
      return data as RoomWithType[];
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        () => {
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ['rooms'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

/**
 * Hook to fetch a single room by ID
 */
export function useRoom(roomId: string | undefined) {
  return useQuery({
    queryKey: ['rooms', roomId],
    queryFn: async () => {
      if (!roomId) throw new Error('Room ID is required');

      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          room_types (
            id,
            name,
            description,
            base_price,
            max_adults,
            max_children,
            amenities,
            image_url
          )
        `)
        .eq('id', roomId)
        .single();

      if (error) throw error;
      return data as RoomWithType;
    },
    enabled: !!roomId,
  });
}

/**
 * Hook to create a new room
 */
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (room: RoomInsert) => {
      const { data, error } = await supabase
        .from('rooms')
        .insert(room)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

/**
 * Hook to update a room
 */
export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: RoomUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

/**
 * Hook to update room status
 */
export function useUpdateRoomStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, status, notes }: { roomId: string; status: RoomStatus; notes?: string }) => {
      const updates: RoomUpdate = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (notes !== undefined) {
        updates.notes = notes;
      }

      if (status === 'available') {
        updates.last_cleaned_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

/**
 * Hook to bulk update room statuses
 */
export function useBulkUpdateRoomStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomIds, status }: { roomIds: string[]; status: RoomStatus }) => {
      const updates: RoomUpdate = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'available') {
        updates.last_cleaned_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .in('id', roomIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

/**
 * Hook to delete a room
 */
export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const { error } = await supabase.from('rooms').delete().eq('id', roomId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
