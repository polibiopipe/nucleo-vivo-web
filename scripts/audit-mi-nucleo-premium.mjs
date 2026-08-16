import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
  "lab/empresa-viva/app/index.html",
  "lab/umbral-docente/index.html",
  "lab/umbral-docente/app/index.html",
  "sembrar/index.html",
  "sembrar/cursos/index.html",
  "sembrar/aula/index.html",
  "privacidad/index.html",
  "terminos/index.html",
  "contacto/index.html"
];

requiredRoutes.forEach((path) => check(`${path}: existe`, existsSync(resolve(root, path))));
requiredRoutes
  .filter((path) => !path.includes("/app/"))
  .forEach((path) => check(`${path}: enlace para saltar al contenido`, file(path).includes("skip-link")));
const officialLogo = "assets/nucleo-vivo-isotipo-oficial-original.jpg";
check("logo oficial adjunto: existe", existsSync(resolve(root, officialLogo)));
check("imagen social: existe", existsSync(resolve(root, "assets/og-nucleo-vivo.png")));

function sha256(path) {
  return createHash("sha256").update(readFileSync(resolve(root, path))).digest("hex").toUpperCase();
}

const officialAssetHashes = new Map([
  [officialLogo, "D8B42864D560B348EA3901CB368D49C6326E4D35D1000D929E6521EC6FBCE1E9"],
  ["assets/showcase/originals/escucha-viva-presentacion-oficial.png", "CF5985AB6188DF6AE7E24D10E334E890848469D09DBC43E17637D4B906B1382F"],
  ["assets/showcase/originals/umbral-docente-presentacion-oficial.png", "F2A5C69155AD231E8100944FA7A276341AC3B65AD1313CB59FD1B49F6C57D21E"],
  ["assets/showcase/originals/empresa-viva-presentacion-oficial.png", "EDABA4871ED34C0FE6F37CE33BEAC36A8CD0DA1042D9C0FB4EBEDD31E36E8007"]
]);
officialAssetHashes.forEach((expected, path) => check(`${path}: conserva el adjunto exacto`, existsSync(resolve(root, path)) && sha256(path) === expected));

const simulatorPresentations = [
  "assets/showcase/originals/escucha-viva-presentacion-oficial.png",
  "assets/showcase/originals/empresa-viva-presentacion-oficial.png",
  "assets/showcase/originals/umbral-docente-presentacion-oficial.png"
];
simulatorPresentations.forEach((path) => check(`${path}: presentación oficial disponible`, existsSync(resolve(root, path))));

const simulatorShowroomSource = [
  file("index.html"),
  file("mi-nucleo/index.html"),
  file("mi-nucleo/mi-nucleo.js"),
  file("lab/index.html"),
  file("lab/empresa-viva/index.html"),
  file("lab/umbral-docente/index.html")
].join("\n");
simulatorPresentations.forEach((path) => check(`${path}: integrada en el showroom`, simulatorShowroomSource.includes(path.split("/").at(-1))));
[
  "assets/showcase/escucha-viva.jpg",
  "assets/showcase/empresa-viva.jpg",
  "assets/showcase/umbral-docente.jpg",
  "escucha-viva-presentacion.webp",
  "empresa-viva-presentacion.webp",
  "umbral-docente-presentacion.webp"
].forEach((path) => check(`${path}: ya no se usa en el showroom`, !simulatorShowroomSource.includes(path)));

[
  file("index.html"),
  file("mi-nucleo/index.html"),
  file("lab/index.html"),
  file("lab/empresa-viva/index.html"),
  file("lab/umbral-docente/index.html")
].forEach((source, index) => check(`vista pública ${index + 1}: usa la fuente única de marca`, source.includes("nucleo-vivo-isotipo-oficial-original.jpg")));

