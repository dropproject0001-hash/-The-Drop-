-- Add missing fields to profiles table that are used by Edge Functions and Frontend
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username text unique,
ADD COLUMN IF NOT EXISTS alias text,
ADD COLUMN IF NOT EXISTS bio text;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
