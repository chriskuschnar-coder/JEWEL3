/*
  # Add KYC Status Column to Users Table

  1. Schema Changes
    - Add `kyc_status` column to users table with enum values
    - Set default value to 'unverified'
    - Add index for efficient querying

  2. Data Migration
    - Update existing users based on current verification state
    - Preserve existing verification data

  3. Security
    - Maintain existing RLS policies
    - Add index for performance
*/

-- Create enum type for KYC status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status_enum') THEN
    CREATE TYPE kyc_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');
  END IF;
END $$;

-- Add kyc_status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'kyc_status'
  ) THEN
    ALTER TABLE users ADD COLUMN kyc_status kyc_status_enum DEFAULT 'unverified';
  END IF;
END $$;

-- Update existing users based on current verification state
UPDATE users 
SET kyc_status = CASE 
  WHEN kyc_status IS NULL THEN 'verified'::kyc_status_enum
  ELSE kyc_status
END
WHERE kyc_status = 'verified' OR documents_completed = true;

-- Add index for efficient KYC status queries
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);

-- Add index for KYC status and user ID combination
CREATE INDEX IF NOT EXISTS idx_users_kyc_status_id ON users(id, kyc_status);