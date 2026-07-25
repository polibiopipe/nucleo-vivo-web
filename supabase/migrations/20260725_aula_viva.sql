-- Aula Viva · Núcleo Vivo
-- Migración inicial aislada del esquema de Escucha Viva.
-- Ejecutar en Supabase SQL Editor después de revisar en un proyecto de prueba.

begin;

create extension if not exists pgcrypto;

create table if not exists public.aula_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'learner'
    check (role in ('learner', 'facilitator', 'academic_admin', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aula_courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  passing_score numeric(5,2) not null default 70 check (passing_score between 0 and 100),
  content_version text not null default '1.0',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aula_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.aula_courses(id) on delete cascade,
  slug text not null,
  position integer not null check (position > 0),
  title text not null,
  subtitle text,
  created_at timestamptz not null default now(),
  unique (course_id, slug),
  unique (course_id, position)
);

create table if not exists public.aula_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.aula_courses(id) on delete cascade,
  module_id uuid not null references public.aula_modules(id) on delete cascade,
  slug text not null,
  position integer not null check (position > 0),
  title text not null,
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  lesson_type text not null default 'learning_experience',
  is_required boolean not null default true,
  content_version text not null default '1.0',
  created_at timestamptz not null default now(),
  unique (course_id, slug),
  unique (module_id, position)
);

create table if not exists public.aula_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.aula_courses(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'completed', 'paused', 'withdrawn')),
  enrolled_at timestamptz not null default now(),
  last_accessed_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

create table if not exists public.aula_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.aula_lessons(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  percent integer not null default 0 check (percent between 0 and 100),
  response jsonb,
  confidence smallint check (confidence between 1 and 5),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.aula_consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  version text not null,
  accepted boolean not null,
  accepted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  context jsonb not null default '{}'::jsonb
);

create table if not exists public.aula_assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.aula_courses(id) on delete cascade,
  assessment_key text not null,
  attempt_number integer not null default 1 check (attempt_number > 0),
  score numeric(5,2) check (score between 0 and 100),
  evidence jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  feedback text,
  unique (user_id, course_id, assessment_key, attempt_number)
);

create table if not exists public.aula_certificates (
  id uuid primary key default gen_random_uuid(),
  verification_code text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.aula_courses(id) on delete cascade,
  certificate_type text not null check (certificate_type in ('completion', 'mastery')),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.aula_spaced_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.aula_courses(id) on delete cascade,
  review_key text not null,
  due_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'skipped')),
  completed_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  unique (user_id, course_id, review_key)
);

create index if not exists aula_enrollments_user_idx on public.aula_enrollments(user_id);
create index if not exists aula_progress_user_idx on public.aula_lesson_progress(user_id);
create index if not exists aula_progress_lesson_idx on public.aula_lesson_progress(lesson_id);
create index if not exists aula_reviews_due_idx on public.aula_spaced_reviews(user_id, due_at);
create index if not exists aula_consent_user_idx on public.aula_consent_records(user_id);

create or replace function public.aula_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists aula_profiles_touch on public.aula_profiles;
create trigger aula_profiles_touch
before update on public.aula_profiles
for each row execute function public.aula_touch_updated_at();

drop trigger if exists aula_courses_touch on public.aula_courses;
create trigger aula_courses_touch
before update on public.aula_courses
for each row execute function public.aula_touch_updated_at();

drop trigger if exists aula_progress_touch on public.aula_lesson_progress;
create trigger aula_progress_touch
before update on public.aula_lesson_progress
for each row execute function public.aula_touch_updated_at();

create or replace function public.aula_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.aula_profiles
    where id = auth.uid()
      and role in ('facilitator', 'academic_admin', 'admin')
  );
$$;

revoke all on function public.aula_is_staff() from public;
grant execute on function public.aula_is_staff() to anon, authenticated;

create or replace function public.aula_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  privacy_version text;
  accepted_at timestamptz;
