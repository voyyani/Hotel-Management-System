-- =====================================================
-- Migration: 00003_create_indexes.sql
-- Description: Create indexes for query optimization
-- Author: Grace Mawia Kamami
-- Date: 2026-02-16
-- Dependencies: 00002_create_tables.sql
-- =====================================================

-- =====================================================
-- FOREIGN KEY INDEXES
-- (PostgreSQL doesn't automatically index FKs)
-- =====================================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email) WHERE is_active = true;

-- Rooms
CREATE INDEX idx_rooms_room_type_id ON rooms(room_type_id);
CREATE INDEX idx_rooms_status ON rooms(status) WHERE status != 'maintenance';
CREATE INDEX idx_rooms_floor ON rooms(floor);

-- Guests
CREATE INDEX idx_guests_email ON guests(email) WHERE email IS NOT NULL;
CREATE INDEX idx_guests_phone ON guests(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_guests_created_by ON guests(created_by);
-- Full-text search on guest names
CREATE INDEX idx_guests_fullname_trgm ON guests USING gin(
  (first_name || ' ' || last_name) gin_trgm_ops
);

-- Reservations
CREATE INDEX idx_reservations_guest_id ON reservations(guest_id);
CREATE INDEX idx_reservations_room_id ON reservations(room_id);
CREATE INDEX idx_reservations_created_by ON reservations(created_by);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_check_in_date ON reservations(check_in_date);
CREATE INDEX idx_reservations_check_out_date ON reservations(check_out_date);
-- Composite index for availability checks (most common query)
CREATE INDEX idx_reservations_room_dates ON reservations(
  room_id, 
  check_in_date, 
  check_out_date
) WHERE status NOT IN ('cancelled', 'no_show');
-- Index for finding reservations within a date range
CREATE INDEX idx_reservations_date_range ON reservations(check_in_date, check_out_date);

-- Invoices
CREATE INDEX idx_invoices_reservation_id ON invoices(reservation_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
-- Find overdue invoices
CREATE INDEX idx_invoices_overdue ON invoices(due_date, status) 
  WHERE status IN ('pending', 'partially_paid');

-- Payments
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_processed_by ON payments(processed_by);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_ref ON payments(transaction_ref) 
  WHERE transaction_ref IS NOT NULL;

-- Audit Logs
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
-- Composite index for filtering audit logs
CREATE INDEX idx_audit_logs_table_action_date ON audit_logs(
  table_name, 
  action, 
  created_at DESC
);

-- =====================================================
-- PARTIAL INDEXES (for active records only)
-- =====================================================

-- Active room types only
CREATE INDEX idx_room_types_active ON room_types(name) WHERE is_active = true;

-- Active profiles only
CREATE INDEX idx_profiles_active ON profiles(role) WHERE is_active = true;

-- =====================================================
-- COVERING INDEXES (include additional columns)
-- =====================================================

-- Room availability with type info
CREATE INDEX idx_rooms_availability_covering ON rooms(status, room_type_id) 
  INCLUDE (room_number, floor)
  WHERE status IN ('available', 'cleaning');

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';
  
  ASSERT index_count >= 30, 'Expected at least 30 indexes, found ' || index_count;
  
  RAISE NOTICE '✓ All indexes created successfully (% total)', index_count;
END $$;
