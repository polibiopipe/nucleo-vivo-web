# Mi Núcleo — preparación de autenticación

Este documento describe la configuración manual pendiente. No contiene secretos ni sustituye la validación en los paneles de Supabase y Google Cloud.

## A. Supabase Authentication / Email

1. Abrir el proyecto de Supabase que actualmente utiliza Aula Viva.
2. Ir a **Authentication → Providers → Email**.
3. Confirmar que el acceso por correo y contraseña está habilitado.
4. Revisar límites de envío, plantillas y remitente antes de abrir el registro a público.
5. No copiar claves privadas, `service_role` ni credenciales SMTP al repositorio o al navegador.

## B. Confirm Email

1. Mantener **Confirm email** habilitado para el registro público.
2. Revisar en el panel las plantillas de confirmación y reenvío.
3. Confirmar que el enlace termina en una Redirect URL autorizada de Mi Núcleo.
4. Validar con una cuenta de prueba que, después de confirmar, la sesión llega al gate de consentimiento o al dashboard si ya existe consentimiento vigente.

## C. Site URL

Configurar la **Site URL** con el origen público canónico que realmente vaya a usarse.

- Valor: **obtener/confirmar desde el hosting y el propietario del dominio**.
- No usar una URL supuesta ni un preview temporal como valor definitivo.
- La Site URL debe usar HTTPS en staging público y producción.

## D. Redirect URLs necesarias

Agregar una URL exacta por cada origen autorizado, siempre con la ruta `/mi-nucleo/`:

- `<ORIGEN_STAGING — obtener desde el hosting>/mi-nucleo/`
- `<ORIGEN_PRODUCCIÓN — obtener/confirmar con el propietario>/mi-nucleo/`
- `<ORIGEN_LOCAL — solo si se ejecutará E2E local>/mi-nucleo/`

El frontend construye los redirects con el mismo origen actual y la ruta `/mi-nucleo/`. Estas entradas cubren registro, reenvío de confirmación, recuperación de contraseña y Google OAuth.

## E. SMTP para usuarios públicos

Antes de invitar usuarios reales, configurar un SMTP propio en Supabase.

- Proveedor, host, puerto, usuario y contraseña: **obtener desde el proveedor SMTP**.
- Remitente y dominio verificado: **obtener/confirmar desde el proveedor de correo**.
- Guardar la contraseña únicamente en el panel seguro de Supabase.
- Probar entrega, remitente, enlaces, spam y límites con cuentas controladas.

## F. Supabase Authentication / Google provider

1. Mantener Google deshabilitado hasta completar los apartados G, H e I.
2. En **Authentication → Providers → Google**, ingresar las credenciales del cliente web obtenidas desde Google Cloud.
3. Guardar y habilitar el proveedor únicamente cuando la URI de callback coincida exactamente.

## G. Google OAuth Web Client

1. En Google Cloud, seleccionar el proyecto correcto: **obtener desde Google Cloud y confirmar con el propietario**.
2. Configurar la pantalla de consentimiento OAuth con los datos y dominios autorizados del propietario.
3. Crear o reutilizar un cliente de tipo **Web application**.
4. No guardar Client ID, Client Secret ni tokens en archivos frontend.

## H. Callback URI

Copiar literalmente la **Callback URL** que muestra Supabase en la configuración del proveedor Google.

- Valor: **obtener desde Supabase Authentication → Providers → Google**.
- Pegar esa URI en **Authorized redirect URIs** del cliente web de Google.
- No construirla manualmente ni inferir el identificador del proyecto.

## I. Dónde ingresar Client ID y Client Secret

- **Google Cloud:** crear/administrar el cliente web y sus redirect URIs.
- **Supabase:** ingresar Client ID y Client Secret en **Authentication → Providers → Google**.
- **Repositorio/frontend:** no ingresar ninguno de esos valores.

## J. Cuándo cambiar `enableGoogleAuth`

Cambiar `mi-nucleo/mi-nucleo-config.js` de `false` a `true` solamente después de cumplir, en este orden:

1. Cliente web creado y pantalla de consentimiento preparada en Google Cloud.
2. Callback URL de Supabase copiada exactamente en Google Cloud.
3. Client ID y Client Secret guardados en el panel de Supabase.
4. Proveedor Google habilitado en Supabase.
5. Site URL y Redirect URLs de staging verificadas.
6. Preview revisable disponible para ejecutar el E2E.

El cambio debe hacerse en un commit independiente y revisado. Primero se valida en staging; después se decide cualquier habilitación de producción.

## K. Checklist E2E final

- [ ] Registro por correo crea una cuenta de prueba y solicita confirmación.
- [ ] Confirmación de correo vuelve a `/mi-nucleo/` y abre consentimiento/dashboard correctamente.
- [ ] Reenvío de confirmación entrega un enlace válido sin revelar si una cuenta existe.
- [ ] Login por correo funciona después de confirmar.
- [ ] La sesión persiste al recargar y al abrir una nueva pestaña controlada.
- [ ] Logout elimina la sesión visible y vuelve al acceso.
- [ ] Recuperación envía el enlace y el callback muestra el formulario de nueva contraseña.
- [ ] La nueva contraseña permite volver al gate de consentimiento/dashboard.
- [ ] Un usuario sin consentimiento vigente ve el gate y puede aceptarlo.
- [ ] Un usuario con consentimiento vigente entra al dashboard.
- [ ] Onboarding y prioridad inicial funcionan sin cambiar Aula Viva.
- [ ] Google OAuth vuelve a `/mi-nucleo/` y pasa por consentimiento/dashboard.
- [ ] El botón Google solo aparece con `enableGoogleAuth: true`.
- [ ] `?demo=1` no carga Supabase, no crea sesión y no persiste datos.
- [ ] Los enlaces a Empresa Viva, Umbral Docente y Escucha Viva abren los productos reales.
- [ ] No se aplicó ninguna migración ni se modificó una base de datos durante la preparación.
