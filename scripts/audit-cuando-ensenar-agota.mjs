import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(process.argv[2] || ".");
const courseDir = path.join(root, "sembrar", "aula", "curso", "cuando-ensenar-agota");
const dataPath = path.join(courseDir, "course-data.js");
const indexPath = path.join(courseDir, "index.html");
const enginePath = path.join(root, "sembrar", "aula", "curso", "ia-con-criterio-humano", "course.js");
const corePath = path.join(root, "sembrar", "aula", "aula-core.js");
const dashboardPath = path.join(root, "sembrar", "aula", "index.html");
const catalogPath = path.join(root, "sembrar", "cursos", "index.html");
const programPath = path.join(root, "sembrar", "cursos", "cuando-ensenar-agota", "index.html");

const read = file => fs.readFileSync(file, "utf8");
const existsWithBytes = file => fs.existsSync(file) && fs.statSync(file).size > 0;
const normalizeText = value => JSON.stringify(value).normalize("NFC");

const context = vm.createContext({ window: {} });
vm.runInContext(read(dataPath), context, { filename: dataPath });
const course = context.window.IA_COURSE;
const courseIndex = read(indexPath);
const engine = read(enginePath);
const core = read(corePath);
const dashboard = read(dashboardPath);
const catalog = read(catalogPath);
const program = read(programPath);
const allText = normalizeText(course);

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`[OK ${String(passed).padStart(2, "0")}] ${name}`);
    return;
  }
  failed += 1;
  console.error(`[ERROR] ${name}${detail ? `: ${detail}` : ""}`);
}

const moduleMinutes = course.modules.reduce((sum, module) => {
  const match = String(module.duration || "").match(/\d+/);
  return sum + Number(match?.[0] || 0);
}, 0);
const ids = course.lessons.map(lesson => lesson.id);
const m1l1 = course.lessons.find(lesson => lesson.id === "m1-l1");
const decisions = course.lessons.filter(lesson => lesson.activity?.type === "decision");
const reflections = course.lessons.filter(lesson => lesson.activity?.type === "reflection");
const initialRender = engine.indexOf("${renderPreStudyDecision(lesson)}");
const videoRender = engine.indexOf("${renderVideo(lesson)}");
const observationRender = engine.indexOf("${renderPostVideoQuestions(lesson)}");
const studyRender = engine.indexOf("${renderStudySections(lesson)}");
const captionsPath = path.join(courseDir, m1l1?.video?.captions || "");
const transcriptPath = path.join(courseDir, m1l1?.video?.transcript || "");
const videoPath = path.join(root, "assets", "media", "aula", "cuando-ensenar-agota", "cuando-ensenar-agota.mp4");

check("Objeto de curso cargable", Boolean(course?.modules && course?.lessons));
check("Slug canónico", course.slug === "cuando-ensenar-agota");
check("Nueve módulos M0-M8", course.modules.length === 9 && course.modules.every((item, index) => item.id === `m${index}`));
check("Diecinueve experiencias", course.lessons.length === 19);
check("Identificadores únicos", new Set(ids).size === ids.length);
check("Duración total de 425 minutos", course.estimatedMinutes === 425 && moduleMinutes === 425, `declarada=${course.estimatedMinutes}, módulos=${moduleMinutes}`);
check("Versión pedagógica completa", course.lessons.every(lesson => lesson.pedagogyVersion === "1.1"));
check("Objetivo, escenario y estudio en cada experiencia", course.lessons.every(lesson =>
  lesson.objective && lesson.scenario && Array.isArray(lesson.studySections) && lesson.studySections.length
));
check("Recuperación y síntesis en cada experiencia", course.lessons.every(lesson =>
  Array.isArray(lesson.keypoints) && lesson.keypoints.length && Array.isArray(lesson.summary) && lesson.summary.length
));
check("Puente explícito al módulo siguiente", course.modules.slice(0, -1).every((module, index) => {
  const close = module.lessons.at(-1)?.summary?.join(" ") || "";
  return close.includes(`M${index + 1}`) || close.includes("¿");
}));
check("Fuentes en cada experiencia", course.lessons.every(lesson => Array.isArray(lesson.references) && lesson.references.length));
check("Actividades de decisión configuradas", decisions.length > 0 && decisions.every(lesson =>
  lesson.activity.options?.length >= 2 && lesson.activity.options.some(option => option.correct === true)
));
check("Prácticas abiertas con rúbrica", reflections.length > 0 && reflections.every(lesson =>
  lesson.activity.minimumWords > 0 && lesson.activity.requiredCriteria?.length >= 3
));
check("Caso continuo de Andrea en todos los módulos", course.modules.every(module =>
  module.lessons.some(lesson => /Andrea/u.test(`${lesson.scenario} ${lesson.summary?.join(" ") || ""}`))
));
check("Mensaje de privacidad explícito", /solo en este navegador|solamente en este navegador/iu.test(allText));
check("Alcance no clínico explícito", /no (entrega|constituye|permite).*diagn[oó]stic/iu.test(allText));
check("Cinco mensajes de cuidado visibles", [
  "Esta experiencia no entrega diagnósticos",
  "Puedes trabajar con Andrea o con una situación ficticia",
  "No necesitas revelar experiencias personales",
  "La bitácora es privada por defecto",
  "Una señal orienta preguntas; no confirma una condición",
].every(message => allText.includes(message)));
check("Expresiones prohibidas ausentes", [
  "autodiagnóstico",
  "test de burnout",
  "tienes burnout",
  "falta de vocación",
  "si descansar no basta, es agotamiento",
].every(message => !allText.toLocaleLowerCase("es").includes(message)));
check("Evaluación con pesos completos", Object.values(course.assessment.weights).reduce((sum, value) => sum + value, 0) === 100);
check("Criterios críticos de cuidado", course.assessment.criticalCriteria.includes("privacidad/no diagnóstico") && course.assessment.criticalCriteria.includes("responsabilidad organizacional"));

