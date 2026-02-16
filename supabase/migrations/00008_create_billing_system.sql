-- =====================================================
-- Migration: 00008_create_billing_system.sql
-- Description: Enhanced billing and payments system
-- Author: Grace Mawia Kamami
-- Date: 2026-02-16
-- Phase: Week 11-12 - Billing & Payments
-- =====================================================

-- =====================================================
-- INVOICE LINE ITEMS TABLE
-- =====================================================
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  item_type VARCHAR(50) NOT NULL, -- 'room_charge', 'service', 'minibar', 'laundry', 'restaurant', 'other'
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  posting_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT check_line_total CHECK (total_price = quantity * unit_price)
);

CREATE INDEX idx_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX idx_line_items_type ON invoice_line_items(item_type);
CREATE INDEX idx_line_items_posting_date ON invoice_line_items(posting_date);

COMMENT ON TABLE invoice_line_items IS 'Detailed line items for each invoice';
COMMENT ON COLUMN invoice_line_items.item_type IS 'Category of charge for reporting';
COMMENT ON COLUMN invoice_line_items.quantity IS 'Number of units (nights for rooms, items for services)';
COMMENT ON COLUMN invoice_line_items.tax_rate IS 'Tax percentage (e.g., 16 for 16% VAT)';

-- =====================================================
-- DEPOSITS TABLE
-- =====================================================
CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  deposit_type VARCHAR(50) NOT NULL DEFAULT 'security', -- 'security', 'advance_payment', 'damage'
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  collected_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  refund_date TIMESTAMPTZ,
  refund_amount DECIMAL(10,2) CHECK (refund_amount >= 0 AND refund_amount <= amount),
  status VARCHAR(50) NOT NULL DEFAULT 'held', -- 'held', 'refunded', 'forfeited', 'applied'
  payment_method payment_method NOT NULL,
  transaction_ref VARCHAR(255),
  notes TEXT,
  collected_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  refunded_by UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deposits_reservation ON deposits(reservation_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_deposits_collected_date ON deposits(collected_date);

COMMENT ON TABLE deposits IS 'Security deposits and advance payments';
COMMENT ON COLUMN deposits.status IS 'Current status of the deposit';
COMMENT ON COLUMN deposits.refund_amount IS 'Amount refunded (may be less if damages deducted)';

-- =====================================================
-- PRICING RULES TABLE
-- =====================================================
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL, -- 'seasonal', 'day_of_week', 'last_minute', 'discount', 'promotion'
  room_type_id UUID REFERENCES room_types(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 0,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value >= 0),
  start_date DATE,
  end_date DATE,
  days_of_week INTEGER[], -- Array of days (0=Sunday, 1=Monday, ..., 6=Saturday)
  min_nights INTEGER CHECK (min_nights > 0),
  advance_booking_days INTEGER CHECK (advance_booking_days >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT check_pricing_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CONSTRAINT check_discount_percentage CHECK (
    discount_type != 'percentage' OR discount_value <= 100
  )
);

CREATE INDEX idx_pricing_rules_room_type ON pricing_rules(room_type_id);
CREATE INDEX idx_pricing_rules_dates ON pricing_rules(start_date, end_date);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active);
CREATE INDEX idx_pricing_rules_priority ON pricing_rules(priority DESC);

COMMENT ON TABLE pricing_rules IS 'Dynamic pricing rules engine';
COMMENT ON COLUMN pricing_rules.priority IS 'Higher number = higher priority (applied first)';
COMMENT ON COLUMN pricing_rules.days_of_week IS 'Array of applicable days, NULL means all days';
COMMENT ON COLUMN pricing_rules.conditions IS 'Additional JSON conditions for complex rules';

-- =====================================================
-- REFUNDS TABLE
-- =====================================================
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  reason VARCHAR(255) NOT NULL,
  refund_method payment_method NOT NULL,
  transaction_ref VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'completed', 'rejected'
  notes TEXT,
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  approved_by UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  processed_by UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_created_at ON refunds(created_at);

COMMENT ON TABLE refunds IS 'Payment refund records with approval workflow';
COMMENT ON COLUMN refunds.status IS 'Refund processing status';

-- =====================================================
-- FINANCIAL TRANSACTIONS VIEW
-- =====================================================
CREATE OR REPLACE VIEW financial_transactions AS
SELECT 
  'payment' as transaction_type,
  p.id,
  p.invoice_id,
  i.reservation_id,
  p.amount,
  p.payment_method,
  p.payment_date as transaction_date,
  p.transaction_ref,
  p.status,
  p.processed_by as handled_by,
  p.created_at
