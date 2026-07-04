-- ══════════════════════════════════════════════════════════════════════════════
-- Young Investors — Supabase schema                       (idempotent, run once)
-- ──────────────────────────────────────────────────────────────────────────────
-- Organised after the YI star architecture — the hexagram that governs the
-- product. Gordon's upward triangle (teal · solid) holds craft and progress:
-- Academy, Kitchen, Vault. Sicilia's downward triangle (coral · dashed) holds
-- meaning and community: Times, Lounge, The Table. Where the two triangles
-- intersect, six bonds govern the house: The Guide, Seasoning, The Creed, Ranks,
-- Beat Gordon, and the 60% Rule. The Chef stands at the centre; every table
-- foreign-keys back to auth.users (= the chef).
--
--                        ╔═══════════╗
--                        ║  Academy  ║  ← Gordon
--                        ╚═══════════╝
--           ┌──────────────────────────────────────┐
--  Times ───┤  ◈ Seasoning         ◈ The Guide     ├─── The Table
--  (Sicilia)│                                      │       (Sicilia)
--           │  ◈ The Creed  [CHEF]  ◈ Ranks        │
--           │                                      │
--  Lounge ──┤  ◈ 60% Rule     ◈ Beat Gordon        ├─── Vault
--  (Sicilia)│                                      │       (Gordon)
--           └──────────────────────────────────────┘
--                        ╔═══════════╗
--                        ║  Kitchen  ║  ← Gordon
--                        ╚═══════════╝
--
-- MOCK_MVP_PAPER_TRADING_ONLY — no real money, brokers, banks, FICA, payments.
-- Never expose the service_role key in the frontend. Anon key only.
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ── Chef-number sequence (testers start at 003; 001 = Gordon, 002 = Sicilia) ──
create sequence if not exists public.chef_number_seq start with 3 minvalue 3;
grant usage, select on sequence public.chef_number_seq to anon, authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- ⬟  THE CHEF — centre of the star; every table foreign-keys back here
-- ══════════════════════════════════════════════════════════════════════════════
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
  rank                      text default 'Commis',           -- ◈ Ranks bond
  academy_score             integer default 0,
  jse_market_score          integer default 0,               -- ◈ Beat Gordon bond
  risk_return_score         integer default 0,
  kitchen_score             integer default 0,
  personal_prediction_score integer default 0,               -- ◈ Beat Gordon bond
  kitchen_prediction_score  integer default 0,               -- ◈ Beat Gordon bond
  credential_status         text default 'not_started',
  attempts_used             integer default 0,
  current_kitchen           text default 'Rhodes Alpha Kitchen',
  onboarding_completed      boolean default false,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

-- Idempotent column additions for projects that ran an earlier schema version.
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists onboarding_completed boolean default false;
update public.profiles set onboarding_completed = false where onboarding_completed is null;

-- Chef alias is a display name, not a unique login identifier.
drop index if exists public.profiles_chef_alias_unique;

-- Migrate any member_number < 3 so 001/002 stay reserved for Gordon/Sicilia.
do $$
declare
  profile_to_move record;
  next_number integer;
begin
  for profile_to_move in
    select id from public.profiles
    where member_number is not null and member_number < 3
    order by member_number
  loop
    select greatest(coalesce(max(member_number), 2) + 1, 3)
      into next_number from public.profiles;
    update public.profiles
      set member_number = next_number, updated_at = now()
      where id = profile_to_move.id;
  end loop;
  perform setval(
    'public.chef_number_seq',
    greatest((select coalesce(max(member_number), 2) from public.profiles), 2),
    true
  );
end
$$;

-- Assign the next seat number on insert — never trust the client.
create or replace function public.assign_chef_number()
returns trigger language plpgsql security definer set search_path = public
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

-- ══════════════════════════════════════════════════════════════════════════════
-- ◭  GORDON'S TRIANGLE — craft · the how
--    Gordon's three vertices: Academy (learn), Kitchen (decide), Vault (own).
--    All three flow upward toward mastery and clearance.
-- ══════════════════════════════════════════════════════════════════════════════

-- ── ACADEMY vertex ── learn before you earn ──────────────────────────────────
-- Clearance layer: chefs must pass Academy before accessing Kitchen activity.
create table if not exists public.academy_attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  attempt_number integer not null,
  score          integer not null,
  best_score     integer not null,
  status         text,             -- 'not_started' | 'in_progress' | 'cleared'
  created_at     timestamptz default now()
);

alter table public.academy_attempts enable row level security;

drop policy if exists "attempts_select_own" on public.academy_attempts;
create policy "attempts_select_own" on public.academy_attempts
  for select using (auth.uid() = user_id);

