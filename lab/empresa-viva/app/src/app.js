(function () {
  'use strict';

  const CASES = window.EMPRESA_VIVA_CASES || [];
  const Engine = window.EmpresaVivaEngine;
  const STORAGE_KEY = 'empresa-viva-simulador-v5';
  const STAGES = [
    ['encargo','Encargo'],['empresa','Empresa'],['documentos','Documentos'],['entrevistas','Entrevistas'],
    ['analisis','Análisis'],['decisiones','Decisiones'],['directorio','Directorio'],['resultados','Resultados'],
  ];
  const MILESTONES = [
    ['Encargo',0,0],['Investigar',1,3],['Diagnóstico',4,4],['Decidir',5,5],['Presentar',6,6],['Evaluación',7,7],
  ];
  const root = document.getElementById('app');

  const freshCaseState = () => ({
    started:false,currentStage:0,readDocuments:[],interviews:{},
    analysis:{mainProblem:'',causes:['','',''],evidence:[]},
    selectedDecisions:[],board:{diagnosis:'',plan:'',indicators:'',risks:''},completed:false,updatedAt:null,
  });
  const initial = {screen:'dashboard',activeCaseId:null,filter:'todos',cases:{},profile:{displayName:'Estudiante',createdAt:new Date().toISOString()}};
  let state = load();
  let ui = {openDocument:null,selectedStakeholder:null,mobileNav:false,notice:null};

  function load(){
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return parsed ? {...initial,...parsed,cases:{...parsed.cases}} : structuredClone(initial);
    } catch { return structuredClone(initial); }
  }
  function save(){ try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }catch{ /* La experiencia sigue disponible si el navegador bloquea el almacenamiento. */ } }
  function caseById(id){ return CASES.find(c=>c.id===id); }
  function getCaseState(id){
    if(!state.cases[id]) state.cases[id]=freshCaseState();
    return state.cases[id];
  }
  function updateCase(id,patch){
    state.cases[id] = {...getCaseState(id),...patch,updatedAt:new Date().toISOString()}; save();
  }
  function esc(v=''){ return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
  function icon(name,size=20){
    const p={
      arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
      chart:'<path d="M4 19V9M10 19V6M16 19v-8M22 19H2"/>',file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
      chat:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m15 9 5-5M17 4h3v3"/>',
      users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      brain:'<path d="M9.5 4.5A3 3 0 0 0 6 7.4 3.5 3.5 0 0 0 5 14a3 3 0 0 0 4.5 2.6V6.5ZM14.5 4.5A3 3 0 0 1 18 7.4a3.5 3.5 0 0 1 1 6.6 3 3 0 0 1-4.5 2.6V6.5ZM9.5 12H7M14.5 9H17M9.5 8H8M14.5 14H17"/>',
      check:'<path d="m5 12 4 4L19 6"/>',lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
      home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',spark:'<path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5z"/>',
      print:'<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
      close:'<path d="m6 6 12 12M18 6 6 18"/>',note:'<path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"/>',
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p[name]||p.spark}</svg>`;
  }
  function progressFor(cs){
    if(cs.completed) return 100;
    const stage = Math.max(0,Math.min(7,cs.currentStage||0));
    let bonus=0;
    if(cs.readDocuments.length) bonus+=3;
    if(Object.values(cs.interviews||{}).some(ms=>(ms||[]).some(m=>m.sender==='student'))) bonus+=3;
    return Math.min(96,Math.round((stage/7)*88+bonus));
  }
  function announce(text){ ui.notice=text; setTimeout(()=>{ui.notice=null;render();},2200); }
  function downloadFile(name,content,type='application/json'){
    const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
  }
  function exportBackup(){
    const payload={product:'Empresa Viva',version:'5.0',exportedAt:new Date().toISOString(),state};
    downloadFile(`empresa-viva-respaldo-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(payload,null,2));
  }
  function importBackup(file){
    const reader=new FileReader();reader.onload=()=>{try{const payload=JSON.parse(reader.result);if(!payload?.state?.cases)throw new Error('Formato inválido');state={...initial,...payload.state};save();announce('Respaldo restaurado correctamente.');render();}catch(err){alert('No fue posible restaurar el respaldo: '+err.message);}};reader.readAsText(file);
  }
  function exportProgressCsv(){
    const rows=[['Caso','Estado','Avance','Puntaje','Nivel','Última actualización']];
    CASES.forEach(c=>{const cs=getCaseState(c.id);const r=cs.completed?Engine.calculateOutcome(c,cs):null;rows.push([c.title,cs.completed?'Completado':cs.started?'En progreso':'No iniciado',progressFor(cs),r?.totalScore??'',r?.level??'',cs.updatedAt??'']);});
    const csv='\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\n');
    downloadFile('empresa-viva-mi-progreso.csv',csv,'text/csv;charset=utf-8');
  }
  function resetAll(){if(confirm('¿Eliminar todo el progreso guardado en este navegador? Esta acción no se puede deshacer.')){localStorage.removeItem(STORAGE_KEY);state=structuredClone(initial);render();}}
  function render(){
    root.innerHTML = state.screen==='landing' ? landingView() : state.screen==='dashboard' ? dashboardView() : state.screen==='progress' ? progressView() : simulationView();
    bind();
  }

  function brandCompact(){ return `<a class="brand-compact" href="../../" aria-label="Volver a Núcleo Vivo Lab"><img src="../../assets/nucleo-vivo-logo-oficial-horizontal.png" alt="Núcleo Vivo · Cultura, liderazgo y bienestar"><span class="brand-product"><strong>EMPRESA VIVA</strong><small>Laboratorio de decisiones empresariales</small></span></a>`; }
  const FEMALE_NAMES = new Set(['carolina','paula','claudia','gabriela','valentina','maría','maria','sofía','sofia','francisca','daniela','fernanda','alejandra','rocío','rocio','josefina','patricia','macarena','marcela','ignacia']);
  function portraitFor(c,st){
    const first=String(st.name||'').trim().split(/\s+/)[0].toLowerCase();
    const pool=FEMALE_NAMES.has(first)?['02','04','06','08']:['01','03','05','07'];
    const caseIndex=Math.max(0,CASES.indexOf(c)),actorIndex=Math.max(0,c.stakeholders.indexOf(st));
    return `./assets/people/person-${pool[(caseIndex+actorIndex)%pool.length]}.jpg`;
  }

  function landingView(){
    return `<div class="landing-shell">
      <header class="public-header">${brandCompact()}<div class="public-actions"><button class="text-link" data-action="catalog">Explorar casos</button><button class="btn btn-outline" data-action="catalog">Abrir piloto</button></div></header>
      <main>
        <section class="hero-section">
          <div class="hero-copy">
            <p class="eyebrow"><span></span> Laboratorio de decisiones empresariales</p>
            <h1>Decidir también<br>se <em>entrena.</em></h1>
            <p class="hero-lead">Analiza empresas, conversa con actores, trabaja con evidencia y enfrenta las consecuencias de tus decisiones.</p>
            <div class="hero-actions"><button class="btn btn-primary btn-large" data-action="catalog">Abrir piloto ${icon('arrow')}</button><button class="btn btn-quiet" data-action="start-featured">Probar el primer caso</button></div>
            <div class="hero-proof"><div><strong>8</strong><span>casos profesionales</span></div><div><strong>3</strong><span>decisiones sobre IA</span></div><div><strong>100%</strong><span>empresas ficticias</span></div></div>
          </div>
          <div class="hero-panel">
            <div class="hero-panel-top"><span class="live-dot"></span><span>PORTAFOLIO INICIAL</span><small>EMPRESA VIVA</small></div>
            <div class="portfolio-list">${CASES.slice(0,4).map(c=>`<div><b>${c.number}</b><span><strong>${esc(c.title)}</strong><small>${esc(c.focus)}</small></span>${c.ai?'<em>IA</em>':''}</div>`).join('')}</div>
            <div class="panel-foot"><span>${icon('brain')} Personas al centro</span><span>${icon('chart')} Evidencia y consecuencias</span></div>
          </div>
        </section>
        <section class="brand-divider"><div><img src="../../assets/nucleo-vivo-logo-oficial-horizontal.png" alt="Núcleo Vivo · Cultura, liderazgo y bienestar"><p>Empresa Viva pertenece a Núcleo Vivo Lab, pero utiliza una atmósfera ejecutiva propia para diferenciar la experiencia empresarial.</p></div></section>
        <section class="method-section">
          <div class="section-heading"><p class="eyebrow"><span></span> Cómo funciona</p><h2>No eliges una respuesta.<br><em>Construyes una decisión.</em></h2></div>
          <div class="method-grid">${[
            ['01','Investigar','Documentos, indicadores y voces que no siempre coinciden.','file'],['02','Diagnosticar','Separar síntomas, causas, intereses y riesgos.','chart'],['03','Priorizar','Distribuir recursos limitados entre alternativas reales.','target'],['04','Responder','Defender una propuesta y observar sus efectos.','briefcase']
          ].map(x=>`<article><span>${x[0]}</span>${icon(x[3],28)}<h3>${x[1]}</h3><p>${x[2]}</p></article>`).join('')}</div>
        </section>
        <section class="cases-preview"><div class="section-heading light"><p class="eyebrow"><span></span> Portafolio inicial</p><h2>Ocho desafíos. Una misma capacidad:<br><em>decidir con criterio.</em></h2></div><div class="preview-grid">${CASES.map(c=>casePreviewCard(c)).join('')}</div><button class="btn btn-light btn-large center-btn" data-action="catalog">Ver los ocho casos ${icon('arrow')}</button></section>
      </main>
      <footer class="public-footer"><div>${brandCompact()}</div><p>Simulación educativa. No utiliza empresas, clientes ni datos reales.</p><span>© 2026 Núcleo Vivo Lab</span></footer>
    </div>`;
  }
  function casePreviewCard(c){
    return `<article class="preview-card ${c.ai?'is-ai':''}"><div class="preview-top"><span>${c.number}</span>${c.ai?'<em>DECISIÓN CON IA</em>':'<em>'+esc(c.category.toUpperCase())+'</em>'}</div><h3>${esc(c.title)}</h3><p>${esc(c.short)}</p><small>${esc(c.company)} · ${esc(c.level)}</small></article>`;
  }

  function dashboardView(){
    const started = CASES.filter(c=>getCaseState(c.id).started).length;
    const completed = CASES.filter(c=>getCaseState(c.id).completed).length;
    const avg = started ? Math.round(CASES.reduce((s,c)=>s+(getCaseState(c.id).started?progressFor(getCaseState(c.id)):0),0)/started) : 0;
    const filtered = CASES.filter(c=>state.filter==='todos'||c.category===state.filter||(state.filter==='ia'&&c.ai));
    const recent = CASES.filter(c=>getCaseState(c.id).started).sort((a,b)=>String(getCaseState(b.id).updatedAt||'').localeCompare(String(getCaseState(a.id).updatedAt||'')))[0] || null;
    const recentState = recent ? getCaseState(recent.id) : null;
    return `<div class="ev-dashboard-shell">
      <aside class="ev-dashboard-sidebar">
        <div class="ev-sidebar-brand">${brandCompact()}</div>
        <div class="ev-sidebar-intro"><span>EMPRESA VIVA</span><strong>Laboratorio de decisiones empresariales</strong><p>Investiga, prioriza y decide con evidencia.</p></div>
        <nav class="ev-side-nav" aria-label="Navegación de Empresa Viva">
          <button class="active" data-action="dashboard">${icon('home',18)} <span>Inicio y casos</span></button>
          <button data-action="progress">${icon('chart',18)} <span>Mi progreso</span></button>
          <button data-action="landing">${icon('target',18)} <span>Cómo funciona</span></button>
          <a href="../../">${icon('arrow',18)} <span>Núcleo Vivo Lab</span></a>
        </nav>
        <div class="ev-sidebar-status"><span></span><div><strong>Versión piloto · Producción V6</strong><small>Guardado local en este navegador</small></div></div>
      </aside>
      <main class="ev-dashboard-main">
        <header class="ev-dashboard-topbar"><div><span>PORTAFOLIO FORMATIVO</span><strong>Panel del analista</strong></div><div class="ev-topbar-actions"><span class="demo-chip">8 casos</span><button class="btn btn-outline" data-action="progress">Ver mi progreso</button></div></header>
        <section class="ev-dashboard-hero">
          <div class="ev-hero-copy"><p class="eyebrow"><span></span> Laboratorio de decisiones empresariales</p><h1>Decisiones complejas.<br><em>Criterio visible.</em></h1><p>Entra en organizaciones ficticias, conecta datos con personas y observa las consecuencias de cada decisión.</p><div class="ev-hero-actions">${recent?`<button class="btn btn-primary btn-large" data-open-case="${recent.id}">Continuar último caso ${icon('arrow')}</button><span>Caso ${recent.number} · ${progressFor(recentState)}% avanzado</span>`:`<button class="btn btn-primary btn-large" data-action="start-featured">Abrir primer caso ${icon('arrow')}</button><span>Tu progreso comenzará en este navegador</span>`}</div></div>
          <div class="ev-hero-metrics"><article><span>${started}</span><small>casos iniciados</small></article><article><span>${completed}</span><small>casos completados</small></article><article><span>${avg}%</span><small>avance promedio</small></article><article><span>3</span><small>casos con IA</small></article></div>
        </section>
        <section class="ev-dashboard-tools" aria-label="Herramientas de progreso"><div><strong>Tu espacio local</strong><span>Administra una copia de tu avance sin crear una cuenta.</span></div><div class="personal-tools"><button class="btn btn-outline" data-action="export-backup">${icon('file')} Respaldar progreso</button><label class="btn btn-outline import-label">${icon('reset')} Restaurar respaldo<input id="backup-file" type="file" accept="application/json" hidden></label><button class="btn btn-outline" data-action="export-csv">${icon('chart')} Exportar resumen</button><button class="btn btn-quiet danger" data-action="reset-all">Borrar progreso</button></div></section>
        <section class="ev-catalog-section"><div class="ev-catalog-heading"><div><span>CATÁLOGO DE SIMULACIONES</span><h2>Elige tu próximo desafío</h2><p>Ocho casos para leer tensiones, contrastar voces y responder por una decisión.</p></div><div class="filters">${[['todos','Todos'],['ia','IA'],['finanzas','Finanzas'],['estrategia','Estrategia'],['personas','Personas']].map(([v,l])=>`<button class="${state.filter===v?'active':''}" data-filter="${v}">${l}</button>`).join('')}</div></div>
          <div class="ev-catalog-grid">${filtered.map(c=>catalogCard(c)).join('')}</div>
        </section>
      </main>
      ${toastView()}
    </div>`;
  }
  function catalogCard(c){
    const cs=getCaseState(c.id),p=progressFor(cs);
    return `<article class="ev-case-card ${c.ai?'is-ai':''}">
      <div class="ev-case-visual"><img src="./assets/cases/case-${c.number}.jpg" alt="Escenario ficticio de ${esc(c.company)}" loading="lazy"><div class="ev-case-overlay"><span>CASO ${c.number}</span>${c.ai?'<em>'+icon('brain',15)+' IA Y DECISIÓN</em>':'<em>'+esc(c.category)+'</em>'}</div></div>
      <div class="ev-case-body"><div class="case-company">${esc(c.company)}</div><h3>${esc(c.title)}</h3><p>${esc(c.short)}</p>
        <div class="case-meta"><span>${esc(c.level)}</span><span>${esc(c.duration)}</span><span>${esc(c.focus)}</span></div>
        <div class="ev-case-footer"><div class="ev-progress-block">${cs.started?`<div class="progress-copy"><span>${cs.completed?'Completado':'En progreso'}</span><b>${p}%</b></div><div class="progress-line"><i style="width:${p}%"></i></div>`:'<div class="new-case-note">Nuevo desafío disponible</div>'}</div><button class="btn ${cs.started?'btn-dark':'btn-primary'}" data-open-case="${c.id}">${cs.completed?'Revisar':cs.started?'Continuar':'Abrir caso'} ${icon('arrow')}</button></div>
      </div>
    </article>`;
  }

  function simulationView(){
    const c=caseById(state.activeCaseId) || CASES[0];
    state.activeCaseId=c.id;
    const cs=getCaseState(c.id);
    if(!ui.selectedStakeholder) ui.selectedStakeholder=c.stakeholders[0].id;
    const stage=Math.max(0,Math.min(7,cs.currentStage||0));
    return `<div class="sim-shell">
      <header class="sim-header"><button class="mobile-menu" data-action="toggle-nav" aria-label="Abrir navegación del caso">${icon('menu')}</button><div class="ev-sim-brand">${brandCompact()}</div><div class="sim-case-title"><span>EMPRESA VIVA · CASO ${c.number}</span><strong>${esc(c.title)}</strong><small>${esc(c.company)}</small></div><div class="sim-header-actions"><span class="ev-learning-mode">Modo aprendizaje</span><span class="autosave">${icon('check',15)} Guardado local</span><button class="icon-btn" data-action="dashboard" title="Salir al catálogo" aria-label="Salir al catálogo">${icon('home')}</button></div></header>
      <div class="sim-layout stage-${STAGES[stage][0]}">
        <aside class="stage-sidebar ${ui.mobileNav?'open':''}"><div class="side-active-label">CASO ACTIVO</div><div class="side-case"><span>${c.ai?icon('brain',19):icon('briefcase',19)}</span><div><small>${esc(c.company)}</small><strong>${esc(c.title)}</strong><em>${esc(c.role)}</em></div></div><nav>${STAGES.map((s,i)=>`<button class="${i===stage?'active':''} ${i<stage||cs.completed?'done':''}" data-stage="${i}"><span>${i<stage||cs.completed?icon('check',15):String(i+1).padStart(2,'0')}</span>${s[1]}</button>`).join('')}</nav><div class="side-progress"><div><span>Avance del caso</span><b>${progressFor(cs)}%</b></div><i><em style="width:${progressFor(cs)}%"></em></i><small>${stage+1} de 8 etapas</small><button data-action="reset-case">${icon('reset',15)} Reiniciar caso</button></div></aside>
        <main class="workspace"><nav class="ev-stage-track" aria-label="Hitos del caso">${MILESTONES.map(([label,start,end],index)=>`<button class="${stage>=start&&stage<=end?'active':''} ${stage>end||cs.completed?'done':''}" data-stage="${start}"><span>${stage>end||cs.completed?icon('check',13):index+1}</span><small>${label}</small></button>`).join('')}<div class="ev-stage-budget"><small>Avance disponible</small><strong>${progressFor(cs)}%</strong></div></nav>${stageView(c,cs,stage)}</main>
        <aside class="case-notebook"><div class="notebook-head">${icon('note',18)} Cuaderno del analista</div><textarea data-field="quickNote" placeholder="Registra una observación, duda o relación entre datos...">${esc(cs.quickNote||'')}</textarea><div class="notebook-summary"><span>Documentos revisados <b>${cs.readDocuments.length}/${c.documents.length}</b></span><span>Actores consultados <b>${interviewedCount(cs)}/${c.stakeholders.length}</b></span><span>Evidencias seleccionadas <b>${cs.analysis.evidence.length}</b></span></div></aside>
      </div>${documentModal(c)}${toastView()}
    </div>`;
  }
  function stageView(c,cs,stage){
    const views=[encargoView,empresaView,documentosView,entrevistasView,analisisView,decisionesView,directorioView,resultadosView];
    return views[stage](c,cs);
  }
  function stageHeader(kicker,title,text,extra=''){ return `<div class="stage-heading"><div><p class="eyebrow"><span></span> ${kicker}</p><h1>${title}</h1><p>${text}</p></div>${extra}</div>`; }
  function stageFooter(cs,stage,label='Continuar'){
    return `<div class="stage-footer"><button class="btn btn-quiet" data-action="dashboard">Guardar y salir</button><div><span>Etapa ${stage+1} de 8</span><button class="btn btn-primary" data-next-stage="${Math.min(7,stage+1)}">${label} ${icon('arrow')}</button></div></div>`;
  }

  function encargoView(c,cs){
    return `${stageHeader('Etapa 1 · Encargo',esc(c.title),esc(c.short),`<span class="stage-tag ${c.ai?'ai':''}">${c.ai?icon('brain',17):icon('briefcase',17)} ${esc(c.focus)}</span>`)}
      <div class="mission-grid"><article class="letter-card"><div class="letter-top"><span>MENSAJE DEL DIRECTORIO</span><small>Confidencial · Empresa ficticia</small></div><p>Has sido incorporado como <strong>${esc(c.role)}</strong>. La organización necesita una recomendación que pueda sostenerse frente a información incompleta, intereses distintos y recursos limitados.</p><blockquote>${esc(c.mission)}</blockquote><p>No se evaluará una “respuesta perfecta”. Se observará cómo investigas, qué evidencia utilizas, qué riesgos haces visibles y cómo integras las consecuencias para las personas.</p><div class="signature">Directorio de ${esc(c.company)}</div></article>
      <aside class="mission-panel"><h3>Tu misión profesional</h3><ul><li>${icon('file',17)} Revisar información relevante</li><li>${icon('chat',17)} Contrastar perspectivas</li><li>${icon('chart',17)} Formular un diagnóstico</li><li>${icon('target',17)} Priorizar con ${c.budget} puntos</li><li>${icon('briefcase',17)} Defender una propuesta</li></ul><div class="case-data"><span><small>Duración</small><b>${esc(c.duration)}</b></span><span><small>Nivel</small><b>${esc(c.level)}</b></span></div></aside></div>
      ${stageFooter(cs,0,'Conocer la empresa')}`;
  }
  function empresaView(c,cs){
    return `${stageHeader('Etapa 2 · Empresa',`Conoce a <em>${esc(c.company)}</em>`,`Antes de explicar el problema, comprende el modelo de negocio y las tensiones que ya son visibles.`)}
      <div class="company-banner"><div><span>${esc(c.sector)}</span><h2>${esc(c.company)}</h2><p>${esc(c.mission)}</p></div><div class="company-number">${c.number}</div></div>
      <div class="facts-grid">${c.companyFacts.map(([l,v])=>`<article><span>${esc(l)}</span><strong>${esc(v)}</strong></article>`).join('')}</div>
      <div class="section-subhead"><div><span>INDICADORES INICIALES</span><h2>El problema ya deja señales</h2></div><p>Un indicador aislado no explica el caso. Busca relaciones.</p></div>
      <div class="kpi-grid">${c.kpis.map(k=>`<article><span>${esc(k.label)}</span><div><small>${esc(k.before)}</small>${icon('arrow',16)}<strong>${esc(k.now)}</strong></div><em class="${k.tone}">${esc(k.change)}</em></article>`).join('')}</div>
      ${stageFooter(cs,1,'Revisar documentos')}`;
  }
  function documentosView(c,cs){
    return `${stageHeader('Etapa 3 · Sala documental','Trabaja con <em>evidencia</em>',`Abre los antecedentes, identifica datos útiles y evita concluir antes de revisar información de distintas áreas.`,`<div class="mini-progress"><span>${cs.readDocuments.length}/${c.documents.length}</span><small>revisados</small></div>`)}
      <div class="document-grid">${c.documents.map(d=>`<button class="document-card ${cs.readDocuments.includes(d.id)?'read':''}" data-document="${d.id}"><div class="doc-icon">${icon('file',24)}</div><span>${esc(d.category)}</span><h3>${esc(d.title)}</h3><p>${esc(d.summary)}</p><small>${cs.readDocuments.includes(d.id)?icon('check',14)+' Revisado':'Abrir documento '+icon('arrow',14)}</small></button>`).join('')}</div>
      ${stageFooter(cs,2,'Entrevistar actores')}`;
  }
  function entrevistasView(c,cs){
    const st=c.stakeholders.find(x=>x.id===ui.selectedStakeholder)||c.stakeholders[0];
    const msgs=cs.interviews[st.id]||[{sender:'actor',text:st.intro}];
    return `${stageHeader('Etapa 4 · Investigar actores','Conversa con quienes <em>viven el problema</em>','Contrasta perspectivas antes de diagnosticar. Cada actor conoce una parte del sistema y también protege intereses legítimos.',`<div class="mini-progress"><span>${interviewedCount(cs)}/${c.stakeholders.length}</span><small>consultados</small></div>`) }
      <div class="ev-actor-workbench">
        <section class="ev-actor-directory"><div class="ev-actor-directory-head"><div><span>MAPA DE ACTORES</span><h2>Personas clave de ${esc(c.company)}</h2></div><p>Selecciona una persona y formula preguntas abiertas para ampliar la evidencia del caso.</p></div>
          <div class="ev-actor-grid">${c.stakeholders.map(s=>`<button class="ev-actor-card ${s.id===st.id?'active':''}" data-stakeholder="${s.id}"><span class="ev-actor-photo"><img src="${portraitFor(c,s)}" alt="Retrato ficticio de ${esc(s.name)}">${hasInterview(cs,s.id)?`<b>${icon('check',13)}</b>`:''}</span><span class="ev-actor-card-copy"><strong>${esc(s.name)}</strong><small>${esc(s.role)}</small><em>${esc(s.themes.slice(0,2).join(' · '))}</em><i>${hasInterview(cs,s.id)?'Conversación registrada':'Conversar'} ${icon('chat',12)}</i></span></button>`).join('')}</div>
          <div class="ev-interview-tip">${icon('spark',18)} <span><strong>Investiga antes de concluir.</strong> Nuevas preguntas pueden revelar relaciones que no aparecen en los documentos.</span></div>
        </section>
        <aside class="ev-actor-profile">
          <header><img src="${portraitFor(c,st)}" alt="Retrato ficticio de ${esc(st.name)}"><div><span>ACTOR SELECCIONADO</span><h2>${esc(st.name)}</h2><strong>${esc(st.role)}</strong><div>${st.themes.map(theme=>`<em>${esc(theme)}</em>`).join('')}</div></div></header>
          <section class="ev-context-note"><span>${icon('note',18)}</span><div><strong>Nota contextual</strong><p>${esc(st.intro)}</p></div></section>
          <section class="ev-conversation"><div class="ev-profile-section-title"><strong>Conversación</strong><span>Personaje ficticio</span></div><div class="messages">${msgs.map(m=>`<div class="message ${m.sender}"><span>${m.sender==='student'?'Tú':st.initials}</span><p>${esc(m.text)}</p></div>`).join('')}</div></section>
          <form class="chat-form" id="chat-form"><label for="chat-input">Escribe tu pregunta a ${esc(st.name.split(' ')[0])}</label><textarea id="chat-input" placeholder="Ej.: ¿Cuál es la tensión más urgente desde tu área?" required></textarea><button class="btn btn-primary" type="submit" aria-label="Enviar pregunta">${icon('arrow')}</button></form>
          <section class="suggested"><strong>Preguntas sugeridas</strong>${st.suggested.map(q=>`<button type="button" data-suggested="${esc(q)}">${icon('arrow',12)} ${esc(q)}</button>`).join('')}</section>
        </aside>
      </div>
      ${stageFooter(cs,3,'Construir diagnóstico')}`;
  }
  function analisisView(c,cs){
    return `${stageHeader('Etapa 5 · Análisis','De los datos al <em>diagnóstico</em>','Explica el problema central, distingue causas y selecciona evidencia que realmente respalde tu lectura.')}
      <div class="analysis-layout"><section class="analysis-form"><label>Problema principal<textarea data-analysis="mainProblem" placeholder="Ejemplo: El problema principal no es..., sino...">${esc(cs.analysis.mainProblem)}</textarea></label><div class="cause-head"><span>Causas relevantes</span><small>Evita repetir síntomas.</small></div>${cs.analysis.causes.map((v,i)=>`<label class="cause-row"><span>0${i+1}</span><input data-cause="${i}" value="${esc(v)}" placeholder="Causa ${i+1}"></label>`).join('')}</section>
      <aside class="evidence-picker"><h3>Evidencia seleccionada</h3><p>Elige al menos cuatro antecedentes que sostengan tu diagnóstico.</p><div>${c.evidence.map((e,i)=>`<label class="evidence-option"><input type="checkbox" data-evidence="${i}" ${cs.analysis.evidence.includes(e)?'checked':''}><span>${esc(e)}</span></label>`).join('')}</div></aside></div>
      ${stageFooter(cs,4,'Tomar decisiones')}`;
  }
  function decisionesView(c,cs){
    const spent=decisionSpend(c,cs),remaining=c.budget-spent;
    return `${stageHeader('Etapa 6 · Decisiones','Prioriza con recursos <em>limitados</em>','Selecciona un portafolio coherente. Una alternativa atractiva por sí sola puede contradecir otra.',`<div class="budget-box"><small>Recursos disponibles</small><strong class="${remaining<0?'over':''}">${remaining}</strong><span>de ${c.budget} puntos</span></div>`)}
      ${remaining<0?'<div class="warning-banner">Tu selección supera el presupuesto. Debes retirar una decisión antes de avanzar.</div>':''}
      <div class="decision-grid">${c.decisions.map(d=>`<label class="decision-card ${cs.selectedDecisions.includes(d.id)?'selected':''}"><input type="checkbox" data-decision="${d.id}" ${cs.selectedDecisions.includes(d.id)?'checked':''}><div class="decision-cost">${d.cost}<small>puntos</small></div><span>${d.tags.slice(0,2).map(t=>`<em>${esc(t)}</em>`).join('')}</span><h3>${esc(d.title)}</h3><p>${esc(d.description)}</p><b>${cs.selectedDecisions.includes(d.id)?icon('check',15)+' Seleccionada':'Seleccionar'}</b></label>`).join('')}</div>
      ${stageFooter(cs,5,'Preparar directorio')}`;
  }
  function directorioView(c,cs){
    return `${stageHeader('Etapa 7 · Directorio','Defiende una propuesta <em>integrada</em>','El directorio no necesita una lista de acciones. Necesita comprender tu lógica, prioridades y condiciones de seguimiento.')}
      <div class="boardroom"><div class="board-visual"><span>REUNIÓN EXTRAORDINARIA</span><h2>Presentación al directorio</h2><p>${esc(c.company)}</p><div class="board-seats">${c.stakeholders.slice(0,4).map(s=>`<div><b>${s.initials}</b><small>${esc(s.name.split(' ')[0])}</small></div>`).join('')}</div></div>
      <section class="board-form"><label>Diagnóstico ejecutivo<textarea data-board="diagnosis" placeholder="Resume el problema central y sus causas...">${esc(cs.board.diagnosis)}</textarea></label><label>Plan priorizado<textarea data-board="plan" placeholder="Explica qué harás primero, después y por qué...">${esc(cs.board.plan)}</textarea></label><div class="board-two"><label>Indicadores<textarea data-board="indicators" placeholder="¿Qué medirás y con qué meta?">${esc(cs.board.indicators)}</textarea></label><label>Riesgos y condiciones<textarea data-board="risks" placeholder="¿Qué puede fallar y cuándo detendrías o ajustarías el plan?">${esc(cs.board.risks)}</textarea></label></div></section></div>
      <div class="stage-footer"><button class="btn btn-quiet" data-action="dashboard">Guardar y salir</button><div><span>Etapa 7 de 8</span><button class="btn btn-primary" data-action="finish-case" ${decisionSpend(c,cs)>c.budget?'disabled':''}>Presentar y observar consecuencias ${icon('arrow')}</button></div></div>`;
  }
  function resultadosView(c,cs){
    const out=Engine.calculateOutcome(c,cs);
    return `<div class="results-wrap">${stageHeader('Etapa 8 · Resultados','Tu decisión produjo <em>consecuencias</em>',`La evaluación considera investigación, diagnóstico, coherencia y resguardos. No supone una única solución perfecta.`)}
      <section class="score-hero"><div class="score-ring" style="--score:${out.totalScore*3.6}deg"><span><strong>${out.totalScore}</strong><small>/100</small></span></div><div><span>NIVEL DE DESEMPEÑO</span><h2>${out.level}</h2><p>Invertiste ${out.spent} de ${c.budget} puntos y cubriste ${Math.round(out.requiredCoverage*100)}% de los criterios críticos del caso.</p></div></section>
      <div class="outcome-grid">${Object.entries(c.outcomeLabels).map(([k,l])=>`<article><span>${esc(l)}</span><div><i style="width:${out.metrics[k]}%"></i></div><strong>${out.metrics[k]}/100</strong></article>`).join('')}</div>
      <div class="score-dimensions"><article><span>Investigación</span><strong>${out.investigationScore}</strong><p>Documentos y actores consultados.</p></article><article><span>Diagnóstico</span><strong>${out.analysisScore}</strong><p>Causas, evidencia y argumentación.</p></article><article><span>Estrategia</span><strong>${out.strategyScore}</strong><p>Coherencia del portafolio y consecuencias.</p></article><article><span>${c.ai?'Gobernanza de IA':'Criterio integral'}</span><strong>${out.governanceScore}</strong><p>Resguardos críticos y personas.</p></article></div>
      <div class="feedback-columns"><article class="strengths"><h3>${icon('check')} Evidencias de fortaleza</h3>${out.strengths.map(x=>`<p>${esc(x)}</p>`).join('')}</article><article class="improvements"><h3>${icon('target')} Próximo nivel de práctica</h3>${out.improvements.map(x=>`<p>${esc(x)}</p>`).join('')}</article></div>${out.academic?`<section class="academic-feedback"><div class="section-heading"><span>RETROALIMENTACIÓN ACADÉMICA</span><h3>Qué demostraste y qué debes hacer después</h3></div><div class="academic-grid">${out.academic.dimensions.map(d=>`<article><span>${esc(d.label)}</span><strong>${d.score}</strong><small>${d.score>=86?'Avanzado':d.score>=70?'Competente':d.score>=50?'En desarrollo':'Inicial'}</small></article>`).join('')}</div><div class="feedforward"><b>Objetivo de nueva práctica</b><p>${esc(out.academic.feedforward)}</p></div><details><summary>Base metodológica de esta evaluación</summary>${out.academic.sources.map(s=>`<p><strong>${esc(s.label)}:</strong> ${esc(s.use)}</p>`).join('')}</details></section>`:''}
      <section class="decision-report"><div><span>PORTAFOLIO PRESENTADO</span><h3>${c.decisions.filter(d=>cs.selectedDecisions.includes(d.id)).length} decisiones seleccionadas</h3></div><div>${c.decisions.filter(d=>cs.selectedDecisions.includes(d.id)).map(d=>`<span>${icon('check',14)} ${esc(d.title)}</span>`).join('')||'<span>No se seleccionaron decisiones.</span>'}</div></section>
      <div class="results-actions"><button class="btn btn-outline" data-action="print">${icon('print')} Imprimir informe</button><button class="btn btn-dark" data-action="dashboard">Volver al catálogo</button><button class="btn btn-primary" data-action="retry-case">Repetir con otra estrategia ${icon('arrow')}</button></div></div>`;
  }


  function progressView(){
    const rows=CASES.map(c=>{const cs=getCaseState(c.id);const result=cs.completed?Engine.calculateOutcome(c,cs):null;return {c,cs,result,progress:progressFor(cs)};});
    const completed=rows.filter(x=>x.cs.completed);const avg=completed.length?Math.round(completed.reduce((s,x)=>s+x.result.totalScore,0)/completed.length):0;
    return `<div class="app-shell dashboard-shell"><header class="app-header">${brandCompact()}<div class="header-right"><span class="demo-chip">Espacio personal</span><button class="icon-btn" data-action="dashboard" title="Volver">${icon('home')}</button></div></header>
    <main class="dashboard-main"><section class="welcome-row"><div><p class="eyebrow"><span></span> Aprendizaje autónomo</p><h1>Mi <em>progreso.</em></h1><p>Este espacio pertenece exclusivamente al estudiante. Revisa tus intentos, resultados y próximos objetivos de práctica.</p></div><div class="identity-card"><div>EV</div><span><strong>${completed.length} de ${CASES.length} casos</strong><small>Promedio completados: ${avg||'—'}${avg?'%':''}</small></span></div></section>
    <section class="personal-tools"><button class="btn btn-outline" data-action="export-backup">${icon('file')} Respaldar progreso</button><label class="btn btn-outline import-label">${icon('reset')} Restaurar respaldo<input id="backup-file" type="file" accept="application/json" hidden></label><button class="btn btn-outline" data-action="export-csv">${icon('chart')} Exportar resumen</button><button class="btn btn-quiet danger" data-action="reset-all">Borrar progreso</button></section><section class="summary-cards"><article>${icon('briefcase')}<div><strong>${rows.filter(x=>x.cs.started).length}</strong><span>casos iniciados</span></div></article><article>${icon('check')}<div><strong>${completed.length}</strong><span>casos completados</span></div></article><article>${icon('chart')}<div><strong>${avg||0}%</strong><span>desempeño promedio</span></div></article></section>
    <section class="progress-personal-grid">${rows.map(({c,cs,result,progress})=>`<article class="personal-case-card"><img src="./assets/cases/case-${c.number}.jpg" alt=""><div><span class="case-number">CASO ${c.number}</span><h3>${esc(c.title)}</h3><p>${esc(c.focus)}</p><div class="progress-track"><i style="width:${progress}%"></i></div><small>${cs.completed?`${result.level} · ${result.totalScore}%`:(cs.started?`${progress}% avanzado`:'No iniciado')}</small>${result?.academic?.feedforward?`<div class="next-practice"><b>Próxima práctica</b><p>${esc(result.academic.feedforward)}</p></div>`:''}<button class="btn ${cs.started?'btn-outline':'btn-primary'}" data-open-case="${c.id}">${cs.completed?'Revisar o repetir':cs.started?'Continuar':'Comenzar'}</button></div></article>`).join('')}</section>
    <div class="progress-actions"><button class="btn btn-outline" data-action="export-progress">Descargar progreso</button><button class="btn btn-dark" data-action="dashboard">Volver al catálogo</button></div></main></div>${toastView()}`;
  }
  function exportProgress(){
    const payload={product:'Empresa Viva',version:window.EMPRESA_VIVA_RELEASE?.version||'4',exportedAt:new Date().toISOString(),cases:CASES.map(c=>{const cs=getCaseState(c.id);const result=cs.completed?Engine.calculateOutcome(c,cs):null;return {caseId:c.id,title:c.title,started:cs.started,completed:cs.completed,progress:progressFor(cs),score:result?.totalScore||null,level:result?.level||null,nextPractice:result?.academic?.feedforward||null};})};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='empresa-viva-mi-progreso.json';a.click();URL.revokeObjectURL(url);
  }

  function documentModal(c){
    if(!ui.openDocument) return '';
    const d=c.documents.find(x=>x.id===ui.openDocument); if(!d) return '';
    return `<div class="modal-backdrop" data-action="close-document"><article class="document-modal" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><header><div><span>${esc(d.category)}</span><h2>${esc(d.title)}</h2></div><button class="icon-btn" data-action="close-document">${icon('close')}</button></header><p class="doc-summary">${esc(d.summary)}</p><table><thead><tr><th>Indicador</th><th>Valor</th><th>Referencia</th></tr></thead><tbody>${d.rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1]||'')}</td><td>${esc(r[2]||'')}</td></tr>`).join('')}</tbody></table><div class="document-insight"><span>${icon('spark',18)} Hallazgo potencial</span><p>${esc(d.insight)}</p></div><button class="btn btn-primary full" data-action="close-document">Cerrar documento</button></article></div>`;
  }
  function toastView(){ return ui.notice?`<div class="toast">${icon('check',16)} ${esc(ui.notice)}</div>`:''; }
  function interviewedCount(cs){ return Object.values(cs.interviews||{}).filter(ms=>(ms||[]).some(m=>m.sender==='student')).length; }
  function hasInterview(cs,id){ return (cs.interviews[id]||[]).some(m=>m.sender==='student'); }
  function decisionSpend(c,cs){ return c.decisions.filter(d=>cs.selectedDecisions.includes(d.id)).reduce((s,d)=>s+d.cost,0); }

  function startCase(id){
    const cs=getCaseState(id); updateCase(id,{...cs,started:true}); state.activeCaseId=id; state.screen='simulation'; ui.selectedStakeholder=caseById(id).stakeholders[0].id; ui.openDocument=null; save(); render(); window.scrollTo(0,0);
  }
  function bind(){
    root.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',e=>{
      const a=el.dataset.action;
      if(a==='catalog'||a==='dashboard'){state.screen='dashboard';save();render();window.scrollTo(0,0);}
      if(a==='landing'){state.screen='landing';save();render();window.scrollTo(0,0);}
      if(a==='progress'){state.screen='progress';save();render();window.scrollTo(0,0);}
      if(a==='export-backup'){exportBackup();announce('Respaldo local descargado.');}
      if(a==='export-csv'){exportProgressCsv();announce('Resumen descargado.');}
      if(a==='reset-all'){resetAll();}
      if(a==='export-progress'){exportProgress();announce('Progreso descargado.');}
      if(a==='start-featured')startCase(CASES[0].id);
      if(a==='toggle-nav'){ui.mobileNav=!ui.mobileNav;render();}
      if(a==='close-document'){ui.openDocument=null;render();}
      if(a==='reset-case'){
        if(confirm('¿Reiniciar este caso? Se eliminará su avance local.')){state.cases[state.activeCaseId]=freshCaseState();save();ui.selectedStakeholder=caseById(state.activeCaseId).stakeholders[0].id;render();}
      }
      if(a==='finish-case'){
        const c=caseById(state.activeCaseId),cs=getCaseState(c.id);
        updateCase(c.id,{...cs,currentStage:7,completed:true});render();window.scrollTo(0,0);
      }
      if(a==='retry-case'){
        const id=state.activeCaseId;state.cases[id]=freshCaseState();state.cases[id].started=true;save();ui.selectedStakeholder=caseById(id).stakeholders[0].id;render();window.scrollTo(0,0);
      }
      if(a==='print')window.print();
    }));
    root.querySelectorAll('[data-filter]').forEach(el=>el.addEventListener('click',()=>{state.filter=el.dataset.filter;save();render();}));
    const backupFile=root.querySelector('#backup-file');if(backupFile)backupFile.addEventListener('change',()=>{if(backupFile.files?.[0])importBackup(backupFile.files[0]);});
    root.querySelectorAll('[data-open-case]').forEach(el=>el.addEventListener('click',()=>startCase(el.dataset.openCase)));
    root.querySelectorAll('[data-stage]').forEach(el=>el.addEventListener('click',()=>{const id=state.activeCaseId,cs=getCaseState(id);updateCase(id,{...cs,currentStage:Number(el.dataset.stage)});ui.mobileNav=false;render();window.scrollTo(0,0);}));
    root.querySelectorAll('[data-next-stage]').forEach(el=>el.addEventListener('click',()=>{const id=state.activeCaseId,cs=getCaseState(id);updateCase(id,{...cs,currentStage:Number(el.dataset.nextStage)});render();window.scrollTo(0,0);}));
    root.querySelectorAll('[data-document]').forEach(el=>el.addEventListener('click',()=>{const id=state.activeCaseId,cs=getCaseState(id),docId=el.dataset.document;ui.openDocument=docId;if(!cs.readDocuments.includes(docId))updateCase(id,{...cs,readDocuments:[...cs.readDocuments,docId]});render();}));
    root.querySelectorAll('[data-stakeholder]').forEach(el=>el.addEventListener('click',()=>{ui.selectedStakeholder=el.dataset.stakeholder;render();}));
    root.querySelectorAll('[data-suggested]').forEach(el=>el.addEventListener('click',()=>{const input=root.querySelector('#chat-input');if(input){input.value=el.dataset.suggested;input.focus();}}));
    const form=root.querySelector('#chat-form'); if(form) form.addEventListener('submit',e=>{
      e.preventDefault();const input=root.querySelector('#chat-input'),text=input.value.trim();if(!text)return;
      const c=caseById(state.activeCaseId),cs=getCaseState(c.id),st=c.stakeholders.find(x=>x.id===ui.selectedStakeholder);
      const messages=cs.interviews[st.id]||[{sender:'actor',text:st.intro}];
      const response=Engine.getInterviewResponse(st,text);
      updateCase(c.id,{...cs,interviews:{...cs.interviews,[st.id]:[...messages,{sender:'student',text},{sender:'actor',text:response}]}});render();
      setTimeout(()=>{const box=root.querySelector('.messages');if(box)box.scrollTop=box.scrollHeight;},0);
    });
    root.querySelectorAll('[data-analysis]').forEach(el=>el.addEventListener('input',()=>{const id=state.activeCaseId,cs=getCaseState(id);updateCase(id,{...cs,analysis:{...cs.analysis,[el.dataset.analysis]:el.value}});}));
    root.querySelectorAll('[data-cause]').forEach(el=>el.addEventListener('input',()=>{const id=state.activeCaseId,cs=getCaseState(id),causes=[...cs.analysis.causes];causes[Number(el.dataset.cause)]=el.value;updateCase(id,{...cs,analysis:{...cs.analysis,causes}});}));
    root.querySelectorAll('[data-evidence]').forEach(el=>el.addEventListener('change',()=>{const id=state.activeCaseId,c=caseById(id),cs=getCaseState(id),value=c.evidence[Number(el.dataset.evidence)],arr=el.checked?[...new Set([...cs.analysis.evidence,value])]:cs.analysis.evidence.filter(x=>x!==value);updateCase(id,{...cs,analysis:{...cs.analysis,evidence:arr}});render();}));
    root.querySelectorAll('[data-decision]').forEach(el=>el.addEventListener('change',()=>{const id=state.activeCaseId,cs=getCaseState(id),d=el.dataset.decision,arr=el.checked?[...new Set([...cs.selectedDecisions,d])]:cs.selectedDecisions.filter(x=>x!==d);updateCase(id,{...cs,selectedDecisions:arr});render();}));
    root.querySelectorAll('[data-board]').forEach(el=>el.addEventListener('input',()=>{const id=state.activeCaseId,cs=getCaseState(id);updateCase(id,{...cs,board:{...cs.board,[el.dataset.board]:el.value}});}));
    const note=root.querySelector('[data-field="quickNote"]');if(note)note.addEventListener('input',()=>{const id=state.activeCaseId,cs=getCaseState(id);updateCase(id,{...cs,quickNote:note.value});});
  }

  render();
})();
