import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");
const html = read("mi-nucleo/index.html");
const script = read("mi-nucleo/mi-nucleo.js");
const config = read("mi-nucleo/mi-nucleo-config.js");
const readiness = read("docs/mi-nucleo-auth-readiness.md");
let passed = 0;
const failures = [];

function check(label, condition) {
  if (condition) passed += 1;
  else failures.push(label);
}

check("configuración propia: objeto global explícito", config.includes("window.MI_NUCLEO_CONFIG = Object.freeze"));
check("Google: false por defecto", /enableGoogleAuth:\s*false/.test(config));
check("Google: flag ya no está forzado en mi-nucleo.js", !/enableGoogleAuth:\s*false/.test(script));
check("Google: mi-nucleo.js lee su configuración", script.includes("...(window.MI_NUCLEO_CONFIG || {})"));
check("Google: botón oculto en HTML", /id="google-auth-button"[^>]*\shidden(?:\s|>)/.test(html));
check("Google: separador oculto en HTML", /id="auth-divider"[^>]*\shidden(?:\s|>)/.test(html));
check("Google: activación exige booleano true", script.includes("CONFIG.enableGoogleAuth === true"));
check("Google: visibilidad depende del flag estricto", script.includes('$("#google-auth-button").hidden = !googleAuthEnabled') && script.includes('$("#auth-divider").hidden = !googleAuthEnabled'));
check("Google: handler también respeta el flag", script.includes("if (CONFIG.enableGoogleAuth !== true || state.demo || !state.client) return"));
check("Google: conserva provider google y redirect seguro", /signInWithOAuth\(\{\s*provider:\s*"google",\s*options:\s*\{\s*redirectTo:\s*redirectUrl\(\)/s.test(script));

check("registro: conserva emailRedirectTo", /signUp\(\{[\s\S]*?emailRedirectTo:\s*redirectUrl\(\)/.test(script));
check("recuperación: conserva redirectTo", /resetPasswordForEmail\(email,\s*\{\s*redirectTo:\s*redirectUrl\(\)\s*\}\)/.test(script));
check("reenvío: conserva emailRedirectTo", /resend\(\{[\s\S]*?type:\s*"signup"[\s\S]*?emailRedirectTo:\s*redirectUrl\(\)/.test(script));
check("redirect: usa /mi-nucleo/ en el mismo origin", /new URL\("\/mi-nucleo\/",\s*window\.location\.origin\)\.toString\(\)/.test(script));

check("sesión: persistencia habilitada", script.includes("persistSession: true") && script.includes("autoRefreshToken: true") && script.includes("detectSessionInUrl: true"));
check("sesión: arranque consulta getSession", script.includes("state.client.auth.getSession()"));
check("sesión: callbacks válidos se procesan", script.includes('["SIGNED_IN", "PASSWORD_RECOVERY"].includes(event)') && script.includes("handleSession(session.user"));
check("recuperación: evento fuerza gate de contraseña", script.includes('recovery: event === "PASSWORD_RECOVERY"') && script.includes("options.recovery || isRecoveryUrl()"));

const configIndex = html.indexOf('src="mi-nucleo-config.js"');
const demoGateIndex = html.indexOf("window.MI_NUCLEO_DEMO");
const appScriptIndex = html.indexOf('src="mi-nucleo.js');
check("carga: configuración propia precede al gate demo", configIndex >= 0 && configIndex < demoGateIndex);
check("carga: configuración propia precede a la aplicación", configIndex >= 0 && configIndex < appScriptIndex);
check("demo: no carga configuración de Aula", /if \(!window\.MI_NUCLEO_DEMO\)\s*\{\s*document\.write\('\<script src="\.\.\/sembrar\/aula\/aula-config\.js"/s.test(html));
check("demo: no carga SDK de Supabase", /if \(!window\.MI_NUCLEO_DEMO && window\.AULA_VIVA_CONFIG\?\.supabaseUrl/.test(html));
check("demo: sale antes de crear cliente", script.indexOf("if (DEMO_VIEW)") >= 0 && script.indexOf("if (DEMO_VIEW)") < script.indexOf("window.supabase.createClient"));
check("demo: cliente y consentimiento quedan nulos", /function enterDemo\(\)\s*\{[\s\S]*?state\.client = null;[\s\S]*?state\.consentRecord = null;/.test(script));
check("demo: no registra consentimiento", script.includes('if (state.demo) throw new Error("La vista demostrativa no registra consentimiento.")'));
check("demo: no guarda actividad", /function trackProduct\(productId\)\s*\{\s*if \(state\.demo\) return;/.test(script));

check("frontend: sin secretos privados", !/(service[_-]?role|sb_secret_|client[_-]?secret|google[_-]?client[_-]?id|ghp_[A-Za-z0-9]|sk_live_)/i.test([config, script, html].join("\n")));
check("documentación: contiene apartados A-K", [..."ABCDEFGHIJK"].every((letter) => readiness.includes(`## ${letter}.`)));
check("documentación: marca valores de panel", readiness.includes("obtener desde Supabase") && readiness.includes("obtener desde Google Cloud"));

const protectedDiff = execFileSync("git", [
  "diff",
  "--name-only",
  "--",
  "lab/empresa-viva/app",
  "lab/umbral-docente/app",
  "sembrar/aula",
  "supabase"
], { cwd: root, encoding: "utf8" }).trim();
check("zonas protegidas: sin cambios en worktree", protectedDiff === "");

if (failures.length) {
  console.error(`Preparación auth Mi Núcleo: ${failures.length} fallo(s).`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Preparación auth Mi Núcleo: ${passed} controles correctos, 0 fallos.`);
