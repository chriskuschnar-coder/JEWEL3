/*
  # Add Welcome Flow Fields to Users Table

  1. New Columns
    - `welcome_email_sent` (boolean) - tracks if welcome email was sent
    - `welcome_email_sent_at` (timestamp) - when welcome email was sent
    - `onboarding_completed_at` (timestamp) - when user completed full onboarding

  2. Purpose
    - Ensure welcome email is only sent once per user
    - Track onboarding completion for analytics
    - Prevent duplicate welcome flows
*/

-- Add welcome email tracking fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'welcome_email_sent'
  ) THEN
    ALTER TABLE users ADD COLUMN welcome_email_sent boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'welcome_email_sent_at'
  ) THEN
    ALTER TABLE users ADD COLUMN welcome_email_sent_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'onboarding_completed_at'
  ) THEN
    ALTER TABLE users ADD COLUMN onboarding_completed_at timestamptz;
  END IF;
END $$;

-- Add index for welcome email tracking
CREATE INDEX IF NOT EXISTS idx_users_welcome_email_sent 
ON users (welcome_email_sent) 
WHERE welcome_email_sent = true;

-- Add index for onboarding completion tracking
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed 
ON users (onboarding_completed_at) 
WHERE onboarding_completed_at IS NOT NULL;