drop policy if exists "attempts_insert_own" on public.academy_attempts;
create policy "attempts_insert_own" on public.academy_attempts
  for insert with check (auth.uid() = user_id);

-- ── KITCHEN vertex ── propose · vote · decide ────────────────────────────────
-- A Kitchen is a small peer syndicate (two chefs minimum). The 60% Rule governs
-- every recipe proposal. SECURITY DEFINER RPCs avoid the classic Supabase RLS
-- recursion (a kitchen_members policy that itself queries kitchen_members).
--
-- Tables are declared here before any RPC that references them (dependency order).
create table if not exists public.kitchens (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  governance  text not null default 'mutual',  -- 'mutual' (slow cook) | 'hedge' (high heat)
  join_code   text unique not null,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);

create table if not exists public.kitchen_members (
  id          uuid primary key default gen_random_uuid(),
  kitchen_id  uuid references public.kitchens(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  role        text not null default 'chef',    -- 'founder' | 'chef'
  joined_at   timestamptz default now(),
  unique (kitchen_id, user_id)
);

-- Referrals bridge Kitchen and The Table: a chef invites a peer into the house.
create table if not exists public.referrals (
  id             uuid primary key default gen_random_uuid(),
  referrer_code  text,
  referred_user  uuid references auth.users(id) on delete cascade,
  created_at     timestamptz default now(),
  unique (referred_user)
);

-- Every chef's FOR / AGAINST / ABSTAIN on a ticker — the raw vote log.
create table if not exists public.kitchen_votes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade,
  kitchen_name     text,
  proposal_ticker  text,
  vote             text,           -- 'FOR' | 'AGAINST' | 'ABSTAIN'
  seasoning_reason text,           -- ◈ Seasoning bond: the reason behind the vote
  created_at       timestamptz default now()
);

-- Chef's Say (Hedge Kitchens only) snapshotted at cast-time — see chef_say()
-- below. Mutual Kitchens never set this; it stays at the default of 1, which is
-- exactly headcount math, so every existing (Mutual) vote row is unaffected.
alter table public.kitchen_votes add column if not exists chef_say numeric not null default 1;

-- The shared recipe proposal the Kitchen is currently voting on.
-- Declared before cast_kitchen_vote so %rowtype resolves at compile time.
create table if not exists public.kitchen_proposals (
  id           uuid primary key default gen_random_uuid(),
  kitchen_id   uuid not null references public.kitchens(id) on delete cascade,
  proposer_id  uuid not null references auth.users(id) on delete cascade,
  ticker       text not null,
  asset_name   text,
  side         text not null default 'BUY',    -- 'BUY' | 'SELL'
  units        integer,
  thesis       text,
  seasoning    text not null,                   -- ◈ Seasoning bond: mandatory reason
  status       text not null default 'voting',  -- 'voting' | 'passed' | 'rejected' | 'withdrawn'
  created_at   timestamptz default now()
);

-- Idempotent column additions: price/notional captured at propose-time so a
-- passed recipe can be turned into a paper accounting receipt (see KITCHEN
-- EXECUTIONS bond below). Nullable and additive — existing rows are unaffected.
alter table public.kitchen_proposals add column if not exists price numeric;
alter table public.kitchen_proposals add column if not exists notional numeric;

alter table public.kitchens enable row level security;
alter table public.kitchen_members enable row level security;
alter table public.referrals enable row level security;
alter table public.kitchen_votes enable row level security;
alter table public.kitchen_proposals enable row level security;

-- Direct RLS is strict. All membership-aware reads go through SECURITY DEFINER RPCs.
drop policy if exists "km_select_own" on public.kitchen_members;
create policy "km_select_own" on public.kitchen_members
  for select using (user_id = auth.uid());

drop policy if exists "km_delete_own" on public.kitchen_members;
create policy "km_delete_own" on public.kitchen_members
  for delete using (user_id = auth.uid());

-- A kitchen is visible only to its members (references kitchen_members whose
-- own policy does NOT reference kitchens — no recursion).
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

drop policy if exists "votes_select_own" on public.kitchen_votes;
create policy "votes_select_own" on public.kitchen_votes
  for select using (auth.uid() = user_id);

drop policy if exists "votes_insert_own" on public.kitchen_votes;
create policy "votes_insert_own" on public.kitchen_votes
  for insert with check (auth.uid() = user_id);

-- kitchen_proposals: all reads and writes go through SECURITY DEFINER RPCs below.

-- Kitchen RPCs — the sanctioned, recursion-free access path.

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
  update public.profiles set current_kitchen = v_kitchen.name, updated_at = now()
  where id = v_uid;
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
  update public.profiles set current_kitchen = v_kitchen.name, updated_at = now()
  where id = v_uid;
  return v_kitchen;
