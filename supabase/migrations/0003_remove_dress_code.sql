-- These events don't have a dress code.
alter table events drop column if exists dress_code;
