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
const stylesPath = path.join(root, "sembrar", "aula", "aula.css");
const editorialAuditPath = path.join(courseDir, "REVISION_EDITORIAL_INTERNA.md");

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
const styles = read(stylesPath);
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
const personalChoices = course.lessons.filter(lesson => lesson.activity?.type === "personal-choice");
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
check("Dos elecciones personales de M0 sin respuesta correcta", personalChoices.length === 2
  && personalChoices.every(lesson => lesson.moduleId === "m0"
    && lesson.activity.options?.length >= 6
    && lesson.activity.options.every(option => typeof option === "string")));
check("Orientación completa en las 19 experiencias", course.lessons.every(lesson => {
  const guide = lesson.studentGuide;
  return guide?.action && guide?.time && guide?.materials && guide?.response && guide?.keep && guide?.beforeContinue;
}));
check("Clasificación pedagógica visible y acotada", course.lessons.every(lesson =>
  ["private", "practice", "evaluated"].includes(lesson.studentGuide?.category)
) && personalChoices.every(lesson => lesson.studentGuide.category === "private"));
check("Caso continuo de Andrea en todos los módulos", course.modules.every(module =>
  module.lessons.some(lesson => /Andrea/u.test(`${lesson.scenario} ${lesson.summary?.join(" ") || ""}`))
));
check("Mensaje de privacidad explícito", /solo en este navegador|solamente en este navegador/iu.test(allText));
check("Alcance no clínico concentrado en momentos clave", ["m1-l1", "m5-l1", "m8-l2", "m8-l3"].every(id => {
  const lesson = course.lessons.find(item => item.id === id);
  return /diagn[oó]stic|atenci[oó]n profesional/iu.test(normalizeText(lesson));
}));
check("Bienvenida centrada en la persona antes que en Andrea", [
  "Antes de comenzar, deja por un momento en pausa a tus estudiantes",
  "No necesitas resolver nada todavía.",
  "Este espacio comienza contigo.",
  "¿Cómo llegaste hoy?",
].every(message => allText.includes(message))
  && !course.lessons[0].scenario.includes("Andrea"));
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
check("Fuente real, metadatos y reanudación del video", /<source[^>]*src="\$\{escapeHtml\(video\.src\)\}"[^>]*type="video\/mp4"/u.test(engine) && /preload="metadata"/u.test(engine) && /loadedmetadata/u.test(engine) && /mediaKey/u.test(engine));
check("Póster visible antes de la decisión", /video-poster-preview/u.test(engine) && /Registra primero tu explicación inicial para habilitar el video/u.test(engine));
check("Duración real declarada y guía previa", m1l1.video.duration === "8:29"
  && m1l1.video.durationLabel === "8 MIN 29 S"
  && m1l1.video.reviewSteps?.length === 4
  && /subtítulos/iu.test(m1l1.video.accessibilityNote));
check("Reproducción explícita y accesible", /video-play-overlay/u.test(engine) && /Reproducir video/u.test(engine) && /video\.play\(\)/u.test(engine));
check("Error de carga con rutas alternativas", [
  "video-retry",
  "course-video-source",
  "Abrir video en otra pestaña",
  "Abrir transcripción",
  "Descargar subtítulos",
].every(fragment => engine.includes(fragment)));
check("Reproductor 16:9 con límites responsivos", /video-player-frame[\s\S]*max-width:900px/iu.test(styles)
  && /aspect-ratio:16\/9/iu.test(styles)
  && /max-height:min\(65vh,506px\)/iu.test(styles));
check("Video o alternativa textual requeridos para completar", /videoCompleted/iu.test(engine) && /transcripción accesible/iu.test(engine));
check("Subtítulos VTT disponibles", existsWithBytes(captionsPath) && read(captionsPath).startsWith("WEBVTT"));
check("Transcripción accesible disponible", existsWithBytes(transcriptPath) && /Descripción visual equivalente/iu.test(read(transcriptPath)));
check("Aclaración conceptual visible después del video", /Estrés, agotamiento emocional y burnout no son equivalentes/iu.test(m1l1.video.clarification));
check("Tres preguntas posteriores al video", m1l1.postVideoQuestions?.length === 3);
check("Dato TALIS corregido", m1l1.infographic?.stat === "27 %" && /19 %/u.test(m1l1.infographic.comparison));
check("Infografía original completa después de la microlección", Boolean(m1l1.postStudyImage?.fit === "contain" && /infografia-agotamiento/iu.test(m1l1.postStudyImage.src)));

