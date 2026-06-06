const revealElements = document.querySelectorAll(".js-reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function showPage() {
  revealElements.forEach((element, index) => {
    if (!prefersReducedMotion) {
      element.style.transitionDelay = `${index * 140}ms`;
    }

    element.classList.add("is-visible");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", showPage);
} else {
  showPage();
}
