/*
  # Create payments table for Stripe integration

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `product_id` (text, default 'account_funding')
      - `quantity` (integer, default 1)
      - `total_amount` (numeric)
      - `status` (text, default 'pending')
      - `stripe_session_id` (text, optional)
      - `stripe_payment_intent_id` (text, optional)
      - `is_paid` (boolean, default false)
      - `metadata` (jsonb, default '{}')
      - `transaction_hash` (text, optional for crypto)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `payments` table
    - Add policy for users to view their own payments
    - Add policy for users to insert their own payments
    - Add policy for system to update payments
*/

-- Create payments table if it doesn't exist
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
  transaction_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash ON payments(transaction_hash) WHERE transaction_hash IS NOT NULL;

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Policy for users to view their own payments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own payments fixed' 
    AND tablename = 'payments'
  ) THEN
    CREATE POLICY "Users can view own payments fixed"
    ON payments
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Policy for users to insert their own payments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert own payments fixed' 
    AND tablename = 'payments'
  ) THEN
    CREATE POLICY "Users can insert own payments fixed"
    ON payments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for system to update payments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'System can update payments fixed' 
    AND tablename = 'payments'
  ) THEN
    CREATE POLICY "System can update payments fixed"
    ON payments
    FOR UPDATE
    USING (true);
  END IF;
END $$;