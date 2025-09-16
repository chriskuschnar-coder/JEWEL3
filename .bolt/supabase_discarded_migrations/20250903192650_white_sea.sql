/*
  # Clean up duplicate policies

  1. Security Updates
    - Remove duplicate RLS policies
    - Ensure clean policy state
*/

-- Clean up any duplicate policies on crypto_payment_invoices
DROP POLICY IF EXISTS "Users can view own crypto invoices" ON public.crypto_payment_invoices;
DROP POLICY IF EXISTS "Users can view own invoices" ON public.crypto_payment_invoices;

-- Create single, clean policy
CREATE POLICY "Users can view own crypto invoices"
  ON public.crypto_payment_invoices FOR SELECT
  TO public
  USING (auth.uid() = user_id);