end;
$$;

drop function if exists public.my_kitchen();

create or replace function public.my_kitchen()
returns table (
  kitchen_id uuid, name text, governance text, join_code text,
  member_user uuid, member_alias text, member_icon text, member_number integer, member_role text,
  member_rank text, member_kitchen_score integer
)
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_kid uuid;
begin
  if v_uid is null then return; end if;
  select km.kitchen_id into v_kid
  from public.kitchen_members km where km.user_id = v_uid order by km.joined_at limit 1;
  if v_kid is null then return; end if;
  return query
    select k.id, k.name, k.governance, k.join_code,
           p.id, p.chef_alias, p.profile_icon, p.member_number, m.role,
           p.rank, p.kitchen_score
    from public.kitchens k
    join public.kitchen_members m on m.kitchen_id = k.id
    join public.profiles p on p.id = m.user_id
    where k.id = v_kid
    order by m.joined_at;
end;
$$;

-- Chef's Say — a Hedge Kitchen's vote weight. Rank (Academy mastery) leads;
-- kitchen_score (participation + seasoning discipline) adds at most +0.25.
-- Mutual Kitchens never call this. Mirrors frontend/lib/domain.ts's
-- sayMultiplier/computeChefSay exactly — keep both in sync if either changes.
create or replace function public.chef_say(p_rank text, p_kitchen_score integer)
returns numeric
language sql immutable
as $$
  select (case p_rank
    when 'Commis' then 1.00
    when 'Demi Chef' then 1.15
    when 'Chef de Partie' then 1.30
    when 'Sous Chef' then 1.50
    when 'Master Chef' then 1.75
    else 1.00
  end) + (greatest(0, least(100, coalesce(p_kitchen_score, 0)))::numeric / 100) * 0.25;
$$;

-- Each member's latest vote (and Chef's Say) on a ticker within the caller's
-- Kitchen. SECURITY DEFINER so members can see each other's votes without
-- loosening kitchen_votes' own-row RLS.
drop function if exists public.kitchen_votes_for(text);

create or replace function public.kitchen_votes_for(p_ticker text)
returns table (member_user uuid, vote text, chef_say numeric)
language plpgsql security definer set search_path = public
as $$
declare v_uid uuid := auth.uid(); v_kid uuid;
begin
  if v_uid is null then return; end if;
  select kitchen_id into v_kid
  from public.kitchen_members where user_id = v_uid order by joined_at limit 1;
  if v_kid is null then return; end if;
  return query
    select distinct on (kv.user_id) kv.user_id, kv.vote, kv.chef_say
    from public.kitchen_votes kv
    join public.kitchen_members m on m.user_id = kv.user_id and m.kitchen_id = v_kid
    where kv.proposal_ticker = p_ticker
    order by kv.user_id, kv.created_at desc;
end;
$$;

-- ◈ 60% RULE BOND — cast a vote and evaluate the recipe against the threshold.
-- Mutual Kitchens: approval = ceil(60% × kitchen size) YES votes (headcount,
-- unchanged). Hedge Kitchens: approval = 60% of the table's total Chef's Say
-- (see chef_say() above) — the threshold itself never changes, only what "the
-- table" is measured in. Defined after kitchen_proposals so the %rowtype
-- reference compiles correctly.
drop function if exists public.cast_kitchen_vote(uuid, text, text);

