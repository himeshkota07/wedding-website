-- Initial schema: the tables the admin panel edits and the guest-facing pages read.
-- RLS is enabled everywhere with public SELECT policies only; writes go through the
-- service-role key from admin server actions, never the anon key.

create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  map_url text,
  parking_info text,
  accessibility_info text,
  nearby_landmarks text,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  event_date timestamptz not null,
  venue_id uuid references venues(id) on delete set null,
  dress_code text,
  theme_color text,
  special_instructions text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  side text not null check (side in ('bride', 'groom')),
  role text not null,
  name text not null,
  bio text,
  photo_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  phone text,
  whatsapp_link text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  cloudinary_public_id text not null,
  cloudinary_url text not null,
  caption text,
  uploaded_by text,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

-- Single-row key/value store for couple names, wedding date, feature toggles, etc.
create table if not exists site_settings (
  key text primary key,
  value jsonb not null
);

alter table venues enable row level security;
alter table events enable row level security;
alter table family_members enable row level security;
alter table faqs enable row level security;
alter table contacts enable row level security;
alter table gallery_images enable row level security;
alter table site_settings enable row level security;

create policy "public read venues" on venues for select using (true);
create policy "public read events" on events for select using (true);
create policy "public read family_members" on family_members for select using (true);
create policy "public read faqs" on faqs for select using (true);
create policy "public read contacts" on contacts for select using (true);
create policy "public read approved gallery_images" on gallery_images for select using (approved = true);
create policy "public read site_settings" on site_settings for select using (true);
