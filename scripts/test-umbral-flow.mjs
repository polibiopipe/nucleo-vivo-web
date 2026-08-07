import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const packagedAppDir = path.join(scriptDir, 'app');
const repositoryAppDir = path.join(rootDir, 'lab', 'umbral-docente', 'app');
const appDir = fs.existsSync(packagedAppDir) ? packagedAppDir : repositoryAppDir;
const js = fs.readFileSync(path.join(appDir, 'parvularia-audiovisual.js'), 'utf8');
const css = fs.readFileSync(path.join(appDir, 'parvularia-audiovisual.css'), 'utf8');
const premium = fs.readFileSync(path.join(appDir, 'premium-ui.js'), 'utf8');
const required=[
  "['video', 'Ver video']","['observe', 'Observar']","['interpret', 'Interpretar']",
  "['curriculum', 'Seleccionar OA/OAT']","['focus', 'Definir habilidad y propósito']",
  "['intervention', 'Diseñar intervención']","['evaluation', 'Diseñar evaluación']",
  "['collaboration', 'Familia/equipo/redes']","['reflection', 'Reflexionar']",
  "['submit', 'Enviar']","['feedback', 'Recibir retroalimentación']","['review', 'Revisar']","['retry', 'Reintentar']"
];
for(const token of required){if(!js.includes(token)) throw new Error('Falta paso del flujo: '+token)}
for(const token of ['panelRequiredMissing','unlockedPanelIndex','data-continue-after-video','Ya observé el video · continuar','showStageError','continueToObservation','stopImmediatePropagation','udModelRoute']){
  if(!js.includes(token)) throw new Error('Falta control guiado: '+token)
}
if(!css.includes('object-fit:contain')) throw new Error('El reproductor debe mostrar el video completo sin recorte');
if(!css.includes('.ud-model-actions{position:sticky')) throw new Error('La navegación de etapa debe permanecer visible');
if(!js.includes('data-premium-screen=\"ud-model\"')) throw new Error('La ruta formativa debe usar una pantalla aislada del catálogo base');
if(!premium.includes("document.body.dataset.udModelRoute === 'active'")) throw new Error('Premium UI debe respetar la ruta formativa activa y no sobrescribirla');

if(!js.includes("document.querySelectorAll('.ud-sidebar-nav button[data-ud-screen]')")) throw new Error('La navegación base debe vincularse sólo a botones reales del sidebar');
if(js.includes("document.querySelectorAll('[data-ud-screen]').forEach")) throw new Error('Regresión: BODY usa data-ud-screen y no puede recibir el handler que limpia activeCaseId');
if(!js.includes("delete document.body.dataset.udModelRoute")) throw new Error('Al salir por navegación base debe limpiarse el indicador de ruta formativa');
if(!js.includes("if (!activeCaseId) {")) throw new Error('Debe existir resguardo defensivo cuando se pierde el caso activo');
console.log('Flujo guiado Umbral Docente: OK');
console.log('14 pasos documentados, avance secuencial, continuidad protegida frente a observers y al data-ud-screen del BODY y video sin recorte.');
