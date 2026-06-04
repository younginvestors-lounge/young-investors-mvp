-- ============================================================================
-- Young Investors — Supabase schema for the public tester build (20–101 chefs)
-- ----------------------------------------------------------------------------
-- Paste this into the Supabase SQL editor and run it ONCE. It is idempotent, so
-- re-running is safe. It creates the tables, row-level security, the chef-number
-- sequence, and the profile-pictures storage bucket.
--
-- Chef numbering: seats 0 and 1 are RESERVED for the AI characters Gordon (0) and
-- Sicilia (1) — they have no rows here. Real testers are numbered from 2 upward by
-- the `chef_number_seq` sequence, assigned race-safely on insert. No signup cap is
-- enforced, so well over 30 (target capacity ~101) chefs can play.
--
-- MOCK_MVP_PAPER_TRADING_ONLY — no real money, brokers, banks, FICA, or payments.
-- Never expose the service_role key in the frontend. The app uses the anon key only.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ── Chef-number sequence (testers start at 2; 0 = Gordon, 1 = Sicilia) ───────
create sequence if not exists public.chef_number_seq start with 2 minvalue 2;
grant usage, select on sequence public.chef_number_seq to anon, authenticated;

-- ============================================================================
-- 1. profiles
-- ============================================================================
create table if not exists public.profiles (
  id                        uuid primary key references auth.users(id) on delete cascade,
  chef_alias                text,
  age                       integer,
  intent                    text,
  profile_icon              text,
  profile_picture_url       text,
  member_number             integer unique,
  mode                      text default 'full_simulation',
  rank                      text default 'Commis',
  academy_score             integer default 0,
  jse_market_score          integer default 0,
  risk_return_score         integer default 0,
  kitchen_score             integer default 0,
  personal_prediction_score integer default 0,
  kitchen_prediction_score  integer default 0,
  credential_status         text default 'not_started',
  attempts_used             integer default 0,
  current_kitchen           text default 'Rhodes Alpha Kitchen',
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

-- Assign the next chef number on insert. Forcing it (rather than trusting the
-- client) means a tester can never pick their own seat or collide with 0/1.
create or replace function public.assign_chef_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.member_number := nextval('public.chef_number_seq');
  return new;
end;
$$;

drop trigger if exists trg_assign_chef_number on public.profiles;
create trigger trg_assign_chef_number
  before insert on public.profiles
  for each row execute function public.assign_chef_number();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ============================================================================
-- 2. academy_attempts
-- ============================================================================
create table if not exists public.academy_attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  attempt_number integer not null,
  score          integer not null,
  best_score     integer not null,
  status         text,
  created_at     timestamptz default now()
);

alter table public.academy_attempts enable row level security;

drop policy if exists "attempts_select_own" on public.academy_attempts;
create policy "attempts_select_own" on public.academy_attempts
  for select using (auth.uid() = user_id);

drop policy if exists "attempts_insert_own" on public.academy_attempts;
create policy "attempts_insert_own" on public.academy_attempts
  for insert with check (auth.uid() = user_id);

-- ============================================================================
-- 3. tester_feedback
-- ============================================================================
create table if not exists public.tester_feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  screen     text,
  rating     integer,
  text       text,
  created_at timestamptz default now()
);

alter table public.tester_feedback enable row level security;

-- Any signed-in tester may leave feedback (about themselves or anonymously).
drop policy if exists "feedback_insert" on public.tester_feedback;
create policy "feedback_insert" on public.tester_feedback
  for insert with check (auth.uid() = user_id or user_id is null);

-- ============================================================================
-- 4. kitchen_votes
-- ============================================================================
create table if not exists public.kitchen_votes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade,
  kitchen_name     text,
  proposal_ticker  text,
  vote             text,
  seasoning_reason text,
  created_at       timestamptz default now()
);

alter table public.kitchen_votes enable row level security;

drop policy if exists "votes_select_own" on public.kitchen_votes;
create policy "votes_select_own" on public.kitchen_votes
  for select using (auth.uid() = user_id);

drop policy if exists "votes_insert_own" on public.kitchen_votes;
create policy "votes_insert_own" on public.kitchen_votes
  for insert with check (auth.uid() = user_id);

-- ============================================================================
-- 5. prediction_logs
-- ============================================================================
create table if not exists public.prediction_logs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade,
  ticker              text,
  personal_prediction text,
  kitchen_prediction  text,
  result              text default 'pending',
  created_at          timestamptz default now()
);

alter table public.prediction_logs enable row level security;

drop policy if exists "predictions_select_own" on public.prediction_logs;
create policy "predictions_select_own" on public.prediction_logs
  for select using (auth.uid() = user_id);

drop policy if exists "predictions_insert_own" on public.prediction_logs;
create policy "predictions_insert_own" on public.prediction_logs
  for insert with check (auth.uid() = user_id);

-- ============================================================================
-- 6. Storage — profile-pictures bucket
-- ----------------------------------------------------------------------------
-- Public read is acceptable for this demo (avatars are not sensitive). Privacy
-- tradeoff: anyone with the URL can view the image. For production, switch to a
-- private bucket + signed URLs. Each tester may only write inside a folder named
-- after their own user id (e.g. <uid>/avatar-123.jpg).
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('profile-pictures', 'profile-pictures', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'profile-pictures');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-pictures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-pictures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-pictures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- 7. Kitchens, memberships, referrals  (form a Kitchen — bottom-up communities)
-- ----------------------------------------------------------------------------
-- A Kitchen is a small peer syndicate. Two chefs is enough to start one. Reads that
-- need membership-awareness go through SECURITY DEFINER functions to avoid the classic
-- Supabase RLS recursion (a kitchen_members policy that itself queries kitchen_members).
-- The functions re-check auth.uid() internally, so this is secure, not a weakening.
-- ============================================================================
create table if not exists public.kitchens (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  governance  text not null default 'mutual',   -- 'mutual' (slow cook) | 'hedge' (high heat)
  join_code   text unique not null,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);

