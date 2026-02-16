-- =====================================================
-- Migration: 00002_create_tables.sql
-- Description: Create all tables for the HMS database
-- Author: Grace Mawia Kamami
-- Date: 2026-02-16
-- Dependencies: 00001_create_enums.sql
-- =====================================================

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role user_role NOT NULL DEFAULT 'receptionist',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'Extended user profiles linked to Supabase Auth';
COMMENT ON COLUMN profiles.id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN profiles.role IS 'User role for RBAC (admin, manager, receptionist, housekeeping)';
COMMENT ON COLUMN profiles.is_active IS 'Soft delete flag - false means user is deactivated';

-- =====================================================
-- ROOM TYPES TABLE
-- =====================================================
CREATE TABLE room_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  max_occupancy INTEGER NOT NULL CHECK (max_occupancy > 0),
  amenities JSONB DEFAULT '[]'::jsonb,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE room_types IS 'Master data for different room categories (e.g., Deluxe Suite, Standard Room)';
COMMENT ON COLUMN room_types.base_price IS 'Base price per night in hotel currency';
COMMENT ON COLUMN room_types.amenities IS 'JSON array of amenities: ["WiFi", "TV", "Mini-bar"]';
COMMENT ON COLUMN room_types.image_urls IS 'Array of image URLs for this room type';

-- =====================================================
-- ROOMS TABLE
-- =====================================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number VARCHAR(20) NOT NULL UNIQUE,
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
  floor INTEGER NOT NULL CHECK (floor >= 0),
  status room_status NOT NULL DEFAULT 'available',
  features JSONB DEFAULT '{}'::jsonb,
  last_cleaned_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE rooms IS 'Individual room inventory';
COMMENT ON COLUMN rooms.room_number IS 'Unique room identifier (e.g., "101", "2A")';
COMMENT ON COLUMN rooms.status IS 'Current room status: available, occupied, maintenance, cleaning';
COMMENT ON COLUMN rooms.features IS 'Room-specific features: {"balcony": true, "view": "ocean"}';
COMMENT ON COLUMN rooms.last_cleaned_at IS 'Timestamp of last housekeeping cleaning';

-- =====================================================
-- GUESTS TABLE
-- =====================================================
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  id_number VARCHAR(100),
  nationality VARCHAR(100),
  date_of_birth DATE,
  address TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT check_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

COMMENT ON TABLE guests IS 'Guest information and profiles';
COMMENT ON COLUMN guests.id_number IS 'ID card or passport number';
COMMENT ON COLUMN guests.preferences IS 'Guest preferences: {"floor": "high", "pillow": "soft"}';
COMMENT ON COLUMN guests.created_by IS 'Staff member who created this guest record';
COMMENT ON CONSTRAINT check_email_or_phone ON guests IS 'At least one contact method required';

-- =====================================================
-- RESERVATIONS TABLE
-- =====================================================
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  actual_check_in TIMESTAMPTZ,
  actual_check_out TIMESTAMPTZ,
  num_adults INTEGER NOT NULL DEFAULT 1 CHECK (num_adults > 0),
  num_children INTEGER NOT NULL DEFAULT 0 CHECK (num_children >= 0),
  status reservation_status NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT check_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT check_actual_dates CHECK (
    actual_check_out IS NULL OR 
    actual_check_in IS NULL OR 
    actual_check_out > actual_check_in
  )
);

COMMENT ON TABLE reservations IS 'Booking records and stay history';
COMMENT ON COLUMN reservations.check_in_date IS 'Planned check-in date';
COMMENT ON COLUMN reservations.check_out_date IS 'Planned check-out date';
COMMENT ON COLUMN reservations.actual_check_in IS 'Actual check-in timestamp (when guest arrives)';
COMMENT ON COLUMN reservations.actual_check_out IS 'Actual check-out timestamp (when guest leaves)';
COMMENT ON COLUMN reservations.total_amount IS 'Total calculated amount for this reservation';
COMMENT ON CONSTRAINT check_dates ON reservations IS 'Check-out must be after check-in';

-- =====================================================
-- INVOICES TABLE
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  status invoice_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT check_invoice_total CHECK (
    total_amount = subtotal + tax_amount - discount_amount
  ),
  CONSTRAINT check_due_date CHECK (due_date >= issue_date)
);

COMMENT ON TABLE invoices IS 'Billing documents for reservations';
COMMENT ON COLUMN invoices.invoice_number IS 'Unique invoice number (e.g., "INV-2026-00001")';
COMMENT ON COLUMN invoices.total_amount IS 'Final amount: subtotal + tax - discount';
COMMENT ON CONSTRAINT check_invoice_total ON invoices IS 'Ensure total = subtotal + tax - discount';

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_method payment_method NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  transaction_ref VARCHAR(255),
  status payment_status NOT NULL DEFAULT 'completed',
  notes TEXT,
  processed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE payments IS 'Payment transaction records';
COMMENT ON COLUMN payments.transaction_ref IS 'External payment gateway transaction reference';
COMMENT ON COLUMN payments.processed_by IS 'Staff member who processed this payment';

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action audit_action NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE audit_logs IS 'Audit trail for all critical database operations';
COMMENT ON COLUMN audit_logs.table_name IS 'Name of the table being audited';
COMMENT ON COLUMN audit_logs.record_id IS 'ID of the affected record';
COMMENT ON COLUMN audit_logs.old_data IS 'Previous record state (for UPDATE/DELETE)';
COMMENT ON COLUMN audit_logs.new_data IS 'New record state (for INSERT/UPDATE)';

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')), 'profiles table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_types')), 'room_types table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms')), 'rooms table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guests')), 'guests table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservations')), 'reservations table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices')), 'invoices table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments')), 'payments table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs')), 'audit_logs table not created';
  
  RAISE NOTICE '✓ All tables created successfully';
END $$;
