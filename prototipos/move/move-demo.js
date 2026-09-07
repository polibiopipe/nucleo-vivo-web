/* Same-browser demonstration bridge. Only synthetic, whitelisted fields persist. */
(() => {
  'use strict';
  const key = 'nv-move-demo-requests-v1';
  const lifetime = 24 * 60 * 60 * 1000;
  const times = ['09:00', '10:30', '12:00', '15:00', '16:30', '18:00'];
  const modalities = ['Presencial', 'Online', 'Indistinta'];
  function clean(value) {
    if (!value || !/^MOVE-DEMO-[A-Z0-9]{8}$/.test(value.id) ||
        !Number.isFinite(value.created) || value.created > Date.now() || Date.now() - value.created >= lifetime ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value.date) || !Number.isFinite(Date.parse(value.date)) ||
        !times.includes(value.time) || !modalities.includes(value.modality)) return null;
    return { id: value.id, created: value.created, date: value.date, time: value.time,
      modality: value.modality, status: value.status === 'reviewed' ? 'reviewed' : 'pending' };
  }
  function list() {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      const requests = Array.isArray(data) ? data.slice(0, 12).map(clean).filter(Boolean) : [];
      // Expired or tampered entries are removed on the next page read.
      if (JSON.stringify(data) !== JSON.stringify(requests)) {
        if (requests.length) localStorage.setItem(key, JSON.stringify(requests));
        else localStorage.removeItem(key);
      }
      return requests;
    } catch { return []; }
  }
  function save(requests) {
    try {
      localStorage.setItem(key, JSON.stringify(requests));
      window.dispatchEvent(new Event('move:demo-requests'));
      return true;
    } catch { return false; }
  }
  function create(selection) {
    const request = clean({
      id: 'MOVE-DEMO-' + crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase(),
      created: Date.now(), date: selection.date, time: selection.time, modality: selection.modality,
    });
    if (!request) return { saved: false, request: null };
    return { saved: save([request, ...list()].slice(0, 12)), request };
  }
  function markReviewed(id) {
    const requests = list();
    if (!requests.some(request => request.id === id)) return false;
    return save(requests.map(request => request.id === id ? { ...request, status: 'reviewed' } : request));
  }
  function clear() {
    try {
      localStorage.removeItem(key);
      window.dispatchEvent(new Event('move:demo-requests'));
      return true;
    } catch { return false; }
  }
  window.MoveDemo = Object.freeze({ key, list, create, markReviewed, clear });
})();
