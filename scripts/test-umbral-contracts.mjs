import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const appDir = path.join(rootDir, 'lab', 'umbral-docente', 'app');
const indexPath = path.join(appDir, 'index.html');
const premiumPath = path.join(appDir, 'premium-ui.js');
const storagePath = path.join(appDir, 'modules', 'storage.js');

const indexSource = fs.readFileSync(indexPath, 'utf8');
const premiumSource = fs.readFileSync(premiumPath, 'utf8');
const storageSource = fs.readFileSync(storagePath, 'utf8');

const BASELINE_INDEX_SHA256 = 'c85dd337bfbc4c6b8889b48955901503e9dc36137a4b4de4a7bfffb06293cc86';
const EXPECTED_INDEX_SHA256 = '69c738ab37d29f882ef915a85e1f94097da46e72e843b182633a431ed944311e';
const EXPECTED_PREMIUM_SHA256 = '8d27a0eb6508a47fe74f8ec7eaa1e8a6fb662e06ac3ba72dab5b5711439f6fd6';
const EXPECTED_SCENARIO_IDS = [
  'antonia', 'leo', 'benjamin', 'sofia', 'martina', 'diego',
  'emilia', 'mateo', 'isidora', 'tomas', 'valentina', 'matias',
  'camila', 'nicolas', 'valeria', 'alex', 'fernanda', 'camilo'
];
const EXPECTED_GLOBALS = [
  'state', 'careers', 'scenarios', 'routeById', 'cycleLabels',
  'selectScenario', 'go', 'supportDialog', 'render', 'scrollTop'
];
const EXPECTED_SCREENS = [
  'home', 'onboarding', 'dashboard', 'annual', 'catalog',
  'brief', 'planner', 'simulation', 'reflection', 'results'
];
const EXPECTED_PREMIUM_IDS = [
  '#root', '#udAllScenarios', '#udAllScenariosSecondary', '#udAnnualModule',
  '#udCatalogBack', '#udCatalogSupport', '#udEditProfile', '#udHowWorks',
  '#udSupportModule'
];
const EXPECTED_PREMIUM_DATA_ATTRIBUTES = [
  'data-premium-screen', 'data-ud-action', 'data-ud-cycle',
  'data-ud-cycle-card', 'data-ud-filter', 'data-ud-name', 'data-ud-nav',
  'data-ud-progress', 'data-ud-scenario', 'data-ud-screen'
];

