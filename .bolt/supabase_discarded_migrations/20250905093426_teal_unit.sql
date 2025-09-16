/*
  # Fix existing policies that use uid() instead of auth.uid()

  1. Policy Fixes
    - Drop and recreate policies that use incorrect uid() function
    - Replace with correct auth.uid() syntax
    - Ensure all policies work with Supabase auth

  2. Security
    - Maintains all existing security rules
    - Fixes authentication function calls
    - Preserves data access patterns

  3. Changes
    - Fixes "function uid() does not exist" errors
    - Updates all policies to use auth.uid()
    - Ensures proper RLS functionality
*/

-- Fix users table policies
DO $$
BEGIN
  -- Drop existing policy if it uses uid() instead of auth.uid()
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
      TO public
      USING (auth.uid() = id);
  END IF;
  
  -- Fix update policy
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
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END$$;

-- Fix accounts table policies
DO $$
BEGIN
  -- Fix view policy
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
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  -- Fix update policy
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
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Fix transactions table policies
DO $$
BEGIN
  -- Fix view policy
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
      TO public
      USING (auth.uid() = user_id);
  END IF;
  
  -- Fix insert policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert own transactions' 
    AND tablename = 'transactions'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can insert own transactions" ON transactions;
    
    CREATE POLICY "Users can insert own transactions"
      ON transactions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Fix investor_units table policies
DO $$
BEGIN
  -- Fix view policy
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
      TO public
      USING (user_id = auth.uid());
  END IF;
  
  -- Fix read policy (alternative name)
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
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Fix payments table policies if they exist
DO $$
BEGIN
  -- Fix view policy
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
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  -- Fix insert policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert own payments' 
    AND tablename = 'payments'
    AND qual LIKE '%uid()%'
  ) THEN
    DROP POLICY "Users can insert own payments" ON payments;
    
    CREATE POLICY "Users can insert own payments"
      ON payments
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;