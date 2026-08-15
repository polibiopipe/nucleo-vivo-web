-- Mi Núcleo · Núcleo Vivo
-- Registra el consentimiento incluido en el alta de una cuenta.
-- Esta migración amplía únicamente el Supabase de Aula Viva / Mi Núcleo.
-- No pertenece ni modifica la infraestructura independiente de Escucha Viva.
-- Es una mejora opcional de trazabilidad: Mi Núcleo conserva el consentimiento
-- en metadata de Auth y puede funcionar sin aplicar esta migración hoy.

begin;

create or replace function public.mi_nucleo_handle_signup_consent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  consent_version text;
  accepted_at timestamptz;
  consent_source text;
begin
  consent_version := nullif(new.raw_user_meta_data ->> 'mi_nucleo_consent_version', '');
  if consent_version is null then
    return new;
  end if;

  begin
    accepted_at := coalesce(
      (new.raw_user_meta_data ->> 'mi_nucleo_consent_accepted_at')::timestamptz,
      now()
    );
  exception when others then
    accepted_at := now();
  end;

  consent_source := coalesce(
    nullif(new.raw_user_meta_data ->> 'mi_nucleo_consent_source', ''),
    'signup'
  );

  insert into public.aula_consent_records (
    user_id,
    consent_type,
    version,
    accepted,
    accepted_at,
    context
  )
  values (
    new.id,
    'mi_nucleo_privacy_terms',
    consent_version,
    true,
    accepted_at,
    jsonb_build_object(
      'source', consent_source,
      'route', '/mi-nucleo/',
      'interface', 'web'
    )
  );

  return new;
end;
$$;

revoke all on function public.mi_nucleo_handle_signup_consent() from public;
revoke all on function public.mi_nucleo_handle_signup_consent() from anon;
revoke all on function public.mi_nucleo_handle_signup_consent() from authenticated;

drop trigger if exists on_auth_user_created_mi_nucleo_consent on auth.users;
create trigger on_auth_user_created_mi_nucleo_consent
after insert on auth.users
for each row execute function public.mi_nucleo_handle_signup_consent();

commit;