create table if not exists public.kitchen_members (
  id          uuid primary key default gen_random_uuid(),
  kitchen_id  uuid references public.kitchens(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  role        text not null default 'chef',      -- 'founder' | 'chef'
  joined_at   timestamptz default now(),
  unique (kitchen_id, user_id)
);

create table if not exists public.referrals (
  id             uuid primary key default gen_random_uuid(),
  referrer_code  text,
  referred_user  uuid references auth.users(id) on delete cascade,
  created_at     timestamptz default now(),
  unique (referred_user)
);

alter table public.kitchens enable row level security;
alter table public.kitchen_members enable row level security;
alter table public.referrals enable row level security;

-- Direct RLS is intentionally STRICT. Membership-aware reads use the RPCs below.
drop policy if exists "km_select_own" on public.kitchen_members;
create policy "km_select_own" on public.kitchen_members
  for select using (user_id = auth.uid());

drop policy if exists "km_delete_own" on public.kitchen_members;
create policy "km_delete_own" on public.kitchen_members
  for delete using (user_id = auth.uid());

-- A kitchen is visible only to its members (references kitchen_members, whose own
-- policy does NOT reference kitchens → no recursion).
drop policy if exists "kitchens_select_member" on public.kitchens;
create policy "kitchens_select_member" on public.kitchens
  for select using (
    exists (select 1 from public.kitchen_members m
            where m.kitchen_id = kitchens.id and m.user_id = auth.uid())
  );

drop policy if exists "ref_insert_self" on public.referrals;
create policy "ref_insert_self" on public.referrals
  for insert with check (referred_user = auth.uid());
drop policy if exists "ref_select_self" on public.referrals;
create policy "ref_select_self" on public.referrals
  for select using (referred_user = auth.uid());

-- ── RPCs (SECURITY DEFINER): the sanctioned, recursion-free access path ──

create or replace function public.create_kitchen(p_name text, p_governance text default 'mutual')
returns public.kitchens
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_kitchen public.kitchens;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.kitchens where join_code = v_code);
  end loop;

  insert into public.kitchens (name, governance, join_code, created_by)
  values (coalesce(nullif(trim(p_name), ''), 'New Kitchen'),
          case when p_governance in ('mutual','hedge') then p_governance else 'mutual' end,
          v_code, v_uid)
  returning * into v_kitchen;

  insert into public.kitchen_members (kitchen_id, user_id, role)
  values (v_kitchen.id, v_uid, 'founder');

  update public.profiles set current_kitchen = v_kitchen.name, updated_at = now() where id = v_uid;
  return v_kitchen;
end;
$$;

create or replace function public.join_kitchen_by_code(p_code text)
returns public.kitchens
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_kitchen public.kitchens;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select * into v_kitchen from public.kitchens where join_code = upper(trim(p_code));
  if v_kitchen.id is null then raise exception 'No Kitchen with that code'; end if;

  insert into public.kitchen_members (kitchen_id, user_id, role)
  values (v_kitchen.id, v_uid, 'chef')
  on conflict (kitchen_id, user_id) do nothing;

  update public.profiles set current_kitchen = v_kitchen.name, updated_at = now() where id = v_uid;
  return v_kitchen;
end;
$$;

create or replace function public.my_kitchen()
returns table (
  kitchen_id uuid, name text, governance text, join_code text,
  member_user uuid, member_alias text, member_icon text, member_number integer, member_role text
)
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_kid uuid;
begin
  if v_uid is null then return; end if;
  select kitchen_id into v_kid from public.kitchen_members where user_id = v_uid order by joined_at limit 1;
  if v_kid is null then return; end if;

  return query
    select k.id, k.name, k.governance, k.join_code,
           p.id, p.chef_alias, p.profile_icon, p.member_number, m.role
    from public.kitchens k
    join public.kitchen_members m on m.kitchen_id = k.id
    join public.profiles p on p.id = m.user_id
    where k.id = v_kid
    order by m.joined_at;
end;
$$;

grant execute on function public.create_kitchen(text, text) to authenticated;
grant execute on function public.join_kitchen_by_code(text) to authenticated;
grant execute on function public.my_kitchen() to authenticated;

-- Each member's LATEST vote on a ticker, within the caller's Kitchen. SECURITY
-- DEFINER so members can see each other's votes for the shared proposal without
-- loosening kitchen_votes' own-row RLS.
create or replace function public.kitchen_votes_for(p_ticker text)
returns table (member_user uuid, vote text)
language plpgsql security definer set search_path = public
as $$
declare v_uid uuid := auth.uid(); v_kid uuid;
begin
  if v_uid is null then return; end if;
  select kitchen_id into v_kid from public.kitchen_members where user_id = v_uid order by joined_at limit 1;
  if v_kid is null then return; end if;
  return query
    select distinct on (kv.user_id) kv.user_id, kv.vote
    from public.kitchen_votes kv
    join public.kitchen_members m on m.user_id = kv.user_id and m.kitchen_id = v_kid
    where kv.proposal_ticker = p_ticker
    order by kv.user_id, kv.created_at desc;
end;
$$;
grant execute on function public.kitchen_votes_for(text) to authenticated;

-- ============================================================================
-- Done. Reminder: testers are numbered from 2. Gordon (0) and Sicilia (1) are
-- reserved AI seats represented in the frontend, not stored here.
-- ============================================================================
