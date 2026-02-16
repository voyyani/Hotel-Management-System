-- =====================================================
-- Migration: 00006_configure_realtime.sql
-- Description: Configure Supabase Realtime for live updates
-- Author: Grace Mawia Kamami
-- Date: 2026-02-16
-- Dependencies: 00002_create_tables.sql
-- =====================================================

-- =====================================================
-- ENABLE REALTIME ON ROOMS TABLE
-- =====================================================

-- Enable Realtime replication for rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

COMMENT ON TABLE rooms IS 'Realtime enabled for live room status updates';

-- =====================================================
-- ENABLE REALTIME ON RESERVATIONS TABLE
-- =====================================================

-- Enable Realtime replication for reservations table
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;

COMMENT ON TABLE reservations IS 'Realtime enabled for live reservation updates';

-- =====================================================
-- REALTIME CONFIGURATION NOTES
-- =====================================================

-- The following tables are configured for Realtime subscriptions:
--
-- 1. ROOMS TABLE
--    Use case: Live room status updates for dashboard
--    Subscribe to: Status changes (available, occupied, maintenance, cleaning)
--    Example subscription:
--    ```typescript
--    supabase
--      .channel('rooms-changes')
--      .on('postgres_changes', 
--        { event: '*', schema: 'public', table: 'rooms' },
--        (payload) => console.log('Room changed:', payload)
--      )
--      .subscribe()
--    ```
--
-- 2. RESERVATIONS TABLE
--    Use case: Live reservation updates for front desk
--    Subscribe to: New reservations, status changes
--    Example subscription:
--    ```typescript
--    supabase
--      .channel('reservations-changes')
--      .on('postgres_changes',
--        { event: '*', schema: 'public', table: 'reservations' },
--        (payload) => console.log('Reservation changed:', payload)
--      )
--      .subscribe()
--    ```
--
-- FILTERING OPTIONS:
-- 
-- Filter by specific columns:
-- .on('postgres_changes', 
--   { 
--     event: 'UPDATE', 
--     schema: 'public', 
--     table: 'rooms',
--     filter: 'status=eq.occupied'
--   },
--   handler
-- )
--
-- BEST PRACTICES:
-- 1. Always unsubscribe when component unmounts
-- 2. Use filters to reduce unnecessary updates
-- 3. Handle errors gracefully
-- 4. Consider debouncing rapid updates
-- 5. Use presence for collaborative features
--

-- =====================================================
-- REALTIME BROADCAST EXAMPLE
-- =====================================================

-- For sending custom messages (room cleaning notifications, etc.):
-- 
-- Backend:
-- ```typescript
-- await supabase.channel('housekeeping')
--   .send({
--     type: 'broadcast',
--     event: 'room-cleaned',
--     payload: { room_id: 'uuid', cleaned_by: 'staff-name' }
--   })
-- ```
--
-- Frontend:
-- ```typescript
-- supabase.channel('housekeeping')
--   .on('broadcast', { event: 'room-cleaned' }, (payload) => {
--     console.log('Room cleaned:', payload)
--     // Update UI
--   })
--   .subscribe()
-- ```

-- =====================================================
-- REALTIME PRESENCE EXAMPLE
-- =====================================================

-- For tracking online users (front desk staff, managers):
--
-- ```typescript
-- const channel = supabase.channel('online-users')
-- 
-- // Track user presence
-- channel.on('presence', { event: 'sync' }, () => {
--   const state = channel.presenceState()
--   console.log('Online users:', state)
-- })
-- 
-- // Send presence
-- channel.subscribe(async (status) => {
--   if (status === 'SUBSCRIBED') {
--     await channel.track({
--       user_id: userId,
--       name: userName,
--       role: userRole,
--       online_at: new Date().toISOString()
--     })
--   }
-- })
-- ```

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  -- Check if rooms table is in publication
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'rooms'
  ) THEN
    RAISE NOTICE '✓ Realtime enabled on rooms table';
  ELSE
    RAISE EXCEPTION 'Failed to enable Realtime on rooms table';
  END IF;
  
  -- Check if reservations table is in publication
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'reservations'
  ) THEN
    RAISE NOTICE '✓ Realtime enabled on reservations table';
  ELSE
    RAISE EXCEPTION 'Failed to enable Realtime on reservations table';
  END IF;
  
  RAISE NOTICE '✓ Realtime configuration completed successfully';
END $$;

-- =====================================================
-- REALTIME FILTERS AND SECURITY
-- =====================================================

-- Note: Realtime subscriptions respect RLS policies automatically.
-- Users will only receive updates for rows they have SELECT permission on.
-- This ensures data security even with Realtime enabled.
--
-- Example: A receptionist will only see reservations they have access to
-- based on the RLS policies defined in 00004_create_rls_policies.sql

-- =====================================================
-- PERFORMANCE CONSIDERATIONS
-- =====================================================

-- 1. Realtime sends changes to subscribed clients immediately
-- 2. Use row-level filters to reduce bandwidth
-- 3. Consider connection limits (default: 200 per project)
-- 4. Monitor Realtime usage in Supabase Dashboard
-- 5. Use throttling for high-frequency updates
-- 6. Close unused channels promptly

-- =====================================================
-- MONITORING REALTIME CONNECTIONS
-- =====================================================

-- Query to check active Realtime connections (run in Supabase SQL Editor):
-- SELECT * FROM pg_stat_replication;

-- Query to check publication settings:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
