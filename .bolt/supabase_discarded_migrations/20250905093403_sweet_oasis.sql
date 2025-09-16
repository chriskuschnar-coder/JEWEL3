/*
  # Create transactions table for transaction history

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `account_id` (uuid, foreign key to accounts)
      - `type` (text, deposit/withdrawal/fee/interest/trade)
      - `method` (text, stripe/plaid/crypto/wire/internal)
      - `amount` (numeric, not null)
      - `fee` (numeric, default 0.00)
      - `status` (text, default 'pending')
      - `external_id` (text, optional)
      - `reference_id` (text, optional)
      - `description` (text, optional)
      - `metadata` (jsonb, default '{}')
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for users to view their own transactions using auth.uid()
    - Add policy for users to insert their own transactions using auth.uid()
    - Add trigger to update updated_at column
    - Add indexes for performance

  3. Changes
    - Complete transaction tracking system
    - Support for multiple payment methods
    - External ID tracking for payment processors
*/

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'fee', 'interest', 'trade')),
  method text CHECK (method IN ('stripe', 'plaid', 'crypto', 'wire', 'internal')),
  amount numeric(15,2) NOT NULL,
  fee numeric(15,2) DEFAULT 0.00,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  external_id text,
  reference_id text,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Add trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_transactions_updated_at' 
    AND tgrelid = 'transactions'::regclass
  ) THEN
    CREATE TRIGGER update_transactions_updated_at
      BEFORE UPDATE ON transactions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- Policy: Users can view their own transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own transactions' 
    AND tablename = 'transactions'
  ) THEN
    CREATE POLICY "Users can view own transactions"
      ON transactions
      FOR SELECT
      TO public
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Policy: Users can insert their own transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert own transactions' 
    AND tablename = 'transactions'
  ) THEN
    CREATE POLICY "Users can insert own transactions"
      ON transactions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;