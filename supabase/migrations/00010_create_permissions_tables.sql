-- =====================================================
-- Migration: 00010_create_permissions_tables.sql
-- Description: Create permissions and role_permissions tables for RBAC
-- Author: HMS Development Team
-- Date: 2026-02-16
-- Dependencies: 00001_create_enums.sql, 00009_add_accounts_role.sql
-- =====================================================

-- =====================================================
-- PERMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE permissions IS 'System permissions for role-based access control';
COMMENT ON COLUMN permissions.name IS 'Unique permission identifier (e.g., "rooms.create")';
COMMENT ON COLUMN permissions.module IS 'Module/feature area (e.g., "rooms", "guests", "billing")';
COMMENT ON COLUMN permissions.action IS 'Action type (e.g., "create", "read", "update", "delete", "execute")';

-- Index for faster permission lookups
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_module ON permissions(module);

-- =====================================================
-- ROLE_PERMISSIONS JUNCTION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_role_permission UNIQUE(role, permission_id)
);

COMMENT ON TABLE role_permissions IS 'Maps roles to their assigned permissions';
COMMENT ON COLUMN role_permissions.role IS 'User role (from user_role enum)';
COMMENT ON COLUMN role_permissions.permission_id IS 'Reference to permissions table';

-- Indexes for faster role permission lookups
CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
  user_id UUID,
  permission_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role;
  has_perm BOOLEAN;
BEGIN
  -- Get user's role from profiles
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id AND is_active = true;
  
  -- If user not found or not active, return false
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Admin and Manager have all permissions
  IF user_role IN ('admin', 'manager') THEN
    RETURN true;
  END IF;
  
  -- Check if role has the specific permission
  SELECT EXISTS(
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = user_role
    AND p.name = permission_name
  ) INTO has_perm;
  
  RETURN COALESCE(has_perm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_has_permission IS 'Check if a user has a specific permission based on their role';

-- Function to get all permissions for a role
CREATE OR REPLACE FUNCTION get_role_permissions(
  role_name user_role
) RETURNS TABLE (
  permission_id UUID,
  permission_name VARCHAR,
  permission_description TEXT,
  module VARCHAR,
  action VARCHAR
) AS $$
BEGIN
  -- Admin and Manager have all permissions
  IF role_name IN ('admin', 'manager') THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.name,
      p.description,
      p.module,
      p.action
    FROM permissions p
    ORDER BY p.module, p.action;
  ELSE
    -- Return only assigned permissions for other roles
    RETURN QUERY
    SELECT 
      p.id,
      p.name,
      p.description,
      p.module,
      p.action
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.id
    WHERE rp.role = role_name
    ORDER BY p.module, p.action;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_role_permissions IS 'Get all permissions for a specific role';

-- =====================================================
-- SEED DEFAULT PERMISSIONS
-- =====================================================

-- Insert all permissions from the PERMISSIONS constant
INSERT INTO permissions (name, description, module, action) VALUES
  -- Dashboard permissions
  ('dashboard.view', 'View personal dashboard', 'dashboard', 'read'),
  ('dashboard.view_all', 'View all dashboard data', 'dashboard', 'read'),
  
  -- Rooms permissions
  ('rooms.view', 'View rooms', 'rooms', 'read'),
  ('rooms.create', 'Create new rooms', 'rooms', 'create'),
  ('rooms.update', 'Update room details', 'rooms', 'update'),
  ('rooms.delete', 'Delete rooms', 'rooms', 'delete'),
  ('rooms.update_status', 'Update room status', 'rooms', 'update'),
  
  -- Guests permissions
  ('guests.view', 'View guest information', 'guests', 'read'),
  ('guests.create', 'Create new guests', 'guests', 'create'),
  ('guests.update', 'Update guest information', 'guests', 'update'),
  ('guests.delete', 'Delete guests', 'guests', 'delete'),
  
  -- Reservations permissions
  ('reservations.view', 'View reservations', 'reservations', 'read'),
  ('reservations.create', 'Create new reservations', 'reservations', 'create'),
  ('reservations.update', 'Update reservations', 'reservations', 'update'),
  ('reservations.delete', 'Delete reservations', 'reservations', 'delete'),
  ('reservations.cancel', 'Cancel reservations', 'reservations', 'execute'),
  
  -- Front Desk permissions
  ('frontdesk.access', 'Access front desk module', 'frontdesk', 'read'),
  ('frontdesk.checkin', 'Process guest check-ins', 'frontdesk', 'execute'),
  ('frontdesk.checkout', 'Process guest check-outs', 'frontdesk', 'execute'),
  ('frontdesk.room_change', 'Change guest room assignments', 'frontdesk', 'execute'),
  
  -- Billing permissions
  ('billing.view', 'View invoices and payments', 'billing', 'read'),
  ('billing.create', 'Create invoices', 'billing', 'create'),
  ('billing.update', 'Update invoices', 'billing', 'update'),
  ('billing.process_payment', 'Process payments', 'billing', 'execute'),
  ('billing.refund', 'Process refunds', 'billing', 'execute'),
  
  -- Analytics permissions
  ('analytics.view', 'View analytics', 'analytics', 'read'),
  ('analytics.financial', 'View financial analytics', 'analytics', 'read'),
  ('analytics.operational', 'View operational analytics', 'analytics', 'read'),
  
  -- System permissions
  ('system.settings', 'Manage system settings', 'system', 'update'),
  ('users.manage', 'Manage users and roles', 'system', 'update'),
  ('audit.view', 'View audit logs', 'system', 'read')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ASSIGN PERMISSIONS TO ROLES
-- =====================================================

-- Receptionist permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'receptionist', id FROM permissions WHERE name IN (
  'dashboard.view',
  'rooms.view',
  'guests.view',
  'guests.create',
  'guests.update',
  'reservations.view',
  'reservations.create',
  'reservations.update',
  'frontdesk.access',
  'frontdesk.checkin',
  'frontdesk.checkout',
  'frontdesk.room_change',
  'billing.view'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Accounts permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'accounts', id FROM permissions WHERE name IN (
  'dashboard.view',
  'rooms.view',
  'guests.view',
  'reservations.view',
  'billing.view',
  'billing.create',
  'billing.update',
  'billing.process_payment',
  'billing.refund',
  'analytics.view',
  'analytics.financial',
  'analytics.operational'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Housekeeping permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'housekeeping', id FROM permissions WHERE name IN (
  'dashboard.view',
  'rooms.view',
  'rooms.update_status',
  'reservations.view'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Note: Admin and Manager roles are handled by the get_role_permissions function
-- They automatically have all permissions
