-- Aula Viva · Núcleo Vivo
-- Revisión interna y seguridad editorial para cursos.
-- Referencia de compatibilidad: supabase/migrations/20260725_aula_viva.sql

begin;

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated;

alter table public.aula_courses
  add column if not exists editorial_status text;

alter table public.aula_courses
  add column if not exists catalog_visibility text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'aula_courses_editorial_status_check'
  ) THEN
    ALTER TABLE public.aula_courses
      ADD CONSTRAINT aula_courses_editorial_status_check
      CHECK (editorial_status in ('draft', 'internal_review', 'changes_requested', 'approved', 'published', 'archived'));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'aula_courses_catalog_visibility_check'
  ) THEN
    ALTER TABLE public.aula_courses
      ADD CONSTRAINT aula_courses_catalog_visibility_check
      CHECK (catalog_visibility in ('hidden', 'coming_soon', 'available'));
  END IF;
END
$$;

alter table public.aula_courses
  alter column editorial_status set default 'draft';

alter table public.aula_courses
  alter column catalog_visibility set default 'hidden';

update public.aula_courses
set editorial_status = coalesce(editorial_status, 'draft')
where editorial_status is null;

update public.aula_courses
set catalog_visibility = coalesce(catalog_visibility, 'hidden')
where catalog_visibility is null;

create table if not exists public.aula_course_versions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.aula_courses(id) on delete cascade,
  version_number text not null,
  editorial_status text not null check (editorial_status in ('draft', 'internal_review', 'changes_requested', 'approved', 'published', 'archived')),
  changelog text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  submitted_for_review_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  is_current boolean not null default false,
  unique (course_id, version_number)
);

create unique index if not exists aula_course_versions_current_idx
on public.aula_course_versions (course_id)
where is_current = true;

create table if not exists public.aula_course_reviewers (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.aula_courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reviewer_type text not null check (reviewer_type in ('academic', 'experience', 'legal', 'accessibility', 'general')),
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  is_active boolean not null default true,
  unique (course_id, user_id, reviewer_type)
);

create table if not exists public.aula_lesson_versions (
  id uuid primary key default gen_random_uuid(),
  course_version_id uuid not null references public.aula_course_versions(id) on delete cascade,
  lesson_id uuid not null references public.aula_lessons(id) on delete cascade,
  title text not null,
  summary text,
  content_json jsonb not null default '{}'::jsonb,
  activity_json jsonb not null default '{}'::jsonb,
  feedback_json jsonb not null default '{}'::jsonb,
  references_json jsonb not null default '[]'::jsonb,
  estimated_minutes integer,
  content_status text not null check (content_status in ('draft', 'internal_review', 'changes_requested', 'approved', 'published', 'archived')),
  checksum text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_version_id, lesson_id)
);

