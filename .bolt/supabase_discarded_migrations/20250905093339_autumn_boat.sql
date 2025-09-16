/*
  # Create fund_nav table for NAV tracking

  1. New Tables
    - `fund_nav`
      - `id` (uuid, primary key)
      - `date` (date, unique, default current_date)
      - `total_aum` (numeric, default 0)
      - `nav_per_unit` (numeric, default 1000.0000)
      - `units_outstanding` (numeric, default 0)
      - `daily_pnl` (numeric, default 0)
      - `daily_return_pct` (numeric, default 0)
      - `mt5_equity` (numeric, default 0)
      - `mt5_balance` (numeric, default 0)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `fund_nav` table
    - Add policy for users to read fund NAV data using auth.uid()
    - Add index for date queries

  3. Changes
    - Live NAV tracking connected to MT5 trading bot
    - Daily performance calculations
    - Real-time fund metrics
*/

-- Create fund_nav table if it doesn't exist
CREATE TABLE IF NOT EXISTS fund_nav (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE DEFAULT CURRENT_DATE NOT NULL,
  total_aum numeric(15,2) DEFAULT 0 NOT NULL,
  nav_per_unit numeric(10,4) DEFAULT 1000.0000 NOT NULL,
  units_outstanding numeric(15,4) DEFAULT 0 NOT NULL,
  daily_pnl numeric(15,2) DEFAULT 0 NOT NULL,
  daily_return_pct numeric(8,4) DEFAULT 0 NOT NULL,
  mt5_equity numeric(15,2) DEFAULT 0 NOT NULL,
  mt5_balance numeric(15,2) DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comment explaining the purpose
COMMENT ON TABLE fund_nav IS 'Live NAV tracking connected to MT5 trading bot';

-- Enable RLS
ALTER TABLE fund_nav ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fund_nav_date ON fund_nav(date DESC);

-- Policy: Users can read fund NAV data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read fund NAV data' 
    AND tablename = 'fund_nav'
  ) THEN
    CREATE POLICY "Users can read fund NAV data"
      ON fund_nav
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END$$;