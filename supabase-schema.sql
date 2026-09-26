-- ============================================================
--  ATU PQ HUB — COMPLETE SUPABASE SETUP
--  For a brand new Supabase project.
--
--  HOW TO RUN THIS:
--  1. Go to your Supabase project → left sidebar → "SQL Editor"
--  2. Click "New query"
--  3. Paste this ENTIRE file
--  4. Click "Run" (or Ctrl+Enter)
--  5. You should see "Success. No rows returned" at the bottom
--
--  This creates all 4 tables, all security rules, and the file
--  storage bucket in one go. You do not need to click around the
--  Table Editor or Storage UI to set anything up manually.
-- ============================================================


-- ============================================================
-- 1. USERS — one row per student, linked to their login account
-- ============================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  student_id  text unique not null,
  name        text,
  contact     text,
  faculty     text,
  department  text,
  level       text,
  is_admin    boolean default false,
  created_at  timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users read own profile, admins read all"
  on public.users for select
  using (
    auth.uid() = id
    or exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

create policy "Users update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users insert own profile on signup"
  on public.users for insert
  with check (auth.uid() = id);

-- ------------------------------------------------------------
-- AUTO-CREATE PROFILE ROW — fixes the old "signed up but no row
-- in users" problem for good, and lets you create an ADMIN
-- entirely from the Supabase dashboard with no SQL Editor step:
--
--   Authentication → Users → Add user
--     Email:    <studentid>@students.atupqhub.local   (lowercase)
--     Password: whatever you want them to log in with
--     User Metadata (as JSON):
--       {"student_id": "ADMIN001", "full_name": "Admin Name", "is_admin": true}
--     Auto Confirm User: ON
--
-- The trigger below fires the instant that account is created —
-- with or without metadata — and inserts the matching row in
-- public.users automatically. Leave "is_admin" out of the
-- metadata (or set it false) for a normal student account.
-- ------------------------------------------------------------
create or replace function public.pqhub_handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, student_id, name, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'student_id', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists pqhub_on_auth_user_created on auth.users;
create trigger pqhub_on_auth_user_created
  after insert on auth.users
  for each row execute function public.pqhub_handle_new_user();


-- ============================================================
-- 2. PAST_QUESTIONS — metadata for every uploaded PDF
-- ============================================================
create table if not exists public.past_questions (
  id          bigint generated always as identity primary key,
  title       text not null,
  course_code text,
  faculty     text,
  department  text,
  level       text,
  year        int4,
  file_url    text,
  file_path   text,
  downloads   int4 default 0,
  created_at  timestamptz default now()
);

-- If this table already existed before course codes were added, this
-- adds the column without touching any data you already have.
alter table public.past_questions add column if not exists course_code text;

alter table public.past_questions enable row level security;

-- Anyone can browse past questions, even logged-out visitors
create policy "Anyone can view past questions"
  on public.past_questions for select
  using (true);

-- Only admins (Moyole's account) can add, edit, or delete
create policy "Admins manage past questions"
  on public.past_questions for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));


-- ============================================================
-- 3. DOWNLOADS — logs every download, powers "My Downloads"
-- ============================================================
create table if not exists public.downloads (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  pq_id       bigint,
  pq_title    text,
  pq_faculty  text,
  created_at  timestamptz default now()
);

alter table public.downloads enable row level security;

create policy "Users see own downloads, admins see all"
  on public.downloads for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

create policy "Users log their own downloads"
  on public.downloads for insert
  with check (auth.uid() = user_id);


-- ============================================================
-- 4. PQ_REQUESTS — past questions / questions sent to the admin
-- ============================================================
create table if not exists public.pq_requests (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  message     text not null,
  type        text default 'past_question',
  status      text default 'pending',   -- 'pending' or 'answered'
  created_at  timestamptz default now()
);

alter table public.pq_requests enable row level security;

create policy "Users see own requests, admins see all"
  on public.pq_requests for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

create policy "Users insert own requests"
  on public.pq_requests for insert
  with check (auth.uid() = user_id);

create policy "Admins update any request"
  on public.pq_requests for update
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));


-- ============================================================
-- 5. STORAGE BUCKET — where the actual PDF files live
-- ============================================================
insert into storage.buckets (id, name, public)
values ('past-questions', 'past-questions', true)
on conflict (id) do nothing;

-- Anyone can view/download the files (needed so download links work
-- for visitors browsing without an account, and for logged-in students)
create policy "Public read access to past question files"
  on storage.objects for select
  using (bucket_id = 'past-questions');

-- Only admins can upload new files
create policy "Admins upload past question files"
  on storage.objects for insert
  with check (
    bucket_id = 'past-questions'
    and exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

-- Only admins can delete files
create policy "Admins delete past question files"
  on storage.objects for delete
  using (
    bucket_id = 'past-questions'
    and exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

-- ============================================================
--  DONE. Next steps (see setup.html for the full walkthrough):
--  1. Settings → Authentication → Providers → Email → turn OFF
--     "Confirm email" (required — student IDs use fake emails
--     behind the scenes and can never receive a confirmation link)
--  2. Settings → API → copy your Project URL + anon key into
--     js/pq-hub.js
--  3. Create your admin account directly in Authentication → Users
--     → Add user (see the comment above the trigger, a few lines
--     up) — no SQL Editor step needed for this part
-- ============================================================