begin
  insert into public.aula_profiles (id, full_name)
  values (new.id, nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''))
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.aula_profiles.full_name);

  privacy_version := nullif(new.raw_user_meta_data ->> 'aula_privacy_version', '');
  if privacy_version is not null then
    begin
      accepted_at := coalesce(
        (new.raw_user_meta_data ->> 'aula_privacy_accepted_at')::timestamptz,
        now()
      );
    exception when others then
      accepted_at := now();
    end;

    insert into public.aula_consent_records (
      user_id, consent_type, version, accepted, accepted_at, context
    )
    values (
      new.id,
      'aula_privacy',
      privacy_version,
      true,
      accepted_at,
      jsonb_build_object(
        'source', coalesce(new.raw_user_meta_data ->> 'aula_privacy_source', 'signup')
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_aula_viva on auth.users;
create trigger on_auth_user_created_aula_viva
after insert on auth.users
for each row execute function public.aula_handle_new_user();

insert into public.aula_profiles (id, full_name)
select id, nullif(trim(coalesce(raw_user_meta_data ->> 'full_name', '')), '')
from auth.users
on conflict (id) do nothing;

alter table public.aula_profiles enable row level security;
alter table public.aula_courses enable row level security;
alter table public.aula_modules enable row level security;
alter table public.aula_lessons enable row level security;
alter table public.aula_enrollments enable row level security;
alter table public.aula_lesson_progress enable row level security;
alter table public.aula_consent_records enable row level security;
alter table public.aula_assessment_attempts enable row level security;
alter table public.aula_certificates enable row level security;
alter table public.aula_spaced_reviews enable row level security;

drop policy if exists "aula profiles own select" on public.aula_profiles;
create policy "aula profiles own select"
on public.aula_profiles for select
to authenticated
using (id = auth.uid() or public.aula_is_staff());

drop policy if exists "aula profiles own update" on public.aula_profiles;
create policy "aula profiles own update"
on public.aula_profiles for update
to authenticated
using (id = auth.uid() or public.aula_is_staff())
with check (id = auth.uid() or public.aula_is_staff());

drop policy if exists "aula published courses read" on public.aula_courses;
create policy "aula published courses read"
on public.aula_courses for select
to anon, authenticated
using (status = 'published' or public.aula_is_staff());

drop policy if exists "aula staff courses manage" on public.aula_courses;
create policy "aula staff courses manage"
on public.aula_courses for all
to authenticated
using (public.aula_is_staff())
with check (public.aula_is_staff());

drop policy if exists "aula published modules read" on public.aula_modules;
create policy "aula published modules read"
on public.aula_modules for select
to anon, authenticated
using (
  exists (
    select 1 from public.aula_courses c
    where c.id = course_id and (c.status = 'published' or public.aula_is_staff())
  )
);

drop policy if exists "aula staff modules manage" on public.aula_modules;
create policy "aula staff modules manage"
on public.aula_modules for all
to authenticated
using (public.aula_is_staff())
with check (public.aula_is_staff());

drop policy if exists "aula published lessons read" on public.aula_lessons;
create policy "aula published lessons read"
on public.aula_lessons for select
to anon, authenticated
using (
  exists (
    select 1 from public.aula_courses c
    where c.id = course_id and (c.status = 'published' or public.aula_is_staff())
  )
);

drop policy if exists "aula staff lessons manage" on public.aula_lessons;
create policy "aula staff lessons manage"
on public.aula_lessons for all
to authenticated
using (public.aula_is_staff())
with check (public.aula_is_staff());

drop policy if exists "aula enrollments own select" on public.aula_enrollments;
create policy "aula enrollments own select"
on public.aula_enrollments for select
to authenticated
using (user_id = auth.uid() or public.aula_is_staff());

drop policy if exists "aula enrollments own insert" on public.aula_enrollments;
create policy "aula enrollments own insert"
on public.aula_enrollments for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.aula_courses c
    where c.id = course_id and c.status = 'published'
  )
);

drop policy if exists "aula enrollments own update" on public.aula_enrollments;
create policy "aula enrollments own update"
on public.aula_enrollments for update
to authenticated
using (user_id = auth.uid() or public.aula_is_staff())
with check (
  public.aula_is_staff()
  or (
    user_id = auth.uid()
    and exists (
      select 1 from public.aula_courses c
      where c.id = course_id and c.status = 'published'
    )
  )
);

