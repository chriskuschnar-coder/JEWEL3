/*
  # Create user signup trigger and function

  1. Functions
    - `handle_auth_signup()` - Creates user record and account when auth user signs up

  2. Triggers
    - Trigger on auth.users insert to create user record and account

  3. Security
    - Function runs with security definer privileges
    - Automatically creates account with $0 balance for new users
*/

-- Create the signup handler function
CREATE OR REPLACE FUNCTION handle_auth_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Create account for the new user
  INSERT INTO public.accounts (user_id, balance, available_balance)
  VALUES (NEW.id, 0.00, 0.00);
  
  RETURN NEW;
END;
$$;

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_auth_signup();
  END IF;
END $$;