/*
  # Complete Hedge Fund Platform Database Schema

  1. New Tables
    - `users` - User profiles with KYC status and security settings
    - `accounts` - Trading accounts with balance tracking
    - `transactions` - All financial transactions (deposits, withdrawals, trades)
    - `compliance_records` - KYC/AML verification records
    - `crypto_addresses` - Cryptocurrency wallet addresses
    - `bank_accounts` - Connected bank accounts via Plaid
    - `wire_instructions` - Wire transfer instructions
    - `payments` - Stripe payment records
    - `stripe_customers` - Stripe customer mapping
    - `stripe_subscriptions` - Subscription management
    - `stripe_orders` - Order tracking

  2. Security
    - Enable RLS on all tables
    - User-specific access policies
    - Secure views for subscription and order data

  3. Functions
    - Automatic account creation on user signup
    - Updated timestamp triggers
    - Payment processing triggers

  4. Views
    - `stripe_user_subscriptions` - User subscription data
    - `stripe_user_orders` - User order history
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_subscription_status') THEN
    CREATE TYPE stripe_subscription_status AS ENUM (
      'not_started',
      'incomplete',
      'incomplete_expired',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'paused'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_order_status') THEN
    CREATE TYPE stripe_order_status AS ENUM (
      'pending',
      'completed',
      'canceled'
    );
  END IF;
END$$;

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update_payments_updated_at function
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  two_factor_enabled boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create users policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can view own data'
  ) THEN
    CREATE POLICY "Users can view own data"
      ON users
      FOR SELECT
      TO public
      USING (auth.uid() = id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON users
      FOR UPDATE
      TO public
      USING (auth.uid() = id);
  END IF;
END$$;

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  account_type text DEFAULT 'trading' CHECK (account_type IN ('trading', 'savings')),
  balance numeric(15,2) DEFAULT 0.00,
  available_balance numeric(15,2) DEFAULT 0.00,
  total_deposits numeric(15,2) DEFAULT 0.00,
  total_withdrawals numeric(15,2) DEFAULT 0.00,
  currency text DEFAULT 'USD',
  status text DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create accounts policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'accounts' AND policyname = 'Users can view own accounts'
  ) THEN
    CREATE POLICY "Users can view own accounts"
      ON accounts
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'accounts' AND policyname = 'Users can update own accounts'
  ) THEN
    CREATE POLICY "Users can update own accounts"
      ON accounts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  account_id uuid NOT NULL REFERENCES accounts(id),
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'fee', 'interest', 'trade')),
  method text CHECK (method IN ('stripe', 'plaid', 'crypto', 'wire', 'internal')),
  amount numeric(15,2) NOT NULL,
  fee numeric(15,2) DEFAULT 0.00,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  external_id text,
  reference_id text,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create transactions policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'transactions' AND policyname = 'Users can view own transactions'
  ) THEN
    CREATE POLICY "Users can view own transactions"
      ON transactions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'transactions' AND policyname = 'Users can insert own transactions'
  ) THEN
    CREATE POLICY "Users can insert own transactions"
      ON transactions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Create compliance_records table
CREATE TABLE IF NOT EXISTS compliance_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  provider text NOT NULL CHECK (provider IN ('jumio', 'onfido', 'manual')),
  verification_type text NOT NULL CHECK (verification_type IN ('identity', 'address', 'income', 'accredited_investor')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  verification_id text,
  data_blob jsonb DEFAULT '{}',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on compliance_records
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;

-- Create compliance_records policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'compliance_records' AND policyname = 'Users can view own compliance records'
  ) THEN
    CREATE POLICY "Users can view own compliance records"
      ON compliance_records
      FOR SELECT
      TO public
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Create crypto_addresses table
CREATE TABLE IF NOT EXISTS crypto_addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  currency text NOT NULL CHECK (currency IN ('BTC', 'ETH', 'USDC', 'USDT', 'MATIC')),
  address text NOT NULL,
  private_key_encrypted text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on crypto_addresses
ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;

-- Create crypto_addresses policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'crypto_addresses' AND policyname = 'Users can view own crypto addresses'
  ) THEN
    CREATE POLICY "Users can view own crypto addresses"
      ON crypto_addresses
      FOR SELECT
      TO public
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  plaid_account_id text NOT NULL,
  plaid_access_token text NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL,
  account_subtype text,
  mask text,
  institution_name text NOT NULL,
  institution_id text,
  is_verified boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on bank_accounts
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create bank_accounts policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bank_accounts' AND policyname = 'Users can view own bank accounts'
  ) THEN
    CREATE POLICY "Users can view own bank accounts"
      ON bank_accounts
      FOR SELECT
      TO public
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Create wire_instructions table
CREATE TABLE IF NOT EXISTS wire_instructions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  reference_code text UNIQUE NOT NULL,
  amount numeric(15,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on wire_instructions
ALTER TABLE wire_instructions ENABLE ROW LEVEL SECURITY;

-- Create wire_instructions policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wire_instructions' AND policyname = 'Users can view own wire instructions'
  ) THEN
    CREATE POLICY "Users can view own wire instructions"
      ON wire_instructions
      FOR SELECT
      TO public
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  product_id text DEFAULT 'account_funding',
  quantity integer DEFAULT 1,
  total_amount numeric(15,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  stripe_session_id text,
  stripe_payment_intent_id text,
  is_paid boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create payments policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' AND policyname = 'Users can view own payments'
  ) THEN
    CREATE POLICY "Users can view own payments"
      ON payments
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' AND policyname = 'Users can insert own payments'
  ) THEN
    CREATE POLICY "Users can insert own payments"
      ON payments
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' AND policyname = 'System can update payments'
  ) THEN
    CREATE POLICY "System can update payments"
      ON payments
      FOR UPDATE
      TO authenticated
      USING (true);
  END IF;
END$$;

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id bigint PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id),
  customer_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Enable RLS on stripe_customers
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

-- Create stripe_customers policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_customers' AND policyname = 'Users can view their own customer data'
  ) THEN
    CREATE POLICY "Users can view their own customer data"
      ON stripe_customers
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() AND deleted_at IS NULL);
  END IF;
END$$;

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id bigint PRIMARY KEY,
  customer_id text UNIQUE NOT NULL,
  subscription_id text,
  price_id text,
  current_period_start bigint,
  current_period_end bigint,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text,
  payment_method_last4 text,
  status stripe_subscription_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Enable RLS on stripe_subscriptions
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create stripe_subscriptions policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_subscriptions' AND policyname = 'Users can view their own subscription data'
  ) THEN
    CREATE POLICY "Users can view their own subscription data"
      ON stripe_subscriptions
      FOR SELECT
      TO authenticated
      USING (
        customer_id IN (
          SELECT customer_id FROM stripe_customers 
          WHERE user_id = auth.uid() AND deleted_at IS NULL
        ) AND deleted_at IS NULL
      );
  END IF;
END$$;

-- Create stripe_orders table
CREATE TABLE IF NOT EXISTS stripe_orders (
  id bigint PRIMARY KEY,
  checkout_session_id text NOT NULL,
  payment_intent_id text NOT NULL,
  customer_id text NOT NULL,
  amount_subtotal bigint NOT NULL,
  amount_total bigint NOT NULL,
  currency text NOT NULL,
  payment_status text NOT NULL,
  status stripe_order_status DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Enable RLS on stripe_orders
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create stripe_orders policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_orders' AND policyname = 'Users can view their own order data'
  ) THEN
    CREATE POLICY "Users can view their own order data"
      ON stripe_orders
      FOR SELECT
      TO authenticated
      USING (
        customer_id IN (
          SELECT customer_id FROM stripe_customers 
          WHERE user_id = auth.uid() AND deleted_at IS NULL
        ) AND deleted_at IS NULL
      );
  END IF;
END$$;

-- Create function to automatically create user account
CREATE OR REPLACE FUNCTION create_user_account()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    updated_at = now();

  -- Create trading account
  INSERT INTO public.accounts (user_id, account_type, balance, available_balance)
  VALUES (NEW.id, 'trading', 0.00, 0.00)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic account creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION create_user_account();
  END IF;
END$$;

-- Create triggers for updated_at columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_accounts_updated_at'
  ) THEN
    CREATE TRIGGER update_accounts_updated_at
      BEFORE UPDATE ON accounts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_transactions_updated_at'
  ) THEN
    CREATE TRIGGER update_transactions_updated_at
      BEFORE UPDATE ON transactions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_compliance_updated_at'
  ) THEN
    CREATE TRIGGER update_compliance_updated_at
      BEFORE UPDATE ON compliance_records
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_bank_accounts_updated_at'
  ) THEN
    CREATE TRIGGER update_bank_accounts_updated_at
      BEFORE UPDATE ON bank_accounts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_payments_updated_at'
  ) THEN
    CREATE TRIGGER update_payments_updated_at
      BEFORE UPDATE ON payments
      FOR EACH ROW EXECUTE FUNCTION update_payments_updated_at();
  END IF;
END$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_user_id ON compliance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_user_id ON crypto_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_wire_instructions_user_id ON wire_instructions(user_id);
CREATE INDEX IF NOT EXISTS idx_wire_instructions_reference_code ON wire_instructions(reference_code);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);

-- Create secure views for Stripe data
CREATE OR REPLACE VIEW stripe_user_subscriptions
WITH (security_invoker = true) AS
SELECT 
  sc.customer_id,
  ss.subscription_id,
  ss.status as subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4
FROM stripe_customers sc
LEFT JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
WHERE sc.user_id = auth.uid() AND sc.deleted_at IS NULL AND (ss.deleted_at IS NULL OR ss.deleted_at IS NULL);

CREATE OR REPLACE VIEW stripe_user_orders
WITH (security_invoker = true) AS
SELECT 
  sc.customer_id,
  so.id as order_id,
  so.checkout_session_id,
  so.payment_intent_id,
  so.amount_subtotal,
  so.amount_total,
  so.currency,
  so.payment_status,
  so.status as order_status,
  so.created_at as order_date
FROM stripe_customers sc
LEFT JOIN stripe_orders so ON sc.customer_id = so.customer_id
WHERE sc.user_id = auth.uid() AND sc.deleted_at IS NULL AND (so.deleted_at IS NULL OR so.deleted_at IS NULL);

-- Insert demo user data (only if not exists)
DO $$
BEGIN
  -- Check if demo user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@globalmarket.com') THEN
    -- Insert demo user into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'demo-user-id-12345',
      'authenticated',
      'authenticated',
      'demo@globalmarket.com',
      crypt('demo123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Demo User"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    
    -- Insert demo user profile
    INSERT INTO public.users (id, email, full_name, kyc_status)
    VALUES (
      'demo-user-id-12345',
      'demo@globalmarket.com',
      'Demo User',
      'verified'
    );
    
    -- Create demo account with balance
    INSERT INTO public.accounts (user_id, balance, available_balance, total_deposits)
    VALUES (
      'demo-user-id-12345',
      7850.00,
      7850.00,
      10000.00
    );
    
    RAISE NOTICE 'Demo user created successfully';
  ELSE
    RAISE NOTICE 'Demo user already exists, skipping creation';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Demo user creation failed (this is normal if auth schema is restricted): %', SQLERRM;
END$$;