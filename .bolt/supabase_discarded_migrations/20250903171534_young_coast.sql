/*
  # Create crypto payment invoices table

  1. New Tables
    - `crypto_payment_invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `amount` (numeric, not null)
      - `cryptocurrency` (text, not null)
      - `address` (text, not null)
      - `payment_address` (text, not null)
      - `status` (text, default 'pending')
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `crypto_payment_invoices` table
    - Add policies for users to view their own invoices
    - Add policy for service role to insert invoices

  3. Constraints
    - Check constraint for valid cryptocurrencies
    - Check constraint for positive amounts
    - Check constraint for valid statuses
*/

-- Create crypto payment invoices table
CREATE TABLE IF NOT EXISTS crypto_payment_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  cryptocurrency text NOT NULL CHECK (cryptocurrency IN ('BTC', 'ETH', 'USDT')),
  address text NOT NULL,
  payment_address text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'confirmed', 'expired', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own invoices"
  ON crypto_payment_invoices
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for service role"
  ON crypto_payment_invoices
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON crypto_payment_invoices(status);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON crypto_payment_invoices(address);