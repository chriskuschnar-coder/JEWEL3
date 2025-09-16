/*
  # Add phone number and 2FA fields to users table

  1. Schema Changes
    - Add `phone` column to users table for SMS 2FA
    - Add `two_factor_enabled` column to track 2FA status
    - Add `two_factor_method` column to store preferred method (email/sms/biometric)
    - Add `two_factor_backup_codes` for recovery codes

  2. Security
    - Phone numbers are optional but recommended for 2FA
    - 2FA method defaults to 'email' if enabled
    - Backup codes are encrypted JSON array

  3. Indexes
    - Add index on phone number for quick lookups
    - Add index on two_factor_enabled for filtering
*/

-- Add phone number and 2FA fields to users table
DO $$
BEGIN
  -- Add phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone text;
  END IF;

  -- Add two_factor_enabled column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'two_factor_enabled'
  ) THEN
    ALTER TABLE users ADD COLUMN two_factor_enabled boolean DEFAULT false;
  END IF;

  -- Add two_factor_method column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'two_factor_method'
  ) THEN
    ALTER TABLE users ADD COLUMN two_factor_method text DEFAULT 'email';
  END IF;

  -- Add two_factor_backup_codes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'two_factor_backup_codes'
  ) THEN
    ALTER TABLE users ADD COLUMN two_factor_backup_codes jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add constraint for two_factor_method
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_two_factor_method_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_two_factor_method_check 
    CHECK (two_factor_method IN ('email', 'sms', 'biometric'));
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled);

-- Create table for storing 2FA verification codes
CREATE TABLE IF NOT EXISTS two_factor_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code text NOT NULL,
  method text NOT NULL CHECK (method IN ('email', 'sms')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on two_factor_codes
ALTER TABLE two_factor_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for two_factor_codes
CREATE POLICY "Users can manage own 2FA codes"
  ON two_factor_codes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create index for quick code lookups
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_user_id ON two_factor_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_expires_at ON two_factor_codes(expires_at);