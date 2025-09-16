/*
  # Fix crypto payment invoices constraints

  1. Constraints
    - Drop and recreate cryptocurrency constraint with proper values
    - Drop and recreate status constraint with proper values
  
  2. Security
    - Maintains existing RLS policies
    - No changes to table structure
*/

-- Cryptocurrency constraint
ALTER TABLE public.crypto_payment_invoices
DROP CONSTRAINT IF EXISTS crypto_payment_invoices_cryptocurrency_check;

ALTER TABLE public.crypto_payment_invoices
ADD CONSTRAINT crypto_payment_invoices_cryptocurrency_check
CHECK (cryptocurrency IN ('BTC','ETH','USDT','SOL'));

-- Status constraint
ALTER TABLE public.crypto_payment_invoices
DROP CONSTRAINT IF EXISTS crypto_payment_invoices_status_check;

ALTER TABLE public.crypto_payment_invoices
ADD CONSTRAINT crypto_payment_invoices_status_check
CHECK (status IN ('pending','partial','confirmed','expired','failed'));