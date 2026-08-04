import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const storagePath = path.join(rootDir, 'lab', 'umbral-docente', 'app', 'modules', 'storage.js');
const storageSource = fs.readFileSync(storagePath, 'utf8');
const NOW = '2026-08-04T12:00:00.000Z';

class MemoryStorage {
  constructor(initial = {}, options = {}) {
    this.values = new Map(Object.entries(initial));
    this.failOnSet = Boolean(options.failOnSet);
    this.failKeys = new Set(options.failKeys || []);
    this.maxBytes = options.maxBytes ?? Infinity;
    this.setCalls = [];
    this.removeCalls = [];
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.setCalls.push(key);
    if (this.failOnSet || this.failKeys.has(key)) throw new Error('QuotaExceededError');
    const next = String(value);
    const currentBytes = [...this.values.entries()]
      .filter(([entryKey]) => entryKey !== key)
      .reduce((sum, [entryKey, entryValue]) => sum + entryKey.length + entryValue.length, 0);
    if (currentBytes + key.length + next.length > this.maxBytes) throw new Error('QuotaExceededError');
    this.values.set(key, next);
  }

  removeItem(key) {
    this.removeCalls.push(key);
    this.values.delete(key);
  }
}

function loadContext(overrides = {}) {
  const context = {
    console,
    Date,
    JSON,
    Map,
    Set,
    RegExp,
    encodeURIComponent,
    unescape,
    ...overrides
  };
  context.globalThis = context;
  vm.runInNewContext(storageSource, context, { filename: storagePath, timeout: 5_000 });
  return context;
}

function loadApi(overrides = {}) {
  return loadContext(overrides).UmbralStorage;
}

const api = loadApi();

function json(value) {
  return JSON.stringify(value);
}

function legacyFixture(overrides = {}) {
  const profile = {
    name: 'Nombre real no migrable',
    route: 'parvularia',
    cycle: 'parvularia',
    specialty: 'Formación general en Educación Parvularia',
    stage: 'Práctica temprana',
    semester: '3.º año',
    institution: 'Establecimiento real no migrable'
  };
  const annualPlan = {
    parvularia: { context: 'Texto libre con información que requiere revisión local' }
  };
  const session = {
    screen: 'simulation',
    career: 'parvularia',
    scenarioId: 'antonia',
    step: 3,
    turn: 2,
    maxTurns: 4,
    incidentHandled: false,
    incidentChoice: null,
    supportLevel: 1,
    plan: { observation: 'Borrador libre no migrable automáticamente' },
    messages: [{ text: 'Mensaje libre' }],
    interventions: [{ text: 'Intervención libre' }],
    reflection: { change: 'Reflexión libre' },
    transfer: { action: 'Transferencia libre' },
    notes: 'Notas libres'
  };
  return {
    umbralProfile: json(overrides.profile ?? profile),
    umbralAnnualPlan: json(overrides.annualPlan ?? annualPlan),
    umbralSession: json(overrides.session ?? session)
  };
}

function load(storage) {
  return api.loadState({ storage, now: NOW });
}

function migrate(storage) {
  const legacy = api.readLegacyState({ storage });
  return api.migrateLegacy(legacy, { now: NOW });
}

test('navegador sin datos previos produce V2 válido en memoria', () => {
  const result = load(new MemoryStorage());
  assert.equal(result.ok, true);
  assert.equal(result.source, 'legacy-memory');
  assert.equal(result.state.schemaVersion, 2);
  assert.equal(result.state.modo, 'inicio');
  assert.equal(result.state.caso, null);
  assert.equal(result.state.etapa.screenId, 'home');
});

test('datos legacy válidos migran sólo estructura no identificable', () => {
  const storage = new MemoryStorage(legacyFixture());
  const state = migrate(storage);
  assert.equal(state.contextoFormativo.routeId, 'parvularia');
  assert.equal(state.contextoFormativo.cycleId, 'parvularia');
  assert.equal(state.caso.scenarioId, 'antonia');
  assert.equal(state.planificaciones.legacyAvailable, true);
  assert.equal(state.borradores.legacyAvailable, true);
  const serialized = JSON.stringify(state);
  assert.doesNotMatch(serialized, /Nombre real no migrable/);
  assert.doesNotMatch(serialized, /Establecimiento real no migrable/);
  assert.doesNotMatch(serialized, /Texto libre con información/);
  assert.doesNotMatch(serialized, /Borrador libre/);
  assert.equal(api.validateState(state).valid, true);
});

test('una clave legacy corrupta no bloquea las otras dos', () => {
  const fixture = legacyFixture();
  fixture.umbralAnnualPlan = '{corrupto';
  const result = load(new MemoryStorage(fixture));
  assert.equal(result.ok, true);
  assert.equal(result.state.caso.scenarioId, 'antonia');
  assert.ok(result.state.meta.warnings.some(warning => warning.includes('umbralAnnualPlan: corrupt')));
});

