# MOVE Select — integración de IA

La interfaz en `prototipos/move/` conversa con `/api/move-assistant`. El servidor llama directamente a la API de Gemini de Google mediante `server/move-gemini.mjs`, sin AI Gateway. Ninguna credencial se envía al navegador. El modelo `gemini-3.8-flash` y el formato de respuesta JSON se verificaron en la documentación oficial de Google el 6 de septiembre de 2026.

## Activación de Gemini

1. Configurar `GEMINI_API_KEY` como variable secreta del proyecto Vercel `nucleo-vivo-web` en Production; también en Preview si se probará ese entorno. Se admite `GOOGLE_GENERATIVE_AI_API_KEY` como alternativa existente. No usar prefijos públicos ni pegar claves en el código o el chat.
2. Si se necesita un modelo distinto disponible para esa cuenta, configurar `MOVE_GEMINI_MODEL`; el valor predeterminado es `gemini-3.8-flash`.
3. Publicar el código actualizado o volver a desplegar después de configurar la variable. Una modificación de variables no actualiza despliegues ya creados.
4. Ejecutar las consultas sintéticas y comprobar `source=ai`. El endpoint GET identifica la versión y el proveedor, pero no demuestra una generación exitosa.

Las claves, cuotas y facturación de Gemini se administran con Google. La conexión ya no depende de la verificación de tarjeta de AI Gateway. Si falta una clave o Google la rechaza, la interfaz mantiene el aviso de activación pendiente; nunca simula una respuesta generada.

## Alcance

- Catálogo de 50 productos referenciales en `server/move-catalog.json`. Los nombres y precios se validan en el servidor; actualizar este catálogo junto al de la tienda antes de una operación comercial real.
- Comparación de productos y presupuesto por alternativa. Una respuesta puede incluir hasta tres productos; nunca es obligatorio completar tres.
- El paso a la agenda requiere que la persona confirme una derivación. La agenda vuelve a presentar sus verificaciones y sigue sin reservar ni enviar solicitudes reales.
- Ante señales de urgencia se muestra orientación de atención urgente, sin productos ni acceso a reserva ordinaria. El detector por expresiones es conservador y no sustituye una evaluación médica.
- Si la IA falla, se informa el fallo. Las preguntas guiadas continúan disponibles y están identificadas como una experiencia sin IA.

## Datos y límites

El aviso previo al envío pide usar ejemplos ficticios y no ingresar identificadores ni documentos clínicos. El historial existe sólo mientras está abierta la conversación; se envía como contexto al proveedor de IA. MOVE no guarda el contenido en una base de datos. Se registran únicamente ID aleatorio de generación, modelo y cantidades de tokens, o nombre/código de error. La retención del proveedor depende de sus condiciones y no se promete confidencialidad absoluta.

Las peticiones tienen límite de extensión, historial, tiempo y tokens. El control de frecuencia funciona por instancia activa (10 peticiones/minuto por dirección, 250/hora por instancia); no es una cuota global distribuida. Antes de abrir la IA a tráfico comercial, configurar cuotas y controles de consumo en Google y límites distribuidos según el volumen esperado. La demo sigue dentro del sitio público existente.

## Validación

La conexión anterior por AI Gateway devolvió `customer_verification_required`. Se sustituyó por la API directa de Gemini. Las pruebas con respuestas controladas verifican el destino Google, las credenciales sólo en cabeceras, el historial, el catálogo, las cuotas y el rechazo de respuestas truncadas o bloqueadas. No se ha confirmado todavía una inferencia real con Google: falta una clave de Gemini configurada y ejecutar el smoke.

`npm run test:move` prueba validación de entrada, seguridad, restricciones del catálogo, presupuesto, frecuencia, origen, conversación, carrito, apertura de agenda, errores y renderizado seguro de texto generado. Son pruebas de lógica y DOM, no una certificación clínica ni una inspección visual en dispositivos.

`node scripts/smoke-move-ai.mjs` realiza tres consultas sintéticas a la IA y exige que el modelo compare productos dentro del presupuesto, reconozca una derivación confirmada y pregunte por ella cuando falta. Requiere `GEMINI_API_KEY` o `GOOGLE_GENERATIVE_AI_API_KEY` en el entorno y consume inferencia de Google. Para cargar un archivo local de secretos: `node --env-file=.env.local scripts/smoke-move-ai.mjs`.

`npm run build` genera `public/` a partir de una lista explícita de archivos web. API, documentos internos, pruebas, migraciones, configuraciones y dependencias permanecen fuera de la carpeta pública.

Fuentes técnicas y orientación urgente:
- https://ai.google.dev/gemini-api/docs/api-key
- https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash
- https://ai.google.dev/gemini-api/docs/generate-content/structured-output
- https://ai.google.dev/api/generate-content
- https://www.minsal.cl/servicios-de-urgencia-cuando-asistir-a-un-recinto-de-atencion-primaria-o-a-un-hospital/
- https://saludresponde.minsal.cl/iam/
