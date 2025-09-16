/*
  # Fund Management System Integration

  1. New Tables
    - `fund_nav` - Daily NAV calculations and fund performance
    - `mt5_data_feed` - Raw MT5 account data from Python bot
    - `investor_units` - Unit allocations for each investor
    - `fund_transactions` - Subscription/redemption tracking

  2. Enhanced Tables
    - Update existing `accounts` table to include unit tracking
    - Add fund-specific fields to track allocations

  3. Security
    - Enable RLS on all new tables
    - Add policies for investor data access
*/

-- Fund NAV tracking table
CREATE TABLE IF NOT EXISTS fund_nav (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  total_aum decimal(15,2) NOT NULL DEFAULT 0,
  nav_per_unit decimal(10,4) NOT NULL DEFAULT 1000.0000,
  units_outstanding decimal(15,4) NOT NULL DEFAULT 0,
  daily_pnl decimal(15,2) NOT NULL DEFAULT 0,
  daily_return_pct decimal(8,4) NOT NULL DEFAULT 0,
  mt5_equity decimal(15,2) NOT NULL DEFAULT 0,
  mt5_balance decimal(15,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- MT5 data feed from Python bot
CREATE TABLE IF NOT EXISTS mt5_data_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  account_number text NOT NULL,
  balance decimal(15,2) NOT NULL,
  equity decimal(15,2) NOT NULL,
  margin decimal(15,2) NOT NULL DEFAULT 0,
  free_margin decimal(15,2) NOT NULL DEFAULT 0,
  profit decimal(15,2) NOT NULL DEFAULT 0,
  positions_count integer NOT NULL DEFAULT 0,
  raw_data jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Investor unit holdings
CREATE TABLE IF NOT EXISTS investor_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  units_held decimal(15,4) NOT NULL DEFAULT 0,
  avg_purchase_nav decimal(10,4) NOT NULL DEFAULT 1000.0000,
  total_invested decimal(15,2) NOT NULL DEFAULT 0,
  current_value decimal(15,2) NOT NULL DEFAULT 0,
  unrealized_pnl decimal(15,2) NOT NULL DEFAULT 0,
  last_nav_update timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, account_id)
);

-- Fund-level transactions (subscriptions/redemptions)
CREATE TABLE IF NOT EXISTS fund_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('subscription', 'redemption', 'distribution')),
  amount decimal(15,2) NOT NULL,
  units decimal(15,4) NOT NULL DEFAULT 0,
  nav_per_unit decimal(10,4) NOT NULL DEFAULT 1000.0000,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processed', 'cancelled')),
  settlement_date date,
  bank_reference text,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add fund-specific columns to existing accounts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'units_held'
  ) THEN
    ALTER TABLE accounts ADD COLUMN units_held decimal(15,4) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'nav_per_unit'
  ) THEN
    ALTER TABLE accounts ADD COLUMN nav_per_unit decimal(10,4) DEFAULT 1000.0000;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'fund_allocation_pct'
  ) THEN
    ALTER TABLE accounts ADD COLUMN fund_allocation_pct decimal(5,2) DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on all new tables
ALTER TABLE fund_nav ENABLE ROW LEVEL SECURITY;
ALTER TABLE mt5_data_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fund_nav (read-only for authenticated users)
CREATE POLICY "Users can read fund NAV data"
  ON fund_nav
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for mt5_data_feed (admin only)
CREATE POLICY "Only service role can access MT5 data"
  ON mt5_data_feed
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for investor_units (users can only see their own)
CREATE POLICY "Users can read own unit holdings"
  ON investor_units
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all unit holdings"
  ON investor_units
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for fund_transactions (users can only see their own)
CREATE POLICY "Users can read own fund transactions"
  ON fund_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fund transactions"
  ON fund_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all fund transactions"
  ON fund_transactions
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fund_nav_date ON fund_nav(date DESC);
CREATE INDEX IF NOT EXISTS idx_mt5_data_timestamp ON mt5_data_feed(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_investor_units_user ON investor_units(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_user ON fund_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_type ON fund_transactions(type);

-- Insert initial fund NAV record
INSERT INTO fund_nav (date, total_aum, nav_per_unit, units_outstanding, daily_pnl, daily_return_pct, mt5_equity, mt5_balance)
VALUES (CURRENT_DATE, 0, 1000.0000, 0, 0, 0, 0, 0)
ON CONFLICT (date) DO NOTHING;