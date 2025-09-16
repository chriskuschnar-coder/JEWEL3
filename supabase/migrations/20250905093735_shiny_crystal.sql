/*
  # Backfill investor_units for existing users

  1. Data Synchronization
    - Backfill all existing users into investor_units table
    - Reset all accounts to $0 for live MT5 integration
    - Ensure every user has fund allocation tracking

  2. No Policy Changes
    - Leaves all existing RLS policies untouched
    - Avoids any "already exists" errors
    - Pure data operations only
*/

-- Backfill existing users into investor_units (safe to run multiple times)
INSERT INTO investor_units (user_id, account_id, units_held, total_invested, current_value, avg_purchase_nav)
SELECT 
  u.id, 
  a.id, 
  0, 
  0, 
  0,
  1000.0000
FROM users u
JOIN accounts a ON a.user_id = u.id
LEFT JOIN investor_units iu ON iu.user_id = u.id AND iu.account_id = a.id
WHERE iu.user_id IS NULL
ON CONFLICT (user_id, account_id) DO NOTHING;

-- Reset all account balances to $0 for live MT5 integration
UPDATE accounts 
SET 
  balance = 0,
  available_balance = 0,
  total_deposits = 0,
  total_withdrawals = 0,
  units_held = 0,
  nav_per_unit = 1000.0000,
  fund_allocation_pct = 0,
  updated_at = now();

-- Reset all investor units to 0
UPDATE investor_units 
SET 
  units_held = 0,
  total_invested = 0,
  current_value = 0,
  unrealized_pnl = 0,
  avg_purchase_nav = 1000.0000,
  last_nav_update = now(),
  updated_at = now();

-- Initialize fund NAV at starting value
INSERT INTO fund_nav (
  date,
  total_aum,
  nav_per_unit,
  units_outstanding,
  daily_pnl,
  daily_return_pct,
  mt5_equity,
  mt5_balance
) VALUES (
  CURRENT_DATE,
  0,
  1000.0000,
  0,
  0,
  0,
  0,
  0
) ON CONFLICT (date) DO UPDATE SET
  total_aum = 0,
  nav_per_unit = 1000.0000,
  units_outstanding = 0,
  daily_pnl = 0,
  daily_return_pct = 0,
  mt5_equity = 0,
  mt5_balance = 0,
  updated_at = now();