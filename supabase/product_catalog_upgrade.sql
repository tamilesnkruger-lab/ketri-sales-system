-- Upgrade seguro para transformar products em catalogo comercial.
-- Execute no Supabase SQL Editor antes de usar a nova tela em ambiente real.

alter table public.products
  add column if not exists cost_price numeric(12, 2) check (cost_price is null or cost_price >= 0),
  add column if not exists b2b_price numeric(12, 2) check (b2b_price is null or b2b_price >= 0),
  add column if not exists b2c_price numeric(12, 2) check (b2c_price is null or b2c_price >= 0),
  add column if not exists image_url text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists featured boolean not null default false,
  add column if not exists favorite boolean not null default false;

update public.products
set b2c_price = coalesce(b2c_price, price)
where b2c_price is null;

alter table public.products
  drop constraint if exists products_stock_status_check;

update public.products
set stock_status = 'disponivel'
where stock_status = 'pronto';

alter table public.products
  add constraint products_stock_status_check
  check (stock_status in ('disponivel', 'sob encomenda', 'indisponivel', 'em producao'));

create index if not exists products_category_idx on public.products (category);
create index if not exists products_featured_idx on public.products (featured);