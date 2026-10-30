# Sexualidad en Plenitud — plan de activación, privacidad y voluntariado
**30 de octubre de 2026. Estado: demostración pública; cuentas reales cerradas.**

## Modelo comunitario
1. La persona crea su cuenta con correo, contraseña y seudónimo. No se solicitan RUT, antecedentes clínicos, orientación sexual ni fecha de nacimiento.
2. Solicita un club ya registrado, o propone que se incorpore uno nuevo. La solicitud NO equivale a ser integrante validado.
3. Coordinación confirma pertenencia con la directiva de cada club mediante un procedimiento reservado.
4. La app permite solicitar cupo en encuentros realizados en sedes de clubes y en actividades interclubes con clubes previamente invitados.
5. No se publican directorios de miembros ni listas de asistentes.

## Supabase y activación — situación comprobada al 30-10-2026
El proyecto **nucleo-vivo-aula-staging** (ref ygfmpwlpmaasooltjujb) está activo. Aunque Aula Viva prácticamente no tiene contenido académico, **NO es una base vacía**: contiene tablas activas de MSC Safety y otras de Somnograph. Las cuentas comparten auth.users y tres triggers: uno crea aula_profiles y dos revisan la relación con MSC.

Se instaló exclusivamente la migración aditiva **sep_aula_staging_memberships_v1**, documentada en backend/002_sep_aula_staging.sql. Crea nueve tablas nuevas con prefijo sep_ para registro mínimo, clubes y actividades interclubes, consentimientos, roles profesionales y solicitudes sobre derechos. Se verificó RLS en las nueve tablas, permisos de lectura/escritura y ausencia de nuevas alertas de los advisors que nombren sep_. No se modificaron tablas, credenciales ni triggers de Aula, MSC o Somnograph.

**Estado: BASE PREPARADA PARA ENSAYOS SIN USUARIOS, PERO REGISTRO PÚBLICO NO ABIERTO.** El archivo sep-backend-config.js continúa con mode: preview y registrationOpen: false. El esquema implementado no permite por sí solo separar las sesiones Auth de los otros productos.

Condiciones particulares antes de habilitar cuentas:
1. Definir responsable identificable del tratamiento y contacto de privacidad, con textos aprobados de información y consentimiento.
2. Decidir y verificar solución de identidad: al crear un usuario se dispara actualmente un trigger de Aula y dos de MSC. No modificar estos triggers sin pruebas de regresión de las aplicaciones existentes.
3. Ejecutar pruebas adversariales de RLS con usuarios reales de prueba y confirmar que una cuenta nueva no da acceso involuntario a otros módulos.
4. Validar procedimientos de afiliación e inscripción con las directivas de clubes, sin inventar convenios.
5. Revisión de riesgos de co-alojamiento y retención; mantener deshabilitados los relatos íntimos mientras siga compartida esta base.
6. Realizar EIPD, revisión jurídica y protección de credenciales de profesionales.

**No activar automáticamente el modo live ni introducir conversaciones sensibles.** Si el proyecto escala más allá de un piloto de mínima información, evaluar migración a una base independiente antes de tratar datos de sexualidad.
 
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
