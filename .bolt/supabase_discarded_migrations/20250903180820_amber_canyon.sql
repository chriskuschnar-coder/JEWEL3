/*
  # Create crypto payment invoices table

  1. New Tables
    - `crypto_payment_invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `amount` (numeric, payment amount)
      - `cryptocurrency` (text, crypto type)
      - `address` (text, payment address)
      - `status` (text, default 'pending')
      - `payment_address` (text, actual payment address)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `crypto_payment_invoices` table
    - Add policies for users to view and insert their own invoices
*/

CREATE TABLE IF NOT EXISTS crypto_payment_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  cryptocurrency text NOT NULL CHECK (cryptocurrency IN ('BTC', 'ETH', 'USDT', 'SOL')),
  address text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'confirmed', 'expired', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  payment_address text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON crypto_payment_invoices(status);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON crypto_payment_invoices(payment_address);

ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crypto invoices"
  ON crypto_payment_invoices
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own crypto invoices"
  ON crypto_payment_invoices
  FOR INSERT
  TO public
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update crypto invoices"
  ON crypto_payment_invoices
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow insert for service role"
  ON crypto_payment_invoices
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_crypto_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crypto_invoices_updated_at
  BEFORE UPDATE ON crypto_payment_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_crypto_invoices_updated_at();