-- =====================================================
-- Migration: 00013_create_system_settings.sql
-- Description: System settings and hotel configuration
-- Author: Grace Mawia Kamami
-- Date: 2026-02-17
-- Dependencies: None
-- =====================================================

-- =====================================================
-- SYSTEM SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Hotel Information
  hotel_name VARCHAR(255) NOT NULL,
  hotel_email VARCHAR(255),
  hotel_phone VARCHAR(50),
  hotel_address TEXT,
  hotel_city VARCHAR(100),
  hotel_state VARCHAR(100),
  hotel_country VARCHAR(100),
  hotel_postal_code VARCHAR(20),
  hotel_website VARCHAR(255),
  
  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#4F46E5', -- Indigo-600
  secondary_color VARCHAR(7) DEFAULT '#7C3AED', -- Purple-600
  
  -- Business Information
  tax_id VARCHAR(100),
  registration_number VARCHAR(100),
  
  -- Contact Information
  support_email VARCHAR(255),
  support_phone VARCHAR(50),
  
  -- Settings Metadata
  is_configured BOOLEAN NOT NULL DEFAULT false,
  configured_at TIMESTAMPTZ,
  configured_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES profiles(id)
);

COMMENT ON TABLE system_settings IS 'System-wide settings and hotel configuration';
COMMENT ON COLUMN system_settings.is_configured IS 'True after initial onboarding is completed';
COMMENT ON COLUMN system_settings.hotel_name IS 'Hotel/Property name displayed throughout the app';

-- Create trigger for updated_at
CREATE TRIGGER trg_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings (needed for branding)
CREATE POLICY "Anyone can read system settings" ON system_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update system settings" ON system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can insert settings (for initial setup)
CREATE POLICY "Admins can insert system settings" ON system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get current system settings
CREATE OR REPLACE FUNCTION get_system_settings()
RETURNS system_settings
LANGUAGE SQL
STABLE
AS $$
  SELECT * FROM system_settings
  ORDER BY created_at DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION get_system_settings() IS 'Get the current system settings (latest record)';

-- Function to check if system is configured
CREATE OR REPLACE FUNCTION is_system_configured()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_configured FROM system_settings ORDER BY created_at DESC LIMIT 1),
    false
  );
$$;

COMMENT ON FUNCTION is_system_configured() IS 'Check if system has been configured (onboarding completed)';

-- Function to update system settings (ensures only one record exists)
CREATE OR REPLACE FUNCTION upsert_system_settings(
  p_hotel_name VARCHAR,
  p_hotel_email VARCHAR DEFAULT NULL,
  p_hotel_phone VARCHAR DEFAULT NULL,
  p_hotel_address TEXT DEFAULT NULL,
  p_hotel_city VARCHAR DEFAULT NULL,
  p_hotel_state VARCHAR DEFAULT NULL,
  p_hotel_country VARCHAR DEFAULT NULL,
  p_hotel_postal_code VARCHAR DEFAULT NULL,
  p_hotel_website VARCHAR DEFAULT NULL,
  p_logo_url TEXT DEFAULT NULL,
  p_primary_color VARCHAR DEFAULT NULL,
  p_secondary_color VARCHAR DEFAULT NULL,
  p_tax_id VARCHAR DEFAULT NULL,
  p_registration_number VARCHAR DEFAULT NULL,
  p_support_email VARCHAR DEFAULT NULL,
  p_support_phone VARCHAR DEFAULT NULL
)
RETURNS system_settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings system_settings;
  v_existing_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update system settings';
  END IF;

  -- Check if settings already exist
  SELECT id INTO v_existing_id
  FROM system_settings
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Update existing settings
    UPDATE system_settings
    SET
      hotel_name = p_hotel_name,
      hotel_email = COALESCE(p_hotel_email, hotel_email),
      hotel_phone = COALESCE(p_hotel_phone, hotel_phone),
      hotel_address = COALESCE(p_hotel_address, hotel_address),
      hotel_city = COALESCE(p_hotel_city, hotel_city),
      hotel_state = COALESCE(p_hotel_state, hotel_state),
      hotel_country = COALESCE(p_hotel_country, hotel_country),
      hotel_postal_code = COALESCE(p_hotel_postal_code, hotel_postal_code),
      hotel_website = COALESCE(p_hotel_website, hotel_website),
      logo_url = COALESCE(p_logo_url, logo_url),
      primary_color = COALESCE(p_primary_color, primary_color),
      secondary_color = COALESCE(p_secondary_color, secondary_color),
      tax_id = COALESCE(p_tax_id, tax_id),
      registration_number = COALESCE(p_registration_number, registration_number),
      support_email = COALESCE(p_support_email, support_email),
      support_phone = COALESCE(p_support_phone, support_phone),
      is_configured = true,
      configured_at = COALESCE(configured_at, now()),
      configured_by = COALESCE(configured_by, auth.uid()),
      updated_at = now(),
      updated_by = auth.uid()
    WHERE id = v_existing_id
    RETURNING * INTO v_settings;
  ELSE
    -- Insert new settings
    INSERT INTO system_settings (
      hotel_name, hotel_email, hotel_phone, hotel_address,
      hotel_city, hotel_state, hotel_country, hotel_postal_code,
      hotel_website, logo_url, primary_color, secondary_color,
      tax_id, registration_number, support_email, support_phone,
      is_configured, configured_at, configured_by, updated_by
    )
    VALUES (
      p_hotel_name, p_hotel_email, p_hotel_phone, p_hotel_address,
      p_hotel_city, p_hotel_state, p_hotel_country, p_hotel_postal_code,
      p_hotel_website, p_logo_url, p_primary_color, p_secondary_color,
      p_tax_id, p_registration_number, p_support_email, p_support_phone,
      true, now(), auth.uid(), auth.uid()
    )
    RETURNING * INTO v_settings;
  END IF;

  RETURN v_settings;
END;
$$;

COMMENT ON FUNCTION upsert_system_settings IS 'Insert or update system settings (admin only)';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_system_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION is_system_configured() TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_system_settings TO authenticated;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_system_settings_configured ON system_settings(is_configured);
CREATE INDEX idx_system_settings_created_at ON system_settings(created_at DESC);

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  table_count INTEGER;
  function_count INTEGER;
BEGIN
  -- Check table exists
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_name = 'system_settings';
  
  ASSERT table_count = 1, 'system_settings table not created';
  
  -- Check functions exist
  SELECT COUNT(*) INTO function_count
  FROM pg_proc
  WHERE proname IN ('get_system_settings', 'is_system_configured', 'upsert_system_settings');
  
  ASSERT function_count >= 3, 'Expected 3 functions, found ' || function_count;
  
  RAISE NOTICE '✓ System settings table and functions created successfully';
END $$;
