-- Add a setup token so the user can register their super admin
create table if not exists public.setup_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  used boolean default false,
  expires_at timestamptz default (now() + interval '48 hours'),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.setup_tokens enable row level security;

-- Restricted to service role only. No client-side access.
create policy "Service role only - setup_tokens" on public.setup_tokens
  for all using (auth.role() = 'service_role');

-- Insert a single, known setup token for the owner
-- NO HARDCODED TOKENS IN SOURCE.
-- Generate tokens via Supabase dashboard or secure CLI script.
