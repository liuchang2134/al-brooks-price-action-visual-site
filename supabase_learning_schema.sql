-- Al Brooks learning site schema for Supabase Dashboard SQL Editor.
-- Run this in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.learning_profiles (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,
  item_id text not null,
  status text not null default 'learning'
    check (status in ('not_started', 'learning', 'review', 'mastered', 'skipped')),
  confidence smallint not null default 0 check (confidence between 0 and 5),
  last_seen_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, item_type, item_id)
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,
  item_id text not null,
  title text not null,
  tags text[] not null default array[]::text[],
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, item_type, item_id)
);

create table if not exists public.mistake_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null default 'pattern',
  item_id text not null,
  title text not null,
  category text not null,
  reason text not null,
  correction text,
  source_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bar_by_bar_attempts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  scenario_id text not null,
  scenario_title text not null,
  step_index integer not null,
  question text not null,
  answer text not null,
  expected_answer text not null,
  is_correct boolean not null default false,
  explanation text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.review_journal (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  market_cycle text,
  context_notes text,
  signal_bar text,
  entry_trigger text,
  stop_logic text,
  target_logic text,
  no_trade_reason text,
  result_notes text,
  lesson text,
  body_md text,
  tags text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_progress_owner_idx on public.learning_progress(owner_id, updated_at desc);
create index if not exists bookmarks_owner_idx on public.bookmarks(owner_id, updated_at desc);
create index if not exists mistake_notes_owner_idx on public.mistake_notes(owner_id, updated_at desc);
create index if not exists bar_by_bar_owner_idx on public.bar_by_bar_attempts(owner_id, created_at desc);
create index if not exists review_journal_owner_idx on public.review_journal(owner_id, updated_at desc);

alter table public.learning_profiles enable row level security;
alter table public.learning_progress enable row level security;
alter table public.bookmarks enable row level security;
alter table public.mistake_notes enable row level security;
alter table public.bar_by_bar_attempts enable row level security;
alter table public.review_journal enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.learning_profiles to authenticated;
grant select, insert, update, delete on public.learning_progress to authenticated;
grant select, insert, update, delete on public.bookmarks to authenticated;
grant select, insert, update, delete on public.mistake_notes to authenticated;
grant select, insert, update, delete on public.bar_by_bar_attempts to authenticated;
grant select, insert, update, delete on public.review_journal to authenticated;

drop policy if exists "profile owner can read" on public.learning_profiles;
drop policy if exists "profile owner can insert" on public.learning_profiles;
drop policy if exists "profile owner can update" on public.learning_profiles;
drop policy if exists "profile owner can delete" on public.learning_profiles;

create policy "profile owner can read"
on public.learning_profiles for select to authenticated
using (owner_id = auth.uid());

create policy "profile owner can insert"
on public.learning_profiles for insert to authenticated
with check (owner_id = auth.uid());

create policy "profile owner can update"
on public.learning_profiles for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "profile owner can delete"
on public.learning_profiles for delete to authenticated
using (owner_id = auth.uid());

drop policy if exists "progress owner can read" on public.learning_progress;
drop policy if exists "progress owner can insert" on public.learning_progress;
drop policy if exists "progress owner can update" on public.learning_progress;
drop policy if exists "progress owner can delete" on public.learning_progress;

create policy "progress owner can read"
on public.learning_progress for select to authenticated
using (owner_id = auth.uid());

create policy "progress owner can insert"
on public.learning_progress for insert to authenticated
with check (owner_id = auth.uid());

create policy "progress owner can update"
on public.learning_progress for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "progress owner can delete"
on public.learning_progress for delete to authenticated
using (owner_id = auth.uid());

drop policy if exists "bookmarks owner can read" on public.bookmarks;
drop policy if exists "bookmarks owner can insert" on public.bookmarks;
drop policy if exists "bookmarks owner can update" on public.bookmarks;
drop policy if exists "bookmarks owner can delete" on public.bookmarks;

create policy "bookmarks owner can read"
on public.bookmarks for select to authenticated
using (owner_id = auth.uid());

create policy "bookmarks owner can insert"
on public.bookmarks for insert to authenticated
with check (owner_id = auth.uid());

create policy "bookmarks owner can update"
on public.bookmarks for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "bookmarks owner can delete"
on public.bookmarks for delete to authenticated
using (owner_id = auth.uid());

drop policy if exists "mistakes owner can read" on public.mistake_notes;
drop policy if exists "mistakes owner can insert" on public.mistake_notes;
drop policy if exists "mistakes owner can update" on public.mistake_notes;
drop policy if exists "mistakes owner can delete" on public.mistake_notes;

create policy "mistakes owner can read"
on public.mistake_notes for select to authenticated
using (owner_id = auth.uid());

create policy "mistakes owner can insert"
on public.mistake_notes for insert to authenticated
with check (owner_id = auth.uid());

create policy "mistakes owner can update"
on public.mistake_notes for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "mistakes owner can delete"
on public.mistake_notes for delete to authenticated
using (owner_id = auth.uid());

drop policy if exists "bar attempts owner can read" on public.bar_by_bar_attempts;
drop policy if exists "bar attempts owner can insert" on public.bar_by_bar_attempts;
drop policy if exists "bar attempts owner can delete" on public.bar_by_bar_attempts;

create policy "bar attempts owner can read"
on public.bar_by_bar_attempts for select to authenticated
using (owner_id = auth.uid());

create policy "bar attempts owner can insert"
on public.bar_by_bar_attempts for insert to authenticated
with check (owner_id = auth.uid());

create policy "bar attempts owner can delete"
on public.bar_by_bar_attempts for delete to authenticated
using (owner_id = auth.uid());

drop policy if exists "journal owner can read" on public.review_journal;
drop policy if exists "journal owner can insert" on public.review_journal;
drop policy if exists "journal owner can update" on public.review_journal;
drop policy if exists "journal owner can delete" on public.review_journal;

create policy "journal owner can read"
on public.review_journal for select to authenticated
using (owner_id = auth.uid());

create policy "journal owner can insert"
on public.review_journal for insert to authenticated
with check (owner_id = auth.uid());

create policy "journal owner can update"
on public.review_journal for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "journal owner can delete"
on public.review_journal for delete to authenticated
using (owner_id = auth.uid());

drop trigger if exists set_learning_profiles_updated_at on public.learning_profiles;
drop trigger if exists set_learning_progress_updated_at on public.learning_progress;
drop trigger if exists set_bookmarks_updated_at on public.bookmarks;
drop trigger if exists set_mistake_notes_updated_at on public.mistake_notes;
drop trigger if exists set_review_journal_updated_at on public.review_journal;

create trigger set_learning_profiles_updated_at
before update on public.learning_profiles
for each row execute function public.set_updated_at();

create trigger set_learning_progress_updated_at
before update on public.learning_progress
for each row execute function public.set_updated_at();

create trigger set_bookmarks_updated_at
before update on public.bookmarks
for each row execute function public.set_updated_at();

create trigger set_mistake_notes_updated_at
before update on public.mistake_notes
for each row execute function public.set_updated_at();

create trigger set_review_journal_updated_at
before update on public.review_journal
for each row execute function public.set_updated_at();
