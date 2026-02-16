-- =====================================================
-- Migration: 00001_create_enums.sql
-- Description: Create all ENUM types for the HMS database
-- Author: Grace Mawia Kamami
-- Date: 2026-02-16
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for text search (trigram similarity)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- USER ROLES
-- =====================================================
CREATE TYPE user_role AS ENUM (
  'admin',        -- Full system access
  'manager',      -- Management and reporting access
  'receptionist', -- Front desk operations
  'housekeeping'  -- Room cleaning and maintenance
);

COMMENT ON TYPE user_role IS 'User roles for role-based access control';

-- =====================================================
-- ROOM STATUS
-- =====================================================
CREATE TYPE room_status AS ENUM (
  'available',   -- Ready for booking
  'occupied',    -- Currently occupied by guest
  'maintenance', -- Under maintenance
  'cleaning'     -- Being cleaned by housekeeping
);

COMMENT ON TYPE room_status IS 'Current status of a room';

-- =====================================================
-- RESERVATION STATUS
-- =====================================================
CREATE TYPE reservation_status AS ENUM (
  'pending',      -- Reservation created, awaiting confirmation
  'confirmed',    -- Reservation confirmed, room assigned
  'checked_in',   -- Guest has checked in
  'checked_out',  -- Guest has checked out
  'cancelled',    -- Reservation cancelled
  'no_show'       -- Guest did not show up
);

COMMENT ON TYPE reservation_status IS 'Status of a reservation throughout its lifecycle';

-- =====================================================
-- INVOICE STATUS
-- =====================================================
CREATE TYPE invoice_status AS ENUM (
  'pending',        -- Invoice created, no payments
  'partially_paid', -- Partial payment received
  'paid',           -- Fully paid
  'overdue',        -- Past due date
  'cancelled'       -- Invoice cancelled
);

COMMENT ON TYPE invoice_status IS 'Payment status of an invoice';

-- =====================================================
-- PAYMENT METHOD
-- =====================================================
CREATE TYPE payment_method AS ENUM (
  'cash',          -- Cash payment
  'card',          -- Credit/Debit card
  'bank_transfer', -- Bank transfer
  'mobile_money',  -- Mobile money (M-Pesa, etc.)
  'other'          -- Other payment methods
);

COMMENT ON TYPE payment_method IS 'Method of payment used';

-- =====================================================
-- PAYMENT STATUS
-- =====================================================
CREATE TYPE payment_status AS ENUM (
  'pending',   -- Payment pending processing
  'completed', -- Payment successfully completed
  'failed',    -- Payment failed
  'refunded'   -- Payment refunded
);

COMMENT ON TYPE payment_status IS 'Status of a payment transaction';

-- =====================================================
-- AUDIT ACTION
-- =====================================================
CREATE TYPE audit_action AS ENUM (
  'INSERT', -- Record created
  'UPDATE', -- Record updated
  'DELETE'  -- Record deleted
);

COMMENT ON TYPE audit_action IS 'Type of database operation for audit logging';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify all enums created
DO $$
BEGIN
  ASSERT (SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role')), 'user_role enum not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_status')), 'room_status enum not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status')), 'reservation_status enum not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status')), 'invoice_status enum not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method')), 'payment_method enum not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status')), 'payment_status enum not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action')), 'audit_action enum not created';
  
  RAISE NOTICE '✓ All ENUM types created successfully';
END $$;
