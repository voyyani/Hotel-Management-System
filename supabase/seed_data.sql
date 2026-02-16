-- =====================================================
-- Seed Data: seed_data.sql
-- Description: Seed data for development and testing
-- Author: Grace Mawia Kamami
-- Date: 2026-02-16
-- Usage: Run after all migrations are applied
-- =====================================================

-- =====================================================
-- SEED ROOM TYPES
-- =====================================================

INSERT INTO room_types (id, name, description, base_price, max_occupancy, amenities, image_urls) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Standard Room',
  'Comfortable room with essential amenities, perfect for budget-conscious travelers.',
  80.00,
  2,
  '["Free WiFi", "Air Conditioning", "Flat-screen TV", "Private Bathroom", "Daily Housekeeping"]'::jsonb,
  ARRAY['https://placehold.co/800x600/e0e7ff/4f46e5?text=Standard+Room']
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Deluxe Room',
  'Spacious room with premium amenities and modern furnishings.',
  120.00,
  2,
  '["Free WiFi", "Air Conditioning", "Smart TV", "Mini-bar", "Work Desk", "Coffee Maker", "Private Bathroom", "Daily Housekeeping"]'::jsonb,
  ARRAY['https://placehold.co/800x600/e0e7ff/4f46e5?text=Deluxe+Room']
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Executive Suite',
  'Luxurious suite with separate living area, perfect for business travelers.',
  200.00,
  3,
  '["Free WiFi", "Air Conditioning", "Smart TV", "Mini-bar", "Work Desk", "Coffee Maker", "Living Area", "King Bed", "Private Bathroom", "Bathtub", "Daily Housekeeping", "Room Service"]'::jsonb,
  ARRAY['https://placehold.co/800x600/e0e7ff/4f46e5?text=Executive+Suite']
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Family Room',
  'Spacious room with multiple beds, ideal for families with children.',
  150.00,
  4,
  '["Free WiFi", "Air Conditioning", "Smart TV", "Mini-bar", "Coffee Maker", "2 Queen Beds", "Private Bathroom", "Daily Housekeeping", "Kids Amenities"]'::jsonb,
  ARRAY['https://placehold.co/800x600/e0e7ff/4f46e5?text=Family+Room']
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  'Presidential Suite',
  'Ultimate luxury with panoramic views, private balcony, and VIP services.',
  400.00,
  4,
  '["Free WiFi", "Air Conditioning", "Smart TV", "Full Bar", "Work Desk", "Coffee Maker", "Living Area", "Dining Area", "King Bed", "Private Bathroom", "Jacuzzi", "Private Balcony", "Ocean View", "24/7 Butler Service", "Daily Housekeeping"]'::jsonb,
  ARRAY['https://placehold.co/800x600/e0e7ff/4f46e5?text=Presidential+Suite']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED ROOMS (50 rooms across 5 floors)
-- =====================================================

-- Generate 10 Standard Rooms (Floor 1-2)
INSERT INTO rooms (room_number, room_type_id, floor, status, features) 
SELECT 
  '1' || LPAD((generate_series)::text, 2, '0'),
  '550e8400-e29b-41d4-a716-446655440001',
  CASE WHEN generate_series <= 5 THEN 1 ELSE 2 END,
  'available',
  CASE 
    WHEN generate_series % 2 = 0 THEN '{"view": "street"}'::jsonb
    ELSE '{"view": "courtyard"}'::jsonb
  END
FROM generate_series(1, 10)
ON CONFLICT (room_number) DO NOTHING;

-- Generate 15 Deluxe Rooms (Floor 2-3)
INSERT INTO rooms (room_number, room_type_id, floor, status, features)
SELECT 
  '2' || LPAD((generate_series)::text, 2, '0'),
  '550e8400-e29b-41d4-a716-446655440002',
  CASE WHEN generate_series <= 7 THEN 2 ELSE 3 END,
  'available',
  CASE 
    WHEN generate_series % 3 = 0 THEN '{"view": "ocean", "balcony": true}'::jsonb
    WHEN generate_series % 3 = 1 THEN '{"view": "garden"}'::jsonb
    ELSE '{"view": "street"}'::jsonb
  END
FROM generate_series(1, 15)
ON CONFLICT (room_number) DO NOTHING;

-- Generate 10 Executive Suites (Floor 3-4)
INSERT INTO rooms (room_number, room_type_id, floor, status, features)
SELECT 
  '3' || LPAD((generate_series)::text, 2, '0'),
  '550e8400-e29b-41d4-a716-446655440003',
  CASE WHEN generate_series <= 5 THEN 3 ELSE 4 END,
  'available',
  '{"view": "ocean", "balcony": true, "corner_unit": true}'::jsonb
