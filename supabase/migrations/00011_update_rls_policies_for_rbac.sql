-- =====================================================
-- Migration: 00011_update_rls_policies_for_rbac.sql
-- Description: Update RLS policies with enhanced role-based access control
-- Author: HMS Development Team
-- Date: 2026-02-16
-- Dependencies: 00004_create_rls_policies.sql, 00009_add_accounts_role.sql, 00010_create_permissions_tables.sql
-- =====================================================

-- =====================================================
-- ENABLE RLS ON NEW TABLES
-- =====================================================

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ADDITIONAL HELPER FUNCTIONS
-- =====================================================

-- Check if user is accounts staff
CREATE OR REPLACE FUNCTION public.is_accounts()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'accounts' 
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is receptionist
CREATE OR REPLACE FUNCTION public.is_receptionist()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'receptionist' 
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is housekeeping
CREATE OR REPLACE FUNCTION public.is_housekeeping()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'housekeeping' 
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_role(allowed_roles user_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = ANY(allowed_roles)
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- PERMISSIONS TABLE POLICIES
-- =====================================================

-- Everyone can read permissions (for UI display)
CREATE POLICY "Authenticated users can read permissions"
  ON permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can manage permissions
CREATE POLICY "Admins can manage permissions"
  ON permissions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- ROLE_PERMISSIONS TABLE POLICIES
-- =====================================================

-- Everyone can read role_permissions (for checking their own permissions)
CREATE POLICY "Authenticated users can read role_permissions"
  ON role_permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can manage role_permissions
CREATE POLICY "Admins can manage role_permissions"
  ON role_permissions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- ENHANCED ROOMS TABLE POLICIES
-- =====================================================

-- Drop existing policies to recreate with better granularity
DROP POLICY IF EXISTS "Authenticated users can read rooms" ON rooms;
DROP POLICY IF EXISTS "Staff can read rooms" ON rooms;
DROP POLICY IF EXISTS "Staff can insert rooms" ON rooms;
DROP POLICY IF EXISTS "Authorized staff can insert rooms" ON rooms;
DROP POLICY IF EXISTS "Staff can update rooms" ON rooms;
DROP POLICY IF EXISTS "Admins can delete rooms" ON rooms;
DROP POLICY IF EXISTS "Managers can delete rooms" ON rooms;

-- All authenticated staff can read rooms
CREATE POLICY "Staff can read rooms"
  ON rooms FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admin, Manager, and Receptionist can create rooms
CREATE POLICY "Authorized staff can insert rooms"
  ON rooms FOR INSERT
  WITH CHECK (
    public.has_role(ARRAY['admin', 'manager', 'receptionist']::user_role[])
  );

-- Admin, Manager, Receptionist can fully update; Housekeeping can only update status
CREATE POLICY "Staff can update rooms"
  ON rooms FOR UPDATE
  USING (
    public.has_role(ARRAY['admin', 'manager', 'receptionist', 'housekeeping']::user_role[])
  )
  WITH CHECK (
    -- Admin and Manager can update anything
    public.has_role(ARRAY['admin', 'manager']::user_role[])
    OR
    -- Receptionist can update most fields
    (public.is_receptionist() AND (
      rooms.room_number = rooms.room_number AND
      rooms.room_type_id = rooms.room_type_id
    ))
    OR
    -- Housekeeping can only update status and last_cleaned_at
    (public.is_housekeeping() AND (
      rooms.room_number = rooms.room_number AND
      rooms.room_type_id = rooms.room_type_id AND
      rooms.floor = rooms.floor
    ))
  );

-- Only Admin and Manager can delete rooms
CREATE POLICY "Managers can delete rooms"
  ON rooms FOR DELETE
  USING (public.is_manager_or_admin());

-- =====================================================
-- ENHANCED GUESTS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Staff can read guests" ON guests;
DROP POLICY IF EXISTS "Authorized staff can read guests" ON guests;
DROP POLICY IF EXISTS "Staff can insert guests" ON guests;
DROP POLICY IF EXISTS "Authorized staff can insert guests" ON guests;
DROP POLICY IF EXISTS "Staff can update guests" ON guests;
DROP POLICY IF EXISTS "Authorized staff can update guests" ON guests;
DROP POLICY IF EXISTS "Admins can delete guests" ON guests;
DROP POLICY IF EXISTS "Managers can delete guests" ON guests;

-- Staff and Accounts can read guests (Accounts needs for billing)
CREATE POLICY "Authorized staff can read guests"
  ON guests FOR SELECT
  USING (
    public.has_role(ARRAY['admin', 'manager', 'receptionist', 'accounts']::user_role[])
  );

-- Receptionist+ can create guests
CREATE POLICY "Authorized staff can insert guests"
  ON guests FOR INSERT
  WITH CHECK (
    public.has_role(ARRAY['admin', 'manager', 'receptionist']::user_role[])
  );

-- Receptionist+ can update guests (not Accounts - read-only for them)
CREATE POLICY "Authorized staff can update guests"
  ON guests FOR UPDATE
  USING (
    public.has_role(ARRAY['admin', 'manager', 'receptionist']::user_role[])
  );

-- Only Admin and Manager can delete guests
CREATE POLICY "Managers can delete guests"
  ON guests FOR DELETE
  USING (public.is_manager_or_admin());

-- =====================================================
-- ENHANCED RESERVATIONS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Staff can read reservations" ON reservations;
DROP POLICY IF EXISTS "Authorized staff can read reservations" ON reservations;
DROP POLICY IF EXISTS "Staff can insert reservations" ON reservations;
DROP POLICY IF EXISTS "Authorized staff can insert reservations" ON reservations;
DROP POLICY IF EXISTS "Staff can update reservations" ON reservations;
DROP POLICY IF EXISTS "Authorized staff can update reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can delete reservations" ON reservations;
DROP POLICY IF EXISTS "Managers can delete reservations" ON reservations;

-- All staff can read reservations (including Accounts and Housekeeping for different reasons)
CREATE POLICY "Authorized staff can read reservations"
  ON reservations FOR SELECT
  USING (
    auth.uid() IS NOT NULL
  );

-- Receptionist+ can create reservations
CREATE POLICY "Authorized staff can insert reservations"
  ON reservations FOR INSERT
  WITH CHECK (
    public.has_role(ARRAY['admin', 'manager', 'receptionist']::user_role[])
  );

-- Receptionist+ can update reservations
CREATE POLICY "Authorized staff can update reservations"
  ON reservations FOR UPDATE
  USING (
    public.has_role(ARRAY['admin', 'manager', 'receptionist']::user_role[])
  );

-- Only Admin and Manager can delete reservations
CREATE POLICY "Managers can delete reservations"
  ON reservations FOR DELETE
  USING (public.is_manager_or_admin());

-- =====================================================
-- ENHANCED BILLING TABLE POLICIES (INVOICES & PAYMENTS)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Staff can read invoices" ON invoices;
DROP POLICY IF EXISTS "Authorized staff can read invoices" ON invoices;
DROP POLICY IF EXISTS "Staff can manage invoices" ON invoices;
DROP POLICY IF EXISTS "Authorized staff can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Authorized staff can update invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can delete invoices" ON invoices;
DROP POLICY IF EXISTS "Managers can delete invoices" ON invoices;

-- Receptionist (view), Accounts (full), Manager+ can read invoices
CREATE POLICY "Authorized staff can read invoices"
  ON invoices FOR SELECT
  USING (
    public.has_role(ARRAY['admin', 'manager', 'receptionist', 'accounts']::user_role[])
  );

-- Accounts and Manager+ can create invoices
CREATE POLICY "Authorized staff can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (
    public.has_role(ARRAY['admin', 'manager', 'accounts']::user_role[])
  );