create table if not exists public.aula_review_feedback (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.aula_courses(id) on delete cascade,
  course_version_id uuid not null references public.aula_course_versions(id) on delete cascade,
  module_id uuid,
  lesson_id uuid,
  lesson_version_id uuid,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  severity text not null,
  comment text not null,
  proposed_change text,
  status text not null default 'open',
  resolution text,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.aula_review_activity (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid references public.aula_review_feedback(id) on delete cascade,
  course_version_id uuid references public.aula_course_versions(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  previous_status text,
  new_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists aula_course_versions_course_idx on public.aula_course_versions(course_id);
create index if not exists aula_course_reviewers_user_idx on public.aula_course_reviewers(user_id);
create index if not exists aula_lesson_versions_course_version_idx on public.aula_lesson_versions(course_version_id);
create index if not exists aula_review_feedback_course_idx on public.aula_review_feedback(course_id);
create index if not exists aula_review_activity_actor_idx on public.aula_review_activity(actor_id);

create or replace function private.aula_is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.aula_profiles
    where id = auth.uid()
      and role in ('academic_admin', 'admin')
  );
$$;

create or replace function private.aula_is_course_reviewer(target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.aula_course_reviewers
      where course_id = $1
        and user_id = auth.uid()
        and is_active = true
    );
$$;

create or replace function private.aula_can_review_version(target_version_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select private.aula_is_admin()
    or exists (
      select 1
      from public.aula_course_versions v
      join public.aula_course_reviewers r on r.course_id = v.course_id
      where v.id = $1
        and r.user_id = auth.uid()
        and r.is_active = true
    );
$$;

create or replace function private.aula_can_access_lesson_version(target_lesson_version_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.aula_lesson_versions lv
      join public.aula_course_versions cv on cv.id = lv.course_version_id
      join public.aula_courses c on c.id = cv.course_id
      join public.aula_enrollments e on e.course_id = c.id
      where lv.id = $1
        and c.status = 'published'
        and c.editorial_status = 'published'
        and cv.is_current = true
        and cv.editorial_status = 'published'
        and e.user_id = auth.uid()
        and e.status in ('active', 'completed')
    );
$$;

revoke all on function private.aula_is_admin() from public;
revoke all on function private.aula_is_admin() from anon;
grant execute on function private.aula_is_admin() to authenticated;

revoke all on function private.aula_is_course_reviewer(uuid) from public;
revoke all on function private.aula_is_course_reviewer(uuid) from anon;
grant execute on function private.aula_is_course_reviewer(uuid) to authenticated;

revoke all on function private.aula_can_review_version(uuid) from public;
revoke all on function private.aula_can_review_version(uuid) from anon;
grant execute on function private.aula_can_review_version(uuid) to authenticated;

revoke all on function private.aula_can_access_lesson_version(uuid) from public;
revoke all on function private.aula_can_access_lesson_version(uuid) from anon;
grant execute on function private.aula_can_access_lesson_version(uuid) to authenticated;

alter table public.aula_course_versions enable row level security;
alter table public.aula_course_reviewers enable row level security;
alter table public.aula_lesson_versions enable row level security;
alter table public.aula_review_feedback enable row level security;
alter table public.aula_review_activity enable row level security;

alter table public.aula_course_versions force row level security;
alter table public.aula_course_reviewers force row level security;
alter table public.aula_lesson_versions force row level security;
alter table public.aula_review_feedback force row level security;
alter table public.aula_review_activity force row level security;

create policy "aula-course-versions-admin-manage"
on public.aula_course_versions for all
to authenticated
using (private.aula_is_admin())
with check (private.aula_is_admin());

create policy "aula-course-versions-reviewer-read"
on public.aula_course_versions for select
to authenticated
using (private.aula_can_review_version(id));

create policy "aula-course-reviewers-admin-manage"
on public.aula_course_reviewers for all
to authenticated
using (private.aula_is_admin())
with check (private.aula_is_admin());

create policy "aula-course-reviewers-reviewer-read"
on public.aula_course_reviewers for select
to authenticated
using (private.aula_is_course_reviewer(course_id));

create policy "aula-lesson-versions-admin-manage"
on public.aula_lesson_versions for all
to authenticated
using (private.aula_is_admin())
with check (private.aula_is_admin());

create policy "aula-lesson-versions-reviewer-read"
on public.aula_lesson_versions for select
to authenticated
using (
  exists (
    select 1
    from public.aula_course_versions cv
    join public.aula_course_reviewers cr on cr.course_id = cv.course_id
    where cv.id = public.aula_lesson_versions.course_version_id
      and cr.user_id = auth.uid()
      and cr.is_active = true
  )
);

create policy "aula-lesson-versions-student-read"
on public.aula_lesson_versions for select
to authenticated
using (private.aula_can_access_lesson_version(id));

create policy "aula-review-feedback-admin-manage"
on public.aula_review_feedback for all
to authenticated
using (private.aula_is_admin())
with check (private.aula_is_admin());

create policy "aula-review-feedback-reviewer-insert"
on public.aula_review_feedback for insert
to authenticated
with check (
  reviewer_id = auth.uid()
  and private.aula_is_course_reviewer(course_id)
);

create policy "aula-review-feedback-reviewer-read"
on public.aula_review_feedback for select
to authenticated
using (
  private.aula_is_admin()
  or exists (
    select 1
    from public.aula_course_reviewers r
    where r.course_id = public.aula_review_feedback.course_id
      and r.user_id = auth.uid()
      and r.is_active = true
  )
);

create policy "aula-review-activity-admin-manage"
on public.aula_review_activity for all
to authenticated
using (private.aula_is_admin())
with check (private.aula_is_admin());

create policy "aula-review-activity-reviewer-read"
on public.aula_review_activity for select
to authenticated
using (
  private.aula_is_admin()
  or exists (
    select 1
    from public.aula_review_feedback rf
    join public.aula_course_reviewers r on r.course_id = rf.course_id
    where rf.id = public.aula_review_activity.feedback_id
      and r.user_id = auth.uid()
      and r.is_active = true
  )
);

create or replace function private.aula_protect_course_editorial_fields()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if (old.editorial_status is distinct from new.editorial_status)
     or (old.catalog_visibility is distinct from new.catalog_visibility) then
    if not private.aula_is_admin() then
      raise exception 'Only admins may change editorial_status or catalog_visibility';
    end if;
  end if;
  return new;
end;
$$;

create trigger aula_courses_editorial_guard
before update on public.aula_courses
for each row execute function private.aula_protect_course_editorial_fields();

create or replace function private.aula_protect_review_feedback_fields()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if not private.aula_is_admin() then
    if old.course_id is distinct from new.course_id
      or old.course_version_id is distinct from new.course_version_id
      or old.module_id is distinct from new.module_id
      or old.lesson_id is distinct from new.lesson_id
      or old.lesson_version_id is distinct from new.lesson_version_id
      or old.reviewer_id is distinct from new.reviewer_id
      or old.category is distinct from new.category
      or old.severity is distinct from new.severity
      or old.comment is distinct from new.comment
      or old.proposed_change is distinct from new.proposed_change
      or old.resolution is distinct from new.resolution
      or old.resolved_by is distinct from new.resolved_by then
      raise exception 'Review feedback fields are immutable for non-admin users';
    end if;
  end if;
  return new;
end;
$$;

create trigger aula_review_feedback_protect_fields
before update on public.aula_review_feedback
for each row execute function private.aula_protect_review_feedback_fields();

create or replace function private.aula_log_course_version_status()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if old.editorial_status is distinct from new.editorial_status then
    insert into public.aula_review_activity (
      course_version_id,
      actor_id,
      action,
      previous_status,
      new_status,
      metadata
    ) values (
      new.id,
      auth.uid(),
      'course_version_status_changed',
      old.editorial_status,
      new.editorial_status,
      jsonb_build_object('course_id', new.course_id)
    );
  end if;
  return new;
end;
$$;

create trigger aula_course_version_status_changed
after update on public.aula_course_versions
for each row execute function private.aula_log_course_version_status();

create or replace function private.aula_log_review_feedback_activity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.aula_review_activity (
      feedback_id,
      course_version_id,
      actor_id,
      action,
      previous_status,
      new_status,
      metadata
    ) values (
      new.id,
      new.course_version_id,
      auth.uid(),
      'review_feedback_created',
      null,
      new.status,
      jsonb_build_object('course_id', new.course_id, 'reviewer_id', new.reviewer_id)
    );
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.aula_review_activity (
      feedback_id,
      course_version_id,
      actor_id,
      action,
      previous_status,
      new_status,
      metadata
    ) values (
      new.id,
      new.course_version_id,
      auth.uid(),
      'review_feedback_status_changed',
      old.status,
      new.status,
      jsonb_build_object('course_id', new.course_id, 'reviewer_id', new.reviewer_id)
    );
  end if;

  return new;
end;
$$;

create trigger aula_review_feedback_created
after insert on public.aula_review_feedback
for each row execute function private.aula_log_review_feedback_activity();

create trigger aula_review_feedback_status_changed
after update on public.aula_review_feedback
for each row execute function private.aula_log_review_feedback_activity();

insert into public.aula_courses (
  slug,
  title,
  subtitle,
  description,
  status,
  editorial_status,
  catalog_visibility,
  estimated_minutes,
  passing_score,
  content_version
)
values
  ('ia-con-criterio-humano', 'IA con criterio humano', 'Productividad, seguridad y decisiones responsables', 'Curso base de revisión interna para el aula.', 'published', 'published', 'available', 420, 70, '1.0'),
  ('datos-con-criterio', 'Datos con criterio', 'Privacidad, inteligencia artificial y decisiones responsables', 'Curso de revisión interna para datos y criterio.', 'draft', 'internal_review', 'coming_soon', 180, 70, '1.0'),
  ('convivencia-segura', 'Convivencia segura', 'Prevenir y actuar frente al acoso y la violencia en el trabajo', 'Curso de revisión interna para convivencia y seguridad.', 'draft', 'internal_review', 'coming_soon', 210, 70, '1.0'),
  ('no-caigas', 'No caigas', 'Ciberseguridad cotidiana, fraude y suplantación con IA', 'Curso de revisión interna para ciberseguridad cotidiana.', 'draft', 'internal_review', 'hidden', 240, 70, '1.0'),
  ('trabajo-sostenible', 'Trabajo sostenible', 'Riesgos psicosociales, carga laboral y recuperación', 'Curso de revisión interna para trabajo sostenible.', 'draft', 'internal_review', 'hidden', 200, 70, '1.0'),
  ('liderar-la-transformacion', 'Liderar la transformación', 'Introducir tecnología sin perder a las personas', 'Curso de revisión interna para transformación.', 'draft', 'internal_review', 'hidden', 220, 70, '1.0'),
  ('conversaciones-que-cuidan-y-movilizan', 'Conversaciones que cuidan y movilizan', 'Feedback, límites y conversaciones difíciles', 'Curso de revisión interna para conversaciones y cuidado.', 'draft', 'internal_review', 'hidden', 260, 70, '1.0')
on conflict (slug) do nothing;

insert into public.aula_course_versions (
  course_id,
  version_number,
  editorial_status,
  changelog,
  created_by,
  is_current
)
select id, '1.0', 'published', 'Versión inicial publicada del curso base.', null, true
from public.aula_courses
where slug = 'ia-con-criterio-humano'
on conflict (course_id, version_number) do nothing;

insert into public.aula_course_versions (
  course_id,
  version_number,
  editorial_status,
  changelog,
  created_by,
  is_current
)
select id, '0.1', 'internal_review', 'Versión inicial de revisión interna.', null, true
from public.aula_courses
where slug in (
  'datos-con-criterio',
  'convivencia-segura',
  'no-caigas',
  'trabajo-sostenible',
  'liderar-la-transformacion',
  'conversaciones-que-cuidan-y-movilizan'
)
on conflict (course_id, version_number) do nothing;

commit;