test('tres claves corruptas producen un estado vacío válido', () => {
  const storage = new MemoryStorage({
    umbralProfile: '{',
    umbralAnnualPlan: 'no-json',
    umbralSession: ']'
  });
  const result = load(storage);
  assert.equal(result.ok, true);
  assert.equal(result.state.caso, null);
  assert.equal(result.state.etapa.screenId, 'home');
  assert.equal(result.state.meta.warnings.length, 3);
});

test('sesión antigua válida conserva caso, modo, pantalla y etapa', () => {
  const fixture = legacyFixture({
    session: { screen: 'reflection', career: 'media', scenarioId: 'matias', step: 4, turn: 4, maxTurns: 4 }
  });
  const result = load(new MemoryStorage(fixture));
  assert.equal(result.state.modo, 'situacion');
  assert.equal(result.state.caso.scenarioId, 'matias');
  assert.equal(result.state.etapa.screenId, 'reflection');
  assert.equal(result.state.etapa.stepId, 4);
  assert.equal(result.state.progreso.byScenarioId.matias.turn, 4);
});

test('scenarioId desconocido vuelve a catálogo sin borrar legacy', () => {
  const fixture = legacyFixture({
    session: { screen: 'simulation', scenarioId: 'caso-inexistente', step: 3 }
  });
  const storage = new MemoryStorage(fixture);
  const before = storage.getItem('umbralSession');
  const result = load(storage);
  assert.equal(result.state.caso, null);
  assert.equal(result.state.etapa.screenId, 'catalog');
  assert.equal(result.state.modo, 'inicio');
  assert.ok(result.state.meta.warnings.some(warning => warning.includes('caso-inexistente')));
  assert.equal(storage.getItem('umbralSession'), before);
});

for (const scenarioId of ['leo', 'isidora']) {
  test(`sesión de ${scenarioId} conserva ID y exige confirmación contextual`, () => {
    const fixture = legacyFixture({
      session: { screen: 'brief', scenarioId, step: 1, turn: 0, maxTurns: 4 }
    });
    const result = load(new MemoryStorage(fixture));
    assert.equal(result.state.caso.scenarioId, scenarioId);
    assert.equal(result.state.caso.contextId, 'transicion-1');
    assert.equal(result.state.caso.requiresContextConfirmation, true);
  });
}

test('cuota simulada activa fallback y limpia la clave temporal', () => {
  const fixture = legacyFixture();
  const storage = new MemoryStorage(fixture, { failOnSet: true });
  const state = migrate(storage);
  const result = api.saveState(state, { storage, now: NOW });
  assert.equal(result.ok, false);
  assert.equal(result.source, 'legacy-memory');
  assert.equal(storage.getItem(api.CANONICAL_KEY), null);
  assert.equal(storage.getItem(api.TEMP_KEY), null);
  assert.equal(storage.getItem('umbralSession'), fixture.umbralSession);
});

test('fallo al escribir la clave canónica revierte la escritura temporal', () => {
  const fixture = legacyFixture();
  const storage = new MemoryStorage(fixture, { failKeys: [api.CANONICAL_KEY] });
  const state = migrate(storage);
  const result = api.saveState(state, { storage, now: NOW });
  assert.equal(result.ok, false);
  assert.equal(result.source, 'legacy-memory');
  assert.equal(storage.getItem(api.CANONICAL_KEY), null);
  assert.equal(storage.getItem(api.TEMP_KEY), null);
  assert.notEqual(storage.getItem(api.BACKUP_KEY), null);
  assert.equal(storage.getItem('umbralSession'), fixture.umbralSession);
});

test('guardar y recargar usa el estado canónico V2', () => {
  const storage = new MemoryStorage(legacyFixture());
  const state = migrate(storage);
  const saved = api.saveState(state, { storage, now: NOW });
  assert.equal(saved.ok, true);
  assert.equal(storage.getItem(api.TEMP_KEY), null);
  const reloaded = load(storage);
  assert.equal(reloaded.ok, true);
  assert.equal(reloaded.source, 'canonical-v2');
  assert.deepEqual(JSON.parse(JSON.stringify(reloaded.state)), JSON.parse(JSON.stringify(state)));
});

