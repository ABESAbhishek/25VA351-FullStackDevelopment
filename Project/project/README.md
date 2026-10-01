# Northstar College Attendance Portal

A responsive, role based college attendance management portal built with React, Vite, Supabase, and PostgreSQL. Admin, teacher, and student workspaces share one application shell with route guards and database row level security.

## Features

- Supabase email/password authentication and profile based roles.
- Admin dashboards, student and subject management, class attendance, reports, and profile pages.
- Teacher access to assigned class rosters and attendance.
- Student access to their own attendance history and profile.
- Attendance marking for present, absent, and late with duplicate-safe upserts.
- Search and roster filters, threshold-based attendance reports, and client side CSV export.
- Responsive navigation, loading/error/empty states, and a sample-data demo when Supabase credentials are absent.

The demo mode is for UI demonstration only. Its role selector and sample records are not a security boundary and do not write to Supabase. Supabase RLS is the security boundary for configured deployments.

## Tech stack and architecture

- React 19 and Vite
- React Router for navigation and role-aware route guards
- Tailwind CSS Vite plugin plus application CSS for the shared design system
- Lucide React icons and Recharts visualizations
- Supabase Auth and PostgreSQL; Vercel deployment supported

Pages compose shared components from `src/components/`; `src/lib/AuthContext.jsx` handles the session and profile, `src/lib/supabase.js` creates the public client only when both Vite environment values exist, and `src/lib/utils.js` contains reusable attendance calculations and CSV export.

## Project structure

```text
src/
  components/   Navigation, tables, badges, cards, and loading/empty states
  layouts/      Authenticated dashboard shell
  lib/          Supabase client, auth context, demo fixtures, utilities
  pages/        Login, dashboard, students, subjects, attendance, reports, profile
  App.jsx       Routes and role gates
supabase/
  schema.sql    Tables, constraints, indexes, timestamps, Auth profile trigger
  policies.sql  RLS helpers and role/ownership policies
  seed.sql      Optional demo rows for pre-created Auth accounts
```

## Install and run locally

1. Install Node.js 20.19+ or 22.12+.
2. From this project directory, install dependencies and start Vite:

   ```sh
   npm install
   npm run dev
   ```

3. Open the local URL printed by Vite. Without Supabase variables, use the demo role buttons on `/login`.

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`, then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the project API settings. These are the public URL and anon/publishable key; never put a service role key in the frontend.
3. In the Supabase SQL editor, run `supabase/schema.sql`, then `supabase/policies.sql`.
4. In Authentication → Users, create accounts for your admin, teachers, and students. The Auth trigger creates a basic `profiles` row with the student role. Verify email settings or confirm the accounts in the dashboard for local demos.
5. Promote the admin and teacher profiles, and add corresponding teacher/student detail records. Example SQL (replace emails with your accounts):

   ```sql
   update public.profiles set role = 'admin' where email = 'admin@yourcollege.edu';
   update public.profiles set role = 'teacher' where email = 'teacher@yourcollege.edu';
   insert into public.teachers(profile_id, employee_id, department)
   select id, 'FAC-001', 'Computer Science' from public.profiles where email = 'teacher@yourcollege.edu';
   ```

6. Add students by first creating their Auth users, then adding `students` rows that reference their `profiles.id`. Admins can use the Students form; it requests the existing profile UUID. Assign `subjects` to teacher records, then create `classes` for subject, section, date, and time.
7. Optionally adapt the emails in `supabase/seed.sql` and run it after Auth users exist. SQL cannot safely create Supabase Auth users/passwords; create those through the dashboard or a trusted server-side admin process. Never commit real passwords or service keys.

### Database tables

`profiles`, `students`, `teachers`, `subjects`, `classes`, and `attendance`. Foreign keys protect related rows; `attendance_one_per_student_per_class` prevents duplicate marks for a student and class. Query indexes cover class date/teacher, subject assignment, student directory filters, and attendance history.

### Row level security

RLS is enabled for every table. Students read their own profile, roster details, and attendance; teachers read assigned subjects, matching rosters, and their class registers; only teachers assigned to a class can mark/update its attendance. Admins manage academic records and attendance. Client route guards improve navigation but are not a substitute for the SQL policies. Review the policies against your college's precise enrollment and data-retention rules before deployment.

## Attendance calculation

`calculateAttendancePercentage(present, total, late)` uses `(present + late) / total × 100`; a zero denominator returns zero. Late counts as attended. The report defaults to a 75% threshold: safe at or above the threshold, warning within 15 percentage points below it, and critical further below.

## Build and deploy

```sh
npm run build
npm run preview
```

For Vercel, import the repository, set the same two `VITE_SUPABASE_*` environment values for each deployment environment, and use Vite's default build output (`dist`). The included `vercel.json` rewrites app routes such as `/attendance` to `index.html`.

## Current limitations

- Demo mode intentionally uses sample data and does not save records to the database.
- Teacher profile/role setup and class session creation are performed in Supabase; a dedicated class scheduling screen is not included.
- Profile detail fields are shown read only; only the profile name can be edited.
- The dashboard's weekly trend series is sample data; attendance totals, roster summaries, and the Reports page query Supabase when configured.
