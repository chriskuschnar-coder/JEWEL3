/*
  # Create fund_transactions table for fund operations

  1. New Tables
    - `fund_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `account_id` (uuid, foreign key to accounts)
      - `type` (text, subscription/redemption/distribution)
      - `amount` (numeric, not null)
      - `units` (numeric, default 0)
      - `nav_per_unit` (numeric, default 1000.0000)
      - `status` (text, default 'pending')
      - `settlement_date` (date, optional)
      - `bank_reference` (text, optional)
      - `notes` (text, optional)
      - `metadata` (jsonb, default '{}')
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `fund_transactions` table
    - Add policy for users to read their own fund transactions using auth.uid()
    - Add policy for users to insert their own fund transactions using auth.uid()
    - Add policy for service role to manage all fund transactions
    - Add indexes for performance

  3. Changes
    - Fund-level transaction tracking
    - Unit allocation and NAV tracking
    - Settlement and reference tracking
*/

-- Create fund_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS fund_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('subscription', 'redemption', 'distribution')),
  amount numeric(15,2) NOT NULL,
  units numeric(15,4) DEFAULT 0 NOT NULL,
  nav_per_unit numeric(10,4) DEFAULT 1000.0000 NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'processed', 'cancelled')),
  settlement_date date,
  bank_reference text,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE fund_transactions ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fund_transactions_user ON fund_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_type ON fund_transactions(type);

-- Policy: Users can read their own fund transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read own fund transactions' 
    AND tablename = 'fund_transactions'
  ) THEN
    CREATE POLICY "Users can read own fund transactions"
      ON fund_transactions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Policy: Users can insert their own fund transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert own fund transactions' 
    AND tablename = 'fund_transactions'
  ) THEN
    CREATE POLICY "Users can insert own fund transactions"
      ON fund_transactions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Policy: Service role can manage all fund transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Service role can manage all fund transactions' 
    AND tablename = 'fund_transactions'
  ) THEN
    CREATE POLICY "Service role can manage all fund transactions"
      ON fund_transactions
      FOR ALL
      TO service_role
      USING (true);
  END IF;
END$$;