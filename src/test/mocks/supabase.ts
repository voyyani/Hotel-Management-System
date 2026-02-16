/**
 * Supabase Mock for Testing
 * Provides mock implementations of Supabase client methods
 */

import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'authenticated',
  app_metadata: { role: 'admin' },
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
};

export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

export const mockProfile = {
  id: mockUser.id,
  email: mockUser.email,
  full_name: 'Test User',
  role: 'admin',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const mockRoom = {
  id: 'room-1',
  room_number: '101',
  room_type_id: 'type-1',
  floor: 1,
  status: 'available' as const,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const mockRoomType = {
  id: 'type-1',
  name: 'Deluxe Room',
  description: 'A comfortable deluxe room',
  base_price: 150,
  max_occupancy: 2,
  amenities: ['wifi', 'tv', 'ac'],
  created_at: '2024-01-01T00:00:00.000Z',
};

export const mockGuest = {
  id: 'guest-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  address: '123 Main St',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const mockReservation = {
  id: 'reservation-1',
  guest_id: 'guest-1',
  room_id: 'room-1',
  check_in_date: '2024-01-10',
  check_out_date: '2024-01-15',
  status: 'confirmed' as const,
  total_amount: 750,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Mock Supabase Client
export const createMockSupabaseClient = (): Partial<SupabaseClient> => {
  const mockStorage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
      createSignedUrl: vi.fn().mockResolvedValue({ 
        data: { signedUrl: 'https://example.com/signed-url' }, 
        error: null 
      }),
    }),
  };

  const mockFrom = vi.fn((table: string) => {
    const data = {
      rooms: [mockRoom],
      room_types: [mockRoomType],
      guests: [mockGuest],
      reservations: [mockReservation],
      profiles: [mockProfile],
    }[table] || [];

    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: data[0] || null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: data[0] || null, error: null }),
      then: vi.fn((resolve) => resolve({ data, error: null })),
    };
  });

  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ 
      data: { session: mockSession, user: mockUser }, 
      error: null 
    }),
    signUp: vi.fn().mockResolvedValue({ 
      data: { session: mockSession, user: mockUser }, 
      error: null 
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    updateUser: vi.fn().mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    }),
  };

  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  };

  return {
    from: mockFrom,
    auth: mockAuth as any,
    storage: mockStorage as any,
    channel: vi.fn().mockReturnValue(mockChannel),
  };
};

// Global mock for Supabase client
export const mockSupabaseClient = createMockSupabaseClient();