FROM payments p
JOIN invoices i ON i.id = p.invoice_id
WHERE p.status = 'completed'

UNION ALL

SELECT 
  'refund' as transaction_type,
  r.id,
  p.invoice_id,
  i.reservation_id,
  -r.amount as amount, -- Negative for refunds
  r.refund_method as payment_method,
  r.processed_at as transaction_date,
  r.transaction_ref,
  r.status,
  r.processed_by as handled_by,
  r.created_at
FROM refunds r
JOIN payments p ON p.id = r.payment_id
JOIN invoices i ON i.id = p.invoice_id
WHERE r.status = 'completed'

UNION ALL

SELECT 
  'deposit' as transaction_type,
  d.id,
  NULL as invoice_id,
  d.reservation_id,
  d.amount,
  d.payment_method,
  d.collected_date as transaction_date,
  d.transaction_ref,
  d.status,
  d.collected_by as handled_by,
  d.created_at
FROM deposits d
WHERE d.status != 'refunded';

COMMENT ON VIEW financial_transactions IS 'Unified view of all financial transactions';

-- =====================================================
-- DAILY REVENUE VIEW
-- =====================================================
CREATE OR REPLACE VIEW daily_revenue_summary AS
SELECT 
  DATE(transaction_date) as business_date,
  SUM(CASE WHEN payment_method = 'cash' THEN amount ELSE 0 END) as cash_total,
  SUM(CASE WHEN payment_method = 'credit_card' THEN amount ELSE 0 END) as credit_card_total,
  SUM(CASE WHEN payment_method = 'debit_card' THEN amount ELSE 0 END) as debit_card_total,
  SUM(CASE WHEN payment_method = 'bank_transfer' THEN amount ELSE 0 END) as bank_transfer_total,
  SUM(CASE WHEN payment_method = 'other' THEN amount ELSE 0 END) as other_total,
  SUM(amount) as total_revenue,
  COUNT(DISTINCT id) as transaction_count,
  COUNT(DISTINCT reservation_id) as reservation_count
FROM financial_transactions
WHERE transaction_type = 'payment'
  AND status = 'completed'
GROUP BY DATE(transaction_date);

COMMENT ON VIEW daily_revenue_summary IS 'Daily revenue breakdown by payment method';

-- =====================================================
-- OUTSTANDING BALANCES VIEW
-- =====================================================
CREATE OR REPLACE VIEW outstanding_balances AS
SELECT 
  i.id as invoice_id,
  i.reservation_id,
  i.invoice_number,
  r.guest_id,
  g.first_name || ' ' || g.last_name as guest_name,
  g.email as guest_email,
  g.phone as guest_phone,
  i.total_amount,
  COALESCE(SUM(p.amount), 0) as paid_amount,
  i.total_amount - COALESCE(SUM(p.amount), 0) as balance_due,
  i.due_date,
  CASE 
    WHEN i.due_date < CURRENT_DATE THEN 'overdue'
    WHEN i.due_date = CURRENT_DATE THEN 'due_today'
    ELSE 'pending'
  END as payment_urgency,
  i.status as invoice_status,
  r.check_out_date,
  i.created_at as invoice_date
FROM invoices i
JOIN reservations r ON r.id = i.reservation_id
JOIN guests g ON g.id = r.guest_id
LEFT JOIN payments p ON p.invoice_id = i.id AND p.status = 'completed'
WHERE i.status IN ('pending', 'partially_paid', 'overdue')
GROUP BY i.id, r.id, g.id
HAVING i.total_amount - COALESCE(SUM(p.amount), 0) > 0;

COMMENT ON VIEW outstanding_balances IS 'View of unpaid or partially paid invoices';

-- =====================================================
-- REVENUE BY ROOM TYPE VIEW
-- =====================================================
CREATE OR REPLACE VIEW revenue_by_room_type AS
SELECT 
  rt.id as room_type_id,
  rt.name as room_type_name,
  DATE_TRUNC('month', p.payment_date) as month,
  COUNT(DISTINCT r.id) as reservation_count,
  SUM(p.amount) as total_revenue,
  AVG(p.amount) as average_revenue,
  SUM(CASE WHEN p.payment_method = 'cash' THEN p.amount ELSE 0 END) as cash_revenue,
  SUM(CASE WHEN p.payment_method IN ('credit_card', 'debit_card') THEN p.amount ELSE 0 END) as card_revenue
