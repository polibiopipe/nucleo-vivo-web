import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const packagedAppDir = path.join(scriptDir, 'app');
const repositoryAppDir = path.join(rootDir, 'lab', 'umbral-docente', 'app');
const appDir = fs.existsSync(packagedAppDir) ? packagedAppDir : repositoryAppDir;
const dataPath = path.join(appDir, 'parvularia-audiovisual-data.js');
const curriculumPath = path.join(appDir, 'curriculum-bcep.js');
const modulePath = path.join(appDir, 'parvularia-audiovisual.js');
const cssPath = path.join(appDir, 'parvularia-audiovisual.css');
const indexPath = path.join(appDir, 'index.html');

const dataSource = fs.readFileSync(dataPath, 'utf8');
const curriculumSource = fs.readFileSync(curriculumPath, 'utf8');
const moduleSource = fs.readFileSync(modulePath, 'utf8');
const cssSource = fs.readFileSync(cssPath, 'utf8');
const indexSource = fs.readFileSync(indexPath, 'utf8');

const context = { window: {} };
context.globalThis = context;
vm.runInNewContext(curriculumSource, context, { filename: curriculumPath, timeout: 5_000 });
vm.runInNewContext(dataSource, context, { filename: dataPath, timeout: 5_000 });
const cases = context.window.UMBRAL_PARVULARIA_AUDIOVISUAL_CASES;
const curriculum = context.window.UMBRAL_BCEP_CURRICULUM;

assert.equal(Array.isArray(cases), true, 'Los casos audiovisuales deben ser un arreglo');
assert.equal(cases.length, 8, 'El banco inicial debe contener ocho escenarios');
assert.deepEqual(Array.from(cases, item => item.id), ['SCM-01','SCM-02','SCM-03','SCM-04','SCM-05','SCM-06','SCM-07','SCM-08']);
assert.equal(new Set(cases.map(item => item.id)).size, 8, 'Los IDs deben ser únicos');
assert.equal(cases.filter(item => item.video).length, 7, 'Deben existir siete videos disponibles');
assert.equal(cases.filter(item => !item.video).length, 1, 'Debe existir un espacio planificado pendiente');

for (const item of cases) {
  for (const key of ['title','level','moment','summary','focus','tramo','tramoId','sublevelId','theme','caseVersion','whatVideoDoesNotSay','sourceVersion']) {
    assert.ok(item[key], `${item.id} requiere ${key}`);
  }
  assert.ok(Array.isArray(item.observe) && item.observe.length >= 5, `${item.id} requiere guía de observación`);
  assert.ok(Array.isArray(item.competencies) && item.competencies.length >= 4, `${item.id} requiere competencias`);
  assert.ok(Array.isArray(item.interpretationRisks) && item.interpretationRisks.length >= 3, `${item.id} requiere riesgos de interpretación`);
  if (item.video) {
    assert.ok(fs.existsSync(path.join(appDir, item.video)), `Falta el video de ${item.id}`);
    assert.ok(fs.existsSync(path.join(appDir, item.poster)), `Falta el poster de ${item.id}`);
  }
}

assert.equal(Array.isArray(curriculum), true, 'La planilla BCEP debe ser un arreglo');
assert.equal(curriculum.length, 206, 'La planilla debe contener los 206 OA/OAT verificados');
assert.equal(curriculum.filter(item => item.type === 'OA').length, 123, 'Deben existir 123 OA');
assert.equal(curriculum.filter(item => item.type === 'OAT').length, 83, 'Deben existir 83 OAT');
assert.equal(curriculum.filter(item => item.level === 'primer').length, 50, 'Sala Cuna debe contener 50 objetivos');
assert.equal(curriculum.filter(item => item.level === 'segundo').length, 71, 'Nivel Medio debe contener 71 objetivos');
assert.equal(curriculum.filter(item => item.level === 'tercer').length, 85, 'Transición debe contener 85 objetivos');
assert.equal(new Set(curriculum.map(item => item.id)).size, 206, 'Los IDs curriculares deben ser únicos');

for (const file of ['assets/umbral-docente-logo.png','curriculum-bcep.js','parvularia-audiovisual.css','parvularia-audiovisual-data.js','parvularia-audiovisual.js']) {
  assert.ok(fs.existsSync(path.join(appDir, file)), `Falta ${file}`);
}

assert.match(indexSource, /curriculum-bcep\.js/, 'index.html debe cargar la planilla BCEP');
assert.match(indexSource, /parvularia-audiovisual-data\.js/, 'index.html debe cargar los casos');
assert.match(indexSource, /parvularia-audiovisual\.js/, 'index.html debe cargar el modelo formativo');
assert.ok(indexSource.indexOf('curriculum-bcep.js') < indexSource.indexOf('parvularia-audiovisual-data.js'), 'La planilla debe cargar antes del banco de casos');

const expectedFlow = ['Elegir tramo/subnivel','Ver video','Observar','Interpretar','Seleccionar OA/OAT','Definir habilidad y propósito','Diseñar intervención','Diseñar evaluación','Familia/equipo/redes','Reflexionar','Enviar','Recibir retroalimentación','Revisar','Reintentar'];
for (const step of expectedFlow) assert.match(moduleSource, new RegExp(step.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

for (const field of ['objectiveObservation','pedagogicalSituation','curricularRationale','specificSkill','pedagogicalPurpose','start','development','closure','resources','dailyMoment','expectedEvidence','indicators','instrument','familyParticipation','teamRationale','adjustmentPlan','professionalLearning']) {
  assert.match(moduleSource, new RegExp(`['\"]${field}['\"]`), `Falta el campo ${field}`);
}

for (const dimension of ['Observación','Coherencia curricular','Pertinencia del desarrollo','Pertinencia pedagógica','Protagonismo infantil','Principios BCEP','Mediación','Evaluación','Inclusión y diversidad','Familia','Equipo y redes','Flexibilidad','Reflexión profesional']) {
  assert.match(moduleSource, new RegExp(dimension));
}
for (const type of ['Fortaleza','Aspecto a profundizar','Orientación']) assert.match(moduleSource, new RegExp(type));
assert.match(moduleSource, /umbralDocenteModeloV2/);
assert.match(moduleSource, /schemaVersion/);
assert.match(moduleSource, /compareAttempts/);
assert.match(moduleSource, /No ingreses datos reales|No ingreses nombres/);
assert.match(moduleSource, /no diagnostica/i);
assert.doesNotMatch(moduleSource, /\bfetch\s*\(/, 'El modelo no debe enviar datos');
assert.doesNotMatch(moduleSource, /XMLHttpRequest|sendBeacon|document\.cookie|supabase/i, 'El modelo debe permanecer local');

for (const selector of ['.ud-model-grid','.ud-model-flow','.ud-curriculum-list','.ud-feedback-grid','.ud-progress-kpis','.ud-library-list']) {
  assert.match(cssSource, new RegExp(selector.replace('.', '\\.')));
}
assert.match(cssSource, /@media\(max-width:820px\)/);

console.log('Contrato del modelo formativo Umbral Docente: OK');
console.log('8 casos: 7 videos disponibles y 1 ficha planificada.');
console.log('Planilla BCEP: 206 objetivos (123 OA y 83 OAT).');
console.log('Flujo: 14 pasos desde selección hasta reintento.');
console.log('Retroalimentación: 13 dimensiones descriptivas, sin nota numérica.');
console.log('Persistencia local versionada y sin conexiones de red.');
