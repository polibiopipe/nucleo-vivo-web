const revealElements = document.querySelectorAll(".js-reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector(".site-header");
const splash = document.querySelector(".splash-screen");

if (reducedMotion) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.16 }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 80, 280)}ms`;
    revealObserver.observe(element);
  });
}

function updateHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

if (splash) {
  const visibleDuration = reducedMotion ? 120 : 2750;
  const removeDelay = reducedMotion ? 80 : 0;

  window.setTimeout(() => {
    window.setTimeout(() => {
      splash.remove();
      document.body.classList.remove("splash-active");
      document.body.classList.add("splash-complete");
    }, removeDelay);
  }, visibleDuration);
} else {
  document.body.classList.remove("splash-active");
  document.body.classList.add("splash-complete");
}
