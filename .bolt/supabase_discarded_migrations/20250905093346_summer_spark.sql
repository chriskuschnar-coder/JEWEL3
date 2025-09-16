/*
  # Create mt5_data_feed table for live trading data

  1. New Tables
    - `mt5_data_feed`
      - `id` (uuid, primary key)
      - `timestamp` (timestamp, default now)
      - `account_number` (text, not null)
      - `balance` (numeric, not null)
      - `equity` (numeric, not null)
      - `margin` (numeric, default 0)
      - `free_margin` (numeric, default 0)
      - `profit` (numeric, default 0)
      - `positions_count` (integer, default 0)
      - `raw_data` (jsonb, optional)
      - `processed` (boolean, default false)
      - `created_at` (timestamp, default now)

  2. Security
    - Enable RLS on `mt5_data_feed` table
    - Add policy for only service role to access MT5 data
    - Add index for timestamp queries

  3. Changes
    - Live MT5 account data feed from Python trading bot
    - Real-time balance and equity tracking
    - Processing status for webhook handling
*/

-- Create mt5_data_feed table if it doesn't exist
CREATE TABLE IF NOT EXISTS mt5_data_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now() NOT NULL,
  account_number text NOT NULL,
  balance numeric(15,2) NOT NULL,
  equity numeric(15,2) NOT NULL,
  margin numeric(15,2) DEFAULT 0 NOT NULL,
  free_margin numeric(15,2) DEFAULT 0 NOT NULL,
  profit numeric(15,2) DEFAULT 0 NOT NULL,
  positions_count integer DEFAULT 0 NOT NULL,
  raw_data jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add comment explaining the purpose
COMMENT ON TABLE mt5_data_feed IS 'Live MT5 account data feed from Python trading bot';

-- Enable RLS
ALTER TABLE mt5_data_feed ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_mt5_data_timestamp ON mt5_data_feed(timestamp DESC);

-- Policy: Only service role can access MT5 data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Only service role can access MT5 data' 
    AND tablename = 'mt5_data_feed'
  ) THEN
    CREATE POLICY "Only service role can access MT5 data"
      ON mt5_data_feed
      FOR ALL
      TO service_role
      USING (true);
  END IF;
END$$;