FROM generate_series(1, 10)
ON CONFLICT (room_number) DO NOTHING;

-- Generate 10 Family Rooms (Floor 4)
INSERT INTO rooms (room_number, room_type_id, floor, status, features)
SELECT 
  '4' || LPAD((generate_series)::text, 2, '0'),
  '550e8400-e29b-41d4-a716-446655440004',
  4,
  'available',
  CASE 
    WHEN generate_series % 2 = 0 THEN '{"view": "pool", "connecting_room_available": true}'::jsonb
    ELSE '{"view": "garden"}'::jsonb
  END
FROM generate_series(1, 10)
ON CONFLICT (room_number) DO NOTHING;

-- Generate 5 Presidential Suites (Floor 5 - Penthouse)
INSERT INTO rooms (room_number, room_type_id, floor, status, features)
SELECT 
  'P' || generate_series::text,
  '550e8400-e29b-41d4-a716-446655440005',
  5,
  'available',
  jsonb_build_object(
    'view', 'panoramic_ocean',
    'balcony', true,
    'private_elevator', true,
    'corner_unit', true,
    'square_feet', 1200
  )
FROM generate_series(1, 5)
ON CONFLICT (room_number) DO NOTHING;

-- Set some rooms to different statuses for testing
UPDATE rooms SET status = 'cleaning' WHERE room_number IN ('102', '202');
UPDATE rooms SET status = 'maintenance' WHERE room_number = '103';
UPDATE rooms SET last_cleaned_at = now() - INTERVAL '2 hours' WHERE status = 'available';

-- =====================================================
-- SEED ADMIN USER PROFILE (For testing)
-- =====================================================

-- NOTE: Cannot create profiles without corresponding auth.users entries
-- You must first create a user through Supabase Auth (Dashboard or signup)
-- Then uncomment and run the sections below with the real user UUID

-- STEP 1: Create your first admin user via Supabase Dashboard:
--   1. Go to Authentication > Users
--   2. Click "Add User" 
--   3. Enter email (e.g., admin@hotel.test) and password
--   4. After creation, copy the User UID
--   5. Update the profile role to 'admin' using:
--      UPDATE profiles SET role = 'admin' WHERE id = 'YOUR-USER-UUID';

-- =====================================================
-- SEED GUESTS (Sample test data)
-- =====================================================

-- NOTE: In production, guest data comes from check-ins
-- This is sample data for testing purposes only

