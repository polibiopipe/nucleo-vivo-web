(() => {
  "use strict";

  const course = window.IA_COURSE;
  if (!course?.lessons) return;

  const reference = (apa, url) => ({ apa, url });
  const refs = {
    martin: reference(
      "Martin, F., Wu, T., Wan, L., & Xie, K. (2022). A meta-analysis on the Community of Inquiry presences and learning outcomes in online and blended learning environments. Online Learning, 26(1), 325–359. https://doi.org/10.24059/olj.v26i1.2604",
      "https://doi.org/10.24059/olj.v26i1.2604"
    ),
    hemmler: reference(
      "Hemmler, Y. M., & Ifenthaler, D. (2024). Self-regulated learning strategies in continuing education: A systematic review and meta-analysis. Educational Research Review, 45, Article 100629. https://doi.org/10.1016/j.edurev.2024.100629",
      "https://doi.org/10.1016/j.edurev.2024.100629"
    ),
    law19628: reference(
      "Ley N.º 19.628 sobre protección de la vida privada. (1999). Diario Oficial de la República de Chile. Biblioteca del Congreso Nacional de Chile. https://www.bcn.cl/leychile/navegar?idNorma=141599",
      "https://www.bcn.cl/leychile/navegar?idNorma=141599"
    ),
    law21719: reference(
      "Ley N.º 21.719, regula la protección y el tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales. (2024). Diario Oficial de la República de Chile. Biblioteca del Congreso Nacional de Chile. https://www.bcn.cl/leychile/navegar?idNorma=1209272",
      "https://www.bcn.cl/leychile/navegar?idNorma=1209272"
    ),
    nistGen: reference(
      "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1",
      "https://doi.org/10.6028/NIST.AI.600-1"
    ),
    nistRmf: reference(
      "Tabassi, E. (2023). Artificial intelligence risk management framework (AI RMF 1.0) (NIST AI 100-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.100-1",
      "https://doi.org/10.6028/NIST.AI.100-1"
    ),
    noy: reference(
      "Noy, S., & Zhang, W. (2023). Experimental evidence on the productivity effects of generative artificial intelligence. Science, 381(6654), 187–192. https://doi.org/10.1126/science.adh2586",
      "https://doi.org/10.1126/science.adh2586"
    ),
    brynjolfsson: reference(
      "Brynjolfsson, E., Li, D., & Raymond, L. R. (2023). Generative AI at work (NBER Working Paper No. 31161). National Bureau of Economic Research. https://doi.org/10.3386/w31161",
      "https://doi.org/10.3386/w31161"
    ),
    unesco: reference(
      "United Nations Educational, Scientific and Cultural Organization. (2021). Recommendation on the ethics of artificial intelligence. UNESCO. https://unesdoc.unesco.org/ark:/48223/pf0000381137",
      "https://unesdoc.unesco.org/ark:/48223/pf0000381137"
    ),
    oecd: reference(
      "Organisation for Economic Co-operation and Development. (2024). OECD AI principles. https://oecd.ai/en/ai-principles",
      "https://oecd.ai/en/ai-principles"
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
    "m0-l2": {
      pedagogyVersion: "1.1",
      duration: "10–12 min",
      objective: "Comprender el Ciclo de Aprendizaje Vivo y definir una meta propia.",
      scenario: "El curso no se completa mirando pantallas. Se aprende al recuperar ideas, tomar decisiones, practicar, recibir retroalimentación y aplicar lo aprendido.",
      studySections: [
        {
          title: "Aprender requiere actividad",
          paragraphs: [
            "Leer es importante, pero no suficiente. La comprensión se fortalece cuando la persona explica con sus propias palabras, compara opciones, identifica errores y aplica el conocimiento a una situación distinta. Por eso cada experiencia combina contenido, recuperación activa, práctica y transferencia.",
            "El error no se utiliza como castigo. Una respuesta incorrecta muestra qué idea necesita revisión. La plataforma explica el criterio, permite reintentar y conserva la autonomía de quien aprende."
          ]
        },
        {
          title: "Práctica distribuida y metacognición",
          paragraphs: [
            "Aprender en sesiones breves y repetidas suele ser más efectivo que concentrar todo en una sola jornada. El curso vuelve sobre VALOR, CLARO, VERIFICA y DETENER en distintos momentos, porque recordar después de un intervalo ayuda a consolidar el aprendizaje.",
            "La escala de confianza permite comparar cuánto cree saber una persona con la calidad de su respuesta. Una seguridad alta junto a una respuesta incorrecta señala que conviene revisar el razonamiento, no solo memorizar una alternativa."
          ]
        },
        {
          title: "Privacidad durante el aprendizaje",
          paragraphs: [
            "Las actividades no requieren datos reales de una empresa ni de terceras personas. Se puede practicar con casos ficticios, categorías generales o información anonimizada. El aprendizaje nunca justifica exponer información confidencial.",
            "En Chile, el tratamiento de datos personales está regulado actualmente por la Ley N.º 19.628. La Ley N.º 21.719 introduce un régimen reforzado cuya entrada en vigencia está prevista para el 1 de diciembre de 2026; por eso el curso diferencia la norma vigente de la futura regulación."
          ]
        }
      ],
      workedExample: [
        "Una meta débil sería: “Quiero aprender IA”. No identifica una tarea, un límite ni una conducta que pueda observarse.",
        "Una meta útil sería: “Quiero aprender a usar IA para preparar borradores de correos comerciales sin ingresar datos de clientes y revisando cada compromiso antes del envío”. Esta versión define tarea, límite de datos, revisión y resultado observable."
      ],
      keypoints: [
        "Aprender implica recuperar, practicar, corregir y transferir.",
        "La confianza personal no demuestra corrección.",
        "Las actividades se realizan con datos ficticios o anonimizados.",
        "Una meta concreta facilita aplicar el aprendizaje."
      ],
      activity: {
        type: "reflection",
        prompt: "Define una meta propia para este curso.",
        instructions: [
          "Escribe entre 80 y 120 palabras sobre una tarea que quieras mejorar.",
          "Incluye el beneficio esperado, un dato que no ingresarás y la forma en que revisarás el resultado.",
          "Usa un caso ficticio: no incluyas nombres, clientes, empresas ni antecedentes sensibles.",
          "Guarda el borrador, comprueba los cinco criterios y compáralo con la respuesta modelo antes de mejorarlo."
        ],
        minimumWords: 80,
        maximumWords: 120,
        responseLabel: "Tu meta de aprendizaje",
        responsePlaceholder: "Durante este curso aprenderé a…",
        rubricTitle: "Autoevaluación de la meta",
        criteriaRequirement: "Revisa los cinco criterios de tu meta.",
        allowRetry: true,
        requiredCriteria: [
          { id: "task", label: "Tarea concreta", description: "Nombra una tarea delimitada que deseas mejorar." },
          { id: "benefit", label: "Beneficio observable", description: "Explica qué mejora esperas poder observar." },
          { id: "data", label: "Límite de datos", description: "Indica qué información no ingresarás." },
          { id: "review", label: "Revisión humana", description: "Describe cómo comprobarás el resultado." },
          { id: "clarity", label: "Lenguaje comprensible", description: "Formula la meta de manera directa y verificable." }
        ],
        modelAnswer: [
          "Durante este curso aprenderé a preparar borradores de correos de seguimiento usando casos ficticios. Buscaré reducir el tiempo de redacción sin automatizar el envío ni aceptar compromisos sugeridos por la herramienta.",
          "No ingresaré nombres, montos, destinatarios ni antecedentes comerciales reales. Antes de utilizar cada texto, revisaré el tono, la exactitud, los compromisos y las personas destinatarias. Registraré los errores que encuentre y consideraré que la meta avanza si puedo obtener borradores útiles sin exponer información ni aumentar el tiempo total de revisión."
        ]
      },
      completion: openCompletion(80, 120),
      summary: [
        "El Ciclo de Aprendizaje Vivo combina explicación, recuperación, práctica, retroalimentación, reintento y transferencia. Equivocarse aporta información para revisar el razonamiento.",
        "La meta personal convierte el aprendizaje en una tarea observable y segura: define el beneficio, excluye datos reales y anticipa cómo se revisará el resultado."
      ],
      references: [refs.martin, refs.hemmler, refs.law19628, refs.law21719]
    },
    "m1-l1": {
      pedagogyVersion: "1.1",
      duration: "14–16 min",
      objective: "Distinguir generación probabilística, búsqueda, análisis y automatización.",
      scenario: "Un informe generado por IA suena preciso, pero incluye una normativa inexistente.",
      studySections: [
        {
          title: "Fluidez no significa verdad",
          paragraphs: [
            "Una IA generativa produce texto calculando continuaciones plausibles a partir de patrones aprendidos y del contexto recibido. Puede redactar de manera ordenada, segura y convincente sin haber verificado cada afirmación.",
            "Cuando falta información, el sistema puede completar vacíos con datos incorrectos, referencias inventadas o interpretaciones que parecen razonables. NIST identifica esta confabulación como un riesgo característico de la IA generativa."
          ]
        },
        {
          title: "Cuatro funciones que suelen confundirse",
          paragraphs: [
            "Generar consiste en producir contenido nuevo. Buscar consiste en recuperar información desde fuentes. Analizar supone aplicar criterios a datos. Automatizar implica ejecutar acciones dentro de un proceso. Una aplicación puede combinar estas funciones, pero cada una necesita controles distintos.",
            "Un chatbot sin acceso a fuentes actuales no debe tratarse como buscador. Una herramienta que resume un documento puede omitir información. Un agente que envía correos o modifica registros requiere controles más estrictos que un generador de borradores."
          ]
        },
        {
          title: "Cuándo aporta valor",
          paragraphs: [
            "Estudios experimentales han encontrado mejoras de productividad en determinadas tareas de escritura y atención, especialmente para personas con menor experiencia inicial. Estos resultados no implican que toda tarea mejore ni que la calidad aumente automáticamente.",
            "El beneficio depende de la tarea, el nivel de riesgo, la calidad de la instrucción, la revisión y el costo de corregir errores."
          ]
        }
      ],
      workedExample: [
        "Si se pide “resume esta política” y la herramienta recibe el documento, puede producir un borrador útil, pero debe compararse con la fuente.",
        "Si se pregunta “¿cuál es la norma vigente?” sin darle acceso a fuentes oficiales, no se debe asumir que la respuesta está actualizada. El detalle puede aumentar la apariencia de autoridad, no la evidencia."
      ],
      keypoints: [
        "Plausible no significa verdadero.",
        "Generar, buscar, analizar y ejecutar son funciones diferentes.",
        "La herramienta puede escalar aciertos y errores.",
        "El valor depende del tipo de tarea y del control de calidad."
      ],
      activity: {
        type: "decision",
        prompt: "¿Qué afirmación describe correctamente a una IA generativa?",
        instructions: [
          "Selecciona una afirmación.",
          "Lee la explicación y el criterio esperado antes de completar.",
          "Si necesitas revisar, vuelve a la sección indicada y reintenta sin penalización."
        ],
        expectedCriterion: "Una IA generativa puede producir contenido convincente y equivocado; la fluidez, el detalle y la seguridad del tono no sustituyen la verificación con fuentes adecuadas.",
        reviewSection: "Fluidez no significa verdad y Cuatro funciones que suelen confundirse",
        allowRetry: true,
        options: [
          {
            text: "Una respuesta detallada es una respuesta verificada.",
            feedback: "El detalle puede aumentar la apariencia de autoridad, pero no prueba que los hechos, cifras, normas o referencias hayan sido verificados."
          },
          {
            text: "La IA generativa puede producir contenido convincente y equivocado.",
            correct: true,
            feedback: "La generación produce continuaciones plausibles; por eso la verificación debe integrarse al flujo y ajustarse al riesgo de la tarea."
          },
          {
            text: "Toda tarea mejora al usar IA.",
            feedback: "Los beneficios dependen de la tarea y del control. En algunos casos la revisión cuesta más que producir o el riesgo es inaceptable."
          }
        ]
      },
      completion: { ...closedCompletion },
      summary: [
        "La IA generativa produce salidas plausibles, no conocimiento verificado. Su fluidez puede coexistir con errores, omisiones o fuentes inexistentes.",
        "Distinguir generación, búsqueda, análisis y automatización permite asignar controles proporcionales y decidir si el beneficio justifica el costo de revisión."
      ],
      references: [refs.nistGen, refs.noy, refs.brynjolfsson]
    },
    "m1-l2": {
      pedagogyVersion: "1.1",
      duration: "12–15 min",
      objective: "Identificar decisiones que requieren supervisión y rendición de cuentas.",
      scenario: "Una jefatura quiere descartar postulantes usando una recomendación automática sin revisar criterios ni consecuencias.",
      studySections: [
        {
          title: "Delegar una tarea no equivale a delegar responsabilidad",
          paragraphs: [
            "Una organización puede utilizar IA para apoyar una decisión, pero sigue siendo responsable de sus efectos. La herramienta no responde ante una persona afectada, no repara un daño y no justifica por qué una decisión fue legítima.",
            "La supervisión humana debe ser competente, informada y con autoridad real. Una persona que solo confirma lo sugerido por el sistema no está supervisando; está automatizando la aprobación."
          ]
        },
        {
          title: "Impacto y proporcionalidad",
          paragraphs: [
            "Cuanto mayor sea el efecto sobre derechos, empleo, salud, reputación o acceso a oportunidades, mayor debe ser la capacidad de explicar, revisar y corregir.",
            "UNESCO y OECD destacan la responsabilidad, transparencia, equidad y supervisión humana como elementos centrales de una IA confiable y respetuosa de derechos."
          ]
        },
        {
          title: "Vías de corrección",
          paragraphs: [
            "Una decisión de impacto requiere criterios conocidos, registro de cómo se llegó al resultado, revisión por una persona competente y una vía para cuestionar o corregir.",
            "También debe definirse quién puede detener el uso del sistema cuando aparecen errores repetidos, sesgos o consecuencias no previstas."
          ]
        }
      ],
      workedExample: [
        "En una selección laboral, la IA puede ayudar a ordenar información administrativa, pero no debería descartar automáticamente a una persona mediante inferencias opacas.",
        "Una revisión responsable examina los criterios, contrasta evidencia, evita datos irrelevantes y permite corregir errores. Para proponer títulos de un documento interno, en cambio, la supervisión puede ser más simple."
      ],
      keypoints: [
        "La automatización no elimina la rendición de cuentas.",
        "Mayor impacto exige mayor supervisión.",
        "La revisión humana debe ser competente y tener autoridad.",
        "Las personas afectadas necesitan vías de explicación y corrección."
      ],
      activity: {
        type: "decision",
        prompt: "¿Qué condición falta para utilizar responsablemente una recomendación automática en selección?",
        instructions: [
          "Selecciona la condición que hace revisable y responsable la decisión.",
          "Contrasta tu elección con el criterio esperado.",
          "Si eliges una condición insuficiente, relee el material y reintenta sin penalización."
        ],
        expectedCriterion: "Una decisión de impacto necesita criterios transparentes, revisión humana competente con autoridad real y una vía para explicar, cuestionar y corregir el resultado.",
        reviewSection: "Impacto y proporcionalidad y Vías de corrección",
        allowRetry: true,
        options: [
          {
            text: "Que el sistema sea rápido.",
            feedback: "La velocidad no explica los criterios, no corrige errores y no reduce por sí sola el efecto que una decisión puede producir sobre las personas."
          },
          {
            text: "Criterios transparentes, revisión humana competente y vía de corrección.",
            correct: true,
            feedback: "Estas condiciones permiten examinar evidencia, asignar responsabilidad, cuestionar el resultado y corregir consecuencias no previstas."
          },
          {
            text: "Que la jefatura confíe en el proveedor.",
            feedback: "La confianza comercial no sustituye evaluar el uso concreto, sus criterios, sus impactos ni la capacidad institucional de corregir."
          }
        ]
      },
      completion: { ...closedCompletion },
      summary: [
        "La organización conserva la responsabilidad por las decisiones apoyadas por IA. Confirmar automáticamente una recomendación no constituye supervisión humana.",
        "Cuando una decisión afecta oportunidades o derechos, hacen falta criterios conocidos, revisión competente, registro, autoridad para detener y vías de explicación y corrección."
      ],
      references: [refs.unesco, refs.oecd, refs.nistRmf]
    },
    "m2-l2": {
      pedagogyVersion: "1.1",
      duration: "12–15 min",
      objective: "Reconocer señales para detener, rediseñar o descartar un uso.",
      scenario: "El equipo tarda más revisando los errores del resumen automático que preparando el resumen manual.",
      studySections: [
        {
          title: "El costo total incluye la revisión",
          paragraphs: [
            "Una herramienta puede producir un resultado rápido, pero el tiempo ahorrado desaparece si la revisión exige reconstruir el trabajo. El costo real incluye configuración, control, correcciones, coordinación, capacitación e incidentes.",
            "Por eso no basta con medir cuánto demora la IA. Debe medirse el ciclo completo, incluida la comprobación necesaria para poder usar el resultado."
          ]
        },
        {
          title: "Señales de alerta",
          paragraphs: [
            "No conviene continuar cuando el error es difícil de detectar, la revisión cuesta más que la producción, la tarea afecta derechos sin controles suficientes, los datos no pueden protegerse o nadie puede asumir responsabilidad.",
            "También es una alerta modificar el proceso solo para justificar una inversión ya realizada. El costo hundido no demuestra valor futuro."
          ]
        },
        {
          title: "Detener también es aprender",
          paragraphs: [
            "Un piloto responsable puede concluir que la herramienta no agrega valor. Esa conclusión evita escalar un proceso ineficiente.",
            "Detener no significa fracasar. Significa usar evidencia para decidir si corresponde reducir el alcance, cambiar la herramienta, rediseñar el control o abandonar el caso de uso."
          ]
        }
      ],
      workedExample: [
        "El equipo compara diez resúmenes manuales con diez generados. La IA reduce cinco minutos de redacción, pero añade ocho minutos de revisión y produce omisiones críticas en tres casos.",
        "La decisión razonable es rediseñar o detener. Solo tendría sentido probar nuevamente si una mejor fuente, un alcance más estrecho y una pauta clara pudieran reducir el error con criterios definidos."
      ],
      keypoints: [
        "El costo de verificación forma parte del costo total.",
        "No toda automatización reduce trabajo.",
        "Una decisión puede ser detener, reducir alcance o cambiar de herramienta.",
        "El costo hundido no demuestra valor."
      ],
      activity: {
        type: "decision",
        prompt: "¿Qué decisión corresponde cuando la revisión elimina el beneficio del flujo?",
        instructions: [
          "Selecciona la decisión basada en el ciclo completo.",
          "Lee la explicación y revisa el criterio esperado.",
          "Reintenta sin penalización si confundiste velocidad de generación con beneficio neto."
        ],
        expectedCriterion: "Medir producción y revisión como un solo ciclo, y rediseñar o detener cuando el costo total, la dificultad de detectar errores o el impacto superen el beneficio observable.",
        reviewSection: "El costo total incluye la revisión y Señales de alerta",
        allowRetry: true,
        options: [
          {
            text: "Mantener el flujo para justificar la inversión.",
            feedback: "Una inversión pasada es un costo hundido. Mantener un flujo sin beneficio neto solo escala tiempo perdido, errores y costos de coordinación."
          },
          {
            text: "Medir producción y revisión, y rediseñar o detener si no hay beneficio neto.",
            correct: true,
            feedback: "La decisión considera el ciclo completo y reconoce que detener, reducir el alcance o cambiar de herramienta también produce aprendizaje."
          },
          {
            text: "Eliminar la revisión para recuperar el tiempo ahorrado.",
            feedback: "Eliminar el control oculta errores y eleva el riesgo. El beneficio no puede calcularse suponiendo que el resultado es correcto sin comprobarlo."
          }
        ]
      },
      completion: { ...closedCompletion },
      summary: [
        "La velocidad de generación no representa por sí sola productividad. El costo total incorpora preparación, revisión, corrección, coordinación y posibles incidentes.",
        "Un piloto responsable puede rediseñarse o detenerse cuando no entrega beneficio neto, no permite controlar datos o errores, o carece de una persona responsable."
      ],
      references: [refs.noy, refs.brynjolfsson, refs.nistGen]
    },
    "m3-l1": {
      pedagogyVersion: "1.1",
      duration: "18–20 min",
      objective: "Construir instrucciones con objetivo, límites y criterios de calidad.",
      scenario: "“Hazme un correo profesional” produce un texto genérico y agrega compromisos que nadie autorizó.",
      studySections: [
        {
          title: "Una buena instrucción reduce ambigüedad",
          paragraphs: [
            "Una instrucción vaga obliga al sistema a completar demasiados vacíos. CLARO es un marco original de Núcleo Vivo para construir solicitudes revisables: Contexto, Labor, Audiencia, Reglas y Resultado observable.",
            "El propósito no es crear el mensaje perfecto, sino hacer explícitas las decisiones que luego podrán revisarse."
          ]
        },
        {
          title: "C — Contexto y L — Labor",
          paragraphs: [
            "El Contexto explica la situación necesaria sin entregar información confidencial. Debe incluir solo lo que cambia la respuesta.",
            "La Labor define la tarea exacta: resumir, proponer, comparar, clasificar o redactar un borrador. Conviene evitar verbos amplios como “resolver todo”."
          ]
        },
        {
          title: "A — Audiencia y R — Reglas",
          paragraphs: [
            "La Audiencia indica quién leerá el resultado y qué conocimiento previo tiene. Un correo a un cliente requiere un tono distinto a una nota interna.",
            "Las Reglas establecen límites: no inventar cifras, no asumir compromisos, usar cierta extensión, señalar dudas y excluir datos."
          ]
        },
        {
          title: "O — Resultado observable",
          paragraphs: [
            "El Resultado observable describe cómo debe verse la salida: estructura, extensión, criterios y elementos obligatorios.",
            "Un prompt claro reduce errores, pero no garantiza exactitud. La salida siempre debe verificarse según el riesgo."
          ]
        }
      ],
      workedExample: [
        "Instrucción vaga: “Haz un correo profesional”. No define contexto, audiencia, límites ni una salida comprobable.",
        "Instrucción CLARO: “Contexto: seguimiento ficticio de una cotización. Labor: redacta un borrador. Audiencia: encargada de compras. Reglas: máximo 120 palabras, tono formal, no inventes fechas ni compromisos, marca [DATO PENDIENTE] cuando falte información. Resultado: asunto y cuerpo con solicitud de confirmación”."
      ],
      keypoints: [
        "El contexto debe ser suficiente y seguro.",
        "La labor debe ser específica.",
        "La audiencia orienta tono y nivel de detalle.",
        "Las reglas impiden suposiciones no autorizadas.",
        "El resultado debe poder revisarse."
      ],
      activity: {
        type: "reflection",
        prompt: "Transforma una instrucción vaga en una instrucción CLARO.",
        instructions: [
          "Elige una tarea ficticia y redacta entre 150 y 220 palabras.",
          "Incluye Contexto, Labor, Audiencia, Reglas y Resultado observable como subtítulos.",
          "No expongas datos reales; define límites y una salida que pueda comprobarse.",
          "Guarda, revisa la rúbrica, compara con el modelo y mejora tu instrucción."
        ],
        minimumWords: 150,
        maximumWords: 220,
        responseLabel: "Tu instrucción CLARO",
        responsePlaceholder: "C — Contexto ficticio…\nL — Labor específica…",
        rubricTitle: "Autoevaluación CLARO",
        criteriaRequirement: "Revisa los cinco componentes de CLARO.",
        allowRetry: true,
        requiredCriteria: [
          { id: "context", label: "Contexto", description: "Entrega solo la situación necesaria y segura." },
          { id: "labor", label: "Labor", description: "Define una tarea concreta y delimitada." },
          { id: "audience", label: "Audiencia", description: "Identifica destinatario y nivel de conocimiento." },
          { id: "rules", label: "Reglas", description: "Incluye límites de datos, supuestos y extensión." },
          { id: "outcome", label: "Resultado observable", description: "Describe una salida estructurada y comprobable." }
        ],
        modelAnswer: [
          "C — Contexto: prepararemos un recordatorio ficticio para una reunión de coordinación de un proyecto de capacitación. Solo se conoce que la reunión será la próxima semana y que todavía falta confirmar la sala.",
          "L — Labor: redacta un borrador de correo que recuerde el propósito de la reunión y solicite confirmar asistencia. A — Audiencia: integrantes internos del proyecto que ya conocen sus objetivos generales.",
          "R — Reglas: usa tono cordial y directo, máximo 110 palabras, no inventes nombres, fechas, horarios, salas ni compromisos. Escribe [DATO PENDIENTE] cuando falte información y no agregues antecedentes de personas. No envíes el mensaje ni presentes supuestos como hechos.",
          "O — Resultado observable: entrega un asunto y un cuerpo de tres párrafos breves. El último párrafo debe solicitar confirmación. Después del borrador, enumera los datos pendientes que una persona deberá completar y revisar antes de cualquier envío. El resultado será útil solo si permite comprobar cada regla sin reconstruir la solicitud."
        ]
      },
      completion: openCompletion(150, 220),
      summary: [
        "CLARO convierte una petición vaga en una instrucción revisable al explicitar Contexto, Labor, Audiencia, Reglas y Resultado observable.",
        "La precisión del prompt reduce ambigüedad, pero no elimina la revisión. Los límites de datos, las dudas y los criterios de salida deben quedar visibles."
      ],
      references: [refs.nistGen, refs.unesco]
    },
    "m3-l2": {
      pedagogyVersion: "1.1",
      title: "Reducir ambigüedad sin sobrecargar",
      duration: "12–15 min",
      objective: "Elegir el nivel de contexto necesario para una tarea.",
      scenario: "El equipo copia un documento completo en la herramienta, aunque solo necesita redactar un título.",
      studySections: [
        {
          title: "Más contexto no siempre es mejor",
          paragraphs: [
            "Agregar información innecesaria aumenta exposición de datos y puede distraer al sistema. El principio útil es suficiencia: entregar lo necesario para la tarea y excluir lo irrelevante.",
            "Un buen contexto responde qué información cambia la salida y por qué. Que un dato esté disponible no significa que sea necesario copiarlo."
          ]
        },
        {
          title: "Dividir tareas complejas",
          paragraphs: [
            "Cuando una solicitud contiene muchos objetivos, conviene separarla en pasos: primero analizar, luego proponer y después revisar.",
            "Dividir permite detectar dónde aparece el error y reduce la tendencia a aceptar un resultado completo sin examinarlo."
          ]
        },
        {
          title: "Señalar incertidumbre",
          paragraphs: [
            "CLARO puede pedir expresamente que el sistema marque información faltante, distinga hechos de propuestas y no complete vacíos.",
            "Estas reglas mejoran la trazabilidad, aunque no sustituyen la verificación ni autorizan ingresar información innecesaria."
          ]
        }
      ],
      workedExample: [
        "Para crear un asunto de correo no es necesario pegar un contrato completo. Basta una descripción ficticia de la finalidad, la audiencia y el tono.",
        "Si se necesita analizar una cláusula, se utiliza únicamente el fragmento autorizado y pertinente, y el resultado se revisa con una fuente profesional."
      ],
      keypoints: [
        "Usa solo contexto pertinente.",
        "Divide solicitudes con objetivos múltiples.",
        "Pide marcar dudas y datos faltantes.",
        "Evita copiar información solo porque está disponible."
      ],
      activity: {
        type: "reflection",
        prompt: "Define el contexto suficiente para un recordatorio ficticio de reunión.",
        instructions: [
          "Escribe entre 100 y 150 palabras.",
          "Explica qué incluirías y qué excluirías para redactar el recordatorio.",
          "Incluye propósito, audiencia, fecha ficticia y tono; excluye nombres reales, conversaciones completas y antecedentes irrelevantes.",
          "Guarda, revisa los criterios, compara con el modelo y corrige antes de completar."
        ],
        minimumWords: 100,
        maximumWords: 150,
        responseLabel: "Tu selección de contexto",
        responsePlaceholder: "Incluiría…\nExcluiría…",
        rubricTitle: "Autoevaluación de suficiencia",
        criteriaRequirement: "Revisa los cinco criterios de contexto suficiente.",
        allowRetry: true,
        requiredCriteria: [
          { id: "purpose", label: "Propósito", description: "Define para qué se redactará el recordatorio." },
          { id: "audience", label: "Audiencia", description: "Describe destinatarios mediante categorías ficticias." },
          { id: "date-tone", label: "Fecha y tono", description: "Usa una fecha ficticia y un tono explícito." },
          { id: "exclusions", label: "Exclusiones", description: "Descarta nombres, conversaciones y antecedentes irrelevantes." },
          { id: "uncertainty", label: "Datos faltantes", description: "Indica cómo deben marcarse las dudas sin inventar." }
        ],
        modelAnswer: [
          "Incluiría que el mensaje es un recordatorio para una reunión ficticia de coordinación, que la audiencia es el equipo interno del proyecto, que la fecha será el 15 de agosto y que el tono debe ser cordial y breve. También señalaría el propósito: confirmar asistencia y recordar que se revisarán los próximos hitos.",
          "Excluiría nombres, correos, conversaciones previas, documentos completos y antecedentes personales porque no cambian el resultado. Si faltaran la hora o el enlace, pediría escribir [DATO PENDIENTE] en vez de inventarlos. Solicitaría como salida un asunto y un cuerpo de máximo tres párrafos que una persona deberá revisar antes del envío."
        ]
      },
      completion: openCompletion(100, 150),
      summary: [
        "La suficiencia exige entregar solo el contexto que cambia la salida. El exceso puede aumentar la exposición y dificultar el control.",
        "Dividir tareas y marcar datos faltantes permite localizar errores, evitar suposiciones y mantener visible qué debe revisar una persona."
      ],
      references: [refs.nistGen, refs.law19628, refs.law21719]
    },
    "m4-l1": {
      pedagogyVersion: "1.1",
      title: "VERIFICA: controlar antes de usar",
      duration: "20–25 min",
      objective: "Aplicar un protocolo de revisión proporcional al riesgo.",
      scenario: "Un informe parece correcto, pero cita una fuente inexistente y cambia el sentido de una recomendación.",
      studySections: [
        {
          title: "Verificar es parte del proceso",
          paragraphs: [
            "VERIFICA es un marco original de Núcleo Vivo para revisar salidas antes de usarlas: Veracidad, Evidencia, Riesgo, Intención, Formato, Impacto, Correcciones y Aprobación.",
            "La revisión no debe quedar para cuando aparezca un problema. Debe diseñarse desde el comienzo y aumentar cuando crece el impacto de la tarea."
          ]
        },
        {
          title: "V — Veracidad y E — Evidencia",
          paragraphs: [
            "Comprueba hechos, cifras, nombres, fechas y normas. Exige fuentes primarias cuando la decisión dependa de información vigente.",
            "No confundas una cita bien escrita con una fuente existente. La forma de una referencia no demuestra su autenticidad ni su vigencia."
          ]
        },
        {
          title: "R — Riesgo e I — Intención",
          paragraphs: [
            "Pregunta qué daño produciría un error y si el resultado cumple el propósito original sin agregar decisiones no solicitadas.",
            "La verificación debe atender tanto el contenido como la intención: un texto correcto puede ser inadecuado si responde otra pregunta o introduce compromisos."
          ]
        },
        {
          title: "F — Formato e I — Impacto",
          paragraphs: [
            "Revisa destinatario, tono, estructura y accesibilidad. El formato debe permitir que la salida sea comprendida y controlada.",
            "Considera efectos sobre personas, grupos y relaciones de poder. Una revisión proporcional observa quién recibe los beneficios y quién asume los riesgos."
          ]
        },
        {
          title: "C — Correcciones y A — Aprobación",
          paragraphs: [
            "Registra los cambios relevantes y define quién aprueba. Corregir sin dejar trazabilidad puede dificultar una revisión posterior.",
            "En tareas importantes, la aprobación debe ser explícita. La persona responsable necesita competencia y autoridad para rechazar o detener el uso."
          ]
        }
      ],
      workedExample: [
        "Para revisar una respuesta sobre una ley, se abre la fuente oficial, se comprueba vigencia y alcance, y se corrige cualquier interpretación que no esté respaldada.",
        "Para un correo, se revisan compromisos, fechas, destinatarios y tono. En ambos casos se registran correcciones y se identifica quién aprueba antes de usar la salida."
      ],
      keypoints: [
        "Verifica hechos y fuentes.",
        "Revisa riesgos, propósito e impacto.",
        "Corrige y registra cambios.",
        "Define aprobación humana."
      ],
      activity: {
        type: "reflection",
        prompt: "Aplica VERIFICA a un texto ficticio.",
        instructions: [
          "Imagina un texto ficticio breve que contenga una afirmación y una recomendación.",
          "Escribe entre 180 y 260 palabras y describe al menos una comprobación por cada componente de VERIFICA.",
          "Identifica una fuente adecuada, un riesgo proporcional y la persona responsable de aprobar.",
          "Guarda tu borrador, revisa los ocho criterios, compara con el modelo y mejora las acciones poco concretas."
        ],
        minimumWords: 180,
        maximumWords: 260,
        responseLabel: "Tu protocolo VERIFICA",
        responsePlaceholder: "V — Comprobaría…\nE — Consultaría…",
        rubricTitle: "Autoevaluación VERIFICA",
        criteriaRequirement: "Revisa los ocho componentes de VERIFICA.",
        allowRetry: true,
        requiredCriteria: [
          { id: "truth", label: "Veracidad", description: "Define cómo comprobar hechos, cifras, nombres o fechas." },
          { id: "evidence", label: "Evidencia", description: "Identifica una fuente primaria apropiada." },
          { id: "risk", label: "Riesgo", description: "Explica el daño posible y la profundidad del control." },
          { id: "intent", label: "Intención", description: "Comprueba que la salida responde al propósito sin agregar decisiones." },
          { id: "format", label: "Formato", description: "Revisa estructura, tono, destinatario y accesibilidad." },
          { id: "impact", label: "Impacto", description: "Considera efectos sobre personas o grupos." },
          { id: "corrections", label: "Correcciones", description: "Registra cambios relevantes y dudas pendientes." },
          { id: "approval", label: "Aprobación", description: "Nombra un rol competente con autoridad para aprobar o detener." }
        ],
        modelAnswer: [
          "V — Veracidad: contrastaría la fecha y la cifra del texto ficticio con el documento de origen. E — Evidencia: abriría la fuente primaria y registraría su título, fecha, enlace y la afirmación que sustenta; una referencia bien escrita no sería prueba suficiente.",
          "R — Riesgo: evaluaría si el error podría afectar una decisión, una persona o un compromiso externo; si el impacto fuera alto, pediría revisión especializada. I — Intención: comprobaría que el texto responde a la pregunta original y no añade recomendaciones ni promesas no solicitadas.",
          "F — Formato: revisaría destinatario, claridad, tono, estructura y accesibilidad. I — Impacto: preguntaría quién podría quedar perjudicado o excluido por la recomendación.",
          "C — Correcciones: anotaría cada cambio importante y mantendría visibles las dudas no resueltas. A — Aprobación: una jefatura competente revisaría la versión corregida, tendría acceso a las fuentes y podría rechazarla. El texto no se usaría hasta contar con esa aprobación explícita.",
          "El nivel de control aumentaría si la recomendación pudiera afectar derechos, empleo, reputación o acceso a oportunidades. Si una fuente no pudiera comprobarse o el propósito hubiera cambiado, detendría el uso y solicitaría una revisión especializada antes de continuar."
        ]
      },
      completion: openCompletion(180, 260),
      summary: [
        "VERIFICA integra ocho controles: Veracidad, Evidencia, Riesgo, Intención, Formato, Impacto, Correcciones y Aprobación.",
        "La revisión se diseña desde el inicio, exige acciones concretas y aumenta con el impacto. Una salida importante no se usa sin fuente adecuada, correcciones trazables y aprobación humana."
      ],
      references: [refs.nistGen, refs.nistRmf, refs.unesco]
    },
    "m4-l2": {
      pedagogyVersion: "1.1",
      title: "Fuentes, actualidad y trazabilidad",
      duration: "14–16 min",
      objective: "Elegir fuentes adecuadas y distinguir vigencia, autoridad y relevancia.",
      scenario: "Una respuesta cita un blog antiguo para explicar una obligación legal actual.",
      image: {
        src: "../../../../assets/images/aula/ia-con-criterio-humano/modulo-04-fuentes-trazabilidad.png",
        webp: "../../../../assets/images/aula/ia-con-criterio-humano/modulo-04-fuentes-trazabilidad.webp",
        alt: "Profesional estudia documentos académicos y contrasta fuentes junto a un computador antes de integrar evidencia en un escrito.",
        caption: "La trazabilidad conecta cada afirmación importante con una fuente apropiada, vigente y comprobable.",
        width: 1672,
        height: 941,
        loading: "lazy"
      },
      studySections: [
        {
          title: "No todas las fuentes sirven para lo mismo",
          paragraphs: [
            "Una fuente primaria presenta directamente la norma, el dato o la investigación. Una fuente secundaria interpreta. Para verificar leyes, políticas oficiales, especificaciones técnicas o cifras, conviene comenzar por la fuente primaria.",
            "La autoridad depende de la pregunta. Un artículo científico puede ser útil para estudiar evidencia, pero no reemplaza el texto vigente de una ley."
          ]
        },
        {
          title: "Vigencia y fecha",
          paragraphs: [
            "Una información correcta en el pasado puede estar desactualizada. Verifica la fecha de publicación, las modificaciones y la entrada en vigencia.",
            "La Ley N.º 21.719 fue publicada en 2024 y entra en vigencia el 1 de diciembre de 2026. Antes de esa fecha, se debe distinguir la ley vigente de las obligaciones futuras."
          ]
        },
        {
          title: "Trazabilidad",
          paragraphs: [
            "Registra qué fuente se consultó, cuándo, qué afirmación sustenta y qué dudas permanecen. La trazabilidad permite revisar decisiones después.",
            "Un contenido sin autor, fecha o respaldo no ofrece base suficiente para una afirmación importante, aunque aparezca bien posicionado o use un lenguaje convincente."
          ]
        }
      ],
      workedExample: [
        "Para explicar protección de datos en Chile en julio de 2026, se cita la Ley N.º 19.628 vigente y se señala que la Ley N.º 21.719 tiene vigencia diferida al 1 de diciembre de 2026.",
        "No sería correcto afirmar que todas las nuevas obligaciones ya están plenamente vigentes. La fecha de consulta y la fuente oficial permiten dejar trazabilidad."
      ],
      keypoints: [
        "Usa fuentes apropiadas para la pregunta.",
        "Comprueba fecha, vigencia y alcance.",
        "Distingue fuente primaria de interpretación.",
        "Registra qué fuente sustenta cada afirmación."
      ],
      activity: {
        type: "reflection",
        prompt: "Clasifica cuatro fuentes ficticias y decide cuál usarías para verificar una norma.",
        instructions: [
          "Analiza estas fuentes: 1) texto legal en el sitio oficial; 2) artículo académico que interpreta la norma; 3) blog con autor y fecha; 4) publicación sin autor, fecha ni enlaces.",
          "Escribe entre 140 y 210 palabras. Clasifica cada fuente como primaria, secundaria o insuficiente.",
          "Explica cuál usarías para comprobar vigencia, cómo usarías una interpretación secundaria y qué descartarías.",
          "Guarda, revisa los criterios, compara con el modelo y mejora tu clasificación."
        ],
        minimumWords: 140,
        maximumWords: 210,
        responseLabel: "Tu clasificación y decisión de fuente",
        responsePlaceholder: "1) Fuente primaria porque…",
        rubricTitle: "Autoevaluación de fuentes",
        criteriaRequirement: "Revisa los cinco criterios de selección de fuentes.",
        allowRetry: true,
        requiredCriteria: [
          { id: "primary", label: "Fuente primaria", description: "Reconoce el texto oficial como base para la vigencia." },
          { id: "secondary", label: "Fuente secundaria", description: "Distingue interpretación académica o informativa." },
          { id: "insufficient", label: "Fuente insuficiente", description: "Descarta contenidos sin autor, fecha o respaldo." },
          { id: "currency", label: "Vigencia y alcance", description: "Comprueba publicación, modificaciones y entrada en vigencia." },
          { id: "traceability", label: "Trazabilidad", description: "Registra fuente, consulta, afirmación y dudas." }
        ],
        modelAnswer: [
          "La fuente 1 es primaria porque contiene directamente el texto legal en un sitio oficial. La usaría para comprobar publicación, modificaciones, entrada en vigencia y alcance. Registraría el enlace, la fecha de consulta y la afirmación que respalda.",
          "La fuente 2 es secundaria: puede ayudar a comprender conceptos y efectos, pero no reemplaza la lectura de la norma vigente. La fuente 3 también es secundaria; su autor y fecha permiten evaluarla, aunque debería contrastarse con el texto oficial antes de sostener una obligación.",
          "La fuente 4 es insuficiente porque no identifica autor, fecha ni respaldo y no permite revisar su procedencia. Para explicar la situación en julio de 2026 distinguiría la Ley N.º 19.628 vigente de la Ley N.º 21.719, cuya entrada en vigencia está prevista para el 1 de diciembre de 2026. También dejaría anotadas las dudas que todavía requieran confirmación."
        ]
      },
      completion: openCompletion(140, 210),
      summary: [
        "La autoridad de una fuente depende de la pregunta. Para verificar una norma o un dato vigente se comienza por la fuente primaria y se usan fuentes secundarias para interpretar.",
        "La trazabilidad registra fuente, fecha de consulta, afirmación respaldada y dudas. También obliga a distinguir publicación de entrada en vigencia."
      ],
      references: [refs.law19628, refs.law21719, refs.nistGen]
    }
  };

  course.lessons = course.lessons.map(lesson => (
    lessons[lesson.id]
      ? { ...lesson, ...lessons[lesson.id] }
      : lesson
  ));
})();
