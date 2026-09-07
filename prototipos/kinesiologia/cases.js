export const references={
 rosa:{title:'Sonne et al. · ROSA (2012)',url:'https://doi.org/10.1016/j.apergo.2011.03.008',note:'Selección del método para puestos de oficina. Este prototipo no calcula una puntuación ROSA.'},
 osha:{title:'OSHA · Puestos de computador',url:'https://www.osha.gov/etools/computer-workstations/positions',note:'Referencias para el apoyo de pies, posición de codos y variación postural.'},
 monitor:{title:'OSHA · Posición del monitor',url:'https://www.osha.gov/etools/computer-workstations/components/monitors',note:'Posición de pantalla, visión y disposición del puesto.'},
 niosh:{title:'NIOSH · Manual RNLE, revisión 2021',url:'https://stacks.cdc.gov/view/cdc/110725',note:'Ecuación revisada de levantamiento. Secciones 1.3–1.4 y 2.1; multiplicadores y control en ambos extremos.'},
 nioshMath:{title:'Waters · Ecuación y tablas RNLE',url:'https://stacks.cdc.gov/view/cdc/188130/cdc_188130_DS1.pdf',note:'Fórmulas, medición y cálculo en origen y destino. La recuperación se toma de la corrección del manual de 2021.'},
 ccohs:{title:'CCOHS · Factores de la ecuación NIOSH',url:'https://www.ccohs.ca/oshanswers/ergonomics/niosh/assessing.html',note:'Condiciones de aplicación y limitaciones en tareas de manipulación.'},
 ankle:{title:'Martin et al. · Guía de tobillo (2021)',url:'https://doi.org/10.2519/jospt.2021.0302',note:'Marco clínico para lesión lateral de tobillo. La versión actual del caso se concentra en evaluación inicial.'},
 ottawa:{title:'Gomes et al. · Reglas de Ottawa (2022)',url:'https://doi.org/10.1186/s12891-022-05831-7',note:'Evaluación de lesiones agudas en adultos y necesidad de integrar los hallazgos con el juicio clínico.'},
 knee:{title:'Neal et al. · Dolor patelofemoral (2024)',url:'https://doi.org/10.1136/bjsports-2024-108110',note:'Educación y ejercicio individualizado; apoyos complementarios según evaluación y preferencias.'},
 knee2019:{title:'Willy et al. · Guía patelofemoral (2019)',url:'https://doi.org/10.2519/jospt.2019.0302',note:'Valoración funcional y razonamiento sobre dolor anterior de rodilla.'},
 posture:{title:'Swain et al. · Postura y dolor lumbar (2020)',url:'https://doi.org/10.1016/j.jbiomech.2019.08.006',note:'Límites de las atribuciones causales entre postura y dolor. No usar un ángulo aislado como diagnóstico.'},
 curriculum:{title:'World Physiotherapy · Marco curricular (2022)',url:'https://world.physio/sites/default/files/2022-09/Curriculum_framework_guidance_FINAL.pdf',note:'Competencias de evaluación, razonamiento, comunicación y reflexión.'},
 virtual:{title:'Torres et al. · Escenarios virtuales (2022)',url:'https://pubmed.ncbi.nlm.nih.gov/32814476/',note:'Antecedente educativo en estudiantes de Fisioterapia; no valida por sí mismo este simulador.'},
 sim:{title:'Sandoval-Cuellar et al. · Simulación (2021)',url:'https://doi.org/10.1186/s12909-021-02812-7',note:'Diseño de práctica y evaluación de decisiones de estudiantes.'}
};
export const cases=[
 {id:'office',number:'01',area:'Ergonomía',title:'Un puesto que se puede ajustar',short:'Puesto de computador',patient:'Valentina',age:29,role:'Administrativa · Villarrica',time:'12–15 min',level:'Fundamentos',quote:'Al final de la jornada siento cansancio en el cuello y el antebrazo. Quiero trabajar más cómoda.',brief:'Valentina atiende reservas y trabaja con computador. Te pide observar su puesto y proponer cambios que pueda probar durante la jornada.',objective:'Relaciona tarea, entorno y experiencia de la persona. Explora ajustes y justifica cómo evaluarías su resultado.',labTitle:'Explora la configuración del puesto',labHint:'Modifica una variable por vez. El esquema muestra ángulos configurados, sin predecir dolor ni daño.',sources:['rosa','osha','monitor','posture'],
 facts:[
  {id:'task',label:'Preguntar por la jornada',tag:'Tarea',text:'Usa el computador unas 6 horas diarias y combina teclado, mouse y llamadas. Los bloques de reservas concentran más de una hora de uso continuo.'},
  {id:'symptoms',label:'Explorar las molestias',tag:'Experiencia',text:'Refiere cansancio gradual al final de los bloques de trabajo y alivio al cambiar de actividad. No describe traumatismo, pérdida de fuerza ni alteraciones sensitivas. Esto no reemplaza una evaluación clínica si aparecen otros síntomas.'},
  {id:'setup',label:'Observar silla y pantalla',tag:'Entorno',text:'La pantalla del portátil está baja. Con la silla ajustada para alcanzar la mesa, los pies no quedan apoyados. Hay espacio para reorganizar el puesto.'},
  {id:'resources',label:'Consultar recursos disponibles',tag:'Recursos',text:'Tiene teclado y mouse externos guardados, una base regulable para el portátil y acceso a un apoyo estable para los pies.'},
  {id:'organization',label:'Preguntar por las pausas',tag:'Organización',text:'Puede alternar reservas con otras tareas, pero suele acumularlas para el final. No ha conversado con el equipo sobre distribuirlas durante el día.'},
  {id:'goals',label:'Acordar qué quiere mejorar',tag:'Objetivo',text:'Quiere terminar sus bloques de trabajo con menos molestias y mantener la atención a clientes. Prefiere probar ajustes disponibles antes de comprar equipamiento.'}
 ],
 questions:[
 {id:'method',phase:2,dimension:'Selección del método',text:'¿Qué método elegirías para una evaluación específica del puesto de oficina?',options:[
 {id:'rula',text:'RULA, explicando que observa exposición postural y tiene un alcance diferente al puesto completo.',score:1,feedback:'Es una alternativa para exposición postural. Para los componentes de oficina descritos, ROSA es más específico; no intercambies sus puntuaciones.'},
 {id:'rosa',text:'ROSA, recogiendo configuración, uso de equipos y duración según su ficha.',score:2,feedback:'ROSA se diseñó para puestos de oficina. Necesitas sus datos y tablas completos; esta práctica no genera una puntuación ROSA.'},
 {id:'niosh',text:'RNLE, utilizando el ángulo cervical como variable principal.',score:0,feedback:'La RNLE corresponde a determinadas tareas de levantamiento a dos manos, no al trabajo con computador.'}]},
 {id:'interpret',phase:2,dimension:'Interpretación',text:'¿Qué puedes concluir a partir de los ángulos y del relato?',options:[
 {id:'cause',text:'El ángulo del cuello confirma la causa de las molestias.',score:0,feedback:'Una observación aislada no establece causalidad ni confirma una lesión. Integra tarea, duración, síntomas y contexto.'},
 {id:'ignore',text:'Si el ángulo no diagnostica, la configuración del puesto no aporta información.',score:0,feedback:'Los ajustes del entorno pueden ser relevantes aunque no permitan diagnosticar la causa del dolor.'},
 {id:'context',text:'Hay condiciones que conviene explorar y ajustar, sin atribuir una lesión a un ángulo aislado.',score:2,feedback:'Distinguir exposición de diagnóstico permite formular hipótesis y comprobar si los cambios ayudan a esta persona.'}]},
 {id:'plan',phase:3,dimension:'Plan de intervención',text:'¿Qué propuesta inicial es más coherente con este caso?',options:[
 {id:'combined',text:'Probar los apoyos y equipos disponibles, mejorar el alcance y acordar alternancia de tareas.',score:2,feedback:'La propuesta utiliza los recursos de Valentina e incluye tanto el puesto como la organización del trabajo.'},
 {id:'chair',text:'Cambiar solo la silla y mantener intacta la organización de la jornada.',score:1,feedback:'La silla puede ser parte del ajuste, pero faltan pantalla, apoyos, dispositivos y organización.'},
 {id:'brace',text:'Indicar un corrector postural para mantener una posición fija toda la jornada.',score:0,feedback:'Una posición fija impuesta no resuelve los distintos elementos del caso ni sustituye la evaluación de las molestias.'}]},
 {id:'followup',phase:3,dimension:'Reevaluación',text:'¿Cómo comprobarías si el ajuste fue útil?',options:[
 {id:'photo',text:'Tomar una fotografía y cerrar la evaluación si la postura parece correcta.',score:0,feedback:'Una imagen no muestra cómo se desarrolla la jornada ni si el cambio resulta usable.'},
 {id:'angle',text:'Volver a medir únicamente el ángulo del cuello.',score:1,feedback:'La medida puede complementar la observación, pero falta valorar tarea, experiencia y sostenibilidad del ajuste.'},
 {id:'function',text:'Revisar comodidad, tareas, tolerancia y uso real de los cambios en una jornada comparable.',score:2,feedback:'Relaciona la reevaluación con la meta acordada y con condiciones de trabajo comparables.'}]}
 ],reflection:'¿Qué cambio priorizaste y qué dato podría hacerte modificar tu propuesta?',transfer:'Si Valentina usara lentes bifocales, ¿qué información necesitarías antes de decidir la altura de la pantalla?'} ,
 {id:'lifting',number:'02',area:'Ergonomía',title:'Rediseñar antes de levantar',short:'Manipulación de cargas',patient:'Diego',age:38,role:'Encargado de bodega · Pucón',time:'15–20 min',level:'Aplicación',quote:'Las cajas no parecen tan pesadas, pero están lejos y tengo que girar para ubicarlas.',brief:'Una bodega prepara cajas estables con asas. Analiza una tarea a dos manos y compara un rediseño con la ecuación revisada de NIOSH.',objective:'Comprueba aplicabilidad, interpreta RWL e índice de levantamiento y explica qué variable del rediseño modifica el resultado.',labTitle:'Compara la tarea original con tu rediseño',labHint:'Las manos suben 50 cm. Se calcula en origen y destino y se conserva el menor RWL porque ambos requieren control.',sources:['niosh','nioshMath','ccohs'],
 facts:[
 {id:'object',label:'Examinar la carga',tag:'Objeto',text:'Caja rígida y estable de 12 kg, con asas que permiten buen acoplamiento. Se levanta a dos manos y sin movimientos bruscos.'},
 {id:'geometry',label:'Medir origen y destino',tag:'Geometría',text:'H = 50 cm en ambos extremos; manos a 25 cm del suelo al inicio y 75 cm al final; asimetría de 45° en ambos extremos. El destino requiere ubicar la caja con precisión.'},
 {id:'frequency',label:'Registrar frecuencia y recuperación',tag:'Tiempo',text:'Dos levantamientos por minuto durante 30 minutos. Después realiza al menos 30 minutos de trabajo liviano, sin otros levantamientos. Este ejercicio usa la categoría de corta duración.'},
 {id:'environment',label:'Revisar el entorno',tag:'Aplicabilidad',text:'Trabaja de pie, con espacio libre, piso seco y estable, ambiente térmico confortable y sin transporte prolongado, empuje o arrastre asociado.'},
 {id:'resources',label:'Explorar alternativas de diseño',tag:'Recursos',text:'Se puede acercar la carga, elevar la superficie de origen, alinear el destino, reducir contenido por caja o cambiar el ritmo de abastecimiento.'},
 {id:'scope',label:'Precisar el propósito del análisis',tag:'Alcance',text:'Se evalúa una tarea, no la capacidad individual de Diego. El resultado no es una garantía de ausencia de lesión ni reemplaza una evaluación integral del trabajo.'}
 ],questions:[
 {id:'applicability',phase:2,dimension:'Aplicabilidad',text:'¿Cuál es el alcance correcto del cálculo para la tarea descrita?',options:[
 {id:'any',text:'Puede aplicarse igual a movilizar pacientes o levantar con una sola mano.',score:0,feedback:'Esas condiciones quedan fuera de este cálculo. La selección del método precede a la operación matemática.'},
 {id:'defined',text:'Una tarea a dos manos bajo las condiciones registradas; hay que verificar también control, frecuencia y recuperación.',score:2,feedback:'El cálculo depende de esas condiciones. Si cambia la tarea, debes revisar su aplicabilidad y sus factores.'},
 {id:'mass',text:'Basta conocer que la caja pesa menos de 23 kg.',score:0,feedback:'23 kg es la constante de carga del modelo. Las condiciones de la tarea reducen el límite recomendado.'}]},
 {id:'meaning',phase:2,dimension:'Interpretación del índice',text:'¿Qué significa un índice de levantamiento superior a 1 en este ejercicio?',options:[
 {id:'injury',text:'Diego tendrá una lesión con una probabilidad igual al valor del índice.',score:0,feedback:'El índice no es una probabilidad individual ni un diagnóstico.'},
 {id:'ratio',text:'La carga supera el límite recomendado calculado para esas condiciones; corresponde estudiar un rediseño.',score:2,feedback:'LI es carga/RWL. Ayuda a comparar exigencias de la tarea, sin predecir la respuesta individual.'},
 {id:'repeat',text:'Indica cuántas veces se puede repetir el movimiento sin descanso.',score:0,feedback:'El índice no es un número de repeticiones permitidas.'}]},
 {id:'plan',phase:3,dimension:'Rediseño',text:'¿Qué intervención aborda las condiciones de esta tarea?',options:[
 {id:'training',text:'Enseñar una técnica y conservar todas las distancias, el giro y la frecuencia.',score:1,feedback:'La formación puede acompañar la intervención, pero aquí existen variables del diseño que se pueden modificar.'},
 {id:'belt',text:'Usar una faja y considerar que el índice deja de ser relevante.',score:0,feedback:'La faja no elimina las condiciones que alimentan la ecuación ni justifica ignorar el resultado.'},
 {id:'redesign',text:'Acercar y alinear la carga, revisar alturas y comparar carga o frecuencia con un nuevo cálculo.',score:2,feedback:'Actúas sobre variables medibles. Comprueba ambos extremos y que el rediseño sea viable durante el trabajo.'}]},
 {id:'followup',phase:3,dimension:'Verificación',text:'¿Cómo presentarías un rediseño cuyo índice baja de 1?',options:[
 {id:'safe',text:'Como garantía de que nadie se lesionará.',score:0,feedback:'Un índice menor no garantiza ausencia de daño ni cubre todas las exigencias de una jornada.'},
 {id:'relative',text:'Como una mejora dentro de las condiciones modeladas, que debe verificarse en la tarea real.',score:2,feedback:'Conserva medidas, condiciones y límites. Comprueba que no se introduzcan otras exigencias.'},
 {id:'result',text:'Mostrando solo el valor final, sin registrar las medidas.',score:1,feedback:'El resultado pierde trazabilidad si no se conservan variables, unidades y supuestos.'}]}
 ],reflection:'¿Qué variable cambiaste primero y por qué? ¿Qué supuesto dejaría de cumplirse en otra bodega?',transfer:'Si la misma caja se levantara desde una posición arrodillada, ¿seguirías utilizando este cálculo? Justifica el cambio de método.'},
 {id:'ankle',number:'03',area:'Ortopedia',title:'Antes de llamar a esto esguince',short:'Lesión aguda de tobillo',patient:'Martín',age:24,role:'Estudiante · Villarrica',time:'12–15 min',level:'Razonamiento',quote:'Me torcí el tobillo jugando ayer. ¿Con una tobillera podré volver a entrenar?',brief:'Martín consulta 18 horas después de una lesión. Aún no ha recibido evaluación médica ni imágenes. Tu tarea es decidir qué información necesitas y cuál es el siguiente paso.',objective:'Prioriza la evaluación inicial y reconoce hallazgos que requieren valoración adicional antes de proponer una ayuda ortopédica.',labTitle:'Exploración dirigida',labHint:'Selecciona áreas de evaluación para revelar hallazgos del caso. Son datos de un paciente ficticio, no pruebas realizadas sobre una persona.',sources:['ankle','ottawa'],
 facts:[
 {id:'mechanism',label:'Preguntar cómo ocurrió',tag:'Historia',text:'Aterrizó tras un salto con inversión del tobillo derecho. El dolor apareció de inmediato. La lesión ocurrió hace 18 horas.'},
 {id:'walking',label:'Preguntar por el apoyo',tag:'Función',text:'No logró completar cuatro pasos inmediatamente después de la lesión y tampoco consigue hacerlo ahora por el dolor.'},
 {id:'location',label:'Precisar la zona dolorosa',tag:'Síntomas',text:'Señala dolor en la región maleolar lateral. Hay aumento de volumen; la distribución requiere una palpación dirigida.'},
 {id:'neuro',label:'Preguntar por cambios sensitivos',tag:'Estado actual',text:'No refiere adormecimiento ni sensación de pie frío. El examen dirigido de color, temperatura y sensibilidad está disponible en el laboratorio.'},
 {id:'history',label:'Revisar antecedentes relevantes',tag:'Antecedentes',text:'Es un adulto, está alerta y puede colaborar. No refiere lesión previa de este tobillo, enfermedad neurológica ni traumatismos adicionales.'},
 {id:'expectations',label:'Explorar expectativas',tag:'Meta',text:'Espera volver a entrenar pronto y supone que una tobillera será suficiente. Acepta conversar sobre la necesidad de aclarar el tipo de lesión.'}
 ],exam:[
 {id:'lateral',label:'Maléolo lateral',result:'Dolor óseo localizado en el borde posterior distal y punta del maléolo lateral.',important:true},
 {id:'medial',label:'Maléolo medial',result:'Sin dolor óseo localizado en borde posterior ni punta del maléolo medial.'},
 {id:'midfoot',label:'Mediopié',result:'No refiere dolor en mediopié; sin sensibilidad ósea en navicular ni base del quinto metatarsiano.'},
 {id:'vascular',label:'Estado neurovascular',result:'Color y temperatura conservados, sensibilidad distal presente. No se observa deformidad evidente.'},
 {id:'stress',label:'Pruebas de estrés ligamentario',result:'Se posponen en esta etapa: primero hay que resolver los hallazgos que requieren valoración adicional.',important:true}
 ],questions:[
 {id:'priority',phase:2,dimension:'Priorización',text:'¿Qué información orienta más la decisión inicial?',options:[
 {id:'swelling',text:'La magnitud del edema por sí sola.',score:1,feedback:'El edema aporta contexto, pero no sustituye la localización de la sensibilidad ósea ni la capacidad de apoyo.'},
 {id:'function',text:'Capacidad de apoyo, localización del dolor óseo y estado neurovascular.',score:2,feedback:'Son datos prioritarios para orientar la evaluación adicional en esta lesión aguda.'},
 {id:'support',text:'La talla de tobillera que prefiere usar.',score:0,feedback:'Seleccionar un apoyo antes de aclarar los hallazgos invierte el orden del razonamiento.'}]},
 {id:'meaning',phase:2,dimension:'Integración de hallazgos',text:'Con incapacidad de apoyo y sensibilidad ósea maleolar, ¿qué conclusión es defendible?',options:[
 {id:'confirmed',text:'La fractura está confirmada por el simulador.',score:0,feedback:'Estos hallazgos no confirman una fractura. Orientan la necesidad de valoración adicional e imágenes según el contexto.'},
 {id:'simple',text:'Es un esguince leve porque ocurrió durante el deporte.',score:0,feedback:'El mecanismo deportivo no permite establecer gravedad ni descartar lesión ósea.'},
 {id:'evaluate',text:'Hay motivos para solicitar valoración médica y considerar radiografía antes de continuar.',score:2,feedback:'Relacionas hallazgos con una conducta de evaluación, sin convertir la regla en un diagnóstico.'}]},
 {id:'plan',phase:3,dimension:'Decisión y seguridad',text:'¿Qué harías ahora en este caso?',options:[
 {id:'refer',text:'Coordinar valoración médica pronta, explicar los hallazgos y posponer pruebas de carga provocativas.',score:2,feedback:'La prioridad es aclarar la lesión. Comunica dolor óseo, incapacidad de apoyo, tiempo de evolución y estado neurovascular.'},
 {id:'return',text:'Colocar una tobillera y probar saltos para autorizar el retorno al entrenamiento.',score:0,critical:true,feedback:'Revisión prioritaria: hay hallazgos sin resolver. El apoyo externo no autoriza pruebas de salto ni retorno deportivo en esta etapa.'},
 {id:'wait',text:'Esperar varios días sin valoración adicional porque el dolor es esperable.',score:0,critical:true,feedback:'Revisión prioritaria: los hallazgos ameritan evaluación adicional; no deben quedar sin una conducta y comunicación claras.'}]},
 {id:'orthosis',phase:3,dimension:'Uso de apoyos',text:'¿Cómo responderías a su pregunta sobre la tobillera?',options:[
 {id:'promise',text:'Con una tobillera podrá volver a entrenar aunque no se aclare la lesión.',score:0,critical:true,feedback:'Un apoyo externo no reemplaza la evaluación ni demuestra preparación para el deporte.'},
 {id:'context',text:'Su utilidad se definirá al aclarar la lesión y el plan; ahora importa resolver los hallazgos iniciales.',score:2,feedback:'La elección de un apoyo depende del caso y del manejo acordado, no solo del producto disponible.'},
 {id:'never',text:'Las tobilleras nunca tienen utilidad.',score:0,feedback:'Una afirmación absoluta ignora las distintas condiciones y etapas de recuperación.'}]}
 ],reflection:'¿Qué hallazgo cambió tu prioridad y cómo se lo explicarías a Martín sin confirmar un diagnóstico?',transfer:'Si pudiera caminar cuatro pasos pero persistiera la sensibilidad ósea en la punta del maléolo, ¿cambiaría tu decisión? Explica qué dato conserva importancia.'},
 {id:'knee',number:'04',area:'Ortopedia',title:'Volver a subir sin temor',short:'Dolor anterior de rodilla',patient:'Camila',age:27,role:'Estudiante y corredora recreativa · Temuco',time:'15–20 min',level:'Razonamiento',quote:'Empecé a correr más y ahora me molesta la rodilla en las escaleras. ¿Necesito una rodillera?',brief:'Camila describe dolor anterior de rodilla de inicio gradual. Explora su historia y función para construir una hipótesis de trabajo y un plan compartido.',objective:'Integra carga, síntomas, función y metas. Diferencia intervención principal de apoyos complementarios y propone una reevaluación.',labTitle:'Movimiento, función y respuesta',labHint:'El goniómetro representa un ángulo configurado. No estima presión articular, daño ni intensidad de dolor.',sources:['knee','knee2019'],
 facts:[
 {id:'history',label:'Explorar inicio y evolución',tag:'Historia',text:'Lleva seis semanas con dolor alrededor de la rótula, de inicio gradual. No hubo golpe ni torsión aguda.'},
 {id:'load',label:'Revisar cambios de actividad',tag:'Carga',text:'Pasó de correr dos veces a cinco veces por semana en un mes e incorporó cuestas. No ha modificado aún su entrenamiento.'},
 {id:'symptoms',label:'Preguntar qué reproduce el dolor',tag:'Síntomas',text:'Le molestan las escaleras, correr y las sentadillas. Cambiar de actividad suele aliviar. No refiere bloqueo ni episodios de falla de la rodilla.'},
 {id:'screen',label:'Explorar otros síntomas',tag:'Contexto clínico',text:'No refiere fiebre, dolor progresivo en reposo ni aumento de volumen importante. Estos antecedentes orientan el caso, sin reemplazar un examen completo.'},
 {id:'beliefs',label:'Preguntar qué piensa del problema',tag:'Perspectiva',text:'Teme estar desgastando la rodilla y ha pensado suspender toda actividad. Quiere saber si una rodillera le dará seguridad.'},
 {id:'goals',label:'Acordar una meta funcional',tag:'Meta',text:'Quiere subir escaleras con más confianza y retomar la carrera progresivamente. Puede dedicar tiempo a un plan de ejercicio y registrar cómo responde.'}
 ],exam:[
 {id:'squat',label:'Sentadilla funcional',result:'Reproduce su dolor anterior conocido. Registra la tarea y su respuesta como referencia para reevaluar; no identifica por sí sola un tejido lesionado.'},
 {id:'stairs',label:'Descenso de escalón',result:'La tarea reproduce molestias y Camila reduce la velocidad por temor. La respuesta aporta información sobre función y confianza.'},
 {id:'mobility',label:'Movilidad y comparación',result:'La movilidad activa está conservada. Se necesita integrar fuerza, tolerancia a carga y examen de regiones relacionadas según la hipótesis.'},
 {id:'support',label:'Explorar un apoyo complementario',result:'Aún no se ha probado un apoyo. Su elección requiere justificar el objetivo, valorar preferencias y comprobar respuesta; no se asume un beneficio automático.'}
 ],questions:[
 {id:'hypothesis',phase:2,dimension:'Hipótesis de trabajo',text:'¿Qué interpretación integra mejor la información disponible?',options:[
 {id:'wear',text:'El ángulo de flexión demuestra desgaste del cartílago.',score:0,feedback:'El goniómetro no informa del estado del cartílago. La geometría no confirma una lesión.'},
 {id:'pfp',text:'Presentación compatible con dolor patelofemoral, que debe contrastarse con examen y otras hipótesis.',score:2,feedback:'Una hipótesis funcional integra el patrón de síntomas sin asumir certeza por un hallazgo aislado.'},
 {id:'posture',text:'Toda la explicación está en una postura incorrecta.',score:0,feedback:'Faltan carga, evolución, función, metas y factores de la experiencia de Camila.'}]},
 {id:'assessment',phase:2,dimension:'Evaluación funcional',text:'¿Qué información añadirías para orientar el plan?',options:[
 {id:'function',text:'Tolerancia a tareas, fuerza y respuesta a carga, junto con sus metas y preocupaciones.',score:2,feedback:'La evaluación conecta las dificultades de Camila con decisiones y resultados observables.'},
 {id:'angle',text:'Solo el ángulo de rodilla que aparece en el esquema.',score:1,feedback:'La medida geométrica puede formar parte del examen, pero no explica por sí sola el problema funcional.'},
 {id:'size',text:'Solo la talla de rodillera y el presupuesto.',score:0,feedback:'Un producto no sustituye la evaluación que orienta la intervención.'}]},
 {id:'plan',phase:3,dimension:'Plan compartido',text:'¿Qué plan inicial tiene mejor fundamento para esta hipótesis?',options:[
 {id:'rest',text:'Suspender toda actividad indefinidamente por temor al desgaste.',score:0,feedback:'El plan debe dialogar con sus metas y con una progresión individualizada, sin convertir el temor en una prohibición indefinida.'},
 {id:'support',text:'Usar una rodillera como única intervención y mantener la misma carga de carrera.',score:0,feedback:'Un apoyo aislado no aborda la educación ni la planificación del ejercicio y la actividad.'},
 {id:'exercise',text:'Educación, ejercicio individualizado de rodilla y cadera según evaluación, y ajuste progresivo de actividad.',score:2,feedback:'La guía de 2024 sitúa ejercicio y educación como base. Los complementos se eligen por evaluación, respuesta y preferencias.'}]},
 {id:'followup',phase:3,dimension:'Reevaluación y apoyos',text:'¿Cómo decidirías si mantener un apoyo complementario?',options:[
 {id:'brand',text:'Por la marca o rigidez del producto.',score:0,feedback:'Esas características no demuestran utilidad para la meta funcional de Camila.'},
 {id:'trial',text:'Definiendo una meta, probando su respuesta en una tarea relevante y revisando tolerancia y preferencias.',score:2,feedback:'Un ensayo contextualizado permite discutir su utilidad como complemento y revisar el plan.'},
 {id:'comfort',text:'Solo preguntando si le gusta cómo se ve.',score:1,feedback:'La preferencia importa, pero también la respuesta funcional, la tolerancia y la coherencia con el plan.'}]}
 ],reflection:'¿Cómo explicarías tu hipótesis y el papel de una rodillera sin aumentar el temor al movimiento?',transfer:'Si apareciera un derrame importante tras una nueva torsión, ¿mantendrías la misma hipótesis y el mismo plan? ¿Qué volverías a evaluar?'}
];
