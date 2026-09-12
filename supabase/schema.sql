-- Scout TT: store per user, one row per storage key (rivals, matches, ...).
-- Run this in the Supabase SQL editor.

create table if not exists public.user_store (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,
  value jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_store enable row level security;

drop policy if exists "Users manage their store" on public.user_store;

create policy "Users manage their store"
  on public.user_store
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
