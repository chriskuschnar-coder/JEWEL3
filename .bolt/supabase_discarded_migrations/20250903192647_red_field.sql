/*
  # Update crypto payment invoices policies

  1. Security Updates
    - Update RLS policies for crypto_payment_invoices table
    - Ensure proper access control
*/

-- Update crypto payment invoices policies
DROP POLICY IF EXISTS "Users can view own invoices" ON public.crypto_payment_invoices;
CREATE POLICY "Users can view own invoices"
  ON public.crypto_payment_invoices FOR SELECT
  TO public
  USING (auth.uid() = user_id);