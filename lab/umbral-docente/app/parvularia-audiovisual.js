(() => {
  'use strict';

  const cases = Array.isArray(window.UMBRAL_PARVULARIA_AUDIOVISUAL_CASES)
    ? window.UMBRAL_PARVULARIA_AUDIOVISUAL_CASES
    : [];
  const curriculum = Array.isArray(window.UMBRAL_BCEP_CURRICULUM)
    ? window.UMBRAL_BCEP_CURRICULUM
    : [];
  const appRoot = document.querySelector('#root');
  if (!cases.length || !appRoot) return;

  const STORAGE_KEY = 'umbralDocenteModeloV2';
  const LEGACY_KEY = 'umbralParvulariaAudiovisualV1';
  const SCHEMA_VERSION = 2;
  const MAX_ATTEMPTS = 8;

  const FLOW = [
    ['select', 'Elegir tramo/subnivel'],
    ['video', 'Ver video'],
    ['observe', 'Observar'],
    ['interpret', 'Interpretar'],
    ['curriculum', 'Seleccionar OA/OAT'],
    ['focus', 'Definir habilidad y propósito'],
    ['intervention', 'Diseñar intervención'],
    ['evaluation', 'Diseñar evaluación'],
    ['collaboration', 'Familia/equipo/redes'],
    ['reflection', 'Reflexionar'],
    ['submit', 'Enviar'],
    ['feedback', 'Recibir retroalimentación'],
    ['review', 'Revisar'],
    ['retry', 'Reintentar']
  ];

  const PANELS = [
    ['video', 'Caso', [0, 1]],
    ['observe', 'Observar', [2]],
    ['interpret', 'Interpretar', [3]],
    ['curriculum', 'Currículum', [4]],
    ['focus', 'Foco', [5]],
    ['intervention', 'Intervención', [6]],
    ['evaluation', 'Evaluación', [7]],
    ['collaboration', 'Vinculación', [8]],
    ['reflection', 'Reflexión', [9]],
    ['feedback', 'Enviar y revisar', [10, 11, 12, 13]]
  ];

  const TEXT_FIELDS = {
    observe: [
      ['objectiveObservation', 'Registro objetivo', '¿Qué observaste? Describe hechos, acciones, miradas, posturas, vocalizaciones y cambios antes de interpretar.', true],
      ['observedSequence', 'Secuencia temporal', '¿Qué ocurrió primero, durante y después? Distingue cambios en el tiempo.', true],
      ['missingInformation', 'Información ausente', '¿Qué no muestra el video y qué no puede concluirse a partir de una escena aislada?', true]
    ],
    interpret: [
      ['pedagogicalSituation', 'Situación o necesidad pedagógica', 'Formula una comprensión provisional. Evita diagnósticos, etiquetas y explicaciones cerradas.', true],
      ['evidenceSupport', 'Evidencia que sustenta tu interpretación', 'Relaciona tu lectura con conductas específicas del video.', true],
      ['alternativeHypotheses', 'Otras interpretaciones posibles', 'Registra al menos otra lectura pedagógicamente defendible.', true],
      ['uncertainties', 'Incertidumbres', '¿Qué dudas permanecen y qué información adicional necesitarías?', false]
    ],
    curriculum: [
      ['curricularRationale', 'Fundamento curricular', 'Explica por qué los OA/OAT seleccionados son pertinentes para la situación, el propósito y la evidencia.', true]
    ],
    focus: [
      ['specificSkill', 'Habilidad, aprendizaje o actitud específica', 'Define con precisión qué quieres potenciar, sin convertirlo en una conducta de obediencia.', true],
      ['pedagogicalPurpose', 'Intención pedagógica', '¿Qué esperas favorecer mediante la intervención o acompañamiento?', true]
    ],
    intervention: [
      ['start', 'Inicio o acogida', '¿Cómo comenzará la intervención o acompañamiento?', true],
      ['development', 'Desarrollo y mediación', '¿Qué harán niñas/niños, pares y adultos? ¿Cómo observarás, esperarás, preguntarás o apoyarás?', true],
      ['closure', 'Finalización o continuidad', '¿Cómo finalizará, continuará o se incorporará a la rutina?', true],
      ['resources', 'Recursos y ambiente', 'Recursos humanos, materiales, espaciales o comunitarios; accesibilidad y resguardos.', true],
      ['dailyMoment', 'Momento de la jornada', '¿Cuándo se implementará y por qué ese momento es pertinente?', true],
      ['childParticipation', 'Protagonismo infantil', '¿Qué oportunidades reales tendrá para participar, elegir, explorar, expresarse o construir?', true],
      ['playRole', 'Lugar del juego', 'Explica si el juego es pertinente y cómo evitarás reducirlo a una actividad dirigida disfrazada.', false]
    ],
    evaluation: [
      ['expectedEvidence', 'Evidencia esperada', '¿Qué observarías para reconocer progreso o una respuesta relevante?', true],
      ['indicators', 'Criterios o indicadores', 'Formula manifestaciones concretas del niño, niña o grupo; no describas solo acciones de la educadora.', true],
      ['instrument', 'Instrumento y pertinencia', '¿Cómo recogerás la evidencia y por qué ese instrumento es adecuado?', true],
      ['evaluationUse', 'Uso de la evidencia', '¿Qué decisión pedagógica tomarías a partir de lo observado?', false]
    ],
    collaboration: [
      ['familyParticipation', 'Familia', '¿Qué información necesitas, qué puede aportar la familia y qué acuerdos de continuidad podrían construirse?', true],
      ['teamRationale', 'Fundamento sobre equipo o redes', 'Justifica tu decisión. Una conducta aislada no autoriza derivaciones automáticas.', true],
      ['adjustmentPlan', 'Plan de ajuste', '¿Qué modificarías si la respuesta del niño, niña o grupo fuera distinta a la anticipada?', true]
    ],
    reflection: [
      ['decisiveElements', 'Elementos determinantes', '¿Qué aspectos de la situación fueron determinantes para tu decisión?', true],
      ['observationInferenceDifference', 'Observación e inferencia', '¿Qué diferencia existe entre lo que observaste y lo que inferiste?', true],
      ['bestFoundedDecision', 'Decisión mejor fundamentada', '¿Cuál consideras mejor construida y por qué?', true],
      ['greatestUncertainty', 'Mayor incertidumbre', '¿Qué aspecto de tu planificación genera más dudas?', false],
      ['additionalInformation', 'Información adicional', '¿Qué necesitarías conocer antes de sostener una conclusión más firme?', false],
      ['secondVersionChange', 'Segunda versión', '¿Qué mantendrías y qué cambiarías en un nuevo intento?', true],
      ['professionalLearning', 'Aprendizaje profesional', '¿Qué aprendiste sobre tu manera de observar, planificar y evaluar?', true]
    ]
  };

  const DIMENSIONS = [
    'Observación', 'Coherencia curricular', 'Pertinencia del desarrollo', 'Pertinencia pedagógica',
    'Protagonismo infantil', 'Principios BCEP', 'Mediación', 'Evaluación', 'Inclusión y diversidad',
    'Familia', 'Equipo y redes', 'Flexibilidad', 'Reflexión profesional'
  ];

  let routeOpen = false;
  let view = 'catalog';
  let activeCaseId = null;
  let activePanel = 'video';
  let filterState = { sublevel: 'all', theme: 'all', competence: 'all', status: 'all', query: '' };
  let observerQueued = false;
  let previousBaseScreen = null;

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[char]);
  }

  function slug(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function emptyStore() {
    return { schemaVersion: SCHEMA_VERSION, cases: {}, createdAt: new Date().toISOString(), updatedAt: null };
  }

  function migrateLegacy() {
    const next = emptyStore();
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
      if (!legacy?.cases) return next;
      Object.entries(legacy.cases).forEach(([caseId, old]) => {
        const f = old?.fields || {};
        next.cases[caseId] = {
          caseVersion: cases.find((item) => item.id === caseId)?.caseVersion || '1.0',
          watched: false,
          selectedObjectives: [],
          fields: {
            objectiveObservation: f.evidence || '',
            missingInformation: f.unknowns || '',
            pedagogicalSituation: f.pedagogicalNeed || '',
            evidenceSupport: f.interpretations || '',
            uncertainties: f.context || '',
            curricularRationale: f.rationale || '',
            specificSkill: '',
            pedagogicalPurpose: f.purpose || '',
            start: '',
            development: f.sequence || f.mediation || '',
            closure: '',
            resources: f.environment || '',
            dailyMoment: f.routine || '',
            childParticipation: f.participation || '',
            expectedEvidence: f.expectedEvidence || '',
            indicators: f.indicators || '',
            instrument: f.instrument || '',
            familyParticipation: f.family || f.familyInformation || '',
            teamRationale: f.networks || '',
            adjustmentPlan: f.adjustment || '',
            professionalLearning: f.reflection || ''
          },
          teamDecision: 'insufficient',
          attempts: Array.isArray(old?.attempts) ? old.attempts : [],
          updatedAt: old?.updatedAt || null
        };
      });
      next.updatedAt = new Date().toISOString();
    } catch {}
    return next;
  }

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const migrated = migrateLegacy();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION || typeof parsed.cases !== 'object') return emptyStore();
      return parsed;
    } catch {
      return emptyStore();
    }
  }

  function writeStore(store) {
    store.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function getRecord(caseId) {
    const store = readStore();
    if (!store.cases[caseId]) {
      const item = cases.find((entry) => entry.id === caseId);
      store.cases[caseId] = {
        caseVersion: item?.caseVersion || '1.0', watched: false, selectedObjectives: [], fields: {},
        teamDecision: 'insufficient', attempts: [], updatedAt: null
      };
    }
    return [store, store.cases[caseId]];
  }

  function hasIdentifiableData(text) {
    const value = String(text || '');
    return /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(value)
      || /\b\d{1,2}\.?(?:\d{3}\.?)?\d{3}-[0-9K]\b/i.test(value)
      || /(?:\+?56\s*)?(?:9\s*)?\d{4}[\s-]?\d{4}/.test(value);
  }

  function icon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2z"/><path d="M7 9h5M7 13h3"/></svg>';
  }

  function ensureSidebarButton() {
    const nav = document.querySelector('.ud-sidebar-nav');
    if (!nav) return;
    let button = nav.querySelector('[data-ud-model]');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.dataset.udModel = 'true';
      button.dataset.udNav = 'model';
      button.innerHTML = `${icon()}<span>Práctica audiovisual</span>`;
      const home = nav.querySelector('[data-ud-nav="home"]');
      if (home) home.insertAdjacentElement('afterend', button);
      else nav.prepend(button);
    }
    if (button.dataset.udModelBound !== 'true') {
      button.dataset.udModelBound = 'true';
      button.addEventListener('click', () => openModel('catalog'));
    }
  }

  function syncSidebar() {
    const button = document.querySelector('[data-ud-model]');
    if (!button) return;
    button.classList.toggle('active', routeOpen);
    if (routeOpen) {
      document.querySelectorAll('.ud-sidebar-nav [data-ud-nav]').forEach((item) => {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
      });
      button.setAttribute('aria-current', 'page');
    } else button.removeAttribute('aria-current');
  }

  function bindStandardNavigation() {
    // IMPORTANT: `body` also carries data-ud-screen for the base app state.
    // Binding to every [data-ud-screen] made BODY capture every click inside
    // the formative route and cleared activeCaseId before stage navigation.
    // Only actual sidebar navigation controls are allowed to close this route.
    document.querySelectorAll('.ud-sidebar-nav button[data-ud-screen]').forEach((button) => {
      if (button.dataset.udModelBound) return;
      button.dataset.udModelBound = 'true';
      button.addEventListener('click', () => {
        routeOpen = false;
        activeCaseId = null;
        delete document.body.dataset.udModelRoute;
      }, { capture: true });
    });
  }

  function entryMarkup(kind) {
    const available = cases.filter((item) => item.video).length;
    return `<section class="ud-model-entry ${kind}" data-ud-model-entry>
      <img src="assets/umbral-docente-logo.png" alt="">
      <div><span class="eyebrow">Ruta 2 · práctica audiovisual</span>
      <h2>Observa, registra, interpreta y decide con mayor claridad.</h2>
      <p>${available} casos con video y ${cases.length - available} fichas planificadas. Esta ruta complementa la práctica situada y te ayuda a observar antes de interpretar.</p></div>
      <button class="btn btn-primary" type="button" data-open-ud-model>Entrar a práctica audiovisual →</button>
    </section>`;
  }

  function mountEntry() {
    return;
  }

  function openModel(nextView = 'catalog') {
    if (!routeOpen && typeof state !== 'undefined') previousBaseScreen = state.screen || null;
    routeOpen = true;
    document.body.dataset.udModelRoute = 'active';
    view = nextView;
    activeCaseId = null;
    activePanel = 'video';
    renderCurrent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function leaveModel() {
    routeOpen = false;
    activeCaseId = null;
    delete document.body.dataset.udModelRoute;
    if (typeof go === 'function') go(previousBaseScreen && previousBaseScreen !== 'home' ? previousBaseScreen : 'dashboard');
    else location.reload();
  }

  function headerTabs(active) {
    const tabs = [
      ['catalog', 'Casos audiovisuales'], ['progress', 'Mi desarrollo'], ['library', 'BCEP y currículo'], ['about', 'Cómo funciona']
    ];
    return `<nav class="ud-model-tabs" aria-label="Secciones del modelo formativo">${tabs.map(([id, label]) =>
      `<button type="button" data-model-view="${id}" class="${active === id ? 'active' : ''}">${label}</button>`
    ).join('')}</nav>`;
  }

  function shell(content, active = view) {
    return `<section class="screen ud-model-screen" data-premium-screen="ud-model" data-model-screen="${esc(active)}">
      <header class="ud-model-top"><button type="button" class="ud-model-exit" data-model-exit>← Volver al inicio</button>
      <div><img src="assets/umbral-docente-logo.png" alt="Umbral Docente"><span>Ruta 2 · Práctica audiovisual</span></div></header>
      ${headerTabs(active)}${content}</section>`;
  }

  function filteredCases() {
    const q = slug(filterState.query);
    return cases.filter((item) => {
      if (filterState.sublevel !== 'all' && item.sublevelId !== filterState.sublevel) return false;
      if (filterState.theme !== 'all' && item.theme !== filterState.theme) return false;
      if (filterState.competence !== 'all' && !item.competencies.includes(filterState.competence)) return false;
      if (filterState.status === 'available' && !item.video) return false;
      if (filterState.status === 'planned' && item.video) return false;
      if (q && !slug([item.id, item.title, item.summary, item.focus, item.theme, ...item.competencies].join(' ')).includes(q)) return false;
      return true;
    });
  }

  function caseCard(item) {
    const [store, record] = getRecord(item.id);
    const attemptCount = record.attempts?.length || 0;
    const media = item.poster
      ? `<img src="${esc(item.poster)}" alt="Vista previa del caso ${esc(item.id)}: ${esc(item.title)}">`
      : `<div class="ud-model-placeholder"><b>＋</b><span>Video planificado</span></div>`;
    return `<article class="ud-model-card ${item.video ? 'available' : 'planned'}">
      <button type="button" data-model-case="${esc(item.id)}">
        <span class="ud-model-media">${media}<em>${item.video ? 'Disponible' : 'En producción'}</em></span>
        <span class="ud-model-card-body"><span><b>${esc(item.id)}</b><strong>${esc(item.title)}</strong><small>${esc(item.sublevelId.replaceAll('-', ' '))} · ${esc(item.theme)}</small></span><i>→</i></span>
        ${attemptCount ? `<span class="ud-model-attempt-chip">${attemptCount} ${attemptCount === 1 ? 'intento' : 'intentos'}</span>` : ''}
      </button>
    </article>`;
  }

  function renderCatalog() {
    const sublevels = [...new Set(cases.map((item) => item.sublevelId))];
    const themes = [...new Set(cases.map((item) => item.theme))];
    const competencies = [...new Set(cases.flatMap((item) => item.competencies))].sort();
    const list = filteredCases();
    const content = `<section class="ud-model-heading"><div><span class="eyebrow">Ruta 2 · práctica audiovisual</span><h1>Observa primero. Interpreta después.</h1><p>El video muestra una situación; tú registras hechos, distingues lo que falta por conocer y fundamentas una lectura pedagógica sin apresurarte.</p></div><aside><strong>${cases.length}</strong><span>casos del banco inicial</span><strong>${curriculum.length}</strong><span>OA/OAT navegables</span></aside></section>
      <div class="ud-model-rule"><strong>Regla de diseño</strong><span>Primero construyes una respuesta profesional. Después recibes contraste formativo y revisas tu propia planificación.</span></div>
      <section class="ud-model-filters" aria-label="Filtros del catálogo">
        <label>Subnivel<select data-filter="sublevel"><option value="all">Todos</option>${sublevels.map((v) => `<option value="${v}" ${filterState.sublevel === v ? 'selected' : ''}>${v.replaceAll('-', ' ')}</option>`).join('')}</select></label>
        <label>Temática<select data-filter="theme"><option value="all">Todas</option>${themes.map((v) => `<option value="${esc(v)}" ${filterState.theme === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>
        <label>Competencia<select data-filter="competence"><option value="all">Todas</option>${competencies.map((v) => `<option value="${esc(v)}" ${filterState.competence === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>
        <label>Estado<select data-filter="status"><option value="all">Todos</option><option value="available" ${filterState.status === 'available' ? 'selected' : ''}>Con video</option><option value="planned" ${filterState.status === 'planned' ? 'selected' : ''}>Planificados</option></select></label>
        <label class="search">Buscar<input type="search" data-filter="query" value="${esc(filterState.query)}" placeholder="Código, tema o competencia"></label>
      </section>
      <p class="ud-model-results">${list.length} ${list.length === 1 ? 'caso visible' : 'casos visibles'}</p>
      <div class="ud-model-grid">${list.map(caseCard).join('')}</div>`;
    appRoot.innerHTML = shell(content, 'catalog');
    bindCommon();
    document.querySelectorAll('[data-filter]').forEach((field) => field.addEventListener(field.tagName === 'INPUT' ? 'input' : 'change', () => {
      filterState[field.dataset.filter] = field.value;
      renderCatalog();
    }));
    document.querySelectorAll('[data-model-case]').forEach((button) => button.addEventListener('click', () => openCase(button.dataset.modelCase)));
  }

  function flowMarkup(record) {
    const completed = panelCompletion(record);
    const unlocked = unlockedPanelIndex(record);
    const activeIndex = Math.max(0, panelIndex(activePanel));
    const activeLabel = PANELS[activeIndex]?.[1] || 'Caso';
    const completedPanels = Object.values(completed).filter(Boolean).length;
    const totalPanels = PANELS.length;
    return `<div class="ud-guided-route-head ud-guided-route-compact"><div><span>Práctica audiovisual</span><strong>Etapa ${activeIndex + 1} de ${totalPanels} · ${esc(activeLabel)}</strong></div><small>${completedPanels} etapas completadas</small></div>
      <div class="ud-route-progress" aria-label="Progreso de la práctica"><span style="width:${Math.max(8, Math.round(((activeIndex + 1) / totalPanels) * 100))}%"></span></div>
      <details class="ud-route-details"><summary>Ver recorrido completo</summary><ol class="ud-model-flow">${FLOW.map(([id, label], index) => {
      const panel = PANELS.find(([, , indices]) => indices.includes(index))?.[0] || 'video';
      const pIndex = panelIndex(panel);
      const isActive = panel === activePanel;
      const done = completed[panel];
      const locked = pIndex > unlocked;
      return `<li class="${isActive ? 'active' : ''} ${done ? 'done' : ''} ${locked ? 'locked' : ''}"><button type="button" data-panel="${panel}" ${locked ? 'disabled aria-disabled="true" title="Completa la etapa anterior para continuar"' : ''}><span>${index + 1}</span><small>${esc(label)}</small></button></li>`;
    }).join('')}</ol></details>`;
  }

  function panelCompletion(record) {
    const f = record.fields || {};
    return {
      video: Boolean(record.watched),
      observe: Boolean(f.objectiveObservation && f.missingInformation),
      interpret: Boolean(f.pedagogicalSituation && f.evidenceSupport && f.alternativeHypotheses),
      curriculum: Boolean(record.selectedObjectives?.length && f.curricularRationale),
      focus: Boolean(f.specificSkill && f.pedagogicalPurpose),
      intervention: Boolean(f.start && f.development && f.closure && f.resources && f.dailyMoment && f.childParticipation),
      evaluation: Boolean(f.expectedEvidence && f.indicators && f.instrument),
      collaboration: Boolean(f.familyParticipation && f.teamRationale && f.adjustmentPlan),
      reflection: Boolean(f.decisiveElements && f.observationInferenceDifference && f.bestFoundedDecision && f.secondVersionChange && f.professionalLearning),
      feedback: Boolean(record.attempts?.length)
    };
  }

  function panelRequiredMissing(panelId, record) {
    const missing = [];
    const fields = TEXT_FIELDS[panelId] || [];
    fields.filter((field) => field[3]).forEach((field) => {
      if (!String(record.fields?.[field[0]] || '').trim()) missing.push(field[1]);
    });
    if (panelId === 'video' && !record.watched) missing.push('Visualización inicial del caso');
    if (panelId === 'curriculum' && !(record.selectedObjectives || []).length) missing.push('Selección de al menos un OA/OAT');
    return missing;
  }

  function panelIndex(panelId) {
    return PANELS.findIndex(([id]) => id === panelId);
  }

  function unlockedPanelIndex(record) {
    const completed = panelCompletion(record);
    const firstIncomplete = PANELS.findIndex(([id]) => !completed[id]);
    return firstIncomplete < 0 ? PANELS.length - 1 : firstIncomplete;
  }

  function nextPanelLabel(panelId) {
    const index = panelIndex(panelId);
    return PANELS[Math.min(index + 1, PANELS.length - 1)]?.[1] || 'Continuar';
  }

  function showStageError(missing) {
    const panel = document.querySelector('.ud-model-panel');
    if (!panel) return;
    let error = panel.querySelector('.ud-model-stage-error');
    if (!error) {
      const actions = panel.querySelector('.ud-model-actions');
      (actions || panel).insertAdjacentHTML(actions ? 'beforebegin' : 'beforeend', '<div class="ud-model-stage-error" role="alert"></div>');
      error = panel.querySelector('.ud-model-stage-error');
    }
    error.innerHTML = `<strong>Para continuar esta etapa:</strong><span>${missing.map(esc).join(' · ')}</span>`;
    error.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function fieldMarkup(field, value = '', expanded = false) {
    const [key, label, prompt, required] = field;
    const hasValue = Boolean(String(value || '').trim());
    return `<details class="ud-model-field-step ${hasValue ? 'complete' : ''}" ${expanded ? 'open' : ''}><summary><span>${hasValue ? '✓ ' : ''}${esc(label)}${required ? '<b aria-label="obligatorio">*</b>' : ''}</span><em>${hasValue ? 'Registrado' : 'Responder'}</em></summary><label class="ud-model-field"><small>${esc(prompt)}</small><textarea rows="4" data-model-field="${key}" placeholder="Escribe tu razonamiento profesional…">${esc(value)}</textarea></label></details>`;
  }

  function caseHeader(item, record) {
    return `<button type="button" class="ud-model-back" data-back-catalog>← Volver a casos audiovisuales</button>
      <header class="ud-model-case-heading ud-model-case-heading-compact"><div><span class="eyebrow">${esc(item.id)} · ${esc(item.sublevelId.replaceAll('-', ' '))}</span><h1>${esc(item.title)}</h1><details class="ud-case-context"><summary>Ver contexto del caso</summary><p>${esc(item.summary)}</p></details></div><aside><span>${esc(item.tramo)}</span><span>${esc(item.theme)}</span></aside></header>
      <div class="ud-model-safety ud-model-safety-compact"><strong>Simulación</strong><span>No ingreses datos reales o identificables.</span></div>
      ${flowMarkup(record)}`;
  }

  function videoPanel(item, record) {
    const media = item.video
      ? `<video controls preload="metadata" poster="${esc(item.poster)}" data-case-video><source src="${esc(item.video)}" type="video/mp4"></video>`
      : `<div class="ud-model-video-placeholder"><strong>Video en producción</strong><p>La ficha técnica y el recorrido formativo ya están disponibles para revisión académica.</p></div>`;
    return `<section class="ud-model-panel ud-model-video-stage"><div class="ud-model-panel-title"><span class="eyebrow">Pasos 1–2 · Contexto y video</span><h2>Observa la escena completa antes de interpretar.</h2><p>En la primera visualización no completes la planilla. El video aporta evidencia; la interpretación comienza en la etapa siguiente.</p></div>
      <div class="ud-model-video-layout"><div class="ud-model-video">${media}</div><aside><h3>Qué observar</h3><ul>${item.observe.map((point) => `<li>${esc(point)}</li>`).join('')}</ul><div class="ud-video-rule"><strong>Regla del caso</strong><span>El video muestra. Tú observas antes de concluir.</span></div></aside></div>
      <div class="ud-model-watch-state ${record.watched ? 'done' : ''}"><div><strong>${record.watched ? 'Visualización inicial registrada' : 'Cuando termines de mirar, continúa con la observación objetiva'}</strong><span>${record.watched ? 'La etapa de registro objetivo ya está habilitada.' : 'No necesitas responder nada todavía. Mira la escena y luego avanza.'}</span></div>${record.watched
        ? '<button type="button" class="btn btn-primary" data-continue-after-video>Continuar: registrar observación →</button>'
        : '<button type="button" class="btn btn-primary" data-mark-watched>Ya observé el video · continuar →</button>'}</div>
      <details class="ud-model-internal"><summary>Ficha interna para revisión académica</summary><dl><div><dt>Lo que el video no dice</dt><dd>${esc(item.whatVideoDoesNotSay)}</dd></div><div><dt>Riesgos de interpretación</dt><dd>${item.interpretationRisks.map(esc).join(' · ')}</dd></div><div><dt>Competencias practicadas</dt><dd>${item.competencies.map(esc).join(' · ')}</dd></div><div><dt>Trazabilidad</dt><dd>${esc(item.sourceVersion)}</dd></div></dl></details>
      ${panelActions('video')}`;
  }

  function textPanel(panelId, record, title, intro) {
    const fields = TEXT_FIELDS[panelId] || [];
    const firstIncomplete = fields.findIndex((field) => !String(record.fields?.[field[0]] || '').trim());
    return `<section class="ud-model-panel"><div class="ud-model-panel-title"><span class="eyebrow">${esc(PANELS.find(([id]) => id === panelId)?.[1] || '')}</span><h2>${esc(title)}</h2><p>${esc(intro)}</p></div><div class="ud-model-fields ud-model-fields-focused">${fields.map((field, index) => fieldMarkup(field, record.fields?.[field[0]], index === (firstIncomplete < 0 ? 0 : firstIncomplete))).join('')}</div>${panelActions(panelId)}</section>`;
  }

  function curriculumPanel(item, record) {
    const levelItems = curriculum.filter((objective) => objective.level === item.tramoId);
    const scopes = [...new Set(levelItems.map((objective) => objective.scope))];
    const selected = new Set(record.selectedObjectives || []);
    const options = levelItems.map((objective) => `<label class="ud-curriculum-option ${selected.has(objective.id) ? 'selected' : ''}" data-scope="${esc(objective.scope)}" data-core="${esc(objective.core)}" data-type="${objective.type}"><input type="checkbox" value="${esc(objective.id)}" data-objective ${selected.has(objective.id) ? 'checked' : ''}><span><b>${objective.type} ${objective.number} · ${esc(objective.core)}</b><small>${esc(objective.scope)}</small><p>${esc(objective.text)}</p><em>${esc(objective.source)}</em></span></label>`).join('');
    return `<section class="ud-model-panel"><div class="ud-model-panel-title"><span class="eyebrow">Paso 5</span><h2>Selecciona desde la planilla oficial, sin una respuesta sugerida.</h2><p>La pertinencia forma parte de la tarea profesional. Puedes elegir hasta dos objetivos y debes fundamentar la coherencia con propósito, estrategia y evaluación.</p></div>
      <div class="ud-curriculum-toolbar"><label>Ámbito<select data-curr-filter="scope"><option value="all">Todos</option>${scopes.map((scope) => `<option value="${esc(scope)}">${esc(scope)}</option>`).join('')}</select></label><label>Tipo<select data-curr-filter="type"><option value="all">OA y OAT</option><option>OA</option><option>OAT</option></select></label><label>Buscar<input type="search" data-curr-filter="query" placeholder="Palabra del objetivo"></label><span><b data-selected-count>${selected.size}</b> de 2 seleccionados</span></div>
      <div class="ud-curriculum-list">${options}</div>
      <div class="ud-selected-objectives"><h3>Selección actual</h3><div data-selected-list>${selectedObjectivesMarkup(record)}</div></div>
      <div class="ud-model-fields ud-model-fields-focused">${TEXT_FIELDS.curriculum.map((field) => fieldMarkup(field, record.fields?.[field[0]], true)).join('')}</div>${panelActions('curriculum')}</section>`;
  }

  function selectedObjectivesMarkup(record) {
    const selected = curriculum.filter((objective) => (record.selectedObjectives || []).includes(objective.id));
    if (!selected.length) return '<p>Aún no seleccionas OA/OAT.</p>';
    return selected.map((objective) => `<article><strong>${objective.type} ${objective.number} · ${esc(objective.core)}</strong><p>${esc(objective.text)}</p></article>`).join('');
  }

  function collaborationPanel(record) {
    return `<section class="ud-model-panel"><div class="ud-model-panel-title"><span class="eyebrow">Paso 9</span><h2>Construye colaboración y actúa con prudencia profesional.</h2><p>La familia es participante relevante. Equipo y redes se consideran solo cuando la evidencia y el contexto lo justifican.</p></div>
      <div class="ud-model-fields ud-model-fields-focused">${fieldMarkup(TEXT_FIELDS.collaboration[0], record.fields?.familyParticipation, !record.fields?.familyParticipation)}
      <label class="ud-model-field ud-model-select-focus"><span>¿Requiere equipo o redes?<b>*</b></span><small>Selecciona una posición provisional y fundaméntala.</small><select data-team-decision><option value="no" ${record.teamDecision === 'no' ? 'selected' : ''}>No por ahora</option><option value="yes" ${record.teamDecision === 'yes' ? 'selected' : ''}>Sí, con fundamento</option><option value="insufficient" ${record.teamDecision === 'insufficient' ? 'selected' : ''}>Aún no cuento con información suficiente</option></select></label>
      ${fieldMarkup(TEXT_FIELDS.collaboration[1], record.fields?.teamRationale, Boolean(record.fields?.familyParticipation && !record.fields?.teamRationale))}${fieldMarkup(TEXT_FIELDS.collaboration[2], record.fields?.adjustmentPlan, Boolean(record.fields?.familyParticipation && record.fields?.teamRationale && !record.fields?.adjustmentPlan))}</div>${panelActions('collaboration')}</section>`;
  }

  function feedbackPanel(item, record) {
    const completeness = requiredStatus(record);
    const attempts = record.attempts || [];
    const latest = attempts.at(-1);
    return `<section class="ud-model-panel"><div class="ud-model-panel-title"><span class="eyebrow">Pasos 11–14</span><h2>Envía, recibe contraste formativo, revisa y reintenta.</h2><p>La devolución no certifica competencias ni busca una única respuesta correcta. Analiza coherencia, pertinencia y fundamentación.</p></div>
      <div class="ud-submit-summary"><article><strong>${completeness.completed}/${completeness.total}</strong><span>campos esenciales desarrollados</span></article><article><strong>${record.selectedObjectives?.length || 0}</strong><span>OA/OAT seleccionados</span></article><article><strong>${attempts.length}</strong><span>versiones guardadas</span></article></div>
      ${completeness.missing.length ? `<div class="ud-model-warning"><strong>Antes de enviar, revisa:</strong><span>${completeness.missing.map(esc).join(' · ')}</span></div>` : ''}
      <div class="ud-feedback-actions"><button type="button" class="btn btn-secondary" data-download-draft>Descargar borrador</button><button type="button" class="btn btn-primary" data-submit-attempt ${completeness.missing.length ? 'disabled' : ''}>${attempts.length ? 'Guardar nueva versión y comparar' : 'Enviar y generar retroalimentación'}</button></div>
      ${latest ? feedbackMarkup(latest, attempts.at(-2)) : '<div class="ud-feedback-empty"><strong>La retroalimentación aparecerá aquí.</strong><p>Primero completa la planificación con tu propio razonamiento.</p></div>'}
      ${panelActions('feedback', true)}</section>`;
  }

  function feedbackMarkup(attempt, previous) {
    const changed = previous ? compareAttempts(previous.fields, attempt.fields) : [];
    return `<section class="ud-feedback-result"><header><span class="eyebrow">Retroalimentación formativa · versión ${attempt.version}</span><h3>Contraste descriptivo en ${attempt.feedback.length} dimensiones.</h3><p>Generado por reglas transparentes del prototipo. Debe discutirse con supervisión académica.</p></header>
      ${previous ? `<div class="ud-version-compare"><strong>Cambios frente a la versión ${previous.version}</strong><span>${changed.length ? changed.map(esc).join(' · ') : 'No se detectaron cambios textuales relevantes.'}</span></div>` : ''}
      <div class="ud-feedback-grid">${attempt.feedback.map((item) => `<article class="${slug(item.type)}"><span>${esc(item.type)}</span><h4>${esc(item.dimension)}</h4><p>${esc(item.message)}</p>${item.question ? `<blockquote>${esc(item.question)}</blockquote>` : ''}<small>${esc(item.source)}</small></article>`).join('')}</div>
      <div class="ud-feedback-next"><strong>El aprendizaje está en la revisión</strong><p>Vuelve a la etapa que quieras modificar, conserva lo que está bien fundamentado y registra una nueva versión.</p><button type="button" class="btn btn-primary" data-review-attempt>Revisar planificación →</button></div></section>`;
  }

  function panelActions(panelId, noNext = false) {
    const index = panelIndex(panelId);
    const label = PANELS[index]?.[1] || 'Etapa';
    const nextLabel = nextPanelLabel(panelId);
    return `<div class="ud-model-actions"><button type="button" class="btn btn-secondary" data-prev-panel ${index === 0 ? 'disabled' : ''}>← Etapa anterior</button><span class="ud-model-save"><b>${index + 1} de ${PANELS.length} · ${esc(label)}</b><small>Guardado progresivo en este navegador</small></span>${noNext ? '' : `<button type="button" class="btn btn-primary" data-next-panel>Continuar a ${esc(nextLabel)} →</button>`}</div>`;
  }

  function renderCase() {
    routeOpen = true;
    document.body.dataset.udModelRoute = 'active';
    const item = cases.find((entry) => entry.id === activeCaseId);
    if (!item) return renderCatalog();
    const [, record] = getRecord(item.id);
    let panel = '';
    if (activePanel === 'video') panel = videoPanel(item, record);
    else if (activePanel === 'observe') panel = textPanel('observe', record, 'Registra hechos antes de interpretar.', 'Una observación profesional distingue acciones visibles, secuencia temporal e información ausente.');
    else if (activePanel === 'interpret') panel = textPanel('interpret', record, 'Construye una lectura provisional y defendible.', 'La escena admite más de una interpretación. Explicita evidencia, alternativas e incertidumbre.');
    else if (activePanel === 'curriculum') panel = curriculumPanel(item, record);
    else if (activePanel === 'focus') panel = textPanel('focus', record, 'Define el aprendizaje específico y la intención pedagógica.', 'Evita propósitos generales. La habilidad y el propósito deben conectar observación, currículum e intervención.');
    else if (activePanel === 'intervention') panel = textPanel('intervention', record, 'Diseña una intervención situada, no una actividad desconectada.', 'Acogida, alimentación, higiene, juego, actividad variable, patio y transiciones pueden ser contextos pedagógicos intencionados.');
    else if (activePanel === 'evaluation') panel = textPanel('evaluation', record, 'Diseña evaluación para aprender y ajustar.', 'Primero define evidencia, después indicadores y finalmente el instrumento pertinente.');
    else if (activePanel === 'collaboration') panel = collaborationPanel(record);
    else if (activePanel === 'reflection') panel = textPanel('reflection', record, 'Examina tus decisiones, supuestos e incertidumbres.', 'La reflexión no justifica retrospectivamente: permite revisar cómo observaste, decidiste y evaluarías.');
    else panel = feedbackPanel(item, record);
    appRoot.innerHTML = shell(caseHeader(item, record) + panel, 'catalog');
    bindCommon();
    bindCase(item, record);
  }

  function collectVisibleFields(record) {
    const next = { ...(record.fields || {}) };
    document.querySelectorAll('[data-model-field]').forEach((field) => { next[field.dataset.modelField] = field.value.trim(); });
    return next;
  }

  function saveVisible({ announce = false } = {}) {
    if (!activeCaseId) {
      console.warn('Umbral Docente: no hay un caso activo para guardar esta etapa.');
      return false;
    }
    const [store, record] = getRecord(activeCaseId);
    const fields = collectVisibleFields(record);
    const blocked = Object.entries(fields).filter(([, value]) => hasIdentifiableData(value)).map(([key]) => key);
    const error = document.querySelector('.ud-model-privacy-error');
    if (blocked.length) {
      if (error) { error.hidden = false; error.textContent = 'No se guardó: elimina correos, RUT o teléfonos de personas reales.'; }
      return false;
    }
    record.fields = fields;
    const team = document.querySelector('[data-team-decision]');
    if (team) record.teamDecision = team.value;
    record.updatedAt = new Date().toISOString();
    writeStore(store);
    if (announce) {
      const status = document.querySelector('.ud-model-save');
      if (status) status.textContent = 'Borrador guardado en este navegador';
    }
    return true;
  }

  function switchPanel(panelId, { enforceUnlock = true } = {}) {
    saveVisible();
    const [, record] = getRecord(activeCaseId);
    if (enforceUnlock && panelIndex(panelId) > unlockedPanelIndex(record)) {
      showStageError(['Completa la etapa actual antes de abrir una etapa posterior']);
      return;
    }
    activePanel = panelId;
    renderCase();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextPanel(direction) {
    if (!activeCaseId) {
      showStageError(['No se pudo conservar el caso activo. Vuelve al caso y reintenta; tu borrador local no se elimina.']);
      return;
    }
    if (direction < 0) {
      const index = panelIndex(activePanel);
      return switchPanel(PANELS[Math.max(0, index - 1)][0], { enforceUnlock: false });
    }
    if (!saveVisible({ announce: true })) return;
    const [, record] = getRecord(activeCaseId);
    const missing = panelRequiredMissing(activePanel, record);
    if (missing.length) {
      showStageError(missing);
      return;
    }
    const index = panelIndex(activePanel);
    const next = Math.min(PANELS.length - 1, index + 1);
    switchPanel(PANELS[next][0], { enforceUnlock: false });
  }

  function bindCase(item, record) {
    document.querySelector('[data-back-catalog]')?.addEventListener('click', () => { activeCaseId = null; renderCatalog(); });
    document.querySelectorAll('[data-panel]:not([disabled])').forEach((button) => button.addEventListener('click', () => switchPanel(button.dataset.panel)));
    document.querySelector('[data-prev-panel]')?.addEventListener('click', () => nextPanel(-1));
    document.querySelector('[data-next-panel]')?.addEventListener('click', () => nextPanel(1));
    document.querySelectorAll('[data-model-field]').forEach((field) => field.addEventListener('input', () => {
      clearTimeout(field._saveTimer);
      field._saveTimer = setTimeout(() => saveVisible(), 500);
    }));
    document.querySelector('[data-team-decision]')?.addEventListener('change', () => saveVisible({ announce: true }));
    const video = document.querySelector('[data-case-video]');
    video?.addEventListener('ended', () => markWatched(item.id, true, false));
    const continueToObservation = (event, registerWatch = false) => {
      event?.preventDefault();
      event?.stopPropagation();
      event?.stopImmediatePropagation?.();
      routeOpen = true;
      document.body.dataset.udModelRoute = 'active';
      activeCaseId = item.id;
      view = 'case';
      if (registerWatch) markWatched(item.id, true, false);
      activePanel = 'observe';
      renderCase();
      requestAnimationFrame(() => {
        const target = document.querySelector('.ud-model-panel-title');
        if (target) target.scrollIntoView({ block: 'start', behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    };
    document.querySelector('[data-mark-watched]')?.addEventListener('click', (event) => continueToObservation(event, true));
    document.querySelector('[data-continue-after-video]')?.addEventListener('click', (event) => continueToObservation(event, false));
    bindCurriculum(record);
    document.querySelector('[data-submit-attempt]')?.addEventListener('click', () => submitAttempt(item));
    document.querySelector('[data-review-attempt]')?.addEventListener('click', () => switchPanel('observe', { enforceUnlock: false }));
    document.querySelector('[data-download-draft]')?.addEventListener('click', () => downloadDraft(item, record));
    const panel = document.querySelector('.ud-model-panel');
    if (panel && !panel.querySelector('.ud-model-privacy-error')) panel.insertAdjacentHTML('beforeend', '<div class="ud-model-privacy-error" role="alert" hidden></div>');
  }

  function markWatched(caseId, watched, rerender = true) {
    const [store, record] = getRecord(caseId);
    record.watched = watched;
    record.updatedAt = new Date().toISOString();
    writeStore(store);
    if (rerender) renderCase();
  }

  function bindCurriculum(record) {
    const list = document.querySelector('.ud-curriculum-list');
    if (!list) return;
    function refreshFilter() {
      const scope = document.querySelector('[data-curr-filter="scope"]')?.value || 'all';
      const type = document.querySelector('[data-curr-filter="type"]')?.value || 'all';
      const query = slug(document.querySelector('[data-curr-filter="query"]')?.value || '');
      list.querySelectorAll('.ud-curriculum-option').forEach((option) => {
        const show = (scope === 'all' || option.dataset.scope === scope)
          && (type === 'all' || option.dataset.type === type)
          && (!query || slug(option.textContent).includes(query));
        option.hidden = !show;
      });
    }
    document.querySelectorAll('[data-curr-filter]').forEach((field) => field.addEventListener(field.tagName === 'INPUT' ? 'input' : 'change', refreshFilter));
    document.querySelectorAll('[data-objective]').forEach((checkbox) => checkbox.addEventListener('change', () => {
      const [store, current] = getRecord(activeCaseId);
      let selected = [...(current.selectedObjectives || [])];
      if (checkbox.checked && !selected.includes(checkbox.value)) {
        if (selected.length >= 2) { checkbox.checked = false; return; }
        selected.push(checkbox.value);
      } else if (!checkbox.checked) selected = selected.filter((id) => id !== checkbox.value);
      current.selectedObjectives = selected;
      writeStore(store);
      document.querySelector('[data-selected-count]').textContent = selected.length;
      document.querySelector('[data-selected-list]').innerHTML = selectedObjectivesMarkup(current);
      checkbox.closest('.ud-curriculum-option')?.classList.toggle('selected', checkbox.checked);
    }));
  }

  function requiredStatus(record) {
    const required = Object.values(TEXT_FIELDS).flat().filter((field) => field[3]);
    const missing = required.filter((field) => !String(record.fields?.[field[0]] || '').trim()).map((field) => field[1]);
    if (!record.watched) missing.unshift('Primera visualización del video');
    if (!(record.selectedObjectives || []).length) missing.push('Selección de OA/OAT');
    if (!record.teamDecision) missing.push('Decisión sobre equipo o redes');
    return { total: required.length + 3, completed: required.length + 3 - missing.length, missing };
  }

  function textLength(fields, key) { return String(fields[key] || '').trim().length; }
  function includesAny(text, words) { const value = slug(text); return words.some((word) => value.includes(slug(word))); }

  function feedbackFor(record) {
    const f = record.fields || {};
    const selected = curriculum.filter((objective) => (record.selectedObjectives || []).includes(objective.id));
    const allText = Object.values(f).join(' ');
    const feedback = [];
    const add = (type, dimension, message, question, source) => feedback.push({ type, dimension, message, question, source });

    add(textLength(f, 'objectiveObservation') >= 140 && textLength(f, 'missingInformation') >= 70 ? 'Fortaleza' : 'Aspecto a profundizar',
      'Observación',
      textLength(f, 'objectiveObservation') >= 140 ? 'El registro contiene conductas y secuencia suficientes para sostener una revisión basada en evidencia.' : 'El registro todavía es breve o mezcla hechos con explicaciones. Amplía acciones, tiempos y cambios observables.',
      textLength(f, 'missingInformation') >= 70 ? '¿Qué evidencia distingue con mayor claridad lo observado de tu interpretación?' : '¿Qué no muestra la escena y qué conclusión deberías mantener abierta?',
      'Modelo Umbral v1.0 · Evidencia específica del caso');

    add(selected.length && textLength(f, 'curricularRationale') >= 100 ? 'Fortaleza' : 'Aspecto a profundizar',
      'Coherencia curricular',
      selected.length ? 'La selección curricular está explícita; revisa que se mantenga conectada con propósito, experiencia e indicadores.' : 'No existe aún una selección curricular que permita revisar la cadena de coherencia.',
      '¿Podrías defender la misma selección si cambiaras el material, pero conservaras la necesidad y el propósito?',
      'BCEP 2018 · Organización curricular y planificación');

    const rigidMilestone = includesAny(allText, ['debe lograr', 'a su edad debería', 'retraso', 'normal para su edad']);
    add(rigidMilestone ? 'Aspecto a profundizar' : 'Fortaleza', 'Pertinencia del desarrollo',
      rigidMilestone ? 'Aparece lenguaje que puede convertir trayectorias variables en reglas rígidas. Reformula desde progresión, contexto y variabilidad individual.' : 'La propuesta evita utilizar la escena como prueba diagnóstica o tabla rígida de hitos.',
      '¿Cómo cambiaría tu formulación si asumieras variabilidad individual y necesidad de más evidencia?',
      'Modelo Umbral v1.0 · Desarrollo infantil 0–6 (corpus pendiente de validación)');

    const disconnected = textLength(f, 'pedagogicalSituation') < 90 || textLength(f, 'development') < 120;
    add(disconnected ? 'Aspecto a profundizar' : 'Fortaleza', 'Pertinencia pedagógica',
      disconnected ? 'La relación entre situación observada y propuesta necesita mayor desarrollo.' : 'La intervención responde de manera explícita a la situación construida y puede implementarse en un contexto auténtico de la jornada.',
      '¿La necesidad requiere una actividad separada o puede abordarse dentro del momento cotidiano observado?',
      'Modelo Umbral v1.0 · Planificación situada');

    const autonomyPurpose = includesAny(`${f.specificSkill} ${f.pedagogicalPurpose}`, ['autonomía', 'elección', 'iniciativa', 'participación']);
    const directive = includesAny(f.development, ['deberá', 'tendrá que', 'se le indicará exactamente', 'repetirá hasta', 'obligar']);
    add(autonomyPurpose && directive ? 'Aspecto a profundizar' : 'Fortaleza', 'Protagonismo infantil',
      autonomyPurpose && directive ? 'El propósito declara autonomía o participación, pero el desarrollo permanece altamente dirigido por la persona adulta.' : 'La planificación incorpora oportunidades de iniciativa, expresión o elección infantil.',
      '¿Qué parte de la experiencia podría quedar genuinamente abierta a una decisión del niño o niña?',
      'BCEP 2018 · Principios de Actividad y Potenciación');

    const principles = ['bienestar', 'singularidad', 'juego', 'relación', 'significado', 'potenciación', 'actividad'];
    const presentPrinciples = principles.filter((p) => includesAny(allText, [p]));
    add(presentPrinciples.length >= 2 ? 'Fortaleza' : 'Orientación', 'Principios BCEP',
      presentPrinciples.length >= 2 ? `La propuesta hace visibles principios como ${presentPrinciples.slice(0, 3).join(', ')}.` : 'Haz explícito cómo la intervención integra bienestar, singularidad, actividad, juego, relación, significado o potenciación.',
      '¿Qué principio BCEP orienta una decisión concreta de tu planificación?',
      'BCEP 2018 · Ocho principios pedagógicos');

    add(textLength(f, 'development') >= 140 && textLength(f, 'childParticipation') >= 90 ? 'Fortaleza' : 'Aspecto a profundizar', 'Mediación',
      textLength(f, 'development') >= 140 ? 'La mediación está descrita con suficiente detalle para revisar espera, apoyo, preguntas y directividad.' : 'Explica qué hará la persona adulta, cuándo esperará y cómo ajustará su ayuda.',
      '¿Cómo sabrás que debes intervenir, esperar, modelar o retirar apoyo?',
      'Modelo Umbral v1.0 · Pedagogía de Educación Parvularia');

    const adultIndicators = includesAny(f.indicators, ['la educadora', 'la técnico', 'el adulto hará', 'explicará', 'mostrará', 'entregará']);
    add(!adultIndicators && textLength(f, 'indicators') >= 100 && textLength(f, 'instrument') >= 70 ? 'Fortaleza' : 'Aspecto a profundizar', 'Evaluación',
      adultIndicators ? 'Parte de los indicadores describe acciones adultas en lugar de evidencias del aprendizaje infantil.' : 'Revisa que evidencia, indicadores e instrumento permitan tomar decisiones de ajuste y no solo constatar una actividad.',
      '¿Qué conducta, expresión o acción infantil permitiría reconocer progresión?',
      'BCEP 2018 · Evaluación para el aprendizaje');

    const inclusion = includesAny(allText, ['ritmo', 'diversidad', 'accesibilidad', 'cultura', 'preferencia', 'alternativa', 'singularidad']);
    add(inclusion ? 'Fortaleza' : 'Orientación', 'Inclusión y diversidad',
      inclusion ? 'La planificación considera al menos una condición de ritmo, acceso, preferencia o contexto.' : 'Incorpora una alternativa de acceso o participación sin asumir una respuesta homogénea.',
      '¿Qué ajustarías para respetar ritmos, cultura, características o formas distintas de participación?',
      'BCEP 2018 · Enfoque de derechos, inclusión y singularidad');

    const genericFamily = textLength(f, 'familyParticipation') < 100 || includesAny(f.familyParticipation, ['hacer una reunión', 'mandar actividad', 'informar a los padres']);
    add(genericFamily ? 'Aspecto a profundizar' : 'Fortaleza', 'Familia',
      genericFamily ? 'La participación familiar aparece genérica. Precisa información necesaria, aporte recíproco y acuerdo de continuidad.' : 'La familia se integra como fuente de información y colaboradora del proceso, no como ejecutora de una solución estándar.',
      '¿Qué puede aportar la familia que el video no muestra y qué acuerdo sería pertinente construir?',
      'BCEP 2018 · Familia y comunidad educativa');

    const automaticReferral = record.teamDecision === 'yes' && textLength(f, 'evidenceSupport') < 120;
    add(automaticReferral ? 'Aspecto a profundizar' : 'Fortaleza', 'Equipo y redes',
      automaticReferral ? 'La decisión de activar apoyos requiere más evidencia y antecedentes complementarios.' : record.teamDecision === 'insufficient' ? 'Reconocer que aún falta información es una decisión profesional prudente.' : 'La posición sobre equipo y redes está explícita y puede revisarse desde su fundamento.',
      '¿Qué evidencia adicional necesitarías antes de solicitar un apoyo interno o externo?',
      'Modelo Umbral v1.0 · Prudencia profesional y no derivación automática');

    add(textLength(f, 'adjustmentPlan') >= 100 ? 'Fortaleza' : 'Aspecto a profundizar', 'Flexibilidad',
      textLength(f, 'adjustmentPlan') >= 100 ? 'Existe un plan de ajuste frente a respuestas distintas de las anticipadas.' : 'La planificación necesita anticipar cambios de ritmo, apoyo, ambiente o estrategia.',
      '¿Qué modificarías primero si la respuesta infantil fuera distinta a la esperada?',
      'Modelo Umbral v1.0 · Flexibilidad y práctica situada');

    add(textLength(f, 'professionalLearning') >= 110 && textLength(f, 'observationInferenceDifference') >= 90 ? 'Fortaleza' : 'Aspecto a profundizar', 'Reflexión profesional',
      textLength(f, 'professionalLearning') >= 110 ? 'La reflexión identifica aprendizaje de la propia práctica y abre una segunda versión.' : 'Profundiza cómo tus supuestos influyeron y qué cambiarías con nueva evidencia.',
      '¿Qué mantendrías, qué cambiarías y qué dato nuevo podría modificar tu decisión?',
      'Modelo Umbral v1.0 · Reflexión y reintento');

    return feedback;
  }

  function submitAttempt(item) {
    if (!saveVisible({ announce: true })) return;
    const [store, record] = getRecord(item.id);
    const status = requiredStatus(record);
    if (status.missing.length) return;
    record.attempts = Array.isArray(record.attempts) ? record.attempts : [];
    const version = record.attempts.length + 1;
    record.attempts.push({
      version, timestamp: new Date().toISOString(), caseVersion: item.caseVersion,
      fields: { ...record.fields }, selectedObjectives: [...record.selectedObjectives],
      teamDecision: record.teamDecision, feedback: feedbackFor(record)
    });
    record.attempts = record.attempts.slice(-MAX_ATTEMPTS);
    writeStore(store);
    renderCase();
  }

  function compareAttempts(previous, current) {
    const labels = Object.fromEntries(Object.values(TEXT_FIELDS).flat().map((field) => [field[0], field[1]]));
    return Object.keys({ ...(previous || {}), ...(current || {}) }).filter((key) => String(previous?.[key] || '').trim() !== String(current?.[key] || '').trim()).map((key) => labels[key] || key);
  }

  function downloadDraft(item, record) {
    saveVisible();
    const selected = curriculum.filter((objective) => (record.selectedObjectives || []).includes(objective.id));
    const lines = [
      'UMBRAL DOCENTE · PLANIFICACIÓN FORMATIVA', `Caso: ${item.id} · ${item.title}`, `Tramo: ${item.tramo}`, `Subnivel: ${item.sublevelId}`, '',
      'OA/OAT SELECCIONADOS', ...selected.map((objective) => `${objective.type} ${objective.number} · ${objective.core}\n${objective.text}`), ''
    ];
    Object.values(TEXT_FIELDS).flat().forEach(([key, label]) => lines.push(label.toUpperCase(), record.fields?.[key] || '—', ''));
    lines.push('DECISIÓN SOBRE EQUIPO/REDES', record.teamDecision || '—', '', 'Documento formativo. No reemplaza supervisión académica ni constituye diagnóstico.');
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `umbral-${item.id}-planificacion.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function openCase(caseId) {
    activeCaseId = caseId;
    activePanel = 'video';
    view = 'case';
    renderCase();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderProgress() {
    const store = readStore();
    const records = cases.map((item) => ({ item, record: store.cases[item.id] || { fields: {}, attempts: [], selectedObjectives: [] } }));
    const attempted = records.filter(({ record }) => record.attempts?.length);
    const revisions = records.reduce((sum, { record }) => sum + Math.max(0, (record.attempts?.length || 0) - 1), 0);
    const cores = new Set(records.flatMap(({ record }) => curriculum.filter((o) => (record.selectedObjectives || []).includes(o.id)).map((o) => o.core)));
    const strengths = new Map(DIMENSIONS.map((dimension) => [dimension, 0]));
    attempted.forEach(({ record }) => record.attempts.at(-1)?.feedback?.forEach((item) => {
      if (item.type === 'Fortaleza') strengths.set(item.dimension, (strengths.get(item.dimension) || 0) + 1);
    }));
    const content = `<section class="ud-model-heading"><div><span class="eyebrow">Mi desarrollo</span><h1>Progreso visible, sin saturación.</h1><p>Revisa los casos trabajados, los focos más frecuentes y tu avance formativo sin convertir la experiencia en una etiqueta.</p></div></section>
      <div class="ud-progress-kpis"><article><strong>${attempted.length}</strong><span>casos enviados</span></article><article><strong>${revisions}</strong><span>reintentos</span></article><article><strong>${cores.size}</strong><span>núcleos abordados</span></article><article><strong>${records.filter(({ record }) => record.watched).length}</strong><span>videos observados</span></article></div>
      <section class="ud-progress-section"><h2>Casos y versiones</h2><div class="ud-progress-cases">${records.map(({ item, record }) => `<article><div><b>${esc(item.id)}</b><strong>${esc(item.title)}</strong><small>${esc(item.sublevelId.replaceAll('-', ' '))}</small></div><span>${record.attempts?.length || 0} versiones</span><button type="button" data-progress-case="${item.id}">Abrir</button></article>`).join('')}</div></section>
      <section class="ud-progress-section"><h2>Dimensiones con fortalezas observadas</h2><div class="ud-dimension-map">${DIMENSIONS.map((dimension) => `<article><strong>${esc(dimension)}</strong><span>${strengths.get(dimension) || 0} casos</span></article>`).join('')}</div><p class="ud-progress-note">La ausencia de una fortaleza registrada no significa falta de capacidad; indica que aún no existe evidencia suficiente en los intentos guardados.</p></section>`;
    appRoot.innerHTML = shell(content, 'progress');
    bindCommon();
    document.querySelectorAll('[data-progress-case]').forEach((button) => button.addEventListener('click', () => openCase(button.dataset.progressCase)));
  }

  function renderLibrary() {
    const levels = [...new Set(curriculum.map((o) => o.levelName))];
    const content = `<section class="ud-model-heading"><div><span class="eyebrow">BCEP y currículo</span><h1>${curriculum.length} objetivos oficiales BCEP 2018.</h1><p>Navega por tramo, ámbito, núcleo y tipo. Usa esta biblioteca como apoyo para fundamentar tus decisiones, no como respuesta automática.</p></div></section>
      <div class="ud-library-filters"><label>Tramo<select data-library="level"><option value="all">Todos</option>${levels.map((level) => `<option value="${esc(level)}">${esc(level)}</option>`).join('')}</select></label><label>Ámbito<select data-library="scope"><option value="all">Todos</option>${[...new Set(curriculum.map((o) => o.scope))].map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select></label><label>Núcleo<select data-library="core"><option value="all">Todos</option>${[...new Set(curriculum.map((o) => o.core))].map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select></label><label>Tipo<select data-library="type"><option value="all">OA y OAT</option><option>OA</option><option>OAT</option></select></label><label>Buscar<input type="search" data-library="query" placeholder="Texto del objetivo"></label></div>
      <p class="ud-library-count"><b data-library-count>${curriculum.length}</b> objetivos visibles</p><div class="ud-library-list">${curriculum.map((o) => `<article data-level="${esc(o.levelName)}" data-scope="${esc(o.scope)}" data-core="${esc(o.core)}" data-type="${o.type}"><span>${o.type} ${o.number}</span><div><strong>${esc(o.core)}</strong><small>${esc(o.levelName)} · ${esc(o.scope)}</small><p>${esc(o.text)}</p><em>${esc(o.source)}</em></div></article>`).join('')}</div>`;
    appRoot.innerHTML = shell(content, 'library');
    bindCommon();
    const filters = () => {
      const values = Object.fromEntries([...document.querySelectorAll('[data-library]')].map((field) => [field.dataset.library, field.value]));
      let count = 0;
      document.querySelectorAll('.ud-library-list article').forEach((article) => {
        const visible = (values.level === 'all' || article.dataset.level === values.level)
          && (values.scope === 'all' || article.dataset.scope === values.scope)
          && (values.core === 'all' || article.dataset.core === values.core)
          && (values.type === 'all' || article.dataset.type === values.type)
          && (!values.query || slug(article.textContent).includes(slug(values.query)));
        article.hidden = !visible;
        if (visible) count++;
      });
      document.querySelector('[data-library-count]').textContent = count;
    };
    document.querySelectorAll('[data-library]').forEach((field) => field.addEventListener(field.tagName === 'INPUT' ? 'input' : 'change', filters));
  }

  function renderAbout() {
    const content = `<section class="ud-model-heading"><div><span class="eyebrow">Cómo funciona</span><h1>Una ruta para observar mejor y decidir con fundamento.</h1><p>Umbral crea un espacio intermedio entre aprender teoría y ejercer la práctica: observar, registrar, interpretar, planificar y revisar con apoyo formativo.</p></div></section>
      <div class="ud-about-flow">${FLOW.map(([, label], index) => `<article><span>${index + 1}</span><strong>${esc(label)}</strong></article>`).join('')}</div>
      <section class="ud-about-grid"><article><h2>Cuatro capas del contraste</h2><ul><li>BCEP 2018 y coherencia curricular.</li><li>Desarrollo infantil 0–6 con lenguaje de trayectoria y variabilidad.</li><li>Pedagogía de Educación Parvularia: mediación, juego, ambientes y evaluación auténtica.</li><li>Evidencia específica del caso audiovisual.</li></ul></article><article><h2>Límites explícitos</h2><ul><li>No diagnostica ni emite inferencias psicopatológicas.</li><li>No reemplaza prácticas reales, supervisión ni juicio profesional.</li><li>No presenta una respuesta curricular única.</li><li>La retroalimentación del prototipo es descriptiva y debe discutirse con docentes.</li></ul></article><article><h2>Estado del producto</h2><ul><li>Fase prototipo: banco inicial, planilla completa y feedback transparente.</li><li>Pendiente: corpus de desarrollo infantil curado y validado.</li><li>Pendiente: motor institucional, panel académico, cohortes y administración.</li><li>Pendiente: pilotaje con estudiantes y especialistas.</li></ul></article></section>`;
    appRoot.innerHTML = shell(content, 'about');
    bindCommon();
  }

  function bindCommon() {
    syncSidebar();
    document.querySelector('[data-model-exit]')?.addEventListener('click', leaveModel);
    document.querySelectorAll('[data-model-view]').forEach((button) => button.addEventListener('click', () => {
      view = button.dataset.modelView;
      activeCaseId = null;
      renderCurrent();
    }));
  }

  function renderCurrent() {
    if (!routeOpen) return;
    if (activeCaseId) return renderCase();
    if (view === 'progress') return renderProgress();
    if (view === 'library') return renderLibrary();
    if (view === 'about') return renderAbout();
    return renderCatalog();
  }

  function enhance() {
    ensureSidebarButton();
    bindStandardNavigation();
    syncSidebar();
    if (!routeOpen) mountEntry();
  }

  const observer = new MutationObserver(() => {
    if (observerQueued) return;
    observerQueued = true;
    queueMicrotask(() => { observerQueued = false; enhance(); });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.UmbralDocenteModelo = Object.freeze({
    open: openModel,
    cases: cases.map(({ id, title, caseVersion }) => ({ id, title, caseVersion })),
    curriculumCount: curriculum.length,
    storageKey: STORAGE_KEY,
    schemaVersion: SCHEMA_VERSION,
    flow: FLOW.map(([, label]) => label)
  });
  window.UmbralParvulariaAudiovisual = window.UmbralDocenteModelo;

  enhance();
})();