test('respaldo canónico y rollback restauran la versión anterior', () => {
  const storage = new MemoryStorage(legacyFixture());
  const first = migrate(storage);
  assert.equal(api.saveState(first, { storage, now: NOW }).ok, true);
  const second = JSON.parse(JSON.stringify(first));
  second.etapa.stepId = 5;
  second.meta.updatedAt = '2026-08-04T13:00:00.000Z';
  assert.equal(api.saveState(second, { storage, now: '2026-08-04T13:00:00.000Z' }).ok, true);
  const backup = JSON.parse(storage.getItem(api.BACKUP_KEY));
  assert.equal(backup.kind, 'canonical-v2');
  assert.equal(backup.state.etapa.stepId, first.etapa.stepId);
  const rolledBack = api.rollback({ storage, now: NOW });
  assert.equal(rolledBack.ok, true);
  assert.equal(rolledBack.source, 'backup-v2');
  assert.equal(load(storage).state.etapa.stepId, first.etapa.stepId);
});

test('primer respaldo permite rollback al lector legacy', () => {
  const storage = new MemoryStorage(legacyFixture());
  const state = migrate(storage);
  assert.equal(api.saveState(state, { storage, now: NOW }).ok, true);
  const backup = JSON.parse(storage.getItem(api.BACKUP_KEY));
  assert.equal(backup.kind, 'legacy-fallback');
  const rolledBack = api.rollback({ storage, now: NOW });
  assert.equal(rolledBack.ok, true);
  assert.equal(rolledBack.source, 'legacy-memory');
  assert.equal(storage.getItem(api.CANONICAL_KEY), null);
  assert.notEqual(storage.getItem('umbralSession'), null);
});

test('estado canónico corrupto cae al lector legacy', () => {
  const fixture = legacyFixture();
  const storage = new MemoryStorage({ ...fixture, umbralState: '{corrupto' });
  const result = load(storage);
  assert.equal(result.ok, true);
  assert.equal(result.source, 'legacy-memory');
  assert.equal(result.state.caso.scenarioId, 'antonia');
  assert.ok(result.errors.some(error => error.includes('umbralState: corrupt')));
});

test('validación rechaza campos y patrones identificables', () => {
  const storage = new MemoryStorage();
  const state = migrate(storage);
  state.contextoFormativo = { name: 'Persona real', cycleId: 'parvularia' };
  state.borradores.notas = 'Contacto: persona@example.com';
  const validation = api.validateState(state);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some(error => error.includes('campo identificable')));
  assert.ok(validation.errors.some(error => error.includes('correo electrónico')));
  assert.equal(api.saveState(state, { storage, now: NOW }).ok, false);
  assert.equal(storage.getItem(api.CANONICAL_KEY), null);
});

test('validación rechaza estados que exceden el tamaño permitido', () => {
  const state = migrate(new MemoryStorage());
  const validation = api.validateState(state, { maxBytes: 100 });
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some(error => error.includes('supera 100 bytes')));
});

test('las claves legacy permanecen idénticas después de guardar V2', () => {
  const fixture = legacyFixture();
  const storage = new MemoryStorage(fixture);
  const state = migrate(storage);
  assert.equal(api.saveState(state, { storage, now: NOW }).ok, true);
  for (const [key, value] of Object.entries(fixture)) assert.equal(storage.getItem(key), value);
});

test('la API sombra expone sus cuatro operaciones sin alterar la API 2A', () => {
  for (const name of ['buildShadowState', 'compareLegacyWithShadow', 'getShadowReport', 'clearShadowReport']) {
    assert.equal(typeof api[name], 'function', `${name} debe estar disponible`);
  }
  for (const name of ['loadState', 'saveState', 'migrateLegacy', 'createBackup', 'rollback', 'validateState', 'readLegacyState']) {
    assert.equal(typeof api[name], 'function', `${name} debe conservarse`);
  }
});

test('modo sombra proyecta V2 solo en memoria y conserva legacy byte a byte', () => {
  const fixture = legacyFixture();
  const storage = new MemoryStorage(fixture);
  const shadowState = api.buildShadowState({ storage, now: NOW });
  const report = api.compareLegacyWithShadow({ storage, now: NOW, log: false });

  assert.equal(shadowState.schemaVersion, 2);
  assert.equal(shadowState.caso.scenarioId, 'antonia');
  assert.deepEqual(Array.from(report.legacyKeysFound), Object.keys(fixture));
  assert.deepEqual(Array.from(report.legacyKeysCorrupt), []);
  assert.equal(report.scenarioId, 'antonia');
  assert.equal(report.screenId, 'simulation');
  assert.equal(report.contextRequired, false);
  assert.equal(report.validationResult.valid, true);
  assert.equal(report.migrationPossible, true);
  assert.equal(storage.getItem(api.CANONICAL_KEY), null);
  assert.equal(storage.getItem(api.TEMP_KEY), null);
  assert.equal(storage.getItem(api.BACKUP_KEY), null);
  assert.deepEqual(storage.setCalls, []);
  assert.deepEqual(storage.removeCalls, []);
  for (const [key, value] of Object.entries(fixture)) assert.equal(storage.getItem(key), value);
});

