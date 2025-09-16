/*
  # Create onboarding table

  1. New Tables
    - `onboarding`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `document_name` (text, not null)
      - `document_url` (text, not null)
      - `created_at` (timestamptz, default now())
      - `signed_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on `onboarding` table
    - Add policies for users to manage their own onboarding documents
*/

-- Create onboarding table
CREATE TABLE IF NOT EXISTS onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  document_name text NOT NULL,
  document_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  signed_at timestamptz
);

-- Enable RLS
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own onboarding"
  ON onboarding
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON onboarding
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON onboarding
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own onboarding"
  ON onboarding
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding(user_id);