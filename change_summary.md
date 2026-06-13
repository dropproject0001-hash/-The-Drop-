# Security & Auth Hardening Summary

## 1. CORS Hardening (CRIT-6)
- Replaced Access-Control-Allow-Origin: '*' with Deno.env.get("APP_URL") || '*' in:
  - broadcast-location
  - register-client
  - send-otp
  - verify-otp
  - create-dropper
  - set-user-role
  - bootstrap-super-admin
  - assign-role

## 2. Dropper Provisioning & Phone Auth (MED-4)
- Updated 'create-dropper' Edge Function:
  - 'phone' is now mandatory.
  - Users are created with 'phone_confirm: true' to enable immediate OTP login.
  - Metadata and profiles are synced with the phone number.
- Added migration '20260613000003_add_phone_to_profiles.sql' to ensure 'profiles' table has:
  - phone (TEXT, indexed)
  - username (TEXT, unique)
  - alias (TEXT)

## 3. Login Flow Alignment
- Refactored 'src/pages/LoginWithOTP.tsx':
  - Removed demo/localStorage bypass.
  - Fully integrated with 'useAuth' (Supabase Edge Function OTP flow).
  - Added 'refreshRole' call to ensure 'RoleContext' is synced before navigation.
  - Improved UI feedback and error handling with 'useToast'.
