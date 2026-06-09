-- 20260609181200_custom_access_token_hook.sql
-- Custom access token hook for automatic role injection into JWT

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  user_role text; -- Changed to text to match profile role definition
begin
  -- Get role from profiles table
  select role into user_role
  from public.profiles
  where id = (event->>'user_id')::uuid;

  claims := event->'claims';

  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Grant necessary permissions
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;

revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
