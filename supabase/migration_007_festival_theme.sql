-- StyleSutra — Migration 007: Festival Theme (temporary, auto-reverts by date)
-- Run this in Supabase SQL Editor.

alter table settings add column if not exists festival_theme_enabled boolean default true;
alter table settings add column if not exists festival_theme_name text default 'Raksha Bandhan';
alter table settings add column if not exists festival_theme_end_at timestamptz default '2026-08-29T00:00:00+05:30';
alter table settings add column if not exists festival_banner_text text default '🎉 Raksha Bandhan Special — celebrate the bond with a gift from Style Sutra! 🎉';
