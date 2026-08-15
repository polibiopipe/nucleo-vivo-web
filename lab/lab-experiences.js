(() => {
  "use strict";

  const form = document.querySelector("#lab-experience-form");
  const result = document.querySelector("#experience-result");
  const summary = document.querySelector("#result-summary");
  const dimensions = document.querySelector("#result-dimensions");
  const question = document.querySelector("#result-question");
  const status = document.querySelector("#experience-form-status");
  const resetButton = document.querySelector("#experience-reset");
  if (!form || !result || !summary || !dimensions || !question) return;

  const empresaFeedback = {
    launch: {
      summary: "Esta opción protege el ritmo y hace visible la urgencia, pero puede convertir la adopción en cumplimiento superficial si las dudas y capacidades del equipo quedan fuera.",
      question: "¿Qué condición mínima de seguridad y aprendizaje tendría que existir antes de exigir adopción?",
      dimensions: [
        ["Resultados", "El calendario se conserva y la organización obtiene señales rápidas de uso."],
        ["Personas", "La presión puede aumentar si la capacitación no reconoce carga, dudas o desigualdad de experiencia."],
        ["Aprendizaje", "Medir adopción no permite saber por sí solo si el equipo comprendió, confía o usa bien la herramienta."]
      ]
    },
    pause: {
      summary: "Esta opción protege la escucha y reduce exposición inmediata, pero esperar certeza o acuerdo total puede inmovilizar el aprendizaje que solo aparece al probar en condiciones cuidadas.",
      question: "¿Qué parte de la incertidumbre puede explorarse con una prueba pequeña en vez de resolverse solo conversando?",
      dimensions: [
        ["Resultados", "El plazo se mueve y la organización gana tiempo para comprender riesgos."],
        ["Personas", "Las inquietudes reciben espacio, aunque una pausa sin horizonte puede aumentar frustración."],
        ["Aprendizaje", "La conversación aporta criterios; todavía falta evidencia situada sobre el uso real."]
      ]
    },
    pilot: {
      summary: "Esta opción convierte la incertidumbre en una prueba reversible. No elimina tensiones: exige definir límites, criterios de éxito, participación y una decisión explícita sobre qué ocurrirá después.",
      question: "¿Qué evidencia del piloto necesitarían las personas para decidir responsablemente si escalar, ajustar o detener?",
      dimensions: [
        ["Resultados", "La organización obtiene evidencia antes de comprometer un despliegue completo."],
        ["Personas", "Un grupo puede participar y aprender, siempre que la selección y la carga del piloto sean justas."],
        ["Aprendizaje", "La reversibilidad permite probar, revisar errores y ajustar criterios antes de escalar."]
      ]
    }
  };

  const umbralCopy = {
    load: {
      manageable: ["Carga", "Hay margen disponible. Conviene protegerlo antes de sumar una nueva demanda."],
      tight: ["Carga", "El margen es estrecho. Priorizar y explicitar qué queda fuera puede reducir ambigüedad."],
      overwhelming: ["Carga", "La exigencia percibida supera el margen actual. El próximo paso necesita incluir reducción y apoyo, no solo esfuerzo individual."]
    },
    support: {
      present: ["Apoyo", "Existe una base relacional o institucional que puede activarse con una petición concreta."],
      partial: ["Apoyo", "Hay apoyo, pero puede no alcanzar o no estar disponible cuando se necesita. Conviene precisar qué falta."],
      absent: ["Apoyo", "La falta de apoyo aumenta el peso individual. Hacer visible la situación a una persona o canal responsable es parte de la acción."]
    },
    need: {
      clarify: ["Próxima necesidad", "Aclarar significa distinguir lo urgente, lo importante y lo que puede esperar."],
      reduce: ["Próxima necesidad", "Reducir significa elegir una demanda concreta que puede acotarse, delegarse o postergarse."],
      connect: ["Próxima necesidad", "Conectar significa no sostener el momento en soledad y formular una petición específica de apoyo."]
    }
  };

  function card([title, copy]) {
    const article = document.createElement("article");
    const heading = document.createElement("h3");
    const paragraph = document.createElement("p");
    heading.textContent = title;
    paragraph.textContent = copy;
    article.append(heading, paragraph);
    return article;
  }

  function renderEmpresa(data) {
    const feedback = empresaFeedback[data.get("decision")];
    if (!feedback) return false;
    summary.textContent = feedback.summary;
    question.textContent = feedback.question;
    dimensions.replaceChildren(...feedback.dimensions.map(card));
    return true;
  }

  function renderUmbral(data) {
    const load = data.get("load");
    const support = data.get("support");
    const need = data.get("need");
    if (!umbralCopy.load[load] || !umbralCopy.support[support] || !umbralCopy.need[need]) return false;
    const highPressure = load === "overwhelming" || support === "absent";
    summary.textContent = highPressure
      ? "Lo que describes merece menos exigencia individual y más apoyo contextual. Elige una acción pequeña que haga visible la carga y acerque ayuda humana."
      : "Tu lectura muestra un punto desde el cual ordenar la energía disponible. Una acción pequeña y explícita puede proteger el margen antes de seguir.";
    const nextActions = {
      clarify: "Escribe tres pendientes y marca solo uno como imprescindible hoy. Comunica qué se moverá y por qué.",
      reduce: "Elige una demanda concreta para acotar, delegar o postergar. Nombra el límite a alguien involucrado.",
      connect: "Contacta a una persona o canal de confianza con una petición específica: escuchar, priorizar o compartir una tarea."
    };
    question.textContent = nextActions[need];
    dimensions.replaceChildren(card(umbralCopy.load[load]), card(umbralCopy.support[support]), card(umbralCopy.need[need]));
    return true;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const rendered = form.dataset.experience === "empresa" ? renderEmpresa(data) : renderUmbral(data);
    if (!rendered) {
      status.textContent = "Completa todas las opciones para ver la orientación.";
      status.className = "experience-form-status is-error";
      return;
    }
    status.textContent = "";
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });

  resetButton?.addEventListener("click", () => {
    form.reset();
    result.hidden = true;
    form.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    form.querySelector("input")?.focus({ preventScroll: true });
  });
})();
