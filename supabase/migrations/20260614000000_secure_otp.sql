-- supabase/migrations/20260614000000_secure_otp.sql

-- Rename code to code_hash
ALTER TABLE public.otp_codes RENAME COLUMN code TO code_hash;

-- Add attempts columns
ALTER TABLE public.otp_codes ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;

-- Drop old index and recreate with code_hash
DROP INDEX IF EXISTS idx_otp_phone_code;
CREATE INDEX idx_otp_phone_code_hash ON public.otp_codes(phone, code_hash);

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper to safely securely insert OTP
CREATE OR REPLACE FUNCTION create_secure_otp(
  p_phone TEXT,
  p_code TEXT,
  p_purpose TEXT,
  p_expires_at TIMESTAMPTZ
)
RETURNS JSON AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.otp_codes (phone, code_hash, purpose, expires_at, used)
  VALUES (p_phone, crypt(p_code, gen_salt('bf', 8)), p_purpose, p_expires_at, false)
  RETURNING id INTO v_id;
  
  RETURN json_build_object('id', v_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for verifying OTP securely to prevent brute force
CREATE OR REPLACE FUNCTION verify_secure_otp(
  p_phone TEXT,
  p_code TEXT,
  p_purpose TEXT
)
RETURNS JSON AS $$
DECLARE
  v_otp_record RECORD;
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
    RETURN json_build_object('success', false, 'error', 'Invalid or expired OTP');
  END IF;

  -- Check lockout
  IF v_otp_record.attempts >= 5 THEN
    -- Mark used to fully invalidate
    UPDATE public.otp_codes SET used = true WHERE id = v_otp_record.id;
    RETURN json_build_object('success', false, 'error', 'Too many failed attempts. Code locked.');
  END IF;

  -- Verify hash
  IF v_otp_record.code_hash = crypt(p_code, v_otp_record.code_hash) THEN
    -- Success
    UPDATE public.otp_codes SET used = true WHERE id = v_otp_record.id;
    RETURN json_build_object('success', true, 'id', v_otp_record.id);
  ELSE
    -- Increment attempts
    UPDATE public.otp_codes SET attempts = attempts + 1 WHERE id = v_otp_record.id;
    RETURN json_build_object('success', false, 'error', 'Invalid OTP');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