drop policy if exists "aula progress own select" on public.aula_lesson_progress;
create policy "aula progress own select"
on public.aula_lesson_progress for select
to authenticated
using (user_id = auth.uid() or public.aula_is_staff());

drop policy if exists "aula progress own insert" on public.aula_lesson_progress;
create policy "aula progress own insert"
on public.aula_lesson_progress for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.aula_lessons l
    join public.aula_enrollments e
      on e.course_id = l.course_id
     and e.user_id = auth.uid()
     and e.status in ('active', 'completed')
    where l.id = lesson_id
  )
);

drop policy if exists "aula progress own update" on public.aula_lesson_progress;
create policy "aula progress own update"
on public.aula_lesson_progress for update
to authenticated
using (user_id = auth.uid() or public.aula_is_staff())
with check (
  public.aula_is_staff()
  or (
    user_id = auth.uid()
    and exists (
      select 1
      from public.aula_lessons l
      join public.aula_enrollments e
        on e.course_id = l.course_id
       and e.user_id = auth.uid()
       and e.status in ('active', 'completed')
      where l.id = lesson_id
    )
  )
);

drop policy if exists "aula consent own select" on public.aula_consent_records;
create policy "aula consent own select"
on public.aula_consent_records for select
to authenticated
using (user_id = auth.uid() or public.aula_is_staff());

drop policy if exists "aula consent own insert" on public.aula_consent_records;
create policy "aula consent own insert"
on public.aula_consent_records for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "aula assessment own select" on public.aula_assessment_attempts;
create policy "aula assessment own select"
on public.aula_assessment_attempts for select
to authenticated
using (user_id = auth.uid() or public.aula_is_staff());

drop policy if exists "aula assessment own insert" on public.aula_assessment_attempts;
create policy "aula assessment own insert"
on public.aula_assessment_attempts for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.aula_enrollments e
    where e.user_id = auth.uid()
      and e.course_id = public.aula_assessment_attempts.course_id
      and e.status in ('active', 'completed')
  )
);

drop policy if exists "aula staff assessment update" on public.aula_assessment_attempts;
create policy "aula staff assessment update"
on public.aula_assessment_attempts for update
to authenticated
using (public.aula_is_staff())
with check (public.aula_is_staff());

drop policy if exists "aula certificates own select" on public.aula_certificates;
create policy "aula certificates own select"
on public.aula_certificates for select
to authenticated
using (user_id = auth.uid() or public.aula_is_staff());

drop policy if exists "aula certificates staff manage" on public.aula_certificates;
create policy "aula certificates staff manage"
on public.aula_certificates for all
to authenticated
using (public.aula_is_staff())
with check (public.aula_is_staff());

drop policy if exists "aula reviews own select" on public.aula_spaced_reviews;
create policy "aula reviews own select"
on public.aula_spaced_reviews for select
to authenticated
using (user_id = auth.uid() or public.aula_is_staff());

drop policy if exists "aula reviews own update" on public.aula_spaced_reviews;
create policy "aula reviews own update"
on public.aula_spaced_reviews for update
to authenticated
using (user_id = auth.uid() or public.aula_is_staff())
with check (user_id = auth.uid() or public.aula_is_staff());

grant usage on schema public to anon, authenticated;
grant select on public.aula_courses, public.aula_modules, public.aula_lessons to anon, authenticated;
grant insert, update, delete on public.aula_courses, public.aula_modules, public.aula_lessons to authenticated;
revoke all on public.aula_profiles from anon, authenticated;
grant select on public.aula_profiles to authenticated;
grant update (full_name) on public.aula_profiles to authenticated;
grant select, insert, update on public.aula_enrollments to authenticated;
grant select, insert, update on public.aula_lesson_progress to authenticated;
grant select, insert on public.aula_consent_records to authenticated;
grant select, insert, update on public.aula_assessment_attempts to authenticated;
grant select, insert, update, delete on public.aula_certificates to authenticated;
grant select, update on public.aula_spaced_reviews to authenticated;

