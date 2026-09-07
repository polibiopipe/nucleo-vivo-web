(() => {
  'use strict';
  // The demo notice wraps at narrow widths and when text is enlarged.
  const updateHeaderOffset = () => {
    const height = ['.nv-demo-bar', '.utility'].reduce((sum, selector) => sum + (document.querySelector(selector)?.getBoundingClientRect().height || 0), 0);
    document.documentElement.style.setProperty('--move-header-offset', `${height}px`);
  };
  updateHeaderOffset();
  if (typeof ResizeObserver !== 'undefined') {
    const headerObserver = new ResizeObserver(updateHeaderOffset);
    document.querySelectorAll('.nv-demo-bar,.utility').forEach(element => headerObserver.observe(element));
  }
  const selected = new Set();
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const action = (text, fn, className = 'move-compare-button') => {
    const button = make('button', className, text);
    button.type = 'button'; button.addEventListener('click', fn); return button;
  };
  const category = product => ({ Ortopedia: 'Ortopedia', Recupera: 'Recuperación', Entrena: 'Entrenamiento' }[product.category] || product.category);
  function checkBeforeChoosing(product) {
    if (product.check) return product.check;
    if (/banda/i.test(product.name)) return 'Rango de resistencia, medidas y material indicados por el fabricante.';
    if (/foam|roller/i.test(product.name)) return 'Longitud, diámetro, textura y firmeza indicados por el fabricante.';
    if (product.category === 'Ortopedia') return 'Talla, medidas y tipo de soporte. Si hay lesión, consulta su indicación con un profesional.';
    return 'Medidas, materiales y condiciones de uso indicadas por el fabricante.';
  }
  const tray = make('aside', 'move-compare-tray'); tray.hidden = true; tray.setAttribute('aria-label', 'Productos para comparar');
  const trayText = make('span', ''); trayText.setAttribute('role', 'status');
  const openButton = action('Ver comparación', openComparison, 'move-compare-primary');
  tray.append(trayText, openButton, action('Vaciar', () => { selected.clear(); refresh(); }));
  document.body.append(tray);

  const dialog = make('dialog', 'move-compare-dialog');
  dialog.setAttribute('aria-labelledby', 'moveCompareTitle');
  const dialogHead = make('header', 'move-compare-head');
  const title = make('h2', '', 'Elige con las diferencias a la vista.'); title.id = 'moveCompareTitle';
  dialogHead.append(title, action('Cerrar', () => dialog.close()));
  const intro = make('p', 'move-compare-note', 'Precios de demostración. Las fichas técnicas y la disponibilidad están pendientes de validación con MOVE.');
  const content = make('div', 'move-compare-scroll');
  const dialogFoot = make('footer', 'move-compare-footer');
  dialogFoot.append(action('Seguir eligiendo', () => dialog.close()), action('Consultar diferencias a la IA', () => {
    const names = [...selected].map(rank => byRank(rank).name);
    dialog.close();
    openMoveSelect({ text: `Quiero comparar estos productos: ${names.join(', ')}. ¿Qué diferencias generales debo revisar?` });
  }, 'move-compare-primary'));
  dialog.append(dialogHead, intro, content, dialogFoot); document.body.append(dialog);
  let previousFocus;
  dialog.addEventListener('close', () => { document.body.classList.remove('move-comparing'); previousFocus?.focus(); });
  function refresh() {
    tray.hidden = selected.size === 0;
    trayText.textContent = `${selected.size} de 3 productos seleccionados`;
    openButton.disabled = selected.size < 2;
    document.body.classList.toggle('move-has-comparison', selected.size > 0);
    document.querySelectorAll('[data-compare-rank]').forEach(button => {
      const active = selected.has(Number(button.dataset.compareRank));
      button.setAttribute('aria-pressed', String(active));
      if (!button.classList.contains('wish')) button.textContent = active ? 'En comparación ✓' : 'Comparar';
    });
  }
  function toggle(rank) {
    if (!byRank(rank)) return;
    if (selected.has(rank)) selected.delete(rank);
    else if (selected.size < 3) selected.add(rank);
    else { showToast('Puedes comparar hasta tres productos. Quita uno para añadir otro.'); return; }
    refresh();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-compare-rank]');
    if (button) { event.preventDefault(); toggle(Number(button.dataset.compareRank)); }
  });
  document.addEventListener('move:products-rendered', refresh);
  function openComparison() {
    if (selected.size < 2) return;
    const items = [...selected].map(byRank);
    const table = make('table', 'move-compare-table');
    const caption = make('caption', 'sr-only', 'Comparación de productos seleccionados'); table.append(caption);
    const header = make('thead'); const heading = make('tr');
    const first = make('th', '', 'Producto'); first.scope = 'col'; heading.append(first);
    items.forEach(product => {
      const cell = make('th'); cell.scope = 'col';
      const img = make('img'); img.src = imageFor(product); img.alt = '';
      cell.append(img, make('span', '', product.name)); heading.append(cell);
    });
    header.append(heading); table.append(header);
    const body = make('tbody');
    for (const [label, value] of [
      ['Precio referencial', product => product.price], ['Categoría', category], ['Antes de elegir', checkBeforeChoosing],
    ]) {
      const row = make('tr'); const labelCell = make('th', '', label); labelCell.scope = 'row'; row.append(labelCell);
      items.forEach(product => row.append(make('td', '', value(product)))); body.append(row);
    }
    const last = make('tr'); const lastLabel = make('th', '', 'Tu selección'); lastLabel.scope = 'row'; last.append(lastLabel);
    items.forEach(product => {
      const cell = make('td'); cell.append(action('Agregar a la bolsa', () => { dialog.close(); addProduct(product); }, 'move-compare-primary')); last.append(cell);
    });
    body.append(last); table.append(body); content.replaceChildren(table);
    previousFocus = document.activeElement;
    closeOverlays(); closeSearch();
    document.body.classList.add('move-comparing'); dialog.showModal();
  }

  // Make the existing editorial cards open the question they promise.
  const questions = [
    '¿Qué diferencias generales hay entre una rodillera de compresión y una estabilizadora?',
    '¿Qué datos del fabricante debo revisar al comparar bandas de resistencia?',
    '¿Qué diferencias de tamaño y textura hay entre los foam rollers del catálogo?',
  ];
  document.querySelectorAll('.story-card').forEach((card, index) => {
    const link = action('Consultar a MOVE Select →', () => openMoveSelect({ text: questions[index] }), 'move-story-action');
    card.querySelector('.story-content').append(link);
  });
  const business = document.querySelector('.service-card.light');
  if (business) {
    business.querySelector('span').remove();
    business.append(action('Consultar por una compra de equipo →', () => openMoveSelect({ text: 'Busco productos para equipar a un equipo. ¿Qué información necesito para preparar una cotización?' }), 'move-story-action'));
  }

  const originalSuccess = window.agendaRenderSuccess;
  window.agendaRenderSuccess = () => {
    originalSuccess();
    // Never copy name, email, phone, document, diagnosis or chat into this bridge.
    const result = window.MoveDemo.create({ date: agendaState.date, time: agendaState.time, modality: agendaState.modality });
    const box = make('div', 'agenda-note move-demo-receipt');
    if (result.saved) {
      const reference = document.querySelector('#agendaStage .agenda-summary-row b');
      if (reference) reference.textContent = result.request.id;
      box.append(make('strong', '', 'Ahora puedes verla desde el lado del equipo.'));
      box.append(make('p', '', 'Se creó una solicitud ficticia en este navegador. Sólo conserva fecha, horario y modalidad durante 24 horas; no incluye tus datos de contacto ni documentos.'));
      const link = make('a', 'agenda-primary', 'Ver solicitud en MOVE Gestión →');
      link.href = '/prototipos/move/gestion/#solicitudes-demo'; link.target = '_blank'; link.rel = 'noopener'; box.append(link);
    } else {
      box.append(make('p', '', 'Este navegador no permitió guardar la solicitud ficticia. Puedes recorrer MOVE Gestión con los ejemplos incluidos.'));
      const link = make('a', 'agenda-link', 'Abrir MOVE Gestión'); link.href = '/prototipos/move/gestion/'; box.append(link);
    }
    document.querySelector('#agendaStage .agenda-content').append(box);
  };
  refresh();
})();