create or replace function public.cast_kitchen_vote(
  p_proposal_id uuid,
  p_vote text,
  p_seasoning_reason text default null
)
returns table (
  proposal_id    uuid,
  yes_votes      integer,
  no_votes       integer,
  decisive_votes integer,
  yes_ratio      numeric,
  threshold_met  boolean,
  proposal_status text,
  yes_say        numeric,
  total_say      numeric
)
language plpgsql security definer set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_kid        uuid;
  v_governance text;
  v_rank       text;
  v_kscore     integer;
  v_say        numeric := 1;
  v_proposal   public.kitchen_proposals%rowtype;
  v_vote       text := upper(trim(coalesce(p_vote, '')));
  v_yes        integer := 0;
  v_no         integer := 0;
  v_total      integer := 0;
  v_members    integer := 0;
  v_ratio      numeric := 0;
  v_yes_say    numeric := 0;
  v_total_say  numeric := 0;
  v_status     text;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if v_vote not in ('FOR', 'AGAINST', 'ABSTAIN') then
    raise exception 'Vote must be FOR, AGAINST, or ABSTAIN.';
  end if;

  select km.kitchen_id into v_kid
  from public.kitchen_members km where km.user_id = v_uid order by km.joined_at limit 1;
  if v_kid is null then raise exception 'You must be in a Kitchen to vote.'; end if;

  select governance into v_governance from public.kitchens where id = v_kid;

  select * into v_proposal
  from public.kitchen_proposals p
  where p.id = p_proposal_id and p.kitchen_id = v_kid
  for update;
  if not found then raise exception 'Recipe not found for this Kitchen.'; end if;
  if v_proposal.status <> 'voting' then
    raise exception 'This recipe is no longer open for voting.';
  end if;

  if v_governance = 'hedge' then
    select rank, kitchen_score into v_rank, v_kscore from public.profiles where id = v_uid;
    v_say := public.chef_say(v_rank, v_kscore);
  end if;

  insert into public.kitchen_votes (user_id, kitchen_name, proposal_ticker, vote, seasoning_reason, chef_say)
  select v_uid, k.name, v_proposal.ticker, v_vote, p_seasoning_reason, v_say
  from public.kitchens k where k.id = v_kid;

  select
    count(*) filter (where latest.vote = 'FOR')::integer,
    count(*) filter (where latest.vote = 'AGAINST')::integer,
    coalesce(sum(latest.chef_say) filter (where latest.vote = 'FOR'), 0)
  into v_yes, v_no, v_yes_say
  from (
    select distinct on (kv.user_id) kv.user_id, kv.vote, kv.chef_say
    from public.kitchen_votes kv
    join public.kitchen_members km on km.user_id = kv.user_id and km.kitchen_id = v_kid
    where kv.proposal_ticker = v_proposal.ticker
    order by kv.user_id, kv.created_at desc
  ) latest;

  v_total := v_yes + v_no;
  select count(*)::integer into v_members from public.kitchen_members where kitchen_id = v_kid;

  if v_governance = 'hedge' then
    -- Denominator is every CURRENT member's live Say (not just those who've
    -- voted) — "60% of the table," exactly as Mutual measures 60% of headcount.
    select coalesce(sum(public.chef_say(p.rank, p.kitchen_score)), 0)
    into v_total_say
    from public.kitchen_members km
    join public.profiles p on p.id = km.user_id
    where km.kitchen_id = v_kid;
    if v_total_say > 0 then
      v_ratio := round((v_yes_say / v_total_say), 4);
    end if;
  else
    v_total_say := v_members;
    v_yes_say := v_yes;
    if v_members > 0 then
      v_ratio := round((v_yes::numeric / v_members::numeric), 4);
    end if;
  end if;

  v_status := case
    when v_members > 0 and v_ratio >= 0.60 then 'passed'
    when v_members > 0 and v_total >= v_members and v_ratio < 0.60 then 'rejected'
    else 'voting'
  end;

  update public.kitchen_proposals set status = v_status where id = v_proposal.id;
  return query
    select v_proposal.id, v_yes, v_no, v_total, v_ratio, (v_ratio >= 0.60), v_status, v_yes_say, v_total_say;
end;
$$;

-- Submit a proposal (verifies membership before inserting).
-- Dropped first: adding p_price/p_notional changes the argument signature, and
-- Postgres treats a changed signature as a new overload rather than a replace.
drop function if exists public.submit_proposal(text, text, text, integer, text, text);