check("M1 inicia con decisión provisional", Boolean(m1l1?.preStudyDecision?.options?.length));
check("Video obligatorio asociado a M1-L1", Boolean(m1l1?.video?.mandatory && m1l1.video.src));
check("Orden decisión → video → preguntas → microlección", initialRender >= 0 && initialRender < videoRender && videoRender < observationRender && observationRender < studyRender);
check("Video local disponible", existsWithBytes(videoPath));
check("Reproductor con controles y sin autoplay", /<video[\s\S]*?\bcontrols\b/iu.test(engine) && !/<video[\s\S]*?\bautoplay\b/iu.test(engine));
check("Carga diferida y reanudación del video", /IntersectionObserver/u.test(engine) && /loadedmetadata/u.test(engine) && /mediaKey/u.test(engine));
check("Video o alternativa textual requeridos para completar", /videoCompleted/iu.test(engine) && /transcripción accesible/iu.test(engine));
check("Subtítulos VTT disponibles", existsWithBytes(captionsPath) && read(captionsPath).startsWith("WEBVTT"));
check("Transcripción accesible disponible", existsWithBytes(transcriptPath) && /Descripción visual equivalente/iu.test(read(transcriptPath)));
check("Aclaración conceptual visible después del video", /Estrés, agotamiento emocional y burnout no son equivalentes/iu.test(m1l1.video.clarification));
check("Tres preguntas posteriores al video", m1l1.postVideoQuestions?.length === 3);
check("Dato TALIS corregido", m1l1.infographic?.stat === "27 %" && /19 %/u.test(m1l1.infographic.comparison));

const downloads = [
  "bitacora-cuando-ensenar-agota.pdf",
  "plantilla-plan-vivo.pdf",
  "resumen-conceptos-esenciales.pdf",
  "referencias-y-lecturas.pdf",
].map(file => path.join(courseDir, "recursos", file));
check("Cuatro recursos PDF generados", downloads.every(existsWithBytes));
check("Práctica espaciada 2-7-14-30", [2, 7, 14, 30].every(day => new RegExp(`D[ií]a ${day}`, "iu").test(allText)));
check("Imágenes optimizadas disponibles", [
  "video-poster.webp",
  "bitacora-como-llegue.webp",
  "bitacora-mochila.webp",
  "bitacora-recuperar.webp",
].every(file => existsWithBytes(path.join(root, "assets", "images", "aula", "cuando-ensenar-agota", file))));

check("Configuración local aislada antes del núcleo", courseIndex.indexOf("localCourse: true") < courseIndex.indexOf('src="../../aula-core.js"'));
check("Sin sincronización remota del segundo curso", /localCourse:\s*true/iu.test(courseIndex) && /enableRemoteSync:\s*false/iu.test(courseIndex));
check("Núcleo soporta almacenamiento por curso", /localCourseOwners/iu.test(core) && /CONFIG\.localCourse/iu.test(core));
check("Catálogo enlaza el programa", /sembrar\/cursos\/cuando-ensenar-agota/iu.test(catalog));
check("Mi Aula enlaza el curso", /aula\/curso\/cuando-ensenar-agota/iu.test(dashboard));
check("Programa público disponible", /Cuando enseñar agota/iu.test(program) && /19 experiencias/iu.test(program));

console.log(`\nResultado: ${passed} controles aprobados; ${failed} errores.`);
if (failed) process.exitCode = 1;
