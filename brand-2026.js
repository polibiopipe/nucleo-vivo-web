/* Progressive enhancement for Núcleo Vivo's public pages. */
(() => {
  const exhibition = document.querySelector('.nv-products');
  if (exhibition) {
    const tablist = exhibition.querySelector('.nv-product-tabs');
    const tabs = [...tablist.querySelectorAll('button')];
    const panels = [...exhibition.querySelectorAll('.nv-product-panel')];
    const activate = (selected, moveFocus = false) => {
      tabs.forEach((tab, index) => {
        const active = index === selected;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[index].hidden = !active;
      });
      if (moveFocus) tabs[selected].focus();
    };
    tablist.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[index].id);
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
      panels[index].tabIndex = 0;
      tab.addEventListener('click', () => activate(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % tabs.length;
        if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        activate(next, true);
      });
    });
    activate(0);
    exhibition.dataset.enhanced = '';
    const compact = window.matchMedia('(max-width: 640px)');
    const orientTabs = () => tablist.setAttribute('aria-orientation', compact.matches ? 'vertical' : 'horizontal');
    orientTabs();
    compact.addEventListener('change', orientTabs);
  }

  const header = document.querySelector('.nv-header');
  if (!header) return;
  const disclosures = [...header.querySelectorAll('details')];
  disclosures.forEach(details => details.addEventListener('toggle', () => {
    if (details.open) disclosures.filter(other => other !== details).forEach(other => other.open = false);
  }));
  document.addEventListener('click', event => {
    disclosures.filter(details => !details.contains(event.target)).forEach(details => details.open = false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    disclosures.filter(details => details.open).forEach(details => {
      details.open = false;
      details.querySelector('summary').focus();
    });
  });
  const menu = header.querySelector('#main-nav');
  const toggle = header.querySelector('.menu-toggle');
  const setMenuOpen = open => {
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    toggle.title = open ? 'Cerrar menú' : 'Abrir menú';
    if (!open) disclosures.forEach(details => details.open = false);
  };
  toggle.addEventListener('click', () => setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(anchor => anchor.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenuOpen(false);
      toggle.focus();
    }
  });
  header.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !menu.classList.contains('is-open')) return;
    const focusable = [...header.querySelectorAll('a,button,summary')].filter(el => el.getClientRects().length && !el.closest('details:not([open]) .nv-nav-panel'));
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  const wide = window.matchMedia('(min-width: 1025px)');
  wide.addEventListener('change', () => {
    if (wide.matches) setMenuOpen(false);
  });
})();