create or replace function public.submit_proposal(
  p_ticker     text,
  p_asset_name text,
  p_side       text,
  p_units      integer,
  p_thesis     text,
  p_seasoning  text,
  p_price      numeric default null,
  p_notional   numeric default null
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
  from public.kitchen_members km where km.user_id = v_uid order by km.joined_at limit 1;
  if v_kid is null then raise exception 'You must be in a Kitchen to propose a recipe.'; end if;
  insert into public.kitchen_proposals
    (kitchen_id, proposer_id, ticker, asset_name, side, units, thesis, seasoning, status, price, notional)
  values (v_kid, v_uid,
          upper(trim(p_ticker)), p_asset_name,
          case when upper(p_side) = 'SELL' then 'SELL' else 'BUY' end,
          p_units, p_thesis, p_seasoning, 'voting', p_price, p_notional)
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
  from public.kitchen_members km where km.user_id = v_uid order by km.joined_at limit 1;
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

grant execute on function public.create_kitchen(text, text)                  to authenticated;
grant execute on function public.join_kitchen_by_code(text)                  to authenticated;
grant execute on function public.my_kitchen()                                to authenticated;
grant execute on function public.kitchen_votes_for(text)                     to authenticated;
grant execute on function public.cast_kitchen_vote(uuid, text, text)         to authenticated;
grant execute on function public.submit_proposal(text, text, text, integer, text, text, numeric, numeric) to authenticated;
grant execute on function public.active_proposal()                           to authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- ◈  KITCHEN EXECUTIONS — the receipt bond between the Kitchen and its Vault.
--    A recipe that crosses the 60% Rule becomes a paper, timestamped accounting receipt.
--    Pure addition: cast_kitchen_vote's threshold math above is untouched.
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.kitchen_executions (
  id           uuid primary key default gen_random_uuid(),
  kitchen_id   uuid not null references public.kitchens(id) on delete cascade,
  proposal_id  uuid not null unique references public.kitchen_proposals(id) on delete cascade,
  ticker       text not null,
  asset_name   text,
  side         text not null,
  units        integer,
  price        numeric,
  notional     numeric,
  executed_at  timestamptz default now()
);

alter table public.kitchen_executions enable row level security;

drop policy if exists "executions_select_member" on public.kitchen_executions;
create policy "executions_select_member" on public.kitchen_executions
  for select using (
    exists (select 1 from public.kitchen_members m
            where m.kitchen_id = kitchen_executions.kitchen_id and m.user_id = auth.uid())
  );

-- Fires exactly once per proposal: cast_kitchen_vote rejects further votes once a
-- proposal is no longer 'voting', so 'passed' is a one-way transition.
create or replace function public.execute_passed_proposal()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.kitchen_executions (kitchen_id, proposal_id, ticker, asset_name, side, units, price, notional)
  values (new.kitchen_id, new.id, new.ticker, new.asset_name, new.side, new.units, new.price, new.notional)
  on conflict (proposal_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_execute_passed_proposal on public.kitchen_proposals;
create trigger trg_execute_passed_proposal
  after update of status on public.kitchen_proposals
  for each row
  when (new.status = 'passed' and old.status is distinct from 'passed')
  execute function public.execute_passed_proposal();

-- Receipts + simple net holdings for the caller's Kitchen. Same recursion-free,
-- RPC-only access pattern as the other Kitchen functions above.
create or replace function public.kitchen_vault_ledger()
returns table (receipts jsonb, holdings jsonb)
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_kid uuid;
begin
  if v_uid is null then return; end if;
  select km.kitchen_id into v_kid
  from public.kitchen_members km where km.user_id = v_uid order by km.joined_at limit 1;
  if v_kid is null then return; end if;

  return query
  select
    coalesce((select jsonb_agg(to_jsonb(e) order by e.executed_at desc)
              from public.kitchen_executions e where e.kitchen_id = v_kid), '[]'::jsonb),
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'ticker', h.ticker, 'net_units', h.net_units, 'net_notional', h.net_notional
      ))
      from (
        select e.ticker,
               sum(case when e.side = 'BUY' then e.units else -e.units end) as net_units,
               sum(case when e.side = 'BUY' then e.notional else -e.notional end) as net_notional
        from public.kitchen_executions e
        where e.kitchen_id = v_kid
        group by e.ticker
      ) h
    ), '[]'::jsonb);
end;
$$;

grant execute on function public.kitchen_vault_ledger() to authenticated;

-- ── VAULT vertex ── what you own · track · compound ──────────────────────────
-- Prediction logs are the Vault's primary signal: every market call the chef
-- makes (personal and kitchen-level) is recorded here.
create table if not exists public.prediction_logs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade,
  ticker              text,
  personal_prediction text,
  kitchen_prediction  text,
  result              text default 'pending',   -- 'pending' | 'correct' | 'incorrect'
  created_at          timestamptz default now()
);

alter table public.prediction_logs enable row level security;

drop policy if exists "predictions_select_own" on public.prediction_logs;
create policy "predictions_select_own" on public.prediction_logs
  for select using (auth.uid() = user_id);

drop policy if exists "predictions_insert_own" on public.prediction_logs;
create policy "predictions_insert_own" on public.prediction_logs
  for insert with check (auth.uid() = user_id);

-- ── VAULT CONTRIBUTIONS — production-shaped paper deposit/withdrawal intents ──
-- YI_UNIFIED_VISION.md §3: "build the full product workflow, disable only
-- real-money settlement." A Personal Vault contribution is the chef's own paper
-- capital — no co-signer needed, it settles immediately. A Kitchen Vault
-- contribution is a joint-account intent (kitchen_id set): it needs a co-signer
-- who is not the requester before it settles. No real money ever moves.
create table if not exists public.vault_contributions (
  id           uuid primary key default gen_random_uuid(),
  kitchen_id   uuid references public.kitchens(id) on delete cascade,  -- null = Personal Vault
  user_id      uuid not null references auth.users(id) on delete cascade,
  kind         text not null check (kind in ('deposit', 'withdrawal')),
  amount       numeric not null check (amount > 0),
  status       text not null default 'requested' check (status in ('requested', 'approved', 'rejected')),
  notes        text,
  requested_at timestamptz default now(),
  approved_by  uuid references auth.users(id) on delete set null,
  approved_at  timestamptz
);

