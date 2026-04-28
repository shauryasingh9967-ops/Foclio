-- ================================================================
-- FOCLIO — Supabase Schema v2
-- Paste into: Supabase Dashboard → SQL Editor → Run
-- ================================================================

create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  ) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── SAVED VIDEOS ──────────────────────────────────────────────────
create table if not exists public.saved_videos (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  video_id      text not null,
  title         text,
  thumbnail     text,
  channel_name  text,
  duration_sec  int,
  saved_at      timestamptz default now(),
  constraint saved_videos_unique unique (user_id, video_id)
);

-- ── WATCH PROGRESS ────────────────────────────────────────────────
create table if not exists public.watch_progress (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  video_id        text not null,
  last_time       float default 0,
  last_watched_at timestamptz default now(),
  constraint watch_progress_unique unique (user_id, video_id)
);

-- ── NOTES ─────────────────────────────────────────────────────────
create table if not exists public.notes (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  video_id      text not null,
  timestamp     float not null default 0,
  content       text not null,
  is_important  boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists notes_updated_at on public.notes;
create trigger notes_updated_at
  before update on public.notes
  for each row execute procedure update_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.saved_videos   enable row level security;
alter table public.watch_progress enable row level security;
alter table public.notes          enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "own profile"        on public.profiles;
drop policy if exists "own saved_videos"   on public.saved_videos;
drop policy if exists "own watch_progress" on public.watch_progress;
drop policy if exists "own notes"          on public.notes;

create policy "own profile"        on public.profiles       for all using (auth.uid() = id);
create policy "own saved_videos"   on public.saved_videos   for all using (auth.uid() = user_id);
create policy "own watch_progress" on public.watch_progress for all using (auth.uid() = user_id);
create policy "own notes"          on public.notes          for all using (auth.uid() = user_id);

-- ── INDEXES ───────────────────────────────────────────────────────
create index if not exists idx_saved_videos_user  on public.saved_videos   (user_id, saved_at desc);
create index if not exists idx_progress_user      on public.watch_progress (user_id, last_watched_at desc);
create index if not exists idx_notes_user_video   on public.notes          (user_id, video_id, timestamp);
