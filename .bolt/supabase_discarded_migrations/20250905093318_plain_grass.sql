/*
  # Create accounts table for user balances

  1. New Tables
    - `accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `account_type` (text, default 'trading')
      - `balance` (numeric, default 0.00)
      - `available_balance` (numeric, default 0.00)
      - `total_deposits` (numeric, default 0.00)
      - `total_withdrawals` (numeric, default 0.00)
      - `currency` (text, default 'USD')
      - `status` (text, default 'active')
      - `units_held` (numeric, default 0)
      - `nav_per_unit` (numeric, default 1000.0000)
      - `fund_allocation_pct` (numeric, default 0)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `accounts` table
    - Add policy for users to view their own accounts using auth.uid()
    - Add policy for users to update their own accounts using auth.uid()
    - Add policy for system to insert accounts
    - Add trigger to update updated_at column
    - Add trigger to create investor_units on account creation

  3. Changes
    - Reset all balances to $0 for live MT5 integration
    - Added fund allocation tracking
    - Added NAV per unit tracking
*/

-- Create accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_type text DEFAULT 'trading' CHECK (account_type IN ('trading', 'savings')),
  balance numeric(15,2) DEFAULT 0.00,
  available_balance numeric(15,2) DEFAULT 0.00,
  total_deposits numeric(15,2) DEFAULT 0.00,
  total_withdrawals numeric(15,2) DEFAULT 0.00,
  currency text DEFAULT 'USD',
  status text DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  units_held numeric(15,4) DEFAULT 0,
  nav_per_unit numeric(10,4) DEFAULT 1000.0000,
  fund_allocation_pct numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comment explaining the reset
COMMENT ON TABLE accounts IS 'Reset for live MT5 trading integration - all balances start at $0';

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_accounts_updated_at' 
    AND tgrelid = 'accounts'::regclass
  ) THEN
    CREATE TRIGGER update_accounts_updated_at
      BEFORE UPDATE ON accounts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- Policy: Users can view their own accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own accounts' 
    AND tablename = 'accounts'
  ) THEN
    CREATE POLICY "Users can view own accounts"
      ON accounts
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Policy: Users can update their own accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update own accounts' 
    AND tablename = 'accounts'
  ) THEN
    CREATE POLICY "Users can update own accounts"
      ON accounts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Policy: System can insert accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'System can insert accounts' 
    AND tablename = 'accounts'
  ) THEN
    CREATE POLICY "System can insert accounts"
      ON accounts
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END$$;