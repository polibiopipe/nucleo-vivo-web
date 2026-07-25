-- Rollback de Aula Viva para staging
-- ADVERTENCIA: ejecutar únicamente en una base de datos de staging, con backup previo y
-- revisión explícita del estado actual de los datos.
-- No se utiliza RESET, DROP SCHEMA ... CASCADE ni eliminación de auth.users.
-- Este script elimina políticas, triggers, grants, funciones y tablas de Aula Viva
-- en orden seguro de dependencias. Si el entorno no se identifica como staging, aborta.

begin;

do $$
begin
  if current_database() !~* 'staging' then
    raise exception 'Este rollback está pensado exclusivamente para bases de datos de staging. Abortando.';
  end if;
end
$$;

-- 1) Eliminar políticas antes que tablas.
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'aula_profiles',
        'aula_courses',
        'aula_modules',
        'aula_lessons',
        'aula_enrollments',
        'aula_lesson_progress',
        'aula_consent_records',
        'aula_assessment_attempts',
        'aula_certificates',
        'aula_spaced_reviews'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      r.policyname,
      r.schemaname,
      r.tablename
    );
  end loop;
end
$$;

-- 2) Eliminar triggers antes que funciones.
drop trigger if exists aula_profiles_touch on public.aula_profiles;
drop trigger if exists aula_courses_touch on public.aula_courses;
drop trigger if exists aula_progress_touch on public.aula_lesson_progress;
drop trigger if exists on_auth_user_created_aula_viva on auth.users;

-- 3) Revocar grants asociados antes de borrar objetos.
revoke all on table public.aula_profiles from authenticated, anon, public;
revoke all on table public.aula_courses from authenticated, anon, public;
revoke all on table public.aula_modules from authenticated, anon, public;
revoke all on table public.aula_lessons from authenticated, anon, public;
revoke all on table public.aula_enrollments from authenticated, anon, public;
revoke all on table public.aula_lesson_progress from authenticated, anon, public;
revoke all on table public.aula_consent_records from authenticated, anon, public;
revoke all on table public.aula_assessment_attempts from authenticated, anon, public;
revoke all on table public.aula_certificates from authenticated, anon, public;
revoke all on table public.aula_spaced_reviews from authenticated, anon, public;

do $$
begin
  if to_regprocedure('private.aula_is_staff()') is not null then
    revoke all on function private.aula_is_staff() from authenticated, anon, public;
  end if;
end
$$;

do $$
begin
  if to_regprocedure('public.aula_handle_new_user()') is not null then
    revoke all on function public.aula_handle_new_user() from authenticated, anon, public;
  end if;
end
$$;

do $$
begin
  if to_regprocedure('public.aula_touch_updated_at()') is not null then
    revoke all on function public.aula_touch_updated_at() from authenticated, anon, public;
  end if;
end
$$;

do $$
begin
  if to_regprocedure('public.aula_is_staff()') is not null then
    revoke all on function public.aula_is_staff() from authenticated, anon, public;
  end if;
end
$$;

-- 4) Eliminar funciones en orden seguro.
drop function if exists public.aula_handle_new_user();
drop function if exists public.aula_is_staff();

do $$
begin
  if to_regprocedure('private.aula_is_staff()') is not null then
    drop function private.aula_is_staff();
  end if;
end
$$;

do $$
begin
  if to_regprocedure('public.aula_touch_updated_at()') is not null then
    -- Se elimina sólo si el objeto sigue siendo exclusivo de Aula Viva.
    if exists (
      select 1
      from pg_trigger t
      join pg_proc p on p.oid = t.tgfoid
      where p.oid = to_regprocedure('public.aula_touch_updated_at()')
    ) then
      drop function public.aula_touch_updated_at();
    end if;
  end if;
end
$$;

-- 5) Eliminar tablas aula_* en orden seguro de dependencias.
drop table if exists public.aula_lesson_progress;
drop table if exists public.aula_spaced_reviews;
drop table if exists public.aula_certificates;
drop table if exists public.aula_assessment_attempts;
drop table if exists public.aula_consent_records;
drop table if exists public.aula_enrollments;
drop table if exists public.aula_lessons;
drop table if exists public.aula_modules;
drop table if exists public.aula_courses;
drop table if exists public.aula_profiles;

-- 6) Eliminar el esquema private únicamente si queda vacío.
do $$
begin
  if exists (
    select 1
    from pg_namespace
    where nspname = 'private'
  ) and not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'private'
  ) and not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private'
  ) and not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'private'
  ) then
    drop schema private;
  end if;
end
$$;

commit;
