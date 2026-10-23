-- ============================================================
--  ATU PQ HUB: COMPLETE CLEAN SETUP (run this ONE file)
--
--  This version FIRST wipes every old rule, trigger and helper
--  function that earlier SQL files created, then rebuilds
--  everything from scratch. It KEEPS your data (past questions,
--  students, downloads, requests, uploaded files).
--
--  HOW TO RUN:
--  1. Supabase > SQL Editor > New query
--  2. Paste this ENTIRE file
--  3. Find the line near the bottom that says
--       admin_email text := 'atupasqo@gmail.com';
--     (already set to atupasqo@gmail.com, change it only if needed)
--  4. Tap Run. If Supabase warns about "destructive" or "drop"
--     statements, tap "Run this query" anyway. That is the clean up.
--  5. The result at the bottom should say Success
-- ============================================================


-- ============================================================
-- 0. CLEAN UP: remove every old policy, trigger and function
-- ============================================================
do $$
declare r record;
begin
  for r in
    select policyname, schemaname, tablename from pg_policies
    where (schemaname = 'public' and tablename in ('users','past_questions','downloads','pq_requests','site_settings'))
       or (schemaname = 'storage' and tablename = 'objects'
           and (policyname ilike '%past question%' or qual ilike '%past-questions%' or with_check ilike '%past-questions%'
               or qual ilike '%site-assets%' or with_check ilike '%site-assets%'))
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

drop trigger if exists pqhub_on_auth_user_created on auth.users;
drop trigger if exists pqhub_guard_is_admin_trg on public.users;
drop function if exists public.pqhub_handle_new_user() cascade;
drop function if exists public.pqhub_guard_is_admin() cascade;
drop function if exists public.pqhub_is_admin() cascade;
drop function if exists public.pqhub_increment_download(bigint) cascade;


-- ============================================================
-- 1. TABLES
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
alter table public.past_questions add column if not exists course_code text;

create table if not exists public.downloads (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  pq_id       bigint,
  pq_title    text,
  pq_faculty  text,
  created_at  timestamptz default now()
);

create table if not exists public.pq_requests (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  message     text not null,
  type        text default 'past_question',
  status      text default 'pending',
  created_at  timestamptz default now()
);

create table if not exists public.site_settings (
  key         text primary key check (char_length(key) <= 60),
  value       text not null default '' check (char_length(value) <= 2000),
  updated_at  timestamptz default now()
);

alter table public.users           enable row level security;
alter table public.past_questions  enable row level security;
alter table public.downloads       enable row level security;
alter table public.pq_requests     enable row level security;
alter table public.site_settings   enable row level security;


-- ============================================================
-- 2. HELPER FUNCTIONS
-- ============================================================

-- "Is the person making this request an admin?"
-- SECURITY DEFINER means it reads the users
-- table directly and can never loop back into the rules.
create or replace function public.pqhub_is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return coalesce((select is_admin from public.users where id = auth.uid()), false);
end;
$$;

-- Nobody can make themselves an admin from the website. Only an
-- existing admin (or you, inside the Supabase dashboard) can
-- change is_admin.
create or replace function public.pqhub_guard_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
$$;

create trigger pqhub_guard_is_admin_trg
  before insert or update on public.users
  for each row execute function public.pqhub_guard_is_admin();

-- Every new login account automatically gets a row in "users",
-- always as a normal student. (Admin rights are given separately.)
create or replace function public.pqhub_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, student_id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'student_id', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict do nothing;
  return new;
end;
$$;

create trigger pqhub_on_auth_user_created
  after insert on auth.users
  for each row execute function public.pqhub_handle_new_user();

