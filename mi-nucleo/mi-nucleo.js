(() => {
  "use strict";

  const CONFIG = Object.freeze({
    ...(window.AULA_VIVA_CONFIG || {}),
    consentVersion: "2026-08-15",
    consentType: "mi_nucleo_privacy_terms",
    enableGoogleAuth: false
  });
  const ACTIVITY_KEY = "nv-mi-nucleo-activity-v1";
  const LOCAL_DASHBOARD_PREVIEW = ["127.0.0.1", "localhost"].includes(window.location.hostname)
    && new URLSearchParams(window.location.search).get("preview") === "dashboard";
  const DEMO_VIEW = window.MI_NUCLEO_DEMO === true || LOCAL_DASHBOARD_PREVIEW;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const state = {
    client: null,
    user: null,
    authMode: "signin",
    consentRecord: null,
    priority: "all",
    demo: false,
    busy: false
  };

  const priorities = Object.freeze({
    psychology: "Psicología",
    education: "Docencia y educación",
    business: "Administración / Ingeniería Comercial",
    all: "Explorar todo"
  });

  const products = Object.freeze([
    {
      id: "escucha-viva",
      name: "Escucha Viva",
      area: "Psicología",
      categories: ["psychology"],
      symbol: "EV",
      status: "Disponible",
      statusCode: "available",
      entitlement: "external",
      image: "../assets/showcase/escucha-viva.jpg",
      imageAlt: "Interfaz real de Escucha Viva",
      description: "Práctica de entrevistas psicológicas simuladas con casos, decisiones y retroalimentación formativa.",
      href: "https://psicoldp-simulador-limpio.vercel.app/",
      external: true
    },
    {
      id: "umbral-docente",
      name: "Umbral Docente",
      area: "Docencia",
      categories: ["education"],
      symbol: "UD",
      status: "Piloto abierto",
      statusCode: "available",
      entitlement: "open",
      image: "../assets/showcase/umbral-docente.jpg",
      imageAlt: "Interfaz real de Umbral Docente",
      description: "Aplicación de práctica pedagógica con escenarios, planificación y retroalimentación formativa.",
      href: "/lab/umbral-docente/app/",
      localHref: "../lab/umbral-docente/app/index.html"
    },
    {
      id: "empresa-viva",
      name: "Empresa Viva",
      area: "Organizaciones",
      categories: ["business"],
      symbol: "EM",
      status: "Piloto abierto",
      statusCode: "available",
      entitlement: "open",
      image: "../assets/showcase/empresa-viva.jpg",
      imageAlt: "Interfaz real de Empresa Viva",
      description: "Laboratorio de decisiones empresariales con ocho casos, evidencia y consecuencias simuladas.",
      href: "/lab/empresa-viva/app/",
      localHref: "../lab/empresa-viva/app/index.html"
    },
    {
      id: "aula-viva",
      name: "Aula Viva",
      area: "Aprendizaje",
      categories: ["education", "learning"],
      symbol: "AV",
      status: "Acceso activo",
      statusCode: "available",
      entitlement: "account",
      image: "../assets/ecosistemas/02-sembrar.webp",
      imageAlt: "Sembrar, espacio de aprendizaje y desarrollo",
      description: "Tu espacio de cursos, progreso y evidencia de aprendizaje aplicado dentro de Sembrar.",
      href: "/sembrar/aula/",
      localHref: "../sembrar/aula/index.html"
    },
    {
      id: "ia-criterio-humano",
      name: "IA con criterio humano",
      area: "Curso aplicado",
      categories: ["business", "learning"],
      symbol: "IA",
      status: "Curso disponible",
      statusCode: "available",
      entitlement: "account",
      image: "../assets/images/aula/ia-con-criterio-humano/modulo-00-reglas-minimas.webp",
      imageAlt: "Portada del curso IA con criterio humano",
      description: "Productividad, seguridad, privacidad y responsabilidad humana en el trabajo con inteligencia artificial.",
      href: "/sembrar/cursos/ia-con-criterio-humano/",
      localHref: "../sembrar/cursos/ia-con-criterio-humano/index.html"
    },
    {
      id: "cuando-ensenar-agota",
      name: "Cuando enseñar agota",
      area: "Bienestar docente",
      categories: ["education", "learning"],
      symbol: "CE",
      status: "Curso disponible",
      statusCode: "available",
      entitlement: "account",
      image: "../assets/images/aula/cuando-ensenar-agota/video-poster.webp",
      imageAlt: "Portada del curso Cuando enseñar agota",
      description: "Una ruta basada en evidencia para comprender y transformar el desgaste emocional docente sin culpabilizar.",
      href: "/sembrar/cursos/cuando-ensenar-agota/",
      localHref: "../sembrar/cursos/cuando-ensenar-agota/index.html"
    }
  ]);

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]);
  }

  function productHref(product) {
    if (product.external || window.location.protocol !== "file:") return product.href;
    return product.localHref || product.href;
  }

  function redirectUrl() {
    if (window.location.protocol === "file:") return window.location.href.split(/[?#]/)[0];
    return new URL("/mi-nucleo/", window.location.origin).toString();
  }

  function setLiveStatus(message) {
    const live = $("#mi-live-status");
    if (live) live.textContent = message;
  }

  function setFormStatus(message = "", type = "") {
    const status = $("#auth-status");
    status.textContent = message;
    status.className = `mi-form-status${type ? ` is-${type}` : ""}`;
  }

  function friendlyError(error) {
    const message = String(error?.message || error || "");
    if (/Invalid login credentials/i.test(message)) return "Correo o contraseña incorrectos.";
    if (/Email not confirmed/i.test(message)) return "Confirma tu correo antes de ingresar.";
    if (/already registered|already exists|User already/i.test(message)) return "Ese correo ya tiene una cuenta.";
    if (/Password should be|at least/i.test(message)) return "La contraseña debe tener al menos 8 caracteres.";
    if (/provider is not enabled|Unsupported provider/i.test(message)) return "El acceso con Google aún no está habilitado para este proyecto.";
    if (/Failed to fetch|NetworkError|Load failed|fetch/i.test(message)) return "No pudimos conectar con Mi Núcleo. Revisa tu conexión e intenta nuevamente.";
    if (/JWT|policy|permission denied|schema|relation/i.test(message)) return "No pudimos completar esta acción. Intenta nuevamente o escríbenos.";
    return message || "No pudimos completar esta acción.";
  }

  function showToast(message) {
    const toast = $("#mi-toast");
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 3200);
  }

  function setPageState(nextState) {
    document.body.dataset.miState = nextState;
    $("#auth-view").hidden = nextState !== "auth";
    $("#app-view").hidden = nextState !== "member";
  }

  function metadataConsent(user) {
    if (state.demo) return null;
    const metadata = user?.user_metadata || {};
    if (metadata.mi_nucleo_consent_version !== CONFIG.consentVersion) return null;
    return {
      version: metadata.mi_nucleo_consent_version,
      accepted_at: metadata.mi_nucleo_consent_accepted_at || null,
      source: metadata.mi_nucleo_consent_source || "account_metadata"
    };
  }

  async function loadConsent(user) {
    if (state.demo) return null;
    const fromMetadata = metadataConsent(user);
    if (fromMetadata) return fromMetadata;
    try {
      const { data, error } = await state.client
        .from("aula_consent_records")
        .select("version, accepted_at, context")
        .eq("user_id", user.id)
        .eq("consent_type", CONFIG.consentType)
        .eq("version", CONFIG.consentVersion)
        .eq("accepted", true)
        .is("withdrawn_at", null)
        .order("accepted_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data || null;
    } catch {
      return null;
    }
  }

  async function recordConsent(source) {
    if (state.demo) throw new Error("La vista demostrativa no registra consentimiento.");
    const acceptedAt = new Date().toISOString();
    const metadata = {
      ...(state.user?.user_metadata || {}),
      mi_nucleo_consent_version: CONFIG.consentVersion,
      mi_nucleo_consent_accepted_at: acceptedAt,
      mi_nucleo_consent_source: source
    };
    const { data: updated, error: updateError } = await state.client.auth.updateUser({ data: metadata });
    if (updateError) throw updateError;
    state.user = updated.user || state.user;

    let databaseRecord = null;
    try {
      const { data, error } = await state.client
        .from("aula_consent_records")
        .insert({
          user_id: state.user.id,
          consent_type: CONFIG.consentType,
          version: CONFIG.consentVersion,
          accepted: true,
          accepted_at: acceptedAt,
          context: { source, route: "/mi-nucleo/", interface: "web" }
        })
        .select("version, accepted_at, context")
        .single();
      if (!error) databaseRecord = data;
    } catch {
      databaseRecord = null;
    }

    state.consentRecord = databaseRecord || {
      version: CONFIG.consentVersion,
      accepted_at: acceptedAt,
      context: { source, storage: "auth_metadata" }
    };
    return state.consentRecord;
  }

  function setAuthMode(mode) {
    state.authMode = mode;
    const isSignup = mode === "signup";
    const isRecovery = mode === "update-password";
    const isConsentGate = mode === "consent";
    const needsConsent = isSignup || isConsentGate;
    const card = $("#access-card");
    card.classList.toggle("session-consent", isConsentGate);
    $("#signin-tab").setAttribute("aria-selected", String(mode === "signin"));
    $("#signup-tab").setAttribute("aria-selected", String(isSignup));
    $("#name-field").hidden = !isSignup;
    $("#auth-name").required = isSignup;
    $("#auth-password").autocomplete = isSignup || isRecovery ? "new-password" : "current-password";
    $("#consent-row").hidden = !needsConsent;
    $("#consent-meta").hidden = !needsConsent;
    $("#auth-consent").required = needsConsent;
    if (!needsConsent) $("#auth-consent").checked = false;
    $("#consent-version-label").textContent = CONFIG.consentVersion;
    $("#auth-kicker").textContent = isRecovery ? "Seguridad de cuenta" : isConsentGate ? "Transparencia antes de entrar" : "Acceso personal";
    $("#auth-title").textContent = isRecovery
      ? "Crea una nueva contraseña"
      : isConsentGate
        ? "Revisa y acepta la información vigente"
        : isSignup
          ? "Crea tu Núcleo"
          : "Entra a tu Núcleo";
    $("#auth-description").textContent = isRecovery
      ? "Elige una contraseña de al menos 8 caracteres para recuperar tu acceso."
      : isConsentGate
        ? "Tu sesión está activa. Para continuar necesitamos registrar tu aceptación de la Política de Privacidad y los Términos vigentes."
        : isSignup
          ? "Una cuenta te permite guardar preferencias y conectar tus experiencias."
          : "Usa tu correo y contraseña para continuar.";
    $("#password-label").textContent = isRecovery ? "Nueva contraseña" : "Contraseña";
    $("#auth-submit").textContent = isRecovery
      ? "Guardar nueva contraseña"
      : isConsentGate
        ? "Aceptar y continuar"
        : isSignup
          ? "Crear cuenta"
          : "Ingresar";
    setFormStatus();
  }

  function isRecoveryUrl() {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    return hash.get("type") === "recovery" || query.get("type") === "recovery";
  }

  function displayName(user) {
    if (state.demo) return "Visitante";
    const fullName = String(user?.user_metadata?.full_name || "").trim();
    if (fullName) return fullName;
    return String(user?.email || "participante").split("@")[0] || "participante";
  }

  function firstName(user) {
    return displayName(user).split(/\s+/)[0];
  }

  function initials(user) {
    return displayName(user).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "NV";
  }

  function readActivity() {
    if (state.demo) return {};
    try {
      return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function trackProduct(productId) {
    if (state.demo) return;
    const activity = readActivity();
    activity[productId] = { opened_at: new Date().toISOString() };
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  }

  function productCard(product, featured = false) {
    const external = product.external ? ' target="_blank" rel="noopener noreferrer"' : "";
    const externalHint = product.external ? ' <span aria-hidden="true">↗</span>' : "";
    return `
      <article class="mi-product-card${featured ? " is-featured" : ""}" data-product-id="${escapeHtml(product.id)}" data-status="${escapeHtml(product.statusCode)}" data-entitlement="${escapeHtml(product.entitlement)}">
        <div class="mi-product-media"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageAlt)}" loading="lazy" /></div>
        <div class="mi-product-content">
          <div class="mi-product-topline"><span class="mi-product-area">${escapeHtml(product.area)}</span><span class="mi-product-status">${escapeHtml(product.status)}</span></div>
          <span class="mi-product-symbol" aria-hidden="true">${escapeHtml(product.symbol)}</span>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.description)}</p>
          <a href="${escapeHtml(productHref(product))}" data-track-product="${escapeHtml(product.id)}"${external}>${product.external ? "Abrir producto" : "Explorar experiencia"}${externalHint}</a>
        </div>
      </article>`;
  }

  function recommendedProducts(priority) {
    if (priority === "psychology") return [products[0], products[1], products[3]];
    if (priority === "education") return [products[1], products[5], products[3]];
    if (priority === "business") return [products[2], products[4], products[3]];
    return [products[0], products[2], products[1]];
  }

  function bindProductTracking() {
    if (state.demo) return;
    $$('[data-track-product]').forEach((link) => {
      link.addEventListener("click", () => trackProduct(link.dataset.trackProduct));
    });
  }

  function renderProducts(filter = "all") {
    const recommended = recommendedProducts(state.priority);
    $("#recommended-grid").innerHTML = recommended.map((product, index) => productCard(product, index === 0)).join("");
    const visibleProducts = filter === "all" ? products : products.filter((product) => product.categories.includes(filter));
    $("#explore-grid").innerHTML = visibleProducts.map((product) => productCard(product)).join("");

    const activity = readActivity();
    const recent = products
      .filter((product) => activity[product.id])
      .sort((a, b) => Date.parse(activity[b.id].opened_at) - Date.parse(activity[a.id].opened_at))
      .slice(0, 3);
    $("#experiences-grid").innerHTML = recent.length
      ? recent.map((product) => productCard(product)).join("")
      : state.demo
        ? `<div class="mi-empty-card"><div><h3>Explora sin dejar huella.</h3><p>Esta vista no guarda actividad ni progreso. Puedes recorrer los productos desde las secciones siguientes.</p><a href="#recomendado">Ver una recomendación</a></div></div>`
        : `<div class="mi-empty-card"><div><h3>Tu recorrido comienza aquí.</h3><p>Cuando abras una experiencia desde Mi Núcleo, aparecerá en este espacio para que puedas volver con facilidad.</p><a href="#recomendado">Ver una recomendación</a></div></div>`;
    bindProductTracking();
  }

  function renderConsentRecord() {
    if (state.demo) {
      $("#consent-record-version").textContent = "No aplica en la demo";
      $("#consent-record-date").textContent = "La vista demostrativa no registra consentimiento ni datos personales.";
      return;
    }
    const record = state.consentRecord || metadataConsent(state.user);
    $("#consent-record-version").textContent = record?.version ? `Versión ${record.version}` : "Sin registro vigente";
    const acceptedAt = record?.accepted_at;
    $("#consent-record-date").textContent = acceptedAt
      ? `Aceptado el ${new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeStyle: "short" }).format(new Date(acceptedAt))}.`
      : "No encontramos una fecha de aceptación vigente.";
  }

  function renderMember() {
    const name = displayName(state.user);
    const priorityFromProfile = state.demo ? "all" : state.user?.user_metadata?.mi_nucleo_priority;
    state.priority = priorities[priorityFromProfile] ? priorityFromProfile : "all";
    $("#member-name").textContent = firstName(state.user);
    $("#sidebar-name").textContent = name;
    $("#sidebar-email").textContent = state.demo ? "Vista sin cuenta" : state.user?.email || "—";
    $("#sidebar-avatar").textContent = initials(state.user);
    $("#account-name").value = name;
    $("#account-email").value = state.user?.email || "";
    $("#priority-label").textContent = priorities[state.priority];
    document.body.dataset.miDemo = String(state.demo);
    $("#topbar-status").textContent = state.demo ? "Vista demostrativa · sin datos reales" : "Tus preferencias están sincronizadas";
    $("#demo-auth-link").hidden = !state.demo;
    $("#account-nav-link").hidden = state.demo;
    $("#mi-cuenta").hidden = state.demo;
    $("#change-priority-button").hidden = state.demo;
    $("#data-actions-card").hidden = state.demo;
    $("#account-name").disabled = state.demo;
    $("#experiences-device-label").textContent = state.demo ? "Vista sin actividad guardada" : "Tu actividad en este dispositivo";
    $("#personalization-summary").textContent = state.demo ? "Explorar todo · solo lectura" : "Una prioridad editable";
    $("#personalization-copy").textContent = state.demo
      ? "La prioridad demostrativa solo ordena esta vista y no se guarda en el navegador ni en una cuenta."
      : "Tu área elegida cambia el orden de las tarjetas. No bloquea productos ni crea perfiles sensibles.";
    renderProducts();
    renderConsentRecord();
    setPageState("member");
    setLiveStatus(`Mi Núcleo cargado. Hola, ${firstName(state.user)}.`);
    window.setTimeout(() => $("#personal-title")?.focus({ preventScroll: true }), 60);
    if (!state.demo && !priorityFromProfile) window.setTimeout(openPriorityDialog, 260);
  }

  function openPriorityDialog() {
    if (state.demo) return;
    const selected = $(`input[name="priority"][value="${state.priority}"]`) || $('input[name="priority"][value="all"]');
    selected.checked = true;
    const dialog = $("#priority-dialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  async function handleSession(user, options = {}) {
    if (state.demo) return;
    state.user = user;
    if (isRecoveryUrl() && !options.ignoreRecovery) {
      setPageState("auth");
      setAuthMode("update-password");
      return;
    }
    state.consentRecord = await loadConsent(user);
    if (!state.consentRecord) {
      setPageState("auth");
      setAuthMode("consent");
      return;
    }
    renderMember();
  }

  function enterDemo() {
    state.demo = true;
    state.client = null;
    state.user = { id: "demo-visitor" };
    state.consentRecord = null;
    state.priority = "all";
    renderMember();
  }

  async function initialize() {
    $("#consent-version-label").textContent = CONFIG.consentVersion;
    if (DEMO_VIEW) {
      enterDemo();
      return;
    }
    if (!CONFIG.supabaseUrl || !CONFIG.supabaseAnonKey || !window.supabase?.createClient) {
      setPageState("auth");
      setAuthMode("signin");
      $("#auth-form").querySelectorAll("input, button").forEach((control) => { control.disabled = true; });
      setFormStatus("Mi Núcleo necesita la conexión segura de cuentas para funcionar. Intenta nuevamente más tarde.", "error");
      setLiveStatus("Mi Núcleo no pudo conectar con el servicio de cuentas.");
      return;
    }

    state.client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    $("#google-auth-button").hidden = !CONFIG.enableGoogleAuth;
    $("#auth-divider").hidden = !CONFIG.enableGoogleAuth;

    const { data, error } = await state.client.auth.getSession();
    if (error) {
      setPageState("auth");
      setAuthMode("signin");
      setFormStatus(friendlyError(error), "error");
      return;
    }

    const sessionUser = data.session?.user || null;
    if (!sessionUser) {
      setPageState("auth");
      setAuthMode("signin");
      setLiveStatus("Acceso a Mi Núcleo disponible.");
    } else {
      await handleSession(sessionUser);
    }

    state.client.auth.onAuthStateChange((event, session) => {
      if (state.busy || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      if (!session?.user) {
        state.user = null;
        state.consentRecord = null;
        setPageState("auth");
        setAuthMode("signin");
      }
    });
  }

  $("#signin-tab").addEventListener("click", () => setAuthMode("signin"));
  $("#signup-tab").addEventListener("click", () => setAuthMode("signup"));
  $("#demo-button").addEventListener("click", () => {
    const demoUrl = new URL(window.location.href);
    demoUrl.hash = "";
    demoUrl.search = "";
    demoUrl.searchParams.set("demo", "1");
    window.location.assign(demoUrl.toString());
  });

  $("#auth-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.demo || state.busy || !state.client) return;
    const emailField = $("#auth-email");
    const passwordField = $("#auth-password");
    const email = emailField.value.trim();
    const password = passwordField.value;
    const consentAccepted = $("#auth-consent").checked;
    if (["signup", "consent"].includes(state.authMode) && !consentAccepted) {
      setFormStatus("Debes aceptar la Política de Privacidad y los Términos vigentes para continuar.", "error");
      $("#auth-consent").focus();
      return;
    }
    if (["signin", "signup"].includes(state.authMode) && !email) {
      setFormStatus("Escribe tu correo para continuar.", "error");
      emailField.focus();
      return;
    }
    if (["signin", "signup"].includes(state.authMode) && !emailField.validity.valid) {
      setFormStatus("Escribe un correo válido para continuar.", "error");
      emailField.focus();
      return;
    }
    if (["signin", "signup", "update-password"].includes(state.authMode) && !password) {
      setFormStatus("Escribe tu contraseña para continuar.", "error");
      passwordField.focus();
      return;
    }
    if (["signup", "update-password"].includes(state.authMode) && password.length < 8) {
      setFormStatus("La contraseña debe tener al menos 8 caracteres.", "error");
      passwordField.focus();
      return;
    }

    state.busy = true;
    $("#auth-submit").disabled = true;
    setFormStatus("Procesando…");
    try {
      if (state.authMode === "consent") {
        await recordConsent("existing_session_gate");
        renderMember();
      } else if (state.authMode === "update-password") {
        const { error } = await state.client.auth.updateUser({ password });
        if (error) throw error;
        setFormStatus("Contraseña actualizada. Preparando tu espacio…", "success");
        await handleSession(state.user, { ignoreRecovery: true });
      } else if (state.authMode === "signup") {
        const acceptedAt = new Date().toISOString();
        const name = $("#auth-name").value.trim();
        if (!name) throw new Error("Escribe tu nombre para crear la cuenta.");
        const { data, error } = await state.client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl(),
            data: {
              full_name: name,
              mi_nucleo_consent_version: CONFIG.consentVersion,
              mi_nucleo_consent_accepted_at: acceptedAt,
              mi_nucleo_consent_source: "signup",
              aula_privacy_version: CONFIG.privacyVersion || "2026-07-25",
              aula_privacy_accepted_at: acceptedAt,
              aula_privacy_source: "mi_nucleo_signup"
            }
          }
        });
        if (error) throw error;
        if (!data.session) {
          setFormStatus("Cuenta creada. Revisa tu correo y confirma el acceso antes de ingresar.", "success");
          $("#resend-button").hidden = false;
        } else {
          await handleSession(data.user);
        }
      } else {
        const { data, error } = await state.client.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        await handleSession(data.user);
      }
    } catch (error) {
      setFormStatus(friendlyError(error), "error");
    } finally {
      state.busy = false;
      $("#auth-submit").disabled = false;
    }
  });

  $("#reset-password-button").addEventListener("click", async () => {
    if (state.demo || !state.client) return;
    const emailField = $("#auth-email");
    const email = emailField.value.trim();
    if (!email) {
      setFormStatus("Escribe tu correo para solicitar el restablecimiento.", "error");
      emailField.focus();
      return;
    }
    if (!emailField.validity.valid) {
      setFormStatus("Escribe un correo válido para solicitar el restablecimiento.", "error");
      emailField.focus();
      return;
    }
    try {
      const { error } = await state.client.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl() });
      if (error) throw error;
      setFormStatus("Si el correo está registrado, recibirás instrucciones para crear una nueva contraseña.", "success");
    } catch (error) {
      setFormStatus(friendlyError(error), "error");
    }
  });

  $("#resend-button").addEventListener("click", async () => {
    if (state.demo || !state.client) return;
    try {
      const { error } = await state.client.auth.resend({
        type: "signup",
        email: $("#auth-email").value.trim(),
        options: { emailRedirectTo: redirectUrl() }
      });
      if (error) throw error;
      setFormStatus("Si la cuenta sigue pendiente, recibirás un nuevo enlace de confirmación.", "success");
    } catch (error) {
      setFormStatus(friendlyError(error), "error");
    }
  });

  $("#google-auth-button").addEventListener("click", async () => {
    if (state.demo || !state.client) return;
    const { error } = await state.client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl() }
    });
    if (error) setFormStatus(friendlyError(error), "error");
  });

  $("#change-priority-button").addEventListener("click", openPriorityDialog);
  $("#save-priority-button").addEventListener("click", async () => {
    if (state.demo || !state.client) return;
    const selected = $('input[name="priority"]:checked')?.value || "all";
    const status = $("#priority-status");
    status.textContent = "Guardando…";
    try {
      const { data, error } = await state.client.auth.updateUser({
        data: { ...(state.user.user_metadata || {}), mi_nucleo_priority: selected }
      });
      if (error) throw error;
      state.user = data.user || state.user;
      state.priority = selected;
      $("#priority-label").textContent = priorities[selected];
      renderProducts();
      $("#priority-dialog").close();
      showToast(`Prioridad actualizada: ${priorities[selected]}.`);
    } catch (error) {
      status.textContent = friendlyError(error);
      status.className = "mi-form-status is-error";
    }
  });

  $$(".mi-filters button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".mi-filters button").forEach((item) => item.classList.toggle("is-active", item === button));
      const visibleProducts = button.dataset.filter === "all"
        ? products
        : products.filter((product) => product.categories.includes(button.dataset.filter));
      $("#explore-grid").innerHTML = visibleProducts.map((product) => productCard(product)).join("");
      bindProductTracking();
    });
  });

  $("#account-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.demo || !state.client) return;
    const status = $("#account-status");
    const name = $("#account-name").value.trim();
    if (!name) {
      status.textContent = "Escribe un nombre para guardar.";
      status.className = "mi-form-status is-error";
      return;
    }
    try {
      const { data, error } = await state.client.auth.updateUser({
        data: { ...(state.user.user_metadata || {}), full_name: name }
      });
      if (error) throw error;
      state.user = data.user || state.user;
      $("#sidebar-name").textContent = displayName(state.user);
      $("#sidebar-avatar").textContent = initials(state.user);
      $("#member-name").textContent = firstName(state.user);
      status.textContent = "Nombre actualizado.";
      status.className = "mi-form-status is-success";
    } catch (error) {
      status.textContent = friendlyError(error);
      status.className = "mi-form-status is-error";
    }
  });

  $("#signout-button").addEventListener("click", async () => {
    if (state.demo || !state.client) return;
    await state.client.auth.signOut();
    state.user = null;
    state.consentRecord = null;
    setPageState("auth");
    setAuthMode("signin");
    setLiveStatus("Sesión cerrada. Volviste al acceso de Mi Núcleo.");
    window.scrollTo({ top: 0, behavior: "auto" });
  });

  $("#download-data-button").addEventListener("click", () => {
    if (state.demo) return;
    const summary = {
      exported_at: new Date().toISOString(),
      account: { email: state.user?.email || null, display_name: displayName(state.user) },
      personalization: { priority: state.priority, label: priorities[state.priority] },
      consent: state.consentRecord || metadataConsent(state.user),
      local_activity: readActivity(),
      note: "Este resumen no incluye datos administrados por productos externos enlazados desde Mi Núcleo."
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mi-nucleo-resumen-datos.json";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Resumen de datos preparado para descarga.");
  });

  $$(".mi-sidebar > nav a").forEach((link) => {
    link.addEventListener("click", () => {
      $$(".mi-sidebar > nav a").forEach((item) => item.classList.toggle("is-active", item === link));
    });
  });

  initialize().catch((error) => {
    setPageState("auth");
    setAuthMode("signin");
    setFormStatus(friendlyError(error), "error");
  });
})();
