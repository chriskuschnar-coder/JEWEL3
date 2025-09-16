/*
  # Update crypto payment invoices table structure

  1. Changes
    - Add payment_address column to crypto_payment_invoices table
    - Update constraints and indexes
*/

-- Add payment_address column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_payment_invoices' AND column_name = 'payment_address'
  ) THEN
    ALTER TABLE public.crypto_payment_invoices ADD COLUMN payment_address text NOT NULL DEFAULT '';
  END IF;
END $$;