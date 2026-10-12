-- Guest wishes for the couple: the "Wishing Toran" on the home page and the
-- Pelli Pustakam keepsake book in /admin/wishes. Guests write through a
-- server action using the service-role key (like gallery uploads), so the
-- only public policy is reading visible wishes.
create table if not exists wishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  relation text check (relation is null or char_length(relation) <= 80),
  message text not null check (char_length(message) between 1 and 600),
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists wishes_created_at_idx on wishes (created_at);

alter table wishes enable row level security;

create policy "public read approved wishes" on wishes for select using (approved = true);
