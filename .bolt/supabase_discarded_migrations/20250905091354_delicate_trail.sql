/*
  # Fix RLS Policies - Skip Existing Ones

  This migration only creates policies that don't already exist in the database.
  It uses IF NOT EXISTS logic to avoid conflicts with existing policies.

  1. Tables Covered
    - accounts (create missing policies)
    - transactions (create missing policies) 
    - payments (create missing policies)
    - compliance_records (create missing policies)
    - crypto_addresses (create missing policies)
    - bank_accounts (create missing policies)
    - wire_instructions (create missing policies)
    - signed_documents (create missing policies)
    - profiles (create missing policies)
    - onboarding (create missing policies)
    - crypto_payment_invoices (create missing policies)
    - fund_transactions (create missing policies)
    - investor_units (create missing policies)
    - fund_nav (create missing policies)
    - stripe_customers (create missing policies)
    - stripe_subscriptions (create missing policies)
    - stripe_orders (create missing policies)

  2. Security
    - All policies use auth.uid() (not uid())
    - Proper USING and WITH CHECK clauses
    - Service role access where needed
*/

-- Helper function to check if policy exists
CREATE OR REPLACE FUNCTION policy_exists(table_name text, policy_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE schemaname = 'public' 
    AND tablename = table_name 
    AND policyname = policy_name
  );
END;
$$ LANGUAGE plpgsql;

-- ACCOUNTS TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'accounts' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can view own accounts
  IF NOT policy_exists('accounts', 'Users can view own accounts') THEN
    CREATE POLICY "Users can view own accounts"
    ON accounts FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Users can update own accounts  
  IF NOT policy_exists('accounts', 'Users can update own accounts') THEN
    CREATE POLICY "Users can update own accounts"
    ON accounts FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  -- System can insert accounts
  IF NOT policy_exists('accounts', 'System can insert accounts') THEN
    CREATE POLICY "System can insert accounts"
    ON accounts FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- TRANSACTIONS TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'transactions' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can view own transactions
  IF NOT policy_exists('transactions', 'Users can view own transactions') THEN
    CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Users can insert own transactions
  IF NOT policy_exists('transactions', 'Users can insert own transactions') THEN
    CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- PAYMENTS TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'payments' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can view own payments
  IF NOT policy_exists('payments', 'Users can view own payments') THEN
    CREATE POLICY "Users can view own payments"
    ON payments FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Users can insert own payments
  IF NOT policy_exists('payments', 'Users can insert own payments') THEN
    CREATE POLICY "Users can insert own payments"
    ON payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- System can update payments
  IF NOT policy_exists('payments', 'System can update payments') THEN
    CREATE POLICY "System can update payments"
    ON payments FOR UPDATE
    USING (true);
  END IF;
END $$;

-- COMPLIANCE RECORDS TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'compliance_records' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can view own compliance records (fix existing policy)
  IF NOT policy_exists('compliance_records', 'Users can view own compliance records fixed') THEN
    CREATE POLICY "Users can view own compliance records fixed"
    ON compliance_records FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- CRYPTO ADDRESSES TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'crypto_addresses' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can view own crypto addresses (fix existing policy)
  IF NOT policy_exists('crypto_addresses', 'Users can view own crypto addresses fixed') THEN
    CREATE POLICY "Users can view own crypto addresses fixed"
    ON crypto_addresses FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- BANK ACCOUNTS TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'bank_accounts' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can view own bank accounts (fix existing policy)
  IF NOT policy_exists('bank_accounts', 'Users can view own bank accounts fixed') THEN
    CREATE POLICY "Users can view own bank accounts fixed"
    ON bank_accounts FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- WIRE INSTRUCTIONS TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'wire_instructions' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE wire_instructions ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can view own wire instructions (fix existing policy)
  IF NOT policy_exists('wire_instructions', 'Users can view own wire instructions fixed') THEN
    CREATE POLICY "Users can view own wire instructions fixed"
    ON wire_instructions FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- SIGNED DOCUMENTS TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'signed_documents' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE signed_documents ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can read own signed documents (fix existing policy)
  IF NOT policy_exists('signed_documents', 'Users can read own signed documents fixed') THEN
    CREATE POLICY "Users can read own signed documents fixed"
    ON signed_documents FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Users can insert own signed documents (fix existing policy)
  IF NOT policy_exists('signed_documents', 'Users can insert own signed documents fixed') THEN
    CREATE POLICY "Users can insert own signed documents fixed"
    ON signed_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can update own signed documents (fix existing policy)
  IF NOT policy_exists('signed_documents', 'Users can update own signed documents fixed') THEN
    CREATE POLICY "Users can update own signed documents fixed"
    ON signed_documents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- PROFILES TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'profiles' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can view own profile (fix existing policy)
  IF NOT policy_exists('profiles', 'Users can view own profile fixed') THEN
    CREATE POLICY "Users can view own profile fixed"
    ON profiles FOR SELECT
    USING (auth.uid() = id);
  END IF;

  -- Users can insert their own profile (fix existing policy)
  IF NOT policy_exists('profiles', 'Users can insert their own profile fixed') THEN
    CREATE POLICY "Users can insert their own profile fixed"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
  END IF;

  -- Users can update their own profile (fix existing policy)
  IF NOT policy_exists('profiles', 'Users can update their own profile fixed') THEN
    CREATE POLICY "Users can update their own profile fixed"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);
  END IF;
