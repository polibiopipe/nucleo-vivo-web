-- Sexualidad en Plenitud — esquema AISLADO previsto para un proyecto Supabase DEDICADO.
-- NO ejecutar en Núcleo Vivo Aula / MSC Safety / Escucha Viva.
-- Antes de ejecutar: nombrar responsable, correo de privacidad, DPA, dominio y responsable de supervisión.
-- No crear tablas de conversaciones o datos clínicos en esta fase.
begin;

create table if not exists public.sep_clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 3 and 120),
  commune text not null default 'Villa Alemana' check (char_length(commune) between 2 and 100),
  status text not null default 'pending' check (status in ('pending','verified','suspended')),
  created_at timestamptz not null default now()
);

create unique index if not exists sep_clubs_name_commune_ci
  on public.sep_clubs (lower(name),lower(commune));

create table if not exists public.sep_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(trim(nickname)) between 2 and 60),
  club_id uuid references public.sep_clubs(id) on delete set null,
  accessibility_text_large boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sep_join_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  club_id uuid references public.sep_clubs(id) on delete set null,
  proposed_club_name text check (proposed_club_name is null or char_length(trim(proposed_club_name)) between 3 and 120),
  note text check (note is null or char_length(note) <= 250),
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  check (club_id is not null or proposed_club_name is not null)
);
create unique index if not exists sep_join_one_pending_per_user
 on public.sep_join_requests (user_id) where status = 'pending';

-- No confiar en user_metadata ni permitir que el navegador se autoasigne rol.
create table if not exists public.sep_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level text not null check (level in ('coordinator','club_verifier','psychologist_moderator')),
  credential_verified_at timestamptz,
  active boolean not null default false
);

create table if not exists public.sep_events (
  id uuid primary key default gen_random_uuid(),
  host_club_id uuid not null references public.sep_clubs(id),
  title text not null check (char_length(trim(title)) between 4 and 120),
  summary text not null check (char_length(summary) between 15 and 1500),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  venue text not null check (char_length(trim(venue)) between 4 and 160),
  participation_mode text not null default 'in_person' check (participation_mode in ('in_person','hybrid')),
  audience text not null default 'invited_clubs' check (audience in ('all_verified_clubs','invited_clubs')),
  status text not null default 'draft' check (status in ('draft','published','cancelled','finished')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.sep_event_clubs (
  event_id uuid not null references public.sep_events(id) on delete cascade,
  club_id uuid not null references public.sep_clubs(id) on delete cascade,
  primary key (event_id, club_id)
);

create table if not exists public.sep_event_signups (
  event_id uuid not null references public.sep_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','confirmed','withdrawn')),
  created_at timestamptz not null default now(),
  primary key (event_id,user_id)
);

create table if not exists public.sep_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('community_account','evaluation_opt_in','communications_opt_in')),
  document_version text not null check (char_length(document_version) between 3 and 40),
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz
);
create index if not exists sep_consent_user_idx on public.sep_consents(user_id, purpose);

create table if not exists public.sep_privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null check (request_type in ('access','rectification','deletion','consent_withdrawal','other')),
  submitted_at timestamptz not null default now(),
  state text not null default 'open' check (state in ('open','reviewing','completed','denied')),
  fulfilled_at timestamptz
);
-- No guardamos relatos íntimos en solicitudes; el equipo responde por un canal verificado y seguro.

alter table public.sep_clubs enable row level security;
alter table public.sep_profiles enable row level security;
alter table public.sep_join_requests enable row level security;
alter table public.sep_staff enable row level security;
alter table public.sep_events enable row level security;
alter table public.sep_event_clubs enable row level security;
alter table public.sep_event_signups enable row level security;
alter table public.sep_consents enable row level security;
alter table public.sep_privacy_requests enable row level security;

revoke all on public.sep_clubs,public.sep_profiles,public.sep_join_requests,
 public.sep_staff,public.sep_events,public.sep_event_clubs,
 public.sep_event_signups,public.sep_consents,public.sep_privacy_requests
 from anon, authenticated;