insert into public.aula_courses (
  slug, title, subtitle, description, status, estimated_minutes,
  passing_score, content_version, published_at
)
values (
  'ia-con-criterio-humano',
  'IA con criterio humano',
  'Productividad, seguridad y decisiones responsables en el trabajo',
  'Curso premium sobre productividad, seguridad, privacidad, verificación y responsabilidad humana en el uso laboral de inteligencia artificial.',
  'published',
  420,
  70,
  '1.0',
  now()
)
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  status = excluded.status,
  estimated_minutes = excluded.estimated_minutes,
  passing_score = excluded.passing_score,
  content_version = excluded.content_version,
  published_at = coalesce(public.aula_courses.published_at, excluded.published_at);

insert into public.aula_modules (course_id, slug, position, title, subtitle)
values
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  'm0', 1, 'Orientación y diagnóstico', 'Aprender sin vigilancia ni datos reales'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  'm1', 2, 'IA, capacidad y límite', 'Comprender antes de delegar'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  'm2', 3, 'Marco VALOR', 'Elegir una tarea que sí conviene aumentar'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  'm3', 4, 'Marco CLARO', 'Dar contexto sin entregar información indebida'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  'm4', 5, 'Marco VERIFICA', 'Confiar después de comprobar'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  'm5', 6, 'Datos, privacidad y autoría', 'Usar menos información y con más control'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  'm6', 7, 'Marco DETENER', 'Fraude, manipulación e incidentes'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  'm7', 8, 'Sesgos y supervisión', 'Proteger oportunidades y dignidad'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  'm8', 9, 'Mi flujo responsable', 'Integrar, demostrar y transferir'
)
on conflict (course_id, slug) do update set
  position = excluded.position,
  title = excluded.title,
  subtitle = excluded.subtitle;

insert into public.aula_lessons (
  course_id, module_id, slug, position, title, estimated_minutes,
  lesson_type, is_required, content_version
)
values
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm0'),
  'm0-l1', 1, 'Una decisión antes de comenzar', 4, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm0'),
  'm0-l2', 2, 'Cómo aprenderemos', 6, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm1'),
  'm1-l1', 1, 'Qué hace realmente una IA generativa', 14, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm1'),
  'm1-l2', 2, 'La responsabilidad sigue siendo humana', 12, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm2'),
  'm2-l1', 1, 'VALOR: antes de usar la herramienta', 18, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm2'),
  'm2-l2', 2, 'Cuándo no conviene usar IA', 12, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm3'),
  'm3-l1', 1, 'CLARO: instrucciones revisables', 20, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm3'),
  'm3-l2', 2, 'Alternativas, no una respuesta única', 14, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm4'),
  'm4-l1', 1, 'VERIFICA: auditoría cotidiana', 22, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm4'),
  'm4-l2', 2, 'Escalar la revisión', 12, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm5'),
  'm5-l1', 1, 'Datos que no deben copiarse sin autorización', 22, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm5'),
  'm5-l2', 2, 'Citar no significa tener licencia', 16, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm6'),
  'm6-l1', 1, 'DETENER una solicitud sospechosa', 20, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm6'),
  'm6-l2', 2, 'Aprender del incidente sin culpabilizar', 14, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm7'),
  'm7-l1', 1, 'Cuando una recomendación afecta a personas', 20, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm7'),
  'm7-l2', 2, 'Conversar el cambio sin instalar miedo', 15, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm8'),
  'm8-l1', 1, 'Diseña tu flujo', 35, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm8'),
  'm8-l2', 2, 'Plan de transferencia a 30 días', 18, 'learning_experience', true, '1.0'
),
(
  (select id from public.aula_courses where slug = 'ia-con-criterio-humano'),
  (select id from public.aula_modules where course_id = (select id from public.aula_courses where slug = 'ia-con-criterio-humano') and slug = 'm8'),
  'm8-l3', 3, 'Cierre y compromiso de criterio', 10, 'learning_experience', true, '1.0'
)
on conflict (course_id, slug) do update set
  module_id = excluded.module_id,
  position = excluded.position,
  title = excluded.title,
  estimated_minutes = excluded.estimated_minutes,
  lesson_type = excluded.lesson_type,
  is_required = excluded.is_required,
  content_version = excluded.content_version;

commit;
