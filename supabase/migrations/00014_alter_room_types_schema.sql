-- =====================================================
-- Migration: 00014_alter_room_types_schema.sql
-- Description: Update room_types and rooms schema to match application types
-- Author: Grace Mawia Kamami
-- Date: 2026-02-17
-- Dependencies: 00002_create_tables.sql
-- =====================================================

-- =====================================================
-- ALTER ROOM_TYPES TABLE
-- =====================================================

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add max_adults column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'room_types' AND column_name = 'max_adults') THEN
    ALTER TABLE room_types ADD COLUMN max_adults INTEGER;
  END IF;
  
  -- Add max_children column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'room_types' AND column_name = 'max_children') THEN
    ALTER TABLE room_types ADD COLUMN max_children INTEGER DEFAULT 0;
  END IF;
  
  -- Add image_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'room_types' AND column_name = 'image_url') THEN
    ALTER TABLE room_types ADD COLUMN image_url TEXT;
  END IF;
  
  -- Add created_by column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'room_types' AND column_name = 'created_by') THEN
    ALTER TABLE room_types ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Set default values for existing records if columns are empty
UPDATE room_types 
SET 
  max_adults = COALESCE(max_adults, 2),
  max_children = COALESCE(max_children, 1)
WHERE max_adults IS NULL OR max_children IS NULL;

-- Add constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_max_adults') THEN
    ALTER TABLE room_types ADD CONSTRAINT check_max_adults CHECK (max_adults > 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_max_children') THEN
    ALTER TABLE room_types ADD CONSTRAINT check_max_children CHECK (max_children >= 0);
  END IF;
END $$;

-- Set NOT NULL constraints after data migration
DO $$
BEGIN
  ALTER TABLE room_types ALTER COLUMN max_adults SET NOT NULL;
  ALTER TABLE room_types ALTER COLUMN max_children SET NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not set NOT NULL constraints. Check for NULL values.';
END $$;

-- Add comments
COMMENT ON COLUMN room_types.max_adults IS 'Maximum number of adults allowed';
COMMENT ON COLUMN room_types.max_children IS 'Maximum number of children allowed';
COMMENT ON COLUMN room_types.image_url IS 'Primary image URL for this room type';

-- =====================================================
-- ALTER ROOMS TABLE
-- =====================================================

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'rooms' AND column_name = 'is_active') THEN
    ALTER TABLE rooms ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  
  -- Add created_by column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'rooms' AND column_name = 'created_by') THEN
    ALTER TABLE rooms ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Set is_active to true for all existing rooms
UPDATE rooms 
SET is_active = true 
WHERE is_active IS NULL;

-- Add NOT NULL constraint after setting default values
DO $$
BEGIN
  ALTER TABLE rooms ALTER COLUMN is_active SET NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not set NOT NULL constraint on is_active. Check for NULL values.';
END $$;

-- =====================================================
-- UPDATE FUNCTIONS
-- =====================================================

-- Drop existing function first (needed when changing return type)
DROP FUNCTION IF EXISTS find_available_rooms(DATE, DATE, UUID, INTEGER);

-- Recreate find_available_rooms function with new signature
CREATE OR REPLACE FUNCTION find_available_rooms(
  p_check_in DATE,
  p_check_out DATE,
  p_room_type_id UUID DEFAULT NULL,
  p_min_occupancy INTEGER DEFAULT 1
)
RETURNS TABLE (
  id UUID,
  room_number VARCHAR(20),
  room_type_name VARCHAR(100),
  floor INTEGER,
  base_price DECIMAL(10,2),
  max_adults INTEGER,
  max_children INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.room_number,
    rt.name,
    r.floor,
    rt.base_price,
    rt.max_adults,
    rt.max_children
  FROM rooms r
  JOIN room_types rt ON rt.id = r.room_type_id
  WHERE r.status = 'available'
  AND r.is_active = true
  AND rt.is_active = true
  AND (rt.max_adults + rt.max_children) >= p_min_occupancy
  AND (p_room_type_id IS NULL OR r.room_type_id = p_room_type_id)
  AND check_room_availability(r.id, p_check_in, p_check_out)
  ORDER BY rt.base_price ASC, r.room_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update calculate_reservation_total function
CREATE OR REPLACE FUNCTION calculate_reservation_total(
  p_room_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_num_adults INTEGER DEFAULT 1,
  p_num_children INTEGER DEFAULT 0
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_base_price DECIMAL(10,2);
  v_num_nights INTEGER;
  v_max_adults INTEGER;
  v_max_children INTEGER;
  v_total DECIMAL(10,2);
  v_extra_person_charge DECIMAL(10,2) := 20.00; -- $20 per extra person per night
BEGIN
  -- Get room type details
  SELECT 
    rt.base_price,
    rt.max_adults,
    rt.max_children
  INTO v_base_price, v_max_adults, v_max_children
  FROM rooms r
  JOIN room_types rt ON rt.id = r.room_type_id
  WHERE r.id = p_room_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found: %', p_room_id;
  END IF;
  
  -- Calculate number of nights
  v_num_nights := p_check_out - p_check_in;
  
  IF v_num_nights <= 0 THEN
    RAISE EXCEPTION 'Check-out date must be after check-in date';
  END IF;
  
  -- Validate occupancy
  IF p_num_adults > v_max_adults OR p_num_children > v_max_children THEN
    RAISE EXCEPTION 'Guest count exceeds room capacity (Max: % adults, % children)', 
      v_max_adults, v_max_children;
  END IF;
  
  -- Base calculation: base_price * num_nights
  v_total := v_base_price * v_num_nights;
  
  -- Add extra person charge if more than 2 adults
  IF p_num_adults > 2 THEN
    v_total := v_total + ((p_num_adults - 2) * v_extra_person_charge * v_num_nights);
  END IF;
  
  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Verify max_adults column exists
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'room_types' AND column_name = 'max_adults';
  
  ASSERT v_count = 1, 'max_adults column not found in room_types';
  
  -- Verify max_children column exists
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'room_types' AND column_name = 'max_children';
  
  ASSERT v_count = 1, 'max_children column not found in room_types';
  
  -- Verify old columns are dropped
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'room_types' AND column_name = 'max_occupancy';
  
  ASSERT v_count = 0, 'max_occupancy column should be dropped';
  
  -- Verify rooms.is_active column exists
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'rooms' AND column_name = 'is_active';
  
  ASSERT v_count = 1, 'is_active column not found in rooms';
  
  RAISE NOTICE '✓ Schema migration completed successfully';
  RAISE NOTICE '✓ room_types now has max_adults and max_children columns';
  RAISE NOTICE '✓ rooms now has is_active column';
END $$;
