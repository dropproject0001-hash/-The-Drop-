-- 20260614000003_drop_status_integrity.sql
-- Last line of defense for drop lifecycle integrity.
-- Prevents terminal states (claimed, expired) from being reverted to active.
-- Prevents modification of core drop data once claimed.

CREATE OR REPLACE FUNCTION public.prevent_invalid_drop_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Prevent moving from terminal states (claimed, expired) back to active
  IF (OLD.status = 'claimed' OR OLD.status = 'expired') AND NEW.status = 'active' THEN
    RAISE EXCEPTION 'Cannot move drop from % back to active status.', OLD.status;
  END IF;

  -- 2. Prevent modifying location, creator, or assignee of a claimed drop
  IF OLD.status = 'claimed' THEN
    IF NEW.lat <> OLD.lat OR
       NEW.lng <> OLD.lng OR
       NEW.created_by <> OLD.created_by OR
       NEW.assigned_to <> OLD.assigned_to OR
       NEW.qr_token <> OLD.qr_token THEN
       RAISE EXCEPTION 'Cannot modify integrity-critical data of a claimed drop (lat, lng, creator, assignee, qr_token).';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_invalid_drop_status ON public.drops;
CREATE TRIGGER tr_prevent_invalid_drop_status
  BEFORE UPDATE ON public.drops
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR
        OLD.lat IS DISTINCT FROM NEW.lat OR
        OLD.lng IS DISTINCT FROM NEW.lng OR
        OLD.assigned_to IS DISTINCT FROM NEW.assigned_to)
  EXECUTE FUNCTION public.prevent_invalid_drop_status();
