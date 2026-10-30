// Sexualidad en Plenitud: Firebase Spark separado de otros proyectos.
// Modo demostración: NO recopila datos personales ni habilita cuentas reales.
// Solo cambiar a live después de conectar Firebase, desplegar reglas, ejecutar
// pruebas de seguridad con cuentas de ensayo y aprobar política de privacidad.
window.SEP_CONFIG = Object.freeze({
  provider: "firebase",
  mode: "preview",
  registrationOpen: false,
  sensitiveDiscussionsEnabled: false,
  controllerName: "",
  privacyContact: "",
  privacyVersion: "sep-pilot-2026-10-30",
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    appId: ""
  }
});
