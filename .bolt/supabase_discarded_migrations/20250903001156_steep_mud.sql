/*
  # Crypto Payment System - Nuclear Fix

  1. New Tables
    - `crypto_payment_invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `amount_usd` (numeric, investment amount)
      - `cryptocurrency` (text, BTC/ETH/USDT/SOL)
      - `crypto_amount` (numeric, crypto amount to send)
      - `payment_address` (text, generated payment address)
      - `status` (text, pending/partial/confirmed/expired/failed)
      - `expires_at` (timestamptz, payment expiration)
      - `paid_at` (timestamptz, when payment confirmed)
      - `transaction_hash` (text, blockchain transaction)
      - `confirmations` (integer, blockchain confirmations)
      - `metadata` (jsonb, additional data)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `crypto_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `currency` (text, BTC/ETH/USDC/USDT/MATIC)
      - `address` (text, wallet address)
      - `private_key_encrypted` (text, encrypted private key)
      - `is_active` (boolean, address status)
      - `created_at` (timestamptz)
      - `last_used_at` (timestamptz)
      - `total_received` (numeric, total received)
      - `payment_count` (integer, number of payments)

  2. Security
    - Enable RLS on both tables
    - NUCLEAR FIX: Drop all existing policies first
    - Create fresh policies for proper access control

  3. Performance
    - Indexes on user_id, status, payment_address, transaction_hash
    - Update triggers for timestamp management
*/

-- NUCLEAR OPTION: Drop all existing policies first to prevent conflicts
DROP POLICY IF EXISTS "Users can insert own crypto invoices" ON crypto_payment_invoices;
DROP POLICY IF EXISTS "Users can view own crypto invoices" ON crypto_payment_invoices;
DROP POLICY IF EXISTS "System can update crypto invoices" ON crypto_payment_invoices;
DROP POLICY IF EXISTS "Users can view own crypto addresses" ON crypto_addresses;

-- Create crypto_payment_invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS crypto_payment_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_usd numeric(15,2) NOT NULL,
  cryptocurrency text NOT NULL,
  crypto_amount numeric(20,8) NOT NULL,
  payment_address text NOT NULL,
  status text DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  paid_at timestamptz,
  transaction_hash text,
  confirmations integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT crypto_payment_invoices_cryptocurrency_check 
    CHECK (cryptocurrency = ANY (ARRAY['BTC'::text, 'ETH'::text, 'USDT'::text, 'SOL'::text])),
  CONSTRAINT crypto_payment_invoices_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'partial'::text, 'confirmed'::text, 'expired'::text, 'failed'::text]))
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'crypto_payment_invoices_user_id_fkey'
  ) THEN
    ALTER TABLE crypto_payment_invoices 
    ADD CONSTRAINT crypto_payment_invoices_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END $$;

-- Create crypto_addresses table if it doesn't exist
CREATE TABLE IF NOT EXISTS crypto_addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  currency text NOT NULL,
  address text NOT NULL,
  private_key_encrypted text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  total_received numeric(20,8) DEFAULT 0,
  payment_count integer DEFAULT 0,
  
  CONSTRAINT crypto_addresses_currency_check 
    CHECK (currency = ANY (ARRAY['BTC'::text, 'ETH'::text, 'USDC'::text, 'USDT'::text, 'MATIC'::text]))
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'crypto_addresses_user_id_fkey'
  ) THEN
    ALTER TABLE crypto_addresses 
    ADD CONSTRAINT crypto_addresses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END $$;

-- Enable RLS on both tables
ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;

-- Create fresh RLS policies (after dropping any existing ones)
CREATE POLICY "Users can insert own crypto invoices"
  ON crypto_payment_invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own crypto invoices"
  ON crypto_payment_invoices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can update crypto invoices"
  ON crypto_payment_invoices
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own crypto addresses"
  ON crypto_addresses
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON crypto_payment_invoices(status);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON crypto_payment_invoices(payment_address);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_hash ON crypto_payment_invoices(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_user_id ON crypto_addresses(user_id);

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_crypto_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_crypto_invoices_updated_at ON crypto_payment_invoices;
CREATE TRIGGER update_crypto_invoices_updated_at
  BEFORE UPDATE ON crypto_payment_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_crypto_invoices_updated_at();