-- StyleSutra — Migration 005: Homepage redesign
-- Category tile images, hero banner, scrolling promo bar, "Best Sellers" flag.
-- Run this in Supabase SQL Editor. Safe to run on your existing live database.

alter table sections add column if not exists image_url text;
alter table products add column if not exists is_best_seller boolean default false;

alter table settings add column if not exists hero_image_url text default '';
alter table settings add column if not exists hero_title text default 'Style Sutra';
alter table settings add column if not exists hero_subtitle text default 'Handpicked chains, rings, charms & full chains — for him and her.';
alter table settings add column if not exists hero_button_text text default 'Shop Now';
alter table settings add column if not exists hero_button_link text default '/';

create table if not exists promo_messages (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);
alter table promo_messages enable row level security;
drop policy if exists "public read promo_messages" on promo_messages;
create policy "public read promo_messages" on promo_messages for select using (true);
