-- Add phone column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;

-- Update RLS policies to allow reading own phone
-- profiles already has "own profile read/write" policy:
-- CREATE POLICY "own profile read/write" ON profiles FOR ALL USING (auth.uid() = id);
-- So no new policy needed for basic access.
