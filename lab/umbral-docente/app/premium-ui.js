(() => {
  const app = document.querySelector('.app');
  const topbar = document.querySelector('.topbar');
  const rootNode = document.querySelector('#root');
  if (!app || !topbar || !rootNode) return;

  const icons = {
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
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
        <img src="../../assets/nucleo-vivo-logo-oficial-horizontal.png" alt="Núcleo Vivo · Cultura, liderazgo y bienestar">
        <div><strong>Umbral Docente</strong><span>Simulador de prácticas pedagógicas</span></div>
      </div>
      <nav class="ud-sidebar-nav">
        <button data-ud-screen="dashboard" data-ud-nav="home">${icons.home}<span>Inicio</span></button>
        <button data-ud-screen="catalog" data-ud-nav="routes">${icons.route}<span>Rutas de formación</span></button>
        <button data-ud-screen="catalog" data-ud-nav="cases">${icons.cases}<span>Escenarios</span></button>
        <button data-ud-screen="dashboard" data-ud-nav="progress">${icons.progress}<span>Mi progreso</span></button>
        <button data-ud-screen="annual" data-ud-nav="annual">${icons.calendar}<span>Planificación</span></button>
        <button data-ud-action="support">${icons.help}<span>Centro de apoyo</span></button>
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
      <span class="ud-product-mark">UD</span>
      <div><strong>Umbral Docente</strong><small>Laboratorio de prácticas pedagógicas</small></div>
    </div>
    <div class="ud-topbar-stats" aria-label="Resumen del piloto">
      <div><small>Progreso de la práctica</small><strong data-ud-progress>Sin práctica activa</strong></div>
      <span></span>
      <div><small>Escenarios</small><strong>18 disponibles</strong></div>
      <span></span>
      <div><small>Persistencia</small><strong>Guardado local</strong></div>
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
    const activeRoute = routeById(profile.route);
    const featured = careers.flatMap((career) => scenarios.filter((scenario) => scenario.career === career.id).slice(0, 2));
    const activeScenario = state.scenario;
    const annualPlanSaved = hasAnnualPlan();
    const completedCurrent = activeScenario && (state.step || 0) >= 5;
    return `
      <section class="screen ud-dashboard" data-premium-screen="dashboard">
        <header class="ud-dashboard-heading">
          <div><span class="eyebrow">Tu espacio formativo</span><h1>Bienvenida, ${esc(profile.name || 'Estudiante')}</h1><p>Un entorno de práctica situada para observar, comprender, planificar, intervenir y reflexionar antes de llevar decisiones pedagógicas al aula.</p></div>
          <button class="btn btn-soft" id="udEditProfile">Editar perfil</button>
        </header>

        <section class="ud-dashboard-hero" aria-labelledby="udDashboardHeroTitle">
          <div class="ud-dashboard-hero-copy">
            <span class="eyebrow">Simulador formativo</span>
            <h2 id="udDashboardHeroTitle">Practica decisiones pedagógicas con contexto y retroalimentación.</h2>
            <p>Recorre casos ficticios, fundamenta tus decisiones y construye criterios transferibles a tu práctica. El piloto funciona sin cuenta y conserva el avance sólo en este navegador.</p>
            <div class="ud-dashboard-actions">
              <button class="btn btn-primary" id="udResumePractice">${activeScenario ? 'Continuar práctica' : 'Explorar escenarios'}</button>
              <button class="btn btn-secondary" id="udSourcesFundamentals">Fuentes y fundamentos</button>
            </div>
            <small class="ud-privacy-inline">Versión piloto · No ingreses datos reales, sensibles ni identificables.</small>
          </div>
          <aside class="ud-current-card" aria-label="Estado local de tu práctica">
            <span>Actividad local</span>
            <strong>${activeScenario ? esc(activeScenario.title) : 'Aún no has iniciado un escenario'}</strong>
            <dl>
              <div><dt>Ruta</dt><dd>${esc(activeRoute.title)}</dd></div>
              <div><dt>Etapa</dt><dd>${activeScenario ? currentStageName() : 'Por comenzar'}</dd></div>
              <div><dt>Plan anual</dt><dd>${annualPlanSaved ? 'Borrador disponible' : 'Sin borrador'}</dd></div>
            </dl>
          </aside>
        </section>

        <section class="ud-stat-strip" aria-label="Resumen de actividad">
          <article><span class="ud-stat-icon">${activeScenario ? '1' : '0'}</span><div><small>Práctica activa</small><strong>${activeScenario ? '1 escenario iniciado' : 'Sin escenario iniciado'}</strong></div></article>
          <article><span class="ud-stat-icon">${completedCurrent ? '1' : '0'}</span><div><small>Cierre actual</small><strong>${completedCurrent ? 'Síntesis disponible' : 'Pendiente'}</strong></div></article>
          <article><span class="ud-stat-icon">${annualPlanSaved ? '✓' : '—'}</span><div><small>Planificación anual</small><strong>${annualPlanSaved ? 'Borrador local' : 'Sin borrador'}</strong></div></article>
          <article><span class="ud-stat-icon">↗</span><div><small>Última actividad</small><strong>${activeScenario ? esc(currentStageName()) : 'Sin registro local'}</strong></div></article>
        </section>

        <div class="ud-section-title"><div><span class="eyebrow">Rutas de formación</span><h2>Elige tu ciclo formativo</h2></div><button class="ud-text-button" id="udAllScenarios">Ver los 18 escenarios →</button></div>
        <section class="ud-cycle-grid">
          ${careers.map((career) => {
            const example = scenarios.find((scenario) => scenario.career === career.id);
            const progress = cycleProgress(career.id);
            return `<button class="ud-cycle-card ${cycleClass(career.id)}" data-ud-cycle-card="${career.id}">
              <span class="ud-cycle-orb">${career.count}</span>
              <div class="ud-cycle-copy"><small>Trayectoria pedagógica</small><h3>${career.name}</h3><p>${career.description}</p><span>${career.count} escenarios <b>Explorar →</b></span></div>
              <span class="ud-cycle-photo">${avatar(example)}</span>
              <span class="ud-cycle-progress"><i style="width:${progress}%"></i></span>
            </button>`;
          }).join('')}
        </section>

        <div class="ud-dashboard-lower">
          <section class="ud-support-column">
            <div class="ud-section-title compact"><div><span class="eyebrow">Herramientas</span><h2>Módulos de apoyo</h2></div></div>
            <button class="ud-support-module" id="udSupportModule"><span>?</span><div><strong>Centro de apoyo</strong><p>Fichas para fortalecer tus decisiones antes y durante la práctica.</p></div><b>→</b></button>
            <button class="ud-support-module" id="udAnnualModule"><span>▦</span><div><strong>Planificación anual</strong><p>Organiza propósitos, evidencias y ajustes por etapa formativa.</p></div><b>→</b></button>
            <article class="ud-local-note"><strong>Privacidad del piloto</strong><p>Tu progreso permanece únicamente en este navegador. Evita ingresar datos reales o sensibles.</p></article>
          </section>
          <section class="ud-featured-column">
            <div class="ud-section-title compact"><div><span class="eyebrow">Práctica situada</span><h2>Casos simulados destacados</h2></div><button class="ud-text-button" id="udAllScenariosSecondary">Ver todos →</button></div>
            <div class="ud-featured-grid">
              ${featured.map((scenario, index) => `<button class="ud-featured-card ${cycleClass(scenario.career)}" data-ud-scenario="${scenario.id}">
                <span class="ud-featured-photo">${avatar(scenario)}<b>${index + 1}</b><i>${getCareer(scenario.career).short}</i></span>
                <span class="ud-featured-copy"><small>${scenario.duration} · ${scenario.difficulty}</small><strong>${scenario.title}</strong><p>${scenario.summary}</p><em>Comenzar simulación →</em></span>
              </button>`).join('')}
            </div>
          </section>
        </div>
        <footer class="ud-closing-banner"><span>✦</span><div><strong>Reflexiona, planifica, interviene y aprende.</strong><p>Cada práctica te acerca a una enseñanza más consciente, inclusiva y transformadora.</p></div><button class="btn btn-primary" id="udHowWorks">¿Cómo funciona Umbral Docente?</button></footer>
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
    document.querySelector('#udResumePractice').onclick = () => {
      if (!state.scenario) openCatalog(state.profile?.cycle || 'all');
      else go(['brief', 'brief', 'planner', 'simulation', 'reflection', 'results'][state.step || 0]);
    };
    document.querySelector('#udSourcesFundamentals').onclick = () => sourcesDialog.showModal();
    document.querySelector('#udAllScenarios').onclick = document.querySelector('#udAllScenariosSecondary').onclick = () => openCatalog('all');
    document.querySelectorAll('[data-ud-cycle-card]').forEach((button) => button.onclick = () => openCatalog(button.dataset.udCycleCard));
    document.querySelectorAll('[data-ud-scenario]').forEach((button) => button.onclick = () => selectScenario(button.dataset.udScenario));
    document.querySelector('#udSupportModule').onclick = document.querySelector('#udHowWorks').onclick = () => supportDialog.showModal();
    document.querySelector('#udAnnualModule').onclick = () => go('annual');
  }

  function catalogMarkup() {
    const filter = ['all', 'parvularia', 'basica', 'media'].includes(catalogFilter) ? catalogFilter : 'all';
    const visible = filter === 'all' ? scenarios : scenarios.filter((scenario) => scenario.career === filter);
    return `
      <section class="screen ud-catalog" data-premium-screen="catalog">
        <header class="ud-catalog-heading">
          <div><span class="eyebrow">Banco de práctica</span><h1>Escenarios para tu práctica docente</h1><p>Explora los 18 casos, elige un contexto y ensaya decisiones con acompañamiento formativo.</p></div>
          <span class="ud-catalog-count"><strong>${visible.length}</strong> casos visibles</span>
        </header>
        <nav class="ud-catalog-tabs" aria-label="Filtrar escenarios">
          <button class="${filter === 'all' ? 'active' : ''}" data-ud-filter="all">Todos <span>18</span></button>
          ${careers.map((career) => `<button class="${filter === career.id ? 'active' : ''}" data-ud-filter="${career.id}">${career.short} <span>${career.count}</span></button>`).join('')}
        </nav>
        <div class="ud-scenario-grid">
          ${visible.map((scenario, index) => `<article class="ud-scenario-card ${cycleClass(scenario.career)}">
            <div class="ud-scenario-photo">${avatar(scenario)}<b>${String(index + 1).padStart(2, '0')}</b><i>${getCareer(scenario.career).name}</i></div>
            <div class="ud-scenario-copy">
              <div class="ud-scenario-heading"><small>${scenario.grade}</small><span class="ud-scenario-status">${scenarioStatus(scenario)}</span></div>
              <strong>${scenario.title}</strong>
              <dl class="ud-scenario-meta">
                <div><dt>Edad</dt><dd>${scenario.age} años aprox.</dd></div>
                <div><dt>Foco</dt><dd>${scenario.curriculum?.core || 'Práctica situada'}</dd></div>
              </dl>
              <details class="ud-scenario-details"><summary>Ver situación</summary><p>${scenario.summary}</p></details>
              <div class="ud-scenario-footer"><span><em>${scenario.duration}</em><em>${scenario.difficulty}</em></span><button type="button" data-ud-scenario="${scenario.id}" aria-label="Practicar: ${esc(scenario.title)}">Practicar →</button></div>
            </div>
          </article>`).join('')}
        </div>
        <footer class="ud-catalog-footer"><button class="btn btn-secondary" id="udCatalogBack">← Mi plataforma</button><p><strong>Versión piloto.</strong> La actividad es formativa y no constituye una evaluación académica oficial.</p><button class="btn btn-soft" id="udCatalogSupport">Centro de apoyo</button></footer>
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
    const stageNames = ['Sin práctica activa', 'Observar · contexto', 'Planificar · intervención', 'Intervenir · simulación', 'Reflexionar · evidencia', 'Integrar · transferencia'];
    document.querySelector('[data-ud-progress]').textContent = state.scenario ? stageNames[state.step] : 'Sin práctica activa';
    document.querySelectorAll('[data-ud-screen]').forEach((button) => {
      const key = button.dataset.udNav;
      const active = (key === 'home' && state.screen === 'dashboard')
        || (key === 'routes' && state.screen === 'catalog')
        || (key === 'cases' && ['brief', 'planner', 'simulation', 'reflection', 'results'].includes(state.screen))
        || (key === 'progress' && state.screen === 'results')
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