includes(
  "index.html",
  "Un ecosistema vivo para aprender, crear, practicar y transformar.",
  "Personas al centro · Tecnología como apoyo",
  "Un punto de entrada · tres experiencias reales",
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
  "¿Olvidaste tu contraseña?",
  "Política de Privacidad",
  "Consentimiento versión",
  "¿Qué área quieres priorizar?",
  "Psicología",
  "Docencia y educación",
  "Administración / Ingeniería Comercial",
  "Explorar todo",
  "Un punto de entrada para experiencias y cursos",
  "Tus preferencias están sincronizadas",
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
check("Mi Núcleo: valida correo antes de autenticar", miScript.includes("Escribe un correo válido para continuar."));
check("Mi Núcleo: valida contraseña antes de autenticar", miScript.includes("Escribe tu contraseña para continuar."));
check("Mi Núcleo: recuperación valida formato de correo", miScript.includes("Escribe un correo válido para solicitar el restablecimiento."));

includes(
  "lab/index.html",
  "El espacio de experiencias aplicadas de Núcleo Vivo",
  "Escucha Viva",
  "Empresa Viva",
  "Umbral Docente",
  "Aplicación externa disponible",
  "Piloto abierto"
);
includes("lab/empresa-viva/index.html", "aplicación funcional", "/lab/empresa-viva/app/", "8 casos empresariales", "Entrar a la aplicación");
includes("lab/umbral-docente/index.html", "aplicación funcional", "/lab/umbral-docente/app/", "18 escenarios", "Entrar a la aplicación");
check("landings Lab: no existe simulador alternativo", !existsSync(resolve(root, "lab/lab-experiences.js")));
check("landing Empresa Viva: no contiene formulario alternativo", !file("lab/empresa-viva/index.html").includes("lab-experience-form"));
check("landing Umbral Docente: no contiene formulario alternativo", !file("lab/umbral-docente/index.html").includes("lab-experience-form"));
includes("lab/empresa-viva/app/index.html", "id=\"app\"", "./src/app.js");
includes("lab/umbral-docente/app/index.html", "premium-ui.js", "curriculum-bcep.js", "modules/storage.js");
includes("mi-nucleo/mi-nucleo.js", "/lab/empresa-viva/app/", "/lab/umbral-docente/app/");

const socialSource = `${file("script.js")}\n${file("contacto/index.html")}\n${file("mi-nucleo/index.html")}`;
[
  "https://www.instagram.com/nucleovivo.lt/",
  "https://www.tiktok.com/@nucleo.vivo?_r=1&_t=ZN-98suasuUXmZ",
  "https://www.facebook.com/profile.php?id=61593097242321"
].forEach((url) => check(`red social oficial: ${url}`, socialSource.includes(url)));
check("redes: nueva pestaña", socialSource.includes('target="_blank"'));
check("redes: noopener noreferrer", socialSource.includes('rel="noopener noreferrer"'));
check("redes: etiqueta accesible", socialSource.includes("aria-label"));

includes(
  "privacidad/index.html",
  "Núcleo Vivo</strong> administra este sitio",
  "datos personales tratados directamente",
  "Supabase",
  "jsDelivr",
  "Netlify y Vercel",
  "Actualmente no existe un plazo automático único",
  "Ley N.º 19.628",
  "se encuentra vigente actualmente",
  "1 de diciembre de 2026",
  "contacto@nucleovivo.net"
);
includes(
  "terminos/index.html",
  "Núcleo Vivo</strong> administra el sitio institucional",
  "Supabase",
  "jsDelivr",
  "Netlify o Vercel",
  "No existe hoy un plazo automático único",
  "Ley N.º 19.628 se encuentra vigente actualmente",
  "Ley N.º 21.719 entra en vigencia",
  "contacto@nucleovivo.net",
  "Google OAuth no están habilitados actualmente"
);

const migration = file("supabase/migrations/20260815_mi_nucleo_consent.sql");
[
  "mi_nucleo_handle_signup_consent",
  "mi_nucleo_privacy_terms",
  "accepted_at",
  "context",
  "after insert on auth.users"
].forEach((needle) => check(`migración: contiene ${needle}`, migration.includes(needle)));
check("migración: declara límite de Escucha Viva", migration.includes("No pertenece ni modifica la infraestructura independiente de Escucha Viva"));
check("migración: se declara opcional", migration.includes("puede funcionar sin aplicar esta migración hoy"));

const aulaConfig = file("sembrar/aula/aula-config.js");
check("Aula: conserva sincronización remota", aulaConfig.includes("enableRemoteSync: true"));
check("Aula: Mi Núcleo no añade flags a su configuración", !aulaConfig.includes("enableGoogleAuth"));

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
  "/lab/empresa-viva/app",
  "/lab/umbral-docente/app",
  "/sembrar/cursos/cuando-ensenar-agota"
);

for (const path of [
  "index.html",
  "mi-nucleo/index.html",
  "lab/index.html",
  "lab/empresa-viva/index.html",
  "lab/umbral-docente/index.html",
  "sembrar/index.html",
  "sembrar/cursos/index.html"
]) {
  const source = file(path);
  check(`${path}: meta description`, /<meta\s+name="description"/m.test(source));
  check(`${path}: canonical`, source.includes('rel="canonical"'));
  check(`${path}: Open Graph`, source.includes('property="og:image"'));
}

const aulaSource = file("sembrar/aula/index.html");
check("Aula: conserva meta description existente", /<meta\s+name="description"/m.test(aulaSource));
check("Aula: canonical premium queda fuera de alcance", !aulaSource.includes('rel="canonical"'));
check("Aula: Open Graph premium queda fuera de alcance", !aulaSource.includes('property="og:image"'));

if (failures.length) {
  console.error(`Audit Mi Núcleo Premium: ${passed} controles correctos, ${failures.length} fallos.`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Audit Mi Núcleo Premium: ${passed} controles correctos, 0 fallos.`);
}
