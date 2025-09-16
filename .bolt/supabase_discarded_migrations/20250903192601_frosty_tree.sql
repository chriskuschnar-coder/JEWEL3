/*
  # Add crypto addresses table

  1. New Tables
    - `crypto_addresses` - Cryptocurrency wallet addresses for payments

  2. Security
    - Enable RLS on crypto_addresses table
    - Add policy for users to view their own crypto addresses
*/

CREATE TABLE IF NOT EXISTS public.crypto_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  currency text NOT NULL CHECK (currency IN ('BTC', 'ETH', 'USDC', 'USDT', 'MATIC')),
  address text NOT NULL,
  private_key_encrypted text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  total_received numeric(20,8) DEFAULT 0,
  payment_count integer DEFAULT 0
);

ALTER TABLE public.crypto_addresses ENABLE ROW LEVEL SECURITY;

-- Crypto addresses policies
DROP POLICY IF EXISTS "Users can view own crypto addresses" ON public.crypto_addresses;
CREATE POLICY "Users can view own crypto addresses"
  ON public.crypto_addresses FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_user_id ON public.crypto_addresses(user_id);