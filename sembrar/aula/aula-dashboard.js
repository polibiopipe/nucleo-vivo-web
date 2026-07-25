(() => {
  "use strict";

  const A = window.AulaViva;
  const $ = selector => document.querySelector(selector);
  const authDialog = $("#auth-dialog");
  const accessibilityDialog = $("#accessibility-dialog");
  let authMode = "signin";
  let recoveryPromptShown = false;

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
    A.applyAccessibility();
    setBanner(connectionMessage(), "info");

    try {
      const { user } = await A.getSession();
      $("#guest-view").hidden = Boolean(user);
      $("#member-view").hidden = !user;
      document.querySelectorAll("[data-open-auth]").forEach(button => {
        button.hidden = Boolean(user);
      });
      if (!user) return;

      if (A.isRecoverySession() && !recoveryPromptShown) {
        recoveryPromptShown = true;
        setAuthMode("update-password");
        authDialog.showModal();
      }

      const syncResult = A.hasSupabase ? await A.syncPreviewProgress() : null;
      if (syncResult?.message) setBanner(syncResult.message, syncResult.synced ? "success" : "info");

      $("#member-name").textContent = displayName(user);
      const hour = new Date().getHours();
      const greeting = hour < 12 ? "Buenos dias" : hour < 20 ? "Buenas tardes" : "Buenas noches";
      $("#member-title").firstChild.textContent = `${greeting}, `;
      const [enrollment, progress] = await Promise.all([A.getEnrollment(), A.getProgress()]);
      const completed = Object.values(progress).filter(item => item.status === "completed").length;
      const total = window.IA_COURSE?.lessons?.length || 19;
      const percent = total ? Math.round((completed / total) * 100) : 0;
      $("#completed-count").textContent = String(completed);
      $("#progress-label").textContent = `${percent}%`;
      $("#progress-bar").style.width = `${percent}%`;
      $("#next-action").textContent = completed ? "Continuar ruta recomendada" : "Diagnostico inicial";
      $("#continue-copy").textContent = completed
        ? "Tu avance esta guardado. Retoma la proxima experiencia sin repetir lo ya realizado."
        : "Comienza por una decision inicial y configura tu meta de aprendizaje.";
      $("#enroll-button").hidden = Boolean(enrollment);
      $("#continue-link").hidden = !enrollment;
    } catch (error) {
      setBanner(`No pudimos cargar el aula: ${A.friendlyError(error)}`, "error");
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

  A.onAuthStateChange(refresh);
  refresh();
})();
