-- StyleSutra E-commerce Database Schema
-- Run this in Supabase SQL Editor (Project -> SQL Editor -> New Query -> paste -> Run)

create extension if not exists "uuid-ossp";

-- SECTIONS (categories, admin can add/edit/delete/reorder)
create table if not exists sections (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- PRODUCTS
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  section_id uuid references sections(id) on delete set null,
  name text not null,
  description text default '',
  price numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  stock int default 100,
  is_active boolean default true,
  is_featured boolean default false,
  photos jsonb default '[]',   -- array of {url, public_id}
  videos jsonb default '[]',   -- array of {url, public_id}
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- COUPONS
create table if not exists coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type text not null default 'percent', -- 'percent' or 'flat'
  discount_value numeric(10,2) not null,
  max_uses int not null default 1,
  used_count int not null default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ORDERS
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  items jsonb not null,             -- array of {product_id, name, price, qty, photo}
  subtotal numeric(10,2) not null,
  discount numeric(10,2) default 0,
  coupon_code text,
  delivery_fee numeric(10,2) default 0,
  total numeric(10,2) not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address_line text not null,
  city text not null,
  state text not null,
  pincode text not null,
  status text not null default 'pending_payment', -- pending_payment, payment_claimed, confirmed, shipped, delivered, cancelled, expired
  payment_deadline timestamptz not null,
  created_at timestamptz default now()
);

-- REVIEWS
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  message text default '',
  photos jsonb default '[]',   -- up to 5 photo urls
  is_approved boolean default true,
  created_at timestamptz default now()
);

-- SITE SETTINGS (single row, editable by admin: support info, UPI, socials, payment message)
create table if not exists settings (
  id int primary key default 1,
  site_name text default 'Style Sutra',
  support_phone_1 text default '+91 8591097540',
  support_phone_2 text default '+91 8928457642',
  support_email text default 'support@stylesutra.com',
  instagram_id text default '@stylesutra__',
  whatsapp_1 text default '+91 8591097540',
  whatsapp_2 text default '+91 8928457642',
  upi_id text default '8591097540@idfcfirst',
  qr_image_url text default '',
  payment_window_minutes int default 10,
  delivery_charge numeric(10,2) default 0,
  free_delivery_threshold numeric(10,2) default 0,
  delivery_message text default 'Free delivery on all orders!',
  payment_message text default 'Hello sir/ma''am, please share your payment screenshot to this number or Instagram ID so we can place your order within 24hr. We will also call you for confirmation. Thank you for your understanding 😊',
  check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- Seed default sections
insert into sections (name, slug, sort_order) values
  ('Chains', 'chains', 1),
  ('Rings', 'rings', 2),
  ('Charms', 'charms', 3),
  ('Full Chains', 'full-chains', 4)
on conflict (slug) do nothing;

-- Row Level Security: public can READ, only server (service role) can WRITE
alter table sections enable row level security;
alter table products enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
alter table settings enable row level security;

create policy "public read sections" on sections for select using (true);
create policy "public read active products" on products for select using (true);
create policy "public read settings" on settings for select using (true);
create policy "public read approved reviews" on reviews for select using (is_approved = true);
-- No public insert/update/delete policies are created for any table.
-- All writes (products, coupons, orders, reviews, settings) go through
-- server-side API routes using the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- This keeps writes admin-controlled and orders tamper-proof.
