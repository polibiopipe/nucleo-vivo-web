import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repoRoot = path.resolve(process.argv[2] || ".");
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
  "supabase/migrations/20260725_aula_viva.sql"
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
  const tables = [
    "aula_profiles", "aula_courses", "aula_modules", "aula_lessons",
    "aula_enrollments", "aula_lesson_progress", "aula_consent_records",
    "aula_assessment_attempts", "aula_certificates", "aula_spaced_reviews"
  ];
  for (const table of tables) {
    check(sql.includes(`alter table public.${table} enable row level security`), `RLS habilitado en ${table}`);
  }
  check(/grant update \(full_name\)/.test(sql), "Los alumnos no pueden elevar su rol mediante el cliente");
  check(/unique \(user_id, course_id\)/.test(sql), "La inscripcion es unica por persona y curso");
  check(!/using\s*\(\s*true\s*\)[\s\S]{0,120}(aula_enrollments|aula_lesson_progress|aula_consent_records|aula_assessment_attempts|aula_certificates|aula_spaced_reviews)/i.test(sql), "Las tablas personales no usan politicas publicas abiertas");

  const redirects = read("_redirects");
  check(redirects.includes("/sembrar/aula /sembrar/aula/index.html 200"), "La ruta de Mi Aula esta configurada");
  check(redirects.includes("/sembrar/cursos/ia-con-personas-al-centro /sembrar/cursos/ia-con-criterio-humano 301"), "La URL anterior redirige al nombre definitivo");

  const config = read("sembrar/aula/aula-config.js");
  check(/previewMode:\s*true/.test(config), "El paquete se entrega en vista previa, sin credenciales");
  check(/enableRemoteSync:\s*true/.test(config), "La configuracion deja preparada la sincronizacion remota");
  check(/supabaseUrl:\s*""/.test(config) && /supabaseAnonKey:\s*""/.test(config), "La configuracion real no incluye credenciales");

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
