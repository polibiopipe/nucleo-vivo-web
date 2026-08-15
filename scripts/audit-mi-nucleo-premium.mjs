import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
let passed = 0;
const failures = [];

function file(path) {
  return readFileSync(resolve(root, path), "utf8");
}

function check(label, condition) {
  if (condition) passed += 1;
  else failures.push(label);
}

function includes(path, ...needles) {
  const source = file(path);
  needles.forEach((needle) => check(`${path}: contiene ${needle}`, source.includes(needle)));
}

const requiredRoutes = [
  "index.html",
  "mi-nucleo/index.html",
  "lab/index.html",
  "lab/empresa-viva/index.html",
  "lab/umbral-docente/index.html",
  "sembrar/index.html",
  "sembrar/cursos/index.html",
  "sembrar/aula/index.html",
  "privacidad/index.html",
  "terminos/index.html",
  "contacto/index.html"
];

requiredRoutes.forEach((path) => check(`${path}: existe`, existsSync(resolve(root, path))));
requiredRoutes.forEach((path) => check(`${path}: enlace para saltar al contenido`, file(path).includes("skip-link")));
check("logo oficial: existe", existsSync(resolve(root, "assets/nucleo-vivo-isotipo-oficial.svg")));
check("imagen social: existe", existsSync(resolve(root, "assets/og-nucleo-vivo.png")));

includes(
  "index.html",
  "Un ecosistema vivo para aprender, crear, practicar y transformar.",
  "Personas al centro · Tecnología como apoyo",
  "Entrar a Mi Núcleo",
  "Escucha Viva",
  "Empresa Viva",
  "Umbral Docente",
  "Sembrar / Aula Viva",
  "https://nucleovivo.net/assets/og-nucleo-vivo.png"
);

includes(
  "mi-nucleo/index.html",
  "Continuar con Google",
  "Crear cuenta",
  "Olvidé mi contraseña",
  "Política de Privacidad",
  "Consentimiento versión",
  "¿Qué área quieres priorizar?",
  "Psicología",
  "Docencia y educación",
  "Administración / Ingeniería Comercial",
  "Explorar todo",
  "Hola, <span id=\"member-name\"",
  "id=\"mis-experiencias\"",
  "id=\"recomendado\"",
  "id=\"explorar\"",
  "id=\"herramientas\"",
  "id=\"privacidad-datos\"",
  "id=\"mi-cuenta\"",
  "id=\"ayuda\""
);

const miScript = file("mi-nucleo/mi-nucleo.js");
[
  "consentVersion: \"2026-08-15\"",
  "mi_nucleo_consent_accepted_at",
  "existing_session_gate",
  "signInWithPassword",
  "signUp",
  "resetPasswordForEmail",
  "signInWithOAuth",
  "statusCode",
  "entitlement",
  "mi_nucleo_priority",
  "handleSession(data.user)"
].forEach((needle) => check(`mi-nucleo.js: contiene ${needle}`, miScript.includes(needle)));
check("Mi Núcleo: no registra un consentimiento nuevo en cada login", !miScript.includes('recordConsent("signin")'));
check("Mi Núcleo: vista de QA limitada a entorno local", miScript.includes('["127.0.0.1", "localhost"]'));
check("Mi Núcleo: sin service role", !/service[_-]?role/i.test(miScript));
check("Mi Núcleo: sin Mercado Pago activo", !/mercadopago|mercado pago/i.test(miScript));

includes(
  "lab/index.html",
  "El espacio de experiencias aplicadas de Núcleo Vivo",
  "Escucha Viva",
  "Empresa Viva",
  "Umbral Docente",
  "Aplicación externa disponible",
  "Prototipo funcional"
);
includes("lab/empresa-viva/index.html", "Prototipo funcional · sesión local", "No guarda respuestas", "Observar la decisión");
includes("lab/umbral-docente/index.html", "Prototipo funcional · sesión local", "No diagnostica", "No almacena tus respuestas", "Ver mi orientación");
includes("lab/lab-experiences.js", "empresaFeedback", "umbralCopy", "result.focus");

const socialSource = `${file("script.js")}\n${file("contacto/index.html")}\n${file("mi-nucleo/index.html")}`;
[
  "https://www.instagram.com/nucleovivo.lt/",
  "https://www.tiktok.com/@nucleo.vivo?_r=1&_t=ZN-98suasuUXmZ",
  "https://www.facebook.com/profile.php?id=61593097242321"
].forEach((url) => check(`red social oficial: ${url}`, socialSource.includes(url)));
check("redes: nueva pestaña", socialSource.includes('target="_blank"'));
check("redes: noopener noreferrer", socialSource.includes('rel="noopener noreferrer"'));
check("redes: etiqueta accesible", socialSource.includes("aria-label"));

includes("privacidad/index.html", "Mi Núcleo", "Supabase", "Escucha Viva", "actividad local");
includes("terminos/index.html", "Mi Núcleo", "prototipos", "enlaces externos", "pagos");

const migration = file("supabase/migrations/20260815_mi_nucleo_consent.sql");
[
  "mi_nucleo_handle_signup_consent",
  "mi_nucleo_privacy_terms",
  "accepted_at",
  "context",
  "after insert on auth.users"
].forEach((needle) => check(`migración: contiene ${needle}`, migration.includes(needle)));
check("migración: declara límite de Escucha Viva", migration.includes("No pertenece ni modifica la infraestructura independiente de Escucha Viva"));

const styles = `${file("styles.css")}\n${file("pages.css")}\n${file("mi-nucleo/mi-nucleo.css")}`;
check("estilos: reduced motion", styles.includes("prefers-reduced-motion: reduce"));
check("estilos: foco visible", styles.includes(":focus-visible"));
check("estilos: órbitas", /orbit/i.test(styles));
check("estilos: hidden consistente", styles.includes('[hidden]'));

includes(
  "_redirects",
  "/mi-nucleo",
  "/lab/empresa-viva",
  "/lab/umbral-docente",
  "/sembrar/cursos/cuando-ensenar-agota"
);

for (const path of [
  "index.html",
  "mi-nucleo/index.html",
  "lab/index.html",
  "lab/empresa-viva/index.html",
  "lab/umbral-docente/index.html",
  "sembrar/index.html",
  "sembrar/cursos/index.html",
  "sembrar/aula/index.html"
]) {
  const source = file(path);
  check(`${path}: meta description`, /<meta\s+name="description"/m.test(source));
  check(`${path}: canonical`, source.includes('rel="canonical"'));
  check(`${path}: Open Graph`, source.includes('property="og:image"'));
}

if (failures.length) {
  console.error(`Audit Mi Núcleo Premium: ${passed} controles correctos, ${failures.length} fallos.`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Audit Mi Núcleo Premium: ${passed} controles correctos, 0 fallos.`);
}
