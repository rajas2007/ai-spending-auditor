create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  company text,
  team_size integer,
  monthly_ai_spend_usd numeric,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro')),
  created_at timestamptz not null default now()
);

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- Optional for guest audits
  input jsonb not null,
  result jsonb not null,
  pricing_version_used text,
  pricing_snapshot_used jsonb,
  reaudit_of uuid references public.audits(id),
  created_at timestamptz not null default now()
);

-- Ensure columns exist if table already created
alter table public.audits
  add column if not exists pricing_version_used text,
  add column if not exists pricing_snapshot_used jsonb,
  add column if not exists reaudit_of uuid references public.audits(id);

alter table public.profiles enable row level security;
alter table public.audits enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can read own audits" on public.audits
  for select using (auth.uid() = user_id);

-- Removed insecure public policy: "Public can read any audit"
-- Instead, we use a secure RPC to fetch public audits without allowing anonymous list queries

-- Secure RPC for retrieving a public audit by its ID
create or replace function get_public_audit_by_id(p_audit_id uuid)
returns table (
  id uuid,
  user_id uuid,
  input jsonb,
  result jsonb,
  pricing_version_used text,
  pricing_snapshot_used jsonb,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select id, user_id, input, result, pricing_version_used, pricing_snapshot_used, created_at
  from public.audits
  where id = p_audit_id;
$$;

drop policy if exists "Anyone can insert audits" on public.audits;
drop policy if exists "Authenticated users can insert own audits" on public.audits;
drop policy if exists "Anonymous users can insert guest audits" on public.audits;

create policy "Authenticated users can insert own audits" on public.audits
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Anonymous users can insert guest audits" on public.audits
  for insert to anon with check (user_id is null);

create policy "Users can update own audits" on public.audits
  for update using (auth.uid() = user_id);

-- LEAD CAPTURE SYSTEM
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references public.audits(id) on delete set null,
  email text not null,
  company text,
  role text,
  team_size text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- For MVP, we allow public insertion of leads since audits can be run by guests
create policy "Anyone can insert leads" on public.leads
  for insert with check (true);