END $$;

-- ONBOARDING TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'onboarding' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can read own onboarding (fix existing policy)
  IF NOT policy_exists('onboarding', 'Users can read own onboarding fixed') THEN
    CREATE POLICY "Users can read own onboarding fixed"
    ON onboarding FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Users can insert own onboarding (fix existing policy)
  IF NOT policy_exists('onboarding', 'Users can insert own onboarding fixed') THEN
    CREATE POLICY "Users can insert own onboarding fixed"
    ON onboarding FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can update own onboarding (fix existing policy)
  IF NOT policy_exists('onboarding', 'Users can update own onboarding fixed') THEN
    CREATE POLICY "Users can update own onboarding fixed"
    ON onboarding FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can delete own onboarding (fix existing policy)
  IF NOT policy_exists('onboarding', 'Users can delete own onboarding fixed') THEN
    CREATE POLICY "Users can delete own onboarding fixed"
    ON onboarding FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- CRYPTO PAYMENT INVOICES TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'crypto_payment_invoices' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can view own crypto invoices (fix existing policy)
  IF NOT policy_exists('crypto_payment_invoices', 'Users can view own crypto invoices fixed') THEN
    CREATE POLICY "Users can view own crypto invoices fixed"
    ON crypto_payment_invoices FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Users can insert own crypto invoices (fix existing policy)
  IF NOT policy_exists('crypto_payment_invoices', 'Users can insert own crypto invoices fixed') THEN
    CREATE POLICY "Users can insert own crypto invoices fixed"
    ON crypto_payment_invoices FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- System can update crypto invoices (fix existing policy)
  IF NOT policy_exists('crypto_payment_invoices', 'System can update crypto invoices fixed') THEN
    CREATE POLICY "System can update crypto invoices fixed"
    ON crypto_payment_invoices FOR UPDATE
    USING (true);
  END IF;
END $$;

-- FUND TRANSACTIONS TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'fund_transactions' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE fund_transactions ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can read own fund transactions (fix existing policy)
  IF NOT policy_exists('fund_transactions', 'Users can read own fund transactions fixed') THEN
    CREATE POLICY "Users can read own fund transactions fixed"
    ON fund_transactions FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Users can insert own fund transactions (fix existing policy)
  IF NOT policy_exists('fund_transactions', 'Users can insert own fund transactions fixed') THEN
    CREATE POLICY "Users can insert own fund transactions fixed"
    ON fund_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- INVESTOR UNITS TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'investor_units' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE investor_units ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can read own unit holdings (fix existing policy)
  IF NOT policy_exists('investor_units', 'Users can read own unit holdings fixed') THEN
    CREATE POLICY "Users can read own unit holdings fixed"
    ON investor_units FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Users can view own investor_units (fix existing policy)
  IF NOT policy_exists('investor_units', 'Users can view own investor_units fixed') THEN
    CREATE POLICY "Users can view own investor_units fixed"
    ON investor_units FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- FUND NAV TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'fund_nav' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE fund_nav ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can read fund NAV data (fix existing policy)
  IF NOT policy_exists('fund_nav', 'Users can read fund NAV data fixed') THEN
    CREATE POLICY "Users can read fund NAV data fixed"
    ON fund_nav FOR SELECT
    USING (true); -- NAV data is public to all authenticated users
  END IF;
END $$;

-- STRIPE CUSTOMERS TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'stripe_customers' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can view their own customer data (fix existing policy)
  IF NOT policy_exists('stripe_customers', 'Users can view their own customer data fixed') THEN
    CREATE POLICY "Users can view their own customer data fixed"
    ON stripe_customers FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);
  END IF;
END $$;

-- STRIPE SUBSCRIPTIONS TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'stripe_subscriptions' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can view their own subscription data (fix existing policy)
  IF NOT policy_exists('stripe_subscriptions', 'Users can view their own subscription data fixed') THEN
    CREATE POLICY "Users can view their own subscription data fixed"
    ON stripe_subscriptions FOR SELECT
    USING (
      customer_id IN (
        SELECT customer_id FROM stripe_customers 
        WHERE user_id = auth.uid() AND deleted_at IS NULL
      ) AND deleted_at IS NULL
    );
  END IF;
END $$;

-- STRIPE ORDERS TABLE POLICIES
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'stripe_orders' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Users can view their own order data (fix existing policy)
  IF NOT policy_exists('stripe_orders', 'Users can view their own order data fixed') THEN
    CREATE POLICY "Users can view their own order data fixed"
    ON stripe_orders FOR SELECT
    USING (
      customer_id IN (
        SELECT customer_id FROM stripe_customers 
        WHERE user_id = auth.uid() AND deleted_at IS NULL
      ) AND deleted_at IS NULL
    );
  END IF;
END $$;

-- Clean up helper function
DROP FUNCTION IF EXISTS policy_exists(text, text);