/*
  # Create payments table with transaction_hash

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `product_id` (text, default 'account_funding')
      - `quantity` (integer, default 1)
      - `total_amount` (numeric, not null)
      - `status` (text, default 'pending')
      - `stripe_session_id` (text, nullable)
      - `stripe_payment_intent_id` (text, nullable)
      - `transaction_hash` (text, nullable) - CRITICAL COLUMN
      - `is_paid` (boolean, default false)
      - `metadata` (jsonb, default '{}')
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `payments` table
    - Add policies for users to view their own payments
    - Add policy for users to insert their own payments
    - Add policy for system to update payments

  3. Indexes
    - Index on user_id for user queries
    - Index on status for filtering
    - Index on stripe_payment_intent_id for webhook processing
    - Index on transaction_hash for crypto payment tracking
*/

-- Create payments table with transaction_hash column
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  product_id text DEFAULT 'account_funding',
  quantity integer DEFAULT 1,
  total_amount numeric(15,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  stripe_session_id text,
  stripe_payment_intent_id text,
  transaction_hash text,
  is_paid boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash ON payments(transaction_hash);