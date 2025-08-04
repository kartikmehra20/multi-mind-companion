/*
  # Add Together AI API Key Support

  1. Changes
    - Add `dangerous_together_api_key` column to `app_settings` table
    - Update chat_using constraint to include 'together' option

  2. Security
    - Column allows null values (optional API key)
    - Maintains existing RLS policies
*/

-- Add Together AI API key column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'dangerous_together_api_key'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN dangerous_together_api_key text;
  END IF;
END $$;

-- Update chat_using constraint to include 'together'
DO $$
BEGIN
  -- Drop existing constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'app_settings_chat_using_check' 
    AND table_name = 'app_settings'
  ) THEN
    ALTER TABLE app_settings DROP CONSTRAINT app_settings_chat_using_check;
  END IF;
  
  -- Add updated constraint
  ALTER TABLE app_settings ADD CONSTRAINT app_settings_chat_using_check 
    CHECK (chat_using = ANY (ARRAY['openrouter'::text, 'openai'::text, 'together'::text]));
END $$;