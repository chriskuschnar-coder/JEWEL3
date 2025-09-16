/*
  # Create users table with proper auth integration

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text, optional)
      - `phone` (text, optional)
      - `kyc_status` (text, default 'pending')
      - `two_factor_enabled` (boolean, default false)
      - `last_login` (timestamp)
      - `documents_completed` (boolean, default false)
      - `documents_completed_at` (timestamp, optional)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data using auth.uid()
    - Add policy for users to update their own data using auth.uid()
    - Add policy for system to insert users
    - Add trigger to update updated_at column
*/

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  two_factor_enabled boolean DEFAULT false,
  last_login timestamptz,
  documents_completed boolean DEFAULT false,
  documents_completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_users_updated_at' 
    AND tgrelid = 'users'::regclass
  ) THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- Policy: Users can view their own data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own data' 
    AND tablename = 'users'
  ) THEN
    CREATE POLICY "Users can view own data"
      ON users
      FOR SELECT
      TO public
      USING (auth.uid() = id);
  END IF;
END$$;

-- Policy: Users can update their own data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update own data' 
    AND tablename = 'users'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END$$;

-- Policy: System can insert users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'System can insert users' 
    AND tablename = 'users'
  ) THEN
    CREATE POLICY "System can insert users"
      ON users
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END$$;