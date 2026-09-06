/* MOVE Select: real model responses, rendered only as text and catalog-backed cards. */
(() => {
  'use strict';
  const originalOpen = window.openMoveSelect;
  const originalClose = window.closeMoveSelect;
  let history = [], controller = null, revision = 0, lastFocus = null, selectedRank = null;
  let busy = false;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const button = (label, action, cls = 'move-ai-choice') => {
    const node = el('button', cls, label); node.type = 'button'; node.addEventListener('click', action); return node;
  };
  const stage = document.getElementById('msStage');
  const overlay = document.getElementById('moveSelectOverlay');
  const mode = document.getElementById('msModeText');
  function abort() { revision++; controller?.abort(); controller = null; busy = false; }
  function status(text, active = false) {
    mode.textContent = text;
    document.getElementById('msStatus').classList.toggle('ai', active);
    document.getElementById('msStatus').classList.toggle('demo', !active);
  }
  function scrollEnd() {
    const log = document.getElementById('moveAIConversation');
    if (log) log.scrollTop = log.scrollHeight;
  }
  function message(role, text) {
    const item = el('article', `move-ai-message move-ai-${role}`);
    item.append(el('span', 'move-ai-speaker', role === 'user' ? 'Tú' : 'MOVE Select'));
    item.append(el('p', '', text));
    document.getElementById('moveAIConversation').append(item); scrollEnd(); return item;
  }
  function setBusy(value) {
    busy = value;
    const send = document.getElementById('moveAISend');
    if (send) { send.disabled = value; send.textContent = value ? 'Pensando…' : 'Enviar'; }
    const log = document.getElementById('moveAIConversation');
    if (log) log.setAttribute('aria-busy', String(value));
    document.querySelectorAll('.move-ai-choice').forEach(b => b.disabled = value);
  }
  function guided() {
    abort(); history = [];
    overlay.classList.remove('move-ai-open');
    msState = msDefaults(); msSetMode('demo'); msRenderIntro();
    status('Preguntas guiadas · sin IA');
  }
  function openAgenda() { window.closeMoveSelect(); agendaOpen(); }
  function present(data) {
    const item = message('assistant', data.message);
    const cards = el('div','move-ai-products');
    for (const product of data.products || []) {
      const actual = byRank(product.rank);
      if (!actual) continue;
      const card = el('article','move-ai-product');
      const img = el('img'); img.src = imageFor(actual); img.alt = actual.name; img.loading = 'lazy';
      const copy = el('div','move-ai-product-copy');
      copy.append(el('h3','',actual.name), el('p','',product.reason));
      const price = el('div','move-ai-price');
      price.append(el('strong','',product.price), el('small','','Precio referencial'));
      copy.append(price);
      const actions = el('div','move-ai-product-actions');
      actions.append(button('Agregar a la bolsa', () => {
        cart.push({...actual,image:imageFor(actual)}); updateCart(); showToast(actual.name + ' agregado');
      }, 'move-ai-add'));
      actions.append(button('Consultar este producto', () => send(`Quiero comparar ${actual.name} con otra alternativa del catálogo.`)));
      copy.append(actions); card.append(img,copy); cards.append(card);
    }
    if (cards.childElementCount) item.append(cards);
    if (data.intent === 'appointment' && data.referral === 'yes') {
      const action = el('div','move-ai-next');
      action.append(button('Continuar a la agenda de prueba',openAgenda,'move-ai-primary'));
      action.append(el('small','','MOVE revisaría la indicación y confirmaría la disponibilidad. Esta demo no reserva horas.'));
      item.append(action);
    }
    if (data.intent === 'professional') {
      const note = el('div','move-ai-next');
      note.append(el('p','','Para recibir atención real, consulta al equipo de MOVE o a tu profesional de salud.'));
      item.append(note);
    }
    if (data.intent === 'urgent') {
      item.classList.add('move-ai-urgent');
      const call = el('a','move-ai-primary','Llamar al SAMU · 131'); call.href = 'tel:131'; item.append(call);
      const source = el('a','move-ai-source','Cuándo acudir a urgencias · MINSAL');
      source.href = 'https://www.minsal.cl/servicios-de-urgencia-cuando-asistir-a-un-recinto-de-atencion-primaria-o-a-un-hospital/';
      source.target = '_blank'; source.rel = 'noopener noreferrer'; item.append(source);
    }
    const follow = el('div','move-ai-suggestions');
    for (const text of data.followUp || []) follow.append(button(text, () => send(text)));
    if (follow.childElementCount) item.append(follow);
    scrollEnd();
  }
  async function send(text) {
    text = String(text || '').trim();
    if (busy || !text || text.length > 1000) return;
    if (history.length >= 14) {
      message('assistant','Llegamos al límite de esta conversación de prueba. Usa «Nueva conversación» para comenzar otra.'); return;
    }
    const input = document.getElementById('moveAIInput');
    const limit = document.getElementById('moveAIBudget');
    if (limit.value && !limit.checkValidity()) { limit.reportValidity(); return; }
    const budget = limit.value ? Number(limit.value) : null;
    if (input) input.value = '';
    const requestHistory = [...history, {role:'user',content:text}];
    message('user',text); setBusy(true); status('Consultando la IA…');
    const pending = el('p','move-ai-pending','Estoy revisando tu consulta y el catálogo…');
    pending.setAttribute('role','status'); document.getElementById('moveAIConversation').append(pending); scrollEnd();
    controller = new AbortController();
    const current = ++revision;
    const timer = setTimeout(() => controller?.abort(), 32000);
    try {
      if (location.protocol === 'file:') throw new Error('La IA requiere abrir la web publicada de MOVE.');
      const response = await fetch('/api/move-assistant', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:requestHistory,productRank:selectedRank,budget}), signal:controller.signal,
      });
      const data = await response.json();
      if (current !== revision) return;
      if (!response.ok || !data.message || !['ai','safety'].includes(data.source)) {
        const error = new Error(data.message || 'La IA no está disponible en este momento.');
        error.code = data.error; throw error;
      }
      history = [...requestHistory,{role:'assistant',content:data.message}];
      status(data.source === 'ai' ? 'IA conectada' : 'Orientación de seguridad', data.source === 'ai');
      present(data);
    } catch (error) {
      if (current !== revision) return;
      const activationRequired = error.code === 'AI_ACTIVATION_REQUIRED';
      status(activationRequired ? 'IA pendiente de activación' : 'IA no disponible');
      const note = el('div','move-ai-error'); note.setAttribute('role','alert');
      note.append(el('p','',activationRequired ? 'El asistente de IA está pendiente de activación. Mientras tanto, puedes explorar el catálogo con las preguntas guiadas.' : error.name === 'AbortError' ? 'La respuesta está tardando más de lo esperado. Puedes intentarlo de nuevo.' : 'No pudimos obtener una respuesta de la IA. Puedes reintentar o usar las preguntas guiadas.'));
      note.append(button('Reintentar',()=>{note.remove();send(text);}),button('Usar preguntas guiadas',guided));
      document.getElementById('moveAIConversation').append(note);
      if (input) input.value = text;
    } finally {
      clearTimeout(timer);
      if (current === revision) { pending.remove(); setBusy(false); controller = null; scrollEnd(); }
    }
  }
  function render(options = {}) {
    overlay.classList.add('move-ai-open');
    stage.replaceChildren();
    document.getElementById('msBack').classList.remove('show');
    document.getElementById('msStepLabel').textContent = 'Conversación · Catálogo y atención';
    document.getElementById('msVisualKicker').textContent = 'Hablemos de lo que buscas';
    document.getElementById('msVisualTitle').textContent = 'Una consulta. Un siguiente paso.';
    document.getElementById('msVisualText').textContent = 'Compara productos, aclara diferencias y encuentra el recorrido de atención que corresponde a tu consulta.';
    status('MOVE Select · Asistente IA');
    const heading = el('div','move-ai-heading');
    const title = el('h2','','¿Qué te gustaría encontrar?'); title.id = 'msTitle';
    heading.append(title,el('p','','Conversemos sobre productos, presupuesto o cómo acceder a kinesiología.'));
    const tools = el('div','move-ai-tools');
    tools.append(button('Nueva conversación',()=>window.openMoveSelect()),button('Preguntas guiadas',guided));
    heading.append(tools); stage.append(heading);
    const log = el('div','move-ai-conversation'); log.id = 'moveAIConversation';
    log.setAttribute('role','log'); log.setAttribute('aria-live','polite'); log.setAttribute('aria-label','Conversación con MOVE Select');
    stage.append(log);
    const opening = message('assistant',selectedRank
      ? `Estás mirando ${byRank(selectedRank).name}. Puedo ayudarte a entender sus características generales y comparar alternativas del catálogo. ¿Qué quieres saber?`
      : 'Hola, soy MOVE Select. Puedo ayudarte a comparar productos del catálogo o a conocer el paso hacia la agenda de kinesiología. ¿Qué estás buscando?');
    const suggestions = el('div','move-ai-suggestions');
    ['Busco bandas para entrenar en casa','¿Qué diferencia hay entre los foam rollers?','Ya tengo derivación a kinesiología'].forEach(t=>suggestions.append(button(t,()=>send(t))));
    opening.append(suggestions);
    const form = el('form','move-ai-form');
    const budgetLabel = el('label','move-ai-budget','Máximo por producto (opcional)'); budgetLabel.htmlFor = 'moveAIBudget';
    const budget = el('input'); budget.id = 'moveAIBudget'; budget.type = 'number'; budget.min = '1'; budget.max = '10000000'; budget.step = '1'; budget.placeholder = 'CLP · ej. 20000'; budget.inputMode = 'numeric'; budgetLabel.append(budget);
    form.append(budgetLabel);
    const label = el('label','move-ai-input-label','Tu consulta'); label.htmlFor = 'moveAIInput'; form.append(label);
    const composer = el('div','move-ai-composer');
    const input = el('textarea'); input.id = 'moveAIInput'; input.maxLength = 1000; input.rows = 2;
    input.placeholder = 'Ej.: Quiero comparar bandas por menos de $20.000'; input.value = options.text || '';
    input.setAttribute('aria-describedby','moveAIPrivacy');
    input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();form.requestSubmit();}});
    const submit = el('button','move-ai-primary','Enviar'); submit.type='submit'; submit.id='moveAISend';
    composer.append(input,submit); form.append(composer);
    const privacy = el('p','move-ai-privacy','Al enviar, compartes esta conversación con un servicio de IA. Prueba con ejemplos ficticios; no incluyas nombres, RUT, exámenes ni documentos clínicos. La IA puede equivocarse.');
    privacy.id='moveAIPrivacy'; form.append(privacy);
    form.addEventListener('submit',event=>{event.preventDefault();send(input.value);}); stage.append(form);
    setTimeout(()=>input.focus(),50);
  }
  window.openMoveSelect = function(options = {}) {
    abort(); history=[]; selectedRank=byRank(options.productRank)?.rank || null; lastFocus=document.activeElement;
    originalOpen(options); render(options);
  };
  window.closeMoveSelect = function() {
    abort(); history=[]; originalClose(); overlay.classList.remove('move-ai-open');
    lastFocus?.focus?.();
  };
  overlay.addEventListener('keydown',event=>{
    if(event.key !== 'Tab' || !overlay.classList.contains('open')) return;
    const nodes = [...overlay.querySelectorAll('a[href],button:not([disabled]),input,textarea')].filter(n=>n.getClientRects().length);
    if (!nodes.length) return;
    if(event.shiftKey&&document.activeElement===nodes[0]){event.preventDefault();nodes.at(-1).focus();}
    else if(!event.shiftKey&&document.activeElement===nodes.at(-1)){event.preventDefault();nodes[0].focus();}
  });
  // This tile was informational in the initial prototype; it now opens Select.
  const service = document.querySelector('.service-stack .service-card');
  if(service){const action=service.querySelector(':scope > span');if(action)action.replaceWith(button('Consultar a MOVE Select',()=>window.openMoveSelect(),'move-ai-service-button'));}
})();
