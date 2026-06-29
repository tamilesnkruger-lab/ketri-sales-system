create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'vendedor');
create type public.client_status as enum (
  'lead',
  'atendimento',
  'orcamento',
  'follow-up',
  'venda',
  'pos-venda'
);
create type public.quote_status as enum ('rascunho', 'enviado', 'aprovado', 'perdido');
create type public.activity_type as enum ('ligacao', 'whatsapp', 'email', 'reuniao', 'pos-venda');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null default 'vendedor',
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text not null,
  phone text,
  email text,
  city text,
  status public.client_status not null default 'lead',
  potential text not null default 'medio',
  seller_id uuid not null references public.profiles(id),
  last_activity text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category text not null,
  price numeric(12, 2) not null check (price >= 0),
  stock_status text not null default 'pronto',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  seller_id uuid not null references public.profiles(id),
  status public.quote_status not null default 'rascunho',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  seller_id uuid not null references public.profiles(id),
  type public.activity_type not null,
  note text not null,
  due_at timestamptz,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.activities enable row level security;
alter table public.settings enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "profiles read own or admin"
on public.profiles for select
using (id = auth.uid() or public.current_user_role() = 'admin');

create policy "admin manages profiles"
on public.profiles for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "clients read by owner or admin"
on public.clients for select
using (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "clients write by owner or admin"
on public.clients for all
using (seller_id = auth.uid() or public.current_user_role() = 'admin')
with check (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "products read authenticated"
on public.products for select
using (auth.role() = 'authenticated');

create policy "products admin write"
on public.products for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "quotes read by owner or admin"
on public.quotes for select
using (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "quotes write by owner or admin"
on public.quotes for all
using (seller_id = auth.uid() or public.current_user_role() = 'admin')
with check (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "quote items follow quote access"
on public.quote_items for select
using (
  exists (
    select 1 from public.quotes
    where quotes.id = quote_items.quote_id
    and (quotes.seller_id = auth.uid() or public.current_user_role() = 'admin')
  )
);

create policy "quote items write follow quote access"
on public.quote_items for all
using (
  exists (
    select 1 from public.quotes
    where quotes.id = quote_items.quote_id
    and (quotes.seller_id = auth.uid() or public.current_user_role() = 'admin')
  )
)
with check (
  exists (
    select 1 from public.quotes
    where quotes.id = quote_items.quote_id
    and (quotes.seller_id = auth.uid() or public.current_user_role() = 'admin')
  )
);

create policy "activities read by owner or admin"
on public.activities for select
using (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "activities write by owner or admin"
on public.activities for all
using (seller_id = auth.uid() or public.current_user_role() = 'admin')
with check (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "settings admin only"
on public.settings for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
