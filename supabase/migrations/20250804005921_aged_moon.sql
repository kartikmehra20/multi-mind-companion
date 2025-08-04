/*
  # Initial Database Schema

  1. New Tables
    - `threads`
      - `id` (uuid, primary key)
      - `title` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `messages`
      - `id` (uuid, primary key)
      - `thread_id` (uuid, foreign key)
      - `role` (text)
      - `content` (text)
      - `model` (text, optional)
      - `provider` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - Token tracking fields
    - `app_settings`
      - Configuration table for application settings
    - `microtasks`
      - Background task tracking
    - `thread_errors`
      - Error logging table

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (no authentication required)
*/

-- Create threads table
CREATE TABLE IF NOT EXISTS threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text DEFAULT 'New Chat',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES threads(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text,
  model text,
  provider text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  column_index integer,
  tool_call jsonb,
  raw_output jsonb,
  external_id text,
  input_tokens integer DEFAULT 0,
  input_cached_tokens integer DEFAULT 0,
  input_audio_tokens integer DEFAULT 0,
  input_cached_audio_tokens integer DEFAULT 0,
  input_image_tokens integer DEFAULT 0,
  input_cached_image_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  output_audio_tokens integer DEFAULT 0,
  output_image_tokens integer DEFAULT 0,
  output_reasoning_tokens integer DEFAULT 0,
  input_token_price numeric DEFAULT 0,
  input_cached_token_price numeric DEFAULT 0,
  input_audio_token_price numeric DEFAULT 0,
  input_cached_audio_token_price numeric DEFAULT 0,
  input_image_token_price numeric DEFAULT 0,
  input_cached_image_token_price numeric DEFAULT 0,
  output_token_price numeric DEFAULT 0,
  output_audio_token_price numeric DEFAULT 0,
  output_image_token_price numeric DEFAULT 0,
  output_reasoning_token_price numeric DEFAULT 0,
  other_cost numeric DEFAULT 0
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_model text DEFAULT 'anthropic/claude-3-haiku',
  chat_using text DEFAULT 'openrouter',
  system_prompt text DEFAULT 'You are a helpful assistant who''s always eager to help & be proactive. Keep language crisp and to the point. Use bullets & sub-sections whenever helpful. Avoid overusing emojis.',
  default_temperature numeric DEFAULT 0.5,
  max_output_tokens integer DEFAULT 0,
  budget_max_24h numeric DEFAULT 0,
  budget_input_token_cost numeric DEFAULT 0.000002,
  budget_output_token_cost numeric DEFAULT 0.000004,
  use_keys_from text DEFAULT 'localstorage',
  dangerous_openai_api_key text,
  dangerous_openrouter_api_key text,
  dangerous_huggingface_api_key text,
  utility_transcription_enabled boolean DEFAULT false,
  utility_transcription_model text DEFAULT 'gpt-4o-mini-transcribe',
  utility_transcription_provider text DEFAULT 'openai',
  utility_title_model text DEFAULT 'anthropic/claude-3-haiku',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create microtasks table
CREATE TABLE IF NOT EXISTS microtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES threads(id) ON DELETE CASCADE,
  task_type text NOT NULL,
  status text DEFAULT 'pending',
  input_data jsonb,
  output_data jsonb,
  model text,
  temperature numeric,
  retry_count integer DEFAULT 0,
  error_code text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  input_tokens integer DEFAULT 0,
  input_cached_tokens integer DEFAULT 0,
  input_audio_tokens integer DEFAULT 0,
  input_cached_audio_tokens integer DEFAULT 0,
  input_image_tokens integer DEFAULT 0,
  input_cached_image_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  output_audio_tokens integer DEFAULT 0,
  output_image_tokens integer DEFAULT 0,
  output_reasoning_tokens integer DEFAULT 0,
  input_token_price numeric DEFAULT 0,
  input_cached_token_price numeric DEFAULT 0,
  input_audio_token_price numeric DEFAULT 0,
  input_cached_audio_token_price numeric DEFAULT 0,
  input_image_token_price numeric DEFAULT 0,
  input_cached_image_token_price numeric DEFAULT 0,
  output_token_price numeric DEFAULT 0,
  output_audio_token_price numeric DEFAULT 0,
  output_image_token_price numeric DEFAULT 0,
  output_reasoning_token_price numeric DEFAULT 0
);

-- Create thread_errors table
CREATE TABLE IF NOT EXISTS thread_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES threads(id) ON DELETE CASCADE,
  error_code text,
  error_message text,
  raised_by text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE microtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_errors ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
-- Threads policies
CREATE POLICY "Allow public access to threads" ON threads
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Messages policies
CREATE POLICY "Allow public access to messages" ON messages
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- App settings policies
CREATE POLICY "Allow public access to app_settings" ON app_settings
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Microtasks policies
CREATE POLICY "Allow public access to microtasks" ON microtasks
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Thread errors policies
CREATE POLICY "Allow public access to thread_errors" ON thread_errors
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_threads_updated_at ON threads(updated_at);
CREATE INDEX IF NOT EXISTS idx_microtasks_thread_id ON microtasks(thread_id);
CREATE INDEX IF NOT EXISTS idx_microtasks_status ON microtasks(status);

-- Insert default app settings if none exist
INSERT INTO app_settings (
  default_model,
  chat_using,
  system_prompt,
  default_temperature,
  max_output_tokens,
  budget_max_24h,
  budget_input_token_cost,
  budget_output_token_cost,
  use_keys_from,
  utility_transcription_enabled,
  utility_transcription_model,
  utility_transcription_provider,
  utility_title_model
) 
SELECT 
  'anthropic/claude-3-haiku',
  'openrouter',
  'You are a helpful assistant who''s always eager to help & be proactive. Keep language crisp and to the point. Use bullets & sub-sections whenever helpful. Avoid overusing emojis.',
  0.5,
  0,
  0,
  0.000002,
  0.000004,
  'localstorage',
  false,
  'gpt-4o-mini-transcribe',
  'openai',
  'anthropic/claude-3-haiku'
WHERE NOT EXISTS (SELECT 1 FROM app_settings);