/*
  # Add KYC Status Column with Proper Enum Handling

  1. New Enum Type
    - `kyc_status_enum` with values ('unverified', 'pending', 'verified', 'rejected')
  
  2. Column Addition
    - Add `kyc_status` column to users table with default 'unverified'
    - Backfill existing users with proper enum casting
    - Set NOT NULL constraint
  
  3. Security
    - Maintain existing RLS policies
    - Add index for performance
*/

-- 1) Create the enum type (safe if already exists)
DO $$
BEGIN
  CREATE TYPE kyc_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2) Add the column with proper default
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS kyc_status kyc_status_enum DEFAULT 'unverified';

-- 3) Backfill existing users with proper enum casting
UPDATE public.users
SET kyc_status = COALESCE(kyc_status, 'unverified'::kyc_status_enum);

-- 4) Set NOT NULL constraint
ALTER TABLE public.users
ALTER COLUMN kyc_status SET NOT NULL;

-- 5) Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON public.users (kyc_status);

-- 6) Add comment for documentation
COMMENT ON COLUMN public.users.kyc_status IS 'KYC verification status: unverified (new), pending (submitted), verified (approved), rejected (failed)';