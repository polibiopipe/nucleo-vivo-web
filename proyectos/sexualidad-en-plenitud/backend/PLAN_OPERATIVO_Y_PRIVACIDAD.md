# Sexualidad en Plenitud — plan de activación, privacidad y voluntariado
**30 de octubre de 2026. Estado: demostración pública; cuentas reales cerradas.**

## Modelo comunitario
1. La persona crea su cuenta con correo, contraseña y seudónimo. No se solicitan RUT, antecedentes clínicos, orientación sexual ni fecha de nacimiento.
2. Solicita un club ya registrado, o propone que se incorpore uno nuevo. La solicitud NO equivale a ser integrante validado.
3. Coordinación confirma pertenencia con la directiva de cada club mediante un procedimiento reservado.
4. La app permite solicitar cupo en encuentros realizados en sedes de clubes y en actividades interclubes con clubes previamente invitados.
5. No se publican directorios de miembros ni listas de asistentes.

## Supabase y activación
Se preparó el SQL backend/001_sep_schema_dedicated_only.sql para un proyecto Supabase independiente, con tablas de clubes, afiliaciones solicitadas, perfiles mínimos, eventos, consentimientos y peticiones sobre datos. Incluye políticas de seguridad por fila (RLS). Las funciones de publicación de conversaciones íntimas permanecen deshabilitadas.

**No ejecutar el esquema en Núcleo Vivo Aula ni en bases de MSC Safety o Escucha Viva.** El entorno activo de Aula comparte la autenticación y contiene advertencias de seguridad preexistentes. El antiguo proyecto Núcleo Vivo Conecta no se pudo restaurar porque la organización alcanzó el límite de dos proyectos gratuitos activos. No se pausó ningún proyecto ni se autorizó un gasto.

La configuración pública sep-backend-config.js deja registro real deshabilitado. Para activarlo deben definirse responsable legal y contacto verificable, proyecto aislado, revisión de riesgos, consentimiento validado y pruebas adversariales.

## Ley chilena 21.719
Fuente oficial: Biblioteca del Congreso Nacional, https://www.bcn.cl/leychile/Navegar?idNorma=1209272&idVersion=2026-12-01. Su entrada en vigencia está prevista para el **1 de diciembre de 2026**. Hasta el 30 de noviembre de 2026 rige el régimen correspondiente de la Ley 19.628.

La nueva ley clasifica información sobre vida sexual, orientación sexual, identidad de género, salud y otras circunstancias íntimas como **datos sensibles**. Para este proyecto:
- Finalidad: diferenciar acceso a la comunidad, gestión de actividades, psicoeducación y eventual evaluación.
- Consentimiento previo, libre, informado y específico; la evaluación/investigación no es condición de inscripción.
- Transparencia: identificar responsable, finalidades, destinatarios, encargados, transferencia internacional, periodo de conservación y forma de ejercer derechos.
- Derechos: acceso, rectificación, supresión, portabilidad, oposición y revocación según corresponda. Debe existir una respuesta verificable.
- Seguridad: mínimo privilegio, MFA profesional, cifrado de transporte, rotación de claves, RLS comprobado, control de sesiones, alertas y respuesta a incidentes.
- Voz: priorizar dictado en el dispositivo cuando sea posible, ofrecer revisión antes de enviar y NO guardar audio por defecto. Evaluar terceros que procesan la transcripción.
- Comunidades pequeñas: los relatos sin nombre también pueden identificar indirectamente; no publicar historias clínicas ni conversaciones sensibles hasta verificar medidas adecuadas.

## Evaluación de impacto y ética
Realizar una evaluación de impacto de protección de datos y revisión ética antes de tener participantes reales. Debe contemplar identificación indirecta en clubes, estafas, acoso, presión de grupo, difusión de experiencias de viudez, error del dictado, exposición de orientación sexual, quejas, filtraciones y transferencias transfronterizas.

Diseñar consentimiento claro, confidencialidad con límites explícitos, protocolo de denuncias, atención/derivación ante violencia o crisis, accesibilidad auditiva, visual y cognitiva, supresión y respaldos, plan de incidentes. No ofrecer terapia ni emergencias por chat.

## Roles de voluntariado
- Coordinación: valida clubes y autoriza actividades, con registro de decisiones.
- Psicólogos acreditados: facilitan psicoeducación y moderación dentro de su competencia, con supervisión y autocuidado.
- Estudiantes: apoyan observación comunitaria y alfabetización tecnológica bajo supervisión; no asumen actos clínicos autónomos.
- Personas mayores: participan en decisiones, prueban accesibilidad, proponen temas y pueden guardar silencio.
- Los psicólogos no reciben por defecto una lista con correos, identidad legal, diagnósticos o historial de toda la comunidad.

## Etapas de intervención
1. Diagnóstico participativo de necesidades y comunicación; evitar presentar una dificultad como probada si aún no fue observada.
2. Presentación del piloto y capacitación digital voluntaria.
3. Seis sesiones propuestas sobre sexualidad, autonomía, mitos, consentimiento, género, intimidad, autoestima, vínculos y derechos, con materiales accesibles.
4. Conversaciones digitales moderadas que complementan encuentros presenciales en sedes acordadas.
5. Evaluación de comodidad para conversar, conocimientos, seguridad psicológica, satisfacción y efectos negativos; pre/post descriptivo y seguimiento cuando proceda.
6. Revisión conjunta de resultados, modificación y decisión sobre continuidad.

## Condiciones previas a inscripción real
- [ ] Responsable legal y contacto de privacidad identificados públicamente.
- [ ] Backend Supabase dedicado con costo aprobado.
- [ ] Esquema instalado y RLS probado entre al menos dos cuentas sin permisos administrativos.
- [ ] Confirmación de correo, protección antiabuso, control de cuentas y MFA para responsables.
- [ ] Convenios con los clubes, política de tratamiento, consentimiento y plazos de retención.
- [ ] Acceso, corrección, eliminación real de cuenta (incluyendo Auth), consentimiento y auditoría probados.
- [ ] Supervisión de voluntarios, validación de credenciales, redes de derivación y protocolos.
- [ ] Revisión de proveedores, seguridad e impacto de transferencias internacionales.
- [ ] Pruebas de accesibilidad y seguridad con datos ficticios, antes de activar datos reales.

**No afirmar cumplimiento legal integral solo por incorporar un formulario o RLS.** Requiere evidencias y revisión jurídica, clínica y de seguridad antes del lanzamiento.
