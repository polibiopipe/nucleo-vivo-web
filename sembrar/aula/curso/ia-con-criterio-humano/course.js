(() => {
  "use strict";

  const A = window.AulaViva;
  const COURSE = window.IA_COURSE;
  const lessons = COURSE.lessons;
  const PEDAGOGY_SCHEMA = "aula-viva-pedagogy-v1";
  let progress = {};
  let currentIndex = 0;

  const $ = selector => document.querySelector(selector);
  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const wordCount = (value = "") => {
    const normalized = String(value).trim();
    return normalized ? normalized.split(/\s+/u).length : 0;
  };

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

  function isModelExperience(lesson) {
    return lesson.pedagogyVersion === "1.1" && Array.isArray(lesson.studySections);
  }

  function normalizePedagogicalState(lesson) {
    const saved = progress[lesson.id] || {};
    const raw = saved.response;
    const base = {
      schemaVersion: PEDAGOGY_SCHEMA,
      selectedIndex: null,
      correct: false,
      attempts: 0,
      feedbackReviewed: false,
      response: "",
      wordCount: 0,
      criteriaReviewed: [],
      modelAnswerViewed: false,
      savedDraft: false,
      activityStarted: false
    };

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const migrated = {
        ...base,
        ...raw,
        selectedIndex: Number.isInteger(raw.selectedIndex) ? raw.selectedIndex : null,
        correct: Boolean(raw.correct),
        attempts: Number(raw.attempts || (Number.isInteger(raw.selectedIndex) ? 1 : 0)),
        feedbackReviewed: Boolean(raw.feedbackReviewed),
        response: typeof raw.response === "string"
          ? raw.response
          : typeof raw.selectedText === "string"
            ? raw.selectedText
            : "",
        criteriaReviewed: Array.isArray(raw.criteriaReviewed) ? raw.criteriaReviewed : [],
        modelAnswerViewed: Boolean(raw.modelAnswerViewed),
        savedDraft: Boolean(raw.savedDraft || (lesson.activity?.type === "reflection" && raw.response)),
        activityStarted: Boolean(raw.activityStarted || raw.response || Number.isInteger(raw.selectedIndex))
      };
      migrated.wordCount = Number.isFinite(raw.wordCount)
        ? Number(raw.wordCount)
        : wordCount(migrated.response);
      return migrated;
    }

    if (typeof raw === "string") {
      return {
        ...base,
        response: raw,
        wordCount: wordCount(raw),
        savedDraft: Boolean(raw.trim()),
        activityStarted: Boolean(raw.trim())
      };
    }

    return base;
  }

  function completionState(lesson, state = normalizePedagogicalState(lesson)) {
    if (!isModelExperience(lesson)) return { ready: true, reasons: [] };
    const activity = lesson.activity || {};

    if (activity.type === "decision") {
      const reasons = [];
      if (!Number.isInteger(state.selectedIndex)) reasons.push("Selecciona una respuesta.");
      if (Number.isInteger(state.selectedIndex) && !state.correct) reasons.push("Vuelve a intentar hasta identificar la respuesta correcta.");
      if (!state.feedbackReviewed) reasons.push("Revisa el criterio esperado.");
      return { ready: state.correct && state.feedbackReviewed, reasons };
    }

    const minimum = Number(activity.minimumWords || 0);
    const maximum = Number(activity.maximumWords || Number.POSITIVE_INFINITY);
    const requiredIds = (activity.requiredCriteria || []).map(item => item.id);
    const allCriteria = requiredIds.every(id => state.criteriaReviewed.includes(id));
    const reasons = [];
    if (!state.savedDraft) reasons.push("Guarda al menos un borrador.");
    if (state.wordCount < minimum) reasons.push(`Alcanza al menos ${minimum} palabras.`);
    if (state.wordCount > maximum) reasons.push(`Reduce la respuesta a un máximo de ${maximum} palabras.`);
    if (!allCriteria) reasons.push("Revisa los cinco criterios de VALOR.");
    if (!state.modelAnswerViewed || !state.feedbackReviewed) reasons.push("Compara tu trabajo con la respuesta modelo.");
    return {
      ready: state.savedDraft
        && state.wordCount >= minimum
        && state.wordCount <= maximum
        && allCriteria
        && state.modelAnswerViewed
        && state.feedbackReviewed,
      reasons
    };
  }

  async function savePedagogicalState(lesson, patch, percent) {
    const current = normalizePedagogicalState(lesson);
    const next = {
      ...current,
      ...patch,
      schemaVersion: PEDAGOGY_SCHEMA
    };
    next.criteriaReviewed = Array.isArray(next.criteriaReviewed) ? [...new Set(next.criteriaReviewed)] : [];
    next.wordCount = wordCount(next.response);
    const currentStatus = progress[lesson.id]?.status;
    await A.saveProgress(lesson.id, {
      status: currentStatus === "completed" ? "completed" : "in_progress",
      percent,
      response: next,
      confidence: Number($("#confidence-input")?.value || progress[lesson.id]?.confidence || 3)
    });
    progress = await A.getProgress();
    updateProgressUi();
    return normalizePedagogicalState(lesson);
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

  function renderInstructions(instructions = []) {
    if (!instructions.length) return "";
    return `
      <div class="activity-instructions">
        <h3>Instrucciones</h3>
        <ol>${instructions.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
      </div>`;
  }

  function renderDecisionActivity(lesson, state) {
    const activity = lesson.activity;
    const hasSelection = Number.isInteger(state.selectedIndex);
    const feedbackClass = state.correct ? "is-correct" : "needs-review";
    const feedbackTitle = state.correct ? "Respuesta correcta" : "Necesita revisión";
    const selectedOption = hasSelection ? activity.options[state.selectedIndex] : null;
    const options = activity.options.map((option, index) => `
      <button
        class="activity-option${state.selectedIndex === index ? " is-selected" : ""}"
        type="button"
        data-option="${index}"
        aria-pressed="${state.selectedIndex === index ? "true" : "false"}"
      >
        <span class="option-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
        <span>${escapeHtml(option.text)}</span>
      </button>`).join("");

    return `
      <section class="lesson-card activity-card" aria-labelledby="activity-title">
        <p class="card-kicker">Actividad de decisión</p>
        <h2 id="activity-title">${escapeHtml(activity.prompt)}</h2>
        ${renderInstructions(activity.instructions)}
        <button class="button button-primary activity-start" id="start-activity" type="button"${state.activityStarted ? " hidden" : ""}>Comenzar actividad</button>
        <div id="decision-workspace"${state.activityStarted ? "" : " hidden"}>
          <div class="activity-options" role="group" aria-label="${escapeHtml(activity.prompt)}">${options}</div>
          <div class="confidence-row">
            <span>Poca seguridad</span>
            <input id="confidence-input" type="range" min="1" max="5" value="${progress[lesson.id]?.confidence || 3}" aria-label="Nivel de confianza en la respuesta" />
            <span>Mucha seguridad</span>
          </div>
          <p class="attempt-count">Intentos registrados: <strong>${state.attempts}</strong>. Los intentos sirven para aprender y no tienen penalización.</p>
          <div class="activity-feedback ${feedbackClass}" id="activity-feedback" role="status"${hasSelection ? "" : " hidden"}>
            <p class="feedback-heading"><span aria-hidden="true">${state.correct ? "✓" : "↻"}</span> <strong>${feedbackTitle}</strong></p>
            <p>${escapeHtml(selectedOption?.feedback || "")}</p>
            <p><strong>Criterio esperado:</strong> ${escapeHtml(activity.expectedCriterion)}</p>
            ${!state.correct && activity.reviewSection ? `<p class="review-pointer">Conviene volver a leer: <strong>${escapeHtml(activity.reviewSection)}</strong>.</p>` : ""}
            <div class="activity-feedback-actions">
              <button class="button button-quiet" id="review-decision-feedback" type="button"${state.feedbackReviewed ? " disabled" : ""}>${state.feedbackReviewed ? "Criterio revisado ✓" : "Revisar criterio esperado"}</button>
              ${!state.correct ? '<button class="button button-primary" id="retry-decision" type="button">Volver a intentar</button>' : ""}
            </div>
          </div>
        </div>
      </section>`;
  }

  function renderReflectionActivity(lesson, state) {
    const activity = lesson.activity;
    const criteria = activity.requiredCriteria || [];
    const countClass = state.wordCount > activity.maximumWords
      ? "is-over"
      : state.wordCount >= activity.minimumWords
        ? "is-ready"
        : "";

    return `
      <section class="lesson-card activity-card open-practice" aria-labelledby="activity-title">
        <p class="card-kicker">Práctica abierta</p>
        <h2 id="activity-title">${escapeHtml(activity.prompt)}</h2>
        ${renderInstructions(activity.instructions)}
        <p class="privacy-warning"><span aria-hidden="true">◇</span> <strong>Protege la información:</strong> utiliza solo datos ficticios o anonimizados. No incluyas nombres ni información real de personas u organizaciones.</p>
        <button class="button button-primary activity-start" id="start-activity" type="button"${state.activityStarted ? " hidden" : ""}>Comenzar actividad</button>
        <div id="reflection-workspace"${state.activityStarted ? "" : " hidden"}>
          <label class="reflection-label" for="activity-response">Tu análisis con los subtítulos V, A, L, O y R</label>
          <textarea class="reflection-input" id="activity-response" aria-describedby="word-guidance word-counter" placeholder="V — Valor esperado…">${escapeHtml(state.response)}</textarea>
          <div class="word-meta">
            <span id="word-guidance">Extensión esperada: ${activity.minimumWords} a ${activity.maximumWords} palabras.</span>
            <strong class="word-counter ${countClass}" id="word-counter" role="status">${state.wordCount} palabras</strong>
          </div>
          <div class="confidence-row">
            <span>Poca seguridad</span>
            <input id="confidence-input" type="range" min="1" max="5" value="${progress[lesson.id]?.confidence || 3}" aria-label="Nivel de confianza en la respuesta" />
            <span>Mucha seguridad</span>
          </div>
          <div class="activity-primary-actions">
            <button class="button button-primary" id="save-activity" type="button">Guardar borrador</button>
            ${state.savedDraft ? '<button class="button button-quiet" id="improve-response" type="button">Mejorar respuesta</button>' : ""}
          </div>
          <p class="activity-save-status" id="activity-save-status" role="status">${state.savedDraft ? `Último borrador guardado: ${state.wordCount} palabras.` : ""}</p>
          ${state.savedDraft ? `
            <div class="self-review">
              <button class="button button-quiet" id="open-criteria" type="button" aria-expanded="${state.criteriaReviewed.length ? "true" : "false"}" aria-controls="criteria-panel">Revisar criterios</button>
              <fieldset id="criteria-panel"${state.criteriaReviewed.length ? "" : " hidden"}>
                <legend>Autoevaluación VALOR</legend>
                <p>Marca cada criterio después de comprobarlo en tu borrador. Esta revisión es tuya; la plataforma no evalúa semánticamente el texto.</p>
                ${criteria.map(criterion => `
                  <label class="criterion-row">
                    <input type="checkbox" value="${escapeHtml(criterion.id)}"${state.criteriaReviewed.includes(criterion.id) ? " checked" : ""} />
                    <span><strong>${escapeHtml(criterion.label)}</strong>${criterion.description ? `<small>${escapeHtml(criterion.description)}</small>` : ""}</span>
                  </label>`).join("")}
              </fieldset>
            </div>
            <div class="model-answer-control">
              <button class="button button-quiet" id="view-model-answer" type="button" aria-expanded="${state.modelAnswerViewed ? "true" : "false"}" aria-controls="model-answer">${state.modelAnswerViewed ? "Respuesta modelo revisada ✓" : "Comparar con respuesta modelo"}</button>
              <div class="model-answer" id="model-answer"${state.modelAnswerViewed ? "" : " hidden"}>
                <h3>Respuesta modelo para comparar</h3>
                ${activity.modelAnswer.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}
                <p class="model-answer-note">Úsala como contraste, no como plantilla única. Puedes volver a tu borrador y mejorarlo.</p>
              </div>
            </div>` : ""}
        </div>
      </section>`;
  }

  function renderLegacyActivity(lesson) {
    const activity = lesson.activity || {};
    const saved = progress[lesson.id] || {};
    if (activity.type === "reflection") {
      const response = typeof saved.response === "string" ? saved.response : "";
      return `
        <section class="lesson-card activity-card" aria-labelledby="activity-title">
          <p class="card-kicker">Práctica y transferencia</p>
          <h2 id="activity-title">${escapeHtml(activity.prompt)}</h2>
          <label class="aula-sr-only" for="activity-response">Respuesta de la práctica</label>
          <textarea class="reflection-input" id="activity-response" placeholder="Usa datos ficticios o categorías generales.">${escapeHtml(response)}</textarea>
          <div class="confidence-row">
            <span>Poca seguridad</span>
            <input id="confidence-input" type="range" min="1" max="5" value="${saved.confidence || 3}" aria-label="Nivel de confianza en la respuesta" />
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
          <input id="confidence-input" type="range" min="1" max="5" value="${saved.confidence || 3}" aria-label="Nivel de confianza en la respuesta" />
          <span>Mucha seguridad</span>
        </div>
        <p class="activity-feedback" id="activity-feedback" role="status" hidden></p>
      </section>`;
  }

  function renderActivity(lesson) {
    if (!isModelExperience(lesson)) return renderLegacyActivity(lesson);
    const state = normalizePedagogicalState(lesson);
    return lesson.activity?.type === "decision"
      ? renderDecisionActivity(lesson, state)
      : renderReflectionActivity(lesson, state);
  }

  function renderStudySections(lesson) {
    if (!Array.isArray(lesson.studySections)) {
      return `
        <section class="lesson-card">
          <p class="card-kicker">Comprender</p>
          <h2>Ideas esenciales</h2>
          ${(lesson.content || []).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </section>`;
    }

    return `
      <section class="lesson-card study-card" aria-labelledby="study-title">
        <p class="card-kicker">Estudiar</p>
        <h2 id="study-title">Material para estudiar</h2>
        ${lesson.studySections.map((section, index) => `
          <section class="study-section" aria-labelledby="study-${index}">
            <h3 id="study-${index}">${escapeHtml(section.title)}</h3>
            ${(section.paragraphs || []).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}
            ${section.questions?.length ? `
              <div class="guiding-questions">
                <h4>Preguntas orientadoras</h4>
                <ul>${section.questions.map(question => `<li>${escapeHtml(question)}</li>`).join("")}</ul>
              </div>` : ""}
            ${section.contrast ? `
              <div class="answer-contrast">
                <div class="contrast-insufficient">
                  <h4>Respuesta insuficiente</h4>
                  <p>“${escapeHtml(section.contrast.insufficient)}”</p>
                </div>
                <div class="contrast-adequate">
                  <h4>Respuesta adecuada</h4>
                  <p>“${escapeHtml(section.contrast.adequate)}”</p>
                </div>
              </div>` : ""}
          </section>`).join("")}
      </section>`;
  }

  function renderImage(lesson) {
    if (!lesson.image) return "";
    const loading = lesson.image.loading === "eager" ? "eager" : "lazy";
    return `
      <figure class="lesson-figure">
        <picture>
          ${lesson.image.webp ? `<source srcset="${escapeHtml(lesson.image.webp)}" type="image/webp" />` : ""}
          <img
            src="${escapeHtml(lesson.image.src)}"
            alt="${escapeHtml(lesson.image.alt)}"
            width="${Number(lesson.image.width)}"
            height="${Number(lesson.image.height)}"
            loading="${loading}"
            decoding="async"
          />
        </picture>
        ${lesson.image.caption ? `<figcaption>${escapeHtml(lesson.image.caption)}</figcaption>` : ""}
      </figure>`;
  }

  function renderWorkedExample(lesson) {
    if (!lesson.workedExample?.length) return "";
    return `
      <section class="lesson-card worked-example" aria-labelledby="worked-example-title">
        <p class="card-kicker">Ver el criterio en acción</p>
        <h2 id="worked-example-title">Ejemplo desarrollado</h2>
        ${lesson.workedExample.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </section>`;
  }

  function renderComparison(lesson) {
    if (!lesson.comparison?.rows?.length) return "";
    const columns = lesson.comparison.columns;
    return `
      <section class="lesson-card comparison-card" aria-labelledby="comparison-title">
        <p class="card-kicker">Comparar antes de decidir</p>
        <h2 id="comparison-title">${escapeHtml(lesson.comparison.title)}</h2>
        <div class="responsive-table" tabindex="0" role="region" aria-label="Comparación de tareas con el marco VALOR">
          <table>
            <caption>${escapeHtml(lesson.comparison.caption)}</caption>
            <thead><tr>${columns.map(column => `<th scope="col">${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
            <tbody>${lesson.comparison.rows.map(row => `
              <tr>${columns.map((column, index) => index === 0
                ? `<th scope="row">${escapeHtml(row[column.key])}</th>`
                : `<td>${escapeHtml(row[column.key])}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
      </section>`;
  }

  function renderReferences(lesson) {
    return `
      <details class="references-panel">
        <summary>Fuentes y referencias APA 7 de esta experiencia</summary>
        <ol>${(lesson.references || []).map(reference => {
          if (typeof reference === "string") return `<li>${escapeHtml(reference)}</li>`;
          return `
            <li>
              <span>${escapeHtml(reference.apa)}</span>
              ${reference.url ? `<a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir fuente externa: ${escapeHtml(reference.apa)}">Consultar fuente</a>` : ""}
            </li>`;
        }).join("")}</ol>
      </details>`;
  }

  function renderLesson(focusId = "") {
    const lesson = lessons[currentIndex];
    const module = COURSE.modules.find(item => item.id === lesson.moduleId);
    const frame = $("#lesson-frame");
    const state = normalizePedagogicalState(lesson);
    const completion = completionState(lesson, state);
    const completed = progress[lesson.id]?.status === "completed";
    const keypoints = lesson.keypoints || [];
    const summary = lesson.summary || [];

    frame.innerHTML = `
      <div class="lesson-context">
        <span>Módulo ${escapeHtml(module.number)} · ${escapeHtml(module.title)}</span>
        <span>${escapeHtml(lesson.duration)}</span>
      </div>
      <h1>${escapeHtml(lesson.title)}</h1>
      <p class="lesson-objective"><strong>Al finalizar:</strong> ${escapeHtml(lesson.objective)}</p>
      <section class="lesson-card scenario-card">
        <p class="card-kicker">Proyecto Aurora</p>
        <h2>Situación inicial</h2>
        <p>${escapeHtml(lesson.scenario)}</p>
      </section>
      ${renderImage(lesson)}
      ${renderStudySections(lesson)}
      ${renderWorkedExample(lesson)}
      ${renderComparison(lesson)}
      <section class="lesson-card">
        <p class="card-kicker">Recuperar</p>
        <h2>Lo que debes poder explicar</h2>
        <ul class="key-list">${keypoints.map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
      </section>
      ${renderActivity(lesson)}
      ${summary.length ? `
        <section class="lesson-card synthesis-card" aria-labelledby="synthesis-title">
          <p class="card-kicker">Cerrar y transferir</p>
          <h2 id="synthesis-title">Síntesis final</h2>
          ${summary.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </section>` : ""}
      ${renderReferences(lesson)}
      <div class="completion-requirements" id="completion-requirements" role="status">
        ${isModelExperience(lesson) && !completed
          ? completion.ready
            ? "<strong>Actividad lista.</strong> Ya puedes completar la experiencia."
            : `<strong>Antes de completar:</strong><ul>${completion.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>`
          : ""}
      </div>
      <div class="lesson-actions">
        <button id="previous-lesson" class="button button-quiet" type="button" ${currentIndex === 0 ? "disabled" : ""}>Anterior</button>
        <button id="complete-lesson" class="button button-primary" type="button"${isModelExperience(lesson) && !completion.ready && !completed ? " disabled" : ""}>${completed ? "Experiencia completada ✓" : "Marcar experiencia como completada"}</button>
        <button id="next-lesson" class="button button-quiet" type="button" ${currentIndex === lessons.length - 1 ? "disabled" : ""}>Siguiente</button>
      </div>`;

    wireActivity(lesson);
    $("#previous-lesson").addEventListener("click", () => showLesson(currentIndex - 1));
    $("#next-lesson").addEventListener("click", () => showLesson(currentIndex + 1));
    $("#complete-lesson").addEventListener("click", async () => {
      if (isModelExperience(lesson)) {
        const latestState = normalizePedagogicalState(lesson);
        if (!completionState(lesson, latestState).ready) return;
        await A.saveProgress(lesson.id, {
          status: "completed",
          percent: 100,
          response: latestState,
          confidence: Number($("#confidence-input")?.value || progress[lesson.id]?.confidence || 3)
        });
      } else {
        const response = $("#activity-response")?.value || progress[lesson.id]?.response || null;
        const confidence = Number($("#confidence-input")?.value || progress[lesson.id]?.confidence || 3);
        await A.saveProgress(lesson.id, { status: "completed", percent: 100, response, confidence });
      }
      progress = await A.getProgress();
      updateProgressUi();
      renderNav();
      renderLesson("complete-lesson");
    });

    if (focusId) {
      requestAnimationFrame(() => document.getElementById(focusId)?.focus({ preventScroll: true }));
    }
  }

  function updateCompletionControl(lesson, state) {
    const control = $("#complete-lesson");
    const requirements = $("#completion-requirements");
    if (!control || !requirements || progress[lesson.id]?.status === "completed") return;
    if ($("#activity-response")?.dataset.dirty === "true") {
      control.disabled = true;
      requirements.innerHTML = "<strong>Cambios sin guardar.</strong> Guarda nuevamente el borrador antes de completar.";
      return;
    }
    const completion = completionState(lesson, state);
    control.disabled = !completion.ready;
    requirements.innerHTML = completion.ready
      ? "<strong>Actividad lista.</strong> Ya puedes completar la experiencia."
      : `<strong>Antes de completar:</strong><ul>${completion.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>`;
  }

  function wireDecisionActivity(lesson) {
    const start = $("#start-activity");
    start?.addEventListener("click", () => {
      start.hidden = true;
      $("#decision-workspace").hidden = false;
      document.querySelector(".activity-option")?.focus({ preventScroll: true });
    });

    document.querySelectorAll(".activity-option").forEach(button => {
      button.addEventListener("click", async () => {
        const index = Number(button.dataset.option);
        const option = lesson.activity.options[index];
        const state = normalizePedagogicalState(lesson);
        await savePedagogicalState(lesson, {
          activityStarted: true,
          selectedIndex: index,
          correct: Boolean(option.correct),
          attempts: state.attempts + 1,
          feedbackReviewed: false,
          response: option.text
        }, option.correct ? 75 : 35);
        renderNav();
        renderLesson(`decision-option-${index}`);
      });
      button.id = `decision-option-${button.dataset.option}`;
    });

    $("#review-decision-feedback")?.addEventListener("click", async () => {
      const state = await savePedagogicalState(lesson, { feedbackReviewed: true }, 80);
      renderNav();
      renderLesson(state.correct ? "complete-lesson" : "retry-decision");
    });

    $("#retry-decision")?.addEventListener("click", async () => {
      await savePedagogicalState(lesson, {
        activityStarted: true,
        selectedIndex: null,
        correct: false,
        feedbackReviewed: false,
        response: ""
      }, 25);
      renderNav();
      renderLesson("decision-option-0");
    });
  }

  function wireReflectionActivity(lesson) {
    const activity = lesson.activity;
    const start = $("#start-activity");
    start?.addEventListener("click", () => {
      start.hidden = true;
      $("#reflection-workspace").hidden = false;
      $("#activity-response")?.focus({ preventScroll: true });
    });

    const response = $("#activity-response");
    response?.addEventListener("input", () => {
      const count = wordCount(response.value);
      response.dataset.dirty = "true";
      const counter = $("#word-counter");
      counter.textContent = `${count} ${count === 1 ? "palabra" : "palabras"}`;
      counter.classList.toggle("is-ready", count >= activity.minimumWords && count <= activity.maximumWords);
      counter.classList.toggle("is-over", count > activity.maximumWords);
      const complete = $("#complete-lesson");
      if (complete && progress[lesson.id]?.status !== "completed") complete.disabled = true;
      const requirements = $("#completion-requirements");
      if (requirements) requirements.innerHTML = "<strong>Cambios sin guardar.</strong> Guarda nuevamente el borrador antes de completar.";
    });

    $("#save-activity")?.addEventListener("click", async () => {
      const text = response.value.trim();
      const status = $("#activity-save-status");
      if (!text) {
        status.classList.add("is-error");
        status.textContent = "Escribe un borrador antes de guardarlo.";
        status.setAttribute("role", "alert");
        return;
      }
      const count = wordCount(text);
      const state = await savePedagogicalState(lesson, {
        activityStarted: true,
        savedDraft: true,
        response: text,
        wordCount: count
      }, count >= activity.minimumWords && count <= activity.maximumWords ? 65 : 45);
      renderNav();
      renderLesson("save-activity");
      const refreshedStatus = $("#activity-save-status");
      if (count < activity.minimumWords) {
        refreshedStatus.textContent = `Borrador guardado con ${count} palabras. Necesitas al menos ${activity.minimumWords} para completar.`;
      } else if (count > activity.maximumWords) {
        refreshedStatus.textContent = `Borrador guardado con ${count} palabras. Redúcelo a un máximo de ${activity.maximumWords}.`;
      } else {
        refreshedStatus.textContent = `Borrador guardado con ${count} palabras. Continúa con la autoevaluación y la respuesta modelo.`;
      }
      updateCompletionControl(lesson, state);
    });

    $("#improve-response")?.addEventListener("click", () => {
      response.focus({ preventScroll: true });
      $("#activity-save-status").textContent = "Puedes editar tu borrador. Recuerda guardarlo nuevamente antes de completar.";
    });

    $("#open-criteria")?.addEventListener("click", event => {
      const panel = $("#criteria-panel");
      panel.hidden = !panel.hidden;
      event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden) panel.querySelector("input")?.focus({ preventScroll: true });
    });

    document.querySelectorAll(".criterion-row input").forEach(input => {
      input.addEventListener("change", async () => {
        const reviewed = [...document.querySelectorAll(".criterion-row input:checked")].map(item => item.value);
        const state = await savePedagogicalState(lesson, { criteriaReviewed: reviewed }, 75);
        updateCompletionControl(lesson, state);
        $("#activity-save-status").textContent = `${reviewed.length} de ${activity.requiredCriteria.length} criterios revisados.`;
      });
    });

    $("#view-model-answer")?.addEventListener("click", async event => {
      const model = $("#model-answer");
      model.hidden = false;
      event.currentTarget.setAttribute("aria-expanded", "true");
      event.currentTarget.textContent = "Respuesta modelo revisada ✓";
      const state = await savePedagogicalState(lesson, {
        modelAnswerViewed: true,
        feedbackReviewed: true
      }, 90);
      updateCompletionControl(lesson, state);
      model.setAttribute("tabindex", "-1");
      model.focus({ preventScroll: true });
    });
  }

  function wireLegacyActivity(lesson) {
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

  function wireActivity(lesson) {
    if (!isModelExperience(lesson)) {
      wireLegacyActivity(lesson);
      return;
    }
    if (lesson.activity?.type === "decision") wireDecisionActivity(lesson);
    else wireReflectionActivity(lesson);
  }

  function showLesson(index) {
    if (index < 0 || index >= lessons.length) return;
    currentIndex = index;
    updateUrl(lessons[index].id);
    renderNav();
    renderLesson();
    $("#lesson-content").focus({ preventScroll: true });
    const reducedMotion = document.documentElement.classList.contains("aula-reduced-motion")
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
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
    if (A.hasSupabase) await A.syncPreviewProgress();
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
        <p>${escapeHtml(A.friendlyError ? A.friendlyError(error) : error.message)}</p>
        <a class="button button-primary" href="../../index.html">Volver a Mi Aula</a>
      </section>`;
  });
})();
