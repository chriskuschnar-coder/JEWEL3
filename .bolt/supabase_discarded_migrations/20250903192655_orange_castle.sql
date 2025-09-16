/*
  # Ensure payments table has transaction_hash column

  1. Changes
    - Verify and add transaction_hash column to payments table
    - Add proper constraints and indexes
*/

-- Ensure transaction_hash column exists with proper type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'transaction_hash'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN transaction_hash text;
  END IF;
END $$;

-- Ensure proper indexing
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash_new ON public.payments(transaction_hash) WHERE transaction_hash IS NOT NULL;