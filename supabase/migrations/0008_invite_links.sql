-- Invitation links: not every guest is invited to every event, so each guest
-- list gets its own link, and the page, the venues and the chatbot only ever
-- see that link's events (plus the FAQs and chatbot notes it may see).
--
--   * One link is the plain site address (is_default, no code). It shows the
--     smallest set, so trimming a secret link never reveals more.
--   * Other links are /i/<code>; the code is the only thing that grants
--     access, so it is random and readable only by the server.
--   * A link with shows_all_events always shows every event, including ones
--     added later. Any other link shows only the events ticked for it, so a
--     new event never leaks onto a smaller list by default.
--   * FAQs and chatbot notes are visible on every link unless unticked.
--
-- None of these tables has a public policy: the site reads them with the
-- service-role key on the server. Events and FAQs lose their public read
-- policy for the same reason (the publishable key must not list hidden events).

create table if not exists invite_links (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 80),
  code text unique check (code is null or code ~ '^[a-z0-9]{8,32}$'),
  is_default boolean not null default false,
  shows_all_events boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  -- The plain address has no code; every other link must have one.
  check ((is_default and code is null) or (not is_default and code is not null))
);

-- Exactly one plain-address link.
create unique index if not exists invite_links_one_default on invite_links (is_default) where is_default;

create table if not exists event_invite_links (
  event_id uuid not null references events (id) on delete cascade,
  link_id uuid not null references invite_links (id) on delete cascade,
  primary key (event_id, link_id)
);

create table if not exists faq_hidden_links (
  faq_id uuid not null references faqs (id) on delete cascade,
  link_id uuid not null references invite_links (id) on delete cascade,
  primary key (faq_id, link_id)
);

-- Chatbot notes become one row per note (they were paragraphs in one text
-- setting), so each can be hidden from particular links.
create table if not exists chatbot_notes (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(content) between 1 and 2000),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists note_hidden_links (
  note_id uuid not null references chatbot_notes (id) on delete cascade,
  link_id uuid not null references invite_links (id) on delete cascade,
  primary key (note_id, link_id)
);

alter table invite_links enable row level security;
alter table event_invite_links enable row level security;
alter table faq_hidden_links enable row level security;
alter table chatbot_notes enable row level security;
alter table note_hidden_links enable row level security;

drop policy if exists "public read events" on events;
drop policy if exists "public read faqs" on faqs;

-- Seed the three links (codes are random; see them in /admin/links).
insert into invite_links (label, code, is_default, shows_all_events, sort_order)
select * from (values
  ('Muhurtham & Reception (plain address)', null::text, true, false, 1),
  ('All events except Welcome', left(replace(gen_random_uuid()::text, '-', ''), 12), false, false, 2),
  ('All events', left(replace(gen_random_uuid()::text, '-', ''), 12), false, true, 3)
) as seed (label, code, is_default, shows_all_events, sort_order)
where not exists (select 1 from invite_links);

insert into event_invite_links (event_id, link_id)
select e.id, l.id
from events e
join invite_links l on l.is_default
where e.name in ('Muhurtham', 'Reception')
on conflict do nothing;

insert into event_invite_links (event_id, link_id)
select e.id, l.id
from events e
join invite_links l on l.label = 'All events except Welcome'
where e.name <> 'Welcome'
on conflict do nothing;

-- Move the existing notes over, one row per paragraph.
insert into chatbot_notes (content, sort_order)
select trim(paragraph), row_number() over ()
from site_settings,
  regexp_split_to_table(coalesce(value ->> 'content', ''), E'\\r?\\n\\s*\\r?\\n') as paragraph
where key = 'knowledge_base_notes'
  and trim(paragraph) <> ''
  and not exists (select 1 from chatbot_notes);
