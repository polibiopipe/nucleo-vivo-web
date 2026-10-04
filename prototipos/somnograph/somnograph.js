(() => {
  'use strict';
  function cleanTrackingParams(){
    const url=new URL(window.location.href);
    let changed=false;
    for(const key of [...url.searchParams.keys()]){
      if(key.toLowerCase().startsWith('utm_') || ['gclid','fbclid','msclkid'].includes(key.toLowerCase())){
        url.searchParams.delete(key); changed=true;
      }
    }
    if(changed){
      const clean=url.pathname + (url.search ? url.search : '') + url.hash;
      window.history.replaceState(window.history.state,'',clean);
    }
  }
  cleanTrackingParams();
  const CONFIG = Object.freeze({
    supabaseUrl: 'https://ygfmpwlpmaasooltjujb.supabase.co',
    supabaseKey: 'sb_publishable_evFWgAwjv7xcNxo156NV0g_CFq0j5Ld',
    allowed: ['polibio.solis@nucleovivo.net','leyla.llanos@nucleovivo.net'],
    api: '/api/somnograph-ai'
  });
  const $ = s => document.querySelector(s);
  const state = { client:null,user:null,project:null,graph:null,sessions:[],busy:false };

  const els = {
    loading:$('#sg-loading'), auth:$('#sg-auth'), app:$('#sg-app'), signout:$('#sg-signout'),
    authForm:$('#sg-auth-form'), email:$('#sg-email'), password:$('#sg-password'), authStatus:$('#sg-auth-status'),
    avatar:$('#sg-avatar'), userName:$('#sg-user-name'), userEmail:$('#sg-user-email'),
    graph:$('#sg-graph'), empty:$('#sg-empty'), emptyStart:$('#sg-empty-start'), newSource:$('#sg-new-source'),
    sourceDialog:$('#sg-source-dialog'), sourceForm:$('#sg-source-form'), sourceTitle:$('#sg-source-title'), sourceText:$('#sg-source-text'), sourceStatus:$('#sg-source-status'),
    sourceCancel:$('#sg-source-cancel'), analyze:$('#sg-analyze'), fit:$('#sg-fit'),
    insightsEmpty:$('#sg-insights-empty'), insights:$('#sg-insights'), leverTitle:$('#sg-lever-title'), leverReason:$('#sg-lever-reason'), leverScore:$('#sg-lever-score'), riskCopy:$('#sg-risk-copy'),
    metricEdges:$('#metric-edges'), metricLever:$('#metric-lever'), metricRisk:$('#metric-risk'), summary:$('#sg-project-summary'),
    targetEdge:$('#sg-target-edge'), controlEdge:$('#sg-control-edge'), transferPrompt:$('#sg-transfer-prompt'), evidenceCount:$('#sg-evidence-count'),
    microtest:$('#sg-microtest'), night:$('#sg-night'), testDialog:$('#sg-test-dialog'), testForm:$('#sg-test-form'), testQuestion:$('#sg-test-question'), testAnswer:$('#sg-test-answer'), confidence:$('#sg-confidence'), confidenceValue:$('#sg-confidence-value'), testCancel:$('#sg-test-cancel'), testStatus:$('#sg-test-status'),
    chat:$('#sg-chat'), chatForm:$('#sg-chat-form'), chatInput:$('#sg-chat-input'), toast:$('#sg-toast')
  };

  function allowed(email){ return CONFIG.allowed.includes(String(email||'').toLowerCase()); }
  function initials(email){ const s=String(email||'NV').split('@')[0].replace(/[._-]+/g,' ').trim().split(/\s+/); return (s[0]?.[0]||'N')+(s[1]?.[0]||s[0]?.[1]||'V'); }
  function toast(msg){ els.toast.textContent=msg; els.toast.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>els.toast.hidden=true,3200); }
  function setState(name){ document.body.dataset.state=name; els.loading.hidden=name!=='loading'; els.auth.hidden=name!=='auth'; els.app.hidden=name!=='app'; els.signout.hidden=name!=='app'; }
  function edgeLabel(edge){ const nodes=new Map((state.graph?.nodes||[]).map(n=>[n.id,n.label])); return `${nodes.get(edge.source)||edge.source} → ${nodes.get(edge.target)||edge.target}`; }

  async function init(){
    if (!window.supabase?.createClient){ setState('auth'); els.authStatus.textContent='No pudimos iniciar el acceso seguro.'; return; }
    state.client=window.supabase.createClient(CONFIG.supabaseUrl,CONFIG.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const {data:{session}}=await state.client.auth.getSession();
    if(session?.user) await acceptUser(session.user); else setState('auth');
    state.client.auth.onAuthStateChange((_event,session)=>{ if(session?.user) acceptUser(session.user); else setState('auth'); });
  }

  async function acceptUser(user){
    if(!allowed(user.email)){ await state.client.auth.signOut(); setState('auth'); els.authStatus.textContent='Esta identidad no está autorizada para SomnoGraph.'; return; }
    state.user=user; els.userEmail.textContent=user.email; els.userName.textContent=user.user_metadata?.full_name || user.email.split('@')[0].replace(/[._-]/g,' '); els.avatar.textContent=initials(user.email).toUpperCase(); setState('app');
    await loadLatestProject();
  }

  els.authForm.addEventListener('submit',async e=>{
    e.preventDefault(); const email=els.email.value.trim().toLowerCase(); const password=els.password.value;
    if(!allowed(email)){ els.authStatus.textContent='Acceso restringido al equipo autorizado.'; return; }
    els.authStatus.textContent='Verificando acceso…';
    const {data,error}=await state.client.auth.signInWithPassword({email,password});
    if(error){ els.authStatus.textContent='No pudimos ingresar. Revisa correo y contraseña.'; return; }
    if(data.user) els.authStatus.textContent='Acceso concedido.';
  });
  els.signout.addEventListener('click',()=>state.client?.auth.signOut());

  async function loadLatestProject(){
    const {data,error}=await state.client.from('somnograph_projects').select('*').order('updated_at',{ascending:false}).limit(1);
    if(error){ toast('No pudimos cargar la memoria guardada.'); return; }
    if(data?.[0]){ state.project=data[0]; state.graph=data[0].graph; await loadSessions(); render(); }
    else render();
  }
  async function loadSessions(){
    if(!state.project){state.sessions=[];return;}
    const {data}=await state.client.from('somnograph_sessions').select('*').eq('project_id',state.project.id).order('created_at',{ascending:false}).limit(30);
    state.sessions=data||[];
  }
  async function saveProject(graph,title,source){
    if(state.project){
      const {data,error}=await state.client.from('somnograph_projects').update({title,source_text:source,graph}).eq('id',state.project.id).select().single();
      if(error) throw error; state.project=data;
    }else{
      const {data,error}=await state.client.from('somnograph_projects').insert({title,source_text:source,graph,created_by:state.user.id}).select().single();
      if(error) throw error; state.project=data;
    }
    state.graph=graph;
  }
  async function addSession(kind,payload){
    if(!state.project) return;
    await state.client.from('somnograph_sessions').insert({project_id:state.project.id,user_id:state.user.id,kind,payload});
    await loadSessions(); updateEvidenceCount();
  }

  function openSource(){ els.sourceStatus.textContent=''; if(state.project){els.sourceTitle.value=state.project.title||'';els.sourceText.value=state.project.source_text||'';} els.sourceDialog.showModal(); }
  els.newSource.addEventListener('click',openSource); els.emptyStart.addEventListener('click',openSource); els.sourceCancel.addEventListener('click',()=>els.sourceDialog.close());
  els.fit.addEventListener('click',()=>renderGraph());

  els.sourceForm.addEventListener('submit',async e=>{
    e.preventDefault(); if(state.busy)return; const source=els.sourceText.value.trim(); const title=els.sourceTitle.value.trim()||'Mapa sin título'; if(source.length<120){els.sourceStatus.textContent='Necesito un poco más de contenido para construir relaciones útiles.';return;}
    state.busy=true; els.analyze.disabled=true; els.analyze.textContent='Analizando…'; els.sourceStatus.textContent='La IA está buscando estructura, no sólo palabras frecuentes.';
    try{
      const result=await callAI('analyze',{title,source});
      await saveProject(result.graph,title,source); await addSession('analysis',{lever:result.graph.lever,generatedAt:new Date().toISOString()});
      els.sourceDialog.close(); render(); toast('Mapa construido. Ya podemos buscar una palanca cognitiva.');
    }catch(err){ els.sourceStatus.textContent=err.message||'No pudimos analizar el contenido.'; }
    finally{state.busy=false;els.analyze.disabled=false;els.analyze.textContent='Analizar con IA';}
  });

  async function callAI(action,payload){
    const {data:{session}}=await state.client.auth.getSession(); if(!session?.access_token) throw new Error('Tu sesión expiró. Vuelve a ingresar.');
    const response=await fetch(CONFIG.api,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({action,...payload})});
    const data=await response.json().catch(()=>({})); if(!response.ok) throw new Error(data.message||'La IA no pudo responder.'); return data;
  }

  function render(){
    const has=Boolean(state.graph?.nodes?.length); els.empty.hidden=has; els.graph.hidden=!has; els.insightsEmpty.hidden=has; els.insights.hidden=!has;
    els.chatInput.disabled=!has; els.chatForm.querySelector('button').disabled=!has;
    if(!has){els.metricEdges.textContent='0';els.metricLever.textContent='—';els.metricRisk.textContent='—';els.summary.textContent='Crea un mapa con IA y observa qué relaciones conviene fortalecer primero.'; updateEvidenceCount(); return;}
    renderGraph(); renderInsights(); updateEvidenceCount();
  }

  function renderGraph(){
    if(!state.graph?.nodes?.length)return;
    const box=els.graph.getBoundingClientRect(); const w=Math.max(box.width,500), h=Math.max(box.height,420); const nodes=state.graph.nodes; const positions=new Map();
    const cx=w/2,cy=h/2,rx=Math.min(w*.37,360),ry=Math.min(h*.34,165);
    nodes.forEach((n,i)=>{ const angle=(Math.PI*2*i/nodes.length)-Math.PI/2; const ring=i%3===0?.76:1; positions.set(n.id,{x:cx+Math.cos(angle)*rx*ring,y:cy+Math.sin(angle)*ry*ring}); });
    const lever=state.graph.lever?.edgeId; let svg=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">`;
    (state.graph.edges||[]).forEach(e=>{const a=positions.get(e.source),b=positions.get(e.target);if(!a||!b)return;const cls=['sg-edge',e.id===lever?'is-lever':'',Number(e.strength||e.confidence||.6)<.48?'is-weak':''].filter(Boolean).join(' ');svg+=`<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;}); svg+='</svg>';
    els.graph.innerHTML=svg;
    const leverEdge=(state.graph.edges||[]).find(e=>e.id===lever); const leverNodes=new Set(leverEdge?[leverEdge.source,leverEdge.target]:[]);
    nodes.forEach(n=>{const p=positions.get(n.id);const btn=document.createElement('button');btn.type='button';btn.className=`sg-node ${leverNodes.has(n.id)?'is-lever':''} ${Number(n.importance||0)>.78?'is-core':''}`;btn.style.left=`${p.x}px`;btn.style.top=`${p.y}px`;btn.innerHTML=`<b>${escapeHtml(n.label)}</b><small>${escapeHtml(n.role||'concepto')}</small>`;btn.title=n.summary||n.label;btn.addEventListener('click',()=>{toast(n.summary||n.label)});els.graph.appendChild(btn);});
  }
  function escapeHtml(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function renderInsights(){
    const g=state.graph; const edges=g.edges||[]; const lever=edges.find(e=>e.id===g.lever?.edgeId) || edges[0]; const control=edges.find(e=>e.id===g.control?.edgeId) || edges.find(e=>e.id!==lever?.id);
    const score=Math.round(Number(g.lever?.opportunity||.65)*100); els.leverTitle.textContent=lever?edgeLabel(lever):'—'; els.leverReason.textContent=g.lever?.reason||'La IA no definió una justificación.'; els.leverScore.textContent=`${score}%`;
    const risks=g.interferenceRisks||[]; els.riskCopy.textContent=risks[0]?.reason||'No se detectó una interferencia prioritaria en este mapa.';
    els.metricEdges.textContent=edges.length; els.metricLever.textContent=lever?`${score}%`:'—'; els.metricRisk.textContent=risks.length?`${Math.round(Number(risks[0].risk||.4)*100)}%`:'bajo';
    els.summary.textContent=state.project?.title?`Mapa activo: ${state.project.title}. ${g.summary||''}`:(g.summary||''); els.targetEdge.textContent=lever?edgeLabel(lever):'Sin seleccionar'; els.controlEdge.textContent=control?edgeLabel(control):'Sin seleccionar'; els.transferPrompt.textContent=g.transfer?.prompt||'Sin prueba';
  }
  function updateEvidenceCount(){els.evidenceCount.textContent=`${state.sessions.length} ${state.sessions.length===1?'evento':'eventos'}`;}

  els.microtest.addEventListener('click',()=>{ if(!state.graph?.microtest)return; els.testQuestion.textContent=state.graph.microtest.question||'Explica la relación con tus propias palabras.'; els.testAnswer.value='';els.confidence.value=60;els.confidenceValue.textContent='60%';els.testStatus.textContent='';els.testDialog.showModal(); });
  els.confidence.addEventListener('input',()=>els.confidenceValue.textContent=`${els.confidence.value}%`); els.testCancel.addEventListener('click',()=>els.testDialog.close());
  els.testForm.addEventListener('submit',async e=>{
    e.preventDefault(); if(state.busy)return; const answer=els.testAnswer.value.trim();
    if(answer.length<12){els.testStatus.textContent='Escribe una respuesta un poco más completa.';return;}
    state.busy=true; const submit=els.testForm.querySelector('button[type="submit"]'); submit.disabled=true; submit.textContent='Evaluando…'; els.testStatus.textContent='La IA compara tu explicación con la relación del mapa, no con palabras exactas.';
    try{
      const assessment=await callAI('assess',{question:els.testQuestion.textContent,answer,confidence:Number(els.confidence.value),graph:state.graph});
      const edgeId=state.graph?.microtest?.edgeId || state.graph?.lever?.edgeId; const edge=(state.graph?.edges||[]).find(e=>e.id===edgeId);
      if(edge){ const prior=Number(edge.strength||.5); const measured=Number(assessment.relationStrength||0); edge.strength=Math.max(0,Math.min(1,prior*.35+measured*.65)); }
      if(state.graph?.lever && edgeId===state.graph.lever.edgeId){
        const current=Number(state.graph.lever.opportunity||.6); state.graph.lever.opportunity=Math.max(.05,Math.min(1,current*(1-(Number(assessment.score||0)/100)*.45)));
        state.graph.lever.basis='behavioral_evidence';
      }
      await saveProject(state.graph,state.project?.title||'Mapa sin título',state.project?.source_text||'');
      await addSession('microtest',{question:els.testQuestion.textContent,answer,confidence:Number(els.confidence.value),assessment,edgeId});
      els.testDialog.close(); render(); appendMessage('ai',`Evidencia registrada: ${Math.round(Number(assessment.score||0))}/100. ${assessment.feedback||'La relación fue actualizada con esta respuesta.'}`); toast('La red se actualizó con evidencia de tu respuesta.');
    }catch(err){els.testStatus.textContent=err.message||'No pudimos evaluar esta evidencia.';}
    finally{state.busy=false;submit.disabled=false;submit.textContent='Registrar evidencia';}
  });
  els.night.addEventListener('click',async()=>{if(!state.graph)return;const lever=(state.graph.edges||[]).find(e=>e.id===state.graph.lever?.edgeId);const control=(state.graph.edges||[]).find(e=>e.id===state.graph.control?.edgeId);await addSession('night_simulation',{target:lever?.id||null,control:control?.id||null,note:'Simulación de selección. No hubo estimulación durante sueño.'});toast('Noche simulada: objetivo y control quedaron registrados.');});

  els.chatForm.addEventListener('submit',async e=>{
    e.preventDefault();const message=els.chatInput.value.trim();if(!message||state.busy||!state.graph)return;appendMessage('user',message);els.chatInput.value='';state.busy=true;
    try{const result=await callAI('coach',{message,graph:state.graph,source:state.project?.source_text?.slice(0,18000)||''});appendMessage('ai',result.message||'No pude elaborar una respuesta.');}
    catch(err){appendMessage('ai',err.message||'No pude responder ahora.');} finally{state.busy=false;}
  });
  function appendMessage(role,text){const div=document.createElement('div');div.className=`sg-message ${role==='user'?'is-user':'is-ai'}`;div.innerHTML=role==='ai'?`<b>SomnoGraph</b><p>${escapeHtml(text)}</p>`:`<p>${escapeHtml(text)}</p>`;els.chat.appendChild(div);els.chat.scrollTop=els.chat.scrollHeight;}

  window.addEventListener('resize',()=>{clearTimeout(renderGraph.t);renderGraph.t=setTimeout(()=>{if(state.graph)renderGraph()},150)});
  init();
})();