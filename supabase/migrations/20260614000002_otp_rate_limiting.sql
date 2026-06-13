-- supabase/migrations/20260614000002_otp_rate_limiting.sql

-- 1. Create a table for tracking verification rate limits to prevent brute forcing
CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address  TEXT NOT NULL,
  phone       TEXT,
  action      TEXT NOT NULL, -- 'verify_otp' | 'send_otp'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast counts over standard sliding windows
CREATE INDEX IF NOT EXISTS idx_edge_rate_limits_window ON public.edge_rate_limits(ip_address, phone, action, created_at DESC);

-- Enable RLS
ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role has access to rate limits
DROP POLICY IF EXISTS "Service role full access to edge rate limits" ON public.edge_rate_limits;
CREATE POLICY "Service role full access to edge rate limits"
ON public.edge_rate_limits
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');


-- 2. RPC function to verify and log rate limits in database
CREATE OR REPLACE FUNCTION check_and_log_rate_limit(
  p_ip TEXT,
  p_phone TEXT,
  p_action TEXT,
  p_max_attempts INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Cleanup old rate limits (> 1 hour old) to keep the table compact
  DELETE FROM public.edge_rate_limits WHERE created_at < NOW() - INTERVAL '1 hour';

  -- Count recent requests
  SELECT COUNT(*)
  INTO v_count
  FROM public.edge_rate_limits
  WHERE (ip_address = p_ip OR (p_phone IS NOT NULL AND phone = p_phone))
    AND action = p_action
    AND created_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL;

  IF v_count >= p_max_attempts THEN
    RETURN FALSE; -- Throttled
  END IF;

  -- Log this attempt
  INSERT INTO public.edge_rate_limits (ip_address, phone, action)
  VALUES (p_ip, p_phone, p_action);

  RETURN TRUE; -- Allowed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Enhance verify_secure_otp with instant 5-attempt locking & attempts count output
CREATE OR REPLACE FUNCTION verify_secure_otp(
  p_phone TEXT,
  p_code TEXT,
  p_purpose TEXT
)
RETURNS JSON AS $$
DECLARE
  v_otp_record RECORD;
  v_new_attempts INTEGER;
BEGIN
  -- Get the latest unused, unexpired OTP for this phone and purpose
  SELECT id, code_hash, attempts, used, expires_at
  INTO v_otp_record
  FROM public.otp_codes
  WHERE phone = p_phone
    AND purpose = p_purpose
    AND used = false
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired OTP', 'attempts_remaining', 0);
  END IF;

  -- Check lockout BEFORE testing (in case it was already locked or reached limit)
  IF v_otp_record.attempts >= 5 THEN
    -- Mark used to fully invalidate
    UPDATE public.otp_codes SET used = true WHERE id = v_otp_record.id;
    RETURN json_build_object('success', false, 'error', 'Too many failed attempts. Code locked.', 'attempts_remaining', 0);
  END IF;

  -- Verify hash
  IF v_otp_record.code_hash = crypt(p_code, v_otp_record.code_hash) THEN
    -- Success: mark as used and return success details
    UPDATE public.otp_codes SET used = true WHERE id = v_otp_record.id;
    RETURN json_build_object('success', true, 'id', v_otp_record.id);
  ELSE
    -- Increment attempts
    v_new_attempts := v_otp_record.attempts + 1;

    IF v_new_attempts >= 5 THEN
      -- Lockout immediately
      UPDATE public.otp_codes SET attempts = v_new_attempts, used = true WHERE id = v_otp_record.id;
      RETURN json_build_object('success', false, 'error', 'Too many failed attempts. Code locked.', 'attempts_remaining', 0);
    ELSE
      -- Standalone increment
      UPDATE public.otp_codes SET attempts = v_new_attempts WHERE id = v_otp_record.id;
      RETURN json_build_object('success', false, 'error', 'Invalid OTP', 'attempts_remaining', 5 - v_new_attempts);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
