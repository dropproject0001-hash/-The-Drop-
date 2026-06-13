-- Better setup_tokens table
create table if not exists public.setup_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  used boolean default false,
  expires_at timestamptz default (now() + interval '48 hours'),
  created_at timestamptz default now()
);

alter table public.setup_tokens enable row level security;

-- Restrict heavily
drop policy if exists "Allow read setup tokens" on public.setup_tokens;
drop policy if exists "Allow update setup tokens" on public.setup_tokens;

create policy "Service role only - setup_tokens" on public.setup_tokens
  for all using (auth.role() = 'service_role');
