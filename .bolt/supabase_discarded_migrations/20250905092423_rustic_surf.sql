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
    - Add policy for users to read their own data
    - Add policy for system to insert users
    - Add policy for users to update their own data
*/

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
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

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Policy for users to read their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read own data' 
    AND tablename = 'users'
  ) THEN
    CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    USING (auth.uid() = id);
  END IF;

  -- Policy for system to insert users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'System can insert users' 
    AND tablename = 'users'
  ) THEN
    CREATE POLICY "System can insert users"
    ON users
    FOR INSERT
    WITH CHECK (true);
  END IF;

  -- Policy for users to update their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update own data' 
    AND tablename = 'users'
  ) THEN
    CREATE POLICY "Users can update own data"
    ON users
    FOR UPDATE
    USING (auth.uid() = id);
  END IF;
END $$;