-- Students cannot edit past_questions directly, so counting a download
-- goes through this one narrow function (signed-in people only, +1 only).
create or replace function public.pqhub_increment_download(p_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return; end if;
  update public.past_questions set downloads = coalesce(downloads, 0) + 1 where id = p_id;
end;
$$;
revoke all on function public.pqhub_increment_download(bigint) from public, anon;
grant execute on function public.pqhub_increment_download(bigint) to authenticated;

-- Create the missing "users" row for accounts that already exist
insert into public.users (id, student_id, name)
select au.id,
       coalesce(au.raw_user_meta_data->>'student_id', split_part(au.email, '@', 1)),
       coalesce(au.raw_user_meta_data->>'full_name', '')
from auth.users au
where not exists (select 1 from public.users u where u.id = au.id)
on conflict do nothing;


-- ============================================================
-- 3. SECURITY RULES (row level security)
-- ============================================================

-- USERS
create policy "users_select" on public.users for select
  using (auth.uid() = id or public.pqhub_is_admin());
create policy "users_insert_own" on public.users for insert
  with check (auth.uid() = id);
create policy "users_update_own" on public.users for update
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "users_update_admin" on public.users for update
  using (public.pqhub_is_admin()) with check (public.pqhub_is_admin());

-- PAST QUESTIONS: anyone can browse, only admins change
create policy "pq_select_all" on public.past_questions for select
  using (true);
create policy "pq_admin_all" on public.past_questions for all
  using (public.pqhub_is_admin()) with check (public.pqhub_is_admin());

-- DOWNLOADS
create policy "downloads_select" on public.downloads for select
  using (auth.uid() = user_id or public.pqhub_is_admin());
create policy "downloads_insert_own" on public.downloads for insert
  with check (auth.uid() = user_id);

-- REQUESTS
create policy "requests_select" on public.pq_requests for select
  using (auth.uid() = user_id or public.pqhub_is_admin());
create policy "requests_insert_own" on public.pq_requests for insert
  with check (auth.uid() = user_id);
create policy "requests_update_admin" on public.pq_requests for update
  using (public.pqhub_is_admin());

-- SITE SETTINGS: anyone reads, only admins change
create policy "settings_select_all" on public.site_settings for select
  using (true);
create policy "settings_admin_all" on public.site_settings for all
  using (public.pqhub_is_admin()) with check (public.pqhub_is_admin());


-- ============================================================
-- 4. STORAGE
--    past-questions = PRIVATE bucket. Only signed-in people can
--                     open or download the PDFs.
--    site-assets    = PUBLIC bucket for the logo, pop-up flyer
--                     and other pictures shown on the website.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('past-questions', 'past-questions', false)
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = true;

-- PDFs: signed-in people only
create policy "pdf_read_signed_in" on storage.objects for select
  using (bucket_id = 'past-questions' and auth.uid() is not null);
create policy "pdf_admin_insert" on storage.objects for insert
  with check (bucket_id = 'past-questions' and public.pqhub_is_admin());
create policy "pdf_admin_update" on storage.objects for update
  using (bucket_id = 'past-questions' and public.pqhub_is_admin());
create policy "pdf_admin_delete" on storage.objects for delete
  using (bucket_id = 'past-questions' and public.pqhub_is_admin());

-- Website pictures: anyone can see, only admins change
create policy "assets_public_read" on storage.objects for select
  using (bucket_id = 'site-assets');
create policy "assets_admin_insert" on storage.objects for insert
  with check (bucket_id = 'site-assets' and public.pqhub_is_admin());
create policy "assets_admin_update" on storage.objects for update
  using (bucket_id = 'site-assets' and public.pqhub_is_admin());
create policy "assets_admin_delete" on storage.objects for delete
  using (bucket_id = 'site-assets' and public.pqhub_is_admin());


-- ============================================================
-- 5. MAKE YOUR FIRST ADMIN
--    Put the email of the account you created in
--    Authentication > Users between the quotes below.
-- ============================================================
do $$
declare
  admin_email text := 'atupasqo@gmail.com';
  n int;
begin
  if admin_email = 'YOUR_EMAIL_HERE' then
    raise notice 'No admin email set. Edit the admin_email line and run again to create your admin.';
    return;
  end if;
  update public.users set is_admin = true
  where id = (select id from auth.users where lower(email) = lower(admin_email));
  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'No account found for %. Check the spelling against Authentication > Users.', admin_email;
  end if;
end $$;


-- ============================================================
--  DONE.
--  Also check: Authentication > Providers > Email > "Confirm email"
--  must be OFF.
--  More admins later: sign in at admin.html, add the person in
--  Authentication > Users (Auto Confirm ON), then open
--  All Students and tap "Make admin".
-- ============================================================
