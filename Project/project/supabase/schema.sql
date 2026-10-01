-- Northstar College attendance system schema (run in Supabase SQL editor).
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'student' check (role in ('admin','teacher','student')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null unique references public.profiles(id) on delete cascade,
  roll_number text not null unique, enrollment_number text not null unique, branch text not null, section text not null,
  semester smallint not null check (semester between 1 and 12), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null unique references public.profiles(id) on delete cascade,
  employee_id text not null unique, department text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(), name text not null, code text not null unique, branch text not null,
  semester smallint not null check (semester between 1 and 12), section text not null,
  teacher_id uuid references public.teachers(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(), subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete restrict, section text not null, class_date date not null,
  start_time time not null, end_time time not null, created_at timestamptz not null default now(),
  constraint classes_time_order check (end_time > start_time), constraint classes_unique_session unique (subject_id,section,class_date,start_time)
);
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(), class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null check (status in ('present','absent','late')), marked_at timestamptz not null default now(),
  marked_by uuid not null references public.profiles(id) on delete restrict,
  constraint attendance_one_per_student_per_class unique (class_id,student_id)
);

create index if not exists students_branch_section_semester_idx on public.students(branch,section,semester);
create index if not exists subjects_teacher_idx on public.subjects(teacher_id);
create index if not exists subjects_branch_semester_idx on public.subjects(branch,semester,section);
create index if not exists classes_teacher_date_idx on public.classes(teacher_id,class_date desc);
create index if not exists classes_subject_date_idx on public.classes(subject_id,class_date desc);
create index if not exists attendance_student_idx on public.attendance(student_id,marked_at desc);
create index if not exists attendance_class_status_idx on public.attendance(class_id,status);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists students_updated_at on public.students;
create trigger students_updated_at before update on public.students for each row execute function public.set_updated_at();
drop trigger if exists teachers_updated_at on public.teachers;
create trigger teachers_updated_at before update on public.teachers for each row execute function public.set_updated_at();
drop trigger if exists subjects_updated_at on public.subjects;
create trigger subjects_updated_at before update on public.subjects for each row execute function public.set_updated_at();

-- New Auth accounts receive a student profile. Admins can assign teacher/admin roles after verification.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,full_name,email,role)
  values (new.id,coalesce(new.raw_user_meta_data ->> 'full_name',split_part(new.email,'@',1)),new.email,'student')
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

grant usage on schema public to authenticated;
grant select,insert,update,delete on public.profiles,public.students,public.teachers,public.subjects,public.classes,public.attendance to authenticated;
