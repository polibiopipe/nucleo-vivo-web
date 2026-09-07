(() => {
  'use strict';
  const host = document.getElementById('moveDemoRequests');
  const make = (tag, className, text) => {
    const node = document.createElement(tag); if (className) node.className = className;
    if (text != null) node.textContent = text; return node;
  };
  function render() {
    host.hidden = currentRole !== 'juan' || document.getElementById('dashboardView').hidden;
    if (host.hidden) return;
    const requests = window.MoveDemo.list();
    const head = make('div', 'panel-head');
    const heading = make('div'); heading.append(make('h2', '', 'Solicitudes creadas desde la tienda'), make('p', '', `${requests.length} solicitudes de prueba · Este navegador · 24 horas`));
    const clear = make('button', '', 'Borrar pruebas'); clear.type = 'button'; clear.disabled = requests.length === 0;
    clear.addEventListener('click', () => { if (!window.MoveDemo.clear()) status.textContent = 'No se pudieron borrar las pruebas en este navegador.'; });
    head.append(heading, clear);
    const status = make('p', 'move-request-note', 'Este panel muestra el recorrido de una solicitud ficticia. No confirma citas ni contiene datos de pacientes.'); status.setAttribute('role', 'status');
    host.replaceChildren(head, status);
    if (!requests.length) {
      const empty = make('div', 'move-request-empty'); empty.append(make('p', '', 'Prepara una solicitud en la agenda de prueba y aparecerá aquí.'));
      const link = make('a', '', 'Ir a la tienda MOVE →'); link.href = '/prototipos/move/'; empty.append(link); host.append(empty);
    }
    for (const request of requests) {
      const row = make('article', 'move-request-row');
      const info = make('div'); info.append(make('small', '', request.id), make('h3', '', 'Paciente de demostración'));
      const day = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date(request.date + 'T12:00:00'));
      info.append(make('p', '', `${day} · ${request.time} · ${request.modality}`));
      const state = make('span', `status ${request.status === 'reviewed' ? 'ok' : 'pending'}`, request.status === 'reviewed' ? 'Revisada · demo' : 'Pendiente de revisión');
      const review = make('button', '', request.status === 'reviewed' ? 'Revisión registrada' : 'Marcar revisada · demo');
      review.type = 'button'; review.disabled = request.status === 'reviewed';
      review.addEventListener('click', () => { if (!window.MoveDemo.markReviewed(request.id)) status.textContent = 'No se pudo guardar la revisión de prueba.'; });
      row.append(info, state, review); host.append(row);
    }
  }
  window.renderMoveDemoRequests = render;
  window.addEventListener('move:demo-requests', render);
  window.addEventListener('storage', event => { if (event.key === window.MoveDemo.key || event.key === null) render(); });
  if (location.hash === '#solicitudes-demo') {
    enterRole('juan');
    host.tabIndex = -1; host.focus(); host.scrollIntoView({ block: 'start' });
  } else render();
})();