const downloads = [
  "apunte-academico-cuando-ensenar-agota.pdf",
  "bitacora-cuando-ensenar-agota.pdf",
  "material-aprendizaje-modulos.pdf",
  "plantilla-plan-vivo.pdf",
  "resumen-conceptos-esenciales.pdf",
  "referencias-y-lecturas.pdf",
].map(file => path.join(courseDir, "recursos", file));
check("Seis recursos PDF generados", downloads.every(existsWithBytes));
check("Apunte principal y material por módulos enlazados en M0", [
  "recursos/apunte-academico-cuando-ensenar-agota.pdf",
  "recursos/material-aprendizaje-modulos.pdf",
].every(href => allText.includes(href)));
check("Práctica espaciada 2-7-14-30", [2, 7, 14, 30].every(day => new RegExp(`D[ií]a ${day}`, "iu").test(allText)));
check("Imágenes optimizadas disponibles", [
  "video-poster.webp",
  "bitacora-como-llegue.webp",
  "bitacora-mochila.webp",
  "bitacora-recuperar.webp",
].every(file => existsWithBytes(path.join(root, "assets", "images", "aula", "cuando-ensenar-agota", file))));
check("Render reconoce orientación vertical", /lesson-figure--portrait/u.test(engine) && /image\.height\).*image\.width/su.test(engine));
check("CSS conserva imágenes verticales completas", /\.lesson-figure--portrait picture[\s\S]*aspect-ratio:auto/iu.test(styles) && /\.lesson-figure--portrait img[\s\S]*object-fit:contain/iu.test(styles));

check("Etiquetas humanas configuradas por curso", [
  "Lo que nos ayuda a mirar",
  "Andrea en contexto",
  "Ideas para quedarte",
  "Lo que abre esta experiencia",
  "Materiales para acompañar tu recorrido",
].every(label => Object.values(course.uiLabels || {}).includes(label)));
check("Etiquetas actuales conservadas como respaldo", [
  'studyKicker: "Estudiar"',
  'studyTitle: "Material para estudiar"',
  'exampleKicker: "Ver el criterio en acción"',
  'retrievalKicker: "Recuperar"',
  'synthesisKicker: "Cerrar y transferir"',
].every(label => engine.includes(label)));
check("M0 reconstruido con secuencia centrada en la persona", course.lessons[0]?.title === "Antes de comenzar: este espacio comienza contigo"
  && course.lessons[1]?.title === "¿Cómo llegué hoy?"
  && /bitacora-como-llegue-original/u.test(course.lessons[1]?.image?.src || "")
  && course.lessons[1]?.workedExample?.some(paragraph => paragraph.includes("Andrea")));
check("Actividad prescriptiva anterior retirada de M0", !allText.includes("¿Qué gesto abre mejor este recorrido?")
  && personalChoices.some(lesson => lesson.activity.options.includes("Todavía no lo sé; quiero descubrirlo durante el curso.")));
check("Sistema de orientación renderizado al inicio, antes de la actividad y al cierre", [
  "renderStudentGuide(lesson)",
  "renderActivityOrientation(lesson)",
  "completionMarkup(lesson, completion, completed)",
].every(fragment => engine.includes(fragment)));
check("Acuerdo de participación único en M0", Boolean(course.lessons[0]?.participationAgreement)
  && course.lessons.filter(lesson => lesson.participationAgreement).length === 1);
check("Auditoría editorial interna cubre las 19 experiencias", existsWithBytes(editorialAuditPath)
  && course.lessons.every(lesson => read(editorialAuditPath).includes(lesson.id)));
check("Tipografía Aula usa las nuevas escalas", [
  "clamp(2.4rem,4.4vw,4.2rem)",
  "clamp(1.9rem,3vw,2.8rem)",
  "clamp(1.65rem,2.6vw,2.5rem)",
  "clamp(2rem,3.4vw,3.2rem)",
  "clamp(2rem,3.6vw,3.4rem)",
].every(size => styles.includes(size)));

check("Configuración local aislada antes del núcleo", courseIndex.indexOf("localCourse: true") < courseIndex.indexOf('src="../../aula-core.js"'));
check("Sin sincronización remota del segundo curso", /localCourse:\s*true/iu.test(courseIndex) && /enableRemoteSync:\s*false/iu.test(courseIndex));
check("Núcleo soporta almacenamiento por curso", /localCourseOwners/iu.test(core) && /CONFIG\.localCourse/iu.test(core));
check("Catálogo enlaza el programa", /sembrar\/cursos\/cuando-ensenar-agota/iu.test(catalog));
check("Mi Aula enlaza el curso", /aula\/curso\/cuando-ensenar-agota/iu.test(dashboard));
check("Programa público disponible", /Cuando enseñar agota/iu.test(program) && /19 experiencias/iu.test(program));
check("Copias de catálogo y Mi Aula actualizadas", catalog.includes("Una experiencia para reconocer señales, comprender la carga docente y construir acciones personales, colectivas y organizacionales.")
  && dashboard.includes("Reconocer la carga, recuperar recursos y construir respuestas personales y colectivas.")
  && dashboard.includes("Tu bitácora y tu avance permanecen en este navegador."));

console.log(`\nResultado: ${passed} controles aprobados; ${failed} errores.`);
if (failed) process.exitCode = 1;
