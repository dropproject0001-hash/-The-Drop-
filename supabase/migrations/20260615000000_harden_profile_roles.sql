-- Tactical Assessment:
-- The 'profiles' table had an 'own profile read/write' policy that allowed users
-- to update their own 'role' column. Since a trigger automatically promotes
-- the user in Auth app_metadata upon role change, this was a direct
-- privilege escalation vector to 'super_admin'.

-- 1. Create a trigger function to block unauthorized role changes
-- FIX: Set search_path and revoke execute from public to address advisor warnings.
CREATE OR REPLACE FUNCTION public.protect_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Check if the actor is NOT a super_admin AND NOT the service_role
    -- We use the JWT claim 'user_role' which is our source of truth for current role.
    IF (auth.jwt() ->> 'user_role') IS DISTINCT FROM 'super_admin'
       AND auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'Security Breach: Privilege escalation detected. Only ROOT (super_admin) can modify operative clearance levels.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke execution from public to prevent RPC exploitation
REVOKE EXECUTE ON FUNCTION public.protect_role_escalation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_role_escalation() FROM anon, authenticated;

-- 2. Attach the trigger
DROP TRIGGER IF EXISTS check_role_change ON public.profiles;
CREATE TRIGGER check_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_role_escalation();

-- 3. Refine RLS for profiles to be more defensive
DROP POLICY IF EXISTS "own profile read/write" ON public.profiles;

CREATE POLICY "own profile select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "own profile update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Harden location integrity (Append-only)
-- Prevents operators from 'cleaning' their tracks by deleting or modifying history.
DROP POLICY IF EXISTS "own location rows" ON public.locations;

CREATE POLICY "own location select"
  ON public.locations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "own location insert"
  ON public.locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Note: We intentionally DO NOT add UPDATE or DELETE policies for 'authenticated' users on locations.
-- super_admin already has ALL access via "super_admin sees all" policy in 001_init.sql.
