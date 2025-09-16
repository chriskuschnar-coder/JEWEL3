/*
  # Add metadata column to signed_documents table

  1. Changes
    - Add `metadata` column of type `jsonb` to `signed_documents` table
    - Set default value to empty JSON object
    - Allow null values for backward compatibility

  2. Purpose
    - Store additional document-related metadata during signing process
    - Support enhanced document tracking and audit trail
*/

-- Add metadata column to signed_documents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'signed_documents' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE signed_documents ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;