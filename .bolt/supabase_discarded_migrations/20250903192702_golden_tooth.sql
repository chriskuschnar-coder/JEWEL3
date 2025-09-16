/*
  # Add transaction_hash to payments table (final)

  1. Changes
    - Add transaction_hash column to payments table
    - Ensure proper indexing and constraints
*/

-- Add transaction_hash column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'transaction_hash'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN transaction_hash text;
  END IF;
END $$;

-- Add index
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash_v2 ON public.payments(transaction_hash) WHERE transaction_hash IS NOT NULL;