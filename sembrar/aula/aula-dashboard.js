(() => {
  "use strict";
  const A = window.AulaViva;
  const $ = selector => document.querySelector(selector);
  const authDialog = $("#auth-dialog");
  const accessibilityDialog = $("#accessibility-dialog");
  let authMode = "signin";

  function displayName(user) {
    const raw = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "participante";
    return raw.trim().split(/\s+/)[0] || "participante";
  }

  function setAuthMode(mode) {
    authMode = mode;
    const signup = mode === "signup";
    $("#signin-tab").setAttribute("aria-selected", String(!signup));
    $("#signup-tab").setAttribute("aria-selected", String(signup));
    $("#auth-name").closest("label").hidden = !signup;
    $("#consent-row").hidden = !signup;
    $("#auth-password").autocomplete = signup ? "new-password" : "current-password";
    $("#auth-title").textContent = signup ? "Crea tu cuenta" : "Ingresa a tu aula";
    $("#auth-status").textContent = "";
  }

  async function refresh() {
    A.applyAccessibility();
    const banner = $("#system-banner");
    if (!A.hasSupabase) {
      banner.hidden = false;
      banner.textContent = "Vista previa segura: el aula funciona con almacenamiento local. Para publicar inscripciones reales, configure Supabase y ejecute la migración incluida.";
    }

    try {
      const { user } = await A.getSession();
      $("#guest-view").hidden = Boolean(user);
      $("#member-view").hidden = !user;
      document.querySelectorAll("[data-open-auth]").forEach(button => {
        button.hidden = Boolean(user);
      });
      if (!user) return;

      $("#member-name").textContent = displayName(user);
      const hour = new Date().getHours();
      const greeting = hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";
      $("#member-title").firstChild.textContent = `${greeting}, `;
      const [enrollment, progress] = await Promise.all([A.getEnrollment(), A.getProgress()]);
      const completed = Object.values(progress).filter(item => item.status === "completed").length;
      const total = window.IA_COURSE?.lessons?.length || 19;
      const percent = total ? Math.round((completed / total) * 100) : 0;
      $("#completed-count").textContent = String(completed);
      $("#progress-label").textContent = `${percent}%`;
      $("#progress-bar").style.width = `${percent}%`;
      $("#next-action").textContent = completed ? "Continuar ruta recomendada" : "Diagnóstico inicial";
      $("#continue-copy").textContent = completed
        ? "Tu avance está guardado. Retoma la próxima experiencia sin repetir lo ya realizado."
        : "Comienza por una decisión inicial y configura tu meta de aprendizaje.";
      $("#enroll-button").hidden = Boolean(enrollment);
      $("#continue-link").hidden = !enrollment;
    } catch (error) {
      banner.hidden = false;
      banner.textContent = `No pudimos cargar el aula: ${error.message}`;
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
    status.className = "form-status";
    status.textContent = "Procesando…";
    const values = {
      name: $("#auth-name").value.trim(),
      email: $("#auth-email").value.trim(),
      password: $("#auth-password").value,
      consent: $("#auth-consent").checked
    };
    try {
      if (authMode === "signup") {
        await A.signUp(values);
        status.classList.add("success");
        status.textContent = A.hasSupabase
          ? "Cuenta creada. Revisa tu correo para confirmar el acceso."
          : "Cuenta de vista previa creada.";
      } else {
        await A.signIn(values);
        status.classList.add("success");
        status.textContent = "Ingreso correcto.";
      }
      setTimeout(() => {
        authDialog.close();
        refresh();
      }, 700);
    } catch (error) {
      status.classList.add("error");
      status.textContent = error.message;
    }
  });

  $("#reset-password-button").addEventListener("click", async () => {
    const status = $("#auth-status");
    try {
      await A.resetPassword($("#auth-email").value.trim());
      status.className = "form-status success";
      status.textContent = A.hasSupabase
        ? "Enviamos las instrucciones al correo indicado."
        : "Vista previa: el restablecimiento se habilita al conectar Supabase.";
    } catch (error) {
      status.className = "form-status error";
      status.textContent = error.message;
    }
  });

  $("#enroll-button").addEventListener("click", async () => {
    const button = $("#enroll-button");
    button.disabled = true;
    button.textContent = "Inscribiendo…";
    try {
      await A.enroll();
      await refresh();
    } catch (error) {
      alert(error.message);
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
