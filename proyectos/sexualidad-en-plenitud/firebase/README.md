# Firebase Spark · Sexualidad en Plenitud
**Estado: 30-10-2026 — preparado, NO conectado, NO habilitado para inscripciones reales.**

## Ubicación
- Página: https://nucleovivo.net/proyectos/sexualidad-en-plenitud/
- Adaptador web: `sep-firebase-live.js`
- Configuración segura inicial: `sep-backend-config.js` (modo `preview`)
- Reglas: `firebase/firestore.rules`
- Índices: `firebase/firestore.indexes.json`

## Por qué Firebase
Se conserva Núcleo Vivo/Vercel como alojamiento de la página y se separa la autenticación y base de datos de las aplicaciones Aula Viva y MSC Safety. No se reutilizan usuarios de otras plataformas. Firebase Spark no necesita método de pago en el alta; está sujeto a cuotas y ciertas funciones no están incluidas.

## Requisitos antes de conectar
1. Crear un proyecto **exclusivo** en Firebase, bajo la cuenta del titular que administrará los datos. Seleccionar Spark sin facturación.
2. Agregar una aplicación web, registrar `nucleovivo.net` como dominio autorizado para Firebase Authentication.
3. Activar email/contraseña y verificación de correo. Configurar restricciones y medidas antiabuso de acuerdo con la consola.
4. Crear base Cloud Firestore (preferir región de Santiago cuando esté disponible). **Comenzar con reglas restrictivas**, no reglas de prueba abiertas.
5. Desplegar `firestore.rules` y `firestore.indexes.json` (Firebase CLI u otro mecanismo oficial) y verificar reglas con Firebase Emulator Suite más cuentas reales de ensayo; no confiar en una cuenta administradora para esa prueba.
6. Crear clubes verificados desde una consola administrativa confiable, después de autorización y verificación con las directivas. Los clientes no pueden crear clubes ni aprobar solicitudes.
7. Designar responsable del tratamiento, contacto verificable para derechos, procedimiento de eliminación de cuentas incluyendo Auth, política de conservación, contrato con encargados, evaluación de impacto y supervisión psicológica.
8. Revisar accesibilidad, seguridad y el tratamiento transfronterizo de datos antes de la apertura.

## Flujo implementado en el adaptador
- Alta de correo y contraseña, envío de verificación de correo.
- Inicio de sesión con correo **verificado**.
- Seudónimo y solicitud de club (elegir club verificado o proponer club pendiente).
- Inscripción en actividades solo después de que la coordinación actualice la membresía.
- Lectura de eventos para todos los clubes verificados o específicamente invitados.
- Solicitud personal de eliminación de datos, no eliminación automática.

## Seguridad y restricciones
- No habilitar chats íntimos, audios, diagnósticos ni evaluaciones con esta configuración.
- No usar correo como nombre público ni exponer padrones de clubes.
- RLS equivalente: Firestore Security Rules con denegación por defecto; usuarios no pueden asignarse `clubId` ni roles profesionales.
- Para moderación profesional y aprobaciones, requerimos consola administrativa segura y gestión trazable (fuera del navegador de usuarios).
- Una solicitud de eliminación debe resolver también Firebase Authentication y copias según políticas aplicables; un documento `privacyRequests` no garantiza supresión.
- Ley 21.719 (Chile) empieza el **1 de diciembre de 2026**. El código preparado NO equivale a certificación legal.

## Cambio de configuración, solo tras pruebas
Actualizar `sep-backend-config.js` con:
- `mode: "live"` y `registrationOpen: true`.
- `controllerName` y `privacyContact` reales, y versión de consentimiento aprobada.
- `firebase: {apiKey, authDomain, projectId, appId}` obtenidos exclusivamente del proyecto Firebase propio.

**Clave pública:** la configuración web de Firebase puede ir en el cliente; los privilegios se aplican mediante Authentication y Firestore Rules. **No insertar** credenciales de cuenta de servicio ni secretos administrativos en el sitio.

## Referencias oficiales
- Inicio: https://firebase.google.com/docs/web/setup
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started
- Cuotas: https://firebase.google.com/docs/firestore/quotas
- Firebase Spark: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- Ley 21.719: https://www.bcn.cl/leychile/Navegar?idNorma=1209272
