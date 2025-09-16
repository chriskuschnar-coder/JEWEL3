/*
  # Add crypto payment invoices table

  1. New Tables
    - `crypto_payment_invoices` - Cryptocurrency payment tracking

  2. Security
    - Enable RLS on crypto_payment_invoices table
    - Add policies for users to manage their own crypto payments
*/

CREATE TABLE IF NOT EXISTS public.crypto_payment_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  cryptocurrency text NOT NULL CHECK (cryptocurrency IN ('BTC', 'ETH', 'USDT', 'SOL')),
  address text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'confirmed', 'expired', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  payment_address text NOT NULL DEFAULT '',
  transaction_hash text
);

ALTER TABLE public.crypto_payment_invoices ENABLE ROW LEVEL SECURITY;

-- Crypto payment invoices policies
DROP POLICY IF EXISTS "Users can view own crypto invoices" ON public.crypto_payment_invoices;
CREATE POLICY "Users can view own crypto invoices"
  ON public.crypto_payment_invoices FOR SELECT
  TO public
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own crypto invoices" ON public.crypto_payment_invoices;
CREATE POLICY "Users can insert own crypto invoices"
  ON public.crypto_payment_invoices FOR INSERT
  TO public
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System can update crypto invoices" ON public.crypto_payment_invoices;
CREATE POLICY "System can update crypto invoices"
  ON public.crypto_payment_invoices FOR UPDATE
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for service role" ON public.crypto_payment_invoices;
CREATE POLICY "Allow insert for service role"
  ON public.crypto_payment_invoices FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON public.crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON public.crypto_payment_invoices(status);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON public.crypto_payment_invoices(payment_address);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_hash ON public.crypto_payment_invoices(transaction_hash);

-- Create trigger function
CREATE OR REPLACE FUNCTION public.update_crypto_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_crypto_invoices_updated_at ON public.crypto_payment_invoices;
CREATE TRIGGER update_crypto_invoices_updated_at
  BEFORE UPDATE ON public.crypto_payment_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_crypto_invoices_updated_at();