function sha256(source) {
  return crypto.createHash('sha256').update(source).digest('hex');
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function extractDataContract() {
  const start = indexSource.indexOf('const icons={');
  const end = indexSource.indexOf('const savedProfile=', start);
  assert.ok(start >= 0 && end > start, 'No se encontró el bloque de datos principal');
  const dataSource = indexSource.slice(start, end);
  const context = Object.create(null);
  vm.runInNewContext(
    `${dataSource}\nglobalThis.__contract = { careers, scenarios, cycleLabels };`,
    context,
    { timeout: 10_000 }
  );
  return context.__contract;
}

function assertGlobalContract(name) {
  const declaration = name === 'state' || name === 'careers' || name === 'scenarios' || name === 'cycleLabels'
    ? new RegExp(`\\bconst\\s+${name}\\s*=`)
    : name === 'supportDialog'
      ? /\bconst\s+supportDialog\s*=/
      : new RegExp(`\\bfunction\\s+${name}\\s*\\(`);
  assert.match(indexSource, declaration, `Falta el contrato global ${name}`);
  assert.match(premiumSource, new RegExp(`\\b${name}\\b`), `premium-ui.js dejó de consumir ${name}`);
}

function assertShadowStorageContract() {
  const legacy = {
    umbralProfile: JSON.stringify({ name: 'Identidad local', cycle: 'parvularia' }),
    umbralAnnualPlan: JSON.stringify({ context: 'Texto libre local' }),
    umbralSession: JSON.stringify({ screen: 'brief', scenarioId: 'leo', notes: 'Respuesta local' })
  };
  const values = new Map(Object.entries(legacy));
  const setCalls = [];
  const removeCalls = [];
  const localStorage = {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => { setCalls.push(key); values.set(key, String(value)); },
    removeItem: key => { removeCalls.push(key); values.delete(key); }
  };
  const context = {
    console: { info() {} },
    Date,
    JSON,
    Map,
    Set,
    RegExp,
    encodeURIComponent,
    unescape,
    localStorage
  };
  context.globalThis = context;
  vm.runInNewContext(storageSource, context, { filename: storagePath, timeout: 5_000 });
  context.UmbralStorage.compareLegacyWithShadow({ storage: localStorage, log: false });

  assert.deepEqual(setCalls, [], 'El modo sombra no debe escribir en localStorage');
  assert.deepEqual(removeCalls, [], 'El modo sombra no debe eliminar claves de localStorage');
  assert.equal(localStorage.getItem('umbralState'), null, 'No debe existir umbralState');
  assert.equal(localStorage.getItem('umbralStateBackup:v2'), null, 'No debe existir umbralStateBackup:v2');
  assert.equal(localStorage.getItem('umbralState:migration:tmp'), null, 'No debe existir una escritura temporal V2');
  for (const [key, raw] of Object.entries(legacy)) {
    assert.equal(localStorage.getItem(key), raw, `${key} debe permanecer byte a byte igual`);
  }
}

const contract = extractDataContract();
assert.equal(contract.scenarios.length, 18, 'Deben existir exactamente 18 escenarios');
assert.deepEqual(
  Array.from(contract.scenarios, scenario => scenario.id),
  EXPECTED_SCENARIO_IDS,
  'Los IDs o su orden cambiaron'
);
assert.equal(new Set(contract.scenarios.map(scenario => scenario.id)).size, 18, 'Los IDs deben ser únicos');

for (const career of ['parvularia', 'basica', 'media']) {
  assert.equal(
    contract.scenarios.filter(scenario => scenario.career === career).length,
    6,
    `La ruta ${career} debe conservar seis casos`
  );
}

for (const globalName of EXPECTED_GLOBALS) assertGlobalContract(globalName);

const renderStart = indexSource.indexOf('function render(){');
const renderEnd = indexSource.indexOf('\nfunction ', renderStart + 1);
assert.ok(renderStart >= 0 && renderEnd > renderStart, 'No se encontró render()');
const renderSource = indexSource.slice(renderStart, renderEnd);
const screens = [...renderSource.matchAll(/state\.screen==='([^']+)'/g)].map(match => match[1]);
assert.deepEqual(screens, EXPECTED_SCREENS, 'Cambió el contrato de state.screen');

const premiumIds = uniqueSorted([...premiumSource.matchAll(/#[A-Za-z][A-Za-z0-9_-]*/g)].map(match => match[0]));
assert.deepEqual(premiumIds, [...EXPECTED_PREMIUM_IDS].sort(), 'Cambió un ID DOM consumido por premium-ui.js');

const premiumDataAttributes = uniqueSorted(
  [...premiumSource.matchAll(/data-[a-z][a-z0-9-]*/g)].map(match => match[0])
);
assert.deepEqual(
  premiumDataAttributes,
  [...EXPECTED_PREMIUM_DATA_ATTRIBUTES].sort(),
  'Cambió un atributo data-* consumido por premium-ui.js'
);

assert.equal(sha256(indexSource), EXPECTED_INDEX_SHA256, 'index.html cambió: rutas, DOM, textos o consecuencias');
assert.equal(sha256(premiumSource), EXPECTED_PREMIUM_SHA256, 'premium-ui.js cambió');
assert.ok(
  indexSource.indexOf('<script src="premium-ui.js"></script>') > indexSource.indexOf('render();'),
  'premium-ui.js debe seguir cargando después de la aplicación principal'
);

const storageScriptPosition = indexSource.indexOf('<script src="modules/storage.js"></script>');
const shadowFlagPosition = indexSource.indexOf('const UMBRAL_STORAGE_SHADOW_MODE=true;');
const shadowCallPosition = indexSource.indexOf("window.UmbralStorage.compareLegacyWithShadow({trigger:'initial-load'});");
const premiumScriptPosition = indexSource.indexOf('<script src="premium-ui.js"></script>');
assert.ok(storageScriptPosition > indexSource.indexOf('render();'), 'storage.js debe cargar despues del render legacy inicial');
assert.ok(shadowFlagPosition > storageScriptPosition, 'La bandera sombra debe declararse despues de cargar storage.js');
assert.ok(shadowCallPosition > shadowFlagPosition, 'La comparacion sombra debe ejecutarse con la bandera activa');
assert.ok(premiumScriptPosition > shadowCallPosition, 'premium-ui.js debe conservar su orden posterior');
assert.match(indexSource, /window\.UMBRAL_STORAGE_SHADOW_MODE=UMBRAL_STORAGE_SHADOW_MODE;/, 'La observacion entre pestanas requiere la bandera global activa');
assertShadowStorageContract();

console.log('Contrato Umbral Docente: OK');
console.log(`Escenarios: ${contract.scenarios.length} (6 parvularia, 6 básica, 6 media)`);
console.log(`IDs preservados: ${EXPECTED_SCENARIO_IDS.join(', ')}`);
console.log(`Pantallas preservadas: ${EXPECTED_SCREENS.join(', ')}`);
console.log('index.html conserva el hash sombra aprobado y premium-ui.js su hash original.');
console.log(`Baseline index.html: ${BASELINE_INDEX_SHA256}`);
console.log(`Hash sombra index.html: ${EXPECTED_INDEX_SHA256}`);
console.log(`Hash premium-ui.js intacto: ${EXPECTED_PREMIUM_SHA256}`);
console.log('Contrato sombra: adaptador cargado, bandera activa, sin escrituras V2 y legacy byte a byte intacto.');
