-- Custora database foundation for Supabase Postgres.
-- Additive migration: creates application tables, indexes, triggers, and RLS policies.
-- Authorization is based on auth.uid() and profiles.role, never client-supplied values.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null,
  role text not null default 'USER' check (role in ('ADMIN', 'MANAGER', 'USER')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email));
create index if not exists profiles_role_idx on public.profiles (role);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null check (char_length(trim(email)) between 3 and 254),
  company text not null check (char_length(trim(company)) between 1 and 120),
  phone text check (phone is null or char_length(phone) <= 40),
  job_title text check (job_title is null or char_length(job_title) <= 120),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  location text check (location is null or char_length(location) <= 120),
  preferred_contact text not null default 'Email' check (preferred_contact in ('Email', 'Phone')),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references public.profiles (id) on delete restrict,
  updated_by uuid not null references public.profiles (id) on delete restrict
);

create index if not exists customers_name_idx on public.customers (name);
create index if not exists customers_email_idx on public.customers (email);
create index if not exists customers_company_idx on public.customers (company);
create index if not exists customers_status_idx on public.customers (status);
create index if not exists customers_created_at_idx on public.customers (created_at desc);
create index if not exists customers_updated_at_idx on public.customers (updated_at desc);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.profiles (id) on delete restrict,
  action text not null check (action in (
    'Customer created',
    'Customer updated',
    'Customer deleted',
    'User signed in',
    'User role changed'
  )),
  entity_type text not null check (entity_type in ('customer', 'user')),
  entity_id uuid,
  customer_id uuid references public.customers (id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists activities_actor_idx on public.activities (actor_user_id, created_at desc);
create index if not exists activities_customer_idx on public.activities (customer_id, created_at desc);
create index if not exists activities_action_idx on public.activities (action, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

 drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.activities enable row level security;

-- Profiles: authenticated users may read workspace profiles; users may edit only themselves.
drop policy if exists profiles_select_authenticated on public.profiles;
create policy profiles_select_authenticated
on public.profiles for select to authenticated
using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Customers: all signed-in users can read/create/update; only ADMIN can delete.
drop policy if exists customers_select_authenticated on public.customers;
create policy customers_select_authenticated
on public.customers for select to authenticated
using (true);

drop policy if exists customers_insert_authenticated on public.customers;
create policy customers_insert_authenticated
on public.customers for insert to authenticated
with check (
  (select auth.uid()) = created_by
  and (select auth.uid()) = updated_by
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('ADMIN', 'MANAGER', 'USER')
  )
);

drop policy if exists customers_update_authenticated on public.customers;
create policy customers_update_authenticated
on public.customers for update to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('ADMIN', 'MANAGER', 'USER')))
with check ((select auth.uid()) = updated_by);

drop policy if exists customers_delete_admin on public.customers;
create policy customers_delete_admin
on public.customers for delete to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'ADMIN'));

-- Activity is readable by signed-in workspace members and writable only for the actor.
drop policy if exists activities_select_authenticated on public.activities;
create policy activities_select_authenticated
on public.activities for select to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid())));

drop policy if exists activities_insert_actor on public.activities;
create policy activities_insert_actor
on public.activities for insert to authenticated
with check ((select auth.uid()) = actor_user_id);

revoke all on public.profiles, public.customers, public.activities from anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert on public.activities to authenticated;