test('reporte sombra limpio incluye el contrato obligatorio y no crea claves', () => {
  const storage = new MemoryStorage();
  const report = api.compareLegacyWithShadow({ storage, now: NOW, log: false });
  for (const field of [
    'timestamp', 'schemaVersion', 'legacyKeysFound', 'legacyKeysCorrupt', 'scenarioId',
    'screenId', 'contextRequired', 'omittedSensitiveFields', 'structuralWarnings',
    'validationResult', 'migrationPossible', 'errorCodes'
  ]) assert.ok(Object.prototype.hasOwnProperty.call(report, field), `Falta ${field}`);
  assert.equal(report.timestamp, NOW);
  assert.equal(report.schemaVersion, 2);
  assert.equal(report.screenId, 'home');
  assert.ok(report.structuralWarnings.includes('NO_LEGACY_DATA'));
  assert.equal(storage.values.size, 0);
});

for (const scenarioId of ['leo', 'isidora']) {
  test(`reporte sombra de ${scenarioId} exige confirmacion de contexto`, () => {
    const fixture = legacyFixture({ session: { screen: 'brief', scenarioId, step: 1 } });
    const report = api.compareLegacyWithShadow({ storage: new MemoryStorage(fixture), now: NOW, log: false });
    assert.equal(report.scenarioId, scenarioId);
    assert.equal(report.contextRequired, true);
    assert.ok(report.structuralWarnings.includes('CONTEXT_CONFIRMATION_REQUIRED'));
  });
}

test('reporte sombra usa codigos saneados para clave corrupta e ID desconocido', () => {
  const fixture = legacyFixture({ session: { screen: 'simulation', scenarioId: 'identificador-privado', notes: 'dato libre' } });
  fixture.umbralAnnualPlan = '{corrupto';
  const report = api.compareLegacyWithShadow({ storage: new MemoryStorage(fixture), now: NOW, log: false });
  const serialized = JSON.stringify(report);
  assert.ok(report.errorCodes.includes('LEGACY_ANNUAL_PLAN_CORRUPT'));
  assert.ok(report.errorCodes.includes('UNKNOWN_SCENARIO_ID'));
  assert.equal(report.scenarioId, null);
  assert.doesNotMatch(serialized, /identificador-privado|dato libre/);
});

test('la consola sombra no expone nombre, institucion ni textos libres', () => {
  const messages = [];
  const privateApi = loadApi({ console: { info: (...args) => messages.push(args) } });
  const fixture = legacyFixture();
  privateApi.compareLegacyWithShadow({ storage: new MemoryStorage(fixture), now: NOW });
  const serialized = JSON.stringify(messages);
  assert.match(serialized, /UmbralStorage/);
  assert.doesNotMatch(serialized, /Nombre real no migrable/);
  assert.doesNotMatch(serialized, /Establecimiento real no migrable/);
  assert.doesNotMatch(serialized, /Texto libre con informaci/);
  assert.doesNotMatch(serialized, /Borrador libre|Mensaje libre|Intervenci.n libre|Notas libres/);
});

test('getShadowReport devuelve copia y clearShadowReport elimina el ultimo informe', () => {
  const storage = new MemoryStorage(legacyFixture());
  api.compareLegacyWithShadow({ storage, now: NOW, log: false });
  const first = api.getShadowReport();
  first.errorCodes.push('ALTERACION_LOCAL');
  assert.doesNotMatch(JSON.stringify(api.getShadowReport()), /ALTERACION_LOCAL/);
  api.clearShadowReport();
  assert.equal(api.getShadowReport(), null);
});

test('evento storage observa otra pestana sin escribir ni tocar valores legacy', () => {
  const fixture = legacyFixture({ session: { screen: 'brief', scenarioId: 'leo', step: 1 } });
  const storage = new MemoryStorage(fixture);
  const listeners = {};
  const messages = [];
  const context = loadContext({
    localStorage: storage,
    UMBRAL_STORAGE_SHADOW_MODE: true,
    addEventListener: (type, handler) => { listeners[type] = handler; },
    console: { info: (...args) => messages.push(args) }
  });
  assert.equal(typeof listeners.storage, 'function');
  listeners.storage({ key: 'umbralSession' });
  const report = context.UmbralStorage.getShadowReport();
  assert.equal(report.trigger, 'storage-event');
  assert.equal(report.crossTabDifference, true);
  assert.equal(report.scenarioId, 'leo');
  assert.deepEqual(storage.setCalls, []);
  assert.deepEqual(storage.removeCalls, []);
  for (const [key, value] of Object.entries(fixture)) assert.equal(storage.getItem(key), value);
  assert.match(JSON.stringify(messages), /diferencia entre pesta/);
});
