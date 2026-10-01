-- Demo seed. First create Auth users and complete their profiles using README instructions.
-- Update these example emails to match the accounts in your Supabase project.
update public.profiles set role = 'admin' where email = 'admin@northstar.edu';
update public.profiles set role = 'teacher' where email in ('priya.shah@northstar.edu','dev.iyer@northstar.edu');
update public.profiles set role = 'student' where email like 'student%@northstar.edu';

insert into public.teachers(profile_id,employee_id,department)
select id, case email when 'priya.shah@northstar.edu' then 'FAC-024' else 'FAC-031' end, 'Computer Science'
from public.profiles where email in ('priya.shah@northstar.edu','dev.iyer@northstar.edu')
on conflict (profile_id) do nothing;

insert into public.students(profile_id,roll_number,enrollment_number,branch,section,semester)
select p.id, d.roll, d.enrollment, d.branch, d.section, 3
from (values
  ('student1@northstar.edu','CS2401','NCS24A001','Computer Science','A'),
  ('student2@northstar.edu','CS2402','NCS24A002','Computer Science','A'),
  ('student3@northstar.edu','CS2403','NCS24A003','Computer Science','A'),
  ('student4@northstar.edu','CS2404','NCS24A004','Computer Science','A')
) as d(email,roll,enrollment,branch,section)
join public.profiles p on p.email=d.email
on conflict (profile_id) do nothing;

insert into public.subjects(name,code,branch,semester,section,teacher_id)
select d.name,d.code,'Computer Science',3,'A',t.id
from (values ('Web Development','CS204','priya.shah@northstar.edu'),('Database Systems','CS302','dev.iyer@northstar.edu'),('Human Computer Interaction','CS311','priya.shah@northstar.edu')) d(name,code,email)
join public.profiles p on p.email=d.email
join public.teachers t on t.profile_id=p.id
on conflict (code) do nothing;

insert into public.classes(subject_id,teacher_id,section,class_date,start_time,end_time)
select s.id,s.teacher_id,'A',current_date - day_offset, time '09:00', time '10:00'
from public.subjects s cross join (values(0),(1),(2),(3),(4)) as dates(day_offset)
where s.code in ('CS204','CS302')
on conflict (subject_id,section,class_date,start_time) do nothing;

insert into public.attendance(class_id,student_id,status,marked_by)
select c.id,st.id,
  case when st.roll_number='CS2403' and c.class_date >= current_date - 2 then 'absent'
       when st.roll_number='CS2404' and c.class_date = current_date then 'late'
       else 'present' end,
  admin.id
from public.classes c
join public.subjects su on su.id=c.subject_id
join public.students st on st.branch=su.branch and st.semester=su.semester and st.section=c.section
join public.profiles admin on admin.email='admin@northstar.edu'
where su.code in ('CS204','CS302')
on conflict (class_id,student_id) do nothing;
