/**
 * useSystemSettings Hook
 * 
 * Manages system-wide settings and hotel configuration.
 * Provides methods to fetch and update hotel branding and information.
 * 
 * @module hooks/useSystemSettings
 * @author Grace Mawia Kamami
 * @date 2026-02-17
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SystemSettings {
  id: string;
  hotel_name: string;
  hotel_email: string | null;
  hotel_phone: string | null;
  hotel_address: string | null;
  hotel_city: string | null;
  hotel_state: string | null;
  hotel_country: string | null;
  hotel_postal_code: string | null;
  hotel_website: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  tax_id: string | null;
  registration_number: string | null;
  support_email: string | null;
  support_phone: string | null;
  is_configured: boolean;
  configured_at: string | null;
  configured_by: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface SystemSettingsInput {
  hotel_name: string;
  hotel_email?: string;
  hotel_phone?: string;
  hotel_address?: string;
  hotel_city?: string;
  hotel_state?: string;
  hotel_country?: string;
  hotel_postal_code?: string;
  hotel_website?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tax_id?: string;
  registration_number?: string;
  support_email?: string;
  support_phone?: string;
}

/**
 * Hook for managing system settings
 */
export function useSystemSettings() {
  const queryClient = useQueryClient();

  // Fetch system settings
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (not an error for us)
        throw error;
      }
      
      return data as SystemSettings | null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - settings don't change often
  });

  // Check if system is configured
  const isConfigured = settings?.is_configured ?? false;

  // Update/Create system settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (input: SystemSettingsInput) => {
      const { data, error } = await supabase.rpc('upsert_system_settings', {
        p_hotel_name: input.hotel_name,
        p_hotel_email: input.hotel_email || null,
        p_hotel_phone: input.hotel_phone || null,
        p_hotel_address: input.hotel_address || null,
        p_hotel_city: input.hotel_city || null,
        p_hotel_state: input.hotel_state || null,
        p_hotel_country: input.hotel_country || null,
        p_hotel_postal_code: input.hotel_postal_code || null,
        p_hotel_website: input.hotel_website || null,
        p_logo_url: input.logo_url || null,
        p_primary_color: input.primary_color || null,
        p_secondary_color: input.secondary_color || null,
        p_tax_id: input.tax_id || null,
        p_registration_number: input.registration_number || null,
        p_support_email: input.support_email || null,
        p_support_phone: input.support_phone || null,
      });

      if (error) throw error;
      return data as SystemSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });

  return {
    // Data
    settings,
    isConfigured,
    isLoading,
    error,
    
    // Actions
    updateSettings: updateSettingsMutation.mutateAsync,
    refetch,
    
    // Loading states
    isUpdating: updateSettingsMutation.isPending,
    
    // Convenience getters
    hotelName: settings?.hotel_name || 'Hotel Management System',
    hotelEmail: settings?.hotel_email || null,
    hotelPhone: settings?.hotel_phone || null,
    hotelAddress: settings?.hotel_address || null,
    primaryColor: settings?.primary_color || '#4F46E5',
    secondaryColor: settings?.secondary_color || '#7C3AED',
  };
}
