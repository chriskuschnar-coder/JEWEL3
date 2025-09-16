/*
  # Create transactions table for funding history

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `account_id` (uuid, references accounts)
      - `type` (text, deposit/withdrawal/fee/interest/trade)
      - `method` (text, stripe/plaid/crypto/wire/internal)
      - `amount` (numeric)
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
    - Add policy for users to view their own transactions
    - Add policy for users to insert their own transactions
*/

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  account_id uuid NOT NULL REFERENCES accounts(id),
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Policy for users to view their own transactions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own transactions fixed' 
    AND tablename = 'transactions'
  ) THEN
    CREATE POLICY "Users can view own transactions fixed"
    ON transactions
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Policy for users to insert their own transactions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert own transactions fixed' 
    AND tablename = 'transactions'
  ) THEN
    CREATE POLICY "Users can insert own transactions fixed"
    ON transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;