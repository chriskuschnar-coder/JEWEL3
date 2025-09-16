/*
  # Crypto Payment Infrastructure

  1. New Tables
    - `crypto_payment_invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `amount_usd` (numeric, USD amount)
      - `cryptocurrency` (text, BTC/ETH/USDT/SOL)
      - `crypto_amount` (numeric, crypto amount to receive)
      - `payment_address` (text, generated address)
      - `status` (text, pending/partial/confirmed/expired/failed)
      - `expires_at` (timestamp, 24 hour expiration)
      - `paid_at` (timestamp, when payment confirmed)
      - `transaction_hash` (text, blockchain transaction)
      - `confirmations` (integer, blockchain confirmations)
      - `metadata` (jsonb, additional data)

  2. Security
    - Enable RLS on crypto_payment_invoices table
    - Add policies for users to manage own invoices
    - Add system policy for webhook updates

  3. Indexes
    - Payment address lookup
    - Transaction hash lookup
    - User ID lookup
    - Status filtering
</*/

CREATE TABLE IF NOT EXISTS crypto_payment_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  amount_usd numeric(15,2) NOT NULL,
  cryptocurrency text NOT NULL CHECK (cryptocurrency = ANY (ARRAY['BTC', 'ETH', 'USDT', 'SOL'])),
  crypto_amount numeric(20,8) NOT NULL,
  payment_address text NOT NULL,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'partial', 'confirmed', 'expired', 'failed'])),
  expires_at timestamptz NOT NULL,
  paid_at timestamptz,
  transaction_hash text,
  confirmations integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert own crypto invoices"
  ON crypto_payment_invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own crypto invoices"
  ON crypto_payment_invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can update crypto invoices"
  ON crypto_payment_invoices
  FOR UPDATE
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON crypto_payment_invoices(payment_address);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_hash ON crypto_payment_invoices(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON crypto_payment_invoices(status);

-- Update trigger
CREATE OR REPLACE FUNCTION update_crypto_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crypto_invoices_updated_at
  BEFORE UPDATE ON crypto_payment_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_crypto_invoices_updated_at();