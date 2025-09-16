/*
  # Create accounts table

  1. New Tables
    - `accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users, unique)
      - `account_type` (text, default 'trading')
      - `balance` (numeric, default 0.00)
      - `available_balance` (numeric, default 0.00)
      - `total_deposits` (numeric, default 0.00)
      - `total_withdrawals` (numeric, default 0.00)
      - `currency` (text, default 'USD')
      - `status` (text, default 'active')
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `accounts` table
    - Add policies for users to view/update their own accounts
    - Add policy for system to insert accounts

  3. Constraints
    - Unique constraint on user_id (one account per user)
    - Check constraints for valid account types and statuses
*/

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id),
  account_type text DEFAULT 'trading' CHECK (account_type IN ('trading', 'savings')),
  balance numeric(15,2) DEFAULT 0.00,
  available_balance numeric(15,2) DEFAULT 0.00,
  total_deposits numeric(15,2) DEFAULT 0.00,
  total_withdrawals numeric(15,2) DEFAULT 0.00,
  currency text DEFAULT 'USD',
  status text DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert accounts"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);