# Plan de pruebas de RLS y flujo de Aula Viva en staging

## Objetivo
Validar que el módulo Aula Viva en staging mantenga el aislamiento de datos por usuario, permita el recorrido de aprendizaje esperado y no exponga secretos de autenticación o control de acceso en el cliente.

## Precondiciones
- Base de datos staging preparada con la migración de Aula Viva.
- Backup previo completo del entorno staging.
- Usuarios de prueba disponibles: un usuario anónimo, Usuario A, Usuario B y un usuario con rol staff.
- Navegadores limpios o con `localStorage` y cookies borrados.
- Configuración del cliente sin credenciales reales y con el flujo de autenticación habilitado.

## Matriz de pruebas

### 1. Sesión anónima
- Pasos: abrir la interfaz sin iniciar sesión.
- Esperado: no se permite leer ni modificar datos de Aula Viva; la experiencia muestra el estado de acceso y guía al inicio de sesión.

### 2. Usuario A
- Pasos: iniciar sesión como Usuario A.
- Esperado: se crea o reutiliza el perfil con rol `student` y se permite el acceso a los cursos y lecciones que le corresponden.

### 3. Usuario B
- Pasos: iniciar sesión como Usuario B en otra sesión o navegador.
- Esperado: no se ven datos de Usuario A ni se puede operar sobre objetos que no pertenezcan al usuario autenticado.

### 4. Creación automática del perfil student
- Pasos: crear un usuario nuevo desde el flujo de registro o invitación.
- Esperado: se crea automáticamente un registro en `aula_profiles` con `role = 'student'` y sin permitir que la metadata del usuario cambie el rol por cliente.

### 5. Inscripción única
- Pasos: intentar inscribir el mismo usuario al mismo curso más de una vez.
- Esperado: la base rechaza la segunda inscripción, preservando la unicidad por `(user_id, course_id)`.

### 6. Aislamiento entre usuarios
- Pasos: comparar los registros visibles de Usuario A y Usuario B para el mismo curso.
- Esperado: cada usuario ve solo su propio avance y sus propias inscripciones; no se observan datos cruzados.

### 7. Lectura y escritura de progreso propio
- Pasos: registrar progreso en una lección y luego leerlo de nuevo.
- Esperado: el usuario puede insertar y actualizar su propio progreso, y recuperarlo correctamente.

### 8. Bloqueo de lectura y modificación cruzada
- Pasos: intentar leer o modificar registros de progreso o inscripción pertenecientes a otro usuario.
- Esperado: la operación queda bloqueada por RLS y no devuelve ni altera datos ajenos.

### 9. Acceso con `active`
- Pasos: inscribir un usuario con estado `active` y abrir el curso.
- Esperado: se permite el acceso a módulos y lecciones vinculados al curso publicado.

### 10. Acceso con `completed`
- Pasos: actualizar una inscripción a `completed` y volver a entrar al curso.
- Esperado: el acceso sigue permitido para el usuario que completó la inscripción.

### 11. Bloqueo con `paused`
- Pasos: actualizar una inscripción a `paused`.
- Esperado: no se permite el acceso a módulos o lecciones del curso para esa inscripción.

### 12. Intento de modificación de role
- Pasos: intentar cambiar `role` desde el cliente sobre el perfil propio o de otro usuario.
- Esperado: la actualización queda rechazada por RLS y permisos de escritura restringidos.

### 13. Intento de autoelevación a staff
- Pasos: intentar cambiar el propio rol a `facilitator`, `academic_admin` o `admin`.
- Esperado: la operación falla y el usuario permanece en `student`.

### 14. Cierre de sesión
- Pasos: cerrar sesión y refrescar la página.
- Esperado: el estado de autenticación se borra y no quedan datos del usuario visibles desde el cliente.

### 15. Cambio de cuenta en el mismo navegador
- Pasos: iniciar sesión como Usuario A, cerrar sesión y luego entrar como Usuario B en el mismo navegador.
- Esperado: el contexto cambia sin mostrar datos residuales de la cuenta previa.

### 16. Persistencia entre navegadores
- Pasos: ver el mismo curso desde dos navegadores distintos con usuarios diferentes.
- Esperado: el aislamiento se mantiene y no se comparten datos entre sesiones.

### 17. Recuperación de contraseña
- Pasos: usar el flujo de recuperación de contraseña.
- Esperado: el sistema envía el correo de recuperación y permite actualizar la contraseña sin exponer datos sensibles en la interfaz.

### 18. Confirmación de correo
- Pasos: registrar un usuario nuevo o re-enviar confirmación.
- Esperado: el flujo de confirmación funciona y no crea formularios falsos ni estados ambiguos.

### 19. Verificación de que no existe service role key en cliente
- Pasos: inspeccionar el bundle o el código del cliente.
- Esperado: no aparece ninguna `service role key` ni ninguna referencia a credenciales server-side en el frontend.

### 20. Control de `localStorage`
- Pasos: limpiar y volver a cargar la app con distintos usuarios.
- Esperado: el cliente no conserva datos sensibles entre cuentas de forma que permitan bypass de RLS.

## Riesgos pendientes
- El archivo de contenido del curso en [sembrar/aula/curso/ia-con-criterio-humano/course-data.js](sembrar/aula/curso/ia-con-criterio-humano/course-data.js) sigue publicando contenido interno de lecciones y actividades, por lo que hay que revisar si debe moverse a un esquema de datos menos sensible o a un backend controlado antes de abrir el producto a más usuarios.
