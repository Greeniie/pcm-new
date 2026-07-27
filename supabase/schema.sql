-- ============================================================
-- PCM Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Services ────────────────────────────────────────────────
create table if not exists services (
  id          text primary key,
  title       text not null,
  description text not null,
  day         text not null,
  time        text not null,
  location    text not null default '26/28 Adewunmi Abudu Street, Ajao Estate',
  icon        text not null default 'church',
  sort_order  int  not null default 0
);

-- ── Events ──────────────────────────────────────────────────
create table if not exists events (
  id          text primary key,
  title       text not null,
  theme       text,
  description text not null,
  dates       text not null,
  times       text not null default '',
  location    text not null default '26/28 Adewunmi Abudu Street, Ajao Estate, Lagos',
  image       text,
  featured    boolean not null default false,
  category    text not null default 'Special Event',
  created_at  timestamptz default now()
);

-- ── Testimonies ──────────────────────────────────────────────
create table if not exists testimonies (
  id         text primary key,
  title      text not null,
  body       text not null,
  author     text not null,
  created_at timestamptz default now()
);

-- ── Site Content (single row – id always = 1) ────────────────
create table if not exists content (
  id         int primary key default 1,
  hero       jsonb not null default '{}',
  about      jsonb not null default '{}',
  giving     jsonb not null default '{}',
  contact    jsonb not null default '{}'
);

-- Ensure only one row can exist
create unique index if not exists content_singleton on content (id);

-- ── Tithers ──────────────────────────────────────────────────
create table if not exists tithers (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text,
  phone          text,
  amount         numeric(12,2) not null,
  date           date not null default current_date,
  payment_method text not null default 'bank_transfer',
  bank           text,
  reference      text,
  notes          text,
  created_at     timestamptz default now()
);

-- ── Row-Level Security ───────────────────────────────────────
-- Public read access for site data (services, events, testimonies, content)
alter table services    enable row level security;
alter table events      enable row level security;
alter table testimonies enable row level security;
alter table content     enable row level security;
alter table tithers     enable row level security;

-- Services: public read
create policy "Public read services"    on services    for select using (true);
-- Events: public read
create policy "Public read events"      on events      for select using (true);
-- Testimonies: public read
create policy "Public read testimonies" on testimonies for select using (true);
-- Content: public read
create policy "Public read content"     on content     for select using (true);
-- Tithers: NO public read (admin only via service_role key)

-- All writes use the service_role key (server-side / admin only).
-- If you later add Supabase Auth for admin, replace these with auth-based policies.
create policy "Service role all services"    on services    for all using (true) with check (true);
create policy "Service role all events"      on events      for all using (true) with check (true);
create policy "Service role all testimonies" on testimonies for all using (true) with check (true);
create policy "Service role all content"     on content     for all using (true) with check (true);
create policy "Service role all tithers"     on tithers     for all using (true) with check (true);

-- ── Seed: Services ───────────────────────────────────────────
insert into services (id, title, description, day, time, location, icon, sort_order) values
('celebration-service',  'Celebration Service',          'Come worship God with us every Sunday and enjoy a wonderful time in God''s presence. Ensure you bring someone along with you.',                                                                             'Every Sunday',                   '9:00 AM',           '26/28 Adewunmi Abudu Street, Ajao Estate', 'church',  1),
('prayer-counselling',   'Prayer & Counselling',         'Are you in need of counselling and prayer? Pastor Nick will be available to counsel and pray with you.',                                                                                                       'Every Monday',                   '12:00 PM – 5:00 PM','26/28 Adewunmi Abudu Street, Ajao Estate', 'hands',   2),
('school-of-ministry',   'School of Ministry',           'An interactive class where we come together and study the Word of God. Questions are asked and everyone gets an opportunity to share. Recommended for all members and intending members.',                      'Every Wednesday',                '6:00 PM',           '26/28 Adewunmi Abudu Street, Ajao Estate', 'book',    3),
('winners-hour',         'Winners Hour',                 'Dangerous prayers that provoke victory, praises that move the throne of God, testimonies that celebrate His goodness, and messages from the Word that reveal the mind of God. You do not want to miss this service.','Every Thursday',              '9:00 AM',           '26/28 Adewunmi Abudu Street, Ajao Estate', 'trophy',  4),
('night-of-wonders',     'Night of Wonders Extraordinary','Don''t miss our powerful vigil on the first Friday of every month. Come and experience the God of wonders.',                                                                                                  'First Friday of Every Month',    '10:00 PM',          '26/28 Adewunmi Abudu Street, Ajao Estate', 'star',    5),
('holy-communion',       'Holy Communion Service',       'Come join us as we partake of Christ. A sacred time of reflection, worship, and fellowship.',                                                                                                                  'Second Sunday of Every Month',   '8:00 AM',           '26/28 Adewunmi Abudu Street, Ajao Estate', 'cross',   6),
('leadership-summit',    'Leadership Summit',            'Our Sunday School. Don''t miss it as we learn at the feet of Jesus and equip ourselves for effective kingdom service.',                                                                                         'Every Sunday',                   '8:00 AM – 9:00 AM', '26/28 Adewunmi Abudu Street, Ajao Estate', 'users',   7),
('ffu',                  'Family Fellowship Unit (FFU)', 'Holds immediately after Sunday service for all members. First timers and intending members are included. A time for bonding, discipleship, and community.',                                                     'Every Sunday',                   '12:00 PM – 2:00 PM','26/28 Adewunmi Abudu Street, Ajao Estate', 'heart',   8)
on conflict (id) do nothing;

