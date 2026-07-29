(() => {
  "use strict";

  const A = window.AulaViva;
  const $ = selector => document.querySelector(selector);
  const authDialog = $("#auth-dialog");
  const accessibilityDialog = $("#accessibility-dialog");
  const loadingView = $("#aula-loading-state");
  const publicHero = $("#public-hero");
  const dashboardSection = $("#aula-dashboard-section");
  const guestView = $("#guest-view");
  const memberView = $("#member-view");
  const liveStatus = $("#aula-live-status");
  let authMode = "signin";
  let recoveryPromptShown = false;
  let initialStateResolved = false;
  let pendingDashboardFocus = false;
  let refreshSequence = 0;
  let lastDashboardFocusAt = 0;

  function setLiveStatus(message) {
    if (liveStatus) liveStatus.textContent = message || "";
  }

  function setRegion(element, visible) {
    if (!element) return;
    element.hidden = !visible;
    element.toggleAttribute("inert", !visible);
    element.setAttribute("aria-hidden", visible ? "false" : "true");
  }

  function setViewState(state) {
    document.body.dataset.aulaState = state;
    setRegion(loadingView, state === "loading");
    setRegion(publicHero, state === "guest");
    setRegion(dashboardSection, state !== "loading");
    setRegion(guestView, state === "guest");
    setRegion(memberView, state === "member");
  }

  function focusDashboardStart() {
    if (!memberView || memberView.hidden) return;
    const now = Date.now();
    if (now - lastDashboardFocusAt < 900) return;
    lastDashboardFocusAt = now;
    const title = $("#member-title");
    const reducedMotion = document.documentElement.classList.contains("aula-reduced-motion")
      || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    window.requestAnimationFrame(() => {
      memberView.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
      window.requestAnimationFrame(() => {
        title?.focus({ preventScroll: true });
      });
    });
  }

  function requestDashboardFocus() {
    pendingDashboardFocus = true;
  }

  function displayName(user) {
    const raw = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "participante";
    return raw.trim().split(/\s+/)[0] || "participante";
  }

  function setBanner(message, variant = "info") {
    const banner = $("#system-banner");
    if (!message) {
      banner.hidden = true;
      banner.textContent = "";
      banner.dataset.variant = "";
      return;
    }
    banner.hidden = false;
    banner.dataset.variant = variant;
    banner.textContent = message;
  }

  function connectionMessage() {
    const state = A.getConnectionState();
    if (state.mode === "supabase") return "";
    if (state.mode === "misconfigured") {
      return "Hay configuracion publica de Supabase, pero la biblioteca no cargo. El aula permanece en vista previa local hasta resolver la conexion.";
    }
    if (state.mode === "preview") {
      return "Vista previa segura: el aula funciona con almacenamiento local en este navegador. Para inscripciones reales, configure Supabase y ejecute la migracion incluida.";
    }
    return "Vista previa local: falta configurar URL publica y anon key de Supabase.";
  }

  function setAuthMode(mode) {
    authMode = mode;
    const signup = mode === "signup";
    const updatePassword = mode === "update-password";
    const signin = mode === "signin";
    const submitButton = $("#auth-submit-button");
    const emailInput = $("#auth-email");
    const emailLabel = $("#auth-email").closest("label");

    $("#signin-tab").setAttribute("aria-selected", String(signin));
    $("#signup-tab").setAttribute("aria-selected", String(signup));
    $("#auth-name").closest("label").hidden = !signup;
    emailLabel.hidden = updatePassword;
    emailInput.disabled = updatePassword;
    emailInput.required = !updatePassword;
    $("#consent-row").hidden = !signup;
    $("#reset-password-button").hidden = updatePassword;
    $("#resend-confirmation-button").hidden = true;
    $("#auth-password").autocomplete = signup || updatePassword ? "new-password" : "current-password";
    $("#auth-title").textContent = updatePassword
      ? "Actualiza tu contrasena"
      : signup
        ? "Crea tu cuenta"
        : "Ingresa a tu aula";
    $("#auth-description").textContent = updatePassword
      ? "Elige una nueva contrasena para continuar usando tu Aula Viva."
      : "Usa tu correo y contrasena. Tambien puedes crear una cuenta nueva.";
    submitButton.textContent = updatePassword ? "Guardar nueva contrasena" : "Continuar";
    $("#auth-status").className = "form-status";
    $("#auth-status").textContent = "";
  }

  async function refresh() {
    const sequence = ++refreshSequence;
    if (!initialStateResolved) {
      setViewState("loading");
      setLiveStatus("Cargando tu aula.");
    }
    A.applyAccessibility();
    setBanner(connectionMessage(), "info");

    try {
      const { user } = await A.getSession();
      if (sequence !== refreshSequence) return;
      setViewState(user ? "member" : "guest");
      document.querySelectorAll("[data-open-auth]").forEach(button => {
        button.hidden = Boolean(user);
      });
      if (!user) {
        initialStateResolved = true;
        setLiveStatus("Vista publica de Aula Viva disponible.");
        return;
      }

      if (A.isRecoverySession() && !recoveryPromptShown) {
        recoveryPromptShown = true;
        setAuthMode("update-password");
        authDialog.showModal();
      }

      const syncResult = A.hasSupabase ? await A.syncPreviewProgress() : null;
      if (sequence !== refreshSequence) return;
      if (syncResult?.message) setBanner(syncResult.message, syncResult.synced ? "success" : "info");

      $("#member-name").textContent = displayName(user);
      const hour = new Date().getHours();
      const greeting = hour < 12 ? "Buenos dias" : hour < 20 ? "Buenas tardes" : "Buenas noches";
      $("#member-title").firstChild.textContent = `${greeting}, `;
      const enrollment = await A.getEnrollment();
      const enrollmentStatus = enrollment?.status || null;
      const canContinue = enrollmentStatus === "active" || enrollmentStatus === "completed";
      const isPaused = enrollmentStatus === "paused";
      const progress = canContinue ? await A.getProgress() : {};
      if (sequence !== refreshSequence) return;
      const completed = Object.values(progress).filter(item => item.status === "completed").length;
      const total = window.IA_COURSE?.lessons?.length || 19;
      const percent = total ? Math.round((completed / total) * 100) : 0;
      const wellbeingProgress = A.getLocalCourseProgress?.("cuando-ensenar-agota", user) || {};
      const wellbeingCompleted = Object.values(wellbeingProgress).filter(item => item?.status === "completed").length;
      const wellbeingTotal = 19;
      const wellbeingPercent = Math.round((wellbeingCompleted / wellbeingTotal) * 100);
      const enrollmentMessage = $("#enrollment-status");
      $("#completed-count").textContent = String(completed);
      $("#progress-label").textContent = `${percent}%`;
      $("#progress-bar").style.width = `${percent}%`;
      $("#wellbeing-completed-count").textContent = `${wellbeingCompleted} de ${wellbeingTotal}`;
      $("#wellbeing-progress-label").textContent = `${wellbeingPercent}%`;
      $("#wellbeing-progress-bar").style.width = `${wellbeingPercent}%`;
      $("#wellbeing-continue-link").textContent = wellbeingCompleted ? "Continuar curso" : "Comenzar curso";
      $("#next-action").textContent = canContinue
        ? completed
          ? "Continuar ruta recomendada"
          : "Diagnostico inicial"
        : isPaused
          ? "Acceso pausado"
          : "Inscribirte en el curso";
      $("#continue-copy").textContent = canContinue
        ? completed
          ? "Tu avance esta guardado. Retoma la proxima experiencia sin repetir lo ya realizado."
          : "Comienza por una decision inicial y configura tu meta de aprendizaje."
        : isPaused
          ? "Tu acceso a este curso se encuentra pausado. El contenido queda protegido hasta que se reactive la inscripcion."
          : "Inscribete para agregar este curso a tu aula y comenzar tu ruta de aprendizaje.";
      $("#enroll-button").hidden = Boolean(enrollment);
      $("#continue-link").hidden = !canContinue;
      enrollmentMessage.hidden = !isPaused;
      enrollmentMessage.textContent = isPaused
        ? "Acceso pausado: no es posible continuar el contenido por ahora. Si necesitas ayuda, contacta a Nucleo Vivo."
        : "";

      const shouldFocusDashboard = pendingDashboardFocus || !initialStateResolved;
      initialStateResolved = true;
      setLiveStatus(`Aula cargada. ${greeting}, ${displayName(user)}.`);
      if (shouldFocusDashboard) {
        pendingDashboardFocus = false;
        focusDashboardStart();
      }
    } catch (error) {
      initialStateResolved = true;
      setViewState("guest");
      setBanner(`No pudimos cargar el aula: ${A.friendlyError(error)}`, "error");
      setLiveStatus("No pudimos cargar el aula.");
    }
  }

  document.querySelectorAll("[data-open-auth]").forEach(button => {
    button.addEventListener("click", () => {
      setAuthMode(button.dataset.openAuth || "signin");
      authDialog.showModal();
    });
  });

  $("#signin-tab").addEventListener("click", () => setAuthMode("signin"));
  $("#signup-tab").addEventListener("click", () => setAuthMode("signup"));

  $("#auth-form").addEventListener("submit", async event => {
    event.preventDefault();
    const status = $("#auth-status");
    const resendButton = $("#resend-confirmation-button");
    status.className = "form-status";
    status.textContent = "Procesando...";
    resendButton.hidden = true;
    const values = {
      name: $("#auth-name").value.trim(),
      email: $("#auth-email").value.trim(),
      password: $("#auth-password").value,
      consent: $("#auth-consent").checked
    };

    try {
      if (authMode === "signup") {
        const result = await A.signUp(values);
        const requiresConfirmation = A.hasSupabase && !result?.session;
        status.className = "form-status success";
        status.textContent = requiresConfirmation
          ? "Solicitud recibida. Si el proyecto requiere confirmacion, revisa tu correo antes de ingresar."
          : A.hasSupabase
            ? "Cuenta creada. Ya puedes continuar."
            : "Cuenta de vista previa creada.";
        resendButton.hidden = !requiresConfirmation;
        if (requiresConfirmation) return;
      } else if (authMode === "update-password") {
        await A.updatePassword(values.password);
        status.className = "form-status success";
        status.textContent = "Contrasena actualizada. Ya puedes continuar.";
      } else {
        await A.signIn(values);
        status.className = "form-status success";
        status.textContent = "Ingreso correcto.";
      }
      setTimeout(() => {
        authDialog.close();
        requestDashboardFocus();
        refresh();
      }, 700);
    } catch (error) {
      status.className = "form-status error";
      status.textContent = A.friendlyError(error);
      resendButton.hidden = !A.hasSupabase || !/confirma|confirm/i.test(status.textContent);
    }
  });

  $("#reset-password-button").addEventListener("click", async () => {
    const status = $("#auth-status");
    try {
      await A.resetPassword($("#auth-email").value.trim());
      status.className = "form-status success";
      status.textContent = A.hasSupabase
        ? "Si el correo esta registrado, recibiras instrucciones para actualizar tu contrasena."
        : "Vista previa: el restablecimiento se habilita al conectar Supabase.";
    } catch (error) {
      status.className = "form-status error";
      status.textContent = A.friendlyError(error);
    }
  });

  $("#resend-confirmation-button").addEventListener("click", async () => {
    const status = $("#auth-status");
    try {
      await A.resendConfirmation($("#auth-email").value.trim());
      status.className = "form-status success";
      status.textContent = "Si el correo esta pendiente de confirmacion, recibiras un nuevo enlace.";
    } catch (error) {
      status.className = "form-status error";
      status.textContent = A.friendlyError(error);
    }
  });

  $("#enroll-button").addEventListener("click", async () => {
    const button = $("#enroll-button");
    button.disabled = true;
    button.textContent = "Inscribiendo...";
    try {
      await A.enroll();
      requestDashboardFocus();
      await refresh();
    } catch (error) {
      alert(A.friendlyError(error));
    } finally {
      button.disabled = false;
      button.textContent = "Inscribirme";
    }
  });

  $("#signout-button").addEventListener("click", async () => {
    await A.signOut();
    await refresh();
    window.scrollTo({ top: 0, behavior: "auto" });
    setLiveStatus("Sesion cerrada. Volviste a la portada publica de Aula Viva.");
  });

  $("#accessibility-button").addEventListener("click", () => {
    const settings = A.getAccessibility();
    $("#large-text-toggle").checked = Boolean(settings.largeText);
    $("#motion-toggle").checked = Boolean(settings.reducedMotion);
    $("#contrast-toggle").checked = Boolean(settings.highContrast);
    accessibilityDialog.showModal();
  });

  $("#save-accessibility").addEventListener("click", () => {
    A.saveAccessibility({
      largeText: $("#large-text-toggle").checked,
      reducedMotion: $("#motion-toggle").checked,
      highContrast: $("#contrast-toggle").checked
    });
    accessibilityDialog.close();
  });

  A.onAuthStateChange(user => {
    if (user) requestDashboardFocus();
    refresh();
  });
  refresh();
})();
