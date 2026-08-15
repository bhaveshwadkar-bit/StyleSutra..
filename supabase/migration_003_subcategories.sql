-- StyleSutra — Migration 003: Subcategories (parent_id on sections)
-- Run this in Supabase SQL Editor. Safe to run even if you've already run migration_002.

alter table sections add column if not exists parent_id uuid references sections(id) on delete cascade;

create table if not exists menu_links (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);
alter table menu_links enable row level security;
create policy "public read menu_links" on menu_links for select using (true);

insert into menu_links (label, url, sort_order)
select * from (values
  ('Shop All', '/', 1),
  ('Track Order', '/track', 2),
  ('Support', '/support', 3)
) as v(label, url, sort_order)
where not exists (select 1 from menu_links);