INSERT INTO guests (id, first_name, last_name, email, phone, nationality, preferences) VALUES
(
  '650e8400-e29b-41d4-a716-446655440001',
  'John',
  'Smith',
  'john.smith@example.com',
  '+1-555-0101',
  'United States',
  '{"floor_preference": "high", "pillow_type": "soft", "room_type": "ocean_view"}'::jsonb
),
(
  '650e8400-e29b-41d4-a716-446655440002',
  'Sarah',
  'Johnson',
  'sarah.j@example.com',
  '+1-555-0102',
  'United States',
  '{"floor_preference": "low", "pillow_type": "firm", "dietary_restrictions": ["vegetarian"]}'::jsonb
),
(
  '650e8400-e29b-41d4-a716-446655440003',
  'Michael',
  'Chen',
  'mchen@example.com',
  '+86-138-0000-0001',
  'China',
  '{"floor_preference": "high", "smoking": false, "wake_up_call": "07:00"}'::jsonb
),
(
  '650e8400-e29b-41d4-a716-446655440004',
  'Emma',
  'Williams',
  'emma.w@example.com',
  '+44-7700-900001',
  'United Kingdom',
  '{"floor_preference": "any", "pillow_type": "medium", "extra_towels": true}'::jsonb
),
(
  '650e8400-e29b-41d4-a716-446655440005',
  'Carlos',
  'Rodriguez',
  'carlos.r@example.com',
  '+34-600-000-001',
  'Spain',
  '{"floor_preference": "high", "late_checkout": true, "quiet_room": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED RESERVATIONS (Sample bookings)
-- =====================================================

-- NOTE: Reservations require a valid user ID for the created_by field
-- After creating your first admin user, uncomment and run this section
-- Replace 'YOUR-USER-UUID' with your actual user ID from auth.users

/*
-- Current/Active Reservations
INSERT INTO reservations (
  guest_id, 
  room_id, 
  check_in_date, 
  check_out_date, 
  num_adults, 
  num_children, 
  status, 
  special_requests,
  created_by
) VALUES
-- Room 101 - Checked in
(
  '650e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM rooms WHERE room_number = '101'),
  CURRENT_DATE - 1,
  CURRENT_DATE + 2,
  2,
  0,
  'checked_in',
  'Late checkout requested',
  'YOUR-USER-UUID'  -- Replace with your actual user UUID
),
-- Room 302 - Checked in (Executive Suite for family with child)
(
  '650e8400-e29b-41d4-a716-446655440002',
  (SELECT id FROM rooms WHERE room_number = '302'),
  CURRENT_DATE,
  CURRENT_DATE + 3,
  2,
  1,
  'checked_in',
  'Crib needed for infant',
  'YOUR-USER-UUID'  -- Replace with your actual user UUID
),
-- Room 301 - Checked in
(
  '650e8400-e29b-41d4-a716-446655440003',
  (SELECT id FROM rooms WHERE room_number = '301'),
  CURRENT_DATE - 2,
  CURRENT_DATE + 1,
  1,
  0,
  'checked_in',
  'Business traveler - quiet room',
  'YOUR-USER-UUID'  -- Replace with your actual user UUID
),
-- Future Reservations
(
  '650e8400-e29b-41d4-a716-446655440004',
  (SELECT id FROM rooms WHERE room_number = '401'),
  CURRENT_DATE + 3,
  CURRENT_DATE + 7,
  2,
  2,
  'confirmed',
  'Connecting rooms preferred',
  'YOUR-USER-UUID'  -- Replace with your actual user UUID
),
(
  '650e8400-e29b-41d4-a716-446655440005',
  (SELECT id FROM rooms WHERE room_number = 'P1'),
  CURRENT_DATE + 7,
  CURRENT_DATE + 10,
  2,
  0,
  'confirmed',
  'Anniversary celebration - champagne and flowers',
  'YOUR-USER-UUID'  -- Replace with your actual user UUID
);

-- After running reservations, update room statuses
UPDATE rooms SET status = 'occupied' WHERE room_number IN ('101', '302', '301');
*/

-- =====================================================
-- STATISTICS & SUMMARY
-- =====================================================

DO $$
DECLARE
  v_room_types_count INTEGER;
  v_rooms_count INTEGER;
  v_guests_count INTEGER;
  v_reservations_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_room_types_count FROM room_types;
  SELECT COUNT(*) INTO v_rooms_count FROM rooms;
  SELECT COUNT(*) INTO v_guests_count FROM guests;
  SELECT COUNT(*) INTO v_reservations_count FROM reservations;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '       SEED DATA SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Room Types:    % (Standard, Deluxe, Executive, Family, Presidential)', v_room_types_count;
  RAISE NOTICE 'Rooms:         % (Distributed across 5 floors)', v_rooms_count;
  RAISE NOTICE 'Guests:        % (Sample test data)', v_guests_count;
  RAISE NOTICE 'Reservations:  % (Create admin user and uncomment reservation seed data)', v_reservations_count;
  RAISE NOTICE '';
  RAISE NOTICE '✓ Seed data loaded successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Create admin user via Supabase Dashboard';
  RAISE NOTICE '2. Update profile role to admin';
  RAISE NOTICE '3. Uncomment and run reservation seed data';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- ROOM STATUS SUMMARY
-- =====================================================

DO $$
DECLARE
  v_available INTEGER;
  v_occupied INTEGER;
  v_cleaning INTEGER;
  v_maintenance INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_available FROM rooms WHERE status = 'available';
  SELECT COUNT(*) INTO v_occupied FROM rooms WHERE status = 'occupied';
  SELECT COUNT(*) INTO v_cleaning FROM rooms WHERE status = 'cleaning';
  SELECT COUNT(*) INTO v_maintenance FROM rooms WHERE status = 'maintenance';
  
  RAISE NOTICE 'Room Status Breakdown:';
  RAISE NOTICE '  Available:   %', v_available;
  RAISE NOTICE '  Occupied:    %', v_occupied;
  RAISE NOTICE '  Cleaning:    %', v_cleaning;
  RAISE NOTICE '  Maintenance: %', v_maintenance;
  RAISE NOTICE '';
END $$;

-- =====================================================
-- NEXT STEPS
-- =====================================================

-- After running seed data:
--
-- 1. Create your first admin user:
--    - Go to Supabase Dashboard > Authentication > Users
--    - Click "Add User" and create a new user
--    - Copy the User UID after creation
--
-- 2. Update the user's profile role to admin:
--    UPDATE profiles SET role = 'admin' WHERE id = 'YOUR-USER-UUID';
--
-- 3. Uncomment and run the reservations seed data section above
--    (Replace 'YOUR-USER-UUID' with your actual user UUID)
--
-- 4. Test room availability function:
--    SELECT * FROM find_available_rooms(CURRENT_DATE + 1, CURRENT_DATE + 4);
--
-- 5. Test double booking prevention by trying to book the same room twice
--
-- 6. Monitor Realtime updates on rooms table via your application
