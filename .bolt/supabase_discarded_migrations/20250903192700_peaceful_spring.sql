/*
  # Final transaction_hash column addition

  1. Changes
    - Ensure transaction_hash column exists in payments table
    - Add comprehensive indexing
*/

-- Final check and addition of transaction_hash column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'transaction_hash'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN transaction_hash text;
  END IF;
END $$;

-- Comprehensive indexing for transaction_hash
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash_final ON public.payments(transaction_hash) WHERE transaction_hash IS NOT NULL;