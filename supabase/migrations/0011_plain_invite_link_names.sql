-- Invitation links are just the name chosen in /admin/links: "/i/family"
-- instead of "/i/family-k7m2q". Names may now be as short as 2 characters,
-- and existing links lose their random 5-character ending. The site sends
-- anyone using an old "name-xxxxx" address on to the new one.
alter table invite_links drop constraint if exists invite_links_code_check;

alter table invite_links
  add constraint invite_links_code_check
  check (code is null or (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(code) between 2 and 40));

update invite_links
set code = regexp_replace(code, '-[a-z0-9]{5}$', '')
where code ~ '^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]{5}$';
