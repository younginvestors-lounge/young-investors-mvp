-- ============================================================================
-- Young Investors — Supabase schema for the public tester build (20–101 chefs)
-- ----------------------------------------------------------------------------
-- Paste this into the Supabase SQL editor and run it ONCE. It is idempotent, so
-- re-running is safe. It creates the tables, row-level security, the chef-number
-- sequence, and the profile-pictures storage bucket.
--
-- Chef numbering: seats 001 and 002 are RESERVED for the AI characters Gordon and
-- Sicilia — they have no rows here. Real testers are numbered from 003 upward by
-- the `chef_number_seq` sequence, assigned race-safely on insert. No signup cap is
-- enforced, so well over 30 (target capacity ~101) chefs can play.
--
-- MOCK_MVP_PAPER_TRADING_ONLY — no real money, brokers, banks, FICA, or payments.
-- Never expose the service_role key in the frontend. The app uses the anon key only.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ── Chef-number sequence (testers start at 003; 001 = Gordon, 002 = Sicilia) ──
create sequence if not exists public.chef_number_seq start with 3 minvalue 3;
grant usage, select on sequence public.chef_number_seq to anon, authenticated;

-- ============================================================================
-- 1. profiles
-- ============================================================================
create table if not exists public.profiles (
  id                        uuid primary key references auth.users(id) on delete cascade,
  email                     text,
  display_name              text,
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
  onboarding_completed      boolean default false,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

-- Existing projects can re-run this file after auth recovery.
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists onboarding_completed boolean default false;
update public.profiles set onboarding_completed = false where onboarding_completed is null;

-- Chef alias is a public display name, not a unique login identifier.
drop index if exists public.profiles_chef_alias_unique;

-- Existing projects that previously started testers at 002 are migrated forward
-- so 001/002 remain reserved for Gordon/Sicilia.
do $$
declare
  profile_to_move record;
  next_number integer;
begin
  for profile_to_move in
    select id
    from public.profiles
    where member_number is not null and member_number < 3
    order by member_number
  loop
    select greatest(coalesce(max(member_number), 2) + 1, 3)
      into next_number
      from public.profiles;

    update public.profiles
      set member_number = next_number,
          updated_at = now()
      where id = profile_to_move.id;
  end loop;

  perform setval(
    'public.chef_number_seq',
    greatest((select coalesce(max(member_number), 2) from public.profiles), 2),
    true
  );
end
$$;

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

-- ============================================================================
-- FIRST 100 BETA: Reassign member numbers by creation order
-- ----------------------------------------------------------------------------
-- Run this block ONCE after your first batch of testers have signed up.
-- It assigns permanent numbers (003, 004, 005...) in the order each chef
-- created their account. Gordon = 001, Sicilia = 002 remain reserved and have
-- no rows here. Idempotent: chefs who already have the correct number are
-- untouched (the WHERE clause checks for drift).
--
-- TO RUN: paste the block below into Supabase SQL Editor and execute.
-- ============================================================================
-- do $$
-- declare
--   r record;
--   new_num integer := 2;  -- start at 2 so first real chef gets 3
-- begin
--   for r in
--     select id
--     from public.profiles
--     order by created_at asc
--   loop
--     new_num := new_num + 1;
--     update public.profiles
--       set member_number = new_num,
--           updated_at    = now()
--       where id = r.id
--         and (member_number is distinct from new_num);
--   end loop;
--   -- Advance the sequence past the highest assigned number so new signups continue correctly.
--   perform setval(
--     'public.chef_number_seq',
--     greatest(new_num, (select coalesce(max(member_number), 2) from public.profiles)),
--     true
--   );
-- end
-- $$;
-- ============================================================================

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
  select km.kitchen_id into v_kid from public.kitchen_members km where km.user_id = v_uid order by km.joined_at limit 1;
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
-- 8. Kitchen proposals — shared recipe proposals, visible to all Kitchen members
-- ----------------------------------------------------------------------------
-- A proposal is tied to a kitchen_id. All members of that kitchen can read it.
-- SECURITY DEFINER functions avoid direct RLS join-recursion risk.
-- MOCK_MVP_PAPER_TRADING_ONLY — no live execution, broker, or real money.
-- ============================================================================
create table if not exists public.kitchen_proposals (
  id           uuid primary key default gen_random_uuid(),
  kitchen_id   uuid not null references public.kitchens(id) on delete cascade,
  proposer_id  uuid not null references auth.users(id) on delete cascade,
  ticker       text not null,
  asset_name   text,
  side         text not null default 'BUY',   -- 'BUY' | 'SELL'
  units        integer,
  thesis       text,
  seasoning    text not null,                  -- mandatory reason (the seasoning)
  status       text not null default 'voting', -- 'voting' | 'passed' | 'rejected' | 'withdrawn'
  created_at   timestamptz default now()
);

alter table public.kitchen_proposals enable row level security;

-- Members can read their kitchen's proposals (via SECURITY DEFINER function below).
-- No direct RLS SELECT needed — the RPC enforces membership check.
-- Direct INSERT also goes through the RPC to verify membership before writing.

-- Cast a vote and evaluate the active recipe using the 60% Rule.
-- Quorum is not an execution gate in this MVP: approval is based on the
-- percentage of decisive votes (FOR/AGAINST) crossing 60%.
-- NOTE: must be defined AFTER kitchen_proposals so %rowtype resolves.
create or replace function public.cast_kitchen_vote(
  p_proposal_id uuid,
  p_vote text,
  p_seasoning_reason text default null
)
returns table (
  proposal_id uuid,
  yes_votes integer,
  no_votes integer,
  decisive_votes integer,
  yes_ratio numeric,
  threshold_met boolean,
  proposal_status text
)
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_kid uuid;
  v_proposal public.kitchen_proposals%rowtype;
  v_vote text := upper(trim(coalesce(p_vote, '')));
  v_yes integer := 0;
  v_no integer := 0;
  v_total integer := 0;
  v_members integer := 0;
  v_ratio numeric := 0;
  v_status text;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if v_vote not in ('FOR', 'AGAINST', 'ABSTAIN') then raise exception 'Vote must be FOR, AGAINST, or ABSTAIN.'; end if;

  select km.kitchen_id into v_kid
  from public.kitchen_members km
  where km.user_id = v_uid
  order by km.joined_at limit 1;

  if v_kid is null then raise exception 'You must be in a Kitchen to vote.'; end if;

  select * into v_proposal
  from public.kitchen_proposals p
  where p.id = p_proposal_id and p.kitchen_id = v_kid
  for update;

  if not found then raise exception 'Recipe not found for this Kitchen.'; end if;
  if v_proposal.status <> 'voting' then raise exception 'This recipe is no longer open for voting.'; end if;

  insert into public.kitchen_votes (user_id, kitchen_name, proposal_ticker, vote, seasoning_reason)
  select v_uid, k.name, v_proposal.ticker, v_vote, p_seasoning_reason
  from public.kitchens k
  where k.id = v_kid;

  select
    count(*) filter (where latest.vote = 'FOR')::integer,
    count(*) filter (where latest.vote = 'AGAINST')::integer
  into v_yes, v_no
  from (
    select distinct on (kv.user_id) kv.user_id, kv.vote
    from public.kitchen_votes kv
    join public.kitchen_members km on km.user_id = kv.user_id and km.kitchen_id = v_kid
    where kv.proposal_ticker = v_proposal.ticker
    order by kv.user_id, kv.created_at desc
  ) latest;

  v_total := v_yes + v_no;
  select count(*)::integer into v_members from public.kitchen_members where kitchen_id = v_kid;
  if v_members > 0 then
    v_ratio := round((v_yes::numeric / v_members::numeric), 4);
  end if;

  v_status := case
    when v_members > 0 and v_ratio >= 0.60 then 'passed'
    when v_members > 0 and v_total >= v_members and v_ratio < 0.60 then 'rejected'
    else 'voting'
  end;

  update public.kitchen_proposals
  set status = v_status
  where id = v_proposal.id;

  return query select v_proposal.id, v_yes, v_no, v_total, v_ratio, (v_ratio >= 0.60), v_status;
end;
$$;
grant execute on function public.cast_kitchen_vote(uuid, text, text) to authenticated;

-- Submit a proposal (verifies membership before inserting).
create or replace function public.submit_proposal(
  p_ticker    text,
  p_asset_name text,
  p_side      text,
  p_units     integer,
  p_thesis    text,
  p_seasoning text
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_kid uuid;
  v_id  uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if length(trim(coalesce(p_seasoning, ''))) < 10 then
    raise exception 'Season your recipe — explain the reason in at least 10 characters.';
  end if;

  select km.kitchen_id into v_kid
  from public.kitchen_members km
  where km.user_id = v_uid
  order by km.joined_at limit 1;

  if v_kid is null then raise exception 'You must be in a Kitchen to propose a recipe.'; end if;

  insert into public.kitchen_proposals
    (kitchen_id, proposer_id, ticker, asset_name, side, units, thesis, seasoning, status)
  values
    (v_kid, v_uid,
     upper(trim(p_ticker)),
     p_asset_name,
     case when upper(p_side) = 'SELL' then 'SELL' else 'BUY' end,
     p_units,
     p_thesis,
     p_seasoning,
     'voting')
  returning id into v_id;

  return v_id;
end;
$$;

-- Fetch the most recent open proposal for the caller's Kitchen.
create or replace function public.active_proposal()
returns table (
  id uuid, kitchen_id uuid, proposer_id uuid, ticker text, asset_name text,
  side text, units integer, thesis text, seasoning text, status text, created_at timestamptz
)
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_kid uuid;
begin
  if v_uid is null then return; end if;

  select km.kitchen_id into v_kid
  from public.kitchen_members km
  where km.user_id = v_uid
  order by km.joined_at limit 1;

  if v_kid is null then return; end if;

  return query
    select p.id, p.kitchen_id, p.proposer_id, p.ticker, p.asset_name,
           p.side, p.units, p.thesis, p.seasoning, p.status, p.created_at
    from public.kitchen_proposals p
    where p.kitchen_id = v_kid and p.status = 'voting'
    order by p.created_at desc
    limit 1;
end;
$$;

grant execute on function public.submit_proposal(text, text, text, integer, text, text) to authenticated;
grant execute on function public.active_proposal() to authenticated;

-- ============================================================================
-- 9. Kitchen chat — per-kitchen message thread
-- ----------------------------------------------------------------------------
-- Polling-friendly (no realtime subscription required). Messages are keyed to
-- kitchen_id. All members of a kitchen can read and insert messages.
-- ============================================================================
create table if not exists public.kitchen_messages (
  id          uuid primary key default gen_random_uuid(),
  kitchen_id  uuid not null references public.kitchens(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  body        text not null check (length(trim(body)) between 1 and 1000),
  created_at  timestamptz default now()
);

alter table public.kitchen_messages enable row level security;

-- SECURITY DEFINER to avoid join-recursion with kitchen_members RLS.
create or replace function public.send_message(p_body text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_kid uuid;
  v_id  uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if length(trim(coalesce(p_body, ''))) = 0 then raise exception 'Message cannot be empty.'; end if;
  if length(trim(p_body)) > 1000 then raise exception 'Message is too long (max 1000 chars).'; end if;

  select km.kitchen_id into v_kid
  from public.kitchen_members km
  where km.user_id = v_uid
  order by km.joined_at limit 1;

  if v_kid is null then raise exception 'You must be in a Kitchen to send a message.'; end if;

  insert into public.kitchen_messages (kitchen_id, user_id, body)
  values (v_kid, v_uid, trim(p_body))
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.kitchen_messages_page(p_before timestamptz default now(), p_limit integer default 40)
returns table (
  id uuid, user_id uuid, chef_alias text, profile_icon text, body text, created_at timestamptz
)
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_kid uuid;
begin
  if v_uid is null then return; end if;

  select km.kitchen_id into v_kid
  from public.kitchen_members km
  where km.user_id = v_uid
  order by km.joined_at limit 1;

  if v_kid is null then return; end if;

  return query
    select m.id, m.user_id,
           coalesce(p.chef_alias, 'Chef') as chef_alias,
           coalesce(p.profile_icon, 'chef-default') as profile_icon,
           m.body, m.created_at
    from public.kitchen_messages m
    left join public.profiles p on p.id = m.user_id
    where m.kitchen_id = v_kid and m.created_at < p_before
    order by m.created_at desc
    limit greatest(1, least(100, p_limit));
end;
$$;

grant execute on function public.send_message(text) to authenticated;
grant execute on function public.kitchen_messages_page(timestamptz, integer) to authenticated;

-- ============================================================================
-- 10. Notifications — in-app alerts keyed to a user
-- ============================================================================
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null,   -- 'proposal' | 'vote_result' | 'join_request' | 'achievement' | 'chat'
  title       text not null,
  body        text,
  deep_link   text,            -- e.g. '/kitchen' or '/academy'
  is_read     boolean not null default false,
  created_at  timestamptz default now()
);

alter table public.notifications enable row level security;

drop policy if exists "notifs_select_own" on public.notifications;
create policy "notifs_select_own" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifs_update_own" on public.notifications;
create policy "notifs_update_own" on public.notifications
  for update using (user_id = auth.uid());

-- Server-side trigger: notify all kitchen members when a new proposal is submitted.
create or replace function public.notify_kitchen_proposal()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_alias text;
  v_member record;
begin
  select coalesce(chef_alias, 'A chef') into v_alias
  from public.profiles where id = new.proposer_id;

  for v_member in
    select user_id from public.kitchen_members where kitchen_id = new.kitchen_id
      and user_id <> new.proposer_id
  loop
    insert into public.notifications (user_id, kind, title, body, deep_link)
    values (
      v_member.user_id,
      'proposal',
      'New recipe on the pass',
      v_alias || ' proposed ' || new.side || ' ' || new.ticker || ' — read the seasoning and vote.',
      '/kitchen'
    );
  end loop;
  return new;
end;
$$;

drop trigger if exists trg_notify_proposal on public.kitchen_proposals;
create trigger trg_notify_proposal
  after insert on public.kitchen_proposals
  for each row execute function public.notify_kitchen_proposal();

-- ============================================================================
-- 11. Gordon's Guide — lightweight diagnostic score + band per user
-- ============================================================================
create table if not exists public.gordon_guide (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  score        integer not null default 0 check (score between 0 and 100),
  band         text not null default 'Burn Risk',
  inputs       jsonb,   -- raw diagnostic answers
  computed_at  timestamptz default now(),
  unique (user_id)
);

alter table public.gordon_guide enable row level security;

drop policy if exists "guide_select_own" on public.gordon_guide;
create policy "guide_select_own" on public.gordon_guide
  for select using (user_id = auth.uid());

drop policy if exists "guide_upsert_own" on public.gordon_guide;
create policy "guide_upsert_own" on public.gordon_guide
  for insert with check (user_id = auth.uid());

drop policy if exists "guide_update_own" on public.gordon_guide;
create policy "guide_update_own" on public.gordon_guide
  for update using (user_id = auth.uid());

-- ============================================================================
-- Done. Reminder: testers are numbered from 003. Gordon (001) and Sicilia (002) are
-- reserved AI seats represented in the frontend, not stored here.
-- ============================================================================
