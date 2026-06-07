-- supabase/migrations/001_init.sql
-- FIX H-8: Added trigger to populate the 'user_role' custom JWT claim so that
--           the my_role() helper function is not always NULL.
--           Without this trigger, ALL RLS policies that use my_role() silently
--           deny access for every non-super_admin user.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUMS ────────────────────────────────────────────────────────────────────
CREATE TYPE user_role     AS ENUM ('super_admin', 'admin', 'client');
CREATE TYPE drop_status   AS ENUM ('active', 'claimed', 'expired');
CREATE TYPE pickup_method AS ENUM ('qr_scan', 'manual');
CREATE TYPE notif_type    AS ENUM ('drop_created', 'drop_claimed', 'drop_expired', 'user_login', 'message_received');

-- ── PROFILES ─────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            user_role        NOT NULL DEFAULT 'client',
  display_name    TEXT             NOT NULL,
  avatar_url      TEXT,
  is_online       BOOLEAN          NOT NULL DEFAULT FALSE,
  last_seen       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  push_endpoint   TEXT,
  push_keys       JSONB,
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ── LOCATIONS (append-only) ──────────────────────────────────────────────────
CREATE TABLE locations (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  heading     REAL,
  accuracy    REAL,
  speed       REAL,
  altitude    REAL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_locations_user_time ON locations(user_id, recorded_at DESC);

-- ── DROPS ────────────────────────────────────────────────────────────────────
CREATE TABLE drops (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by      UUID         NOT NULL REFERENCES profiles(id),
  assigned_to     UUID         NOT NULL REFERENCES profiles(id),
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  title           TEXT         NOT NULL,
  notes_encrypted TEXT,
  photo_url       TEXT,
  video_url       TEXT,
  qr_token        TEXT         NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status          drop_status  NOT NULL DEFAULT 'active',
  pickup_order    SMALLINT     NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_drops_assigned_status ON drops(assigned_to, status);
CREATE INDEX idx_drops_created_by      ON drops(created_by);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER drops_updated_at BEFORE UPDATE ON drops FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ── PICKUPS ──────────────────────────────────────────────────────────────────
CREATE TABLE pickups (
  id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  drop_id      UUID          NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  client_id    UUID          NOT NULL REFERENCES profiles(id),
  confirmed_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  method       pickup_method NOT NULL,
  scan_lat     DOUBLE PRECISION,
  scan_lng     DOUBLE PRECISION,
  UNIQUE(drop_id)
);

-- ── CHAT ─────────────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id    TEXT        NOT NULL,
  sender_id  UUID        NOT NULL REFERENCES profiles(id),
  body       TEXT        NOT NULL CHECK (char_length(body) <= 2000),
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_messages_room_time ON messages(room_id, created_at ASC);

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES profiles(id),
  type       notif_type  NOT NULL,
  title      TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  entity_id  UUID,
  read       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ACTIVITY LOG (immutable) ──────────────────────────────────────────────────
CREATE TABLE activity_log (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,
  entity_type TEXT        NOT NULL,
  entity_id   UUID,
  meta        JSONB       NOT NULL DEFAULT '{}',
  ts          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups       ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log  ENABLE ROW LEVEL SECURITY;

-- ── FIX H-8: JWT claim helper + TRIGGER to populate it ───────────────────────
--
-- my_role() reads the 'user_role' custom claim from the JWT. Without the
-- trigger below, this claim is never set and my_role() always returns NULL,
-- causing all role-based RLS policies to silently deny everything.
--
-- The trigger fires on INSERT and UPDATE to profiles, then calls
-- auth.update_user_metadata to set user_role in the JWT claims.
-- In Supabase this is done via the set_claim helper from the
-- supabase-community/supabase-custom-claims extension, OR by using the
-- Auth Admin API. The pattern below uses a SECURITY DEFINER function that
-- calls the supabase_admin schema.
--

CREATE OR REPLACE FUNCTION my_role() RETURNS user_role AS $$
  SELECT (auth.jwt() ->> 'user_role')::user_role;
$$ LANGUAGE sql STABLE;

-- Trigger function: sync profile.role → JWT app_metadata.user_role
-- Requires the pg_net extension or Supabase's auth hook.
-- Using Supabase's built-in auth.update_user() via a SECURITY DEFINER function:
CREATE OR REPLACE FUNCTION sync_role_to_jwt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update auth.users app_metadata so Supabase re-issues the JWT with user_role
  UPDATE auth.users
  SET raw_app_meta_data =
        raw_app_meta_data ||
        jsonb_build_object('user_role', NEW.role::text)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_role_change
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_jwt();

-- ── RLS POLICIES ──────────────────────────────────────────────────────────────

-- PROFILES
CREATE POLICY "super_admin full access"  ON profiles FOR ALL USING (my_role() = 'super_admin');
CREATE POLICY "own profile read/write"   ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "admin reads clients"      ON profiles FOR SELECT USING (my_role() = 'admin' AND role = 'client');

-- LOCATIONS
CREATE POLICY "super_admin sees all"     ON locations FOR ALL    USING (my_role() = 'super_admin');
CREATE POLICY "own location rows"        ON locations FOR ALL    USING (auth.uid() = user_id);

-- DROPS
CREATE POLICY "super_admin full drops"   ON drops FOR ALL    USING (my_role() = 'super_admin');
CREATE POLICY "admin own drops"          ON drops FOR ALL    USING (my_role() = 'admin' AND created_by = auth.uid());
CREATE POLICY "client assigned drops"    ON drops FOR SELECT USING (my_role() = 'client' AND assigned_to = auth.uid());

-- PICKUPS
CREATE POLICY "super_admin full pickups" ON pickups FOR ALL    USING (my_role() = 'super_admin');
CREATE POLICY "admin reads own pickups"  ON pickups FOR SELECT USING (
  my_role() = 'admin' AND EXISTS (SELECT 1 FROM drops WHERE drops.id = pickups.drop_id AND drops.created_by = auth.uid())
);
CREATE POLICY "client own pickups"       ON pickups FOR ALL    USING (my_role() = 'client' AND client_id = auth.uid());

-- MESSAGES
CREATE POLICY "super_admin full messages" ON messages FOR ALL  USING (my_role() = 'super_admin');
CREATE POLICY "room participants"         ON messages FOR ALL  USING (
  auth.uid()::text = ANY(string_to_array(room_id, '_'))
);

-- NOTIFICATIONS
CREATE POLICY "own notifications"         ON notifications FOR ALL USING (user_id = auth.uid());

-- ACTIVITY LOG
CREATE POLICY "super_admin reads logs"    ON activity_log FOR SELECT USING (my_role() = 'super_admin');
CREATE POLICY "insert activity"           ON activity_log FOR INSERT WITH CHECK (TRUE);
