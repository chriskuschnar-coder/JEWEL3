/*
  # Create investor_units table for fund allocations

  1. New Tables
    - `investor_units`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `account_id` (uuid, foreign key to accounts)
      - `units_held` (numeric, default 0)
      - `avg_purchase_nav` (numeric, default 1000.0000)
      - `total_invested` (numeric, default 0)
      - `current_value` (numeric, default 0)
      - `unrealized_pnl` (numeric, default 0)
      - `last_nav_update` (timestamp, default now)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `investor_units` table
    - Add policy for users to read their own unit holdings using auth.uid()
    - Add policy for service role to manage all unit holdings
    - Add unique constraint on user_id, account_id

  3. Changes
    - All users start with 0 units for live MT5 integration
    - Fund allocations will be calculated based on deposits and NAV
*/

-- Create investor_units table if it doesn't exist
CREATE TABLE IF NOT EXISTS investor_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  units_held numeric(15,4) DEFAULT 0 NOT NULL,
  avg_purchase_nav numeric(10,4) DEFAULT 1000.0000 NOT NULL,
  total_invested numeric(15,2) DEFAULT 0 NOT NULL,
  current_value numeric(15,2) DEFAULT 0 NOT NULL,
  unrealized_pnl numeric(15,2) DEFAULT 0 NOT NULL,
  last_nav_update timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, account_id)
);

-- Enable RLS
ALTER TABLE investor_units ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_investor_units_user ON investor_units(user_id);

-- Policy: Users can read their own unit holdings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read own unit holdings' 
    AND tablename = 'investor_units'
  ) THEN
    CREATE POLICY "Users can read own unit holdings"
      ON investor_units
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Policy: Users can view their own investor_units
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own investor_units' 
    AND tablename = 'investor_units'
  ) THEN
    CREATE POLICY "Users can view own investor_units"
      ON investor_units
      FOR SELECT
      TO public
      USING (user_id = auth.uid());
  END IF;
END$$;

-- Policy: Service role can manage all unit holdings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Service role can manage all unit holdings' 
    AND tablename = 'investor_units'
  ) THEN
    CREATE POLICY "Service role can manage all unit holdings"
      ON investor_units
      FOR ALL
      TO service_role
      USING (true);
  END IF;
END$$;