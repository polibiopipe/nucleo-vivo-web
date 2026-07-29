(() => {
  "use strict";

  const A = window.AulaViva;
  const COURSE = window.IA_COURSE;
  if (!A || !COURSE?.lessons?.length) return;
  const lessons = COURSE.lessons;
  const PEDAGOGY_SCHEMA = "aula-viva-pedagogy-v1";
  const COURSE_UI_KEY = `nv-aula-ui:${COURSE.slug}`;
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

  function readCourseUiState() {
    try {
      return JSON.parse(localStorage.getItem(COURSE_UI_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveCourseUiState(patch = {}) {
    const current = readCourseUiState();
    localStorage.setItem(COURSE_UI_KEY, JSON.stringify({ ...current, ...patch }));
  }

  function initialDecisionState(lesson) {
    return readCourseUiState().initialDecisions?.[lesson.id] ?? null;
  }

  function saveInitialDecision(lesson, selectedIndex) {
    const current = readCourseUiState();
    saveCourseUiState({
      initialDecisions: {
        ...(current.initialDecisions || {}),
        [lesson.id]: selectedIndex
      }
    });
  }

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
      activityStarted: false,
      videoCompleted: false
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
        activityStarted: Boolean(raw.activityStarted || raw.response || Number.isInteger(raw.selectedIndex)),
        videoCompleted: Boolean(raw.videoCompleted)
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
      if (lesson.video?.mandatory && !state.videoCompleted) reasons.push("Reproduce el video completo o revisa su transcripción accesible.");
      if (!Number.isInteger(state.selectedIndex)) reasons.push("Selecciona una respuesta.");
      if (Number.isInteger(state.selectedIndex) && !state.correct) reasons.push("Vuelve a intentar hasta identificar la respuesta correcta.");
      if (!state.feedbackReviewed) reasons.push("Revisa el criterio esperado.");
      return {
        ready: state.correct && state.feedbackReviewed && (!lesson.video?.mandatory || state.videoCompleted),
        reasons
      };
    }

    const minimum = Number(activity.minimumWords || 0);
    const maximum = Number(activity.maximumWords || Number.POSITIVE_INFINITY);
    const requiredIds = (activity.requiredCriteria || []).map(item => item.id);
    const allCriteria = requiredIds.every(id => state.criteriaReviewed.includes(id));
    const reasons = [];
    if (!state.savedDraft) reasons.push("Guarda al menos un borrador.");
    if (state.wordCount < minimum) reasons.push(`Alcanza al menos ${minimum} palabras.`);
    if (state.wordCount > maximum) reasons.push(`Reduce la respuesta a un máximo de ${maximum} palabras.`);
    if (!allCriteria) reasons.push(activity.criteriaRequirement || "Revisa todos los criterios de la actividad.");
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

  function renderPreStudyDecision(lesson) {
    const activity = lesson.preStudyDecision;
    if (!activity?.options?.length) return "";
    const selectedIndex = initialDecisionState(lesson);
    return `
      <section class="lesson-card initial-decision-card" aria-labelledby="initial-decision-title">
        <p class="card-kicker">Decisión inicial · sin calificación</p>
        <h2 id="initial-decision-title">${escapeHtml(activity.prompt)}</h2>
        <p>${escapeHtml(activity.note || "Registra una primera hipótesis antes de estudiar el contenido.")}</p>
        <div class="activity-options" role="group" aria-label="${escapeHtml(activity.prompt)}">
          ${activity.options.map((option, index) => `
            <button
              id="initial-decision-${index}"
              class="activity-option initial-decision-option${selectedIndex === index ? " is-selected" : ""}"
              type="button"
              data-initial-option="${index}"
              aria-pressed="${selectedIndex === index ? "true" : "false"}"
            >
              <span class="option-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
              <span>${escapeHtml(option)}</span>
            </button>`).join("")}
        </div>
        <p id="initial-decision-status" class="activity-save-status" role="status">
          ${Number.isInteger(selectedIndex)
            ? "Decisión inicial registrada. Puedes cambiarla; todavía no se ha calificado."
            : "El video se habilitará después de registrar una hipótesis provisional."}
        </p>
      </section>`;
  }

  function renderVideo(lesson) {
    const video = lesson.video;
    if (!video) return "";
    if (lesson.preStudyDecision && !Number.isInteger(initialDecisionState(lesson))) {
      return `
        <section class="lesson-card video-locked-card" aria-labelledby="video-locked-title">
          <p class="card-kicker">Caso narrativo</p>
          <h2 id="video-locked-title">${escapeHtml(video.title)}</h2>
          <p>Registra primero tu decisión inicial. El video aparecerá aquí sin recargar la página.</p>
        </section>`;
    }
    return `
      <section class="lesson-card video-lesson-card" aria-labelledby="video-title">
        <p class="card-kicker">Caso narrativo</p>
        <h2 id="video-title">${escapeHtml(video.title)}</h2>
        <p class="video-notice" id="video-notice">${escapeHtml(video.notice)}</p>
        <video
          id="course-video"
          controls
          playsinline
          preload="metadata"
          poster="${escapeHtml(video.poster)}"
          data-video-src="${escapeHtml(video.src)}"
          aria-describedby="video-notice video-description"
        >
          <track kind="captions" srclang="es" label="Español" src="${escapeHtml(video.captions)}" default />
          Tu navegador no puede reproducir este video. Usa la transcripción accesible disponible debajo.
        </video>
        <div class="video-controls-extra">
          <label for="video-speed">Velocidad</label>
          <select id="video-speed">
            <option value="0.75">0,75×</option>
            <option value="1" selected>1×</option>
            <option value="1.25">1,25×</option>
            <option value="1.5">1,5×</option>
            <option value="2">2×</option>
          </select>
          <span id="video-resume-status" role="status"></span>
        </div>
        <details class="video-description" id="video-description">
          <summary>Descripción de la información visual</summary>
          <p>${escapeHtml(video.description)}</p>
        </details>
        <p class="video-clarification"><strong>Distinción necesaria:</strong> ${escapeHtml(video.clarification)}</p>
        <div class="video-access-actions">
          <a class="button button-quiet resource-link" href="${escapeHtml(video.transcript)}" download>Descargar transcripción accesible</a>
          ${video.mandatory ? `
            <button class="button button-quiet resource-link" id="video-transcript-complete" type="button"${normalizePedagogicalState(lesson).videoCompleted ? " disabled" : ""}>
              ${normalizePedagogicalState(lesson).videoCompleted ? "Caso narrativo revisado ✓" : "He revisado la transcripción completa"}
            </button>` : ""}
        </div>
      </section>`;
  }

  function renderPostVideoQuestions(lesson) {
    if (!lesson.postVideoQuestions?.length) return "";
    return `
      <section class="lesson-card observation-card" aria-labelledby="observation-title">
        <p class="card-kicker">Observar antes de interpretar</p>
        <h2 id="observation-title">Tres preguntas para revisar el caso</h2>
        <ol>${lesson.postVideoQuestions.map(question => `<li>${escapeHtml(question)}</li>`).join("")}</ol>
        <p>No necesitas escribir una experiencia personal. Puedes responder mentalmente o en tu bitácora privada usando solo el caso de Andrea.</p>
      </section>`;
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
          <label class="reflection-label" for="activity-response">${escapeHtml(activity.responseLabel || "Tu respuesta")}</label>
          <textarea class="reflection-input" id="activity-response" aria-describedby="word-guidance word-counter" placeholder="${escapeHtml(activity.responsePlaceholder || "Escribe aquí tu borrador con datos ficticios o anonimizados.")}">${escapeHtml(state.response)}</textarea>
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
                <legend>${escapeHtml(activity.rubricTitle || "Autoevaluación")}</legend>
                <p>${escapeHtml(activity.rubricLead || "Marca cada criterio después de comprobarlo en tu borrador. Esta revisión es tuya; la plataforma no evalúa semánticamente el texto.")}</p>
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

  function renderInfographic(lesson) {
    const item = lesson.infographic;
    if (!item?.items?.length) return "";
    return `
      <figure class="lesson-card corrected-infographic" aria-labelledby="infographic-title">
        <figcaption>
          <p class="card-kicker">Infografía revisada</p>
          <h2 id="infographic-title">${escapeHtml(item.title)}</h2>
        </figcaption>
        <div class="infographic-stat">
          <strong>${escapeHtml(item.stat)}</strong>
          <div>
            <p>${escapeHtml(item.statLabel)}</p>
            <span>${escapeHtml(item.comparison)}</span>
          </div>
        </div>
        <p class="infographic-disclaimer">${escapeHtml(item.disclaimer)}</p>
        <div class="infographic-concepts">
          ${item.items.map(concept => `
            <section>
              <h3>${escapeHtml(concept.term)}</h3>
              <p>${escapeHtml(concept.description)}</p>
            </section>`).join("")}
        </div>
      </figure>`;
  }

  function renderSpacedPractice(lesson) {
    if (!lesson.spacedPractice?.length) return "";
    return `
      <section class="lesson-card spaced-practice-card" aria-labelledby="spaced-title">
        <p class="card-kicker">Recuperaciones espaciadas</p>
        <h2 id="spaced-title">Volver para recordar y decidir</h2>
        <div class="spaced-practice-grid">
          ${lesson.spacedPractice.map(item => `
            <article>
              <strong>${escapeHtml(item.day)}</strong>
              <h3>${escapeHtml(item.focus)}</h3>
              <p>${escapeHtml(item.product)}</p>
            </article>`).join("")}
        </div>
      </section>`;
  }

  function renderResources(lesson) {
    if (!lesson.resources?.length) return "";
    return `
      <section class="lesson-card lesson-resources" aria-labelledby="resources-title">
        <p class="card-kicker">Recursos</p>
        <h2 id="resources-title">Descargas de esta experiencia</h2>
        <div class="resource-grid">
          ${lesson.resources.map(resource => `
            <a class="resource-download" href="${escapeHtml(resource.href)}" download>
              <span aria-hidden="true">↓</span>
              <strong>${escapeHtml(resource.label)}</strong>
            </a>`).join("")}
        </div>
      </section>`;
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
    const videoReady = !lesson.video?.mandatory || state.videoCompleted;

    frame.innerHTML = `
      <div class="lesson-context">
        <span>Módulo ${escapeHtml(module.number)} · ${escapeHtml(module.title)}</span>
        <span>${escapeHtml(lesson.duration)}</span>
      </div>
      <h1>${escapeHtml(lesson.title)}</h1>
      <p class="lesson-objective"><strong>Al finalizar:</strong> ${escapeHtml(lesson.objective)}</p>
      <section class="lesson-card scenario-card">
        <p class="card-kicker">${escapeHtml(lesson.scenarioLabel || "Proyecto Aurora")}</p>
        <h2>Situación inicial</h2>
        <p>${escapeHtml(lesson.scenario)}</p>
      </section>
      ${renderPreStudyDecision(lesson)}
      ${renderVideo(lesson)}
      ${videoReady ? "" : `
        <section class="lesson-card video-followup-locked" aria-labelledby="video-followup-title">
          <p class="card-kicker">Secuencia protegida</p>
          <h2 id="video-followup-title">Primero revisa el caso narrativo</h2>
          <p>Las preguntas, la microlección y la actividad se habilitarán al terminar el video o confirmar que revisaste la transcripción accesible completa.</p>
        </section>`}
      <div id="post-video-learning"${videoReady ? "" : " hidden"}>
      ${renderPostVideoQuestions(lesson)}
      ${renderImage(lesson)}
      ${renderStudySections(lesson)}
      ${renderInfographic(lesson)}
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
      ${renderSpacedPractice(lesson)}
      ${renderResources(lesson)}
      ${renderReferences(lesson)}
      </div>
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
    wirePreStudyDecision(lesson);
    wireVideo(lesson);
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

  function wirePreStudyDecision(lesson) {
    document.querySelectorAll("[data-initial-option]").forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.initialOption);
        saveInitialDecision(lesson, index);
        renderLesson(`initial-decision-${index}`);
      });
    });
  }

  function wireVideo(lesson) {
    const video = $("#course-video");
    if (!video || !lesson.video) return;
    const mediaKey = `${COURSE_UI_KEY}:media:${lesson.id}`;
    const status = $("#video-resume-status");
    let lastSavedSecond = -1;

    const loadSource = () => {
      if (!video.src) {
        video.src = video.dataset.videoSrc;
        video.load();
      }
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        loadSource();
        observer.disconnect();
      }, { rootMargin: "240px" });
      observer.observe(video);
    } else {
      loadSource();
    }

    video.addEventListener("loadedmetadata", () => {
      const savedSecond = Number(localStorage.getItem(mediaKey) || 0);
      if (savedSecond > 2 && savedSecond < video.duration - 2) {
        video.currentTime = savedSecond;
        status.textContent = `Reanudado cerca de ${Math.floor(savedSecond / 60)}:${String(Math.floor(savedSecond % 60)).padStart(2, "0")}.`;
      }
    });

    const savePlaybackPoint = () => {
      const second = Math.floor(video.currentTime || 0);
      if (second === lastSavedSecond || !Number.isFinite(second)) return;
      lastSavedSecond = second;
      localStorage.setItem(mediaKey, String(second));
    };

    video.addEventListener("timeupdate", () => {
      if (Math.floor(video.currentTime || 0) % 5 === 0) savePlaybackPoint();
    });
    video.addEventListener("pause", savePlaybackPoint);
    video.addEventListener("ended", async () => {
      localStorage.removeItem(mediaKey);
      await savePedagogicalState(lesson, { videoCompleted: true }, 60);
      renderLesson("observation-title");
    });
    $("#video-speed")?.addEventListener("change", event => {
      video.playbackRate = Number(event.target.value);
      status.textContent = `Velocidad ${event.target.options[event.target.selectedIndex].text}.`;
    });
    $("#video-transcript-complete")?.addEventListener("click", async event => {
      event.currentTarget.disabled = true;
      await savePedagogicalState(lesson, { videoCompleted: true }, 60);
      renderLesson("observation-title");
    });
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
      document.querySelector("#decision-workspace [data-option]")?.focus({ preventScroll: true });
    });

    document.querySelectorAll("#decision-workspace [data-option]").forEach(button => {
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
    let { user } = await A.getSession();
    if (!user && A.config.localCourse && A.config.previewMode) {
      await A.signUp({
        email: "vista-previa@nucleovivo.cl",
        password: "vista-previa-local",
        name: "Participante de prueba",
        consent: true
      });
      ({ user } = await A.getSession());
    }
    if (!user) {
      location.href = "../../index.html";
      return;
    }
    if (A.hasSupabase && !A.config.localCourse) await A.syncPreviewProgress();
    const enrollment = await A.getEnrollment();
    if (!enrollment && !A.config.previewMode && !A.config.localCourse) {
      location.href = "../../index.html";
      return;
    }
    if (!enrollment && (A.config.previewMode || A.config.localCourse)) await A.enroll();
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
