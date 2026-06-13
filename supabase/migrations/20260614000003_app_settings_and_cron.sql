-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id          BIGSERIAL PRIMARY KEY,
  key         TEXT      NOT NULL UNIQUE,
  value       TEXT      NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read settings (for PIN verification)
CREATE POLICY "Allow authenticated read-only access"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (true);

-- Insert default PINs
INSERT INTO public.app_settings (key, value, description) VALUES
  ('super_admin_pin', '888888', 'PIN for Super Admin access'),
  ('admin_pin', '777777', 'PIN for Admin access'),
  ('dropper_pin', '666666', 'PIN for Dropper access'),
  ('client_pin', '555555', 'PIN for Client access')
ON CONFLICT (key) DO NOTHING;

-- Function to expire drops (to be called by cron)
CREATE OR REPLACE FUNCTION public.expire_drops_worker()
RETURNS void AS $$
BEGIN
  UPDATE public.drops
  SET status = 'expired'
  WHERE status = 'active'
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the worker every minute
SELECT cron.schedule(
  'expire-drops-job',
  '* * * * *',
  'SELECT public.expire_drops_worker();'
);
