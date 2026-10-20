-- Every question guests ask the chatbot, with the answer they got, so the
-- family can see what people are looking for (Admin → Chat log). Only the
-- server writes and reads it, with the secret key: no public policies.
create table if not exists chat_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  invite_label text,
  question text not null,
  reply text,
  script text,
  failed boolean not null default false
);

create index if not exists chat_log_created_at_idx on chat_log (created_at desc);

alter table chat_log enable row level security;