FROM payments p
JOIN invoices i ON i.id = p.invoice_id
JOIN reservations r ON r.id = i.reservation_id
JOIN rooms rm ON rm.id = r.room_id
JOIN room_types rt ON rt.id = rm.room_type_id
WHERE p.status = 'completed'
GROUP BY rt.id, rt.name, DATE_TRUNC('month', p.payment_date);

COMMENT ON VIEW revenue_by_room_type IS 'Monthly revenue analysis by room type';

-- =====================================================
-- FUNCTIONS: Calculate Room Charges
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_room_charges(
  p_room_type_id UUID,
  p_check_in_date DATE,
  p_check_out_date DATE
)
RETURNS TABLE (
  num_nights INTEGER,
  base_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  final_amount DECIMAL(10,2),
  applied_rules JSONB
) AS $$
DECLARE
  v_base_price DECIMAL(10,2);
  v_nights INTEGER;
  v_total DECIMAL(10,2);
  v_discount DECIMAL(10,2) := 0;
  v_rules JSONB := '[]'::jsonb;
  v_rule RECORD;
BEGIN
  -- Get base price
  SELECT base_price INTO v_base_price
  FROM room_types
  WHERE id = p_room_type_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room type not found or inactive';
  END IF;
  
  -- Calculate number of nights
  v_nights := p_check_out_date - p_check_in_date;
  
  IF v_nights <= 0 THEN
    RAISE EXCEPTION 'Invalid date range';
  END IF;
  
  -- Calculate base amount
  v_total := v_base_price * v_nights;
  
  -- Apply pricing rules (highest priority first)
  FOR v_rule IN 
    SELECT *
    FROM pricing_rules
    WHERE (room_type_id = p_room_type_id OR room_type_id IS NULL)
      AND is_active = true
      AND (start_date IS NULL OR start_date <= p_check_in_date)
      AND (end_date IS NULL OR end_date >= p_check_out_date)
      AND (min_nights IS NULL OR v_nights >= min_nights)
    ORDER BY priority DESC
    LIMIT 1 -- Apply only the highest priority rule
  LOOP
    IF v_rule.discount_type = 'percentage' THEN
      v_discount := v_total * (v_rule.discount_value / 100);
    ELSE
      v_discount := v_rule.discount_value;
    END IF;
    
    -- Build rules JSON
    v_rules := jsonb_build_array(jsonb_build_object(
      'rule_id', v_rule.id,
      'rule_name', v_rule.name,
      'discount_type', v_rule.discount_type,
      'discount_value', v_rule.discount_value,
      'discount_amount', v_discount
    ));
    
    EXIT; -- Only apply one rule
  END LOOP;
  
  -- Return results
  RETURN QUERY SELECT 
    v_nights,
    v_total,
    v_discount,
    v_total - v_discount,
    v_rules;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_room_charges IS 'Calculate room charges with pricing rules applied';

-- =====================================================
-- FUNCTIONS: Generate Invoice Number
-- =====================================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  v_year VARCHAR(4);
  v_sequence INTEGER;
  v_invoice_number VARCHAR(50);
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-\d{4}-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO v_sequence
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || v_year || '-%';
  
  -- Format: INV-2026-00001
  v_invoice_number := 'INV-' || v_year || '-' || LPAD(v_sequence::TEXT, 5, '0');
  
  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION generate_invoice_number IS 'Generate unique sequential invoice number';

-- =====================================================
-- FUNCTIONS: Create Invoice with Line Items
-- =====================================================
CREATE OR REPLACE FUNCTION create_invoice_for_reservation(
  p_reservation_id UUID,
  p_tax_rate DECIMAL DEFAULT 16.0
)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_invoice_number VARCHAR(50);
  v_reservation RECORD;
  v_room_type_id UUID;
  v_charges RECORD;
  v_subtotal DECIMAL(10,2);
  v_tax_amount DECIMAL(10,2);
  v_total DECIMAL(10,2);
