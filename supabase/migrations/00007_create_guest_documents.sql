-- =====================================================
-- Migration: 00007_create_guest_documents.sql
-- Description: Create guest_documents table and storage bucket
-- Author: Grace Mawia Kamami
-- Date: 2026-02-16
-- Dependencies: 00002_create_tables.sql
-- =====================================================

-- =====================================================
-- GUEST DOCUMENTS TABLE
-- =====================================================
CREATE TABLE guest_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'passport', 'id_card', 'driver_license', 'other'
  document_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE guest_documents IS 'Guest document storage metadata';
COMMENT ON COLUMN guest_documents.document_type IS 'Type of document: passport, id_card, driver_license, other';
COMMENT ON COLUMN guest_documents.file_path IS 'Path to file in Supabase Storage';
COMMENT ON COLUMN guest_documents.uploaded_by IS 'Staff member who uploaded the document';

-- Create index for fast guest document lookups
CREATE INDEX idx_guest_documents_guest_id ON guest_documents(guest_id);
CREATE INDEX idx_guest_documents_type ON guest_documents(document_type);

-- =====================================================
-- STORAGE BUCKET SETUP
-- =====================================================
-- Create storage bucket for guest documents (run this manually in Supabase Dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('guest-documents', 'guest-documents', false);

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guest_documents')), 
    'guest_documents table not created';
  
  RAISE NOTICE '✓ guest_documents table created successfully';
END $$;
