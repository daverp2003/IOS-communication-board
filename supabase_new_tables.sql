-- Run this in the Supabase dashboard → SQL Editor
-- Required for the Symbol Requests feature (Settings → Requests tab)

create table if not exists symbol_requests (
  id               uuid primary key default gen_random_uuid(),
  label            text        not null,
  emoji_suggestion text,
  context          text,
  profile_name     text,
  created_at       timestamptz not null default now()
);

-- Allow anonymous inserts (the app uses the anon key)
alter table symbol_requests enable row level security;

create policy "Anyone can submit a request"
  on symbol_requests for insert
  to anon
  with check (true);

-- Only service_role (your dashboard) can read requests
create policy "Service role can read requests"
  on symbol_requests for select
  to service_role
  using (true);
