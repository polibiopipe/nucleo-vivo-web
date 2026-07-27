(() => {
  "use strict";

  const course = window.IA_COURSE;
  if (!course?.lessons) return;

  const reference = (apa, url) => ({ apa, url });
  const refs = {
    nistGen: reference(
      "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1",
      "https://doi.org/10.6028/NIST.AI.600-1"
    ),
    nistRmf: reference(
      "Tabassi, E. (2023). Artificial intelligence risk management framework (AI RMF 1.0) (NIST AI 100-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.100-1",
      "https://doi.org/10.6028/NIST.AI.100-1"
    ),
    unesco: reference(
      "United Nations Educational, Scientific and Cultural Organization. (2021). Recommendation on the ethics of artificial intelligence. UNESCO. https://unesdoc.unesco.org/ark:/48223/pf0000381137",
      "https://unesdoc.unesco.org/ark:/48223/pf0000381137"
    ),
    oecd: reference(
      "Organisation for Economic Co-operation and Development. (2024). OECD AI principles. https://oecd.ai/en/ai-principles",
      "https://oecd.ai/en/ai-principles"
    ),
    noy: reference(
      "Noy, S., & Zhang, W. (2023). Experimental evidence on the productivity effects of generative artificial intelligence. Science, 381(6654), 187–192. https://doi.org/10.1126/science.adh2586",
      "https://doi.org/10.1126/science.adh2586"
    ),
    brynjolfsson: reference(
      "Brynjolfsson, E., Li, D., & Raymond, L. R. (2023). Generative AI at work (NBER Working Paper No. 31161). National Bureau of Economic Research. https://doi.org/10.3386/w31161",
      "https://doi.org/10.3386/w31161"
    ),
    martin: reference(
      "Martin, F., Wu, T., Wan, L., & Xie, K. (2022). A meta-analysis on the Community of Inquiry presences and learning outcomes in online and blended learning environments. Online Learning, 26(1), 325–359. https://doi.org/10.24059/olj.v26i1.2604",
      "https://doi.org/10.24059/olj.v26i1.2604"
    ),
    hemmler: reference(
      "Hemmler, Y. M., & Ifenthaler, D. (2024). Self-regulated learning strategies in continuing education: A systematic review and meta-analysis. Educational Research Review, 45, Article 100629. https://doi.org/10.1016/j.edurev.2024.100629",
      "https://doi.org/10.1016/j.edurev.2024.100629"
    )
  };

  const closedCompletion = {
    requiresAnswer: true,
    requiresCorrectAnswer: true,
    requiresFeedbackReview: true,
    allowRetry: true,
    attemptsAreNotPenalized: true
  };

  const openCompletion = (minimumWords, maximumWords) => ({
    requiresSavedResponse: true,
    minimumWords,
    maximumWords,
    requiresAllCriteria: true,
    requiresModelAnswerView: true,
    requiresFeedbackReview: true,
    allowEditing: true,
    allowRetry: true,
    attemptsAreNotPenalized: true
  });

  const lessons = {
    "m7-l1": {
      pedagogyVersion: "1.1",
      duration: "18–20 min",
      objective: "Identificar sesgo, opacidad y automatización de alto impacto.",
      scenario: "Un sistema favorece a personas con mayor disponibilidad horaria y excluye indirectamente a quienes realizan tareas de cuidado.",
      image: {
        src: "../../../../assets/images/aula/ia-con-criterio-humano/modulo-07-supervision-humana.png",
        webp: "../../../../assets/images/aula/ia-con-criterio-humano/modulo-07-supervision-humana.webp",
        alt: "Dos profesionales revisan una lista de comprobación y corrigen juntos un borrador generado con apoyo de inteligencia artificial.",
        caption: "Supervisar exige criterio, información y autoridad para corregir o rechazar una recomendación.",
        width: 1672,
        height: 941,
        loading: "lazy"
      },
      studySections: [
        {
          title: "El sesgo puede ser indirecto",
          paragraphs: [
            "Un sistema puede producir exclusión aunque no use categorías sensibles explícitas. Variables aparentemente neutrales pueden representar condiciones sociales desiguales.",
            "Los datos históricos reflejan prácticas y decisiones anteriores. Automatizarlos puede reproducir desigualdades, incluso cuando el criterio parece objetivo."
          ]
        },
        {
          title: "Evaluar por grupos y consecuencias",
          paragraphs: [
            "Analiza tasas de error, beneficios y perjuicios entre grupos relevantes. No basta con medir una precisión promedio que puede ocultar diferencias.",
            "También debe existir una vía de revisión individual, porque una estadística general no corrige un caso concreto ni repara por sí sola una consecuencia."
          ]
        },
        {
          title: "Supervisión real",
          paragraphs: [
            "La persona supervisora necesita información suficiente, competencia y autoridad para cambiar la recomendación. Confirmar automáticamente no es revisar.",
            "La transparencia debe ser proporcional: las personas necesitan comprender el papel de la IA y cómo pueden cuestionar o corregir una decisión."
          ]
        }
      ],
      workedExample: [
        "Si un sistema usa disponibilidad total como indicador de compromiso, puede penalizar a personas cuidadoras aunque no incluya una categoría sensible explícita.",
        "La organización debe examinar si el criterio es pertinente, comparar impactos entre grupos, revisar cada caso mediante una persona competente, corregir el proceso y ofrecer apelación."
      ],
      keypoints: [
        "Los efectos indirectos también pueden excluir.",
        "Medir solo promedios oculta diferencias.",
        "La supervisión debe poder cambiar decisiones.",
        "Deben existir explicación y corrección."
      ],
      activity: {
        type: "decision",
        prompt: "¿Qué respuesta corresponde ante una recomendación que afecta de manera desigual a personas cuidadoras?",
        instructions: [
          "Selecciona la respuesta que aborda criterios, impactos y corrección.",
          "Lee la explicación y contrástala con el criterio esperado.",
          "Si ignoraste efectos indirectos o transparencia, revisa el material y reintenta sin penalización."
        ],
        expectedCriterion: "Auditar la pertinencia de los criterios y sus impactos entre grupos, realizar una revisión humana competente con autoridad para cambiar la recomendación y ofrecer explicación y apelación.",
        reviewSection: "Evaluar por grupos y consecuencias y Supervisión real",
        allowRetry: true,
        options: [
          {
            text: "Aceptar la recomendación porque el sistema no usa categorías sensibles.",
            feedback: "Una variable aparentemente neutral puede representar desigualdades y excluir de manera indirecta. La ausencia de una categoría explícita no demuestra equidad."
          },
          {
            text: "Auditar criterios e impactos, revisar humanamente y ofrecer apelación.",
            correct: true,
            feedback: "Esta respuesta examina proceso y consecuencias, asigna autoridad humana real y permite explicar, cuestionar y corregir un caso concreto."
          },
          {
            text: "Ocultar el uso del sistema para evitar preocupación.",
            feedback: "La opacidad dificulta comprender el papel de la IA, cuestionar una decisión y detectar impactos desiguales; no corrige el criterio problemático."
          }
        ]
      },
      completion: { ...closedCompletion },
      summary: [
        "Los efectos indirectos pueden excluir aunque no se utilicen categorías sensibles. La evaluación necesita comparar errores, beneficios y perjuicios entre grupos.",
        "Una supervisión real comprende el proceso, puede cambiar el resultado y ofrece a las personas explicación, revisión individual y vías de corrección."
      ],
      references: [refs.unesco, refs.oecd, refs.nistGen]
    },
    "m7-l2": {
      pedagogyVersion: "1.1",
      duration: "15–18 min",
      objective: "Comunicar adopción tecnológica con participación y claridad.",
      scenario: "La empresa anuncia automatización destacando solo ahorro. El equipo interpreta que habrá despidos.",
      studySections: [
        {
          title: "La incertidumbre necesita información honesta",
          paragraphs: [
            "Un mensaje excesivamente optimista no elimina el temor. Las personas necesitan saber qué se hará, qué no, qué decisiones están pendientes y cómo podrán participar.",
            "La comunicación responsable distingue hechos, hipótesis y compromisos. También evita prometer resultados que el piloto todavía no ha demostrado."
          ]
        },
        {
          title: "Participación y dignidad",
          paragraphs: [
            "Incluir a quienes realizan el trabajo mejora la identificación de riesgos y evita diseñar procesos desconectados de la realidad.",
            "Debe existir espacio para preguntas sin represalias y mecanismos para incorporar observaciones a la evaluación y al rediseño."
          ]
        },
        {
          title: "Productividad con bienestar",
          paragraphs: [
            "El valor no se reduce a velocidad. También incluye calidad, aprendizaje, seguridad, autonomía y bienestar.",
            "Una adopción que aumenta vigilancia, carga invisible o ansiedad puede producir costos organizacionales importantes que deben considerarse."
          ]
        }
      ],
      workedExample: [
        "Apertura responsable: “Probaremos una herramienta para apoyar borradores internos durante cuatro semanas. No automatizará decisiones de personal”.",
        "El mensaje añade que se revisarán los resultados con el equipo y que los criterios se publicarán antes de ampliar el uso. Así comunica propósito, límites, participación y fecha de revisión."
      ],
      keypoints: [
        "Explica propósito y límites.",
        "Di qué se sabe y qué no.",
        "Crea espacios de preguntas sin represalias.",
        "Incluye a las personas afectadas."
      ],
      activity: {
        type: "reflection",
        prompt: "Escribe una apertura para presentar un piloto ficticio de IA al equipo.",
        instructions: [
          "Redacta entre 120 y 180 palabras.",
          "Incluye propósito, alcance, límites, participación y una fecha de revisión.",
          "Distingue lo decidido de lo pendiente y usa un lenguaje claro que no instale miedo ni optimismo vacío.",
          "Guarda, revisa los criterios, compara con el modelo y mejora la comunicación."
        ],
        minimumWords: 120,
        maximumWords: 180,
        responseLabel: "Tu apertura para el equipo",
        responsePlaceholder: "Durante las próximas cuatro semanas probaremos…",
        rubricTitle: "Autoevaluación de comunicación responsable",
        criteriaRequirement: "Revisa los seis criterios de la apertura.",
        allowRetry: true,
        requiredCriteria: [
          { id: "purpose", label: "Propósito", description: "Explica qué problema o tarea se desea explorar." },
          { id: "scope", label: "Alcance", description: "Define duración, personas y tareas del piloto." },
          { id: "limits", label: "Límites", description: "Aclara qué no hará la herramienta y qué sigue bajo decisión humana." },
          { id: "participation", label: "Participación", description: "Abre preguntas sin represalias e incorpora observaciones." },
          { id: "review", label: "Fecha de revisión", description: "Indica cuándo y con qué evidencia se decidirá." },
          { id: "language", label: "Lenguaje no amenazante", description: "Distingue hechos, hipótesis y compromisos sin prometer resultados." }
        ],
        modelAnswer: [
          "Durante las próximas cuatro semanas probaremos una herramienta aprobada para apoyar borradores internos de bajo riesgo. El propósito es explorar si reduce el tiempo total de preparación sin disminuir la calidad. No automatizará decisiones de personal, no enviará mensajes y no utilizará datos personales ni confidenciales.",
          "Todavía no se ha decidido ampliar su uso. Cada borrador será revisado por una persona y registraremos tiempo, correcciones, errores y efectos sobre la carga de trabajo. Quienes realizan la tarea podrán plantear preguntas y observaciones sin represalias mediante una reunión semanal y un canal escrito.",
          "Al terminar las cuatro semanas revisaremos la evidencia con el equipo. Decidiremos continuar, ajustar o detener considerando calidad, seguridad, aprendizaje, autonomía y bienestar. Publicaremos los criterios y explicaremos cualquier cambio antes de ampliar el alcance."
        ]
      },
      completion: openCompletion(120, 180),
      summary: [
        "La comunicación responsable explica propósito, límites, hechos, dudas y decisiones pendientes. La participación permite identificar riesgos que un anuncio unilateral puede ocultar.",
        "El valor del cambio incluye calidad, aprendizaje, seguridad, autonomía y bienestar. La evaluación y sus criterios se comunican antes de ampliar un piloto."
      ],
      references: [refs.unesco, refs.martin, refs.hemmler]
    },
    "m8-l1": {
      pedagogyVersion: "1.1",
      title: "Diseña tu flujo responsable",
      duration: "30–35 min",
      objective: "Construir un proceso aplicable, medible y seguro.",
      scenario: "Proyecto Aurora necesita un piloto de bajo riesgo que demuestre valor sin usar información confidencial.",
      image: {
        src: "../../../../assets/images/aula/ia-con-criterio-humano/modulo-08-plan-piloto.png",
        webp: "../../../../assets/images/aula/ia-con-criterio-humano/modulo-08-plan-piloto.webp",
        alt: "Equipo interdisciplinario diseña un plan piloto con etapas de datos, modelo, evaluación, gobernanza y revisión humana.",
        caption: "El flujo responsable hace visibles la tarea, los controles, la medición y la decisión de detener.",
        width: 1672,
        height: 941,
        loading: "lazy"
      },
      studySections: [
        {
          title: "Integrar los cuatro marcos",
          paragraphs: [
            "El producto final combina VALOR para elegir la tarea, CLARO para formular la instrucción, VERIFICA para controlar la salida y DETENER para responder ante señales de riesgo.",
            "El flujo debe describir entradas, herramienta autorizada, salida, revisión, responsable, indicador y condición de detención."
          ]
        },
        {
          title: "Diseño paso a paso",
          paragraphs: [
            "Primero define la tarea y lo que no se delega; luego determina datos permitidos, redacta una instrucción CLARO, establece VERIFICA y fija señales DETENER.",
            "Finalmente nombra a una persona responsable y mide tiempo total, errores y calidad. El proceso debe ser suficientemente simple para ejecutarse y suficientemente claro para auditarse."
          ]
        },
        {
          title: "Piloto y aprendizaje",
          paragraphs: [
            "Comienza con un alcance pequeño. Registra incidentes, correcciones y cambios, y revisa al final si el valor justifica continuar.",
            "Evita convertir el piloto en una adopción permanente antes de evaluarlo. La evidencia puede justificar continuar, ajustar o detener."
          ]
        }
      ],
      workedExample: [
        "Flujo: borradores de correos internos ficticios. Entrada: propósito, audiencia y datos no sensibles. Herramienta: plataforma aprobada. Salida: borrador marcado como no enviado.",
        "Revisión: tono, hechos, compromisos y destinatario. Responsable: coordinación. Indicador: tiempo total y correcciones. DETENER: aparición de datos reales o compromisos inventados."
      ],
      keypoints: [
        "Define qué no se delega.",
        "Incluye controles y responsable.",
        "Mide el ciclo completo.",
        "Establece señales de detención."
      ],
      activity: {
        type: "reflection",
        prompt: "Construye un flujo responsable que integre VALOR, CLARO, VERIFICA y DETENER.",
        instructions: [
          "Escribe entre 350 y 500 palabras sobre una tarea ficticia y de bajo riesgo.",
          "Incluye tarea y VALOR, datos permitidos y excluidos, instrucción CLARO, control VERIFICA, señales DETENER, responsable e indicador.",
          "Define qué no se delega, usa una herramienta autorizada y mide el ciclo completo, incluida la revisión.",
          "Guarda el borrador, revisa los ocho criterios, compara con el modelo y mejora el flujo antes de completarlo."
        ],
        minimumWords: 350,
        maximumWords: 500,
        responseLabel: "Tu diseño de flujo responsable",
        responsePlaceholder: "Tarea y VALOR…\nDatos…\nCLARO…",
        rubricTitle: "Rúbrica del flujo responsable",
        criteriaRequirement: "Revisa los ocho criterios del flujo responsable.",
        allowRetry: true,
        requiredCriteria: [
          { id: "task-value", label: "Tarea y VALOR", description: "Elige una tarea de bajo riesgo y justifica su valor e impacto." },
          { id: "data", label: "Datos", description: "Define entradas permitidas y excluidas mediante minimización." },
          { id: "tool", label: "Herramienta y salida", description: "Nombra un entorno autorizado y una salida no ejecutada automáticamente." },
          { id: "claro", label: "Instrucción CLARO", description: "Incluye Contexto, Labor, Audiencia, Reglas y Resultado observable." },
          { id: "verifica", label: "Control VERIFICA", description: "Describe acciones concretas para los ocho componentes." },
          { id: "detener", label: "Señales DETENER", description: "Fija condiciones que suspenden el flujo y el canal de escalamiento." },
          { id: "responsible", label: "Responsable", description: "Identifica quién revisa, aprueba, corrige y responde." },
          { id: "measurement", label: "Indicador y decisión", description: "Mide ciclo completo y define continuar, ajustar o detener." }
        ],
        modelAnswer: [
          "Tarea y VALOR. El piloto preparará borradores de agendas para reuniones internas ficticias. El valor esperado es reducir el tiempo de estructuración sin automatizar convocatorias ni decisiones. La afectación a personas es baja porque el material no se enviará y no incluirá evaluaciones. La salida es observable: una agenda revisable. La coordinación del proyecto será responsable.",
          "Datos y herramienta. Las entradas serán propósito, duración, temas generales y categorías de participantes. Se excluirán nombres, correos, conversaciones, documentos internos, credenciales y datos personales o confidenciales. Se utilizará únicamente una herramienta aprobada. Cada salida quedará marcada como borrador y nunca activará un envío.",
          "CLARO — Contexto: reunión ficticia de coordinación mensual. Labor: proponer una agenda. Audiencia: equipo interno que conoce el proyecto. Reglas: máximo seis puntos, no inventar decisiones, responsables ni fechas; escribir [DATO PENDIENTE] ante cualquier vacío. Resultado observable: título, objetivo, agenda con tiempos y lista de datos pendientes.",
          "VERIFICA — Veracidad y Evidencia: contrastar temas y duración con la entrada autorizada. Riesgo e Intención: comprobar que la salida no asigne tareas ni cambie el propósito. Formato e Impacto: revisar claridad, tiempos, accesibilidad y posibles exclusiones. Correcciones y Aprobación: registrar cambios y exigir aprobación de la coordinación antes de copiar el borrador a otro sistema.",
          "DETENER. El flujo se suspenderá si aparecen nombres o datos reales, compromisos inventados, una solicitud de envío automático, una fuente imposible de comprobar o un cambio hacia decisiones de personal. La persona revisora no responderá en el mismo flujo: conservará evidencia, avisará a coordinación y consultará el canal institucional correspondiente.",
          "Responsabilidad. La coordinación revisará todas las salidas, podrá rechazarlas, corregirá errores y responderá por el uso final. La herramienta no decidirá asistentes, prioridades ni compromisos. Un colega realizará una segunda revisión de las dos primeras pruebas para detectar ambigüedades.",
          "Indicadores. Durante cuatro semanas se compararán cinco agendas manuales y cinco asistidas. Se medirá tiempo total, incluido control, cantidad de correcciones, omisiones y compromisos inventados. También se registrarán incidentes y dudas. No se contará solo la velocidad de generación.",
          "Decisión final. El piloto continuará únicamente si reduce el tiempo total sin aumentar errores ni exposición. Se ajustará si una regla más clara corrige fallos acotados. Se detendrá si la revisión cuesta más que producir manualmente, se repiten omisiones críticas o no pueden protegerse los datos. Los resultados se revisarán con el equipo antes de ampliar el alcance."
        ]
      },
      completion: openCompletion(350, 500),
      summary: [
        "Un flujo responsable integra elección de tarea, instrucción, verificación y respuesta ante riesgos. También hace visibles datos, herramienta, salida, responsable e indicadores.",
        "El piloto comienza pequeño, registra correcciones e incidentes y no se convierte en adopción permanente hasta que la evidencia permita decidir continuar, ajustar o detener."
      ],
      references: [refs.nistRmf, refs.nistGen, refs.unesco, refs.noy, refs.brynjolfsson]
    },
    "m8-l2": {
      pedagogyVersion: "1.1",
      duration: "18–20 min",
      objective: "Definir una aplicación realista y una revisión posterior.",
      scenario: "Aprender no garantiza aplicación. La transferencia necesita tiempo, apoyo, herramientas y acuerdos.",
      image: {
        src: "../../../../assets/images/aula/ia-con-criterio-humano/modulo-08-practica-individual.png",
        webp: "../../../../assets/images/aula/ia-con-criterio-humano/modulo-08-practica-individual.webp",
        alt: "Profesional desarrolla individualmente un plan aplicado, toma notas y revisa beneficios, riesgos y medidas de mitigación.",
        caption: "La transferencia convierte una intención en práctica mediante apoyo, fecha, indicador y revisión.",
        width: 1672,
        height: 941,
        loading: "lazy"
      },
      studySections: [
        {
          title: "De la intención a la acción",
          paragraphs: [
            "Una intención genérica suele desaparecer frente a las urgencias. Un plan de transferencia define una acción, fecha, apoyo, responsable e indicador.",
            "También identifica barreras del entorno: falta de tiempo, ausencia de herramienta aprobada, reglas contradictorias o supervisión insuficiente."
          ]
        },
        {
          title: "Aprendizaje situado",
          paragraphs: [
            "La aplicación mejora cuando existe apoyo social, oportunidad de practicar y retroalimentación. Por eso el plan incluye a una persona o equipo que acompañará.",
            "El objetivo no es usar IA a toda costa, sino probar una práctica responsable en las condiciones reales del rol y de la organización."
          ]
        },
        {
          title: "Revisión a 30 días",
          paragraphs: [
            "Después de un mes, compara resultados con la línea base. Pregunta qué mejoró, qué empeoró, qué riesgos aparecieron y qué debe cambiar.",
            "Una revisión puede concluir continuar, ajustar o detener. La acción se considera aprendizaje solo si la evidencia modifica la decisión."
          ]
        }
      ],
      workedExample: [
        "Acción: probar borradores de minutas ficticias dos veces por semana. Apoyo: colega revisor. Fecha: cuatro semanas. Indicador: tiempo total y cantidad de correcciones.",
        "Barrera: falta de horario protegido. Respuesta: reservar 30 minutos semanales. A los 30 días se comparan resultados y se decide continuar, ajustar o detener."
      ],
      keypoints: [
        "Una acción concreta supera una intención.",
        "El entorno puede facilitar o impedir la transferencia.",
        "Define apoyo, fecha e indicador.",
        "Revisa y ajusta después de 30 días."
      ],
      activity: {
        type: "reflection",
        prompt: "Escribe tu plan de transferencia a 30 días.",
        instructions: [
          "Redacta entre 200 y 300 palabras con una acción realista y de bajo riesgo.",
          "Incluye apoyo, responsable, fecha, barrera, protección de datos y una señal observable de éxito.",
          "Describe la línea base y el criterio que permitirá continuar, ajustar o detener.",
          "Guarda, revisa los criterios, compara con el modelo y mejora el plan."
        ],
        minimumWords: 200,
        maximumWords: 300,
        responseLabel: "Tu plan de transferencia",
        responsePlaceholder: "Acción…\nApoyo y responsable…",
        rubricTitle: "Autoevaluación del plan a 30 días",
        criteriaRequirement: "Revisa los cinco criterios del plan de transferencia.",
        allowRetry: true,
        requiredCriteria: [
          { id: "specific", label: "Especificidad", description: "Define acción, frecuencia, fecha y persona responsable." },
          { id: "realistic", label: "Realismo y apoyo", description: "Identifica una barrera y el apoyo para abordarla." },
          { id: "data", label: "Protección de datos", description: "Usa datos ficticios o un entorno autorizado y fija exclusiones." },
          { id: "review", label: "Revisión e indicador", description: "Compara tiempo total, calidad, errores y línea base." },
          { id: "decision", label: "Decisión final", description: "Distingue condiciones para continuar, ajustar o detener." }
        ],
        modelAnswer: [
          "Durante los próximos 30 días probaré dos veces por semana una práctica de bajo riesgo: preparar borradores de minutas para reuniones ficticias. No automatizaré el envío ni asignaré compromisos. Usaré una herramienta aprobada con temas generales; excluiré nombres, correos, conversaciones, documentos internos y cualquier dato personal o confidencial.",
          "Seré responsable de revisar cada borrador. Una colega actuará como apoyo y revisará las dos primeras pruebas con una pauta de exactitud, tono, acuerdos y datos pendientes. La principal barrera es la falta de tiempo protegido, por lo que reservaré 30 minutos cada viernes para practicar y registrar resultados. Si la herramienta aprobada no estuviera disponible, mantendré el proceso manual y consultaré antes de cambiar de plataforma.",
          "La línea base será el tiempo total y la cantidad de correcciones de tres minutas manuales. En cada prueba registraré preparación, revisión, omisiones, compromisos inventados y dudas. El día 30 compararé ambos procesos con mi colega.",
          "Continuaré si disminuye el tiempo total sin aumentar errores ni exposición. Ajustaré la instrucción o la pauta si los fallos son acotados y corregibles. Detendré la práctica si revisar toma más tiempo, aparecen datos reales, se repiten omisiones importantes o no existe supervisión suficiente. Documentaré la decisión y los cambios necesarios."
        ]
      },
      completion: openCompletion(200, 300),
      summary: [
        "La transferencia necesita una acción específica, condiciones del entorno, apoyo, responsable, fecha e indicador. Una intención sin oportunidad de práctica suele diluirse.",
        "La revisión a 30 días compara el ciclo completo con una línea base y usa evidencia para continuar, ajustar o detener."
      ],
      references: [refs.hemmler, refs.martin]
    },
    "m8-l3": {
      pedagogyVersion: "1.1",
      duration: "12–15 min",
      objective: "Recuperar las decisiones centrales y formular un compromiso profesional.",
      scenario: "Vuelve a la regla inicial que escribiste y compárala con lo que ahora sabes.",
      studySections: [
        {
          title: "El criterio integra valor y límite",
          paragraphs: [
            "Una persona competente no solo sabe obtener una respuesta. Sabe decidir cuándo usar la herramienta, qué datos excluir, cómo verificar, cuándo detenerse y cuándo pedir apoyo especializado.",
            "El criterio no es una lista rígida. Es la capacidad de justificar una decisión considerando propósito, evidencia, riesgo y personas afectadas."
          ]
        },
        {
          title: "Recuperación final",
          paragraphs: [
            "VALOR elige la tarea. CLARO construye una instrucción revisable. VERIFICA controla la salida. DETENER protege frente a señales de riesgo e incidentes.",
            "Los cuatro marcos se complementan y deben adaptarse al contexto. Ninguno elimina la responsabilidad humana ni la necesidad de apoyo especializado."
          ]
        },
        {
          title: "Compromiso",
          paragraphs: [
            "Un compromiso profesional debe ser específico, observable y compatible con las responsabilidades del rol.",
            "No debe prometer que nunca habrá errores, sino establecer cómo se prevendrán, detectarán y corregirán."
          ]
        }
      ],
      workedExample: [
        "Compromiso modelo: usar IA como apoyo para borradores de bajo riesgo, sin ingresar datos personales o confidenciales en herramientas no autorizadas.",
        "El compromiso añade revisión de hechos y compromisos, y una señal para detenerse cuando el resultado no pueda comprobarse o afecte a personas sin supervisión suficiente."
      ],
      keypoints: [
        "El valor no elimina el riesgo.",
        "La revisión forma parte del uso.",
        "La responsabilidad permanece en personas y organizaciones.",
        "Detenerse puede ser una decisión competente."
      ],
      activity: {
        type: "reflection",
        prompt: "Formula tu compromiso profesional de criterio humano.",
        instructions: [
          "Escribe entre 120 y 180 palabras.",
          "Incluye una tarea permitida, un límite de datos, una regla de verificación y una señal de detención.",
          "Compara con tu regla inicial y describe al menos un cambio en tu criterio.",
          "Guarda, revisa la rúbrica, compara con el modelo y mejora el compromiso."
        ],
        minimumWords: 120,
        maximumWords: 180,
        responseLabel: "Tu compromiso profesional",
        responsePlaceholder: "Usaré IA como apoyo para…",
        rubricTitle: "Autoevaluación del compromiso",
        criteriaRequirement: "Revisa los cinco criterios del compromiso profesional.",
        allowRetry: true,
        requiredCriteria: [
          { id: "allowed", label: "Tarea permitida", description: "Delimita un uso concreto, de bajo riesgo y compatible con el rol." },
          { id: "data", label: "Límite de datos", description: "Excluye información personal, sensible o confidencial no autorizada." },
          { id: "verification", label: "Regla de verificación", description: "Define qué comprobarás y quién aprobará." },
          { id: "stop", label: "Señal de detención", description: "Indica cuándo detener y pedir apoyo." },
          { id: "change", label: "Cambio de criterio", description: "Explica cómo evolucionó tu regla desde el inicio." }
        ],
        modelAnswer: [
          "Usaré IA como apoyo para preparar borradores internos de bajo riesgo cuando exista una herramienta autorizada y una persona responsable. No delegaré decisiones sobre personas, no automatizaré envíos y no presentaré una salida como verificada solo porque sea clara o detallada.",
          "Trabajaré con datos ficticios, públicos o efectivamente anonimizados. No ingresaré nombres, credenciales ni información personal, sensible o confidencial sin una finalidad legítima y un entorno aprobado. Antes de usar un resultado comprobaré hechos, fuentes, destinatarios, tono y compromisos; registraré correcciones y solicitaré aprobación cuando el impacto lo requiera.",
          "Detendré el proceso si no puedo comprobar una fuente, aparecen datos no autorizados, la revisión cuesta más que producir manualmente o una recomendación afecta a personas sin supervisión suficiente. Al inicio pensaba principalmente en ahorrar tiempo; ahora mi criterio incluye valor neto, protección de datos, revisión, impacto y responsabilidad."
        ]
      },
      completion: openCompletion(120, 180),
      summary: [
        "El criterio humano integra valor, límites, evidencia, riesgo y efectos sobre personas. Los cuatro marcos orientan decisiones, pero deben adaptarse al contexto.",
        "Un compromiso profesional observable define qué uso está permitido, qué datos se excluyen, cómo se verifica, cuándo se detiene y qué cambió en el propio razonamiento."
      ],
      references: [refs.nistGen, refs.unesco, refs.oecd]
    }
  };

  course.lessons = course.lessons.map(lesson => (
    lessons[lesson.id]
      ? { ...lesson, ...lessons[lesson.id] }
      : lesson
  ));
})();
