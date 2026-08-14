-- StyleSutra Migration v2 — run this in Supabase SQL Editor (SQL Editor -> New Query -> paste -> Run)
-- Safe to run even if some columns already exist.

alter table products add column if not exists is_featured boolean default false;

alter table settings add column if not exists delivery_charge numeric(10,2) default 0;
alter table settings add column if not exists free_delivery_threshold numeric(10,2) default 0;
alter table settings add column if not exists delivery_message text default 'Free delivery on all orders!';

alter table orders add column if not exists delivery_fee numeric(10,2) default 0;
