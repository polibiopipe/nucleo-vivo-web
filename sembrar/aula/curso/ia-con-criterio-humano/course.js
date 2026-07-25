(() => {
  "use strict";
  const A = window.AulaViva;
  const COURSE = window.IA_COURSE;
  const lessons = COURSE.lessons;
  let progress = {};
  let currentIndex = 0;

  const $ = selector => document.querySelector(selector);
  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function lessonFromUrl() {
    const slug = new URLSearchParams(location.search).get("lesson");
    const index = lessons.findIndex(item => item.id === slug);
    return index >= 0 ? index : 0;
  }

  function updateUrl(lessonId) {
    const url = new URL(location.href);
    url.searchParams.set("lesson", lessonId);
    history.replaceState({}, "", url);
  }

  function completedCount() {
    return Object.values(progress).filter(item => item.status === "completed").length;
  }

  function updateProgressUi() {
    const percent = Math.round((completedCount() / lessons.length) * 100);
    $("#course-top-progress").textContent = `${percent}% completado`;
    $("#sidebar-progress-label").textContent = `${percent}%`;
    $("#sidebar-progress-bar").style.width = `${percent}%`;
  }

  function renderNav() {
    const nav = $("#module-nav");
    nav.innerHTML = "";
    COURSE.modules.forEach(module => {
      const moduleLessons = lessons.filter(lesson => lesson.moduleId === module.id);
      const completed = moduleLessons.filter(lesson => progress[lesson.id]?.status === "completed").length;
      const firstIndex = lessons.findIndex(lesson => lesson.moduleId === module.id);
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = `
        <span class="module-number">${escapeHtml(module.number)}</span>
        <span><strong>${escapeHtml(module.title)}</strong><small>${completed}/${moduleLessons.length} experiencias</small></span>
        <span aria-hidden="true">›</span>`;
      if (lessons[currentIndex].moduleId === module.id) button.setAttribute("aria-current", "step");
      button.addEventListener("click", () => showLesson(firstIndex));
      nav.appendChild(button);

      moduleLessons.forEach(lesson => {
        const lessonIndex = lessons.findIndex(item => item.id === lesson.id);
        const child = document.createElement("button");
        child.type = "button";
        child.style.paddingLeft = "34px";
        child.innerHTML = `
          <span class="module-number">${progress[lesson.id]?.status === "completed" ? "✓" : "·"}</span>
          <span><strong>${escapeHtml(lesson.title)}</strong><small>${escapeHtml(lesson.duration)}</small></span>
          <span aria-hidden="true"></span>`;
        if (lessonIndex === currentIndex) child.setAttribute("aria-current", "step");
        child.addEventListener("click", () => showLesson(lessonIndex));
        nav.appendChild(child);
      });
    });
  }

  function renderActivity(lesson) {
    const activity = lesson.activity || {};
    const saved = progress[lesson.id] || {};
    if (activity.type === "reflection") {
      return `
        <section class="lesson-card activity-card" aria-labelledby="activity-title">
          <p class="card-kicker">Práctica y transferencia</p>
          <h2 id="activity-title">${escapeHtml(activity.prompt)}</h2>
          <label class="aula-sr-only" for="activity-response">Respuesta de la práctica</label>
          <textarea class="reflection-input" id="activity-response" placeholder="Usa datos ficticios o categorías generales.">${escapeHtml(saved.response || "")}</textarea>
          <div class="confidence-row">
            <span>Poca seguridad</span>
            <input id="confidence-input" type="range" min="1" max="5" value="${saved.confidence || 3}" aria-label="Nivel de seguridad en la respuesta" />
            <span>Mucha seguridad</span>
          </div>
          <button class="button button-primary" id="save-activity" type="button">Guardar práctica</button>
          <p class="activity-feedback" id="activity-feedback" role="status" hidden></p>
        </section>`;
    }
    const options = (activity.options || []).map((option, index) => `
      <button class="activity-option" type="button" data-option="${index}">${escapeHtml(option.text)}</button>`).join("");
    return `
      <section class="lesson-card activity-card" aria-labelledby="activity-title">
        <p class="card-kicker">Decisión</p>
        <h2 id="activity-title">${escapeHtml(activity.prompt)}</h2>
        <div class="activity-options">${options}</div>
        <div class="confidence-row">
          <span>Poca seguridad</span>
          <input id="confidence-input" type="range" min="1" max="5" value="${saved.confidence || 3}" aria-label="Nivel de seguridad en la respuesta" />
          <span>Mucha seguridad</span>
        </div>
        <p class="activity-feedback" id="activity-feedback" role="status" hidden></p>
      </section>`;
  }

  function renderLesson() {
    const lesson = lessons[currentIndex];
    const module = COURSE.modules.find(item => item.id === lesson.moduleId);
    const frame = $("#lesson-frame");
    frame.innerHTML = `
      <div class="lesson-context">
        <span>Módulo ${escapeHtml(module.number)} · ${escapeHtml(module.title)}</span>
        <span>${escapeHtml(lesson.duration)}</span>
      </div>
      <h1>${escapeHtml(lesson.title)}</h1>
      <p class="lesson-objective"><strong>Al finalizar:</strong> ${escapeHtml(lesson.objective)}</p>
      <section class="lesson-card scenario-card">
        <p class="card-kicker">Proyecto Aurora</p>
        <h2>Situación</h2>
        <p>${escapeHtml(lesson.scenario)}</p>
      </section>
      <section class="lesson-card">
        <p class="card-kicker">Comprender</p>
        <h2>Ideas esenciales</h2>
        ${lesson.content.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </section>
      <section class="lesson-card">
        <p class="card-kicker">Recuperar</p>
        <h2>Lo que debes poder explicar</h2>
        <ul class="key-list">${lesson.keypoints.map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
      </section>
      ${renderActivity(lesson)}
      <details class="references-panel">
        <summary>Fuentes y referencias APA 7 de esta experiencia</summary>
        <ol>${lesson.references.map(reference => `<li>${escapeHtml(reference)}</li>`).join("")}</ol>
      </details>
      <div class="lesson-actions">
        <button id="previous-lesson" class="button button-quiet" type="button" ${currentIndex === 0 ? "disabled" : ""}>Anterior</button>
        <button id="complete-lesson" class="button button-primary" type="button">${progress[lesson.id]?.status === "completed" ? "Completada ✓" : "Marcar como completada"}</button>
        <button id="next-lesson" class="button button-quiet" type="button" ${currentIndex === lessons.length - 1 ? "disabled" : ""}>Siguiente</button>
      </div>`;

    wireActivity(lesson);
    $("#previous-lesson").addEventListener("click", () => showLesson(currentIndex - 1));
    $("#next-lesson").addEventListener("click", () => showLesson(currentIndex + 1));
    $("#complete-lesson").addEventListener("click", async () => {
      const response = $("#activity-response")?.value || progress[lesson.id]?.response || null;
      const confidence = Number($("#confidence-input")?.value || progress[lesson.id]?.confidence || 3);
      await A.saveProgress(lesson.id, { status: "completed", percent: 100, response, confidence });
      progress = await A.getProgress();
      updateProgressUi();
      renderNav();
      renderLesson();
      if (currentIndex < lessons.length - 1) {
        setTimeout(() => showLesson(currentIndex + 1), 350);
      }
    });
  }

  function wireActivity(lesson) {
    const feedback = $("#activity-feedback");
    const save = $("#save-activity");
    if (save) {
      save.addEventListener("click", async () => {
        const response = $("#activity-response").value.trim();
        const confidence = Number($("#confidence-input").value);
        if (response.length < 10) {
          feedback.hidden = false;
          feedback.textContent = "Escribe una respuesta un poco más desarrollada antes de guardarla.";
          return;
        }
        await A.saveProgress(lesson.id, { status: "in_progress", percent: 50, response, confidence });
        progress = await A.getProgress();
        feedback.hidden = false;
        feedback.textContent = "Práctica guardada. Puedes mejorarla antes de completar la experiencia.";
      });
    }

    document.querySelectorAll(".activity-option").forEach(button => {
      button.addEventListener("click", async () => {
        document.querySelectorAll(".activity-option").forEach(item => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        const index = Number(button.dataset.option);
        const option = lesson.activity.options[index];
        const confidence = Number($("#confidence-input").value);
        feedback.hidden = false;
        feedback.textContent = option.feedback;
        await A.saveProgress(lesson.id, {
          status: "in_progress",
          percent: option.correct ? 75 : 35,
          response: {
            selectedIndex: index,
            selectedText: option.text,
            correct: Boolean(option.correct)
          },
          confidence
        });
        progress = await A.getProgress();
      });
    });
  }

  function showLesson(index) {
    if (index < 0 || index >= lessons.length) return;
    currentIndex = index;
    updateUrl(lessons[index].id);
    renderNav();
    renderLesson();
    $("#lesson-content").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    $("#course-sidebar").classList.remove("is-open");
    $("#course-menu-button").setAttribute("aria-expanded", "false");
  }

  async function init() {
    A.applyAccessibility();
    const { user } = await A.getSession();
    if (!user) {
      location.href = "../../index.html";
      return;
    }
    const enrollment = await A.getEnrollment();
    if (!enrollment && !A.config.previewMode) {
      location.href = "../../index.html";
      return;
    }
    if (!enrollment && A.config.previewMode) await A.enroll();
    progress = await A.getProgress();
    currentIndex = lessonFromUrl();
    updateProgressUi();
    showLesson(currentIndex);
  }

  $("#course-menu-button").addEventListener("click", () => {
    const sidebar = $("#course-sidebar");
    const open = sidebar.classList.toggle("is-open");
    $("#course-menu-button").setAttribute("aria-expanded", String(open));
  });

  init().catch(error => {
    $("#lesson-frame").innerHTML = `
      <section class="lesson-card">
        <h1>No pudimos abrir el curso</h1>
        <p>${escapeHtml(error.message)}</p>
        <a class="button button-primary" href="../../index.html">Volver a Mi Aula</a>
      </section>`;
  });
})();