BEGIN
  -- Get reservation details
  SELECT r.*, rm.room_type_id
  INTO v_reservation
  FROM reservations r
  JOIN rooms rm ON rm.id = r.room_id
  WHERE r.id = p_reservation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found';
  END IF;
  
  -- Calculate room charges
  SELECT * INTO v_charges
  FROM calculate_room_charges(
    v_reservation.room_type_id,
    v_reservation.check_in_date,
    v_reservation.check_out_date
  );
  
  v_subtotal := v_charges.final_amount;
  v_tax_amount := v_subtotal * (p_tax_rate / 100);
  v_total := v_subtotal + v_tax_amount;
  
  -- Generate invoice number
  v_invoice_number := generate_invoice_number();
  
  -- Create invoice
  INSERT INTO invoices (
    reservation_id,
    invoice_number,
    issue_date,
    due_date,
    subtotal,
    tax_amount,
    discount_amount,
    total_amount,
    status
  ) VALUES (
    p_reservation_id,
    v_invoice_number,
    CURRENT_DATE,
    CURRENT_DATE, -- Due immediately for hotels
    v_charges.base_amount,
    v_tax_amount,
    v_charges.discount_amount,
    v_total,
    'pending'
  ) RETURNING id INTO v_invoice_id;
  
  -- Add room charge line item
  INSERT INTO invoice_line_items (
    invoice_id,
    description,
    item_type,
    quantity,
    unit_price,
    total_price,
    tax_rate,
    tax_amount
  ) VALUES (
    v_invoice_id,
    'Room Charges - ' || v_charges.num_nights || ' night(s)',
    'room_charge',
    v_charges.num_nights,
    v_charges.base_amount / v_charges.num_nights,
    v_charges.base_amount,
    p_tax_rate,
    v_tax_amount
  );
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION create_invoice_for_reservation IS 'Automatically create invoice with line items for a reservation';

-- =====================================================
-- TRIGGER: Update Invoice Status Based on Payments
-- =====================================================
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
DECLARE
  v_total_paid DECIMAL(10,2);
  v_invoice_total DECIMAL(10,2);
  v_new_status invoice_status;
BEGIN
  -- Calculate total paid for this invoice
  SELECT 
    COALESCE(SUM(amount), 0),
    i.total_amount
  INTO v_total_paid, v_invoice_total
  FROM payments p
  RIGHT JOIN invoices i ON i.id = COALESCE(NEW.invoice_id, OLD.invoice_id)
  WHERE p.status = 'completed'
    AND i.id = COALESCE(NEW.invoice_id, OLD.invoice_id)
  GROUP BY i.total_amount;
  
  -- Determine new status
  IF v_total_paid >= v_invoice_total THEN
    v_new_status := 'paid';
  ELSIF v_total_paid > 0 THEN
    v_new_status := 'partially_paid';
  ELSE
    v_new_status := 'pending';
  END IF;
  
  -- Update invoice status
  UPDATE invoices
  SET 
    status = v_new_status,
    updated_at = now()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_status
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_status();

COMMENT ON FUNCTION update_invoice_status IS 'Automatically update invoice status when payments change';

-- =====================================================
-- TRIGGER: Prevent Overpayment
-- =====================================================
CREATE OR REPLACE FUNCTION prevent_overpayment()
RETURNS TRIGGER AS $$
DECLARE
  v_total_paid DECIMAL(10,2);
  v_invoice_total DECIMAL(10,2);
BEGIN
  -- Get invoice total and already paid amount
  SELECT 
    i.total_amount,
    COALESCE(SUM(p.amount), 0)
  INTO v_invoice_total, v_total_paid
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = i.id AND p.status = 'completed' AND p.id != NEW.id
  WHERE i.id = NEW.invoice_id
  GROUP BY i.total_amount;
  
  -- Check if new payment would exceed invoice total
  IF v_total_paid + NEW.amount > v_invoice_total THEN
    RAISE EXCEPTION 'Payment amount would exceed invoice total. Invoice total: %, Already paid: %, Attempted payment: %',
      v_invoice_total, v_total_paid, NEW.amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_overpayment
BEFORE INSERT OR UPDATE ON payments
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION prevent_overpayment();

COMMENT ON FUNCTION prevent_overpayment IS 'Prevent payments that would exceed invoice total';

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoice_line_items')), 
    'invoice_line_items table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deposits')), 
    'deposits table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_rules')), 
    'pricing_rules table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'refunds')), 
    'refunds table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'financial_transactions')), 
    'financial_transactions view not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'daily_revenue_summary')), 
    'daily_revenue_summary view not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'outstanding_balances')), 
    'outstanding_balances view not created';
    
  RAISE NOTICE '✓ Billing system database schema created successfully';
  RAISE NOTICE '✓ Tables: invoice_line_items, deposits, pricing_rules, refunds';
  RAISE NOTICE '✓ Views: financial_transactions, daily_revenue_summary, outstanding_balances, revenue_by_room_type';
  RAISE NOTICE '✓ Functions: calculate_room_charges, generate_invoice_number, create_invoice_for_reservation';
  RAISE NOTICE '✓ Triggers: update_invoice_status, prevent_overpayment';
END $$;