-- ── Seed: Testimonies ────────────────────────────────────────
insert into testimonies (id, title, body, author) values
('1', 'Miraculous Delivery',        'Church praise the Lord! I want to thank God Almighty for His goodness and love towards me. Three months after I got married, I didn''t know I was pregnant — I was still seeing blood as usual. On visiting the hospital, the doctor confirmed I was pregnant! During delivery, the baby went up instead of coming down, but after prayer, God intervened and I safely delivered a baby boy to the glory of God!', 'Sis. Precious'),
('2', 'Our God is a God of Surprises','In this month of favor, God has indeed favored me. The man of God declared that God was releasing car keys, and to my surprise, I got a car as a birthday gift from my husband! Within six months, God blessed me with two cars. To this great God be all the glory!', 'Sis. Stella Emmanuel'),
('3', 'Divine Turnaround',          'I came to PCM broken and without hope. But through the prayers and the Word of God preached here, God turned my situation around completely. What seemed impossible became possible. I have a testimony that will last a lifetime. Thank you Jesus!', 'Bro. Emmanuel')
on conflict (id) do nothing;

-- ── Seed: Content ────────────────────────────────────────────
insert into content (id, hero, about, giving, contact) values (
  1,
  '{
    "slides": [
      {"headline":"Experience Extra-Ordinary Grace","ctaPrimary":{"label":"About PCM","href":"/about"},"ctaSecondary":{"label":"Give","href":"/give"},"image":"/images/banner1.jpg"},
      {"headline":"Wrap Yourself In Worship & The Word","ctaPrimary":{"label":"Join Us","href":"/connect"},"ctaSecondary":{"label":"Contact","href":"/contact"},"image":"/images/banner2.jpg"},
      {"headline":"Welcome To The Canaanland","ctaPrimary":{"label":"Our Services","href":"/services"},"ctaSecondary":{"label":"Listen to Messages","href":"/sermons"},"image":"/images/banner3.jpg"}
    ]
  }',
  '{
    "headline":"Become A Part of Our Family",
    "tagline":"A community built on faith, love, and the Word of God.",
    "description":"Raising multi-cultural people with the extra-ordinary grace of prosperity of the spirit, soul and body and for the expansion of God''s Kingdom.",
    "vision":"To raise multi-cultural people with the extraordinary grace of prosperity of the spirit, soul and body, for the expansion of God''s Kingdom.",
    "mission":"We are committed to preaching the undiluted Gospel of Jesus Christ, making disciples, and demonstrating the power of the Holy Spirit to our generation and beyond.",
    "pastor":{
      "name":"Pastor Nick Medo-Uwa",
      "wife":"Pastor (Mrs.) Ebere Medo-Uwa",
      "title":"Senior Pastors",
      "image":"/images/hero-bg-3006.jpg",
      "bio":"Pastor Nick Medo-Uwa leads PCM with a heart for God''s people and a passion for the Word. Together with his wife, Pastor (Mrs.) Ebere Medo-Uwa, they lead a vibrant community of believers committed to prayer, worship, and kingdom impact."
    }
  }',
  '{
    "headline":"Support the Work of Ministry",
    "description":"Your giving fuels the expansion of God''s Kingdom. Every seed sown is an act of faith and worship.",
    "onlineGivingNote":"Online giving is coming soon. In the meantime, you can give directly via bank transfer using the details above.",
    "banks":[
      {"bank":"UBA","accountNumber":"1006178337","accountName":"Pentecostal Canaanland Mission (Project)"},
      {"bank":"FCMB","accountNumber":"3845195011","accountName":"Pentecostal Canaanland Mission"}
    ]
  }',
  '{
    "address":"26/28 Adewunmi Abudu Street, off Osolo Way, opp Mopson Pharmaceutical, by 7/8 Bus Stop, Ajao Estate, Lagos, Nigeria",
    "phones":["08034095657","08179819916","08023063895"],
    "email":"pcanaanland@yahoo.com",
    "facebook":"https://www.facebook.com/Pcanaanland/",
    "instagram":"https://www.instagram.com/pcm_ministry/",
    "youtube":"https://www.youtube.com/@pcm_ministry",
    "mapsUrl":"https://www.google.com/maps/dir/6.5136621,3.3892904/Pentecostal+Canaanland+Mission+Inc,+Adewunmi+Abudu+Street,+Lagos/@6.523369,3.3325109,13z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x103b8ffec97cef21:0xc6d2c62c04c36dca!2m2!1d3.3313295!2d6.542696"
  }'
) on conflict (id) do nothing;