/*
  # Add subscription agreement fields to users table

  1. New Columns
    - `subscription_signed_at` (timestamp) - When user signed subscription agreement
    - `subscription_signed_url` (text) - URL to signed agreement document

  2. Security
    - No additional RLS policies needed (inherits from users table)
*/

-- Add subscription agreement fields to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_signed_at'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_signed_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_signed_url'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_signed_url text;
  END IF;
END $$;

-- Add index for subscription queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_signed 
ON users(subscription_signed_at) 
WHERE subscription_signed_at IS NOT NULL;