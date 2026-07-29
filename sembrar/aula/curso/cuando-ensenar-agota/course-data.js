window.IA_COURSE = (() => {
  "use strict";

  const reference = (apa, url) => ({ apa, url });
  const refs = {
    cast: reference(
      "CAST. (2024). Universal Design for Learning guidelines version 3.0. https://udlguidelines.cast.org/",
      "https://udlguidelines.cast.org/"
    ),
    cepeda: reference(
      "Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354–380. https://doi.org/10.1037/0033-2909.132.3.354",
      "https://doi.org/10.1037/0033-2909.132.3.354"
    ),
    chang: reference(
      "Chang, M.-L. (2009). An appraisal perspective of teacher burnout: Examining the emotional work of teachers. Educational Psychology Review, 21(3), 193–218. https://doi.org/10.1007/s10648-009-9106-y",
      "https://doi.org/10.1007/s10648-009-9106-y"
    ),
    dem: reference(
      "Demerouti, E., Bakker, A. B., Nachreiner, F., & Schaufeli, W. B. (2001). The job demands–resources model of burnout. Journal of Applied Psychology, 86(3), 499–512. https://doi.org/10.1037/0021-9010.86.3.499",
      "https://doi.org/10.1037/0021-9010.86.3.499"
    ),
    hakanen: reference(
      "Hakanen, J. J., Bakker, A. B., & Schaufeli, W. B. (2006). Burnout and work engagement among teachers. Journal of School Psychology, 43(6), 495–513. https://doi.org/10.1016/j.jsp.2005.11.001",
      "https://doi.org/10.1016/j.jsp.2005.11.001"
    ),
    iancu: reference(
      "Iancu, A. E., Rusu, A., Măroiu, C., Păcurar, R., & Maricuțoiu, L. P. (2018). The effectiveness of interventions aimed at reducing teacher burnout: A meta-analysis. Educational Psychology Review, 30(2), 373–396. https://doi.org/10.1007/s10648-017-9420-8",
      "https://doi.org/10.1007/s10648-017-9420-8"
    ),
    klingbeil: reference(
      "Klingbeil, D. A., & Renshaw, T. L. (2018). Mindfulness-based interventions for teachers: A meta-analysis of the emerging evidence base. School Psychology Quarterly, 33(4), 501–511. https://doi.org/10.1037/spq0000291",
      "https://doi.org/10.1037/spq0000291"
    ),
    kurtessis: reference(
      "Kurtessis, J. N., Eisenberger, R., Ford, M. T., Buffardi, L. C., Stewart, K. A., & Adis, C. S. (2017). Perceived organizational support: A meta-analytic evaluation of organizational support theory. Journal of Management, 43(6), 1854–1884. https://doi.org/10.1177/0149206315575554",
      "https://doi.org/10.1177/0149206315575554"
    ),
    maslach: reference(
      "Maslach, C., Schaufeli, W. B., & Leiter, M. P. (2001). Job burnout. Annual Review of Psychology, 52, 397–422. https://doi.org/10.1146/annurev.psych.52.1.397",
      "https://doi.org/10.1146/annurev.psych.52.1.397"
    ),
    mineduc: reference(
      "Ministerio de Educación de Chile. (2024). Taller diagnóstico participativo para el bienestar de los equipos educativos. https://reactivacioneducativa.mineduc.cl/wp-content/uploads/sites/127/2024/09/2024.09-Manual-Taller-Diagnostico-Bienestar.pdf",
      "https://reactivacioneducativa.mineduc.cl/wp-content/uploads/sites/127/2024/09/2024.09-Manual-Taller-Diagnostico-Bienestar.pdf"
    ),
    oecd: reference(
      "OECD. (2025). Results from TALIS 2024: Country notes—Chile. https://www.oecd.org/en/publications/results-from-talis-2024-country-notes_e127f9e2-en/chile_e31949b6-en.html",
      "https://www.oecd.org/en/publications/results-from-talis-2024-country-notes_e127f9e2-en/chile_e31949b6-en.html"
    ),
    roediger: reference(
      "Roediger, H. L., III, & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255. https://doi.org/10.1111/j.1467-9280.2006.01693.x",
      "https://doi.org/10.1111/j.1467-9280.2006.01693.x"
    ),
    skaalvik: reference(
      "Skaalvik, E. M., & Skaalvik, S. (2018). Job demands and job resources as predictors of teacher motivation and well-being. Social Psychology of Education, 21(5), 1251–1275. https://doi.org/10.1007/s11218-018-9464-8",
      "https://doi.org/10.1007/s11218-018-9464-8"
    ),
    sonnentag: reference(
      "Sonnentag, S., & Fritz, C. (2015). Recovery from job stress: The stressor-detachment model as an integrative framework. Journal of Organizational Behavior, 36(S1), S72–S103. https://doi.org/10.1002/job.1924",
      "https://doi.org/10.1002/job.1924"
    ),
    suseso: reference(
      "Superintendencia de Seguridad Social. (s. f.). Cuestionario de evaluación del ambiente laboral–salud mental/SUSESO (CEAL-SM/SUSESO). https://www.suseso.cl/606/w3-propertyvalue-614691.html",
      "https://www.suseso.cl/606/w3-propertyvalue-614691.html"
    ),
    who2019: reference(
      "World Health Organization. (2019, May 28). Burn-out an “occupational phenomenon”: International Classification of Diseases. https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases",
      "https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases"
    ),
    who2022: reference(
      "World Health Organization. (2022). WHO guidelines on mental health at work. https://www.who.int/publications/i/item/9789240053052",
      "https://www.who.int/publications/i/item/9789240053052"
    ),
    w3c: reference(
      "World Wide Web Consortium. (2023). Web Content Accessibility Guidelines (WCAG) 2.2. https://www.w3.org/TR/WCAG22/",
      "https://www.w3.org/TR/WCAG22/"
    )
  };

  const decision = (prompt, options, expectedCriterion, reviewSection) => ({
    type: "decision",
    prompt,
    options,
    expectedCriterion,
    reviewSection,
    instructions: [
      "Responde con la información disponible y el criterio de esta experiencia.",
      "Revisa la retroalimentación y realiza un segundo intento cuando corresponda."
    ]
  });

  const reflection = (prompt, modelAnswer, criteria, minimumWords = 45, maximumWords = 100) => ({
    type: "reflection",
    prompt,
    responseLabel: "Borrador de trabajo",
    responsePlaceholder: "Puedes responder con Andrea, con tu experiencia o con otra situación ficticia.",
    instructions: [
      `Escribe entre ${minimumWords} y ${maximumWords} palabras.`,
      "Usa hechos observables, una acción concreta y un indicador sencillo.",
      "Elige la forma de participación que te permita pensar con mayor libertad.",
      "El texto queda solamente en este navegador."
    ],
    minimumWords,
    maximumWords,
    rubricTitle: "Revisión antes del segundo intento",
    rubricLead: "Comprueba cada criterio. La plataforma no interpreta ni califica el contenido de tu texto.",
    requiredCriteria: criteria,
    criteriaRequirement: "Comprueba todos los criterios de cuidado y calidad.",
    modelAnswer,
    storageNotice: "Bitácora privada en este dispositivo"
  });

  const modules = [
    {
      id: "m0",
      number: "00",
      title: "Bienvenida, cuidado y punto de partida",
      subtitle: "Antes de abrir la mochila",
      duration: "25 min",
      lessons: [
        {
          id: "m0-l1",
          title: "Antes de abrir la mochila",
          duration: "12 min",
          objective: "Reconocer cómo llegas al curso y elegir qué deseas comprender, cuidar o transformar.",
          participationAgreement: "Puedes responder desde tu experiencia, con Andrea o con una situación ficticia. Tú decides qué escribir, qué conservar y qué compartir.",
          scenarioLabel: "Antes de comenzar",
          scenario: "Andrea llega a la escuela con el café en la mano y la lista de pendientes ya activa. Antes de entrar a clases, se detiene un momento. No para buscar una respuesta correcta, sino para reconocer cómo llega hoy.",
          studySections: [
            {
              title: "Una pausa para volver a ti",
              paragraphs: [
                "Durante unos minutos, deja en pausa los informes, las reuniones y las respuestas pendientes. Este espacio comienza contigo.",
                "Detenerse a mirar es un primer acto de cuidado. Una señal abre preguntas y permite elegir con más claridad qué quieres comprender durante el recorrido. Esta experiencia no entrega diagnósticos."
              ]
            }
          ],
          workedExample: [
            "Andrea nota que llega pensando en tres pendientes y que le cuesta dejar el teléfono. No necesita explicarlo todavía: reconoce la señal y se pregunta qué desea cuidar.",
            "Su intención para el curso podría ser: “Quiero comprender qué hace que una jornada siga conmigo incluso cuando ya terminó”."
          ],
          keypoints: [
            "Detenerse a mirar es un acto de cuidado.",
            "Una señal abre preguntas.",
            "La persona decide qué registra, conserva y comparte."
          ],
          activity: decision(
            "¿Qué gesto abre mejor este recorrido?",
            [
              { text: "Buscar de inmediato una respuesta definitiva.", feedback: "Todavía estamos abriendo preguntas y reconociendo el punto de partida." },
              { text: "Hacer una pausa, observar una señal y elegir qué quieres comprender.", correct: true, feedback: "La pausa convierte la observación en una intención de aprendizaje." },
              { text: "Seguir adelante sin detenerse porque siempre hay pendientes.", feedback: "La pausa breve ayuda a mirar la carga antes de continuar." }
            ],
            "El inicio propone una pausa, una observación y una intención elegida por la persona.",
            "Una pausa para volver a ti"
          ),
          summary: [
            "Andrea abrió un espacio breve entre la jornada y sus pendientes. En la siguiente experiencia podrá mirar con más detalle cómo llegó hoy."
          ],
          resources: [
            { label: "Bitácora completa en PDF", href: "recursos/bitacora-cuando-ensenar-agota.pdf" }
          ],
          references: [refs.who2022, refs.cast, refs.w3c]
        },
        {
          id: "m0-l2",
          title: "¿Cómo llegué hoy?",
          duration: "13 min",
          objective: "Observar tu punto de partida y elegir una meta de aprendizaje para este recorrido.",
          scenarioLabel: "La primera página de la bitácora",
          scenario: "Andrea mira la hoja y reconoce que llegó con sueño, pensando en lo pendiente y con poco espacio para concentrarse. También recuerda un momento de la jornada que sí le hizo bien.",
          image: {
            src: "../../../../assets/images/aula/cuando-ensenar-agota/bitacora-como-llegue-original.png",
            webp: "../../../../assets/images/aula/cuando-ensenar-agota/bitacora-como-llegue.webp",
            alt: "Bitácora ilustrada con Andrea antes y durante la jornada. Propone observar energía, tranquilidad, sueño, ansiedad, concentración y funcionamiento automático, sin calificar ni diagnosticar.",
            width: 1024,
            height: 1536,
            caption: "Observa la hoja completa. Puedes recorrerla con Andrea o desde tu propia experiencia y elegir qué deseas registrar."
          },
          studySections: [
            {
              title: "Reconocer el punto de partida",
              paragraphs: [
                "Puedes comenzar por algo sencillo: cómo llegaste, qué ocurrió durante la jornada y qué necesitas esta semana. Una observación concreta —“hoy releí tres veces el mismo correo”— abre más posibilidades que un juicio sobre ti.",
                "Esta actividad no tiene nota. Su propósito es ayudarte a escoger una meta: algo que quieras comprender, cuidar o transformar mientras acompañas a Andrea."
              ]
            }
          ],
          workedExample: [
            "Punto de partida de Andrea: “Llegué pensando en todo lo pendiente y me costó concentrarme en la primera reunión”.",
            "Meta de aprendizaje: “Quiero reconocer qué cargas puedo hacer visibles y qué apoyos necesito activar”."
          ],
          keypoints: [
            "Mirar el punto de partida ayuda a elegir con intención.",
            "La bitácora acompaña; no califica.",
            "La meta puede nacer de Andrea o de tu propia experiencia."
          ],
          activity: reflection(
            "Escribe un punto de partida breve y elige una meta para el curso.",
            [
              "Andrea llega con sueño y con tres pendientes activos en su cabeza. Quiere comprender por qué la jornada sigue ocupando espacio cuando ya terminó.",
              "Su meta será reconocer demandas y recursos, y proponer una acción personal y otra colectiva. Volverá a esta meta al terminar M8."
            ],
            [
              { id: "capacidad", label: "Capacidad observable", description: "La meta dice qué podrás explicar, analizar o diseñar." },
              { id: "caso", label: "Caso seguro", description: "Usa Andrea o una situación ficticia." },
              { id: "revision", label: "Revisión futura", description: "Incluye cuándo comprobarás el aprendizaje." }
            ],
            45,
            80
          ),
          summary: [
            "Andrea ya eligió qué quiere comprender. En M1 observará por qué un fin de semana de descanso no siempre alcanza para recuperar energía."
          ],
          references: [refs.who2022, refs.cast]
        }
      ]
    },
    {
      id: "m1",
      number: "01",
      title: "No es solo cansancio",
      subtitle: "Comprender el agotamiento emocional",
      duration: "45 min",
      lessons: [
        {
          id: "m1-l1",
          title: "Andrea descansó y sigue sin energía",
          duration: "30 min",
          objective: "Separar hechos, hipótesis y conceptos antes de concluir.",
          scenarioLabel: "El lunes de Andrea",
          scenario: "Andrea descansó durante el fin de semana. El lunes, sin embargo, vuelve a sentirse sin energía y la jornada parece empezar antes de que suene el timbre. ¿Qué podría estar ocurriendo?",
          preStudyDecision: {
            prompt: "Registra tu decisión inicial. No se calificará.",
            options: [
              "Es cansancio esperable después de una semana exigente.",
              "Puede haber estrés sostenido o agotamiento emocional, pero falta información.",
              "Es burnout confirmado.",
              "No hay nada que observar mientras siga trabajando."
            ],
            note: "Elige una hipótesis provisional. Después del video podrás revisarla."
          },
          video: {
            mandatory: true,
            src: "../../../../assets/media/aula/cuando-ensenar-agota/cuando-ensenar-agota.mp4",
            poster: "../../../../assets/images/aula/cuando-ensenar-agota/video-poster.webp",
            captions: "recursos/cuando-ensenar-agota-subtitulos.vtt",
            transcript: "recursos/transcripcion-video-cuando-ensenar-agota.html",
            title: "Cuando enseñar agota: el caso de Andrea",
            notice: "Este relato presenta una situación ficticia para observar cómo se acumula el desgaste docente.",
            description: "El video alterna escenas y láminas sobre la llegada de Andrea a la escuela, las demandas visibles e invisibles de su jornada, la metáfora de la mochila y la necesidad de observar sin culpabilizar. Las afirmaciones conceptuales se aclaran y distinguen en la microlección que sigue.",
            clarification: "Estrés, agotamiento emocional y burnout no son equivalentes. La microlección siguiente permite distinguirlos."
          },
          postVideoQuestions: [
            "¿Qué hechos concretos observaste en Andrea?",
            "¿Qué partes corresponden a interpretaciones o hipótesis?",
            "¿Qué información necesitarías antes de concluir que existe burnout?"
          ],
          studySections: [
            {
              title: "Cansancio, estrés, agotamiento emocional y burnout",
              paragraphs: [
                "El cansancio puede aparecer después de un esfuerzo y disminuir con recuperación. El estrés es una respuesta ante demandas percibidas y puede ser transitorio. El agotamiento emocional describe la sensación de quedar sin recursos afectivos y energéticos; es una dimensión central, pero no equivale por sí sola a burnout (Maslach et al., 2001).",
                "Burnout es un fenómeno ocupacional más amplio asociado al estrés crónico de trabajo que no ha sido gestionado con éxito. La OMS no lo clasifica como una enfermedad médica. Una señal aislada no permite concluir que existe burnout (WHO, 2019)."
              ],
              questions: [
                "¿La señal se repite?",
                "¿Con qué frecuencia e intensidad aparece?",
                "¿Qué impacto observable tiene?",
                "¿Qué condiciones y recursos están presentes?"
              ]
            },
            {
              title: "El contexto amplía la mirada",
              paragraphs: [
                "En TALIS 2024, 27 % del profesorado chileno informó sentir estrés “mucho”, frente al 19 % del promedio OCDE (OECD, 2025). Es un dato poblacional sobre estrés informado, no un diagnóstico individual ni una cifra de burnout.",
                "Persistencia, frecuencia, intensidad e impacto ayudan a ordenar la observación. También importa preguntar por carga, apoyo, autonomía, claridad y posibilidades de recuperación."
              ]
            }
          ],
          postStudyImage: {
            src: "../../../../assets/images/aula/cuando-ensenar-agota/infografia-agotamiento-original.png",
            webp: "../../../../assets/images/aula/cuando-ensenar-agota/infografia-agotamiento.webp",
            alt: "Infografía ilustrada sobre desgaste docente: muestra cansancio persistente, acumulación de demandas en una mochila, funcionamiento automático y la observación como primer acto de cuidado.",
            width: 2752,
            height: 1536,
            fit: "contain",
            caption: "Material visual original. Para la comparación exacta del dato poblacional, utiliza la cifra que aparece a continuación: Chile 27 % y promedio OCDE 19 % en TALIS 2024 (OECD, 2025)."
          },
          infographic: {
            title: "Cuatro distinciones para observar con cuidado",
            stat: "27 %",
            statLabel: "del profesorado chileno informó sentir estrés “mucho” en TALIS 2024.",
            comparison: "Promedio OCDE: 19 %.",
            disclaimer: "Dato poblacional sobre estrés informado; sirve para comprender el contexto y no describe por sí solo la experiencia de una persona.",
            items: [
              { term: "Cansancio", description: "Respuesta posible al esfuerzo; puede disminuir al recuperar recursos." },
              { term: "Estrés", description: "Respuesta ante demandas; puede ser transitoria o sostenerse." },
              { term: "Agotamiento emocional", description: "Sensación persistente de quedar sin recursos afectivos y energéticos." },
              { term: "Burnout", description: "Fenómeno ocupacional más amplio; no se concluye con una sola señal." }
            ]
          },
          workedExample: [
            "Hecho: Andrea informa que durmió y aun así inicia el lunes sin energía; relee instrucciones y se irrita después de un conflicto.",
            "Hipótesis responsable: hay señales que conviene observar por persistencia e impacto. Falta conocer duración, condiciones, recursos, salud general y otras explicaciones.",
            "Conclusión que se evita: atribuir burnout a partir de una sola escena."
          ],
          keypoints: [
            "Estrés, agotamiento emocional y burnout no son sinónimos.",
            "Una señal orienta preguntas; no confirma una condición.",
            "El desgaste no define el compromiso profesional.",
            "Los datos poblacionales explican contexto; no diagnostican personas."
          ],
          activity: decision(
            "Después del video y la microlección, ¿qué revisión es más responsable?",
            [
              { text: "El burnout está confirmado porque el descanso no funcionó.", feedback: "El descanso insuficiente es una señal, no una confirmación." },
              { text: "Hay señales repetidas que requieren contexto, condiciones y recursos antes de concluir.", correct: true, feedback: "Distingue observación, hipótesis y diagnóstico." },
              { text: "Si puede seguir trabajando, no existe un problema relevante.", feedback: "Funcionar no equivale necesariamente a estar bien." }
            ],
            "Una formulación responsable describe señales, reconoce incertidumbre y pregunta por contexto.",
            "Cansancio, estrés, agotamiento emocional y burnout"
          ),
          summary: [
            "Las señales de Andrea no aparecen de manera aislada. Para comprenderlas necesitamos mirar qué demandas y recursos lleva cada día en su mochila invisible."
          ],
          resources: [
            { label: "Transcripción accesible del video", href: "recursos/transcripcion-video-cuando-ensenar-agota.html" },
            { label: "Subtítulos revisados en español", href: "recursos/cuando-ensenar-agota-subtitulos.vtt" },
            { label: "Resumen de conceptos esenciales", href: "recursos/resumen-conceptos-esenciales.pdf" }
          ],
          references: [refs.maslach, refs.who2019, refs.who2022, refs.oecd, refs.chang]
        },
        {
          id: "m1-l2",
          title: "Cuatro preguntas para mirar el patrón",
          duration: "15 min",
          objective: "Aplicar persistencia, frecuencia, intensidad e impacto a una situación ficticia.",
          scenarioLabel: "Una nueva semana",
          scenario: "Durante tres semanas, Andrea relee correos, posterga conversaciones difíciles y termina la jornada con tensión. Mirar cuánto dura, cuántas veces ocurre y qué cambia puede ayudarle a comprender el patrón.",
          studySections: [
            {
              title: "Cuatro lentes para observar",
              paragraphs: [
                "Persistencia pregunta cuánto tiempo se mantiene una señal. Frecuencia pregunta cuántas veces aparece. Intensidad describe su fuerza. Impacto observa qué cambia en el funcionamiento o las relaciones.",
                "Estos lentes ayudan a formular preguntas y decidir qué apoyo conviene activar. Si el patrón se intensifica o afecta la vida cotidiana, una orientación profesional puede ampliar la comprensión."
              ]
            }
          ],
          workedExample: [
            "Observación: “Durante tres semanas, Andrea tardó el doble en corregir dos veces por semana”.",
            "Pregunta: “¿Qué tareas o situaciones coinciden con ese patrón y qué apoyo está disponible?”."
          ],
          keypoints: [
            "Un patrón se comprende mejor cuando se describe con precisión.",
            "La precisión descriptiva mejora las decisiones.",
            "Las señales intensas o persistentes orientan a buscar apoyo profesional."
          ],
          activity: decision(
            "¿Cuál formulación es más cuidadosa?",
            [
              { text: "Andrea es una persona agotada.", feedback: "Convierte una observación en identidad." },
              { text: "Andrea muestra un patrón persistente de dificultad para concentrarse; falta explorar contexto e impacto.", correct: true, feedback: "Describe el patrón y conserva la incertidumbre." },
              { text: "Andrea debe descansar más y nada más.", feedback: "Reduce un problema posiblemente laboral a una tarea individual." }
            ],
            "La observación responsable nombra patrón, contexto e incertidumbre sin etiquetar.",
            "Cuatro lentes, no una escala clínica"
          ),
          summary: [
            "Observar el patrón abre una nueva pregunta: ¿qué cargas y qué recursos hacen que esa mochila pese de esa manera?"
          ],
          references: [refs.maslach, refs.who2022, refs.roediger]
        }
      ]
    },
    {
      id: "m2",
      number: "02",
      title: "La mochila invisible",
      subtitle: "Demandas, recursos y acumulación",
      duration: "50 min",
      lessons: [
        {
          id: "m2-l1",
          title: "Mi mochila invisible",
          duration: "25 min",
          objective: "Hacer visibles las demandas y reconocer los recursos que pueden cambiar su peso.",
          scenarioLabel: "Andrea hace visible la carga",
          scenario: "Andrea vacía su mochila sobre la mesa: correcciones, cambios de última hora, conflictos, planificación y tareas del hogar. Entre las piedras también aparecen apoyo entre pares, autonomía, claridad y tiempo protegido.",
          image: {
            src: "../../../../assets/images/aula/cuando-ensenar-agota/bitacora-mochila-original.png",
            webp: "../../../../assets/images/aula/cuando-ensenar-agota/bitacora-mochila.webp",
            alt: "Bitácora ilustrada de la mochila invisible de Andrea con espacios para reconocer cargas, fuentes, control, apoyo y acciones posibles.",
            width: 1024,
            height: 1536,
            caption: "La mochila también contiene recursos. Haz visible lo que pesa y aquello que puede ayudarte a sostener o transformar la carga."
          },
          studySections: [
            {
              title: "Demandas y recursos laborales",
              paragraphs: [
                "Las demandas requieren esfuerzo sostenido. No todas son negativas, pero pueden contribuir al agotamiento cuando se acumulan sin recuperación o apoyo suficiente. Los recursos ayudan a alcanzar objetivos, reducen costos y favorecen aprendizaje y motivación (Demerouti et al., 2001).",
                "En docentes, presión de tiempo, problemas disciplinarios y baja motivación estudiantil se relacionan con menor bienestar; apoyo entre colegas y consonancia de valores pueden actuar como recursos (Skaalvik & Skaalvik, 2018)."
              ]
            }
          ],
          comparison: {
            title: "La misma demanda puede pesar distinto",
            caption: "Comparación didáctica basada en el modelo Demandas–Recursos Laborales.",
            columns: [
              { key: "case", label: "Situación" },
              { key: "demand", label: "Demanda" },
              { key: "resources", label: "Recursos" },
              { key: "reading", label: "Lectura" }
            ],
            rows: [
              { case: "Escuela A", demand: "Cambio curricular rápido", resources: "Tiempo protegido, apoyo técnico y autonomía", reading: "Exigente, con recursos para responder" },
              { case: "Escuela B", demand: "Cambio curricular rápido", resources: "Sin tiempo, instrucciones ambiguas y apoyo tardío", reading: "Riesgo de desgaste acumulativo" }
            ]
          },
          keypoints: [
            "Cada demanda necesita una respuesta acorde con su nivel de control.",
            "Preguntar por recursos distribuye mejor la responsabilidad.",
            "La misma carga cambia según apoyo, control, claridad y recuperación."
          ],
          activity: decision(
            "¿Cuál análisis está más completo?",
            [
              { text: "Andrea debe organizarse mejor.", feedback: "No considera recursos, control ni diseño del trabajo." },
              { text: "La carga administrativa exige tiempo; conviene revisar qué se elimina, quién decide y qué apoyo existe.", correct: true, feedback: "Relaciona demanda, recurso y capacidad de actuar." },
              { text: "Toda demanda laboral es dañina.", feedback: "El modelo distingue demandas, recursos y condiciones." }
            ],
            "Un análisis completo conecta demanda, recurso, control y responsable.",
            "Demandas y recursos laborales"
          ),
          summary: [
            "Andrea ya ve la mochila completa: piedras y recursos. Ahora elegirá una carga prioritaria y buscará quién puede ayudar a moverla."
          ],
          references: [refs.dem, refs.hakanen, refs.skaalvik]
        },
        {
          id: "m2-l2",
          title: "Soltar, compartir, renegociar o escalar",
          duration: "25 min",
          objective: "Priorizar una demanda modificable y una acción sobre un recurso.",
          scenarioLabel: "Una piedra prioritaria",
          scenario: "Andrea elige una piedra que se repite: los cambios de horario con menos de 24 horas. Alteran su planificación, el cuidado familiar y la posibilidad de cerrar la jornada.",
          studySections: [
            {
              title: "Priorizar con control y equidad",
              paragraphs: [
                "Una prioridad útil combina impacto, frecuencia, posibilidad de cambio, equidad y riesgo de daño. La acción puede soltar una tarea de bajo valor, compartir una carga, renegociar un acuerdo o escalar una condición que requiere liderazgo.",
                "Elegir una acción personal no exime a la organización. El análisis debe nombrar quién puede decidir, quién ejecuta y quién necesita apoyo."
              ]
            }
          ],
          workedExample: [
            "Demanda: cambios de horario tardíos. Evidencia: seis cambios en tres semanas con menos de 24 horas.",
            "Acción personal: usar un registro breve de cambios. Acción organizacional: acordar un plazo mínimo y un canal de excepción. Responsable: coordinación académica."
          ],
          keypoints: [
            "Priorizar permite empezar por una carga concreta.",
            "Una acción debe corresponder al nivel de control.",
            "La equidad importa: una misma regla puede afectar distinto a quienes cuidan a otras personas."
          ],
          activity: reflection(
            "Diseña una respuesta a una piedra de la mochila de Andrea.",
            [
              "Prioridad: cambios de horario con menos de 24 horas, porque alteran planificación y recuperación.",
              "Andrea puede registrar el patrón y proponer a coordinación un plazo mínimo de 48 horas, con un canal de excepción. Indicador: número de cambios tardíos durante cuatro semanas."
            ],
            [
              { id: "evidencia", label: "Evidencia observable", description: "Describe frecuencia o impacto con información operacional." },
              { id: "niveles", label: "Dos niveles", description: "Incluye una acción personal y otra colectiva u organizacional." },
              { id: "responsable", label: "Responsable", description: "Nombra quién puede decidir o sostener el cambio." },
              { id: "indicador", label: "Indicador", description: "Permite revisar si la acción ayuda." }
            ],
            55,
            105
          ),
          summary: [
            "Hacer visible la mochila ayuda a priorizar. En M3 Andrea observará qué ocurre cuando continúa respondiendo a todas esas demandas en automático."
          ],
          references: [refs.dem, refs.skaalvik, refs.who2022]
        }
      ]
    },
    {
      id: "m3",
      number: "03",
      title: "Cuando funciono en automático",
      subtitle: "Trabajo emocional y señales",
      duration: "50 min",
      lessons: [
        {
          id: "m3-l1",
          title: "El trabajo emocional de enseñar",
          duration: "25 min",
          objective: "Diferenciar regulación profesional de supresión emocional crónica.",
          scenarioLabel: "Andrea sigue funcionando",
          scenario: "Andrea responde correos, regula un conflicto y acompaña a un estudiante. Al final del día, todo está hecho, pero casi no recuerda cómo transitó de una tarea a la siguiente.",
          studySections: [
            {
              title: "Regular no es negar",
              paragraphs: [
                "Enseñar implica interpretar situaciones, regular respuestas y mostrar emociones compatibles con la tarea pedagógica. El problema no es regularse, sino hacerlo continuamente sin autonomía, apoyo o tiempo para procesar lo ocurrido (Chang, 2009).",
                "Una emoción aporta información, pero no define por sí sola una decisión. Observarla permite reconocer necesidad, contexto y recurso."
              ]
            }
          ],
          workedExample: [
            "Hecho: un apoderado eleva la voz durante una reunión. Interpretación: “no valora mi trabajo”. Emoción/señal: tensión y rabia. Respuesta: Andrea termina rápido y evita pedir apoyo.",
            "Reformulación: separar hecho e interpretación permite elegir una pausa y solicitar que otra persona acompañe la conversación."
          ],
          keypoints: [
            "Cumplir las tareas no muestra por sí solo los recursos que costó sostenerlas.",
            "La regulación profesional necesita recuperación y apoyo.",
            "Mirar el patrón ayuda a recuperar capacidad de elección."
          ],
          activity: decision(
            "¿Qué lectura comprende mejor lo que vive Andrea?",
            [
              { text: "Andrea no sabe controlar sus emociones.", feedback: "Atribuye una falla personal sin mirar condiciones." },
              { text: "Andrea regula demandas emocionales repetidas y necesita tiempo, apoyo y límites para procesarlas.", correct: true, feedback: "Reconoce el trabajo emocional y los recursos necesarios." },
              { text: "Sentir irritación demuestra que perdió su compromiso profesional.", feedback: "Una emoción no permite concluir cómo es su compromiso profesional." }
            ],
            "La lectura responsable distingue regulación, contexto, acumulación y recursos.",
            "Regular no es negar"
          ),
          summary: [
            "Andrea reconoce el automático y recupera una pausa para elegir. En la siguiente experiencia reconstruirá una escena paso a paso."
          ],
          references: [refs.chang, refs.maslach]
        },
        {
          id: "m3-l2",
          title: "Hecho, interpretación, emoción y necesidad",
          duration: "25 min",
          objective: "Reconstruir una situación exigente y formular una necesidad observable.",
          scenarioLabel: "Después de una reunión tensa",
          scenario: "Andrea tarda el doble en corregir, olvida una instrucción y posterga una conversación. Al ordenar la escena, distingue lo que ocurrió de lo que pensó sobre sí misma.",
          studySections: [
            {
              title: "Un mapa para decidir",
              paragraphs: [
                "Separar hecho, interpretación, emoción/señal, respuesta y necesidad reduce inferencias apresuradas. El objetivo no es negar la interpretación, sino reconocer que todavía puede revisarse.",
                "Cuando las señales se vuelven intensas, persistentes o afectan la vida cotidiana, buscar orientación profesional y activar canales de apoyo amplía las opciones de cuidado (WHO, 2022)."
              ]
            }
          ],
          workedExample: [
            "Hecho: Andrea olvidó una instrucción y tardó el doble. Interpretación: “estoy fallando”. Señal: tensión y dificultad para concentrarse.",
            "Necesidad: cerrar la jornada con prioridades claras. Acción segura: pedir a coordinación confirmar por escrito los cambios y revisar carga."
          ],
          keypoints: [
            "Un hecho puede describirse antes de atribuir una intención.",
            "Una necesidad se expresa de forma observable.",
            "Pedir ayuda es una conducta profesional de cuidado."
          ],
          activity: reflection(
            "Reconstruye la escena de Andrea y formula una acción segura.",
            [
              "Hechos: tardó el doble en corregir y olvidó una instrucción después de la reunión. Interpretación: “no estoy rindiendo”. Señal: tensión y dificultad para concentrarse.",
              "Necesidad: claridad y una pausa de cierre. Acción: pedir a coordinación priorizar por escrito dos tareas y posponer una tercera. Revisar al final de la semana."
            ],
            [
              { id: "hechos", label: "Hechos separados", description: "No atribuye intención ni identidad." },
              { id: "necesidad", label: "Necesidad observable", description: "Se conecta con la escena." },
              { id: "accion", label: "Acción segura", description: "Incluye apoyo, responsable o canal." },
              { id: "cuidado-conclusion", label: "Cuidado de la conclusión", description: "Conserva la incertidumbre y formula un apoyo posible." }
            ],
            55,
            110
          ),
          summary: [
            "El mapa muestra que la jornada continúa en la mente de Andrea. En M4 preguntará qué permite recuperarse y qué límites necesitan acuerdos."
          ],
          references: [refs.chang, refs.who2022, refs.roediger]
        }
      ]
    },
    {
      id: "m4",
      number: "04",
      title: "Descansar no siempre alcanza",
      subtitle: "Recuperación y límites sostenibles",
      duration: "45 min",
      lessons: [
        {
          id: "m4-l1",
          title: "Descansar y recuperar",
          duration: "22 min",
          objective: "Distinguir descanso pasivo, recuperación psicológica y condiciones que la impiden.",
          scenarioLabel: "La jornada continúa mentalmente",
          scenario: "Andrea se sienta a descansar, pero las conversaciones y los pendientes continúan ocupando su atención. El cuerpo se detiene; la jornada todavía sigue dentro de ella.",
          studySections: [
            {
              title: "Cuatro experiencias de recuperación",
              paragraphs: [
                "La recuperación puede incluir desconexión psicológica, relajación, experiencia de dominio y control. Desconectarse no es dejar de importar; es permitir que la atención deje de responder al trabajo durante un periodo acotado (Sonnentag & Fritz, 2015).",
                "La viabilidad depende de carga, normas y liderazgo. Por eso una práctica personal debe acompañarse de acuerdos colectivos o ajustes organizacionales cuando corresponda (WHO, 2022)."
              ]
            }
          ],
          comparison: {
            title: "Consejo genérico o límite practicable",
            caption: "Un límite útil define conducta, momento, canal y excepción.",
            columns: [
              { key: "type", label: "Tipo" },
              { key: "phrase", label: "Ejemplo" },
              { key: "problem", label: "Qué permite revisar" }
            ],
            rows: [
              { type: "Genérico", phrase: "Tengo que cuidarme más", problem: "No define conducta ni condición" },
              { type: "Practicable", phrase: "Revisaré correo hasta las 18:30; las urgencias usarán el canal acordado", problem: "Conducta, momento, canal y excepción" }
            ]
          },
          keypoints: [
            "Descanso y recuperación son experiencias relacionadas, pero distintas.",
            "Desconectarse por un momento protege la atención.",
            "La recuperación necesita prácticas personales y condiciones de trabajo que las hagan posibles."
          ],
          activity: decision(
            "¿Cuál límite es más operacionalizable?",
            [
              { text: "Voy a cuidarme más.", feedback: "No define conducta, momento ni apoyo." },
              { text: "No pensaré nunca en el trabajo.", feedback: "Es absoluto y difícil de revisar." },
              { text: "Cerraré el correo a las 18:30 y usaré el canal de urgencia acordado; coordinación revisará excepciones.", correct: true, feedback: "Define conducta, momento, canal, excepción y responsable." }
            ],
            "Un límite practicable se puede comunicar, sostener y revisar.",
            "Cuatro experiencias de recuperación"
          ),
          summary: [
            "Andrea distingue descanso de recuperación. Ahora probará un límite pequeño y observará qué necesita negociar para sostenerlo."
          ],
          references: [refs.sonnentag, refs.who2022]
        },
        {
          id: "m4-l2",
          title: "Un experimento de recuperación de siete días",
          duration: "23 min",
          objective: "Diseñar un límite pequeño con barrera, apoyo e indicador.",
          scenarioLabel: "Probar sin autoexigencia",
          scenario: "Andrea elige cerrar una tarea antes de irse. Sabe que los cambios tardíos pueden interrumpir el plan, así que conversa con el equipo sobre un acuerdo posible.",
          studySections: [
            {
              title: "Un experimento para aprender",
              paragraphs: [
                "Una prueba breve sirve para aprender. Debe incluir cuándo y dónde ocurrirá, una barrera prevista, un apoyo o acuerdo y una señal para revisar.",
                "Si una condición del trabajo interrumpe la práctica, esa barrera aporta información: permite ajustar el plan o llevar la conversación al nivel donde puede resolverse."
              ]
            }
          ],
          workedExample: [
            "Práctica: anotar las tres prioridades del día y cerrar correo a las 18:30 durante siete días.",
            "Barrera: cambios tardíos. Apoyo: canal único de urgencias. Indicador: número de noches sin revisar correo y energía percibida al iniciar."
          ],
          keypoints: [
            "Una prueba debe ser pequeña y revisable.",
            "La barrera aporta información sobre el sistema.",
            "Un límite real necesita condiciones que lo hagan practicable."
          ],
          activity: reflection(
            "Diseña el experimento de siete días de Andrea.",
            [
              "Andrea cerrará el correo a las 18:30 durante siete días. Si aparece una urgencia, se usará el canal acordado y coordinación definirá la excepción.",
              "Registrará solo si respetó el cierre y cuántas excepciones hubo. Al día 7 decidirá mantener, ajustar o proponer un cambio de proceso."
            ],
            [
              { id: "conducta", label: "Conducta concreta", description: "Se puede observar sin interpretar emociones." },
              { id: "barrera", label: "Barrera prevista", description: "Reconoce una condición que puede interferir." },
              { id: "apoyo", label: "Apoyo o acuerdo", description: "No depende solamente de Andrea." },
              { id: "revision", label: "Fecha e indicador", description: "Permite mantener, ajustar o escalar." }
            ],
            55,
            105
          ),
          summary: [
            "Andrea descubre que un límite se vuelve posible cuando encuentra apoyo. En M5 practicará una conversación de cuidado que respeta la decisión de la otra persona."
          ],
          references: [refs.sonnentag, refs.who2022, refs.roediger]
        }
      ]
    },
    {
      id: "m5",
      number: "05",
      title: "Cuidarnos no puede ser individual",
      subtitle: "Apoyo, reconocimiento y cuidado colectivo",
      duration: "45 min",
      lessons: [
        {
          id: "m5-l1",
          title: "Una conversación que cuida",
          duration: "22 min",
          objective: "Practicar una conversación de cuidado con permiso, privacidad y límites.",
          scenarioLabel: "Andrea pide apoyo",
          scenario: "Andrea deja de responder “estoy bien” por inercia. Una colega se acerca con calma, pregunta si le sirve conversar y escucha sin apresurarse a ofrecer soluciones.",
          studySections: [
            {
              title: "Cuatro movimientos de cuidado",
              paragraphs: [
                "Una conversación segura pide permiso, escucha sin diagnosticar, aclara qué apoyo se solicita y acuerda seguimiento. Compartir es voluntario y siempre debe existir una alternativa.",
                "El apoyo organizacional incluye justicia, reconocimiento, ayuda disponible y señales de que la organización valora la contribución y el bienestar (Kurtessis et al., 2017)."
              ]
            }
          ],
          workedExample: [
            "Frase invasiva: “Cuéntame todo; seguro presentas una condición”.",
            "Frase segura: “¿Te sirve conversar cinco minutos? Puedes decir que no. Si prefieres, podemos mirar solo qué apoyo concreto necesitas para esta semana”."
          ],
          keypoints: [
            "Acompañar no es diagnosticar.",
            "El permiso puede retirarse.",
            "Aceptar un “no” también es cuidar.",
            "El apoyo se vuelve real cuando se traduce en conductas y recursos."
          ],
          activity: decision(
            "Una colega dice “no puedo más, pero no quiero hablar”. ¿Qué respuesta es más segura?",
            [
              { text: "Esto confirma una condición; deberías contarlo a dirección.", feedback: "Atribuye una condición e invade la privacidad." },
              { text: "Todos estamos igual, ya pasará.", feedback: "Minimiza y normaliza la carga." },
              { text: "Está bien no hablar. Si te sirve, puedo ayudarte con una tarea concreta o retomamos cuando tú elijas.", correct: true, feedback: "Respeta la negativa y mantiene apoyo disponible." }
            ],
            "Una respuesta segura pide permiso, acepta el no, ofrece alternativa y evita etiquetas.",
            "Cuatro movimientos de cuidado"
          ),
          summary: [
            "Andrea descubre que pedir apoyo puede ser concreto y respetuoso. Ahora el equipo convertirá ese cuidado en un acuerdo observable."
          ],
          references: [refs.kurtessis, refs.who2022]
        },
        {
          id: "m5-l2",
          title: "Del apoyo al acuerdo de equipo",
          duration: "23 min",
          objective: "Diseñar un acuerdo con conducta, responsable, frecuencia e indicador.",
          scenarioLabel: "Una carga compartida",
          scenario: "El equipo detecta que las reuniones sin propósito consumen tiempo de planificación. En lugar de sumar otra conversación general, decide probar un acuerdo concreto.",
          studySections: [
            {
              title: "Un acuerdo no es una intención",
              paragraphs: [
                "“Comunicarnos mejor” no define qué cambiará. Un acuerdo verificable nombra conducta, responsable, frecuencia, canal, fecha de revisión e indicador.",
                "La participación debe permitir alternativas. Cada persona conserva el control sobre su bitácora y puede utilizar el acuerdo sin justificarlo con información personal."
              ]
            }
          ],
          workedExample: [
            "Acuerdo: coordinación enviará propósito y decisiones esperadas 24 horas antes. Las reuniones durarán 35 minutos y cerrarán con responsables.",
            "Indicador: porcentaje de reuniones con agenda y tareas cerradas durante cuatro semanas."
          ],
          keypoints: [
            "Un acuerdo se vuelve practicable cuando tiene responsable y fecha.",
            "La evidencia operacional permite revisar el cambio.",
            "La privacidad y las mejores condiciones pueden avanzar juntas."
          ],
          privacyReminder: "La bitácora y los relatos personales permanecen bajo control de cada persona. Para el acuerdo basta con información operacional.",
          activity: reflection(
            "Diseña un acuerdo de equipo para el caso de Andrea.",
            [
              "Durante cuatro semanas, coordinación enviará agenda 24 horas antes y cerrará cada reunión con responsables y plazos. Quien no pueda asistir recibirá decisiones por escrito.",
              "El equipo revisará duración real y porcentaje de reuniones con cierre. No se solicitarán explicaciones personales para usar la alternativa."
            ],
            [
              { id: "conducta", label: "Conducta", description: "Describe qué ocurrirá de manera observable." },
              { id: "responsable", label: "Responsable", description: "Nombra quién sostiene el acuerdo." },
              { id: "frecuencia", label: "Frecuencia y revisión", description: "Incluye plazo o periodicidad." },
              { id: "privacidad", label: "Privacidad", description: "No exige revelar información personal." }
            ],
            55,
            110
          ),
          summary: [
            "El apoyo ya se convirtió en conducta. En M6 el equipo ampliará la mirada: ¿qué condición del trabajo debe rediseñarse?"
          ],
          references: [refs.kurtessis, refs.who2022]
        }
      ]
    },
    {
      id: "m6",
      number: "06",
      title: "Condiciones que cuidan",
      subtitle: "Organización del trabajo y prevención",
      duration: "50 min",
      lessons: [
        {
          id: "m6-l1",
          title: "Cuidar también es rediseñar el trabajo",
          duration: "25 min",
          objective: "Distinguir una acción cosmética de una intervención organizacional.",
          scenarioLabel: "El patrón del equipo",
          scenario: "El equipo de Andrea pone sobre la mesa tres patrones: cambios de última hora, reuniones sin cierre y poco tiempo protegido. La pregunta cambia: ¿qué condición del trabajo podemos rediseñar?",
          studySections: [
            {
              title: "Priorizar el diseño del trabajo",
              paragraphs: [
                "La OMS recomienda priorizar intervenciones organizacionales que modifiquen condiciones de trabajo, además de fortalecer capacidades individuales y apoyo. Carga, horarios, claridad de rol, participación, violencia y apoyo de jefaturas son áreas posibles (WHO, 2022).",
                "En Chile, CEAL-SM/SUSESO ofrece el marco oficial para evaluar riesgos psicosociales laborales. Aquí el foco es comprender las demandas y convertir los hallazgos en acciones observables (Superintendencia de Seguridad Social, s. f.)."
              ]
            }
          ],
          workedExample: [
            "Acción cosmética: enviar una frase motivacional después de una semana de cambios tardíos.",
            "Cambio estructural: definir plazo mínimo para modificar horarios, canal de excepción, responsable y revisión mensual."
          ],
          keypoints: [
            "La prevención empieza por el diseño del trabajo.",
            "Medir riesgos cobra sentido cuando conduce a acciones y seguimiento.",
            "Los procesos oficiales y los acuerdos cotidianos se complementan."
          ],
          activity: decision(
            "¿Cuál acción modifica una condición del trabajo?",
            [
              { text: "Recomendar una aplicación de meditación.", feedback: "Puede ser un apoyo individual, pero no cambia la condición." },
              { text: "Rediseñar reuniones y proteger tiempo de planificación con responsable e indicador.", correct: true, feedback: "Actúa sobre el proceso de trabajo." },
              { text: "Pedir que cada docente sea más resiliente.", feedback: "Traslada la carga a la persona." }
            ],
            "Una intervención organizacional modifica un proceso, recurso, rol o condición y permite seguimiento.",
            "Priorizar el diseño del trabajo"
          ),
          summary: [
            "El equipo identifica una condición concreta que puede cambiar. Ahora la convertirá en una propuesta factible y medible."
          ],
          references: [refs.who2022, refs.suseso, refs.mineduc]
        },
        {
          id: "m6-l2",
          title: "Una propuesta organizacional en 90 segundos",
          duration: "25 min",
          objective: "Formular un cambio con evidencia, responsable, plazo e indicador.",
          scenarioLabel: "De la observación a la propuesta",
          scenario: "En tres semanas hubo seis cambios de horario con menos de 24 horas. El equipo reúne la evidencia y prepara una propuesta breve para coordinación.",
          studySections: [
            {
              title: "Priorizar sin prometer demasiado",
              paragraphs: [
                "Una propuesta sólida incluye problema, evidencia simple, cambio específico, persona responsable, plazo, indicador y resguardo de equidad. También reconoce dependencias y barreras.",
                "El objetivo es probar un cambio razonable y aprender de su efecto, no asegurar que una única medida resolverá el desgaste."
              ]
            }
          ],
          workedExample: [
            "Problema y evidencia: seis cambios con menos de 24 horas en tres semanas.",
            "Propuesta: establecer 48 horas como plazo mínimo, salvo contingencia definida. Responsable: coordinación. Revisión: cuatro semanas. Indicador: cambios tardíos y horas de planificación afectadas."
          ],
          keypoints: [
            "La evidencia puede ser sencilla y operacional.",
            "Responsable significa capacidad real de actuar.",
            "El indicador permite ajustar, escalar o cerrar."
          ],
          activity: reflection(
            "Escribe la propuesta organizacional del equipo de Andrea.",
            [
              "En tres semanas se registraron seis cambios de horario con menos de 24 horas, afectando planificación. Proponemos un plazo mínimo de 48 horas y un canal de excepción definido.",
              "Coordinación implementará la prueba durante cuatro semanas. Revisaremos número de cambios tardíos, excepciones y horas de planificación afectadas para decidir si mantener o ajustar."
            ],
            [
              { id: "problema", label: "Problema y evidencia", description: "Usa hechos operacionales." },
              { id: "cambio", label: "Cambio específico", description: "Actúa sobre el proceso." },
              { id: "responsable", label: "Responsable y plazo", description: "La capacidad de decisión está clara." },
              { id: "indicador", label: "Indicador y equidad", description: "Permite evaluar efecto y diferencias relevantes." }
            ],
            65,
            120
          ),
          summary: [
            "Andrea ya no carga sola con la explicación. En M7 recuperará sentido sin convertir la vocación en mandato de sacrificio."
          ],
          references: [refs.who2022, refs.mineduc, refs.suseso]
        }
      ]
    },
    {
      id: "m7",
      number: "07",
      title: "Recuperar sentido sin idealizar la vocación",
      subtitle: "Valores, conexión y agencia",
      duration: "55 min",
      lessons: [
        {
          id: "m7-l1",
          title: "El sentido necesita condiciones",
          duration: "25 min",
          objective: "Reconocer aspectos valiosos de enseñar sin convertirlos en obligación de sacrificio.",
          scenarioLabel: "Andrea recuerda lo que quiere recuperar",
          scenario: "Andrea extraña la conexión con estudiantes, la creatividad y la calma. Quiere acercarse otra vez a lo que la mueve, con recursos y límites que permitan sostenerlo.",
          studySections: [
            {
              title: "Valores con recursos y límites",
              paragraphs: [
                "El sentido puede actuar como recurso motivacional, pero no debe transformarse en mandato de sacrificio. La consonancia entre valores personales y organizacionales se asocia con bienestar y compromiso; las demandas que agotan siguen necesitando revisión (Skaalvik & Skaalvik, 2018).",
                "Recuperar puede significar dejar de hacer, renegociar, pedir apoyo, proteger una práctica significativa o definir un criterio de “suficientemente bien”."
              ]
            }
          ],
          workedExample: [
            "Idealización: “Si Andrea ama enseñar, debería poder dar un poco más”.",
            "Agencia sostenible: “Andrea quiere recuperar creatividad; necesita tiempo protegido y dejar de rehacer materiales que ya cumplen el propósito”."
          ],
          keypoints: [
            "La vocación se sostiene con límites, apoyo y condiciones saludables.",
            "Recuperar sentido puede incluir simplificar, pedir apoyo o dejar una tarea.",
            "Una acción sostenible protege a la persona y a su propósito."
          ],
          activity: decision(
            "¿Cuál frase evita idealizar la vocación?",
            [
              { text: "Quien ama enseñar siempre puede dar un poco más.", feedback: "Convierte el sentido en mandato de sacrificio." },
              { text: "El sentido puede ser un recurso, pero necesita límites, apoyo y condiciones sostenibles.", correct: true, feedback: "Integra valor profesional y condiciones." },
              { text: "Poner límites demuestra falta de compromiso.", feedback: "Los límites pueden proteger la continuidad del trabajo." }
            ],
            "El sentido profesional se sostiene con recursos, límites y capacidad de elección.",
            "Valores con recursos y límites"
          ),
          summary: [
            "Andrea separa el valor del sacrificio. Ahora convertirá aquello que quiere recuperar en acciones pequeñas, elegidas y revisables."
          ],
          references: [refs.hakanen, refs.skaalvik]
        },
        {
          id: "m7-l2",
          title: "Tres acciones graduadas",
          duration: "30 min",
          objective: "Convertir un valor docente en acciones con tamaño, apoyo y revisión.",
          scenarioLabel: "Elegir sin añadir otra carga",
          scenario: "Andrea elige proteger una conversación pedagógica significativa, simplificar una tarea y pedir tiempo de planificación. Cada paso tiene un tamaño y necesita apoyos diferentes.",
          image: {
            src: "../../../../assets/images/aula/cuando-ensenar-agota/bitacora-recuperar-original.png",
            webp: "../../../../assets/images/aula/cuando-ensenar-agota/bitacora-recuperar.webp",
            alt: "Bitácora ilustrada para identificar qué parte valiosa de la enseñanza se quiere recuperar y convertirla en acciones pequeñas con apoyo y límites.",
            width: 1024,
            height: 1536,
            caption: "Recuperar significa acercarse a un valor importante con pasos pequeños, recursos y límites."
          },
          studySections: [
            {
              title: "Graduar para sostener",
              paragraphs: [
                "Una acción pequeña está bajo control directo. Una acción compartida necesita apoyo. Una propuesta organizacional requiere una persona con capacidad de decisión. Graduarlas evita pedirle a Andrea que resuelva sola todo el sistema.",
                "Cada acción incluye fecha, apoyo y una señal para decidir si mantenerla, ajustarla o detenerla."
              ]
            }
          ],
          workedExample: [
            "Valor: conexión. Acción personal: cerrar una clase con una pregunta de salida una vez por semana.",
            "Acción compartida: intercambiar una estrategia con una colega. Acción organizacional: proteger 30 minutos quincenales para planificación colaborativa."
          ],
          keypoints: [
            "La agencia aumenta cuando la acción tiene tamaño y fecha.",
            "Dejar de hacer también puede ser una decisión válida.",
            "El apoyo necesario debe nombrarse."
          ],
          activity: reflection(
            "Diseña tres acciones graduadas para que Andrea recupere un valor sin sobrecargarse.",
            [
              "Valor: conexión con estudiantes. Acción pequeña: una pregunta de salida los viernes. Acción compartida: revisar respuestas con una colega una vez al mes.",
              "Acción organizacional: solicitar 30 minutos quincenales de planificación colaborativa. Indicador: la práctica ocurre sin extender la jornada. Si añade carga, se simplifica o detiene."
            ],
            [
              { id: "valor", label: "Valor claro", description: "No se formula como obligación." },
              { id: "graduacion", label: "Tres niveles", description: "Distingue control personal, apoyo y decisión organizacional." },
              { id: "limite", label: "Límite", description: "Evita añadir una carga sostenible solo en apariencia." },
              { id: "revision", label: "Revisión", description: "Incluye señal y fecha." }
            ],
            65,
            125
          ),
          summary: [
            "Andrea ya reconoce señales, demandas, recursos, recuperación, apoyo, condiciones y valores. En M8 integrará todo en un Plan Vivo de dos niveles."
          ],
          references: [refs.hakanen, refs.skaalvik, refs.roediger]
        }
      ]
    },
    {
      id: "m8",
      number: "08",
      title: "Plan Vivo de Bienestar Docente",
      subtitle: "De la reflexión a la transformación",
      duration: "60 min",
      lessons: [
        {
          id: "m8-l1",
          title: "Un Plan Vivo de dos niveles",
          duration: "30 min",
          objective: "Integrar una acción personal sostenible y una propuesta colectiva u organizacional.",
          scenarioLabel: "Andrea deja de vaciar sola la mochila",
          scenario: "Andrea reúne lo aprendido y construye un plan con dos movimientos: uno bajo su control y otro que necesita un acuerdo institucional. También decide cómo sabrá si el plan ayuda.",
          studySections: [
            {
              title: "Integrar sin prometer una técnica universal",
              paragraphs: [
                "Las intervenciones dirigidas a docentes muestran efectos favorables modestos en estrés, agotamiento y bienestar, con variación de calidad y enfoque. La decisión práctica es combinar acciones según necesidades y condiciones y evaluar resultados (Iancu et al., 2018; Klingbeil & Renshaw, 2018).",
                "El Plan Vivo incluye situación, demanda y recurso, evidencia no sensible, acción personal, propuesta colectiva, responsable, fecha, indicador, privacidad y criterio para ajustar o escalar."
              ]
            }
          ],
          workedExample: [
            "Situación: cambios tardíos interrumpen planificación. Acción personal: registro breve y cierre de correo. Propuesta organizacional: plazo mínimo de 48 horas.",
            "Indicador: cambios tardíos y horas de planificación afectadas. Revisión: 30 días. Cuidado: sin nombres, diagnósticos ni notas privadas."
          ],
          keypoints: [
            "Un Plan Vivo combina agencia personal y responsabilidad organizacional.",
            "La evidencia puede ser simple, pero debe permitir decidir.",
            "El plan protege privacidad y conserva incertidumbre."
          ],
          privacyReminder: "El Plan Vivo se evalúa por la calidad de sus decisiones. Mantén fuera del texto nombres, diagnósticos y notas de la bitácora.",
          activity: reflection(
            "Redacta el Plan Vivo de Andrea con dos niveles de acción.",
            [
              "Andrea prioriza los cambios de horario tardíos. Probará cerrar correo a las 18:30 y registrar solo número de excepciones. Solicitará a coordinación un plazo mínimo de 48 horas y un canal de urgencias.",
              "Coordinación será responsable de la prueba durante 30 días. Indicadores: cambios tardíos y horas de planificación afectadas. Si no mejora, revisarán barreras y escalarán al proceso institucional correspondiente."
            ],
            [
              { id: "analisis", label: "Demanda, recurso y evidencia", description: "Relaciona elementos y conserva incertidumbre." },
              { id: "dos-niveles", label: "Dos niveles de acción", description: "Incluye acción personal y propuesta colectiva." },
              { id: "medicion", label: "Medición y ajuste", description: "Incluye responsable, fecha, indicador y alternativa." },
              { id: "cuidado", label: "Privacidad y no diagnóstico", description: "Criterio crítico: debe quedar completamente resuelto." },
              { id: "fundamento", label: "Fundamento", description: "Usa al menos dos conceptos y dos fuentes del curso." }
            ],
            85,
            150
          ),
          summary: [
            "El Plan Vivo ya tiene una primera versión. El siguiente paso es verificar sus criterios y mejorarlo antes de cerrar."
          ],
          resources: [
            { label: "Plantilla del Plan Vivo", href: "recursos/plantilla-plan-vivo.pdf" },
            { label: "Bitácora completa", href: "recursos/bitacora-cuando-ensenar-agota.pdf" }
          ],
          references: [refs.iancu, refs.klingbeil, refs.who2022]
        },
        {
          id: "m8-l2",
          title: "Revisar, mejorar y decidir",
          duration: "20 min",
          objective: "Aplicar la rúbrica y decidir qué necesita un segundo intento.",
          scenarioLabel: "La revisión de Andrea",
          scenario: "El primer plan de Andrea propone “cuidarse más” y “mejorar la comunicación”. La intención importa; ahora necesita convertirse en conductas, responsables, fechas e indicadores.",
          studySections: [
            {
              title: "Criterios de competencia",
              paragraphs: [
                "El plan competente relaciona demanda, recurso y señal; incluye dos niveles; define conductas, responsables, fechas e indicadores; protege datos; y usa al menos dos conceptos y dos fuentes.",
                "Privacidad/no diagnóstico y responsabilidad organizacional son criterios críticos. Si quedan bajo nivel competente, el plan requiere revisión aunque el promedio sea suficiente."
              ]
            },
            {
              title: "Qué acredita la finalización",
              paragraphs: [
                "La evaluación valora decisiones y productos, no el estado emocional. La bitácora es obligatoria como práctica y no recibe puntaje. El tiempo de conexión no basta para aprobar.",
                "La ruta pondera recuperaciones M1–M7 (20 %), simulaciones M3, M5 y M6 (25 %), Plan Vivo (45 %) y transferencia a 30 días (10 %). La aprobación global mínima es 70 % y el Plan Vivo debe alcanzar nivel competente."
              ]
            }
          ],
          workedExample: [
            "Versión inicial: “Andrea debería comunicarse mejor”.",
            "Segundo intento: “Andrea solicitará a coordinación un plazo mínimo de 48 horas para cambios; se revisarán excepciones y horas afectadas durante 30 días”."
          ],
          keypoints: [
            "La retroalimentación explica un criterio y permite reintentar.",
            "La evaluación no solicita diagnósticos ni relatos personales.",
            "El Plan Vivo exige responsabilidad organizacional."
          ],
          activity: decision(
            "¿Qué cambio mejora más el plan inicial de Andrea?",
            [
              { text: "Añadir una frase motivacional.", feedback: "No convierte la intención en una acción verificable." },
              { text: "Definir conducta, responsable, fecha, indicador y criterio de ajuste.", correct: true, feedback: "Permite ejecutar, observar y mejorar." },
              { text: "Describir con más detalle cómo se siente Andrea.", feedback: "El estado emocional no es la evidencia evaluada y no debe exponerse." }
            ],
            "Un plan competente conecta análisis, dos niveles de acción, medición, privacidad y fundamento.",
            "Criterios de competencia"
          ),
          summary: [
            "Andrea mejoró el plan sin exponer su bitácora. Solo falta programar recuperaciones y decidir qué hará con la evidencia a 30 días."
          ],
          references: [refs.iancu, refs.klingbeil, refs.who2022]
        },
        {
          id: "m8-l3",
          title: "Lo que sigue vivo a 30 días",
          duration: "10 min",
          objective: "Programar recuperaciones espaciadas y una decisión de seguimiento.",
          scenarioLabel: "Un plan que sigue vivo",
          scenario: "Andrea cierra la pantalla y deja cuatro fechas agendadas. Volverá a recordar, decidir y revisar el plan con evidencia sencilla durante los próximos 30 días.",
          studySections: [
            {
              title: "Recuperar para consolidar",
              paragraphs: [
                "Recordar una idea después de un intervalo y aplicarla en otro contexto fortalece el aprendizaje. Las revisiones de los días 2, 7, 14 y 30 piden decidir, reformular y transferir, no releer todo el curso (Cepeda et al., 2006; Roediger & Karpicke, 2006)."
              ]
            }
          ],
          spacedPractice: [
            { day: "Día 2", focus: "Estrés, agotamiento y no diagnóstico", product: "Tres decisiones y una reformulación." },
            { day: "Día 7", focus: "Mochila y recuperación", product: "Clasificación y microexperimento." },
            { day: "Día 14", focus: "Apoyo y condiciones", product: "Respuesta a una escena de equipo." },
            { day: "Día 30", focus: "Plan Vivo", product: "Mantener, ajustar, escalar o cerrar." }
          ],
          workedExample: [
            "A 30 días, Andrea observa que bajaron los cambios tardíos, pero las reuniones siguen sin cierre. Mantiene el plazo mínimo y ajusta el acuerdo de reuniones.",
            "Si aumentan las señales o el impacto, busca orientación profesional y activa apoyos institucionales; el curso no reemplaza esa atención."
          ],
          keypoints: [
            "El seguimiento usa evidencia operacional y breve.",
            "Mantener, ajustar, escalar o cerrar son decisiones válidas.",
            "La certificación reconoce una propuesta razonada y un proceso de aprendizaje."
          ],
          activity: decision(
            "A 30 días, el indicador no mejora. ¿Qué corresponde?",
            [
              { text: "Culpar a Andrea por no sostener el plan.", feedback: "La barrera puede estar en el entorno o en el diseño del plan." },
              { text: "Mantener la misma acción indefinidamente.", feedback: "El seguimiento existe para aprender y ajustar." },
              { text: "Revisar barreras y decidir si ajustar, escalar o buscar apoyo adicional.", correct: true, feedback: "Usa la evidencia para una decisión responsable." }
            ],
            "El seguimiento convierte la evidencia en una decisión de mantener, ajustar, escalar o cerrar.",
            "Recuperar para consolidar"
          ),
          summary: [
            "Andrea termina con un plan vivo, no con una promesa de perfección: reconocer la carga, recuperar recursos y transformar condiciones."
          ],
          resources: [
            { label: "Referencias y lecturas", href: "recursos/referencias-y-lecturas.pdf" },
            { label: "Resumen de conceptos", href: "recursos/resumen-conceptos-esenciales.pdf" }
          ],
          references: [refs.cepeda, refs.roediger, refs.who2022]
        }
      ]
    }
  ];

  const lessons = modules.flatMap(module => module.lessons.map(lesson => ({
    pedagogyVersion: "1.1",
    moduleId: module.id,
    moduleNumber: module.number,
    moduleTitle: module.title,
    ...lesson
  })));

  return {
    slug: "cuando-ensenar-agota",
    title: "Cuando enseñar agota",
    subtitle: "Comprender, prevenir y transformar el desgaste emocional docente",
    signature: "Núcleo Vivo · Aula Sembrar",
    message: "Reconocer la carga. Recuperar recursos. Transformar condiciones.",
    version: "1.0 · Julio 2026",
    estimatedMinutes: 425,
    estimatedHours: 7.08,
    localOnly: true,
    uiLabels: {
      studyKicker: "Comprender",
      studyTitle: "Lo que nos ayuda a mirar",
      exampleKicker: "Miremos el caso",
      exampleTitle: "Andrea en contexto",
      retrievalKicker: "Para recordar",
      retrievalTitle: "Ideas para quedarte",
      activityKicker: "Pruébalo",
      synthesisKicker: "Para continuar",
      synthesisTitle: "Lo que abre esta experiencia",
      resourcesTitle: "Materiales para acompañar tu recorrido"
    },
    privacy: {
      analytics: ["avance", "módulos completados", "intentos", "resultados académicos", "entrega del proyecto"],
      excluded: ["diagnósticos", "notas privadas", "relatos personales", "nombres de terceros", "datos de salud", "inferencias psicológicas"]
    },
    assessment: {
      passPercent: 70,
      weights: {
        retrieval: 20,
        simulations: 25,
        plan: 45,
        transfer: 10,
        journal: 0
      },
      criticalCriteria: ["privacidad/no diagnóstico", "responsabilidad organizacional"]
    },
    pedagogicalModel: {
      id: "aula-viva-pedagogy-v1",
      sequence: [
        "situación auténtica",
        "decisión inicial",
        "explicación breve",
        "ejemplo trabajado",
        "práctica guiada",
        "recuperación",
        "retroalimentación",
        "segundo intento",
        "transferencia",
        "puente"
      ]
    },
    modules,
    lessons
  };
})();
