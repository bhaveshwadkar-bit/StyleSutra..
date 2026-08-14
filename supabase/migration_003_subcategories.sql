-- StyleSutra — Migration 003: Subcategories (parent_id on sections)
-- Run this in Supabase SQL Editor. Safe to run even if you've already run migration_002.

alter table sections add column if not exists parent_id uuid references sections(id) on delete cascade;
