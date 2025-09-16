/*
  # Add transaction_hash to payments table

  1. Changes
    - Add transaction_hash column to payments table
    - Add proper indexing
*/

-- Add transaction_hash column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'transaction_hash'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN transaction_hash text;
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash_graceful ON public.payments(transaction_hash) WHERE transaction_hash IS NOT NULL;