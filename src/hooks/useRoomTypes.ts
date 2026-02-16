import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type RoomType = Database['public']['Tables']['room_types']['Row'];
type RoomTypeInsert = Database['public']['Tables']['room_types']['Insert'];
type RoomTypeUpdate = Database['public']['Tables']['room_types']['Update'];

/**
 * Hook to fetch all room types
 */
export function useRoomTypes() {
  return useQuery({
    queryKey: ['room-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as RoomType[];
    },
  });
}

/**
 * Hook to fetch active room types only
 */
export function useActiveRoomTypes() {
  return useQuery({
    queryKey: ['room-types', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as RoomType[];
    },
  });
}

/**
 * Hook to fetch a single room type
 */
export function useRoomType(roomTypeId: string | undefined) {
  return useQuery({
    queryKey: ['room-types', roomTypeId],
    queryFn: async () => {
      if (!roomTypeId) throw new Error('Room type ID is required');

      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .eq('id', roomTypeId)
        .single();

      if (error) throw error;
      return data as RoomType;
    },
    enabled: !!roomTypeId,
  });
}

/**
 * Hook to create a new room type
 */
export function useCreateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomType: RoomTypeInsert) => {
      const { data, error } = await supabase
        .from('room_types')
        .insert(roomType)
        .select()
        .single();

      if (error) throw error;
      return data as RoomType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
    },
  });
}

/**
 * Hook to update a room type
 */
export function useUpdateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: RoomTypeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('room_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as RoomType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
    },
  });
}

/**
 * Hook to delete a room type
 */
export function useDeleteRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomTypeId: string) => {
      const { error } = await supabase
        .from('room_types')
        .delete()
        .eq('id', roomTypeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
    },
  });
}

/**
 * Hook to upload room type image
 */
export function useUploadRoomTypeImage() {
  return useMutation({
    mutationFn: async ({ file, roomTypeId }: { file: File; roomTypeId: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${roomTypeId}-${Date.now()}.${fileExt}`;
      const filePath = `room-types/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('room-images')
        .getPublicUrl(filePath);

      return publicUrl;
    },
  });
}
