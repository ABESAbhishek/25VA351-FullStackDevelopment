-- Role and ownership checks run as the database owner, avoid recursive RLS lookups,
-- and are granted only to authenticated requests.
create or replace function public.current_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid())
$$;
create or replace function public.current_student_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.students where profile_id = (select auth.uid())
$$;
create or replace function public.current_teacher_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.teachers where profile_id = (select auth.uid())
$$;
create or replace function public.teacher_can_access_student(target_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.students st join public.subjects su
      on su.branch = st.branch and su.semester = st.semester and su.section = st.section
    where st.id = target_student and su.teacher_id = public.current_teacher_id()
  )
$$;
create or replace function public.student_can_access_subject(target_subject uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.students st join public.subjects su
      on su.branch = st.branch and su.semester = st.semester and su.section = st.section
    where st.id = public.current_student_id() and su.id = target_subject
  )
$$;
create or replace function public.teacher_can_access_class(target_class uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.classes cl where cl.id = target_class and cl.teacher_id = public.current_teacher_id())
$$;

revoke all on function public.current_role() from public, anon;
revoke all on function public.current_student_id() from public, anon;
revoke all on function public.current_teacher_id() from public, anon;
revoke all on function public.teacher_can_access_student(uuid) from public, anon;
revoke all on function public.student_can_access_subject(uuid) from public, anon;
revoke all on function public.teacher_can_access_class(uuid) from public, anon;
grant execute on function public.current_role(),public.current_student_id(),public.current_teacher_id(),public.teacher_can_access_student(uuid),public.student_can_access_subject(uuid),public.teacher_can_access_class(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.subjects enable row level security;
alter table public.classes enable row level security;
alter table public.attendance enable row level security;

drop policy if exists "profile read own or admin" on public.profiles;
create policy "profile read own or admin" on public.profiles for select to authenticated using (id = (select auth.uid()) or public.current_role() = 'admin' or exists (select 1 from public.students st where st.profile_id = profiles.id and public.teacher_can_access_student(st.id)));
drop policy if exists "profile update own or admin" on public.profiles;
create policy "profile update own or admin" on public.profiles for update to authenticated using (id = (select auth.uid()) or public.current_role() = 'admin') with check (public.current_role() = 'admin' or (id = (select auth.uid()) and role = public.current_role()));

drop policy if exists "student directory read permitted" on public.students;
create policy "student directory read permitted" on public.students for select to authenticated using (profile_id = (select auth.uid()) or public.current_role() = 'admin' or public.teacher_can_access_student(id));
drop policy if exists "admin manages students" on public.students;
create policy "admin manages students" on public.students for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

drop policy if exists "teacher and admin read teacher records" on public.teachers;
create policy "teacher and admin read teacher records" on public.teachers for select to authenticated using (profile_id = (select auth.uid()) or public.current_role() = 'admin' or exists (select 1 from public.subjects su where su.teacher_id = teachers.id and su.teacher_id = public.current_teacher_id()));
drop policy if exists "admin manages teachers" on public.teachers;
create policy "admin manages teachers" on public.teachers for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

drop policy if exists "subjects visible to relevant users" on public.subjects;
create policy "subjects visible to relevant users" on public.subjects for select to authenticated using (public.current_role() = 'admin' or teacher_id = public.current_teacher_id() or public.student_can_access_subject(id));
drop policy if exists "admin manages subjects" on public.subjects;
create policy "admin manages subjects" on public.subjects for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

drop policy if exists "classes visible to assigned users" on public.classes;
create policy "classes visible to assigned users" on public.classes for select to authenticated using (
  public.current_role() = 'admin' or teacher_id = public.current_teacher_id() or
  exists (select 1 from public.subjects su where su.id = classes.subject_id and public.student_can_access_subject(su.id))
);
drop policy if exists "admin manages classes" on public.classes;
create policy "admin manages classes" on public.classes for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

drop policy if exists "attendance visible to owner teacher or admin" on public.attendance;
create policy "attendance visible to owner teacher or admin" on public.attendance for select to authenticated using (
  public.current_role() = 'admin' or student_id = public.current_student_id() or
  exists (select 1 from public.classes cl where cl.id = attendance.class_id and cl.teacher_id = public.current_teacher_id())
);
drop policy if exists "teacher or admin creates class attendance" on public.attendance;
create policy "teacher or admin creates class attendance" on public.attendance for insert to authenticated with check (
  public.current_role() = 'admin' or (marked_by = (select auth.uid()) and public.teacher_can_access_class(class_id))
);
drop policy if exists "teacher or admin updates class attendance" on public.attendance;
create policy "teacher or admin updates class attendance" on public.attendance for update to authenticated using (
  public.current_role() = 'admin' or public.teacher_can_access_class(class_id)
) with check (public.current_role() = 'admin' or (marked_by = (select auth.uid()) and public.teacher_can_access_class(class_id)));
drop policy if exists "teacher or admin removes class attendance" on public.attendance;
create policy "teacher or admin removes class attendance" on public.attendance for delete to authenticated using (
  public.current_role() = 'admin' or public.teacher_can_access_class(class_id)
);
