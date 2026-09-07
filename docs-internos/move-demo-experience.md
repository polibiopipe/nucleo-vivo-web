# MOVE — tienda, comparación y agenda de demostración

Actualización del 6 de septiembre de 2026 autorizada por Polibio.

- Inicio con tres acciones: ver productos, solicitar una hora, pedir ayuda para elegir.
- Textos dirigidos al visitante; retirada de afirmaciones de ventas y envío gratuito no confirmadas.
- Chat a pantalla completa, sin panel decorativo, con cabecera y ficha de contexto compactas. La conversación ocupa la altura restante y mantiene un ancho de lectura limitado; el campo de escritura crece sólo al escribir. El presupuesto y los detalles del aviso de IA son desplegables; «Nueva conversación» y «Preguntas guiadas» están en «Opciones».
- Las respuestas extensas se muestran desde el comienzo, sin saltar a la tarjeta final. Si la persona ha retrocedido para leer el historial mientras espera, se conserva su posición. Al consultar un producto, el foco queda en la conversación para poder leer con el teclado sin abrir el teclado de escritura en el móvil.
- Comparación de dos o tres productos con nombre, precio referencial, categoría y datos que debe verificar el comprador. No se inventan materiales, medidas, resistencia ni disponibilidad.
- Las tarjetas de orientación abren preguntas concretas en MOVE Select.
- «Consultar características» muestra nombre, imagen y precio del producto y envía automáticamente una pregunta contextual a Gemini. Las preguntas específicas de las guías y el comparador también se envían al seleccionarlas; el acceso general al chat espera la consulta del visitante.
- La agenda recoge la derivación confirmada en el chat. Se puede volver atrás para corregirla.

## Recorrido para la reunión

1. En MOVE, abrir «Solicitar una hora» y recorrer la agenda con un ejemplo ficticio.
2. Al preparar la solicitud, abrir «Ver solicitud en MOVE Gestión».
3. El panel de Juan Pablo muestra «Paciente de demostración», fecha, hora, modalidad y estado pendiente.
4. «Marcar revisada · demo» conserva ese estado de prueba. «Borrar pruebas» elimina únicamente las solicitudes de esta demo.

La conexión funciona entre pestañas del mismo navegador y origen. No sincroniza dispositivos, dominios distintos ni cuentas. Usa la misma dirección `www.nucleovivo.net` para ambas vistas.

`move-demo.js` permite un máximo de 12 solicitudes mediante la clave `nv-move-demo-requests-v1` de localStorage. Sólo guarda ID sintético, fecha de creación, fecha/horario elegido, modalidad y estado. No guarda nombre ingresado, teléfono, correo, motivo, documentos, especialidad, derivación ni mensajes de IA. Las solicitudes dejan de mostrarse a las 24 horas y se purgan en la siguiente lectura. Si el almacenamiento está bloqueado, la página informa que no pudo guardar la solicitud.

El panel sigue siendo una demostración pública de roles; elegir un perfil no es autenticación ni control de acceso real. No se crean pacientes, cobros, reservas, notificaciones ni cambios de inventario.

## Verificación

28 pruebas pasan: incluyen catálogo, IA, seguridad, carrito, comparación limitada a tres artículos, selección conservada al filtrar, derivación entre chat y agenda, recorrido completo de solicitud ficticia a Gestión, revisión, borrado y rechazo de almacenamiento inválido/expirado. Se verifican las consultas automáticas de los 50 productos con respuestas controladas, Gym Ball desde destacados y ficha, mantenimiento del producto en preguntas posteriores y descarte de respuestas que llegan después de cerrar. También se comprueba la posición de lectura ante respuestas extensas y revisión del historial (con geometría simulada), el foco en la respuesta del producto, la validación del presupuesto desplegable y el cambio a preguntas guiadas. Las pruebas de interfaz usan jsdom; no sustituyen una inspección visual.

La compilación publica 202 archivos mediante una lista explícita. El navegador de trabajo no pudo abrir la vista previa local (`ERR_BLOCKED_BY_CLIENT`), por lo que no se afirma una comprobación visual completa en dispositivos.

Faltan fotos auténticas del local y equipo, fichas de fabricante, ubicación, contacto, horarios y condiciones comerciales confirmados por MOVE. No se sustituyen por datos inventados.
