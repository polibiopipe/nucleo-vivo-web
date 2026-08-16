-- Mi Núcleo · perfil y onboarding
-- Extiende el perfil existente de Aula Viva sin modificar roles ni metadata de Auth.

alter table public.aula_profiles
  add column if not exists mi_nucleo_priority text,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists welcome_video_seen_at timestamptz;

alter table public.aula_profiles
  drop constraint if exists aula_profiles_mi_nucleo_priority_check;

alter table public.aula_profiles
  add constraint aula_profiles_mi_nucleo_priority_check
  check (
    mi_nucleo_priority is null
    or mi_nucleo_priority in ('psychology', 'education', 'business', 'all')
  );

-- Asegura que todo usuario de Auth tenga un perfil antes del backfill.
insert into public.aula_profiles (id, full_name, role)
select
  users.id,
  nullif(trim(coalesce(users.raw_user_meta_data ->> 'full_name', '')), ''),
  'student'
from auth.users as users
on conflict (id) do nothing;

-- Compatibilidad con el flujo anterior: solo los usuarios que ya tienen nombre
-- y una prioridad válida en metadata se consideran incorporados.
update public.aula_profiles as profiles
set
  full_name = coalesce(
    nullif(trim(profiles.full_name), ''),
    nullif(trim(coalesce(users.raw_user_meta_data ->> 'full_name', '')), '')
  ),
  mi_nucleo_priority = case
    when profiles.mi_nucleo_priority
      in ('psychology', 'education', 'business', 'all')
      then profiles.mi_nucleo_priority
    when users.raw_user_meta_data ->> 'mi_nucleo_priority'
      in ('psychology', 'education', 'business', 'all')
      then users.raw_user_meta_data ->> 'mi_nucleo_priority'
    else null
  end,
  onboarding_completed_at = case
    when nullif(trim(coalesce(users.raw_user_meta_data ->> 'full_name', '')), '') is not null
      and users.raw_user_meta_data ->> 'mi_nucleo_priority'
        in ('psychology', 'education', 'business', 'all')
      then coalesce(profiles.onboarding_completed_at, now())
    else profiles.onboarding_completed_at
  end
from auth.users as users
where profiles.id = users.id;

grant update (full_name, mi_nucleo_priority, onboarding_completed_at, welcome_video_seen_at)
on public.aula_profiles
to authenticated;

comment on column public.aula_profiles.mi_nucleo_priority is
  'Prioridad de personalización de Mi Núcleo.';

comment on column public.aula_profiles.onboarding_completed_at is
  'Fecha en que el usuario completó el perfil inicial de Mi Núcleo.';

comment on column public.aula_profiles.welcome_video_seen_at is
  'Fecha en que el usuario cerró o completó la bienvenida en video de Mi Núcleo.';
