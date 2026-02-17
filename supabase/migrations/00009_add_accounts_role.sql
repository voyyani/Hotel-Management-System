-- =====================================================
-- Migration: 00009_add_accounts_role.sql
-- Description: Add 'accounts' role to user_role enum
-- Author: HMS Development Team
-- Date: 2026-02-16
-- Dependencies: 00001_create_enums.sql
-- =====================================================

-- Add 'accounts' role to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accounts';

-- Update comment to reflect new role
COMMENT ON TYPE user_role IS 'User roles for role-based access control: admin, manager, receptionist, housekeeping, accounts';

-- Note: PostgreSQL does not allow removing enum values easily.
-- To reorder or remove values, you would need to:
-- 1. Create a new enum type
-- 2. Migrate data
-- 3. Drop old type
-- 4. Rename new type
-- For this migration, we're only adding the 'accounts' role.
