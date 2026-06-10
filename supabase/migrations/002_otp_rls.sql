-- Enable RLS (already done earlier, but re-apply if needed)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role can manage OTPs" ON public.otp_codes;
DROP POLICY IF EXISTS "Service role full access to OTPs" ON public.otp_codes;
DROP POLICY IF EXISTS "Users can read their own OTPs" ON public.otp_codes;
DROP POLICY IF EXISTS "No direct insert by users" ON public.otp_codes;
DROP POLICY IF EXISTS "No direct update by users" ON public.otp_codes;

-- Only service role (Edge Functions) can insert/read/update OTPs
CREATE POLICY "Service role full access to OTPs"
ON public.otp_codes
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Users can only read their own valid OTPs (for checking status)
CREATE POLICY "Users can read their own OTPs"
ON public.otp_codes
FOR SELECT
USING (phone = auth.jwt() ->> 'phone' AND used = false AND expires_at > now());

-- Prevent normal users from inserting or updating OTPs directly
CREATE POLICY "No direct insert by users"
ON public.otp_codes
FOR INSERT
WITH CHECK (false);

CREATE POLICY "No direct update by users"
ON public.otp_codes
FOR UPDATE
USING (false);
