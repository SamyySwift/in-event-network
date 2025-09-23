-- 1) Tables
create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  name text not null,
  tag text,
  color text default '#3b82f6',
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_rooms
  add constraint chat_rooms_event_fk
  foreign key (event_id) references public.events(id) on delete cascade;

alter table public.chat_rooms
  add constraint chat_rooms_owner_fk
  foreign key (created_by) references public.profiles(id) on delete cascade;

create index if not exists idx_chat_rooms_event on public.chat_rooms(event_id);

create table if not exists public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null,
  user_id uuid not null,
  joined_at timestamptz not null default now(),
  unique (room_id, user_id)
);

alter table public.room_members
  add constraint room_members_room_fk
  foreign key (room_id) references public.chat_rooms(id) on delete cascade;

alter table public.room_members
  add constraint room_members_user_fk
  foreign key (user_id) references public.profiles(id) on delete cascade;

create index if not exists idx_room_members_room on public.room_members(room_id);
create index if not exists idx_room_members_user on public.room_members(user_id);

-- 2) Alter chat_messages to support room_id
alter table public.chat_messages
  add column if not exists room_id uuid null;

alter table public.chat_messages
  add constraint chat_messages_room_fk
  foreign key (room_id) references public.chat_rooms(id) on delete set null;

create index if not exists idx_chat_messages_event_room_created
  on public.chat_messages(event_id, room_id, created_at);

-- 3) RLS
alter table public.chat_rooms enable row level security;
alter table public.room_members enable row level security;

-- helper: check if current user is event participant
-- Assumes event_participants(event_id, user_id) exists.
-- Policies for chat_rooms
drop policy if exists chat_rooms_select_event_members on public.chat_rooms;
create policy chat_rooms_select_event_members
on public.chat_rooms
for select
to authenticated
using (
  exists (
    select 1 from public.event_participants ep
    where ep.event_id = chat_rooms.event_id and ep.user_id = auth.uid()
  ) or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role,'')) in ('host','admin','organizer')
  )
);

drop policy if exists chat_rooms_insert_event_members on public.chat_rooms;
create policy chat_rooms_insert_event_members
on public.chat_rooms
for insert
to authenticated
with check (
  -- creator must be participant of the event
  exists (
    select 1 from public.event_participants ep
    where ep.event_id = chat_rooms.event_id and ep.user_id = auth.uid()
  )
  and created_by = auth.uid()
);

drop policy if exists chat_rooms_update_owner_or_host on public.chat_rooms;
create policy chat_rooms_update_owner_or_host
on public.chat_rooms
for update
to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role,'')) in ('host','admin','organizer')
  )
)
with check (true);

drop policy if exists chat_rooms_delete_owner_or_host on public.chat_rooms;
create policy chat_rooms_delete_owner_or_host
on public.chat_rooms
for delete
to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role,'')) in ('host','admin','organizer')
  )
);

-- Policies for room_members
drop policy if exists room_members_select_event_members on public.room_members;
create policy room_members_select_event_members
on public.room_members
for select
to authenticated
using (
  exists (
    select 1 from public.chat_rooms r
    join public.event_participants ep on ep.event_id = r.event_id
    where r.id = room_members.room_id and ep.user_id = auth.uid()
  ) or exists (
    select 1 from public.chat_rooms r
    join public.profiles p on p.id = auth.uid()
    where r.id = room_members.room_id and lower(coalesce(p.role,'')) in ('host','admin','organizer')
  )
);

drop policy if exists room_members_insert_self on public.room_members;
create policy room_members_insert_self
on public.room_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.chat_rooms r
    join public.event_participants ep on ep.event_id = r.event_id
    where r.id = room_members.room_id and ep.user_id = auth.uid()
  )
);

drop policy if exists room_members_delete_self_or_host on public.room_members;
create policy room_members_delete_self_or_host
on public.room_members
for delete
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.chat_rooms r
    join public.profiles p on p.id = auth.uid()
    where r.id = room_members.room_id and lower(coalesce(p.role,'')) in ('host','admin','organizer')
  )
);