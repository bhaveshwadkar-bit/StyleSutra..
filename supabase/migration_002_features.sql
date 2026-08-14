-- StyleSutra — Migration: Featured products, delivery charges, low stock threshold
-- Run this in Supabase SQL Editor (safe to run on your existing live database)

alter table products add column if not exists is_featured boolean default false;

alter table settings add column if not exists delivery_charge_text text default 'Delivery charge: ₹49 (FREE above ₹999)';
alter table settings add column if not exists delivery_charge_amount numeric(10,2) default 49;
alter table settings add column if not exists free_delivery_min_order numeric(10,2) default 999;
alter table settings add column if not exists low_stock_threshold int default 5;

alter table orders add column if not exists delivery_charge numeric(10,2) default 0;