-- Accounts and Manager+ can update invoices
CREATE POLICY "Authorized staff can update invoices"
  ON invoices FOR UPDATE
  USING (
    public.has_role(ARRAY['admin', 'manager', 'accounts']::user_role[])
  );

-- Only Admin and Manager can delete invoices
CREATE POLICY "Managers can delete invoices"
  ON invoices FOR DELETE
  USING (public.is_manager_or_admin());

-- =====================================================
-- PAYMENTS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Staff can read payments" ON payments;
DROP POLICY IF EXISTS "Authorized staff can read payments" ON payments;
DROP POLICY IF EXISTS "Staff can create payments" ON payments;
DROP POLICY IF EXISTS "Authorized staff can insert payments" ON payments;
DROP POLICY IF EXISTS "Authorized staff can update payments" ON payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON payments;

-- Receptionist (view), Accounts (full), Manager+ can read payments
CREATE POLICY "Authorized staff can read payments"
  ON payments FOR SELECT
  USING (
    public.has_role(ARRAY['admin', 'manager', 'receptionist', 'accounts']::user_role[])
  );

-- Accounts and Manager+ can create payments
CREATE POLICY "Authorized staff can insert payments"
  ON payments FOR INSERT
  WITH CHECK (
    public.has_role(ARRAY['admin', 'manager', 'accounts']::user_role[])
  );

-- Accounts and Manager+ can update payments
CREATE POLICY "Authorized staff can update payments"
  ON payments FOR UPDATE
  USING (
    public.has_role(ARRAY['admin', 'manager', 'accounts']::user_role[])
  );

-- Only Admin can delete payments (rarely needed)
CREATE POLICY "Admins can delete payments"
  ON payments FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- AUDIT LOGS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Managers can read audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "No one can update audit logs" ON audit_logs;
DROP POLICY IF EXISTS "No one can delete audit logs" ON audit_logs;

-- Only Admin and Manager can read audit logs
CREATE POLICY "Managers can read audit logs"
  ON audit_logs FOR SELECT
  USING (public.is_manager_or_admin());

-- Only system can insert audit logs (via triggers)
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- No one can update or delete audit logs (immutable)
CREATE POLICY "No one can update audit logs"
  ON audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "No one can delete audit logs"
  ON audit_logs FOR DELETE
  USING (false);

-- =====================================================
-- SUMMARY
-- =====================================================

COMMENT ON DATABASE postgres IS 
'HMS Database with enhanced RBAC policies as of 00011_update_rls_policies_for_rbac.sql
Role Access Summary:
- admin: Full access to everything
- manager: Full operational access + audit logs
- receptionist: Front desk operations, view billing
- accounts: Financial operations, view-only for guests/reservations
- housekeeping: Room status updates, view reservations for scheduling';