-- Importante: no se modifican privilegios de ninguna otra tabla.
grant usage on schema public to anon, authenticated;
grant select on public.sep_clubs to anon, authenticated;
grant select, insert on public.sep_profiles to authenticated;
grant update(nickname, accessibility_text_large) on public.sep_profiles to authenticated;
grant select, insert on public.sep_join_requests to authenticated;
grant select on public.sep_staff to authenticated;
grant select on public.sep_events to authenticated;
grant select on public.sep_event_clubs to authenticated;
grant select, insert on public.sep_event_signups to authenticated;
grant update(status) on public.sep_event_signups to authenticated;
grant select, insert on public.sep_consents to authenticated;
grant update(withdrawn_at) on public.sep_consents to authenticated;
grant select, insert on public.sep_privacy_requests to authenticated;

create policy sep_club_verified_read on public.sep_clubs for select
 to anon, authenticated using (status = 'verified');

create policy sep_profile_own_read on public.sep_profiles for select
 to authenticated using (user_id = (select auth.uid()));
create policy sep_profile_own_insert on public.sep_profiles for insert
 to authenticated with check (user_id = (select auth.uid()) and club_id is null);
create policy sep_profile_own_edit on public.sep_profiles for update
 to authenticated using (user_id = (select auth.uid()))
 with check (user_id = (select auth.uid()));

create policy sep_join_own_read on public.sep_join_requests for select
 to authenticated using (user_id = (select auth.uid()));
create policy sep_join_own_insert on public.sep_join_requests for insert
 to authenticated with check (
  user_id = (select auth.uid()) and status = 'pending'
  and (club_id is null or exists (select 1 from public.sep_clubs c where c.id=club_id and c.status='verified'))
 );

create policy sep_staff_own_read on public.sep_staff for select
 to authenticated using (user_id = (select auth.uid()));

create policy sep_events_eligible_read on public.sep_events for select
 to authenticated using (
  status = 'published' and exists (
    select 1 from public.sep_profiles p
    join public.sep_clubs c on c.id=p.club_id and c.status='verified'
    where p.user_id=(select auth.uid())
      and (audience='all_verified_clubs' or exists (
        select 1 from public.sep_event_clubs ec where ec.event_id=sep_events.id and ec.club_id=p.club_id
      ))
  )
);

create policy sep_event_clubs_eligible_read on public.sep_event_clubs for select
 to authenticated using (exists (
   select 1 from public.sep_profiles p
   where p.user_id=(select auth.uid()) and p.club_id=sep_event_clubs.club_id
 ));

create policy sep_event_signups_own_read on public.sep_event_signups for select
 to authenticated using (user_id=(select auth.uid()));
create policy sep_event_signups_own_insert on public.sep_event_signups for insert
 to authenticated with check (
  user_id=(select auth.uid()) and status='requested'
  and exists (select 1 from public.sep_events e where e.id=event_id and e.status='published')
 );
create policy sep_event_signups_withdraw_only on public.sep_event_signups for update
 to authenticated using (user_id=(select auth.uid()))
 with check (user_id=(select auth.uid()) and status='withdrawn');

create policy sep_consents_own_read on public.sep_consents for select
 to authenticated using (user_id=(select auth.uid()));
create policy sep_consents_own_add on public.sep_consents for insert
 to authenticated with check (user_id=(select auth.uid()) and withdrawn_at is null);
create policy sep_consents_own_withdraw on public.sep_consents for update
 to authenticated using (user_id=(select auth.uid()))
 with check (user_id=(select auth.uid()) and withdrawn_at is not null);

create policy sep_privacy_own_read on public.sep_privacy_requests for select
 to authenticated using (user_id=(select auth.uid()));
create policy sep_privacy_own_insert on public.sep_privacy_requests for insert
 to authenticated with check (user_id=(select auth.uid()) and state='open');

commit;

-- La revisión/aprobación de clubes, adscripción y eventos se hace por consola de administración
-- autenticada de Supabase con privilegios administrativos y procedimiento auditado.
-- No existe en la aplicación un camino para que un usuario se autoasigne club o rol profesional.
-- Este esquema NO constituye por sí solo cumplimiento de la Ley 21.719:
-- faltan responsable del tratamiento, contrato con encargado, EIPD, retención automatizada,
-- verificación operativa de derechos, controles de acceso, pruebas adversariales y supervisión.
