# MOVE Select — integración de IA

La interfaz en `prototipos/move/` conversa con `/api/move-assistant`. El servidor utiliza AI SDK 7 y Vercel AI Gateway con la identidad OIDC del proyecto (o `AI_GATEWAY_API_KEY` configurada en el servidor). Ninguna credencial se envía al navegador. El modelo `google/gemini-3.8-flash` se verificó en el catálogo público de Gateway el 6 de septiembre de 2026.

## Alcance

- Catálogo de 50 productos referenciales en `server/move-catalog.json`. Los nombres y precios se validan en el servidor; actualizar este catálogo junto al de la tienda antes de una operación comercial real.
- Comparación de productos y presupuesto por alternativa. Una respuesta puede incluir hasta tres productos; nunca es obligatorio completar tres.
- El paso a la agenda requiere que la persona confirme una derivación. La agenda vuelve a presentar sus verificaciones y sigue sin reservar ni enviar solicitudes reales.
- Ante señales de urgencia se muestra orientación de atención urgente, sin productos ni acceso a reserva ordinaria. El detector por expresiones es conservador y no sustituye una evaluación médica.
- Si la IA falla, se informa el fallo. Las preguntas guiadas continúan disponibles y están identificadas como una experiencia sin IA.

## Datos y límites

El aviso previo al envío pide usar ejemplos ficticios y no ingresar identificadores ni documentos clínicos. El historial existe sólo mientras está abierta la conversación; se envía como contexto al proveedor de IA. MOVE no guarda el contenido en una base de datos. Se registran únicamente ID aleatorio de generación, modelo y cantidades de tokens, o nombre/código de error. La retención del proveedor depende de sus condiciones y no se promete confidencialidad absoluta.

Las peticiones tienen límite de extensión, historial, tiempo y tokens. El control de frecuencia funciona por instancia activa (10 peticiones/minuto por dirección, 250/hora por instancia); no es una cuota global distribuida. Antes de abrir la IA a tráfico comercial, configurar un presupuesto estricto de Gateway y límites distribuidos en la plataforma según el volumen esperado. La demo sigue dentro del sitio público existente.

## Validación

La prueba remota del 6 de septiembre alcanzó el proveedor autenticado, que rechazó la inferencia con `customer_verification_required`: la cuenta de Vercel debe registrar una tarjeta para habilitar AI Gateway. Esto es un requisito del proveedor, no un fallo de la interfaz. La API distingue este estado y la web ofrece las preguntas guiadas. No se ha declarado una generación real exitosa; ejecutar el smoke tras habilitar el servicio.

`npm run test:move` prueba validación de entrada, seguridad, restricciones del catálogo, presupuesto, frecuencia, origen, conversación, carrito, apertura de agenda, errores y renderizado seguro de texto generado. Son pruebas de lógica y DOM, no una certificación clínica ni una inspección visual en dispositivos.

`node scripts/smoke-move-ai.mjs` realiza tres consultas sintéticas a la IA y exige que el modelo compare productos dentro del presupuesto, reconozca una derivación confirmada y pregunte por ella cuando falta. Requiere la identidad OIDC del proyecto o una clave configurada en el entorno y consume inferencia.

`npm run build` genera `public/` a partir de una lista explícita de archivos web. API, documentos internos, pruebas, migraciones, configuraciones y dependencias permanecen fuera de la carpeta pública.

Fuentes técnicas y orientación urgente:
- https://vercel.com/docs/ai-gateway/authentication-and-byok/oidc
- https://ai-gateway.vercel.sh/v1/models
- https://www.minsal.cl/servicios-de-urgencia-cuando-asistir-a-un-recinto-de-atencion-primaria-o-a-un-hospital/
- https://saludresponde.minsal.cl/iam/
