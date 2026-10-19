-- Events show a time range ("7:00 pm – 10:00 pm") instead of just a start
-- time. event_end is optional: an event without one shows its start time as
-- before. It's a full timestamp so an event can run past midnight.
alter table events add column if not exists event_end timestamptz;

alter table events drop constraint if exists events_event_end_check;
alter table events
  add constraint events_event_end_check
  check (event_end is null or event_end > event_date);
