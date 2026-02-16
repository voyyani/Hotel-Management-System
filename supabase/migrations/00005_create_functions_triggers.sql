-- =====================================================
-- Migration: 00005_create_functions_triggers.sql
-- Description: Database functions and triggers
-- Author: Grace Mawia Kamami
-- Date: 2026-02-16
-- Dependencies: 00002_create_tables.sql
-- =====================================================

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at timestamp before UPDATE';

-- =====================================================
-- ROOM AVAILABILITY FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION check_room_availability(
  p_room_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_exclude_reservation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_conflict_count INTEGER;
BEGIN
  -- Check for overlapping reservations
  SELECT COUNT(*) INTO v_conflict_count
  FROM reservations
  WHERE room_id = p_room_id
  AND status NOT IN ('cancelled', 'no_show', 'checked_out')
  AND (id != p_exclude_reservation_id OR p_exclude_reservation_id IS NULL)
  AND (
    -- New reservation overlaps with existing
    (check_in_date, check_out_date) OVERLAPS (p_check_in, p_check_out)
  );
  
  -- Return true if no conflicts
  RETURN v_conflict_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_room_availability IS 'Check if a room is available for given date range';

-- =====================================================
-- FIND AVAILABLE ROOMS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION find_available_rooms(
  p_check_in DATE,
  p_check_out DATE,
  p_room_type_id UUID DEFAULT NULL,
  p_min_occupancy INTEGER DEFAULT 1
)
RETURNS TABLE (
  room_id UUID,
  room_number VARCHAR(20),
  room_type_name VARCHAR(100),
  floor INTEGER,
  base_price DECIMAL(10,2),
  max_occupancy INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.room_number,
    rt.name,
    r.floor,
    rt.base_price,
    rt.max_occupancy
  FROM rooms r
  JOIN room_types rt ON rt.id = r.room_type_id
  WHERE r.status = 'available'
  AND rt.is_active = true
  AND rt.max_occupancy >= p_min_occupancy
  AND (p_room_type_id IS NULL OR r.room_type_id = p_room_type_id)
  AND check_room_availability(r.id, p_check_in, p_check_out)
  ORDER BY rt.base_price ASC, r.room_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION find_available_rooms IS 'Find all available rooms for given date range and criteria';

-- =====================================================
-- RESERVATION TOTAL CALCULATION FUNCTION
-- =====================================================

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
  v_max_occupancy INTEGER;
  v_total DECIMAL(10,2);
  v_extra_person_charge DECIMAL(10,2) := 20.00; -- $20 per extra person per night
BEGIN
  -- Get room type details
  SELECT 
    rt.base_price,
    rt.max_occupancy
  INTO v_base_price, v_max_occupancy
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
  IF (p_num_adults + p_num_children) > v_max_occupancy THEN
    RAISE EXCEPTION 'Total guests (%) exceeds room capacity (%)', 
      p_num_adults + p_num_children, v_max_occupancy;
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

COMMENT ON FUNCTION calculate_reservation_total IS 'Calculate total amount for a reservation';

-- =====================================================
-- PREVENT DOUBLE BOOKING TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if room is available for these dates
  IF NOT check_room_availability(
    NEW.room_id, 
    NEW.check_in_date, 
    NEW.check_out_date,
    NEW.id
  ) THEN
    RAISE EXCEPTION 'Room % is not available from % to %', 
      NEW.room_id, 
      NEW.check_in_date, 
      NEW.check_out_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_double_booking
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW
  WHEN (NEW.status NOT IN ('cancelled', 'no_show'))
  EXECUTE FUNCTION prevent_double_booking();

COMMENT ON TRIGGER trg_prevent_double_booking ON reservations IS 'Prevents overlapping reservations for the same room';

-- =====================================================
-- AUTO-CALCULATE RESERVATION TOTAL TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION auto_calculate_reservation_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Only calculate if not manually set or if dates/guests changed
  IF (TG_OP = 'INSERT') OR 
     (OLD.room_id != NEW.room_id OR 
      OLD.check_in_date != NEW.check_in_date OR 
      OLD.check_out_date != NEW.check_out_date OR
      OLD.num_adults != NEW.num_adults OR 
      OLD.num_children != NEW.num_children) THEN
    
    NEW.total_amount := calculate_reservation_total(
      NEW.room_id,
      NEW.check_in_date,
      NEW.check_out_date,
      NEW.num_adults,
      NEW.num_children
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_calculate_reservation_total
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_reservation_total();

COMMENT ON TRIGGER trg_auto_calculate_reservation_total ON reservations IS 'Auto-calculates reservation total_amount';

-- =====================================================
-- UPDATE ROOM STATUS ON RESERVATION CHANGES
-- =====================================================

CREATE OR REPLACE FUNCTION update_room_status_on_reservation()
RETURNS TRIGGER AS $$
BEGIN
  -- When reservation status changes to checked_in
  IF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') AND NEW.status = 'checked_in' THEN
    UPDATE rooms SET status = 'occupied' WHERE id = NEW.room_id;
  END IF;
  
  -- When reservation status changes to checked_out
  IF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') AND NEW.status = 'checked_out' THEN
    UPDATE rooms SET status = 'cleaning' WHERE id = NEW.room_id;
  END IF;
  
  -- When reservation is cancelled, free up the room if it's not current
  IF (TG_OP = 'UPDATE') AND 
     NEW.status IN ('cancelled', 'no_show') AND 
     OLD.status = 'confirmed' AND
     CURRENT_DATE NOT BETWEEN NEW.check_in_date AND NEW.check_out_date THEN
    UPDATE rooms SET status = 'available' WHERE id = NEW.room_id AND status = 'occupied';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_room_status_on_reservation
  AFTER INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_room_status_on_reservation();

COMMENT ON TRIGGER trg_update_room_status_on_reservation ON reservations IS 'Updates room status based on reservation status';

-- =====================================================
-- UPDATE INVOICE STATUS ON PAYMENT
-- =====================================================

CREATE OR REPLACE FUNCTION update_invoice_status_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_total DECIMAL(10,2);
  v_payments_total DECIMAL(10,2);
  v_due_date DATE;
BEGIN
  -- Get invoice details
  SELECT total_amount, due_date
  INTO v_invoice_total, v_due_date
  FROM invoices
  WHERE id = NEW.invoice_id;
  
  -- Calculate total payments for this invoice
  SELECT COALESCE(SUM(amount), 0)
  INTO v_payments_total
  FROM payments
  WHERE invoice_id = NEW.invoice_id
  AND status = 'completed';
  
  -- Update invoice status based on payments
  IF v_payments_total >= v_invoice_total THEN
    UPDATE invoices SET status = 'paid' WHERE id = NEW.invoice_id;
  ELSIF v_payments_total > 0 THEN
    UPDATE invoices SET status = 'partially_paid' WHERE id = NEW.invoice_id;
  ELSIF CURRENT_DATE > v_due_date THEN
    UPDATE invoices SET status = 'overdue' WHERE id = NEW.invoice_id;
  ELSE
    UPDATE invoices SET status = 'pending' WHERE id = NEW.invoice_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_invoice_status_on_payment
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_status_on_payment();

COMMENT ON TRIGGER trg_update_invoice_status_on_payment ON payments IS 'Auto-updates invoice status when payments are made';

-- =====================================================
-- AUDIT LOG TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
BEGIN
  -- Prepare old and new data
  IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
    v_old_data := to_jsonb(OLD);
  END IF;
  
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    v_new_data := to_jsonb(NEW);
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id,
    ip_address,
    user_agent
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP::audit_action,
    v_old_data,
    v_new_data,
    auth.uid(),
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
  
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION audit_log_changes IS 'Logs all changes to audited tables';

-- Apply audit logging to critical tables
CREATE TRIGGER trg_audit_reservations
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER trg_audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER trg_audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER trg_audit_rooms_status
  AFTER UPDATE ON rooms
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION audit_log_changes();

-- =====================================================
-- UPDATED_AT TRIGGERS FOR ALL TABLES
-- =====================================================

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_room_types_updated_at
  BEFORE UPDATE ON room_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INVOICE NUMBER GENERATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year VARCHAR(4);
  v_count INTEGER;
  v_invoice_number VARCHAR(50);
BEGIN
  -- Get current year
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get count of invoices this year
  SELECT COUNT(*) + 1 INTO v_count
  FROM invoices
  WHERE EXTRACT(YEAR FROM issue_date) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Generate invoice number: INV-YYYY-00001
  v_invoice_number := 'INV-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM invoices WHERE invoice_number = v_invoice_number) LOOP
    v_count := v_count + 1;
    v_invoice_number := 'INV-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');
  END LOOP;
  
  NEW.invoice_number := v_invoice_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

COMMENT ON TRIGGER trg_generate_invoice_number ON invoices IS 'Auto-generates unique invoice numbers';

-- =====================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'receptionist'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTE: Trigger on auth.users must be created via Supabase Dashboard
-- Due to security restrictions, triggers on auth.users cannot be created in migrations
-- To set up: Go to Database > Triggers > Create a new trigger:
--   - Table: auth.users
--   - Events: Insert
--   - Function: handle_new_user()
-- 
-- Alternatively, handle profile creation in your application code after user signup

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  function_count INTEGER;
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO function_count
  FROM pg_proc
  WHERE proname IN (
    'check_room_availability',
    'find_available_rooms',
    'calculate_reservation_total',
    'prevent_double_booking',
    'auto_calculate_reservation_total',
    'update_room_status_on_reservation',
    'update_invoice_status_on_payment',
    'audit_log_changes',
    'update_updated_at_column',
    'generate_invoice_number',
    'handle_new_user'
  );
  
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgname LIKE 'trg_%' OR tgname LIKE 'on_%';
  
  ASSERT function_count >= 11, 'Expected at least 11 functions, found ' || function_count;
  ASSERT trigger_count >= 15, 'Expected at least 15 triggers, found ' || trigger_count;
  
  RAISE NOTICE '✓ All functions (%) and triggers (%) created successfully', function_count, trigger_count;
END $$;