alter table public.vault_contributions enable row level security;

drop policy if exists "contributions_select_own_or_kitchen" on public.vault_contributions;
create policy "contributions_select_own_or_kitchen" on public.vault_contributions
  for select using (
    auth.uid() = user_id
    or (kitchen_id is not null and exists (
      select 1 from public.kitchen_members m
      where m.kitchen_id = vault_contributions.kitchen_id and m.user_id = auth.uid()
    ))
  );

-- Direct inserts are only for Personal Vault contributions (kitchen_id is null);
-- Kitchen Vault contributions go through request_kitchen_vault_contribution()
-- below so the requester can never set their own kitchen_id or skip the co-sign step.
drop policy if exists "contributions_insert_personal" on public.vault_contributions;
create policy "contributions_insert_personal" on public.vault_contributions
  for insert with check (auth.uid() = user_id and kitchen_id is null);

-- Personal Vault: self-serve, settles immediately (it's the chef's own paper money).
create or replace function public.request_personal_vault_contribution(
  p_kind   text,
  p_amount numeric,
  p_notes  text default null
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_kind not in ('deposit', 'withdrawal') then raise exception 'Kind must be deposit or withdrawal.'; end if;
  if p_amount <= 0 then raise exception 'Amount must be greater than zero.'; end if;
  insert into public.vault_contributions (kitchen_id, user_id, kind, amount, status, notes, approved_by, approved_at)
  values (null, v_uid, p_kind, p_amount, 'approved', p_notes, v_uid, now())
  returning id into v_id;
  return v_id;
end;
$$;

-- Kitchen Vault: joint-account intent. Requester's own kitchen is resolved
-- server-side — never trust a client-supplied kitchen_id here.
create or replace function public.request_kitchen_vault_contribution(
  p_kind   text,
  p_amount numeric,
  p_notes  text default null
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
  if p_kind not in ('deposit', 'withdrawal') then raise exception 'Kind must be deposit or withdrawal.'; end if;
  if p_amount <= 0 then raise exception 'Amount must be greater than zero.'; end if;
  select km.kitchen_id into v_kid
  from public.kitchen_members km where km.user_id = v_uid order by km.joined_at limit 1;
  if v_kid is null then raise exception 'You must be in a Kitchen to request a Kitchen Vault contribution.'; end if;
  insert into public.vault_contributions (kitchen_id, user_id, kind, amount, status, notes)
  values (v_kid, v_uid, p_kind, p_amount, 'requested', p_notes)
  returning id into v_id;
  return v_id;
end;
$$;

-- Co-sign: any OTHER member of the same Kitchen may approve or reject —
-- mirrors frontend/lib/domain.ts's canApproveContribution rule.
create or replace function public.decide_kitchen_vault_contribution(p_id uuid, p_approve boolean)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.vault_contributions%rowtype;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select * into v_row from public.vault_contributions where id = p_id for update;
  if not found or v_row.kitchen_id is null then raise exception 'Kitchen contribution not found.'; end if;
  if v_row.status <> 'requested' then raise exception 'This contribution has already been decided.'; end if;
  if v_row.user_id = v_uid then raise exception 'The requester cannot co-sign their own contribution.'; end if;
  if not exists (select 1 from public.kitchen_members m where m.kitchen_id = v_row.kitchen_id and m.user_id = v_uid) then
    raise exception 'Only a member of this Kitchen may decide on its contributions.';
  end if;
  update public.vault_contributions
    set status = case when p_approve then 'approved' else 'rejected' end,
        approved_by = v_uid,
        approved_at = now()
    where id = p_id;
end;
$$;

grant execute on function public.request_personal_vault_contribution(text, numeric, text) to authenticated;
grant execute on function public.request_kitchen_vault_contribution(text, numeric, text)   to authenticated;
grant execute on function public.decide_kitchen_vault_contribution(uuid, boolean)          to authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- ◿  SICILIA'S TRIANGLE — meaning · the why
--    Sicilia's three vertices: Times (story), Lounge (status), The Table (belonging).
--    These flow downward toward community, aspiration, and shared identity.
-- ══════════════════════════════════════════════════════════════════════════════

-- ── TIMES vertex ── story · culture · the Young Investor Times ───────────────
-- Times content is editorial and largely mock-data driven in the demo. No
-- dedicated DB tables are needed at this stage — articles live in mockData.ts.
-- Future: articles, issues, authored_by (chef_id FK) tables live here.

-- ── LOUNGE vertex ── status · ranks · earned prestige ────────────────────────
-- Lounge rankings are derived at runtime from profiles.rank and kitchen scores.
-- No dedicated table is needed. The ◈ Ranks bond (profiles.rank) and
-- ◈ Beat Gordon bond (profiles.jse_market_score / kitchen_prediction_score)
-- power all Lounge views.

-- ── THE TABLE vertex ── chat · community · notifications ─────────────────────
-- Notifications must be created before the notify_kitchen_proposal trigger fires.
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

create table if not exists public.kitchen_messages (
  id          uuid primary key default gen_random_uuid(),
  kitchen_id  uuid not null references public.kitchens(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  body        text not null check (length(trim(body)) between 1 and 1000),
  created_at  timestamptz default now()
);

alter table public.kitchen_messages enable row level security;

-- Table RPCs — polling-friendly; no realtime subscription required.
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
  from public.kitchen_members km where km.user_id = v_uid order by km.joined_at limit 1;
  if v_kid is null then raise exception 'You must be in a Kitchen to send a message.'; end if;
  insert into public.kitchen_messages (kitchen_id, user_id, body)
  values (v_kid, v_uid, trim(p_body))
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.kitchen_messages_page(
  p_before timestamptz default now(),
  p_limit  integer     default 40
)
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
  from public.kitchen_members km where km.user_id = v_uid order by km.joined_at limit 1;
  if v_kid is null then return; end if;
  return query
    select m.id, m.user_id,
           coalesce(p.chef_alias, 'Chef')           as chef_alias,
           coalesce(p.profile_icon, 'chef-default') as profile_icon,
           m.body, m.created_at
    from public.kitchen_messages m
    left join public.profiles p on p.id = m.user_id
    where m.kitchen_id = v_kid and m.created_at < p_before
    order by m.created_at desc
    limit greatest(1, least(100, p_limit));
end;
$$;

grant execute on function public.send_message(text)                                  to authenticated;
grant execute on function public.kitchen_messages_page(timestamptz, integer)         to authenticated;

-- Server-side trigger: notify all Kitchen members when a new proposal is submitted.
create or replace function public.notify_kitchen_proposal()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  v_alias  text;
  v_member record;
begin
  select coalesce(chef_alias, 'A chef') into v_alias
  from public.profiles where id = new.proposer_id;

  for v_member in
    select user_id from public.kitchen_members
    where kitchen_id = new.kitchen_id and user_id <> new.proposer_id
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

-- ══════════════════════════════════════════════════════════════════════════════
-- ◈  INTERSECTION BONDS — where Gordon and Sicilia's triangles overlap
--
--  ◈ Seasoning   — the mandatory reason behind every vote and proposal.
--                  Stored in kitchen_votes.seasoning_reason and
--                  kitchen_proposals.seasoning. No separate table needed.
--
--  ◈ The Creed   — "too many cooks make it better." The governance rules
--                  (60% threshold, quorum, mutual/hedge modes) are enforced
--                  in cast_kitchen_vote and the domain layer (domain.ts).
--                  No separate table needed.
--
--  ◈ Ranks       — Commis → Sous Chef → Master Chef. Computed from
--                  academy_score and stored in profiles.rank.
--                  No separate table needed.
--
--  ◈ Beat Gordon — the weekly performance game. Gordon's benchmark is held
--                  in mock data; each chef's score lives in
--                  profiles.jse_market_score and kitchen_prediction_score.
--                  No separate table needed.
--
--  ◈ 60% Rule    — implemented in cast_kitchen_vote (see KITCHEN vertex above).
--
--  ◈ The Guide   — Gordon's 10-question diagnostic. Has its own table below.
-- ══════════════════════════════════════════════════════════════════════════════

-- ── THE GUIDE bond ── Gordon reads the chef; Sicilia translates the result ────
create table if not exists public.gordon_guide (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  score       integer not null default 0 check (score between 0 and 100),
  band        text not null default 'Burn Risk',
  inputs      jsonb,           -- raw diagnostic answers
  computed_at timestamptz default now(),
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

-- ══════════════════════════════════════════════════════════════════════════════
-- ⬟  CHEF CARD & LOUNGE IDENTITY — public identity, viewable beyond your own row
-- ══════════════════════════════════════════════════════════════════════════════

-- The Chef Card: the public, safe subset of a profile — viewable for ANY chef by
-- any authenticated caller (this is the one deliberate exception to "select own
-- row only" on profiles). Never returns email, age, or intent — those stay
-- private per SECURITY_GUARDRAILS.md.
create or replace function public.chef_card(p_user_id uuid)
returns table (
  user_id                    uuid,
  chef_alias                 text,
  profile_icon               text,
  profile_picture_url        text,
  member_number              integer,
  rank                       text,
  academy_score              integer,
  kitchen_score              integer,
  jse_market_score           integer,
  personal_prediction_score  integer,
  kitchen_prediction_score   integer,
  credential_status          text,
  current_kitchen            text
)
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then return; end if;
  return query
    select p.id, p.chef_alias, p.profile_icon, p.profile_picture_url, p.member_number,
           p.rank, p.academy_score, p.kitchen_score, p.jse_market_score,
           p.personal_prediction_score, p.kitchen_prediction_score,
           p.credential_status, p.current_kitchen
    from public.profiles p
    where p.id = p_user_id;
end;
$$;

grant execute on function public.chef_card(uuid) to authenticated;

-- Real Kitchens, ranked, so a newly formed Kitchen gets an identity in the Lounge
-- instead of the honest empty state. No fabricated performance numbers — that
-- arrives once kitchen_executions has enough data to be honest about.
create or replace function public.lounge_kitchen_rankings()
returns table (
  kitchen_id      uuid,
  name            text,
  governance      text,
  member_count    integer,
  founder_user_id uuid,
  founder_alias   text,
  created_at      timestamptz
)
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then return; end if;
  return query
    select k.id, k.name, k.governance,
           (select count(*)::integer from public.kitchen_members m where m.kitchen_id = k.id),
           k.created_by,
           coalesce(p.chef_alias, 'Chef'),
           k.created_at
    from public.kitchens k
    left join public.profiles p on p.id = k.created_by
    order by (select count(*) from public.kitchen_members m where m.kitchen_id = k.id) desc,
             k.created_at asc;
end;
$$;

grant execute on function public.lounge_kitchen_rankings() to authenticated;

-- ══════════════════════════════════════════════════════════════════════════════
-- ⬡  SUPPORT — operational tables that serve the whole house
-- ══════════════════════════════════════════════════════════════════════════════

-- Tester feedback — any chef may submit; links back to profiles optionally.
create table if not exists public.tester_feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  screen     text,
  rating     integer,
  text       text,
  created_at timestamptz default now()
);

alter table public.tester_feedback enable row level security;

drop policy if exists "feedback_insert" on public.tester_feedback;
create policy "feedback_insert" on public.tester_feedback
  for insert with check (auth.uid() = user_id or user_id is null);

-- ── Storage — profile-pictures bucket ────────────────────────────────────────
-- Public read is acceptable for the demo (avatars are not sensitive). Each
-- tester may only write inside a folder named after their own user id.
insert into storage.buckets (id, name, public)
values ('profile-pictures', 'profile-pictures', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read"  on storage.objects;
create policy "avatars_public_read"  on storage.objects
  for select using (bucket_id = 'profile-pictures');

drop policy if exists "avatars_insert_own"   on storage.objects;
create policy "avatars_insert_own"   on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-pictures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own"   on storage.objects;
create policy "avatars_update_own"   on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-pictures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own"   on storage.objects;
create policy "avatars_delete_own"   on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-pictures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- FIRST 100 BETA — reassign member numbers by creation order
-- ──────────────────────────────────────────────────────────────────────────────
-- Run this block ONCE after your first batch of testers have signed up.
-- Assigns permanent numbers (003, 004, 005 …) in the order each chef created
-- their account. Gordon = 001 and Sicilia = 002 remain reserved and have no
-- rows here. Idempotent: chefs who already have the correct number are skipped.
--
-- TO RUN: paste this block into Supabase SQL Editor and execute separately.
-- ══════════════════════════════════════════════════════════════════════════════
-- do $$
-- declare
--   r record;
--   new_num integer := 2;  -- first real chef gets 003
-- begin
--   for r in
--     select id from public.profiles order by created_at asc
--   loop
--     new_num := new_num + 1;
--     update public.profiles
--       set member_number = new_num, updated_at = now()
--       where id = r.id
--         and (member_number is distinct from new_num);
--   end loop;
--   perform setval(
--     'public.chef_number_seq',
--     greatest(new_num, (select coalesce(max(member_number), 2) from public.profiles)),
--     true
--   );
-- end
-- $$;
-- ══════════════════════════════════════════════════════════════════════════════
-- Done. Testers are numbered from 003.
-- Gordon (001) and Sicilia (002) are reserved AI seats in the frontend only.
-- ══════════════════════════════════════════════════════════════════════════════
