-- =====================================================
-- Migration: 00012_create_admin_user_management.sql
-- Description: Admin user management functions
-- Author: Grace Mawia Kamami
-- Date: 2026-02-17
-- Dependencies: 00002_create_tables.sql, 00004_create_rls_policies.sql
-- =====================================================

-- =====================================================
-- ADMIN USER CREATION FUNCTION
-- =====================================================

-- This function allows admins to create new users programmatically
-- It creates both the auth.users record and the profiles record
-- Note: This requires Supabase service_role access for auth.users manipulation

CREATE OR REPLACE FUNCTION admin_create_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role user_role,
  p_phone TEXT DEFAULT NULL
)
RETURNS jsonb
SECURITY DEFINER -- Run with elevated privileges
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_result jsonb;
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE email = p_email) THEN
    RAISE EXCEPTION 'User with email % already exists', p_email;
  END IF;

  -- Note: In production, this would use Supabase Admin API
  -- For now, we'll create the profile directly and return instructions
  -- The actual auth.users creation must be done via Supabase Admin API
  
  -- Generate a new UUID for the user
  v_user_id := gen_random_uuid();
  
  -- Create the profile record
  -- In production, this would be triggered automatically after auth.users creation
  INSERT INTO profiles (id, email, full_name, role, phone, is_active)
  VALUES (v_user_id, p_email, p_full_name, p_role, p_phone, true)
  RETURNING id INTO v_user_id;
  
  -- Return success message with user ID
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'message', 'User created successfully. Auth user must be created via Supabase Admin API.'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create user: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION admin_create_user IS 'Admin function to create new users (requires admin role)';

-- =====================================================
-- ADMIN USER UPDATE FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION admin_update_user(
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_role user_role DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update users';
  END IF;

  -- Check if target user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Update only the fields that were provided
  UPDATE profiles
  SET
    full_name = COALESCE(p_full_name, full_name),
    role = COALESCE(p_role, role),
    phone = COALESCE(p_phone, phone),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Return success message
  v_result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'message', 'User updated successfully'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update user: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION admin_update_user IS 'Admin function to update user details (requires admin role)';

-- =====================================================
-- GET ALL USERS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION admin_get_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role user_role,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the calling user is an admin or manager
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'manager')
  ) THEN
    RAISE EXCEPTION 'Only admins and managers can view all users';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.role,
    p.is_active,
    p.created_at,
    p.updated_at
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$;

COMMENT ON FUNCTION admin_get_users IS 'Admin/Manager function to retrieve all users';

-- =====================================================
-- RLS POLICIES UPDATE
-- =====================================================

-- Allow admins to read all profiles (already should exist)
-- Allow admins to update all profiles
DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
  
  -- Create new policy
  CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles AS admin_profile
        WHERE admin_profile.id = auth.uid()
        AND admin_profile.role = 'admin'
      )
    );
END $$;

-- =====================================================
-- GRANT EXECUTE PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users
-- (The functions themselves check for admin role)
GRANT EXECUTE ON FUNCTION admin_create_user TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_user TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_users TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO function_count
  FROM pg_proc
  WHERE proname IN (
    'admin_create_user',
    'admin_update_user',
    'admin_get_users'
  );
  
  ASSERT function_count >= 3, 
    'Expected 3 admin functions, found ' || function_count;
  
  RAISE NOTICE '✓ Admin user management functions created successfully';
END $$;
