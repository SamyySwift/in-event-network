-- ... existing code ...
-- Enable extension for UUID if needed
create extension if not exists pgcrypto;

-- Create topics table
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  user_id uuid not null,
  title text not null,
  description text,
  status text not null default 'open', -- 'open' | 'closed'
  poll_id uuid null references public.polls(id) on delete set null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.topics enable row level security;

-- Policies
create policy "topics_select_authenticated"
  on public.topics
  for select
  to authenticated
  using (true);

create policy "topics_insert_owner"
  on public.topics
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "topics_update_owner"
  on public.topics
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "topics_delete_owner"
  on public.topics
  for delete
  to authenticated
  using (user_id = auth.uid());
-- ... existing code ...