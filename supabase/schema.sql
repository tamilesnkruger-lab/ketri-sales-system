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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text not null,
  phone text,
  email text,
  city text,
  status public.client_status not null default 'lead',
  potential text not null default 'medio' check (potential in ('baixo', 'medio', 'alto')),
  seller_id uuid not null references public.profiles(id),
  last_activity text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_id_seller_id_unique unique (id, seller_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category text not null,
  price numeric(12, 2) not null check (price >= 0),
  stock_status text not null default 'pronto' check (stock_status in ('pronto', 'sob encomenda')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  seller_id uuid not null references public.profiles(id),
  status public.quote_status not null default 'rascunho',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_client_seller_match
    foreign key (client_id, seller_id)
    references public.clients (id, seller_id)
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  seller_id uuid not null references public.profiles(id),
  type public.activity_type not null,
  note text not null,
  due_at timestamptz,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_client_seller_match
    foreign key (client_id, seller_id)
    references public.clients (id, seller_id)
);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  seller_id uuid not null references public.profiles(id),
  activity_id uuid references public.activities(id) on delete set null,
  title text not null,
  due_at timestamptz not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint follow_ups_client_seller_match
    foreign key (client_id, seller_id)
    references public.clients (id, seller_id)
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_seller_id_idx on public.clients (seller_id);
create index clients_status_idx on public.clients (status);
create index clients_updated_at_idx on public.clients (updated_at);
create index products_active_idx on public.products (active);
create index products_sku_idx on public.products (sku);
create index products_category_idx on public.products (category);
create index products_featured_idx on public.products (featured);
create index quotes_client_id_idx on public.quotes (client_id);
create index quotes_seller_id_idx on public.quotes (seller_id);
create index quotes_status_idx on public.quotes (status);
create index quote_items_quote_id_idx on public.quote_items (quote_id);
create index quote_items_product_id_idx on public.quote_items (product_id);
create index activities_client_id_idx on public.activities (client_id);
create index activities_seller_id_idx on public.activities (seller_id);
create index activities_due_at_idx on public.activities (due_at);
create index activities_done_idx on public.activities (done);
create index follow_ups_client_id_idx on public.follow_ups (client_id);
create index follow_ups_seller_id_idx on public.follow_ups (seller_id);
create index follow_ups_due_at_idx on public.follow_ups (due_at);
create index follow_ups_done_idx on public.follow_ups (done);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger quotes_set_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

create trigger quote_items_set_updated_at
before update on public.quote_items
for each row execute function public.set_updated_at();

create trigger activities_set_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

create trigger follow_ups_set_updated_at
before update on public.follow_ups
for each row execute function public.set_updated_at();

create trigger settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.activities enable row level security;
alter table public.follow_ups enable row level security;
alter table public.settings enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "profiles select own or admin"
on public.profiles for select
using (id = auth.uid() or public.current_user_role() = 'admin');

create policy "profiles insert admin"
on public.profiles for insert
with check (public.current_user_role() = 'admin');

create policy "profiles update admin"
on public.profiles for update
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "profiles delete admin"
on public.profiles for delete
using (public.current_user_role() = 'admin');

create policy "clients select owner or admin"
on public.clients for select
using (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "clients insert owner or admin"
on public.clients for insert
with check (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "clients update owner or admin"
on public.clients for update
using (seller_id = auth.uid() or public.current_user_role() = 'admin')
with check (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "clients delete admin"
on public.clients for delete
using (public.current_user_role() = 'admin');

create policy "products select active or admin"
on public.products for select
using (
  (active = true and auth.role() = 'authenticated')
  or public.current_user_role() = 'admin'
);

create policy "products insert admin"
on public.products for insert
with check (public.current_user_role() = 'admin');

create policy "products update admin"
on public.products for update
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "products delete admin"
on public.products for delete
using (public.current_user_role() = 'admin');

create policy "quotes select owner or admin"
on public.quotes for select
using (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "quotes insert owner or admin"
on public.quotes for insert
with check (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "quotes update owner or admin"
on public.quotes for update
using (seller_id = auth.uid() or public.current_user_role() = 'admin')
with check (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "quotes delete admin"
on public.quotes for delete
using (public.current_user_role() = 'admin');

create policy "quote items select by quote access"
on public.quote_items for select
using (
  exists (
    select 1 from public.quotes
    where quotes.id = quote_items.quote_id
    and (quotes.seller_id = auth.uid() or public.current_user_role() = 'admin')
  )
);

create policy "quote items insert by quote access"
on public.quote_items for insert
with check (
  exists (
    select 1 from public.quotes
    join public.products on products.id = quote_items.product_id
    where quotes.id = quote_items.quote_id
    and (quotes.seller_id = auth.uid() or public.current_user_role() = 'admin')
    and (products.active = true or public.current_user_role() = 'admin')
  )
);

create policy "quote items update by quote access"
on public.quote_items for update
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
    join public.products on products.id = quote_items.product_id
    where quotes.id = quote_items.quote_id
    and (quotes.seller_id = auth.uid() or public.current_user_role() = 'admin')
    and (products.active = true or public.current_user_role() = 'admin')
  )
);

create policy "quote items delete admin"
on public.quote_items for delete
using (public.current_user_role() = 'admin');

create policy "activities select owner or admin"
on public.activities for select
using (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "activities insert owner or admin"
on public.activities for insert
with check (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "activities update owner or admin"
on public.activities for update
using (seller_id = auth.uid() or public.current_user_role() = 'admin')
with check (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "activities delete admin"
on public.activities for delete
using (public.current_user_role() = 'admin');

create policy "follow ups select owner or admin"
on public.follow_ups for select
using (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "follow ups insert owner or admin"
on public.follow_ups for insert
with check (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "follow ups update owner or admin"
on public.follow_ups for update
using (seller_id = auth.uid() or public.current_user_role() = 'admin')
with check (seller_id = auth.uid() or public.current_user_role() = 'admin');

create policy "follow ups delete admin"
on public.follow_ups for delete
using (public.current_user_role() = 'admin');

create policy "settings select admin"
on public.settings for select
using (public.current_user_role() = 'admin');

create policy "settings insert admin"
on public.settings for insert
with check (public.current_user_role() = 'admin');

create policy "settings update admin"
on public.settings for update
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "settings delete admin"
on public.settings for delete
using (public.current_user_role() = 'admin');
