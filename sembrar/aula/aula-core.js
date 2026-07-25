(() => {
  "use strict";

  const CONFIG = window.AULA_VIVA_CONFIG || {};
  const COURSE_SLUG = CONFIG.courseSlug || "ia-con-criterio-humano";
  const LOCAL_KEY = "nv-aula-viva-v1";
  const hasSupabase = Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && window.supabase?.createClient);
  const client = hasSupabase
    ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;

  function readLocal() {
    try {
      const value = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
      return {
        user: value.user || null,
        enrollments: value.enrollments || {},
        progress: value.progress || {},
        accessibility: value.accessibility || {}
      };
    } catch {
      return { user: null, enrollments: {}, progress: {}, accessibility: {} };
    }
  }

  function writeLocal(next) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  }

  function getLocalUser() {
    const store = readLocal();
    return store.user || null;
  }

  async function getSession() {
    if (!client) return { user: getLocalUser(), mode: CONFIG.previewMode ? "preview" : "local" };
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return { user: data.session?.user || null, mode: "supabase" };
  }

  async function signUp({ email, password, name, consent }) {
    if (!consent) throw new Error("Debes aceptar la información de privacidad para crear la cuenta.");
    if (!client) {
      const store = readLocal();
      store.user = { id: "preview-user", email, user_metadata: { full_name: name || "Participante" } };
      writeLocal(store);
      return { user: store.user, preview: true };
    }
    const redirect = new URL("/sembrar/aula/", window.location.origin).toString();
    const acceptedAt = new Date().toISOString();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirect,
        data: {
          full_name: name || "",
          aula_privacy_version: CONFIG.privacyVersion || "2026-07-25",
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
      const store = readLocal();
      store.user = {
        id: "preview-user",
        email,
        user_metadata: { full_name: email.split("@")[0] || "Participante" }
      };
      writeLocal(store);
      return { user: store.user, preview: true };
    }
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function resetPassword(email) {
    const normalizedEmail = String(email || "").trim();
    if (!normalizedEmail) throw new Error("Escribe tu correo para solicitar el restablecimiento.");
    if (!client) return { preview: true };
    const redirectTo = new URL("/sembrar/aula/", window.location.origin).toString();
    const { data, error } = await client.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
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

  async function enroll() {
    const { user } = await getSession();
    if (!user) throw new Error("Debes iniciar sesión antes de inscribirte.");
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

  async function getEnrollment() {
    const { user } = await getSession();
    if (!user) return null;
    if (!client) return readLocal().enrollments[COURSE_SLUG] || null;
    const course = await resolveCourse();
    const { data, error } = await client
      .from("aula_enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    if (error) throw error;
    return data;
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

  async function getProgress() {
    const { user } = await getSession();
    if (!user) return {};
    if (!client) return readLocal().progress[COURSE_SLUG] || {};

    const course = await resolveCourse();
    const { data: lessonRows, error: lessonError } = await client
      .from("aula_lessons")
      .select("id, slug")
      .eq("course_id", course.id);
    if (lessonError) throw lessonError;
    if (!lessonRows?.length) return {};

    const lessonSlugById = Object.fromEntries(lessonRows.map(row => [row.id, row.slug]));
    const { data, error } = await client
      .from("aula_lesson_progress")
      .select("lesson_id, status, percent, response, confidence, completed_at")
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
        completed_at: row.completed_at
      }
    ]));
  }

  async function saveProgress(lessonSlug, values = {}) {
    const { user } = await getSession();
    if (!user) throw new Error("Debes iniciar sesión para guardar el avance.");
    const payload = {
      status: values.status || "in_progress",
      percent: Number.isFinite(values.percent) ? values.percent : (values.status === "completed" ? 100 : 0),
      response: values.response ?? null,
      confidence: values.confidence ?? null,
      completed_at: values.status === "completed" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };
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
    const lesson = await resolveLesson(lessonSlug);
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

  function onAuthStateChange(callback) {
    if (!client) return { unsubscribe() {} };
    const { data } = client.auth.onAuthStateChange((_event, session) => callback(session?.user || null));
    return data.subscription;
  }

  window.AulaViva = Object.freeze({
    config: CONFIG,
    client,
    hasSupabase,
    courseSlug: COURSE_SLUG,
    getSession,
    signUp,
    signIn,
    resetPassword,
    signOut,
    enroll,
    getEnrollment,
    getProgress,
    saveProgress,
    getAccessibility,
    saveAccessibility,
    applyAccessibility,
    onAuthStateChange
  });
})();
