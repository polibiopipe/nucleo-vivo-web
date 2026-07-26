(() => {
  "use strict";

  const DEFAULT_CONFIG = Object.freeze({
    supabaseUrl: "",
    supabaseAnonKey: "",
    previewMode: true,
    enableRemoteSync: true,
    courseSlug: "ia-con-criterio-humano",
    privacyVersion: "2026-07-25",
    organizationName: "Nucleo Vivo"
  });

  const CONFIG = Object.freeze({ ...DEFAULT_CONFIG, ...(window.AULA_VIVA_CONFIG || {}) });
  const COURSE_SLUG = CONFIG.courseSlug || DEFAULT_CONFIG.courseSlug;
  const LOCAL_KEY = "nv-aula-viva-v1";
  const hasSupabaseConfig = Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
  const hasSupabase = Boolean(hasSupabaseConfig && window.supabase?.createClient);
  const client = hasSupabase
    ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;

  function emptyStore() {
    return {
      user: null,
      enrollments: {},
      progress: {},
      accessibility: {},
      sync: {
        previewClaimedBy: null,
        lastRemoteUserId: null,
        lastSyncedAt: null,
        lastSyncMessage: null
      },
      remoteCache: {}
    };
  }

  function normalizeStore(value = {}) {
    const base = emptyStore();
    return {
      ...base,
      ...value,
      enrollments: value.enrollments || {},
      progress: value.progress || {},
      accessibility: value.accessibility || {},
      sync: { ...base.sync, ...(value.sync || {}) },
      remoteCache: value.remoteCache || {}
    };
  }

  function readLocal() {
    try {
      return normalizeStore(JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"));
    } catch {
      return emptyStore();
    }
  }

  function writeLocal(next) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(normalizeStore(next)));
  }

  function setLocalUser(user) {
    const store = readLocal();
    const previousIdentity = store.user?.email || store.user?.id || null;
    const nextIdentity = user?.email || user?.id || null;
    if (previousIdentity && nextIdentity && previousIdentity !== nextIdentity) {
      store.enrollments = {};
      store.progress = {};
      store.sync.previewClaimedBy = null;
      store.sync.lastSyncMessage = "Se inicio una nueva cuenta de vista previa. El avance local anterior no se muestra en esta sesion.";
    }
    store.user = user;
    writeLocal(store);
  }

  function getLocalUser() {
    return readLocal().user || null;
  }

  function getConnectionState() {
    if (hasSupabase) return { mode: "supabase", ready: true };
    if (hasSupabaseConfig) {
      return {
        mode: "misconfigured",
        ready: false,
        message: "La configuracion publica de Supabase existe, pero la libreria no pudo cargarse."
      };
    }
    return {
      mode: CONFIG.previewMode ? "preview" : "unconfigured",
      ready: Boolean(CONFIG.previewMode),
      message: CONFIG.previewMode
        ? "Vista previa local activa. El avance se guarda solamente en este navegador."
        : "Falta configurar Supabase para habilitar cuentas reales."
    };
  }

  function getRedirectUrl() {
    return new URL("/sembrar/aula/", window.location.origin).toString();
  }

  async function getSession() {
    if (!client) return { user: getLocalUser(), mode: CONFIG.previewMode ? "preview" : "local" };
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return { user: data.session?.user || null, mode: "supabase" };
  }

  function isRecoverySession() {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    return hash.get("type") === "recovery" || query.get("type") === "recovery";
  }

  async function signUp({ email, password, name, consent }) {
    if (!consent) throw new Error("Debes aceptar la informacion de privacidad para crear la cuenta.");
    if (!client) {
      const user = {
        id: "preview-user",
        email,
        user_metadata: { full_name: name || "Participante" }
      };
      setLocalUser(user);
      return { user, preview: true };
    }

    const acceptedAt = new Date().toISOString();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl(),
        data: {
          full_name: name || "",
          aula_privacy_version: CONFIG.privacyVersion || DEFAULT_CONFIG.privacyVersion,
          aula_privacy_accepted_at: acceptedAt,
          aula_privacy_source: "signup"
        }
      }
    });
    if (error) throw error;
    return data;
  }

  async function signIn({ email, password }) {
    if (!client) {
      const user = {
        id: "preview-user",
        email,
        user_metadata: { full_name: email.split("@")[0] || "Participante" }
      };
      setLocalUser(user);
      return { user, preview: true };
    }
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function resendConfirmation(email) {
    const normalizedEmail = String(email || "").trim();
    if (!normalizedEmail) throw new Error("Escribe tu correo para reenviar la confirmacion.");
    if (!client) return { preview: true };
    const { data, error } = await client.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: { emailRedirectTo: getRedirectUrl() }
    });
    if (error) throw error;
    return data;
  }

  async function resetPassword(email) {
    const normalizedEmail = String(email || "").trim();
    if (!normalizedEmail) throw new Error("Escribe tu correo para solicitar el restablecimiento.");
    if (!client) return { preview: true };
    const { data, error } = await client.auth.resetPasswordForEmail(normalizedEmail, { redirectTo: getRedirectUrl() });
    if (error) throw error;
    return data;
  }

  async function updatePassword(password) {
    if (!client) throw new Error("La actualizacion de contrasena requiere Supabase configurado.");
    if (!password || password.length < 8) throw new Error("La contrasena debe tener al menos 8 caracteres.");
    const { data, error } = await client.auth.updateUser({ password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!client) {
      const store = readLocal();
      store.user = null;
      writeLocal(store);
      return;
    }
    const { error } = await client.auth.signOut();
    if (error) throw error;
    const store = readLocal();
    store.remoteCache = {};
    store.sync.lastRemoteUserId = null;
    writeLocal(store);
  }

  async function resolveCourse() {
    if (!client) return { id: "preview-course", slug: COURSE_SLUG };
    const { data, error } = await client
      .from("aula_courses")
      .select("id, slug, title, status")
      .eq("slug", COURSE_SLUG)
      .single();
    if (error) throw error;
    return data;
  }

  async function fetchRemoteEnrollment(user, course) {
    const { data, error } = await client
      .from("aula_enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function upsertRemoteEnrollment(user, course) {
    const { data, error } = await client
      .from("aula_enrollments")
      .upsert(
        { user_id: user.id, course_id: course.id, status: "active", last_accessed_at: new Date().toISOString() },
        { onConflict: "user_id,course_id" }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function enroll() {
    const { user } = await getSession();
    if (!user) throw new Error("Debes iniciar sesion antes de inscribirte.");
    if (!client) {
      const store = readLocal();
      store.enrollments[COURSE_SLUG] = store.enrollments[COURSE_SLUG] || {
        enrolled_at: new Date().toISOString(),
        status: "active"
      };
      writeLocal(store);
      return store.enrollments[COURSE_SLUG];
    }
    const course = await resolveCourse();
    return upsertRemoteEnrollment(user, course);
  }

  async function getEnrollment() {
    const { user } = await getSession();
    if (!user) return null;
    if (!client) return readLocal().enrollments[COURSE_SLUG] || null;
    const course = await resolveCourse();
    return fetchRemoteEnrollment(user, course);
  }

  async function resolveLesson(lessonSlug) {
    const course = await resolveCourse();
    if (!client) return { id: lessonSlug, slug: lessonSlug, course_id: course.id };
    const { data, error } = await client
      .from("aula_lessons")
      .select("id, slug, course_id")
      .eq("course_id", course.id)
      .eq("slug", lessonSlug)
      .single();
    if (error) throw error;
    return data;
  }

  async function fetchRemoteProgress(user, course) {
    const { data: lessonRows, error: lessonError } = await client
      .from("aula_lessons")
      .select("id, slug")
      .eq("course_id", course.id);
    if (lessonError) throw lessonError;
    if (!lessonRows?.length) return {};

    const lessonSlugById = Object.fromEntries(lessonRows.map(row => [row.id, row.slug]));
    const { data, error } = await client
      .from("aula_lesson_progress")
      .select("lesson_id, status, percent, response, confidence, completed_at, updated_at")
      .eq("user_id", user.id)
      .in("lesson_id", lessonRows.map(row => row.id));
    if (error) throw error;

    return Object.fromEntries((data || []).map(row => [
      lessonSlugById[row.lesson_id],
      {
        status: row.status,
        percent: row.percent,
        response: row.response,
        confidence: row.confidence,
        completed_at: row.completed_at,
        updated_at: row.updated_at
      }
    ]));
  }

  function buildProgressPayload(values = {}) {
    return {
      status: values.status || "in_progress",
      percent: Number.isFinite(values.percent) ? values.percent : (values.status === "completed" ? 100 : 0),
      response: values.response ?? null,
      confidence: values.confidence ?? null,
      completed_at: values.status === "completed" ? (values.completed_at || new Date().toISOString()) : null,
      updated_at: new Date().toISOString()
    };
  }

  async function saveRemoteProgress(lessonSlug, values = {}) {
    const { user } = await getSession();
    if (!user) throw new Error("Debes iniciar sesion para guardar el avance.");
    const lesson = await resolveLesson(lessonSlug);
    const payload = buildProgressPayload(values);
    const { data, error } = await client
      .from("aula_lesson_progress")
      .upsert(
        { user_id: user.id, lesson_id: lesson.id, ...payload },
        { onConflict: "user_id,lesson_id" }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  function progressRank(item = {}) {
    const statusScore = item.status === "completed" ? 200 : item.status === "in_progress" ? 100 : 0;
    return statusScore + Number(item.percent || 0);
  }

  function isLocalAhead(localItem, remoteItem) {
    if (!localItem) return false;
    if (!remoteItem) return true;
    const localRank = progressRank(localItem);
    const remoteRank = progressRank(remoteItem);
    if (localRank !== remoteRank) return localRank > remoteRank;
    const localUpdated = Date.parse(localItem.updated_at || localItem.completed_at || 0);
    const remoteUpdated = Date.parse(remoteItem.updated_at || remoteItem.completed_at || 0);
    return Boolean(localUpdated && remoteUpdated && localUpdated > remoteUpdated && localRank > 0);
  }

  async function syncPreviewProgress() {
    if (!client || CONFIG.enableRemoteSync === false) return { mode: "preview", merged: 0, skipped: true };
    const { user } = await getSession();
    if (!user) return { mode: "supabase", merged: 0, skipped: true };

    const store = readLocal();
    const localProgress = store.progress[COURSE_SLUG] || {};
    const localEnrollment = store.enrollments[COURSE_SLUG] || null;
    const localItems = Object.entries(localProgress).filter(([, value]) => value && typeof value === "object");
    if (!localEnrollment && localItems.length === 0) {
      store.sync.lastRemoteUserId = user.id;
      writeLocal(store);
      return { mode: "supabase", merged: 0, skipped: true };
    }

    if (store.sync.previewClaimedBy && store.sync.previewClaimedBy !== user.id) {
      store.sync.lastRemoteUserId = user.id;
      store.sync.lastSyncMessage = "El avance local pertenece a otra cuenta. Se mostrara solamente el progreso remoto.";
      writeLocal(store);
      return { mode: "supabase", merged: 0, skipped: true, reason: "claimed-by-other-user" };
    }

    store.sync.previewClaimedBy = store.sync.previewClaimedBy || user.id;
    writeLocal(store);

    const course = await resolveCourse();
    const remoteEnrollment = await fetchRemoteEnrollment(user, course);
    const enrollmentStatus = remoteEnrollment?.status || null;
    const canSyncProgress = enrollmentStatus === "active" || enrollmentStatus === "completed";

    if (!canSyncProgress) {
      const latest = readLocal();
      latest.sync.previewClaimedBy = user.id;
      latest.sync.lastRemoteUserId = user.id;
      latest.sync.lastSyncedAt = new Date().toISOString();
      latest.sync.lastSyncMessage = remoteEnrollment?.status === "paused"
        ? "Tu inscripcion esta pausada. El avance local no se sincronizo con el aula remota."
        : localEnrollment
          ? "Encontramos una inscripcion local de vista previa, pero la matricula remota debe realizarse desde el boton Inscribirme."
          : "Tu aula remota esta lista. Inscribete para comenzar a guardar progreso.";
      writeLocal(latest);
      return { mode: "supabase", merged: 0, skipped: true, message: latest.sync.lastSyncMessage };
    }

    let merged = 0;
    const remoteProgress = await fetchRemoteProgress(user, course);
    for (const [lessonSlug, localItem] of localItems) {
      if (!isLocalAhead(localItem, remoteProgress[lessonSlug])) continue;
      await saveRemoteProgress(lessonSlug, localItem);
      merged += 1;
    }

    const latest = readLocal();
    latest.sync.previewClaimedBy = user.id;
    latest.sync.lastRemoteUserId = user.id;
    latest.sync.lastSyncedAt = new Date().toISOString();
    latest.sync.lastSyncMessage = merged
      ? "Sincronizamos tu avance local compatible con tu cuenta."
      : "Tu progreso remoto ya estaba igual o mas avanzado.";
    writeLocal(latest);
    return { mode: "supabase", merged, skipped: false, message: latest.sync.lastSyncMessage };
  }

  async function getProgress() {
    const { user } = await getSession();
    if (!user) return {};
    if (!client) return readLocal().progress[COURSE_SLUG] || {};

    const course = await resolveCourse();
    const progress = await fetchRemoteProgress(user, course);
    const store = readLocal();
    store.remoteCache[user.id] = {
      ...(store.remoteCache[user.id] || {}),
      [COURSE_SLUG]: { progress, cached_at: new Date().toISOString() }
    };
    store.sync.lastRemoteUserId = user.id;
    writeLocal(store);
    return progress;
  }

  async function saveProgress(lessonSlug, values = {}) {
    const { user } = await getSession();
    if (!user) throw new Error("Debes iniciar sesion para guardar el avance.");
    const payload = buildProgressPayload(values);
    if (!client) {
      const store = readLocal();
      store.progress[COURSE_SLUG] ||= {};
      store.progress[COURSE_SLUG][lessonSlug] = {
        ...(store.progress[COURSE_SLUG][lessonSlug] || {}),
        ...payload
      };
      writeLocal(store);
      return store.progress[COURSE_SLUG][lessonSlug];
    }
    return saveRemoteProgress(lessonSlug, payload);
  }

  function getAccessibility() {
    return readLocal().accessibility;
  }

  function saveAccessibility(settings) {
    const store = readLocal();
    store.accessibility = { ...store.accessibility, ...settings };
    writeLocal(store);
    applyAccessibility(store.accessibility);
  }

  function applyAccessibility(settings = getAccessibility()) {
    const root = document.documentElement;
    root.classList.toggle("aula-large-text", Boolean(settings.largeText));
    root.classList.toggle("aula-reduced-motion", Boolean(settings.reducedMotion));
    root.classList.toggle("aula-high-contrast", Boolean(settings.highContrast));
  }

  function friendlyError(error) {
    const message = String(error?.message || error || "");
    if (/Invalid login credentials/i.test(message)) return "Correo o contrasena incorrectos.";
    if (/Email not confirmed/i.test(message)) return "Confirma tu correo antes de ingresar.";
    if (/already registered|already exists|User already/i.test(message)) return "Ese correo ya tiene una cuenta.";
    if (/Failed to fetch|NetworkError|Load failed|fetch/i.test(message)) return "No pudimos conectar con el aula. Revisa tu conexion e intenta nuevamente.";
    if (/JWT|policy|permission denied|schema|relation|violates/i.test(message)) return "No pudimos completar la accion. Intenta nuevamente o contacta a Nucleo Vivo.";
    return message || "No pudimos completar la accion.";
  }

  function onAuthStateChange(callback) {
    if (!client) return { unsubscribe() {} };
    const { data } = client.auth.onAuthStateChange((_event, session) => callback(session?.user || null));
    return data.subscription;
  }

  window.AulaViva = Object.freeze({
    config: CONFIG,
    client,
    hasSupabase,
    hasSupabaseConfig,
    courseSlug: COURSE_SLUG,
    getConnectionState,
    getSession,
    isRecoverySession,
    signUp,
    signIn,
    resendConfirmation,
    resetPassword,
    updatePassword,
    signOut,
    enroll,
    getEnrollment,
    getProgress,
    saveProgress,
    syncPreviewProgress,
    getAccessibility,
    saveAccessibility,
    applyAccessibility,
    friendlyError,
    onAuthStateChange
  });
})();
