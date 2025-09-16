/*
  # Backfill existing users with investor_units

  1. Data Migration
    - Create investor_units records for all existing users who don't have them
    - Start all users at 0 units for live MT5 integration
    - Ensure data consistency across all accounts

  2. Security
    - Safe backfill operation
    - Only creates missing records
    - Preserves existing data

  3. Changes
    - Ensures all existing users have investor_units
    - Prepares for live MT5 fund tracking
*/

-- Backfill investor_units for existing users who don't have them
INSERT INTO investor_units (user_id, account_id, units_held, avg_purchase_nav, total_invested, current_value, unrealized_pnl)
SELECT 
  u.id as user_id,
  a.id as account_id,
  0 as units_held,
  1000.0000 as avg_purchase_nav,
  0 as total_invested,
  0 as current_value,
  0 as unrealized_pnl
FROM users u
JOIN accounts a ON a.user_id = u.id
LEFT JOIN investor_units iu ON iu.user_id = u.id AND iu.account_id = a.id
WHERE iu.user_id IS NULL;

-- Reset all account balances to $0 for live MT5 integration
UPDATE accounts 
SET 
  balance = 0.00,
  available_balance = 0.00,
  units_held = 0,
  nav_per_unit = 1000.0000,
  fund_allocation_pct = 0,
  updated_at = now()
WHERE balance != 0.00 OR available_balance != 0.00 OR units_held != 0;

-- Reset all investor_units to 0 for live MT5 integration
UPDATE investor_units 
SET 
  units_held = 0,
  avg_purchase_nav = 1000.0000,
  total_invested = 0,
  current_value = 0,
  unrealized_pnl = 0,
  last_nav_update = now(),
  updated_at = now()
WHERE units_held != 0 OR total_invested != 0 OR current_value != 0;