/*
  # Fix KYC Status Enum Implementation

  1. Database Schema
    - Create kyc_status_enum type with proper values
    - Add kyc_status column to users table
    - Add kyc_verified_at timestamp
    - Create webhook logging table
    - Add proper indexes and constraints

  2. Security
    - Enable RLS on new tables
    - Add policies for user access
*/

-- 1) Create the enum type (safe if already exists)
DO $$
BEGIN
  CREATE TYPE kyc_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2) Add kyc_status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'kyc_status'
  ) THEN
    ALTER TABLE public.users ADD COLUMN kyc_status kyc_status_enum DEFAULT 'unverified';
  END IF;
END $$;

-- 3) Add kyc_verified_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'kyc_verified_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN kyc_verified_at timestamptz;
  END IF;
END $$;

-- 4) Backfill existing users safely
UPDATE public.users
SET kyc_status = 'unverified'::kyc_status_enum
WHERE kyc_status IS NULL;

-- 5) Set NOT NULL constraint
ALTER TABLE public.users
ALTER COLUMN kyc_status SET NOT NULL;

-- 6) Create webhook logging table for debugging
CREATE TABLE IF NOT EXISTS kyc_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  webhook_payload jsonb,
  status text,
  processed_at timestamptz DEFAULT now(),
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- 7) Enable RLS on webhook logs
ALTER TABLE kyc_webhook_logs ENABLE ROW LEVEL SECURITY;

-- 8) Add policy for service role access
CREATE POLICY "Service role can manage webhook logs"
  ON kyc_webhook_logs
  FOR ALL
  TO service_role
  USING (true);

-- 9) Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON public.users (kyc_status);
CREATE INDEX IF NOT EXISTS idx_users_kyc_verified_at ON public.users (kyc_verified_at) WHERE kyc_verified_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kyc_webhook_logs_session_id ON kyc_webhook_logs (session_id);
CREATE INDEX IF NOT EXISTS idx_kyc_webhook_logs_user_id ON kyc_webhook_logs (user_id);

-- 10) Add comments for documentation
COMMENT ON COLUMN public.users.kyc_status IS 'KYC verification status: unverified (new), pending (submitted), verified (approved), rejected (failed)';
COMMENT ON COLUMN public.users.kyc_verified_at IS 'Timestamp when KYC verification was approved';
COMMENT ON TABLE kyc_webhook_logs IS 'Logs all KYC webhook events for debugging and audit trail';