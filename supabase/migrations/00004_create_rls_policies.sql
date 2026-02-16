-- =====================================================
-- Migration: 00004_create_rls_policies.sql
-- Description: Row-Level Security policies for all tables
-- Author: Grace Mawia Kamami
-- Date: 2026-02-16
-- Dependencies: 00002_create_tables.sql
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is manager or admin
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager') 
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Everyone can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Only admins can insert new profiles
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can delete profiles (soft delete via is_active preferred)
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- ROOM_TYPES TABLE POLICIES
-- =====================================================

-- Everyone (authenticated) can read active room types
CREATE POLICY "Authenticated users can read active room types"
  ON room_types FOR SELECT
  USING (is_active = true OR public.is_manager_or_admin());

-- Managers and admins can manage room types
CREATE POLICY "Managers can manage room types"
  ON room_types FOR ALL
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

-- =====================================================
-- ROOMS TABLE POLICIES
-- =====================================================

-- Everyone (authenticated) can read rooms
CREATE POLICY "Authenticated users can read rooms"
  ON rooms FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Receptionists+ can insert rooms
CREATE POLICY "Staff can insert rooms"
  ON rooms FOR INSERT
  WITH CHECK (
    public.user_role() IN ('admin', 'manager', 'receptionist')
  );

-- Receptionists+ can update rooms
CREATE POLICY "Staff can update rooms"
  ON rooms FOR UPDATE
  USING (
    public.user_role() IN ('admin', 'manager', 'receptionist', 'housekeeping')
  );

-- Only admins can delete rooms
CREATE POLICY "Admins can delete rooms"
  ON rooms FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- GUESTS TABLE POLICIES
-- =====================================================

-- Authenticated users can read guests
CREATE POLICY "Staff can read guests"
  ON guests FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Receptionists+ can create guests
CREATE POLICY "Staff can insert guests"
  ON guests FOR INSERT
  WITH CHECK (
    public.user_role() IN ('admin', 'manager', 'receptionist')
  );

-- Receptionists+ can update guests
CREATE POLICY "Staff can update guests"
  ON guests FOR UPDATE
  USING (
    public.user_role() IN ('admin', 'manager', 'receptionist')
  );

-- Managers+ can delete guests
CREATE POLICY "Managers can delete guests"
  ON guests FOR DELETE
  USING (public.is_manager_or_admin());

-- =====================================================
-- RESERVATIONS TABLE POLICIES
-- =====================================================

-- Authenticated users can read reservations
CREATE POLICY "Staff can read reservations"
  ON reservations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Receptionists+ can create reservations
CREATE POLICY "Staff can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (
    public.user_role() IN ('admin', 'manager', 'receptionist')
    AND created_by = auth.uid()
  );

-- Receptionists+ can update reservations
CREATE POLICY "Staff can update reservations"
  ON reservations FOR UPDATE
  USING (
    public.user_role() IN ('admin', 'manager', 'receptionist')
  );

-- Managers+ can delete reservations
CREATE POLICY "Managers can delete reservations"
  ON reservations FOR DELETE
  USING (public.is_manager_or_admin());

-- =====================================================
-- INVOICES TABLE POLICIES
-- =====================================================

-- Authenticated users can read invoices
CREATE POLICY "Staff can read invoices"
  ON invoices FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Receptionists+ can create invoices
CREATE POLICY "Staff can create invoices"
  ON invoices FOR INSERT
  WITH CHECK (
    public.user_role() IN ('admin', 'manager', 'receptionist')
  );

-- Receptionists+ can update invoices (if not paid)
CREATE POLICY "Staff can update unpaid invoices"
  ON invoices FOR UPDATE
  USING (
    public.user_role() IN ('admin', 'manager', 'receptionist')
    AND status != 'paid'
  );

-- Only admins can delete invoices
CREATE POLICY "Admins can delete invoices"
  ON invoices FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- PAYMENTS TABLE POLICIES
-- =====================================================

-- Authenticated users can read payments
CREATE POLICY "Staff can read payments"
  ON payments FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Receptionists+ can create payments
CREATE POLICY "Staff can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    public.user_role() IN ('admin', 'manager', 'receptionist')
    AND processed_by = auth.uid()
  );

-- Managers+ can update payments (for corrections)
CREATE POLICY "Managers can update payments"
  ON payments FOR UPDATE
  USING (public.is_manager_or_admin());

-- Only admins can delete payments
CREATE POLICY "Admins can delete payments"
  ON payments FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- AUDIT_LOGS TABLE POLICIES
-- =====================================================

-- Everyone can read their own actions
CREATE POLICY "Users can read own audit logs"
  ON audit_logs FOR SELECT
  USING (user_id = auth.uid());

-- Managers+ can read all audit logs
CREATE POLICY "Managers can read all audit logs"
  ON audit_logs FOR SELECT
  USING (public.is_manager_or_admin());

-- No one can update or delete audit logs (append-only)
-- INSERT is handled by triggers only

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  ASSERT policy_count >= 25, 'Expected at least 25 policies, found ' || policy_count;
  
  RAISE NOTICE '✓ All RLS policies created successfully (% total)', policy_count;
END $$;
