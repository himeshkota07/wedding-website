-- Readable invitation links: "/i/family-k7m2q" instead of a random 12-character
-- code, so elders can tell at a glance which link goes to which guests. The
-- name part is chosen in /admin/links; the 5-character suffix keeps a link
-- from being guessed from its name. Existing random codes stay valid.
alter table invite_links drop constraint if exists invite_links_code_check;

alter table invite_links
  add constraint invite_links_code_check
  check (code is null or (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(code) between 3 and 40));
