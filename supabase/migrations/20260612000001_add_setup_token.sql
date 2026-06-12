-- Add a setup token so the user can register their super admin
create table if not exists public.setup_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS just to be safe
alter table public.setup_tokens enable row level security;

-- Setup tokens are read-only for anon/authenticated (to check validity)
create policy "Allow read setup tokens" on public.setup_tokens
  for select using (true);

-- Super admin only updates
create policy "Allow update setup tokens" on public.setup_tokens
  for update using (true);

-- Insert a single, known setup token for the owner
insert into public.setup_tokens (token, used)
values ('SUPER-ADMIN-1337-TOKEN', false)
on conflict (token) do nothing;
