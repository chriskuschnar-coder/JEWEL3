/*
  # Create automatic account creation trigger

  1. New Functions
    - `create_investor_units_for_new_user()` - Creates investor_units when account is created
    - Trigger on accounts table to auto-create investor_units

  2. Security
    - Function runs with security definer privileges
    - Automatically creates investor_units for new accounts

  3. Changes
    - Ensures every new account gets investor_units record
    - Starts all users at 0 units for live MT5 integration
*/

-- Create function to auto-create investor_units for new accounts
CREATE OR REPLACE FUNCTION create_investor_units_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create investor_units record for the new account
  INSERT INTO investor_units (
    user_id,
    account_id,
    units_held,
    avg_purchase_nav,
    total_invested,
    current_value,
    unrealized_pnl
  ) VALUES (
    NEW.user_id,
    NEW.id,
    0,
    1000.0000,
    0,
    0,
    0
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to accounts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'create_investor_units_trigger' 
    AND tgrelid = 'accounts'::regclass
  ) THEN
    CREATE TRIGGER create_investor_units_trigger
      AFTER INSERT ON accounts
      FOR EACH ROW
      EXECUTE FUNCTION create_investor_units_for_new_user();
  END IF;
END$$;