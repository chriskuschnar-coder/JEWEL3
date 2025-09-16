/*
  # Update payments table structure

  1. Changes
    - Ensure transaction_hash column exists in payments table
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

-- Add index for transaction_hash if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash ON public.payments(transaction_hash) WHERE transaction_hash IS NOT NULL;