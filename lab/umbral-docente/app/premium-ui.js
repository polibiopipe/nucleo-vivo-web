(() => {
  const app = document.querySelector('.app');
  const topbar = document.querySelector('.topbar');
  const rootNode = document.querySelector('#root');
  if (!app || !topbar || !rootNode) return;

  const icons = {
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
    model: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z"/></svg>',
    route: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V7m0 0 3 3m-3-3L2 10m17 7V5m0 12 3-3m-3 3-3-3M8 19h8"/></svg>',
    cases: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h6M7 16h8"/></svg>',
    progress: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10m5 10V4m6 16v-7m5 7V7"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></svg>',
    help: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.6 2.6 0 1 1 3.3 2.5c-.9.3-.9 1.1-.9 1.5m0 4h.01"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>',
    external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5m0-5-9 9"/><path d="M19 13v6H5V5h6"/></svg>'
  };

  let catalogFilter = state.profile?.cycle || 'all';

  app.insertAdjacentHTML('afterbegin', `
    <aside class="ud-sidebar" id="udSidebar" aria-label="Navegación de Umbral Docente">
      <div class="ud-sidebar-brand">
        <img src="assets/umbral-docente-logo.png" alt="Umbral Docente, una iniciativa de Núcleo Vivo">
      </div>
      <nav class="ud-sidebar-nav">
        <button data-ud-screen="dashboard" data-ud-nav="home">${icons.home}<span>Inicio</span></button>
        <button data-ud-screen="catalog" data-ud-nav="situated">${icons.route}<span>Práctica situada</span></button>
        <button type="button" data-ud-model="true" data-ud-nav="model">${icons.model}<span>Práctica audiovisual</span></button>
        <button data-ud-screen="annual" data-ud-nav="annual">${icons.calendar}<span>Planificación</span></button>
        <button type="button" data-ud-action="resources" data-ud-nav="resources">${icons.cases}<span>Recursos</span></button>
      </nav>
      <div class="ud-sidebar-bottom">
        <button data-ud-action="profile">${icons.settings}<span>Editar perfil</span></button>
        <a href="../../">${icons.external}<span>Volver a Núcleo Vivo Lab</span></a>
        <div class="ud-sidebar-person"><span class="ud-person-avatar">UD</span><div><strong data-ud-name>Estudiante</strong><small data-ud-cycle>Perfil local</small></div></div>
      </div>
    </aside>
    <button class="ud-drawer-scrim" type="button" aria-label="Cerrar menú"></button>
  `);

  topbar.insertAdjacentHTML('afterbegin', `
    <button class="ud-menu-button" type="button" aria-label="Abrir menú" aria-controls="udSidebar" aria-expanded="false">${icons.menu}</button>
    <div class="ud-topbar-product">
      <span class="ud-product-mark"><img src="assets/umbral-docente-symbol.png" alt=""></span>
      <div><strong>Umbral Docente</strong><small>Aprendizaje situado para futuras y futuros docentes</small></div>
    </div>
    <div class="ud-topbar-stats" aria-label="Resumen del piloto">
      <div><small>Ruta activa</small><strong data-ud-progress>Sin práctica activa</strong></div>
      <span></span>
      <div><small>Guardado</small><strong>Solo en este navegador</strong></div>
    </div>
    <div class="ud-topbar-actions">
      <button type="button" data-ud-action="support" aria-label="Abrir centro de apoyo">${icons.help}<span>Ayuda</span></button>
      <button type="button" data-ud-action="profile" aria-label="Editar perfil">${icons.settings}<span>Perfil</span></button>
    </div>
  `);

  const sidebar = document.querySelector('.ud-sidebar');
  const scrim = document.querySelector('.ud-drawer-scrim');
  const menuButton = document.querySelector('.ud-menu-button');
  const setDrawerState = (open) => {
    document.body.classList.toggle('ud-drawer-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  const closeDrawer = () => setDrawerState(false);
  menuButton.addEventListener('click', () => setDrawerState(!document.body.classList.contains('ud-drawer-open')));
  scrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('ud-drawer-open')) {
      closeDrawer();
      menuButton.focus();
    }
  });

  document.querySelectorAll('[data-ud-screen]').forEach((button) => {
    button.addEventListener('click', () => {
      const destination = button.dataset.udScreen;
      if (destination === 'annual' && !state.profile) go('onboarding');
      else if (destination === 'dashboard' && !state.profile) go('onboarding');
      else go(destination);
      closeDrawer();
    });
  });
  document.querySelectorAll('[data-ud-action="support"]').forEach((button) => button.addEventListener('click', () => {
    supportDialog.showModal();
    closeDrawer();
  }));
  document.querySelectorAll('[data-ud-action="resources"]').forEach((button) => button.addEventListener('click', () => {
    sourcesDialog.showModal();
    closeDrawer();
  }));
  document.querySelectorAll('[data-ud-action="profile"]').forEach((button) => button.addEventListener('click', () => {
    if (state.profile) state.profileDraft = { ...state.profile };
    go('onboarding');
    closeDrawer();
  }));

  function cycleClass(id) {
    return id === 'parvularia' ? 'coral' : id === 'basica' ? 'teal' : 'violet';
  }

  function cycleProgress(id) {
    if (state.scenario?.career !== id) return 0;
    return Math.max(0, Math.min(100, (state.step || 0) * 20));
  }

  function currentStageName() {
    return ['Por comenzar', 'Observar', 'Planificar', 'Intervenir', 'Reflexionar', 'Integrar'][state.step || 0];
  }

  function hasAnnualPlan() {
    const plan = state.annualPlan;
    return Boolean(plan && typeof plan === 'object' && Object.values(plan).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (value && typeof value === 'object') return Object.keys(value).length > 0;
      return String(value || '').trim().length > 0;
    }));
  }

  function scenarioStatus(scenario) {
    if (state.scenario?.id !== scenario.id) return 'No iniciado';
    return (state.step || 0) >= 5 ? 'Síntesis disponible' : 'En progreso';
  }

  function dashboardMarkup() {
    const profile = state.profile;
    const activeProfileRoute = routeById(profile.route);
    const activeScenario = state.scenario;
    const annualPlanSaved = hasAnnualPlan();
    const routeScenarioCount = scenarios.filter((scenario) => scenario.career === profile.cycle).length;
    const currentRoute = activeScenario ? 'Práctica situada' : 'Por elegir';
    const currentStep = activeScenario ? currentStageName() : 'Por comenzar';
    return `
      <section class="screen ud-dashboard" data-premium-screen="dashboard">
        <button type="button" id="udEditProfile" hidden aria-hidden="true" tabindex="-1"></button>

        <section class="ud-continuity-bar" aria-label="Continuidad de práctica">
          <div class="ud-continuity-copy">
            <span class="ud-continuity-kicker">Continuidad</span>
            <strong>${activeScenario ? esc(activeScenario.title) : 'Aún no has iniciado una práctica'}</strong>
            <p>${currentRoute} · ${currentStep}${annualPlanSaved ? ' · planificación con borrador' : ' · sin borrador de planificación'}</p>
          </div>
          <div class="ud-continuity-actions">
            <button class="ud-current-action" id="udCurrentAction" type="button">${activeScenario ? 'Retomar práctica' : 'Explorar escenarios'} →</button>
            <button class="ud-current-help" id="udCurrentHelp" type="button">Ver ayudas</button>
          </div>
        </section>

        <section class="ud-route-intro" aria-labelledby="udDashboardRoutesTitle">
          <span class="eyebrow">Rutas de aprendizaje</span>
          <h2 id="udDashboardRoutesTitle">Elige cómo quieres practicar hoy.</h2>
          <p>Dos rutas complementarias para fortalecer observación, decisión y reflexión pedagógica sin sobrecargar la experiencia. Perfil actual: <strong>${esc(activeProfileRoute.title)}</strong>.</p>
        </section>

        <section class="ud-route-duo" aria-label="Rutas de aprendizaje">
          <article class="ud-route-panel situated">
            <span class="ud-route-kicker">Ruta 1 · práctica situada</span>
            <h2>Ensaya decisiones pedagógicas con escenarios.</h2>
            <p>Trabaja con casos ficticios del ciclo que seleccionaste y decide cómo actuar frente a situaciones pedagógicas concretas.</p>
            <ul class="ud-route-list">
              <li>Escenarios alineados a tu perfil formativo.</li>
              <li>Secuencia guiada para observar, planificar e intervenir.</li>
              <li>Retroalimentación descriptiva al cierre.</li>
            </ul>
            <div class="ud-route-meta"><span>${routeScenarioCount} casos sugeridos para tu ciclo</span><span>Decisiones guiadas</span></div>
            <button class="btn btn-primary" id="udStartSituated">Explorar escenarios</button>
          </article>

          <article class="ud-route-panel audiovisual">
            <span class="ud-route-kicker">Ruta 2 · práctica audiovisual</span>
            <h2>Observa videos antes de interpretar.</h2>
            <p>Analiza escenas audiovisuales y registra hechos antes de construir una lectura pedagógica con mayor precisión.</p>
            <ul class="ud-route-list">
              <li>Casos con video y fichas guiadas.</li>
              <li>Flujo paso a paso para observar, interpretar y proyectar.</li>
              <li>Integración con BCEP y revisión formativa.</li>
            </ul>
            <div class="ud-route-meta"><span>Observación guiada</span><span>Videos y fichas</span></div>
            <button class="btn btn-secondary" id="udStartAudiovisual">Entrar a práctica audiovisual</button>
          </article>
        </section>

        <section class="ud-dashboard-tools">
          <button class="ud-support-module" id="udAnnualModule"><span>▦</span><div><strong>Planificación anual</strong><p>Organiza propósitos, evidencias y ajustes sin salir de tu perfil formativo.</p></div><b>→</b></button>
          <button class="ud-support-module" id="udSupportModule"><span>?</span><div><strong>Centro de apoyo</strong><p>Accede a orientaciones breves, fundamentos y criterios para tomar mejores decisiones.</p></div><b>→</b></button>
          <article class="ud-local-note"><strong>Privacidad del piloto</strong><p>El avance permanece sólo en este navegador. No ingreses datos reales, sensibles ni identificables.</p></article>
        </section>
      </section>`;
  }

  function bindDashboard() {
    const openCatalog = (filter = 'all') => {
      catalogFilter = filter;
      state.career = filter;
      state.screen = 'catalog';
      render();
      scrollTop();
    };
    document.querySelector('#udEditProfile').onclick = () => { state.profileDraft = { ...state.profile }; go('onboarding'); };
    const openSituated = () => {
      if (!state.scenario) openCatalog(state.profile?.cycle || 'all');
      else go(['brief', 'brief', 'planner', 'simulation', 'reflection', 'results'][state.step || 0]);
    };
    const openAudiovisual = () => document.querySelector('[data-ud-model]')?.click();
    document.querySelector('#udStartSituated').onclick = openSituated;
    document.querySelector('#udStartAudiovisual').onclick = openAudiovisual;
    document.querySelector('#udCurrentAction').onclick = openSituated;
    document.querySelector('#udCurrentHelp').onclick = () => sourcesDialog.showModal();
    document.querySelector('#udSupportModule').onclick = () => supportDialog.showModal();
    document.querySelector('#udAnnualModule').onclick = () => go('annual');
  }

  function catalogMarkup() {
    const filter = ['all', 'parvularia', 'basica', 'media'].includes(catalogFilter) ? catalogFilter : 'all';
    const visible = filter === 'all' ? scenarios : scenarios.filter((scenario) => scenario.career === filter);
    return `
      <section class="screen ud-catalog" data-premium-screen="catalog">
        <header class="ud-catalog-heading ud-catalog-heading-minimal">
          <div><span class="eyebrow">Ruta 1 · práctica situada</span><h1>Escenarios para ensayar con contexto.</h1><p>Esta ruta se complementa con la práctica audiovisual: primero puedes observar escenas en video y luego volver aquí para decidir, planificar y reflexionar con mayor claridad.</p></div>
          <span class="ud-catalog-count"><strong>${visible.length}</strong> escenarios visibles</span>
        </header>
        <nav class="ud-catalog-tabs" aria-label="Filtrar escenarios">
          <button class="${filter === 'all' ? 'active' : ''}" data-ud-filter="all">Todos <span>18</span></button>
          ${careers.map((career) => `<button class="${filter === career.id ? 'active' : ''}" data-ud-filter="${career.id}">${career.short} <span>${career.count}</span></button>`).join('')}
        </nav>
        <div class="ud-route-tip"><strong>Tip de uso:</strong> si necesitas afinar la observación antes de decidir, utiliza la práctica audiovisual y luego vuelve a este banco de escenarios.</div>
        <div class="ud-scenario-grid">
          ${visible.map((scenario, index) => `<article class="ud-scenario-card ${cycleClass(scenario.career)}">
            <div class="ud-scenario-photo">${avatar(scenario)}<b>${String(index + 1).padStart(2, '0')}</b><i>${getCareer(scenario.career).name}</i></div>
            <div class="ud-scenario-copy">
              <small>${scenario.grade} · ${scenario.duration}</small>
              <strong>${scenario.title}</strong>
              <p>${scenario.summary}</p>
              <span class="ud-scenario-status-line"><em>${scenario.curriculum?.core || 'Práctica situada'}</em><em>${scenarioStatus(scenario)}</em></span>
              <button type="button" data-ud-scenario="${scenario.id}" aria-label="Practicar: ${esc(scenario.title)}">Comenzar práctica →</button>
            </div>
          </article>`).join('')}
        </div>
        <footer class="ud-catalog-footer"><button class="btn btn-secondary" id="udCatalogBack">← Volver al inicio</button><p><strong>Actividad formativa.</strong> Los casos son ficticios y sirven para ensayar decisiones, no para evaluar oficialmente.</p><button class="btn btn-soft" id="udCatalogSupport">Centro de apoyo</button></footer>
      </section>`;
  }

  function bindCatalog() {
    document.querySelectorAll('[data-ud-filter]').forEach((button) => button.onclick = () => {
      catalogFilter = button.dataset.udFilter;
      renderCatalogPremium();
    });
    document.querySelectorAll('[data-ud-scenario]').forEach((button) => button.onclick = () => selectScenario(button.dataset.udScenario));
    document.querySelector('#udCatalogBack').onclick = () => go('dashboard');
    document.querySelector('#udCatalogSupport').onclick = () => supportDialog.showModal();
  }

  function renderDashboardPremium() {
    if (!state.profile) return;
    rootNode.innerHTML = dashboardMarkup();
    bindDashboard();
  }

  function renderCatalogPremium() {
    rootNode.innerHTML = catalogMarkup();
    bindCatalog();
    syncShell();
  }

  function syncStageLabels() {
    const labels = [
      ['Observar', 'Reconoce señales'],
      ['Comprender', 'Interpreta el contexto'],
      ['Planificar', 'Diseña la experiencia'],
      ['Intervenir', 'Decide y adapta'],
      ['Reflexionar', 'Analiza evidencias'],
      ['Integrar', 'Transfiere el aprendizaje']
    ];
    const activeByScreen = { brief: 0, planner: 2, simulation: 3, reflection: 4, results: 5 };
    const activeIndex = activeByScreen[state.screen] ?? 0;
    const steps = document.querySelector('.side-rail .steps');
    if (!steps || steps.dataset.udStageScreen === state.screen) return;
    steps.dataset.udStageScreen = state.screen;
    steps.innerHTML = labels.map(([title, detail], index) => {
      const status = index < activeIndex ? 'completed' : index === activeIndex ? 'active' : 'upcoming';
      return `<div class="step ${status}" ${index === activeIndex ? 'aria-current="step"' : ''} ${index > activeIndex ? 'aria-disabled="true"' : ''}>
        <span class="step-num" aria-hidden="true">${index < activeIndex ? '✓' : index + 1}</span>
        <div><strong>${title}</strong><span>${detail}</span></div>
      </div>`;
    }).join('');
  }

  function syncAccessibleFields() {
    rootNode.querySelectorAll('label').forEach((label, labelIndex) => {
      if (label.htmlFor || label.querySelector('input, select, textarea')) return;
      const container = label.closest('.field') || label.parentElement;
      if (!container) return;
      const controls = [...container.querySelectorAll('input, select, textarea')].filter((control) => control.type !== 'hidden');
      if (controls.length !== 1) return;
      const control = controls[0];
      if (!control.id) control.id = `ud-field-${state.screen}-${labelIndex + 1}`;
      label.htmlFor = control.id;
      const helper = [...container.querySelectorAll('small')].find((item) => !item.closest('label'));
      if (helper) {
        if (!helper.id) helper.id = `${control.id}-help`;
        const describedBy = new Set((control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
        describedBy.add(helper.id);
        control.setAttribute('aria-describedby', [...describedBy].join(' '));
      }
    });
  }

  function syncContextNotices() {
    const workspace = rootNode.querySelector('.annual-shell .workspace') || rootNode.querySelector('.workspace');
    if (!workspace || workspace.querySelector('.ud-context-notices')) return;
    const scenarioScreens = ['brief', 'planner', 'simulation', 'reflection', 'results'];
    const localSaveScreens = ['planner', 'simulation', 'reflection'];
    const notices = [];
    if (scenarioScreens.includes(state.screen)) notices.push('<span class="ud-context-chip">Caso ficticio · Personajes sintéticos</span>');
    if (localSaveScreens.includes(state.screen)) notices.push('<span class="ud-context-chip local">Guardado automático únicamente en este navegador</span>');
    if (state.screen === 'annual') notices.push('<span class="ud-context-chip local">Usa “Guardar borrador” para conservar esta planificación en este navegador</span>');
    if (notices.length) workspace.insertAdjacentHTML('afterbegin', `<div class="ud-context-notices" role="note">${notices.join('')}</div>`);
  }

  function syncResultSemantics() {
    const scoreRing = rootNode.querySelector('.score-ring');
    if (!scoreRing || scoreRing.querySelector('.ud-score-caption')) return;
    const score = scoreRing.querySelector('strong')?.textContent?.trim() || '';
    scoreRing.setAttribute('role', 'img');
    scoreRing.setAttribute('aria-label', `Indicador orientador de la práctica: ${score} de 100`);
    scoreRing.insertAdjacentHTML('beforeend', '<span class="ud-score-caption" aria-hidden="true">Indicador orientador de la práctica</span>');
  }

  function syncSourceTypes() {
    document.querySelectorAll('.source-item').forEach((item) => {
      if (item.querySelector('.ud-source-type')) return;
      const content = item.textContent.toLowerCase();
      let type = 'formative';
      let label = 'Referencia formativa';
      if (/ministerio|mineduc|bases curriculares|estándares pedagógicos/.test(content)) {
        type = 'official';
        label = 'Fuente oficial';
      } else if (/et al\.|\(20\d{2}\)|doi/.test(content)) {
        type = 'scientific';
        label = 'Evidencia científica';
      }
      item.dataset.sourceType = type;
      const contentBox = item.querySelector('div');
      if (contentBox) contentBox.insertAdjacentHTML('afterbegin', `<span class="ud-source-type">${label}</span>`);
    });
  }

  function syncShell() {
    const focusMode = !state.profile || ['home', 'onboarding'].includes(state.screen);
    document.body.classList.toggle('ud-focus-mode', focusMode);
    document.body.dataset.udScreen = state.screen;
    const personName = state.profile?.name || 'Estudiante';
    const personCycle = state.profile?.cycle ? cycleLabels[state.profile.cycle] : 'Perfil local';
    document.querySelector('[data-ud-name]').textContent = personName;
    document.querySelector('[data-ud-cycle]').textContent = personCycle;
    const initials = personName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'UD';
    document.querySelector('.ud-person-avatar').textContent = initials;
    const stageNames = ['Sin práctica activa', 'Práctica situada · observar', 'Práctica situada · planificar', 'Práctica situada · intervenir', 'Práctica situada · reflexionar', 'Práctica situada · integrar'];
    document.querySelector('[data-ud-progress]').textContent = state.scenario ? stageNames[state.step] : 'Sin práctica activa';
    document.querySelectorAll('[data-ud-screen]').forEach((button) => {
      const key = button.dataset.udNav;
      const active = (key === 'home' && state.screen === 'dashboard')
        || (key === 'model' && false)
        || (key === 'situated' && ['catalog', 'brief', 'planner', 'simulation', 'reflection', 'results'].includes(state.screen))
        || (key === 'annual' && state.screen === 'annual');
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    syncStageLabels();
    syncAccessibleFields();
    syncContextNotices();
    syncResultSemantics();
    syncSourceTypes();
  }

  function enhance() {
    if (document.body.dataset.udModelRoute === 'active') {
      syncShell();
      return;
    }
    if (state.screen === 'dashboard' && state.profile && !rootNode.querySelector('[data-premium-screen="dashboard"]')) renderDashboardPremium();
    else if (state.screen === 'catalog' && !rootNode.querySelector('[data-premium-screen="catalog"]')) {
      catalogFilter = ['all', 'parvularia', 'basica', 'media'].includes(state.career) ? state.career : 'all';
      renderCatalogPremium();
    }
    syncShell();
  }

  const observer = new MutationObserver(() => queueMicrotask(enhance));
  observer.observe(rootNode, { childList: true, subtree: true });
  enhance();
})();
