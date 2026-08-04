(function exposeUmbralStorage(global) {
  'use strict';

  const SCHEMA_VERSION = 2;
  const CANONICAL_KEY = 'umbralState';
  const TEMP_KEY = 'umbralState:migration:tmp';
  const BACKUP_KEY = 'umbralStateBackup:v2';
  const LEGACY_KEYS = Object.freeze({
    profile: 'umbralProfile',
    annualPlan: 'umbralAnnualPlan',
    session: 'umbralSession'
  });
  const SCENARIO_IDS = Object.freeze([
    'antonia', 'leo', 'benjamin', 'sofia', 'martina', 'diego',
    'emilia', 'mateo', 'isidora', 'tomas', 'valentina', 'matias',
    'camila', 'nicolas', 'valeria', 'alex', 'fernanda', 'camilo'
  ]);
  const SCENARIO_ID_SET = new Set(SCENARIO_IDS);
  const SCREEN_IDS = Object.freeze([
    'home', 'onboarding', 'dashboard', 'annual', 'catalog',
    'brief', 'planner', 'simulation', 'reflection', 'results'
  ]);
  const SCREEN_ID_SET = new Set(SCREEN_IDS);
  const MODE_IDS = new Set([
    'inicio', 'situacion', 'planificacion', 'rutina', 'familia', 'familiarizacion'
  ]);
  const CYCLE_IDS = new Set(['parvularia', 'basica', 'media', 'all']);
  const IDENTIFYING_KEYS = /^(name|fullName|institution|institutionName|school|schoolName|email|phone|rut|diagnosis|clinicalData|familyName)$/i;
  const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const CHILEAN_RUT_PATTERN = /\b\d{1,2}\.?(?:\d{3}\.?)?\d{3}-[0-9K]\b/i;
  const PHONE_PATTERN = /(?:\+?56\s*)?(?:9\s*)?\d{4}[\s-]?\d{4}/;
  const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
  let lastShadowReport = null;

  function nowIso(options) {
    if (typeof options.now === 'function') return options.now();
    if (typeof options.now === 'string') return options.now;
    return new Date().toISOString();
  }

  function resolveStorage(options) {
    if (options && options.storage) return options.storage;
    if (global && global.localStorage) return global.localStorage;
    return null;
  }

  function readJsonKey(storage, key) {
    if (!storage) return { key, status: 'unavailable', raw: null, value: null };
    let raw;
    try {
      raw = storage.getItem(key);
    } catch (error) {
      return { key, status: 'read-error', raw: null, value: null, error: String(error && error.message || error) };
    }
    if (raw === null) return { key, status: 'missing', raw: null, value: null };
    try {
      return { key, status: 'valid', raw, value: JSON.parse(raw) };
    } catch (error) {
      return { key, status: 'corrupt', raw, value: null, error: String(error && error.message || error) };
    }
  }

  function readLegacyState(options = {}) {
    const storage = resolveStorage(options);
    const profile = readJsonKey(storage, LEGACY_KEYS.profile);
    const annualPlan = readJsonKey(storage, LEGACY_KEYS.annualPlan);
    const session = readJsonKey(storage, LEGACY_KEYS.session);
    const entries = [profile, annualPlan, session];
    return {
      profile,
      annualPlan,
      session,
      hasAnyData: entries.some(entry => entry.status !== 'missing' && entry.status !== 'unavailable'),
      hasValidData: entries.some(entry => entry.status === 'valid'),
      errors: entries
        .filter(entry => entry.status === 'corrupt' || entry.status === 'read-error')
        .map(entry => ({ key: entry.key, status: entry.status, error: entry.error }))
    };
  }

  function safeString(value, maxLength = 160) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    if (!normalized) return null;
    return normalized.slice(0, maxLength);
  }

  function safeInteger(value, fallback, minimum, maximum) {
    const number = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : fallback;
    return Math.min(maximum, Math.max(minimum, number));
  }

  function modeFromScreen(screen) {
    if (screen === 'annual') return 'planificacion';
    if (['brief', 'planner', 'simulation', 'reflection', 'results'].includes(screen)) return 'situacion';
    return 'inicio';
  }

  function emptyState(timestamp) {
    return {
      schemaVersion: SCHEMA_VERSION,
      contextoFormativo: null,
      modo: 'inicio',
      caso: null,
      etapa: {
        screenId: 'home',
        stepId: 0,
        turn: 0,
        maxTurns: 4,
        incidentHandled: false,
        incidentChoice: null,
        supportLevel: 0
      },
      borradores: {
        situacion: null,
        planificacion: null,
        reflexion: null,
        transferencia: null,
        notas: null,
        legacyAvailable: false
      },
      progreso: {
        byScenarioId: {},
        completados: [],
        ultimoCaso: null,
        ultimaActividad: null
      },
      planificaciones: {
        anualesByTemplate: {},
        experienciasById: {},
        legacyAvailable: false
      },
      rutinas: { byId: {} },
      conversacionesFamiliares: { byId: {} },
      familiarizacion: { byProcessId: {} },
      meta: {
        migratedFrom: 'legacy-v1',
        migratedAt: timestamp,
        updatedAt: timestamp,
        privacyNoticeVersion: 1,
        legacyKeysPreserved: true,
        legacyFieldsNotCopied: [],
        warnings: []
      }
    };
  }

  function migrateLegacy(legacy, options = {}) {
    const source = legacy || readLegacyState(options);
    const timestamp = nowIso(options);
    const state = emptyState(timestamp);
    const profile = source.profile && source.profile.status === 'valid' && source.profile.value && typeof source.profile.value === 'object'
      ? source.profile.value
      : null;
    const session = source.session && source.session.status === 'valid' && source.session.value && typeof source.session.value === 'object'
      ? source.session.value
      : null;

    if (profile) {
      const cycleId = CYCLE_IDS.has(profile.cycle) ? profile.cycle : null;
      state.contextoFormativo = {
        routeId: safeString(profile.route),
        cycleId,
        specialtyId: safeString(profile.specialty),
        stageId: safeString(profile.stage),
        semesterId: safeString(profile.semester)
      };
      if (Object.prototype.hasOwnProperty.call(profile, 'name')) state.meta.legacyFieldsNotCopied.push('umbralProfile.name');
      if (Object.prototype.hasOwnProperty.call(profile, 'institution')) state.meta.legacyFieldsNotCopied.push('umbralProfile.institution');
    }

    const requestedScreen = session && safeString(session.screen, 40);
    const screenId = requestedScreen && SCREEN_ID_SET.has(requestedScreen)
      ? requestedScreen
      : (profile ? 'dashboard' : 'home');
    state.modo = modeFromScreen(screenId);
    state.etapa = {
      screenId,
      stepId: safeInteger(session && session.step, 0, 0, 5),
      turn: safeInteger(session && session.turn, 0, 0, 100),
      maxTurns: safeInteger(session && session.maxTurns, 4, 1, 100),
      incidentHandled: Boolean(session && session.incidentHandled),
      incidentChoice: Number.isInteger(session && session.incidentChoice) ? session.incidentChoice : null,
      supportLevel: safeInteger(session && session.supportLevel, 0, 0, 20)
    };

    const requestedScenarioId = session && safeString(session.scenarioId, 80);
    if (requestedScenarioId && SCENARIO_ID_SET.has(requestedScenarioId)) {
      const requiresContextConfirmation = requestedScenarioId === 'leo' || requestedScenarioId === 'isidora';
      state.caso = {
        scenarioId: requestedScenarioId,
        contextId: requiresContextConfirmation ? 'transicion-1' : null,
        requiresContextConfirmation,
        status: state.etapa.screenId === 'results' ? 'completado' : 'en-progreso'
      };
      state.progreso.ultimoCaso = requestedScenarioId;
      state.progreso.byScenarioId[requestedScenarioId] = {
        stepId: state.etapa.stepId,
        turn: state.etapa.turn,
        lastScreenId: state.etapa.screenId,
        status: state.caso.status
      };
      if (state.caso.status === 'completado') state.progreso.completados.push(requestedScenarioId);
    } else if (requestedScenarioId) {
      state.meta.warnings.push(`scenarioId legacy desconocido: ${requestedScenarioId}`);
      state.etapa.screenId = profile ? 'catalog' : 'home';
      state.etapa.stepId = 0;
      state.modo = 'inicio';
    }

    if (session) {
      state.borradores.legacyAvailable = true;
      state.meta.legacyFieldsNotCopied.push(
        'umbralSession.plan',
        'umbralSession.messages',
        'umbralSession.interventions',
        'umbralSession.reflection',
        'umbralSession.transfer',
        'umbralSession.notes'
      );
    }
    if (source.annualPlan && source.annualPlan.status === 'valid') {
      state.planificaciones.legacyAvailable = true;
      state.meta.legacyFieldsNotCopied.push('umbralAnnualPlan.freeText');
    }
    for (const error of source.errors || []) {
      state.meta.warnings.push(`${error.key}: ${error.status}`);
    }
    state.meta.legacyFieldsNotCopied = [...new Set(state.meta.legacyFieldsNotCopied)];
    return state;
  }

  function serializedBytes(value) {
    return unescape(encodeURIComponent(value)).length;
  }

  function findPrivacyRisks(value, path, risks, seen) {
    if (value === null || value === undefined) return;
    if (typeof value === 'object') {
      if (seen.has(value)) {
        risks.push(`${path}: referencia circular`);
        return;
      }
      seen.add(value);
      if (Array.isArray(value)) {
        value.forEach((item, index) => findPrivacyRisks(item, `${path}[${index}]`, risks, seen));
      } else {
        for (const [key, child] of Object.entries(value)) {
          if (IDENTIFYING_KEYS.test(key)) risks.push(`${path}.${key}: campo identificable no permitido`);
          findPrivacyRisks(child, `${path}.${key}`, risks, seen);
        }
      }
      seen.delete(value);
      return;
    }
    if (typeof value !== 'string') return;
    if (EMAIL_PATTERN.test(value)) risks.push(`${path}: posible correo electrónico`);
    if (CHILEAN_RUT_PATTERN.test(value)) risks.push(`${path}: posible RUT`);
    if (PHONE_PATTERN.test(value)) risks.push(`${path}: posible teléfono`);
  }

  function validateState(state, options = {}) {
    const errors = [];
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      return { valid: false, errors: ['El estado debe ser un objeto'] };
    }
    if (state.schemaVersion !== SCHEMA_VERSION) errors.push(`schemaVersion debe ser ${SCHEMA_VERSION}`);
    const requiredObjects = [
      'etapa', 'borradores', 'progreso', 'planificaciones', 'rutinas',
      'conversacionesFamiliares', 'familiarizacion', 'meta'
    ];
    for (const key of requiredObjects) {
      if (!state[key] || typeof state[key] !== 'object' || Array.isArray(state[key])) {
        errors.push(`${key} debe ser un objeto`);
      }
    }
    if (!MODE_IDS.has(state.modo)) errors.push(`modo desconocido: ${String(state.modo)}`);
    if (state.caso !== null) {
      if (!state.caso || typeof state.caso !== 'object') errors.push('caso debe ser objeto o null');
      else if (!SCENARIO_ID_SET.has(state.caso.scenarioId)) errors.push(`scenarioId desconocido: ${String(state.caso.scenarioId)}`);
    }
    if (state.etapa && !SCREEN_ID_SET.has(state.etapa.screenId)) {
      errors.push(`screenId desconocido: ${String(state.etapa.screenId)}`);
    }
    const privacyRisks = [];
    findPrivacyRisks(state, 'state', privacyRisks, new Set());
    errors.push(...privacyRisks);
    try {
      const serialized = JSON.stringify(state);
      const maxBytes = Number.isFinite(options.maxBytes) ? options.maxBytes : DEFAULT_MAX_BYTES;
      if (serializedBytes(serialized) > maxBytes) errors.push(`El estado supera ${maxBytes} bytes`);
    } catch (error) {
      errors.push(`El estado no es serializable: ${String(error && error.message || error)}`);
    }
    return { valid: errors.length === 0, errors };
  }

  function clonePlain(value) {
    return value === null || value === undefined ? value : JSON.parse(JSON.stringify(value));
  }

  function shadowAnalysis(options = {}) {
    const legacy = readLegacyState(options);
    const state = migrateLegacy(legacy, options);
    const validation = validateState(state, options);
    const entries = [legacy.profile, legacy.annualPlan, legacy.session];
    const legacyKeysFound = entries
      .filter(entry => entry.status !== 'missing' && entry.status !== 'unavailable')
      .map(entry => entry.key);
    const legacyKeysCorrupt = entries
      .filter(entry => entry.status === 'corrupt')
      .map(entry => entry.key);
    const readErrorEntries = entries.filter(entry => entry.status === 'read-error');
    const structuralWarnings = [];
    const structuralDifferences = [];
    const errorCodes = [];
    const legacySession = legacy.session.status === 'valid' && legacy.session.value && typeof legacy.session.value === 'object'
      ? legacy.session.value
      : null;
    const requestedScenarioId = legacySession && safeString(legacySession.scenarioId, 80);
    const unknownScenario = Boolean(requestedScenarioId && !SCENARIO_ID_SET.has(requestedScenarioId));

    if (!legacy.hasAnyData) structuralWarnings.push('NO_LEGACY_DATA');
    if (legacy.profile.status === 'valid') structuralDifferences.push('PROFILE_PROJECTED_WITHOUT_IDENTITY');
    if (legacy.annualPlan.status === 'valid') structuralDifferences.push('ANNUAL_PLAN_RETAINED_IN_LEGACY');
    if (legacy.session.status === 'valid') structuralDifferences.push('SESSION_FREE_TEXT_RETAINED_IN_LEGACY');
    if (legacyKeysCorrupt.length) structuralWarnings.push('CORRUPT_LEGACY_KEYS_IGNORED');
    if (unknownScenario) structuralWarnings.push('UNKNOWN_SCENARIO_REJECTED');
    if (legacySession && legacySession.screen && legacySession.screen !== state.etapa.screenId) {
      structuralWarnings.push('SCREEN_NORMALIZED');
    }
    if (state.caso && state.caso.requiresContextConfirmation) {
      structuralWarnings.push('CONTEXT_CONFIRMATION_REQUIRED');
    }

    for (const entry of entries) {
      const prefix = entry.key === LEGACY_KEYS.profile
        ? 'LEGACY_PROFILE'
        : entry.key === LEGACY_KEYS.annualPlan
          ? 'LEGACY_ANNUAL_PLAN'
          : 'LEGACY_SESSION';
      if (entry.status === 'corrupt') errorCodes.push(`${prefix}_CORRUPT`);
      if (entry.status === 'read-error') errorCodes.push(`${prefix}_READ_ERROR`);
    }
    if (unknownScenario) errorCodes.push('UNKNOWN_SCENARIO_ID');
    if (!validation.valid) errorCodes.push('SHADOW_VALIDATION_FAILED');
    if (!resolveStorage(options)) errorCodes.push('STORAGE_UNAVAILABLE');

    const report = {
      timestamp: nowIso(options),
      schemaVersion: SCHEMA_VERSION,
      comparisonResult: errorCodes.length ? 'attention' : 'compatible',
      trigger: safeString(options.trigger, 40) || 'manual',
      crossTabDifference: Boolean(options.crossTabDifference),
      legacyKeysFound,
      legacyKeysCorrupt,
      scenarioId: state.caso ? state.caso.scenarioId : null,
      screenId: state.etapa.screenId,
      contextRequired: Boolean(state.caso && state.caso.requiresContextConfirmation),
      progress: {
        stepId: state.etapa.stepId,
        turn: state.etapa.turn,
        status: state.caso ? state.caso.status : null
      },
      omittedSensitiveFields: [...state.meta.legacyFieldsNotCopied],
      structuralDifferences,
      structuralWarnings,
      validationResult: {
        valid: validation.valid,
        errorCount: validation.errors.length
      },
      migrationPossible: validation.valid && legacyKeysCorrupt.length === 0 && readErrorEntries.length === 0,
      errorCodes
    };
    return { state, report };
  }

  function buildShadowState(options = {}) {
    return clonePlain(shadowAnalysis(options).state);
  }

  function compareLegacyWithShadow(options = {}) {
    const analysis = shadowAnalysis(options);
    lastShadowReport = clonePlain(analysis.report);
    if (options.log !== false && global.console && typeof global.console.info === 'function') {
      global.console.info('[UmbralStorage][shadow]', clonePlain(lastShadowReport));
    }
    return clonePlain(lastShadowReport);
  }

  function getShadowReport() {
    return clonePlain(lastShadowReport);
  }

  function clearShadowReport() {
    lastShadowReport = null;
  }

  function loadState(options = {}) {
    const storage = resolveStorage(options);
    const canonical = readJsonKey(storage, CANONICAL_KEY);
    if (canonical.status === 'valid') {
      const validation = validateState(canonical.value, options);
      if (validation.valid) {
        return { ok: true, source: 'canonical-v2', state: canonical.value, legacy: null, errors: [] };
      }
    }
    const legacy = readLegacyState(options);
    const state = migrateLegacy(legacy, options);
    const validation = validateState(state, options);
    const canonicalErrors = canonical.status === 'corrupt'
      ? [`${CANONICAL_KEY}: corrupt`]
      : canonical.status === 'valid'
        ? validateState(canonical.value, options).errors
        : [];
    return {
      ok: validation.valid,
      source: 'legacy-memory',
      state,
      legacy,
      errors: [...canonicalErrors, ...validation.errors]
    };
  }

  function createBackup(options = {}) {
    const storage = resolveStorage(options);
    if (!storage) return { ok: false, error: 'localStorage no disponible' };
    const timestamp = nowIso(options);
    const canonical = readJsonKey(storage, CANONICAL_KEY);
    let backup;
    if (canonical.status === 'valid') {
      const validation = validateState(canonical.value, options);
      if (!validation.valid) return { ok: false, error: 'Estado canónico inválido', errors: validation.errors };
      backup = { backupVersion: 1, createdAt: timestamp, kind: 'canonical-v2', state: canonical.value };
    } else if (canonical.status === 'missing' || canonical.status === 'corrupt') {
      const legacy = readLegacyState(options);
      backup = {
        backupVersion: 1,
        createdAt: timestamp,
        kind: 'legacy-fallback',
        legacyKeysPresent: {
          umbralProfile: legacy.profile.status === 'valid',
          umbralAnnualPlan: legacy.annualPlan.status === 'valid',
          umbralSession: legacy.session.status === 'valid'
        }
      };
    } else {
      return { ok: false, error: 'No fue posible leer el estado canónico' };
    }
    try {
      storage.setItem(BACKUP_KEY, JSON.stringify(backup));
      return { ok: true, backup };
    } catch (error) {
      return { ok: false, error: String(error && error.message || error) };
    }
  }

  function saveState(state, options = {}) {
    const storage = resolveStorage(options);
    if (!storage) return { ok: false, source: 'legacy-memory', state, errors: ['localStorage no disponible'] };
    const validation = validateState(state, options);
    if (!validation.valid) return { ok: false, source: 'rejected', state, errors: validation.errors };
    const backup = createBackup(options);
    if (!backup.ok) return { ok: false, source: 'legacy-memory', state, errors: [`Respaldo fallido: ${backup.error}`] };
    const serialized = JSON.stringify(state);
    try {
      storage.setItem(TEMP_KEY, serialized);
      const temporary = readJsonKey(storage, TEMP_KEY);
      if (temporary.status !== 'valid') throw new Error('No se pudo releer la escritura temporal');
      const temporaryValidation = validateState(temporary.value, options);
      if (!temporaryValidation.valid) throw new Error(`Estado temporal inválido: ${temporaryValidation.errors.join('; ')}`);
      storage.setItem(CANONICAL_KEY, serialized);
      const canonical = readJsonKey(storage, CANONICAL_KEY);
      if (canonical.status !== 'valid') throw new Error('No se pudo releer el estado canónico');
      const canonicalValidation = validateState(canonical.value, options);
      if (!canonicalValidation.valid) throw new Error(`Estado canónico inválido: ${canonicalValidation.errors.join('; ')}`);
      storage.removeItem(TEMP_KEY);
      return { ok: true, source: 'canonical-v2', state: canonical.value, backup: backup.backup, errors: [] };
    } catch (error) {
      try { storage.removeItem(TEMP_KEY); } catch (_) { /* fallback de sólo lectura */ }
      const fallback = loadState(options);
      return {
        ok: false,
        source: fallback.source,
        state: fallback.state,
        legacy: fallback.legacy,
        errors: [String(error && error.message || error), ...fallback.errors]
      };
    }
  }

  function rollback(options = {}) {
    const storage = resolveStorage(options);
    if (!storage) return { ok: false, error: 'localStorage no disponible' };
    const backupEntry = readJsonKey(storage, BACKUP_KEY);
    if (backupEntry.status !== 'valid' || !backupEntry.value || typeof backupEntry.value !== 'object') {
      return { ok: false, error: 'Respaldo no disponible o corrupto' };
    }
    const backup = backupEntry.value;
    try {
      if (backup.kind === 'legacy-fallback') {
        storage.removeItem(CANONICAL_KEY);
        storage.removeItem(TEMP_KEY);
        const fallback = loadState(options);
        return { ok: fallback.ok, source: fallback.source, state: fallback.state, errors: fallback.errors };
      }
      if (backup.kind !== 'canonical-v2') return { ok: false, error: `Tipo de respaldo desconocido: ${String(backup.kind)}` };
      const validation = validateState(backup.state, options);
      if (!validation.valid) return { ok: false, error: 'Respaldo inválido', errors: validation.errors };
      const serialized = JSON.stringify(backup.state);
      storage.setItem(TEMP_KEY, serialized);
      const temporary = readJsonKey(storage, TEMP_KEY);
      if (temporary.status !== 'valid' || !validateState(temporary.value, options).valid) {
        throw new Error('No se pudo validar el respaldo temporal');
      }
      storage.setItem(CANONICAL_KEY, serialized);
      storage.removeItem(TEMP_KEY);
      return { ok: true, source: 'backup-v2', state: backup.state, errors: [] };
    } catch (error) {
      try { storage.removeItem(TEMP_KEY); } catch (_) { /* conservar fallback */ }
      return { ok: false, error: String(error && error.message || error) };
    }
  }

  const api = Object.freeze({
    SCHEMA_VERSION,
    CANONICAL_KEY,
    TEMP_KEY,
    BACKUP_KEY,
    LEGACY_KEYS,
    SCENARIO_IDS,
    SCREEN_IDS,
    loadState,
    saveState,
    migrateLegacy,
    createBackup,
    rollback,
    validateState,
    readLegacyState,
    buildShadowState,
    compareLegacyWithShadow,
    getShadowReport,
    clearShadowReport
  });

  global.UmbralStorage = api;
  if (global && typeof global.addEventListener === 'function') {
    global.addEventListener('storage', function observeLegacyStorage(event) {
      if (global.UMBRAL_STORAGE_SHADOW_MODE !== true) return;
      const observedKeys = [LEGACY_KEYS.profile, LEGACY_KEYS.annualPlan, LEGACY_KEYS.session];
      if (!event || !observedKeys.includes(event.key)) return;
      const report = compareLegacyWithShadow({
        storage: global.localStorage,
        trigger: 'storage-event',
        crossTabDifference: true,
        log: false
      });
      if (global.console && typeof global.console.info === 'function') {
        global.console.info('[UmbralStorage][shadow] diferencia entre pestañas detectada', {
          key: event.key,
          comparisonResult: report.comparisonResult,
          scenarioId: report.scenarioId,
          screenId: report.screenId,
          errorCodes: report.errorCodes
        });
      }
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
