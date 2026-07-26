-- Aula Viva · Núcleo Vivo
-- Rollback seguro de la revisión interna de Aula Viva.
-- Revertir solo la migración de revisión interna sin afectar datos previos.

begin;

-- 1. Eliminar triggers creados por la migración principal
DROP TRIGGER IF EXISTS aula_courses_editorial_guard ON public.aula_courses;
DROP TRIGGER IF EXISTS aula_review_feedback_protect_fields ON public.aula_review_feedback;
DROP TRIGGER IF EXISTS aula_course_version_status_changed ON public.aula_course_versions;
DROP TRIGGER IF EXISTS aula_review_feedback_created ON public.aula_review_feedback;
DROP TRIGGER IF EXISTS aula_review_feedback_status_changed ON public.aula_review_feedback;

-- 2. Eliminar funciones trigger creadas por la migración principal
DROP FUNCTION IF EXISTS private.aula_protect_course_editorial_fields();
DROP FUNCTION IF EXISTS private.aula_protect_review_feedback_fields();
DROP FUNCTION IF EXISTS private.aula_log_course_version_status();
DROP FUNCTION IF EXISTS private.aula_log_review_feedback_activity();

-- 3. Eliminar políticas RLS creadas por la migración principal
DROP POLICY IF EXISTS "aula-course-versions-admin-manage" ON public.aula_course_versions;
DROP POLICY IF EXISTS "aula-course-versions-reviewer-read" ON public.aula_course_versions;
DROP POLICY IF EXISTS "aula-course-reviewers-admin-manage" ON public.aula_course_reviewers;
DROP POLICY IF EXISTS "aula-course-reviewers-reviewer-read" ON public.aula_course_reviewers;
DROP POLICY IF EXISTS "aula-lesson-versions-admin-manage" ON public.aula_lesson_versions;
DROP POLICY IF EXISTS "aula-lesson-versions-reviewer-read" ON public.aula_lesson_versions;
DROP POLICY IF EXISTS "aula-lesson-versions-student-read" ON public.aula_lesson_versions;
DROP POLICY IF EXISTS "aula-review-feedback-admin-manage" ON public.aula_review_feedback;
DROP POLICY IF EXISTS "aula-review-feedback-reviewer-insert" ON public.aula_review_feedback;
DROP POLICY IF EXISTS "aula-review-feedback-reviewer-read" ON public.aula_review_feedback;
DROP POLICY IF EXISTS "aula-review-activity-admin-manage" ON public.aula_review_activity;
DROP POLICY IF EXISTS "aula-review-activity-reviewer-read" ON public.aula_review_activity;

-- 4. Revocar permisos concedidos a authenticated sobre las tablas nuevas
REVOKE ALL ON TABLE public.aula_course_versions FROM authenticated;
REVOKE ALL ON TABLE public.aula_course_reviewers FROM authenticated;
REVOKE ALL ON TABLE public.aula_lesson_versions FROM authenticated;
REVOKE ALL ON TABLE public.aula_review_feedback FROM authenticated;
REVOKE ALL ON TABLE public.aula_review_activity FROM authenticated;

-- 5. Eliminar funciones private creadas por la migración principal
DROP FUNCTION IF EXISTS private.aula_can_access_lesson_version(uuid);
DROP FUNCTION IF EXISTS private.aula_can_review_version(uuid);
DROP FUNCTION IF EXISTS private.aula_is_course_reviewer(uuid);
DROP FUNCTION IF EXISTS private.aula_is_admin();

-- 6. Eliminar tablas en orden de dependencias
DROP TABLE IF EXISTS public.aula_review_activity;
DROP TABLE IF EXISTS public.aula_review_feedback;
DROP TABLE IF EXISTS public.aula_lesson_versions;
DROP TABLE IF EXISTS public.aula_course_reviewers;
DROP TABLE IF EXISTS public.aula_course_versions;

-- 7. Eliminar los seis cursos agregados por la migración interna
DELETE FROM public.aula_courses
WHERE slug IN (
  'datos-con-criterio',
  'convivencia-segura',
  'no-caigas',
  'trabajo-sostenible',
  'liderar-la-transformacion',
  'conversaciones-que-cuidan-y-movilizan'
);

-- 8. Restaurar aula_courses a su estado previo a la migración
ALTER TABLE public.aula_courses DROP CONSTRAINT IF EXISTS aula_courses_editorial_status_check;
ALTER TABLE public.aula_courses DROP CONSTRAINT IF EXISTS aula_courses_catalog_visibility_check;
ALTER TABLE public.aula_courses DROP COLUMN IF EXISTS editorial_status;
ALTER TABLE public.aula_courses DROP COLUMN IF EXISTS catalog_visibility;

commit;
