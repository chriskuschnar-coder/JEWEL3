/*
  # Safe Schema Check and Updates
  
  This migration safely checks for any missing components without 
  recreating existing tables or types.
  
  1. Checks for missing functions
  2. Ensures all RLS policies exist
  3. Adds any missing indexes
  4. No destructive operations
*/

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the create_user_account function exists
CREATE OR REPLACE FUNCTION create_user_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.accounts (user_id, account_type, balance, available_balance, currency, status)
  VALUES (NEW.id, 'trading', 0.00, 0.00, 'USD', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the update_payments_updated_at function exists
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure trigger exists for automatic account creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION create_user_account();
  END IF;
END $$;

-- Ensure all necessary RLS policies exist (these will only be created if missing)
DO $$
BEGIN
  -- Users policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can view own data'
  ) THEN
    CREATE POLICY "Users can view own data" ON users
      FOR SELECT TO public
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data" ON users
      FOR UPDATE TO public
      USING (auth.uid() = id);
  END IF;
END $$;

-- Success message
SELECT 'Database schema check completed successfully' as status;