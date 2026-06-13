-- 20260613000003_add_phone_to_profiles.sql
-- Ensure profiles table has phone column for tactical authentication and lookups.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    CREATE INDEX idx_profiles_phone ON public.profiles(phone);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT;
    CREATE UNIQUE INDEX idx_profiles_username ON public.profiles(username);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'alias') THEN
    ALTER TABLE public.profiles ADD COLUMN alias TEXT;
  END IF;
END
$$;

COMMENT ON COLUMN public.profiles.phone IS 'Tactical mobile identifier for OTP authentication.';
