/*
  # Ensure transaction_hash column in payments table

  1. Changes
    - Verify transaction_hash column exists in payments table
    - Add indexing for performance
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

-- Add index
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash_bright ON public.payments(transaction_hash) WHERE transaction_hash IS NOT NULL;