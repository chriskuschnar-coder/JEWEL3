/*
  # Add onboarding table

  1. New Tables
    - `onboarding` - Document onboarding tracking

  2. Security
    - Enable RLS on onboarding table
    - Add policies for users to manage their own onboarding data
*/

CREATE TABLE IF NOT EXISTS public.onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  document_name text NOT NULL,
  document_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  signed_at timestamptz
);

ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

-- Onboarding policies
DROP POLICY IF EXISTS "Users can read own onboarding" ON public.onboarding;
CREATE POLICY "Users can read own onboarding"
  ON public.onboarding FOR SELECT
  TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.onboarding;
CREATE POLICY "Users can insert own onboarding"
  ON public.onboarding FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own onboarding" ON public.onboarding;
CREATE POLICY "Users can update own onboarding"
  ON public.onboarding FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own onboarding" ON public.onboarding;
CREATE POLICY "Users can delete own onboarding"
  ON public.onboarding FOR DELETE
  TO public
  USING (auth.uid() = user_id);