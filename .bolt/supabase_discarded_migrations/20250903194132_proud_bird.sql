/*
  # Core Database Schema Setup

  1. New Tables
    - `users` - User profiles linked to auth.users
    - `accounts` - Trading accounts for users
    - `transactions` - Transaction history
    - `compliance_records` - KYC/compliance tracking
    - `bank_accounts` - Connected bank accounts
    - `wire_instructions` - Wire transfer instructions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users only
    - Proper foreign key relationships

  3. Functions
    - Updated timestamp triggers
    - Auth signup handler
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  two_factor_enabled boolean DEFAULT false,
  last_login timestamptz,
  documents_completed boolean DEFAULT false,
  documents_completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email)
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  account_type text DEFAULT 'trading' CHECK (account_type IN ('trading', 'savings')),
  balance numeric(15,2) DEFAULT 0.00,
  available_balance numeric(15,2) DEFAULT 0.00,
  total_deposits numeric(15,2) DEFAULT 0.00,
  total_withdrawals numeric(15,2) DEFAULT 0.00,
  currency text DEFAULT 'USD',
  status text DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  account_id uuid NOT NULL REFERENCES public.accounts(id),
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

-- Create compliance_records table
CREATE TABLE IF NOT EXISTS public.compliance_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  provider text NOT NULL CHECK (provider IN ('jumio', 'onfido', 'manual')),
  verification_type text NOT NULL CHECK (verification_type IN ('identity', 'address', 'income', 'accredited_investor')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  verification_id text,
  data_blob jsonb DEFAULT '{}',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id),
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

-- Create wire_instructions table
CREATE TABLE IF NOT EXISTS public.wire_instructions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  reference_code text NOT NULL UNIQUE,
  amount numeric(15,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_user_id ON public.compliance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_wire_instructions_user_id ON public.wire_instructions(user_id);
CREATE INDEX IF NOT EXISTS idx_wire_instructions_reference_code ON public.wire_instructions(reference_code);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wire_instructions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop first to avoid conflicts)
-- Users table policies
DROP POLICY IF EXISTS "System can insert users" ON public.users;
CREATE POLICY "System can insert users" ON public.users FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users FOR SELECT TO public USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own document status" ON public.users;
CREATE POLICY "Users can update own document status" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Accounts table policies (NOTE: Skipping "Users can view own accounts" as it already exists)
DROP POLICY IF EXISTS "System can insert accounts" ON public.accounts;
CREATE POLICY "System can insert accounts" ON public.accounts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Transactions table policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO public USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Compliance records policies
DROP POLICY IF EXISTS "Users can view own compliance records" ON public.compliance_records;
CREATE POLICY "Users can view own compliance records" ON public.compliance_records FOR SELECT TO public USING (auth.uid() = user_id);

-- Bank accounts policies
DROP POLICY IF EXISTS "Users can view own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can view own bank accounts" ON public.bank_accounts FOR SELECT TO public USING (auth.uid() = user_id);

-- Wire instructions policies
DROP POLICY IF EXISTS "Users can view own wire instructions" ON public.wire_instructions;
CREATE POLICY "Users can view own wire instructions" ON public.wire_instructions FOR SELECT TO public USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON public.accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compliance_updated_at ON public.compliance_records;
CREATE TRIGGER update_compliance_updated_at
  BEFORE UPDATE ON public.compliance_records
  FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at_column();

DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON public.bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auth signup handler
CREATE OR REPLACE FUNCTION public.handle_auth_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  INSERT INTO public.accounts (user_id, account_type, balance, available_balance, total_deposits, total_withdrawals, currency, status)
  VALUES (
    NEW.id,
    'trading',
    0.00,
    0.00,
    0.00,
    0.00,
    'USD',
    'active'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create auth signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_signup();