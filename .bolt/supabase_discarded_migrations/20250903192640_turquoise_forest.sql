/*
  # Add auth signup handler

  1. Functions
    - `handle_auth_signup` - Automatically create user profile and account on signup

  2. Triggers
    - Trigger on auth.users insert to create profile and account
*/

-- Create auth signup handler function
CREATE OR REPLACE FUNCTION public.handle_auth_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Insert into public.accounts
  INSERT INTO public.accounts (user_id, account_type, balance, available_balance, currency, status)
  VALUES (
    NEW.id,
    'trading',
    0.00,
    0.00,
    'USD',
    'active'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_signup();