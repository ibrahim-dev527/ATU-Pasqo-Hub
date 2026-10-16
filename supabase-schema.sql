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

-- ------------------------------------------------------------
-- ADMIN CHECK (SECURITY DEFINER): lets policies ask "is this
-- person an admin?" without the policy recursing into itself.
-- ------------------------------------------------------------
create or replace function public.pqhub_is_admin()
returns boolean as $$
  select coalesce((select is_admin from public.users where id = auth.uid()), false);
$$ language sql stable security definer set search_path = public;

-- ------------------------------------------------------------
-- ADMIN-ESCALATION GUARD: nobody can make themselves an admin.
-- Through the website, is_admin can only be changed by someone who
-- is ALREADY an admin. Changes made in the Supabase dashboard
-- (Table Editor) are allowed, because they are not website calls.
-- ------------------------------------------------------------
create or replace function public.pqhub_guard_is_admin()
returns trigger as $$
begin
  if auth.uid() is not null and not public.pqhub_is_admin() then
    if tg_op = 'INSERT' then
      new.is_admin := false;
    else
      new.is_admin := old.is_admin;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists pqhub_guard_is_admin_trg on public.users;
create trigger pqhub_guard_is_admin_trg
  before insert or update on public.users
  for each row execute function public.pqhub_guard_is_admin();

drop policy if exists "Users read own profile, admins read all" on public.users;
create policy "Users read own profile, admins read all"
  on public.users for select
  using (
    auth.uid() = id
    or public.pqhub_is_admin()
  );

drop policy if exists "Users update own profile" on public.users;
create policy "Users update own profile"
  on public.users for update
  using (auth.uid() = id);

drop policy if exists "Users insert own profile on signup" on public.users;
create policy "Users insert own profile on signup"
  on public.users for insert
  with check (auth.uid() = id);

-- ------------------------------------------------------------
-- AUTO-CREATE PROFILE ROW: every new login account gets its
-- matching public.users row automatically, always as a NORMAL
-- student (is_admin = false). Signup metadata is never trusted
-- for admin rights, because anyone can send metadata.
--
-- HOW TO MAKE AN ADMIN (no SQL needed):
--   1. Authentication > Users > Add user
--        Email:    <id>@students.atupqhub.local  (lowercase)
--        Password: their password
--        Auto Confirm User: ON
--      (the row in "users" appears by itself)
--   2. Table Editor > users > find that row > tick is_admin > Save
-- Repeat for as many admins as you like. Untick to remove one.
-- ------------------------------------------------------------
create or replace function public.pqhub_handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, student_id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'student_id', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', '')
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
drop policy if exists "Anyone can view past questions" on public.past_questions;
create policy "Anyone can view past questions"
  on public.past_questions for select
  using (true);

-- Only admins (Moyole's account) can add, edit, or delete
drop policy if exists "Admins manage past questions" on public.past_questions;
create policy "Admins manage past questions"
  on public.past_questions for all
  using (public.pqhub_is_admin())
  with check (public.pqhub_is_admin());


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

drop policy if exists "Users see own downloads, admins see all" on public.downloads;
create policy "Users see own downloads, admins see all"
  on public.downloads for select
  using (
    auth.uid() = user_id
    or public.pqhub_is_admin()
  );

drop policy if exists "Users log their own downloads" on public.downloads;
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

drop policy if exists "Users see own requests, admins see all" on public.pq_requests;
create policy "Users see own requests, admins see all"
  on public.pq_requests for select
  using (
    auth.uid() = user_id
    or public.pqhub_is_admin()
  );

drop policy if exists "Users insert own requests" on public.pq_requests;
create policy "Users insert own requests"
  on public.pq_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admins update any request" on public.pq_requests;
create policy "Admins update any request"
  on public.pq_requests for update
  using (public.pqhub_is_admin());


-- ============================================================
-- 5. STORAGE BUCKET — where the actual PDF files live
-- ============================================================
insert into storage.buckets (id, name, public)
values ('past-questions', 'past-questions', true)
on conflict (id) do nothing;

-- Anyone can view/download the files (needed so download links work
-- for visitors browsing without an account, and for logged-in students)
drop policy if exists "Public read access to past question files" on storage.objects;
create policy "Public read access to past question files"
  on storage.objects for select
  using (bucket_id = 'past-questions');

-- Only admins can upload new files
drop policy if exists "Admins upload past question files" on storage.objects;
create policy "Admins upload past question files"
  on storage.objects for insert
  with check (
    bucket_id = 'past-questions'
    and public.pqhub_is_admin()
  );

-- Only admins can delete files
drop policy if exists "Admins delete past question files" on storage.objects;
create policy "Admins delete past question files"
  on storage.objects for delete
  using (
    bucket_id = 'past-questions'
    and public.pqhub_is_admin()
  );

-- ============================================================
--  DONE. Next steps (see setup.html for the full walkthrough):
--  1. Settings → Authentication → Providers → Email → turn OFF
--     "Confirm email" (required — student IDs use fake emails
--     behind the scenes and can never receive a confirmation link)
--  2. Settings → API → copy your Project URL + anon key into
--     js/pq-hub.js
--  3. Create admins: Authentication > Users > Add user, then tick
--     is_admin on their row in Table Editor > users (see the
--     comment above the trigger). No SQL needed.
-- ============================================================
