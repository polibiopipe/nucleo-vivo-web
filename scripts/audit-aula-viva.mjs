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
  "sembrar/aula/curso/ia-con-criterio-humano/course-content-foundations.js",
  "sembrar/aula/curso/ia-con-criterio-humano/course-content-safety.js",
  "sembrar/aula/curso/ia-con-criterio-humano/course-content-integration.js",
  "sembrar/aula/curso/ia-con-criterio-humano/course.js",
  "assets/images/aula/ia-con-criterio-humano/modulo-00-reglas-minimas.png",
  "assets/images/aula/ia-con-criterio-humano/modulo-00-reglas-minimas.webp",
  "assets/images/aula/ia-con-criterio-humano/modulo-02-marco-valor.png",
  "assets/images/aula/ia-con-criterio-humano/modulo-02-marco-valor.webp",
  "assets/images/aula/ia-con-criterio-humano/modulo-04-fuentes-trazabilidad.png",
  "assets/images/aula/ia-con-criterio-humano/modulo-04-fuentes-trazabilidad.webp",
  "assets/images/aula/ia-con-criterio-humano/modulo-05-privacidad-datos.png",
  "assets/images/aula/ia-con-criterio-humano/modulo-05-privacidad-datos.webp",
  "assets/images/aula/ia-con-criterio-humano/modulo-07-supervision-humana.png",
  "assets/images/aula/ia-con-criterio-humano/modulo-07-supervision-humana.webp",
  "assets/images/aula/ia-con-criterio-humano/modulo-08-plan-piloto.png",
  "assets/images/aula/ia-con-criterio-humano/modulo-08-plan-piloto.webp",
  "assets/images/aula/ia-con-criterio-humano/modulo-08-practica-individual.png",
  "assets/images/aula/ia-con-criterio-humano/modulo-08-practica-individual.webp",
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

function referenceText(reference) {
  return typeof reference === "string" ? reference : reference?.apa || "";
}

function wordCount(value = "") {
  const normalized = String(value).trim();
  return normalized ? normalized.split(/\s+/u).length : 0;
}

function isCompleteApaReference(reference) {
  const apa = referenceText(reference);
  const url = typeof reference === "object" ? reference?.url : apa.match(/https?:\/\/\S+/)?.[0];
  return apa.length > 80
    && /\((?:19|20)\d{2}\)/.test(apa)
    && /\.\s/.test(apa)
    && /^https?:\/\//.test(url || "")
    && apa.includes(url || "__missing_url__");
}

for (const file of requiredFiles) {
  check(fs.existsSync(path.join(repoRoot, file)), `Existe ${file}`);
}

