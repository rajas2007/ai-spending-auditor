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
  user_id uuid not null references auth.users(id) on delete cascade,
  input jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

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

create policy "Users can insert own audits" on public.audits
  for insert with check (auth.uid() = user_id);
