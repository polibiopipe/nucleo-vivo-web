/* Manual exploration only: no automatic rotation or scroll interception. */
(() => {
  const cover = document.querySelector('[data-nv-curiosity]');
  if (!cover) return;
  const navigation = cover.querySelector('.nv-curiosity-choices');
  const choices = [...cover.querySelectorAll('[data-curiosity-choice]')];
  const panels = [...cover.querySelectorAll('[data-curiosity-panel]')];
  const scenes = [...cover.querySelectorAll('[data-curiosity-scene]')];
  if (choices.length !== panels.length || choices.length !== scenes.length) return;

  const activate = (index, focus = false) => {
    choices.forEach((choice, position) => {
      const selected = position === index;
      choice.classList.toggle('is-active', selected);
      choice.setAttribute('aria-selected', String(selected));
      choice.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
      scenes[position].classList.toggle('is-active', selected);
    });
    if (focus) choices[index].focus();
  };

  navigation.setAttribute('role', 'tablist');
  navigation.setAttribute('aria-label', 'Elige una pregunta para explorar');
  navigation.setAttribute('aria-orientation', 'horizontal');
  choices.forEach((choice, index) => {
    choice.setAttribute('role', 'tab');
    choice.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', choice.id);
    panels[index].tabIndex = 0;
    choice.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      activate(index);
    });
    choice.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % choices.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + choices.length) % choices.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = choices.length - 1;
      if (event.key === ' ' || event.key === 'Enter') next = index;
      if (next === undefined) return;
      event.preventDefault();
      activate(next, true);
    });
  });
  activate(0);
  cover.dataset.enhanced = '';
})();
