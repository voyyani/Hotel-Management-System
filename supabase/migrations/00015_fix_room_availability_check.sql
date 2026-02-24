-- Migration: Fix room availability check to validate individual guest counts
-- Description: Update find_available_rooms function to properly check max_adults and max_children separately
-- Date: 2026-02-24

-- Drop the existing function
DROP FUNCTION IF EXISTS find_available_rooms(DATE, DATE, UUID, INTEGER);

-- Recreate find_available_rooms function with separate adult and child parameters
CREATE OR REPLACE FUNCTION find_available_rooms(
  p_check_in DATE,
  p_check_out DATE,
  p_room_type_id UUID DEFAULT NULL,
  p_num_adults INTEGER DEFAULT 1,
  p_num_children INTEGER DEFAULT 0
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
  -- Check individual capacity limits
  AND rt.max_adults >= p_num_adults
  AND rt.max_children >= p_num_children
  AND (p_room_type_id IS NULL OR r.room_type_id = p_room_type_id)
  AND check_room_availability(r.id, p_check_in, p_check_out)
  ORDER BY rt.base_price ASC, r.room_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION find_available_rooms IS 'Find available rooms that can accommodate the specified number of adults and children';
