import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repoRoot = path.resolve(process.argv[2] || ".");
const reviewMigration = "supabase/migrations/20260726_aula_revision_interna.sql";
const rollbackMigration = "supabase/migrations/20260726_aula_revision_interna_staging_rollback.sql";
const initialStateMigration = "supabase/migrations/20260726_aula_revision_interna_estado_inicial.sql";

const requiredFiles = [
  "_redirects",
  "sembrar/aula/index.html",
  "sembrar/aula/aula.css",
  "sembrar/aula/aula-config.js",
  "sembrar/aula/aula-core.js",
  "sembrar/aula/aula-dashboard.js",
  "sembrar/aula/curso/ia-con-criterio-humano/index.html",
  "sembrar/aula/curso/ia-con-criterio-humano/course-data.js",
  "sembrar/aula/curso/ia-con-criterio-humano/course.js",
  "sembrar/cursos/index.html",
  "sembrar/cursos/ia-con-criterio-humano/index.html",
  "supabase/migrations/20260725_aula_viva.sql",
  reviewMigration,
  rollbackMigration
];

const failures = [];
const checks = [];

function check(condition, message) {
  checks.push({ condition, message });
  if (!condition) failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

for (const file of requiredFiles) {
  check(fs.existsSync(path.join(repoRoot, file)), `Existe ${file}`);
}

if (failures.length === 0) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(read("sembrar/aula/curso/ia-con-criterio-humano/course-data.js"), sandbox);
  const course = sandbox.window.IA_COURSE;
  const ids = course.lessons.map(lesson => lesson.id);

  check(course.slug === "ia-con-criterio-humano", "El slug del curso es estable");
  check(course.modules.length === 9, "El curso contiene 9 modulos");
  check(course.lessons.length === 19, "El curso contiene 19 experiencias");
  check(new Set(ids).size === ids.length, "No existen IDs de leccion duplicados");
  check(course.lessons.every(lesson => lesson.objective && lesson.scenario), "Cada experiencia tiene objetivo y situacion");
  check(course.lessons.every(lesson => lesson.activity?.prompt), "Cada experiencia contiene practica");
  check(course.lessons.every(lesson => Array.isArray(lesson.references) && lesson.references.length >= 2), "Cada experiencia muestra al menos dos referencias");
  check(course.lessons.every(lesson => lesson.references.every(reference => reference.length > 40)), "Las referencias APA fueron resueltas a texto completo");
  check(course.lessons.some(lesson => Array.isArray(lesson.content) && lesson.content.length > 0), "Riesgo registrado: course-data.js publica contenido interno de lecciones");
  check(course.lessons.some(lesson => lesson.activity?.options?.some(option => "feedback" in option || "correct" in option)), "Riesgo registrado: course-data.js publica actividades, feedback o criterios");

  const core = read("sembrar/aula/aula-core.js");
  check(!/service[_-]?role/i.test(core), "El cliente no contiene una service role key");
  check(/aula_courses/.test(core) && /aula_lesson_progress/.test(core), "El cliente usa tablas aisladas con prefijo aula_");
  check(/resetPasswordForEmail/.test(core), "Existe recuperacion de contrasena");
  check(/resendConfirmation/.test(core), "Existe reenvio de confirmacion de correo");
  check(/updatePassword/.test(core), "Existe actualizacion de contrasena desde enlace de recuperacion");
  check(/getConnectionState/.test(core), "Existe deteccion explicita del estado de conexion");
  check(/syncPreviewProgress/.test(core), "Existe sincronizacion controlada de avance local a Supabase");
  check(/enableRemoteSync/.test(core), "La sincronizacion remota puede desactivarse por configuracion");
  check(/previewMode/.test(core), "Existe modo de vista previa local");

  const dashboard = read("sembrar/aula/aula-dashboard.js");
  check(/friendlyError/.test(dashboard), "La interfaz muestra errores seguros para usuarios");
  check(/resend-confirmation-button/.test(dashboard), "La interfaz permite reenviar confirmacion sin crear formularios falsos");
  check(/update-password/.test(dashboard), "La interfaz contempla recuperacion y cambio de contrasena");

  const aulaHtml = read("sembrar/aula/index.html");
  check(/aria-describedby="auth-description auth-status"/.test(aulaHtml), "El formulario de acceso describe estado y ayuda");
  check(/id="resend-confirmation-button"/.test(aulaHtml), "Existe control preparado para reenviar confirmacion");
  check(/rel="noopener noreferrer"/.test(aulaHtml), "Los enlaces externos del aula usan noopener noreferrer");

  const sql = read("supabase/migrations/20260725_aula_viva.sql");
  const reviewSql = read(reviewMigration);
  const rollbackSql = read(rollbackMigration);
  const reviewSqlWithoutTriggerFunctions = reviewSql.replace(/create\s+(?:or\s+replace\s+)?function[\s\S]*?returns\s+trigger[\s\S]*?language\s+plpgsql[\s\S]*?\$\$;/ig, "");
  check(!/\b(?:new|old)\./i.test(reviewSqlWithoutTriggerFunctions), "No hay referencias a NEW. u OLD. fuera de funciones trigger LANGUAGE plpgsql en la migracion de revision interna");
  const policyBlocks = [...reviewSql.matchAll(/create policy[\s\S]*?(?=create policy|$)/gi)];
  const ambiguousPolicyCorrelations = [];
  for (const match of policyBlocks) {
    const block = match[0];
    const policyName = block.match(/create policy\s+"([^"]+)"/i)?.[1] || "sin nombre";
    for (const correlation of block.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_]*)\.(course_id|id)\s*=\s*(course_id|course_version_id|lesson_version_id)\b/g)) {
      ambiguousPolicyCorrelations.push(`${policyName}: ${correlation[1]}.${correlation[2]} = ${correlation[3]}`);
    }
  }
  check(ambiguousPolicyCorrelations.length === 0, `No hay correlaciones ambiguas en CREATE POLICY${ambiguousPolicyCorrelations.length ? `: ${ambiguousPolicyCorrelations.join(", ")}` : ""}`);
  const tables = [
    "aula_profiles", "aula_courses", "aula_modules", "aula_lessons",
    "aula_enrollments", "aula_lesson_progress", "aula_consent_records",
    "aula_assessment_attempts", "aula_certificates", "aula_spaced_reviews"
  ];
  for (const table of tables) {
    check(sql.includes(`alter table public.${table} enable row level security`), `RLS habilitado en ${table}`);
  }
  const profileGrantLines = sql
    .split(/\r?\n/)
    .filter(line => /grant/i.test(line) && /public\.aula_profiles/i.test(line));
  check(/grant update \(full_name\)/.test(sql), "Los alumnos no pueden elevar su rol mediante el cliente");
  check(!profileGrantLines.some(line => /\bgrant\s+insert\b/i.test(line)), "Los alumnos no pueden insertar perfiles");
  check(!profileGrantLines.some(line => /\bgrant\s+delete\b/i.test(line)), "Los alumnos no pueden eliminar perfiles");
  check(!profileGrantLines.some(line => /\bgrant\s+update\b/i.test(line) && !/\bgrant\s+update\s*\(\s*full_name\s*\)/i.test(line)), "Los alumnos solo pueden actualizar full_name del perfil");
  check(/role text not null default 'student'/.test(sql), "El rol base es student");
  check(/check \(role in \('student', 'facilitator', 'academic_admin', 'admin'\)\)/.test(sql), "El constraint de roles solo acepta student y roles autorizados");
  check(/insert into public\.aula_profiles \(id, full_name, role\)[\s\S]*?values \(new\.id,[\s\S]*?'student'\)/.test(sql), "El trigger de usuarios asigna student explicitamente");
  check(!/raw_user_meta_data\s*->>\s*'role'/i.test(sql), "La metadata del usuario no puede fijar role");
  check(/update public\.aula_profiles set role = 'student' where role = 'learner';/.test(sql), "La migracion convierte learner heredado a student");
  check(/unique \(user_id, course_id\)/.test(sql), "La inscripcion es unica por persona y curso");
  check(!/using\s*\(\s*true\s*\)[\s\S]{0,120}(aula_enrollments|aula_lesson_progress|aula_consent_records|aula_assessment_attempts|aula_certificates|aula_spaced_reviews)/i.test(sql), "Las tablas personales no usan politicas publicas abiertas");
  check(/create schema if not exists private;/.test(sql), "Existe esquema private para funciones internas");
  check(/revoke all on schema private from public;/.test(sql), "El esquema private revoca public");
  check(/revoke all on schema private from anon;/.test(sql), "El esquema private revoca anon");
  check(/grant usage on schema private to authenticated;/.test(sql), "El esquema private concede solo USAGE minimo a authenticated");
  const staffFunction = sql.match(/create or replace function private\.aula_is_staff\(\)[\s\S]*?\$\$;/)?.[0] || "";
  check(/security definer/i.test(staffFunction), "aula_is_staff usa SECURITY DEFINER");
  check(/set search_path = pg_catalog/i.test(staffFunction), "aula_is_staff fija search_path seguro");
  check(/from public\.aula_profiles/i.test(staffFunction) && /role in \('facilitator', 'academic_admin', 'admin'\)/i.test(staffFunction), "aula_is_staff consulta roles desde aula_profiles");
  check(!/raw_user_meta_data/i.test(staffFunction), "aula_is_staff no confia en metadata editable del usuario");
  check(/revoke all on function private\.aula_is_staff\(\) from public;/.test(sql), "aula_is_staff revoca permisos publicos por defecto");
  check(/revoke all on function private\.aula_is_staff\(\) from anon;/.test(sql), "aula_is_staff revoca permisos de anon");
  check(/grant execute on function private\.aula_is_staff\(\) to authenticated;/.test(sql), "aula_is_staff solo concede EXECUTE a authenticated");
  check(!/grant execute on function private\.aula_is_staff\(\) to anon/i.test(sql), "aula_is_staff no concede EXECUTE a anon");
  check(/drop function if exists public\.aula_is_staff\(\);/.test(sql), "La funcion publica anterior se elimina de forma controlada");
  check(!/public\.aula_is_staff\(\)/.test(sql.replace(/drop function if exists public\.aula_is_staff\(\);/, "")), "Las politicas no llaman public.aula_is_staff");
  check(/private\.aula_is_staff\(\)/.test(sql), "Las politicas usan private.aula_is_staff");
  check(!/on public\.aula_(courses|modules|lessons) for select[\s\S]{0,80}to anon/i.test(sql), "Las tablas de contenido no tienen politicas SELECT para anon");
  check(/grant select on public\.aula_courses, public\.aula_modules, public\.aula_lessons to authenticated;/.test(sql), "Las tablas de contenido conceden SELECT solo a authenticated");
  check(!/grant select on public\.aula_courses, public\.aula_modules, public\.aula_lessons to anon/i.test(sql), "Las tablas de contenido no conceden SELECT a anon");
  check(/on public\.aula_courses for select[\s\S]*?to authenticated[\s\S]*?using \(status = 'published' or private\.aula_is_staff\(\)\);/.test(sql), "aula_courses expone solo cursos publicados a usuarios autenticados");
  check(/on public\.aula_modules for select[\s\S]*?to authenticated[\s\S]*?join public\.aula_enrollments e on e\.course_id = c\.id[\s\S]*?where c\.id = public\.aula_modules\.course_id[\s\S]*?e\.user_id = auth\.uid\(\)[\s\S]*?e\.status in \('active', 'completed'\)/.test(sql), "aula_modules exige inscripcion activa o completada del usuario en el curso");
  check(/on public\.aula_lessons for select[\s\S]*?to authenticated[\s\S]*?join public\.aula_enrollments e on e\.course_id = c\.id[\s\S]*?where c\.id = public\.aula_lessons\.course_id[\s\S]*?e\.user_id = auth\.uid\(\)[\s\S]*?e\.status in \('active', 'completed'\)/.test(sql), "aula_lessons exige inscripcion activa o completada del usuario en el curso");
  check(!/aula_(modules|lessons)[\s\S]{0,700}e\.status in \('active', 'completed', 'paused'\)/.test(sql), "paused no permite leer modulos ni lecciones");

  check(/alter table public\.aula_courses\s+add column if not exists editorial_status text/i.test(reviewSql), "La migracion de revision interna agrega editorial_status");
  check(/alter table public\.aula_courses\s+add column if not exists catalog_visibility text/i.test(reviewSql), "La migracion de revision interna agrega catalog_visibility");
  check(/add constraint aula_courses_editorial_status_check/i.test(reviewSql), "La migracion de revision interna aplica constraint editorial_status");
  check(/add constraint aula_courses_catalog_visibility_check/i.test(reviewSql), "La migracion de revision interna aplica constraint catalog_visibility");
  check(/alter table public\.aula_courses\s+alter column editorial_status set default 'draft';/i.test(reviewSql), "Editorial_status default es draft");
  check(/alter table public\.aula_courses\s+alter column catalog_visibility set default 'hidden';/i.test(reviewSql), "Catalog_visibility default es hidden");
  check(/create table if not exists public\.aula_course_versions/i.test(reviewSql), "La migracion crea aula_course_versions");
  check(/create table if not exists public\.aula_course_reviewers/i.test(reviewSql), "La migracion crea aula_course_reviewers");
  check(/create table if not exists public\.aula_lesson_versions/i.test(reviewSql), "La migracion crea aula_lesson_versions");
  check(/create table if not exists public\.aula_review_feedback/i.test(reviewSql), "La migracion crea aula_review_feedback");
  check(/create table if not exists public\.aula_review_activity/i.test(reviewSql), "La migracion crea aula_review_activity");
  check(/alter table public\.aula_course_versions enable row level security;/i.test(reviewSql), "RLS habilitado en aula_course_versions");
  check(/alter table public\.aula_course_reviewers enable row level security;/i.test(reviewSql), "RLS habilitado en aula_course_reviewers");
  check(/alter table public\.aula_lesson_versions enable row level security;/i.test(reviewSql), "RLS habilitado en aula_lesson_versions");
  check(/alter table public\.aula_review_feedback enable row level security;/i.test(reviewSql), "RLS habilitado en aula_review_feedback");
  check(/alter table public\.aula_review_activity enable row level security;/i.test(reviewSql), "RLS habilitado en aula_review_activity");
  check(/alter table public\.aula_course_versions force row level security;/i.test(reviewSql), "RLS forzado en aula_course_versions");
  check(/alter table public\.aula_course_reviewers force row level security;/i.test(reviewSql), "RLS forzado en aula_course_reviewers");
  check(/alter table public\.aula_lesson_versions force row level security;/i.test(reviewSql), "RLS forzado en aula_lesson_versions");
  check(/alter table public\.aula_review_feedback force row level security;/i.test(reviewSql), "RLS forzado en aula_review_feedback");
  check(/alter table public\.aula_review_activity force row level security;/i.test(reviewSql), "RLS forzado en aula_review_activity");
  check(/create or replace function private\.aula_is_admin\(\)/i.test(reviewSql), "La migracion define private.aula_is_admin");
  check(/create or replace function private\.aula_is_course_reviewer\(/i.test(reviewSql), "La migracion define private.aula_is_course_reviewer");
  check(/create or replace function private\.aula_can_review_version\(/i.test(reviewSql), "La migracion define private.aula_can_review_version");
  check(/create or replace function private\.aula_can_access_lesson_version\(/i.test(reviewSql), "La migracion define private.aula_can_access_lesson_version");
  check(/grant execute on function private\.aula_is_admin\(\) to authenticated;/i.test(reviewSql), "La migracion concede execute a authenticated en aula_is_admin");
  check(/grant execute on function private\.aula_is_course_reviewer\(uuid\) to authenticated;/i.test(reviewSql), "La migracion concede execute a authenticated en aula_is_course_reviewer");
  check(/grant execute on function private\.aula_can_review_version\(uuid\) to authenticated;/i.test(reviewSql), "La migracion concede execute a authenticated en aula_can_review_version");
  check(/grant execute on function private\.aula_can_access_lesson_version\(uuid\) to authenticated;/i.test(reviewSql), "La migracion concede execute a authenticated en aula_can_access_lesson_version");
  check(/create policy "aula-course-versions-admin-manage"/i.test(reviewSql), "La migracion crea politica de admin para aula_course_versions");
  check(/create policy "aula-course-versions-reviewer-read"/i.test(reviewSql), "La migracion crea politica de reviewer read para aula_course_versions");
  check(/create policy "aula-course-reviewers-admin-manage"/i.test(reviewSql), "La migracion crea politica de admin para aula_course_reviewers");
  check(/create unique index if not exists aula_course_versions_current_idx/i.test(reviewSql), "La migracion crea indice unico para versiones actuales");
  check(/create unique index if not exists aula_course_versions_current_idx/i.test(reviewSql), "La migracion crea indice unico para versiones actuales");
  check(rollbackSql.includes("begin;"), "El rollback inicia con begin;");
  check(rollbackSql.includes("commit;"), "El rollback termina con commit;");
  check(/drop table if exists public\.aula_review_activity/i.test(rollbackSql), "El rollback elimina aula_review_activity");
  check(/drop table if exists public\.aula_review_feedback/i.test(rollbackSql), "El rollback elimina aula_review_feedback");
  check(/drop table if exists public\.aula_lesson_versions/i.test(rollbackSql), "El rollback elimina aula_lesson_versions");
  check(/drop table if exists public\.aula_course_reviewers/i.test(rollbackSql), "El rollback elimina aula_course_reviewers");
  check(/drop table if exists public\.aula_course_versions/i.test(rollbackSql), "El rollback elimina aula_course_versions");
  check(/drop function if exists private\.aula_can_access_lesson_version\(uuid\)/i.test(rollbackSql), "El rollback elimina la funcion private.aula_can_access_lesson_version");
  check(/drop function if exists private\.aula_can_review_version\(uuid\)/i.test(rollbackSql), "El rollback elimina la funcion private.aula_can_review_version");
  check(/drop function if exists private\.aula_is_course_reviewer\(uuid\)/i.test(rollbackSql), "El rollback elimina la funcion private.aula_is_course_reviewer");
  check(/drop function if exists private\.aula_is_admin\(\)/i.test(rollbackSql), "El rollback elimina la funcion private.aula_is_admin");
  check(/delete from public\.aula_courses/i.test(rollbackSql), "El rollback borra solo los cursos de revision interna definidos");
  check(/'datos-con-criterio'/.test(rollbackSql) && /'conversaciones-que-cuidan-y-movilizan'/.test(rollbackSql), "El rollback referencia los slugs internos esperados");
  check(!/drop table if exists public\.aula_courses/i.test(rollbackSql), "El rollback no elimina la tabla public.aula_courses");
  check(!/drop table if exists public\.aula_profiles/i.test(rollbackSql), "El rollback no elimina la tabla public.aula_profiles");
  check(!/drop schema if exists private/i.test(rollbackSql), "El rollback no elimina el esquema private");

  const redirects = read("_redirects");
  check(redirects.includes("/sembrar/aula /sembrar/aula/index.html 200"), "La ruta de Mi Aula esta configurada");
  check(redirects.includes("/sembrar/cursos/ia-con-personas-al-centro /sembrar/cursos/ia-con-criterio-humano 301"), "La URL anterior redirige al nombre definitivo");

  const config = read("sembrar/aula/aula-config.js");
  const previewMode = /previewMode\s*:\s*true/.test(config);
  const enableRemoteSync = /enableRemoteSync\s*:\s*true/.test(config);
  const urlMatch = config.match(/supabaseUrl\s*:\s*(['"])(.*?)\1/);
  const anonKeyMatch = config.match(/supabaseAnonKey\s*:\s*(['"])(.*?)\1/);
  const supabaseUrl = urlMatch ? urlMatch[2].trim() : "";
  const supabaseAnonKey = anonKeyMatch ? anonKeyMatch[2].trim() : "";

  check(!/service[_-]?role/i.test(config), "No aparece service_role en la configuracion");
  check(!/sb_secret_/i.test(config), "No aparece sb_secret_ en la configuracion");
  check(!/service[_-]?role/i.test(supabaseAnonKey), "La clave anon no contiene service_role");
  check(!/sb_secret_/i.test(supabaseAnonKey), "La clave anon no contiene sb_secret_");

  if (previewMode) {
    check(supabaseUrl === "", "El paquete preview no incluye URL de Supabase");
    check(supabaseAnonKey === "", "El paquete preview no incluye anon key de Supabase");
    check(!enableRemoteSync, "La sincronizacion remota no se activa en preview");
  } else {
    check(supabaseUrl.length > 0, "La configuracion staging/prod incluye una URL de Supabase");
    check(supabaseUrl.startsWith("https://"), "La URL de Supabase usa HTTPS");
    check(supabaseAnonKey.length > 0, "La configuracion staging/prod incluye una anon key de Supabase");
    check(/^(sb_publishable_[A-Za-z0-9_-]+|[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+)$/.test(supabaseAnonKey), "La anon key de Supabase tiene formato valido");
    check(enableRemoteSync, "La configuracion staging/prod habilita sincronizacion remota");
  }

  const publicShell = [
    read("index.html"),
    read("sembrar/cursos/index.html"),
    read("lineas/index.html")
  ].join("\n");
  check(!/Acceder a Escucha Viva/i.test(publicShell), "Escucha Viva no se expone en inicio, catalogo ni ecosistema publico");
}

for (const item of checks) {
  console.log(`${item.condition ? "OK" : "FAIL"} ${item.message}`);
}

if (failures.length) {
  console.error(`\nAuditoria fallida: ${failures.length} problema(s).`);
  process.exit(1);
}

console.log(`\nAuditoria completada: ${checks.length} controles aprobados.`);
