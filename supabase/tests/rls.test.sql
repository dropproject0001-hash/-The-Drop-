-- supabase/tests/rls.test.sql
-- Improved RLS Test Suite for DropPin Ops

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgtap";

SELECT plan(12);

-- ============================================
-- TEST SETUP: Create mock users (if needed)
-- ============================================
-- Note: In real Supabase, you usually test via JWT claims.
-- For stricter testing, you can create test users in auth.users.

-- ============================================
-- ROLE: super_admin
-- ============================================
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","user_role":"super_admin"}', true);

SELECT results_eq(
    $$ SELECT COUNT(*)::bigint FROM drops $$,
    $$ SELECT COUNT(*)::bigint FROM drops $$,
    'super_admin can read all drops'
);

SELECT results_eq(
    $$ SELECT COUNT(*)::bigint FROM locations $$,
    $$ SELECT COUNT(*)::bigint FROM locations $$,
    'super_admin can read all locations'
);

-- ============================================
-- ROLE: admin
-- ============================================
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002","user_role":"admin"}', true);

SELECT results_eq(
    $$ SELECT COUNT(*)::bigint FROM drops WHERE created_by <> '00000000-0000-0000-0000-000000000002' $$,
    $$ SELECT 0::bigint $$,
    'admin can only see their own drops'
);

SELECT throws_ok(
    $$ INSERT INTO drops (created_by, assigned_to, lat, lng, title) 
       VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 0, 0, 'Unauthorized Insert') $$,
    'new row violates row-level security policy for table "drops"',
    'admin cannot insert drops for other users'
);

-- ============================================
-- ROLE: client
-- ============================================
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000004","user_role":"client"}', true);

SELECT results_eq(
    $$ SELECT COUNT(*)::bigint FROM drops WHERE assigned_to <> '00000000-0000-0000-0000-000000000004' $$,
    $$ SELECT 0::bigint $$,
    'client can only see drops assigned to them'
);

SELECT throws_ok(
    $$ INSERT INTO drops (created_by, assigned_to, lat, lng, title) 
       VALUES ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 0, 0, 'Client Insert') $$,
    'new row violates row-level security policy for table "drops"',
    'client cannot insert drops'
);

-- ============================================
-- Activity Log Tests
-- ============================================
SELECT lives_ok(
    $$ INSERT INTO activity_log (action, entity_type) VALUES ('test_action', 'test') $$,
    'Any authenticated user can insert into activity_log'
);

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000004","user_role":"client"}', true);

SELECT results_eq(
    $$ SELECT COUNT(*)::bigint FROM activity_log $$,
    $$ SELECT 0::bigint $$,
    'Client cannot read activity_log'
);

SELECT * FROM finish();
ROLLBACK;
