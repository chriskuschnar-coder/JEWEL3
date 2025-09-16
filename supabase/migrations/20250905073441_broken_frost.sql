/*
  # Reset All Accounts for Live MT5 Trading Integration

  This migration resets all user accounts to $0 and clears historical data to prepare 
  for live MT5 trading bot integration. From this point forward, all funding will be 
  real and connected to live trading performance.

  ## Changes Made:
  1. Reset all account balances to $0
  2. Clear transaction history 
  3. Reset investor units to 0
  4. Clear fund NAV history
  5. Reset MT5 data feed
  6. Clear payment records
  7. Preserve user accounts and authentication

  ## What This Enables:
  - Fresh start for live trading
  - Real MT5 account integration (~$11k starting balance)
  - Live performance tracking
  - Accurate NAV calculations
*/

-- STEP 1: Reset all account balances to $0
UPDATE accounts SET 
  balance = 0.00,
  available_balance = 0.00,
  total_deposits = 0.00,
  total_withdrawals = 0.00,
  units_held = 0,
  nav_per_unit = 1000.0000,
  fund_allocation_pct = 0,
  updated_at = now()
WHERE true;

-- STEP 2: Clear all transaction history
DELETE FROM transactions WHERE true;

-- STEP 3: Reset investor units to 0
DELETE FROM investor_units WHERE true;

-- STEP 4: Clear fund NAV history (will start fresh with MT5 data)
DELETE FROM fund_nav WHERE true;

-- STEP 5: Clear MT5 data feed (prepare for live data)
DELETE FROM mt5_data_feed WHERE true;

-- STEP 6: Clear payment records (start fresh payment tracking)
DELETE FROM payments WHERE true;

-- STEP 7: Clear fund transactions (reset fund-level tracking)
DELETE FROM fund_transactions WHERE true;

-- STEP 8: Clear crypto payment invoices
DELETE FROM crypto_payment_invoices WHERE true;

-- STEP 9: Reset wire instructions
DELETE FROM wire_instructions WHERE true;

-- STEP 10: Insert initial fund NAV record for live trading
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
  0.00,           -- Will be updated when MT5 bot connects
  1000.0000,      -- Starting NAV per unit
  0,              -- No units outstanding yet
  0.00,           -- No P&L yet
  0.00,           -- No return yet
  0.00,           -- Will be updated with live MT5 equity
  0.00            -- Will be updated with live MT5 balance
);

-- STEP 11: Add comment for tracking
COMMENT ON TABLE accounts IS 'Reset for live MT5 trading integration - all balances start at $0';
COMMENT ON TABLE fund_nav IS 'Live NAV tracking connected to MT5 trading bot';
COMMENT ON TABLE mt5_data_feed IS 'Live MT5 account data feed from Python trading bot';