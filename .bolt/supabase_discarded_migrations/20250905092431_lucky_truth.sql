/*
  # Create accounts table for user balances

  1. New Tables
    - `accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
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
    - Add policy for users to view their own accounts
    - Add policy for users to update their own accounts
    - Add policy for system to insert accounts
*/

-- Create accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
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

-- Create unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'accounts_user_id_key'
  ) THEN
    ALTER TABLE accounts ADD CONSTRAINT accounts_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Policy for users to view their own accounts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own accounts fixed' 
    AND tablename = 'accounts'
  ) THEN
    CREATE POLICY "Users can view own accounts fixed"
    ON accounts
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Policy for users to update their own accounts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update own accounts fixed' 
    AND tablename = 'accounts'
  ) THEN
    CREATE POLICY "Users can update own accounts fixed"
    ON accounts
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  -- Policy for system to insert accounts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'System can insert accounts fixed' 
    AND tablename = 'accounts'
  ) THEN
    CREATE POLICY "System can insert accounts fixed"
    ON accounts
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;