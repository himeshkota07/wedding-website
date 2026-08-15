-- Allow-list of emails permitted to sign in to /admin. No public policies:
-- only the service-role (secret) key can read/write this table.
create table if not exists admins (
  email text primary key
);

alter table admins enable row level security;

insert into admins (email) values ('himeshkota@gmail.com')
on conflict (email) do nothing;
