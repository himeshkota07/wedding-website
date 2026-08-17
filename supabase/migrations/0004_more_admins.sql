insert into admins (email) values
  ('ashish.kota03@gmail.com'),
  ('tarunya97masters@gmail.com')
on conflict (email) do nothing;
