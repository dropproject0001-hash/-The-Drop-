-- Add crypto_secret_key to app_settings (if table doesn't exist)
-- This table stores application-wide configuration values

-- First, ensure app_settings table exists
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Only super_admin can read/write app_settings
DROP POLICY IF EXISTS "super_admin only" ON app_settings;
CREATE POLICY "super_admin only" ON app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'::user_role
    )
  );

-- Insert a default crypto_secret_key
-- IMPORTANT: In production, replace this with a real 32+ character key
INSERT INTO app_settings (key, value)
VALUES ('crypto_secret_key', 'REPLACE_ME_WITH_REAL_SECRET_IN_PRODUCTION_12345')
ON CONFLICT (key) DO NOTHING;
