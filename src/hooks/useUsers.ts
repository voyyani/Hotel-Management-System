/**
 * useUsers Hook
 * 
 * Manages user operations for admin user management.
 * Handles fetching, creating, updating, and deactivating users.
 * 
 * @module hooks/useUsers
 * @author Grace Mawia Kamami
 * @date 2026-02-17
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types/database';

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserData {
  full_name?: string;
  role?: UserRole;
  phone?: string;
  is_active?: boolean;
}

/**
 * Hook for managing users (admin functions)
 */
export function useUsers() {
  const queryClient = useQueryClient();

  // Fetch all users
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });

  // Create new user (admin only - uses Supabase service role)
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      // Temporary workaround: Create user using standard signup
      // In production, this should use Supabase Admin API via backend
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
          },
          emailRedirectTo: undefined, // Don't send confirmation email
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Update the profile with the specified role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: userData.role,
          phone: userData.phone || null,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Update user
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: UpdateUserData }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Delete/Deactivate user (soft delete)
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Reactivate user
  const reactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Reset user password (admin)
  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    },
  });

  return {
    // Data
    users,
    isLoading,
    error,
    refetch,

    // Mutations
    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deactivateUser: deactivateUserMutation.mutateAsync,
    reactivateUser: reactivateUserMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,

    // Loading states
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeactivating: deactivateUserMutation.isPending,
    isReactivating: reactivateUserMutation.isPending,
    isResetting: resetPasswordMutation.isPending,
  };
}
