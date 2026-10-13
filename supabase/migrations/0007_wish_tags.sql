-- Wishes become paper tags hung from the toran: each has a paper colour and
-- may carry one photo, shown behind its text. Existing wishes keep working
-- (they default to haldi and have no photo).
alter table wishes
  add column if not exists color text not null default 'haldi'
    check (color in ('haldi', 'blush', 'sage', 'ivory')),
  -- uploaded to Cloudinary straight from the guest's browser (same unsigned preset as the gallery)
  add column if not exists photo_url text,
  add column if not exists photo_public_id text;
