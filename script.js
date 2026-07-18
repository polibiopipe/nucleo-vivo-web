const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll(".js-reveal");
const header = document.querySelector(".site-header");
const splash = document.querySelector(".splash-screen");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
const splashWasShown = window.sessionStorage?.getItem("nucleoVivoSplashShown") === "true";
const shouldSkipSplash = splashWasShown || reducedMotion || Boolean(window.location.hash);

if (window.location.protocol === "file:") {
  document.querySelectorAll("[data-local-href]").forEach((link) => {
    link.setAttribute("href", link.dataset.localHref);
  });
}

function showPage() {
  splash?.remove();
  document.body.classList.remove("splash-active");
  document.body.classList.add("splash-complete");
}

if (splash) {
  if (shouldSkipSplash) {
    window.sessionStorage?.setItem("nucleoVivoSplashShown", "true");
    showPage();
  } else {
    window.setTimeout(() => {
      window.sessionStorage?.setItem("nucleoVivoSplashShown", "true");
      showPage();
    }, reducedMotion ? 120 : 2750);
  }
} else {
  showPage();
}

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -7% 0px", threshold: 0.12 }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
    revealObserver.observe(element);
  });
}

function updateHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

function closeMenu() {
  if (!menuToggle || !mainNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menú");
  menuToggle.setAttribute("title", "Abrir menú");
  mainNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
  menuToggle.setAttribute("title", isOpen ? "Abrir menú" : "Cerrar menú");
  mainNav?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1160) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mainNav?.classList.contains("is-open")) {
    closeMenu();
    menuToggle?.focus();
  }
});

const articleButtons = document.querySelectorAll("[data-article]");
const articleDialogs = document.querySelectorAll(".article-dialog");

articleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.article);
    if (!(dialog instanceof HTMLDialogElement)) return;

    dialog.scrollTop = 0;
    document.body.classList.add("modal-open");

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  });
});

articleDialogs.forEach((dialog) => {
  const closeButton = dialog.querySelector("[data-close-dialog]");

  function closeDialog() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      document.body.classList.remove("modal-open");
    }
  }

  closeButton?.addEventListener("click", closeDialog);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
  });
});
