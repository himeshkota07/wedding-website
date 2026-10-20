-- An event's time is now free text, as the family writes it: "7:00 pm
-- onwards, followed by dinner". event_date still holds the day and start
-- time for the countdown and calendar buttons. Events that already had an
-- end time keep their range, written out as text.
alter table events add column if not exists time_label text;

update events
set time_label =
  lower(to_char(event_date at time zone 'Asia/Kolkata', 'FMHH12:MI am'))
  || ' – '
  || lower(to_char(event_end at time zone 'Asia/Kolkata', 'FMHH12:MI am'))
where event_end is not null and time_label is null;
