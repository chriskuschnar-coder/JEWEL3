/*
  # Fix existing policies that use incorrect uid() syntax

  1. Policy Updates
    - Drop existing policies that use uid() instead of auth.uid()
    - Recreate them with correct auth.uid() syntax
    - Only affects broken policies, preserves working ones

  2. Security
    - Maintains all existing security logic
    - Fixes function errors without data loss
    - Uses bulletproof existence checks
*/

-- Fix users table policies
DO $$
BEGIN
  -- Drop and recreate "Users can view own data" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own data' 
    AND tablename = 'users'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can view own data" ON users;
    CREATE POLICY "Users can view own data"
    ON users
    FOR SELECT
    USING (auth.uid() = id);
  END IF;

  -- Drop and recreate "Users can update own data" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update own data' 
    AND tablename = 'users'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can update own data" ON users;
    CREATE POLICY "Users can update own data"
    ON users
    FOR UPDATE
    USING (auth.uid() = id);
  END IF;
END $$;

-- Fix accounts table policies
DO $$
BEGIN
  -- Drop and recreate "Users can view own accounts" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own accounts' 
    AND tablename = 'accounts'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can view own accounts" ON accounts;
    CREATE POLICY "Users can view own accounts"
    ON accounts
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Drop and recreate "Users can update own accounts" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update own accounts' 
    AND tablename = 'accounts'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can update own accounts" ON accounts;
    CREATE POLICY "Users can update own accounts"
    ON accounts
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Fix transactions table policies
DO $$
BEGIN
  -- Drop and recreate "Users can view own transactions" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own transactions' 
    AND tablename = 'transactions'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can view own transactions" ON transactions;
    CREATE POLICY "Users can view own transactions"
    ON transactions
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Drop and recreate "Users can insert own transactions" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert own transactions' 
    AND tablename = 'transactions'
    AND with_check LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can insert own transactions" ON transactions;
    CREATE POLICY "Users can insert own transactions"
    ON transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Fix payments table policies
DO $$
BEGIN
  -- Drop and recreate "Users can view own payments" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own payments' 
    AND tablename = 'payments'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can view own payments" ON payments;
    CREATE POLICY "Users can view own payments"
    ON payments
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Drop and recreate "Users can insert own payments" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert own payments' 
    AND tablename = 'payments'
    AND with_check LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can insert own payments" ON payments;
    CREATE POLICY "Users can insert own payments"
    ON payments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Fix investor_units table policies
DO $$
BEGIN
  -- Drop and recreate "Users can view own investor_units" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own investor_units' 
    AND tablename = 'investor_units'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can view own investor_units" ON investor_units;
    CREATE POLICY "Users can view own investor_units"
    ON investor_units
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Drop and recreate "Users can read own unit holdings" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read own unit holdings' 
    AND tablename = 'investor_units'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can read own unit holdings" ON investor_units;
    CREATE POLICY "Users can read own unit holdings"
    ON investor_units
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Fix compliance_records table policies
DO $$
BEGIN
  -- Drop and recreate "Users can view own compliance records" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own compliance records' 
    AND tablename = 'compliance_records'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can view own compliance records" ON compliance_records;
    CREATE POLICY "Users can view own compliance records"
    ON compliance_records
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Fix bank_accounts table policies
DO $$
BEGIN
  -- Drop and recreate "Users can view own bank accounts" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own bank accounts' 
    AND tablename = 'bank_accounts'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can view own bank accounts" ON bank_accounts;
    CREATE POLICY "Users can view own bank accounts"
    ON bank_accounts
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Fix wire_instructions table policies
DO $$
BEGIN
  -- Drop and recreate "Users can view own wire instructions" if it uses uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own wire instructions' 
    AND tablename = 'wire_instructions'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can view own wire instructions" ON wire_instructions;
    CREATE POLICY "Users can view own wire instructions"
    ON wire_instructions
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Fix signed_documents table policies
DO $$
BEGIN
  -- Drop and recreate signed_documents policies if they use uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read own signed documents' 
    AND tablename = 'signed_documents'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can read own signed documents" ON signed_documents;
    CREATE POLICY "Users can read own signed documents"
    ON signed_documents
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert own signed documents' 
    AND tablename = 'signed_documents'
    AND with_check LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can insert own signed documents" ON signed_documents;
    CREATE POLICY "Users can insert own signed documents"
    ON signed_documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update own signed documents' 
    AND tablename = 'signed_documents'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can update own signed documents" ON signed_documents;
    CREATE POLICY "Users can update own signed documents"
    ON signed_documents
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Fix crypto_payment_invoices table policies
DO $$
BEGIN
  -- Drop and recreate crypto invoice policies if they use uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own crypto invoices' 
    AND tablename = 'crypto_payment_invoices'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can view own crypto invoices" ON crypto_payment_invoices;
    CREATE POLICY "Users can view own crypto invoices"
    ON crypto_payment_invoices
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own invoices' 
    AND tablename = 'crypto_payment_invoices'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can view own invoices" ON crypto_payment_invoices;
    CREATE POLICY "Users can view own invoices"
    ON crypto_payment_invoices
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert own crypto invoices' 
    AND tablename = 'crypto_payment_invoices'
    AND with_check LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can insert own crypto invoices" ON crypto_payment_invoices;
    CREATE POLICY "Users can insert own crypto invoices"
    ON crypto_payment_invoices
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Fix fund_transactions table policies
DO $$
BEGIN
  -- Drop and recreate fund transaction policies if they use uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read own fund transactions' 
    AND tablename = 'fund_transactions'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can read own fund transactions" ON fund_transactions;
    CREATE POLICY "Users can read own fund transactions"
    ON fund_transactions
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert own fund transactions' 
    AND tablename = 'fund_transactions'
    AND with_check LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can insert own fund transactions" ON fund_transactions;
    CREATE POLICY "Users can insert own fund transactions"
    ON fund_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;