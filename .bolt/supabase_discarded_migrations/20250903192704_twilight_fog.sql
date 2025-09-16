/*
  # Ensure transaction_hash column exists

  1. Changes
    - Final verification of transaction_hash column in payments table
    - Add proper indexing
*/

-- Ensure transaction_hash column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'transaction_hash'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN transaction_hash text;
  END IF;
END $$;

-- Add final index
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash_v3 ON public.payments(transaction_hash) WHERE transaction_hash IS NOT NULL;