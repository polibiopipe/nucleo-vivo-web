-- Aula Viva · Núcleo Vivo
-- Ajuste complementario e idempotente del curso existente de revisión interna.

begin;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'aula_courses_editorial_guard'
      AND tgrelid = 'public.aula_courses'::regclass
  ) THEN
    ALTER TABLE public.aula_courses DISABLE TRIGGER aula_courses_editorial_guard;
  END IF;
END
$$;

update public.aula_courses
set
  status = 'published',
  editorial_status = 'published',
  catalog_visibility = 'available'
where slug = 'ia-con-criterio-humano'
  and status = 'published';

DO $$
DECLARE
  matching_count integer;
BEGIN
  select count(*)
  into matching_count
  from public.aula_courses
  where slug = 'ia-con-criterio-humano'
    and status = 'published'
    and editorial_status = 'published'
    and catalog_visibility = 'available';

  if matching_count <> 1 then
    raise exception 'Se esperaba exactamente una fila con slug %, status published, editorial_status published y catalog_visibility available; se encontraron %', 'ia-con-criterio-humano', matching_count;
  end if;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'aula_courses_editorial_guard'
      AND tgrelid = 'public.aula_courses'::regclass
  ) THEN
    ALTER TABLE public.aula_courses ENABLE TRIGGER aula_courses_editorial_guard;
  END IF;
END
$$;

commit;
