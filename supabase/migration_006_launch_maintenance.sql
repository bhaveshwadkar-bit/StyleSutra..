-- StyleSutra — Migration 006: Launch countdown & Maintenance mode
-- Run this in Supabase SQL Editor. Safe to run on your existing live database.

alter table settings add column if not exists launch_gate_enabled boolean default false;
alter table settings add column if not exists launch_at timestamptz;
alter table settings add column if not exists launch_message text default 'We''re launching soon!';
alter table settings add column if not exists launch_subtext text default 'Something beautiful is on its way. Check back soon.';

alter table settings add column if not exists maintenance_mode_enabled boolean default false;
alter table settings add column if not exists maintenance_message text default 'We''re currently updating our store. Please check back shortly!';
