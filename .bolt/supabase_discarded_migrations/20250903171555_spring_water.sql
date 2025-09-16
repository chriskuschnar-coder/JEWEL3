/*
  # Create compliance and document tables

  1. New Tables
    - `compliance_records`
      - Tracks KYC/AML compliance status
    - `signed_documents`
      - Tracks digitally signed legal documents
    - `bank_accounts`
      - Tracks linked bank accounts via Plaid
    - `crypto_addresses`
      - Tracks cryptocurrency addresses
    - `wire_instructions`
      - Tracks wire transfer instructions

  2. Security
    - Enable RLS on all tables
    - Add policies for users to view their own data
*/

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

-- Create signed_documents table
CREATE TABLE IF NOT EXISTS signed_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  document_id text NOT NULL,
  document_title text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('investment_agreement', 'risk_disclosure', 'accredited_investor', 'subscription_agreement', 'privacy_policy')),
  signature text NOT NULL,
  signed_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

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

-- Create crypto_addresses table
CREATE TABLE IF NOT EXISTS crypto_addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  currency text NOT NULL CHECK (currency IN ('BTC', 'ETH', 'USDC', 'USDT', 'MATIC')),
  address text NOT NULL,
  private_key_encrypted text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  total_received numeric(20,8) DEFAULT 0,
  payment_count integer DEFAULT 0
);

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

-- Enable RLS on all tables
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE signed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wire_instructions ENABLE ROW LEVEL SECURITY;

-- Create policies for compliance_records
CREATE POLICY "Users can view own compliance records"
  ON compliance_records
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Create policies for signed_documents
CREATE POLICY "Users can read own signed documents"
  ON signed_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own signed documents"
  ON signed_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own signed documents"
  ON signed_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for bank_accounts
CREATE POLICY "Users can view own bank accounts"
  ON bank_accounts
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Create policies for crypto_addresses
CREATE POLICY "Users can view own crypto addresses"
  ON crypto_addresses
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Create policies for wire_instructions
CREATE POLICY "Users can view own wire instructions"
  ON wire_instructions
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_compliance_updated_at
  BEFORE UPDATE ON compliance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_user_id ON compliance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_signed_documents_user_id ON signed_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_signed_documents_type ON signed_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_signed_documents_signed_at ON signed_documents(signed_at);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_user_id ON crypto_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wire_instructions_user_id ON wire_instructions(user_id);
CREATE INDEX IF NOT EXISTS idx_wire_instructions_reference_code ON wire_instructions(reference_code);