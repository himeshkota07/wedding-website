-- Placeholder/sample content so the pages have something real to render.
-- Everything here is example data, not the couple's actual details — replace
-- it via the admin panel (or the SQL editor) once real content is ready.

with residence as (
  insert into venues (name, address, parking_info, accessibility_info, nearby_landmarks)
  values ('Family Residence (sample)', '12 Example Lane, Hyderabad, Telangana', 'Street parking available', 'Ground floor, wheelchair accessible', 'Near Example Circle')
  returning id
),
hall as (
  insert into venues (name, address, parking_info, accessibility_info, nearby_landmarks)
  values ('Grand Celebration Hall (sample)', '45 Example Road, Hyderabad, Telangana', 'Complimentary valet parking', 'Elevator access to all floors', 'Opposite Example Mall')
  returning id
)
insert into events (name, description, event_date, venue_id, theme_color, special_instructions, sort_order)
select 'Mehendi', 'Henna ceremony for the bride, family, and friends.', '2026-12-10T16:00:00+05:30', residence.id, '#2f7a3a', 'Footwear removed indoors', 1 from residence
union all
select 'Haldi', 'Turmeric ceremony to bless the couple.', '2026-12-11T10:00:00+05:30', residence.id, '#e6b800', 'Wear old clothes', 2 from residence
union all
select 'Sangeet', 'An evening of music, dance, and performances.', '2026-12-12T19:00:00+05:30', hall.id, '#a83279', 'No white or black attire', 3 from hall
union all
select 'Wedding', 'The main wedding ceremony.', '2026-12-13T08:00:00+05:30', hall.id, '#8b3a5c', 'Arrive 30 minutes before the muhurtham', 4 from hall
union all
select 'Reception', 'Evening reception and dinner.', '2026-12-13T19:00:00+05:30', hall.id, '#4a3a8b', '', 5 from hall;

insert into family_members (side, role, name, bio, sort_order) values
  ('bride', 'Bride', '[Bride Name] (sample)', 'A short bio goes here.', 1),
  ('bride', 'Parent', '[Bride Parent] (sample)', 'A short bio goes here.', 2),
  ('groom', 'Groom', '[Groom Name] (sample)', 'A short bio goes here.', 1),
  ('groom', 'Parent', '[Groom Parent] (sample)', 'A short bio goes here.', 2);

insert into faqs (question, answer, sort_order) values
  ('What should I wear?', 'There''s no dress code — wear whatever feels festive and comfortable!', 1),
  ('Is parking available?', 'Yes, see the Venue page for parking details at each location.', 2),
  ('Are kids welcome?', 'Yes, all functions are family-friendly.', 3),
  ('Who do I contact for help?', 'See the Contact page for coordinator numbers and the WhatsApp group link.', 4);

insert into contacts (name, role, phone, whatsapp_link, sort_order) values
  ('[Coordinator 1] (sample)', 'Wedding Coordinator', '+91 90000 00000', 'https://chat.whatsapp.com/REPLACE_ME', 1),
  ('[Coordinator 2] (sample)', 'Family Contact', '+91 90000 00001', 'https://chat.whatsapp.com/REPLACE_ME', 2);