if (failures.length === 0) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  const courseDataFiles = [
    "sembrar/aula/curso/ia-con-criterio-humano/course-data.js",
    "sembrar/aula/curso/ia-con-criterio-humano/course-content-foundations.js",
    "sembrar/aula/curso/ia-con-criterio-humano/course-content-safety.js",
    "sembrar/aula/curso/ia-con-criterio-humano/course-content-integration.js"
  ];
  for (const file of courseDataFiles) vm.runInContext(read(file), sandbox);
  const course = sandbox.window.IA_COURSE;
  const ids = course.lessons.map(lesson => lesson.id);

  check(course.slug === "ia-con-criterio-humano", "El slug del curso es estable");
  check(course.modules.length === 9, "El curso contiene 9 modulos");
  check(course.lessons.length === 19, "El curso contiene 19 experiencias");
  check(course.estimatedHours >= 6 && course.estimatedHours <= 7, "La dedicacion declarada del curso es de 6 a 7 horas");
  check(
    course.learningOutcomes?.length === 6
      && course.learningOutcomes.every(outcome => outcome.length >= 100),
    "El curso declara los seis resultados de aprendizaje completos del manual"
  );
  check(new Set(ids).size === ids.length, "No existen IDs de leccion duplicados");
  check(course.lessons.every(lesson => lesson.objective && lesson.scenario), "Cada experiencia tiene objetivo y situacion");
  check(course.lessons.every(lesson => lesson.activity?.prompt), "Cada experiencia contiene practica");
  check(course.lessons.every(lesson => Array.isArray(lesson.references) && lesson.references.length >= 2), "Cada experiencia muestra al menos dos referencias");
  check(course.lessons.every(lesson => lesson.references.every(reference => referenceText(reference).length > 40)), "Las referencias APA fueron resueltas a texto completo");
  check(course.lessons.some(lesson => Array.isArray(lesson.content) && lesson.content.length > 0), "Riesgo registrado: course-data.js publica contenido interno de lecciones");
  check(course.lessons.some(lesson => lesson.activity?.options?.some(option => "feedback" in option || "correct" in option)), "Riesgo registrado: course-data.js publica actividades, feedback o criterios");

  const pedagogicalIds = [
    "m0-l1", "m0-l2",
    "m1-l1", "m1-l2",
    "m2-l1", "m2-l2",
    "m3-l1", "m3-l2",
    "m4-l1", "m4-l2",
    "m5-l1", "m5-l2",
    "m6-l1", "m6-l2",
    "m7-l1", "m7-l2",
    "m8-l1", "m8-l2", "m8-l3"
  ];
  const pedagogicalLessons = pedagogicalIds.map(id => course.lessons.find(lesson => lesson.id === id));
  const internalReferenceIds = new Set(["nist", "oecd", "unesco", "zhang"]);
  const requiredProgressFields = [
    "selectedIndex", "correct", "attempts", "feedbackReviewed", "response",
    "wordCount", "criteriaReviewed", "modelAnswerViewed", "confidence", "status"
  ];

  check(course.pedagogicalModel?.id === "aula-viva-pedagogy-v1", "El curso declara el modelo pedagogico reusable Aula Viva v1");
  check(
    requiredProgressFields.every(field => course.pedagogicalModel?.progressSchema?.includes(field)),
    "El modelo declara todos los campos de progreso pedagogico compatibles"
  );
  check(pedagogicalLessons.every(Boolean), "Existen las 19 experiencias pedagogicas esperadas");
  check(
    course.lessons.every(lesson => lesson.pedagogyVersion === "1.1"),
    "Las 19 experiencias usan el modelo pedagogico 1.1"
  );
  const expectedTitles = [
    "Una decisión antes de comenzar",
    "Cómo aprenderemos",
    "Qué hace realmente una IA generativa",
    "La responsabilidad sigue siendo humana",
    "VALOR: antes de usar la herramienta",
    "Cuándo no conviene usar IA",
    "CLARO: instrucciones revisables",
    "Reducir ambigüedad sin sobrecargar",
    "VERIFICA: controlar antes de usar",
    "Fuentes, actualidad y trazabilidad",
    "Datos personales, privacidad y minimización",
    "Autoría, licencias y uso responsable de contenidos",
    "DETENER una solicitud sospechosa",
    "Aprender del incidente sin culpabilizar",
    "Cuando una recomendación afecta a personas",
    "Conversar el cambio sin instalar miedo",
    "Diseña tu flujo responsable",
    "Plan de transferencia a 30 días",
    "Cierre y compromiso de criterio"
  ];
  check(
    pedagogicalLessons.every((lesson, index) => lesson?.title === expectedTitles[index]),
    "Los 19 titulos siguen el manual y conservan las dos experiencias aprobadas"
  );

  for (const lesson of pedagogicalLessons.filter(Boolean)) {
    const referenceValues = lesson.references.map(reference => referenceText(reference).trim().toLowerCase());
    check(lesson.pedagogyVersion === "1.1", `${lesson.id} usa la version pedagogica 1.1`);
    check(lesson.duration && lesson.objective && lesson.scenario, `${lesson.id} conserva duracion, objetivo y situacion`);
    check(
      Array.isArray(lesson.studySections)
        && lesson.studySections.length >= 3
        && lesson.studySections.every(section => section.title && section.paragraphs?.length),
      `${lesson.id} contiene material de estudio segmentado y sustantivo`
    );
    check(
      lesson.studySections.reduce((total, section) => total + section.paragraphs.length, 0) >= 6,
      `${lesson.id} no reduce el manual a dos parrafos`
    );
    check(Array.isArray(lesson.workedExample) && lesson.workedExample.length >= 2, `${lesson.id} incluye ejemplo desarrollado`);
    check(Array.isArray(lesson.keypoints) && lesson.keypoints.length >= 4, `${lesson.id} incluye lo que la persona debe poder explicar`);
    check(Array.isArray(lesson.summary) && lesson.summary.length >= 2, `${lesson.id} incluye sintesis final`);
    check(
      lesson.references.length >= 2 && lesson.references.every(isCompleteApaReference),
      `${lesson.id} contiene referencias APA 7 completas con URL`
    );
    check(
      referenceValues.every(reference => !internalReferenceIds.has(reference)),
      `${lesson.id} no muestra identificadores internos como referencias`
    );
    check(
      Array.isArray(lesson.activity?.instructions) && lesson.activity.instructions.length >= 3,
      `${lesson.id} presenta instrucciones visibles antes de la actividad`
    );
    check(lesson.activity?.allowRetry === true, `${lesson.id} permite reintentos o mejoras`);
    check(lesson.completion?.requiresFeedbackReview === true, `${lesson.id} exige revisar retroalimentacion antes de completar`);

    if (lesson.image) {
      const imageRatio = lesson.image.width / lesson.image.height;
      const pngPath = lesson.image.src.replace(/^(?:\.\.\/){4}/, "");
      const webpPath = lesson.image.webp.replace(/^(?:\.\.\/){4}/, "");
      const pngSize = fs.existsSync(path.join(repoRoot, pngPath))
        ? fs.statSync(path.join(repoRoot, pngPath)).size
        : 0;
      const webpSize = fs.existsSync(path.join(repoRoot, webpPath))
        ? fs.statSync(path.join(repoRoot, webpPath)).size
        : 0;
      check(
        lesson.image.src.endsWith(".png")
          && lesson.image.webp.endsWith(".webp")
          && lesson.image.alt.length >= 80
          && lesson.image.caption?.length >= 40
          && Number.isFinite(lesson.image.width)
          && Number.isFinite(lesson.image.height)
          && Math.abs(imageRatio - (16 / 9)) < 0.01
          && pngSize > 0
          && webpSize > 0
          && webpSize < pngSize,
        `${lesson.id} declara imagen 16:9 accesible, respaldo PNG y WebP optimizado`
      );
    }

    if (lesson.activity.type === "decision") {
      check(
        lesson.activity.options.length >= 3
          && lesson.activity.options.filter(option => option.correct).length === 1
          && lesson.activity.options.every(option => option.feedback?.length >= 70),
        `${lesson.id} define una decision cerrada con feedback especifico por alternativa`
      );
      check(
        lesson.activity.expectedCriterion?.length >= 120 && lesson.activity.reviewSection,
        `${lesson.id} explica el criterio esperado y la seccion que conviene releer`
      );
      check(
        lesson.completion.requiresAnswer
          && lesson.completion.requiresCorrectAnswer
          && lesson.completion.requiresFeedbackReview
          && lesson.completion.allowRetry
          && lesson.completion.attemptsAreNotPenalized,
        `${lesson.id} exige acierto y feedback, y permite reintentar sin penalizacion`
      );
    } else {
      const requiredCriteria = lesson.activity.requiredCriteria || [];
      const modelAnswerWords = wordCount((lesson.activity.modelAnswer || []).join(" "));
      const minimumWords = lesson.activity.minimumWords;
      const maximumWords = lesson.activity.maximumWords;
      check(
        lesson.activity.type === "reflection"
          && Number.isInteger(minimumWords)
          && Number.isInteger(maximumWords)
          && minimumWords >= 80
          && maximumWords > minimumWords,
        `${lesson.id} define una practica abierta con limites coherentes`
      );
      check(
        requiredCriteria.length >= 4
          && new Set(requiredCriteria.map(criterion => criterion.id)).size === requiredCriteria.length
          && requiredCriteria.every(criterion => criterion.label && criterion.description),
        `${lesson.id} incluye una rubrica explicita y no duplicada`
      );
      check(
        Array.isArray(lesson.activity.modelAnswer)
          && lesson.activity.modelAnswer.length >= 2
          && modelAnswerWords >= minimumWords
          && modelAnswerWords <= maximumWords,
        `${lesson.id} ofrece una respuesta modelo posterior dentro del rango`
      );
      check(
        lesson.activity.responseLabel
          && lesson.activity.rubricTitle
          && lesson.activity.criteriaRequirement
          && lesson.activity.allowRetry,
        `${lesson.id} presenta rotulo, rubrica, reintento y criterio de revision`
      );
      check(
        lesson.completion.requiresSavedResponse
          && lesson.completion.minimumWords === minimumWords
          && lesson.completion.maximumWords === maximumWords
          && lesson.completion.requiresAllCriteria
          && lesson.completion.requiresModelAnswerView
          && lesson.completion.requiresFeedbackReview
          && lesson.completion.allowEditing,
        `${lesson.id} exige borrador, rango, rubrica, modelo y mejora`
      );
    }
  }

  const imageLessonIds = pedagogicalLessons.filter(lesson => lesson?.image).map(lesson => lesson.id);
  check(
    ["m0-l1", "m2-l1", "m4-l2", "m5-l1", "m7-l1", "m8-l1", "m8-l2"]
      .every(id => imageLessonIds.includes(id))
      && imageLessonIds.length === 7,
    "Las siete imagenes se asignan una vez y por funcion pedagogica"
  );
  check(
    pedagogicalLessons.filter(lesson => lesson?.activity?.type === "decision").length === 7
      && pedagogicalLessons.filter(lesson => lesson?.activity?.type === "reflection").length === 12,
    "El curso combina siete decisiones cerradas y doce practicas abiertas"
  );

  const orientation = course.lessons.find(lesson => lesson.id === "m0-l1");
  check(orientation.studySections.length === 3, "m0-l1 desarrolla adopcion, acuerdos minimos e innovacion con limites");
  check(
    orientation.activity.type === "decision"
      && orientation.activity.options.length === 4
      && orientation.activity.options.filter(option => option.correct).length === 1
      && orientation.activity.options.every(option => option.feedback?.length >= 70),
    "m0-l1 define una decision con alternativa correcta y retroalimentacion especifica"
  );
  check(
    orientation.activity.expectedCriterion?.length >= 120 && orientation.activity.reviewSection,
    "m0-l1 explica el criterio esperado y la seccion que conviene releer"
  );
  check(
    orientation.completion.requiresAnswer
      && orientation.completion.requiresCorrectAnswer
      && orientation.completion.requiresFeedbackReview
      && orientation.completion.allowRetry
      && orientation.completion.attemptsAreNotPenalized,
    "m0-l1 bloquea la finalizacion incorrecta, exige feedback y registra reintentos sin penalizacion"
  );

  const valor = course.lessons.find(lesson => lesson.id === "m2-l1");
  const valorSectionTitles = valor.studySections.map(section => section.title);
  const valorCriteriaIds = valor.activity.requiredCriteria.map(criterion => criterion.id);
  const modelAnswerWords = wordCount(valor.activity.modelAnswer.join(" "));
  check(
    ["V — Valor esperado", "A — Afectación a personas", "L — Límites de datos", "O — Observabilidad del resultado", "R — Responsable final"]
      .every(title => valorSectionTitles.includes(title)),
    "m2-l1 desarrolla las cinco dimensiones de VALOR"
  );
  check(
    valor.studySections.filter(section => /^[VALOR]\s—/u.test(section.title))
      .every(section => section.questions?.length >= 2 && section.contrast?.insufficient && section.contrast?.adequate),
    "m2-l1 incluye preguntas orientadoras y respuestas insuficientes y adecuadas para cada dimension"
  );
  check(
    valor.comparison?.rows?.length === 3
      && valor.comparison.rows.some(row => /correo/i.test(row.task))
      && valor.comparison.rows.some(row => /reclamo/i.test(row.task))
      && valor.comparison.rows.some(row => /desempeño/i.test(row.task)),
    "m2-l1 compara correos, reclamos y evaluacion de desempeño"
  );
  check(
    valor.activity.type === "reflection"
      && valor.activity.minimumWords === 180
      && valor.activity.maximumWords === 280,
    "m2-l1 define practica abierta de 180 a 280 palabras"
  );
  check(
    valor.activity.requiredCriteria.length === 5
      && new Set(valorCriteriaIds).size === 5
      && valor.activity.requiredCriteria.every(criterion => criterion.label && criterion.description),
    "m2-l1 incluye una rubrica de autoevaluacion con cinco criterios VALOR"
  );
  check(
    Array.isArray(valor.activity.modelAnswer)
      && modelAnswerWords >= valor.activity.minimumWords
      && modelAnswerWords <= valor.activity.maximumWords,
    "m2-l1 incluye una respuesta modelo dentro del rango solicitado"
  );
  check(
    valor.completion.requiresSavedResponse
      && valor.completion.minimumWords === 180
      && valor.completion.maximumWords === 280
      && valor.completion.requiresAllCriteria
      && valor.completion.requiresModelAnswerView
      && valor.completion.requiresFeedbackReview
      && valor.completion.allowEditing,
    "m2-l1 exige borrador guardado, rango, cinco criterios, modelo y mejora"
  );

  const courseJs = read("sembrar/aula/curso/ia-con-criterio-humano/course.js");
  const courseHtml = read("sembrar/aula/curso/ia-con-criterio-humano/index.html");
  const courseCss = read("sembrar/aula/aula.css");
  check(
    /schemaVersion:\s*PEDAGOGY_SCHEMA/.test(courseJs)
      && requiredProgressFields.slice(0, 8).every(field => courseJs.includes(field)),
    "El motor serializa el progreso pedagogico dentro de la respuesta compatible"
  );
  check(
    /if\s*\(typeof raw === "string"\)/.test(courseJs)
      && /wordCount\(raw\)/.test(courseJs)
      && /savedDraft:\s*Boolean\(raw\.trim\(\)\)/.test(courseJs),
    "El motor migra respuestas de progreso antiguas en formato texto"
  );
  check(
    /state\.correct\s*&&\s*state\.feedbackReviewed/.test(courseJs)
      && /control\.disabled\s*=\s*!completion\.ready/.test(courseJs),
    "El motor deshabilita completar hasta cumplir la decision y la retroalimentacion"
  );
  check(
    /wordCount\(response\.value\)/.test(courseJs)
      && /minimumWords/.test(courseJs)
      && /maximumWords/.test(courseJs),
    "El motor cuenta palabras en tiempo real y aplica ambos limites"
  );
  check(
    /state\.savedDraft[\s\S]*allCriteria[\s\S]*state\.modelAnswerViewed[\s\S]*state\.feedbackReviewed/.test(courseJs),
    "El motor exige borrador, criterios y respuesta modelo para la practica abierta"
  );
  check(
    /state\.savedDraft\s*\?[\s\S]*view-model-answer/.test(courseJs)
      && /modelAnswerViewed:\s*true/.test(courseJs),
    "La respuesta modelo se habilita solo despues de guardar un intento"
  );
  check(
    /role="status"/.test(courseJs)
      && /setAttribute\("role",\s*"alert"\)/.test(courseJs)
      && /aria-pressed/.test(courseJs)
      && /<label/.test(courseJs)
      && /<button/.test(courseJs),
    "Los componentes interactivos usan botones, labels y mensajes accesibles"
  );
  check(
    /target="_blank"\s+rel="noopener noreferrer"/.test(courseJs),
    "Las referencias externas abren con noopener y noreferrer"
  );
  check(
    /<main[^>]+id="lesson-content"/.test(courseHtml)
      && /<article[^>]+id="lesson-frame"/.test(courseHtml)
      && /aria-label="Abrir menú del curso"/.test(courseHtml),
    "La pagina del curso usa regiones semanticas y nombre accesible en el menu movil"
  );
  check(
    /:focus-visible/.test(courseCss)
      && /prefers-reduced-motion:reduce/.test(courseCss)
      && /object-fit:cover/.test(courseCss),
    "La capa visual contempla foco, movimiento reducido e imagenes sin deformacion"
  );

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
