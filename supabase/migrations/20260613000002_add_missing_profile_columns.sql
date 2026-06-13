-- supabase/migrations/20260613000002_add_missing_profile_columns.sql
-- Synchronizing profiles table with Database types

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username       TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS alias          TEXT,
  ADD COLUMN IF NOT EXISTS phone          TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_by     UUID;

-- Add index for username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
