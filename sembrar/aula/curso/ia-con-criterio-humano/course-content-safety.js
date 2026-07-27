(() => {
  "use strict";

  const course = window.IA_COURSE;
  if (!course?.lessons) return;

  const reference = (apa, url) => ({ apa, url });
  const refs = {
    law19628: reference(
      "Ley N.º 19.628 sobre protección de la vida privada. (1999). Diario Oficial de la República de Chile. Biblioteca del Congreso Nacional de Chile. https://www.bcn.cl/leychile/navegar?idNorma=141599",
      "https://www.bcn.cl/leychile/navegar?idNorma=141599"
    ),
    law21719: reference(
      "Ley N.º 21.719, regula la protección y el tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales. (2024). Diario Oficial de la República de Chile. Biblioteca del Congreso Nacional de Chile. https://www.bcn.cl/leychile/navegar?idNorma=1209272",
      "https://www.bcn.cl/leychile/navegar?idNorma=1209272"
    ),
    law17336: reference(
      "Ley N.º 17.336 sobre propiedad intelectual. (1970). Diario Oficial de la República de Chile. Biblioteca del Congreso Nacional de Chile. https://www.bcn.cl/leychile/navegar?idNorma=28933",
      "https://www.bcn.cl/leychile/navegar?idNorma=28933"
    ),
    nistGen: reference(
      "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1",
      "https://doi.org/10.6028/NIST.AI.600-1"
    ),
    unesco: reference(
      "United Nations Educational, Scientific and Cultural Organization. (2021). Recommendation on the ethics of artificial intelligence. UNESCO. https://unesdoc.unesco.org/ark:/48223/pf0000381137",
      "https://unesdoc.unesco.org/ark:/48223/pf0000381137"
    ),
    oecd: reference(
      "Organisation for Economic Co-operation and Development. (2024). OECD AI principles. https://oecd.ai/en/ai-principles",
      "https://oecd.ai/en/ai-principles"
    ),
    martin: reference(
      "Martin, F., Wu, T., Wan, L., & Xie, K. (2022). A meta-analysis on the Community of Inquiry presences and learning outcomes in online and blended learning environments. Online Learning, 26(1), 325–359. https://doi.org/10.24059/olj.v26i1.2604",
      "https://doi.org/10.24059/olj.v26i1.2604"
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
    "m5-l1": {
      pedagogyVersion: "1.1",
      title: "Datos personales, privacidad y minimización",
      duration: "18–20 min",
      objective: "Definir qué datos pueden usarse y cuáles deben excluirse.",
      scenario: "Una persona pega en un chatbot un reclamo con nombre, teléfono, diagnóstico y antecedentes familiares.",
      image: {
        src: "../../../../assets/images/aula/ia-con-criterio-humano/modulo-05-privacidad-datos.png",
        webp: "../../../../assets/images/aula/ia-con-criterio-humano/modulo-05-privacidad-datos.webp",
        alt: "Dos profesionales revisan en conjunto una tabla con identificadores enmascarados y reglas de datos permitidos y excluidos.",
        caption: "Minimizar implica decidir qué información necesita realmente la tarea antes de abrir una herramienta.",
        width: 1672,
        height: 941,
        loading: "lazy"
      },
      studySections: [
        {
          title: "Datos personales y sensibles",
          paragraphs: [
            "Un dato personal permite identificar directa o indirectamente a una persona. Los datos sensibles pueden referirse, entre otros aspectos, a salud, características físicas o morales, vida sexual, ideología o creencias, según el marco jurídico aplicable.",
            "Que una herramienta permita pegar información no significa que exista autorización para hacerlo. La capacidad técnica no reemplaza la finalidad legítima, las reglas institucionales ni los controles."
          ]
        },
        {
          title: "Minimización y finalidad",
          paragraphs: [
            "Usa solo los datos necesarios para un propósito legítimo y definido. Pregunta si la tarea puede realizarse con categorías generales, datos ficticios o anonimización.",
            "Eliminar un nombre no siempre anonimiza. Una combinación de cargo, comuna, edad y situación puede permitir identificar a una persona de manera indirecta."
          ]
        },
        {
          title: "Configuración y proveedores",
          paragraphs: [
            "Revisa las condiciones de almacenamiento, entrenamiento, retención, acceso y transferencias. No confíes únicamente en una promesa comercial.",
            "La organización debe mantener un inventario de herramientas y reglas de uso. Cuando el análisis real sea necesario, corresponde emplear un entorno autorizado y procedimientos definidos."
          ]
        }
      ],
      workedExample: [
        "En vez de pegar un reclamo real, crea un caso ficticio: “Persona usuaria reporta demora en una respuesta y solicita revisión”. Conserva solo los elementos necesarios para practicar el tono.",
        "Quitar el nombre pero mantener teléfono, diagnóstico y antecedentes familiares no es anonimizar. Esos elementos deben excluirse del ejercicio y tratarse solo en un entorno autorizado cuando exista una finalidad legítima."
      ],
      keypoints: [
        "Usa solo datos necesarios.",
        "Anonimizar exige reducir la posibilidad de identificación.",
        "Revisa las condiciones del proveedor.",
        "El aprendizaje no justifica exponer información."
      ],
      activity: {
        type: "reflection",
        prompt: "Redacta una regla institucional sobre datos permitidos y prohibidos en herramientas de IA.",
        instructions: [
          "Escribe entre 120 y 180 palabras con un lenguaje claro para personas usuarias.",
          "Distingue datos públicos, internos, personales, sensibles y confidenciales.",
          "Prohíbe credenciales, establece una vía de consulta y explica cuándo usar datos ficticios o un entorno autorizado.",
          "Guarda el borrador, revisa los criterios, compara con el modelo y mejora la regla."
        ],
        minimumWords: 120,
        maximumWords: 180,
        responseLabel: "Tu regla institucional de datos",
        responsePlaceholder: "Para ejercicios y borradores se usarán…",
        rubricTitle: "Autoevaluación de privacidad y minimización",
        criteriaRequirement: "Revisa los seis criterios de la regla de datos.",
        allowRetry: true,
        requiredCriteria: [
          { id: "classification", label: "Clasificación", description: "Distingue datos públicos, internos, personales, sensibles y confidenciales." },
          { id: "minimum", label: "Minimización", description: "Permite solo la información necesaria para la finalidad." },
          { id: "prohibitions", label: "Prohibiciones", description: "Excluye credenciales, identificadores y datos sensibles o confidenciales." },
          { id: "synthetic", label: "Datos ficticios", description: "Prioriza casos sintéticos, categorías generales o anonimización efectiva." },
          { id: "approved", label: "Entorno autorizado", description: "Exige herramienta y procedimiento aprobados para análisis reales." },
          { id: "consultation", label: "Vía de consulta", description: "Indica qué hacer ante dudas o una necesidad excepcional." }
        ],
        modelAnswer: [
          "Para ejercicios, pruebas y borradores se usarán datos públicos, ficticios o efectivamente anonimizados, limitados a la finalidad de la tarea. La información interna solo podrá utilizarse cuando la herramienta y el uso estén autorizados.",
          "No se ingresarán nombres, RUT, teléfonos, correos, diagnósticos, evaluaciones individuales, antecedentes familiares, credenciales, claves, secretos comerciales ni documentos confidenciales. Cambiar únicamente el nombre no basta si otros detalles permiten identificar a la persona.",
          "Antes de usar una herramienta se revisarán sus condiciones de almacenamiento, entrenamiento, retención, acceso y transferencias. Si un análisis real exige datos personales o sensibles, se detendrá el flujo y se consultará al rol institucional definido para utilizar un entorno y procedimiento aprobados. Ante cualquier duda, no se copiarán los datos hasta recibir una respuesta autorizada."
        ]
      },
      completion: openCompletion(120, 180),
      summary: [
        "La minimización exige usar solo los datos necesarios para una finalidad definida. La disponibilidad de una herramienta no constituye autorización para ingresar información.",
        "Los ejercicios se realizan con datos ficticios, públicos o efectivamente anonimizados. El uso real requiere herramienta aprobada, reglas institucionales y revisión de las condiciones del proveedor."
      ],
      references: [refs.law19628, refs.law21719, refs.nistGen, refs.unesco]
    },
    "m5-l2": {
      pedagogyVersion: "1.1",
      title: "Autoría, licencias y uso responsable de contenidos",
      duration: "14–16 min",
      objective: "Reconocer límites de copia, atribución y reutilización.",
      scenario: "Un equipo pide a la IA imitar exactamente el estilo de una autora contemporánea y publica el resultado sin revisión.",
      studySections: [
        {
          title: "La generación no elimina derechos",
          paragraphs: [
            "El uso de IA no convierte automáticamente cualquier contenido en libre de restricciones. Deben considerarse derechos de autor, licencias, contratos, atribución y políticas institucionales.",
            "En Chile, la Ley N.º 17.336 regula la propiedad intelectual. El análisis de un uso concreto puede requerir asesoría jurídica, especialmente en contextos comerciales."
          ]
        },
        {
          title: "Inspiración, transformación y copia",
          paragraphs: [
            "Una solicitud puede pedir características generales —tono claro, estructura argumentativa o lenguaje accesible— sin imitar de manera exacta una obra o una persona.",
            "También se debe revisar si la salida reproduce fragmentos, marcas u otros elementos protegidos. La atribución no reemplaza el examen de la licencia o autorización aplicable."
          ]
        },
        {
          title: "Transparencia y responsabilidad editorial",
          paragraphs: [
            "Cuando el contenido se publica, una persona debe revisar exactitud, originalidad, atribución y adecuación. La IA no figura como responsable editorial.",
            "Si se utiliza una fuente, se atribuye conforme a su licencia y a las normas académicas. Las condiciones deben revisarse antes de reutilizar una expresión protegida."
          ]
        }
      ],
      workedExample: [
        "Solicitud riesgosa: “Escribe exactamente como [autora viva]”. Pide una imitación individualizada y no define responsabilidad editorial.",
        "Solicitud más responsable: “Redacta con tono reflexivo, frases claras, ejemplos cotidianos y sin imitar a una persona específica”. Después se revisan originalidad, atribución, licencia y adecuación antes de publicar."
      ],
      keypoints: [
        "La IA no elimina derechos de autor.",
        "Evita la imitación exacta de personas vivas.",
        "Revisa reproducción, licencia y atribución.",
        "Define una responsabilidad editorial humana."
      ],
      activity: {
        type: "decision",
        prompt: "¿Qué acción corresponde antes de publicar un contenido generado con apoyo de IA?",
        instructions: [
          "Selecciona la acción que conserva responsabilidad editorial.",
          "Lee la explicación y contrasta la decisión con el criterio esperado.",
          "Si eliges una opción insuficiente, revisa el material y reintenta sin penalización."
        ],
        expectedCriterion: "Una persona responsable debe revisar originalidad, licencia, atribución, exactitud y adecuación antes de publicar; que la IA haya generado el texto no elimina derechos ni responsabilidad editorial.",
        reviewSection: "La generación no elimina derechos y Transparencia y responsabilidad editorial",
        allowRetry: true,
        options: [
          {
            text: "Publicar sin revisar porque el contenido lo creó la IA.",
            feedback: "La generación automática no vuelve libre una expresión ni transfiere la responsabilidad editorial. La salida puede reproducir elementos protegidos o contener errores."
          },
          {
            text: "Revisar originalidad, licencia, atribución, exactitud y adecuación.",
            correct: true,
            feedback: "La revisión humana considera tanto la calidad como los derechos aplicables y deja definida la responsabilidad por el contenido publicado."
          },
          {
            text: "Quitar el nombre de la fuente o de la persona autora original.",
            feedback: "Eliminar la atribución agrava el problema y no resuelve si existe permiso para copiar, transformar o reutilizar el contenido."
          }
        ]
      },
      completion: { ...closedCompletion },
      summary: [
        "El uso de IA no elimina derechos de autor, licencias, contratos ni políticas. Atribuir una fuente y contar con autorización son preguntas relacionadas, pero distintas.",
        "Una solicitud responsable evita imitar exactamente a una persona viva, revisa posibles reproducciones y asigna a una persona la responsabilidad editorial."
      ],
      references: [refs.law17336, refs.unesco]
    },
    "m6-l1": {
      pedagogyVersion: "1.1",
      duration: "18–20 min",
      objective: "Responder ante urgencia, suplantación y cambios de pago.",
      scenario: "Llega un audio que parece ser de gerencia. Pide cambiar la cuenta bancaria de un proveedor y mantenerlo confidencial.",
      studySections: [
        {
          title: "La presión es parte del engaño",
          paragraphs: [
            "Los mensajes fraudulentos suelen combinar urgencia, secreto, autoridad y una acción difícil de revertir. La capacidad de generar voz, imagen o texto convincente aumenta la necesidad de procedimientos independientes de la apariencia.",
            "DETENER es un marco original de Núcleo Vivo: Detener la acción, Examinar señales, Triangular por otro canal, Escalar, No compartir ni transferir, Evidenciar sin difundir y Reportar."
          ]
        },
        {
          title: "Detener, examinar, triangular y escalar",
          paragraphs: [
            "No respondas impulsivamente ni ejecutes la acción. Busca inconsistencias, cambios de canal, presión, secreto, errores y solicitudes inusuales.",
            "Verifica mediante un canal independiente conocido. No uses teléfonos ni enlaces entregados en el mensaje sospechoso. Escala al rol definido, como jefatura, finanzas, seguridad o soporte."
          ]
        },
        {
          title: "No compartir, evidenciar y reportar",
          paragraphs: [
            "No compartas datos, credenciales ni transfieras recursos mientras la solicitud no esté verificada. La acción segura corta la presión de urgencia.",
            "Conserva evidencia sin reenviarla masivamente. Reportar temprano permite contener daño, investigar y aprender."
          ]
        }
      ],
      workedExample: [
        "Ante un cambio de cuenta bancaria, la persona detiene la transferencia, llama al contacto registrado previamente, informa a finanzas y conserva el mensaje para la investigación.",
        "Responder al mismo audio “¿eres tú?” no es suficiente porque el canal puede estar comprometido. La apariencia de la voz tampoco sustituye la triangulación."
      ],
      keypoints: [
        "Urgencia y secreto son señales de alerta.",
        "Verifica por un canal independiente.",
        "No uses contactos entregados en el mensaje sospechoso.",
        "Preserva evidencia sin difundir."
      ],
      activity: {
        type: "decision",
        prompt: "¿Cuál es el primer paso ante el audio que solicita cambiar la cuenta bancaria?",
        instructions: [
          "Selecciona la primera acción que corta la presión y evita un daño difícil de revertir.",
          "Revisa la explicación y el criterio esperado.",
          "Si permaneciste en el mismo canal o ejecutaste la operación, relee DETENER y reintenta sin penalización."
        ],
        expectedCriterion: "Detener la operación y verificar por un canal independiente conocido antes de responder, compartir información o transferir; luego escalar, preservar evidencia sin difundir y reportar.",
        reviewSection: "Detener, examinar, triangular y escalar",
        allowRetry: true,
        options: [
          {
            text: "Transferir y verificar después.",
            feedback: "La transferencia puede producir un daño irreversible. La urgencia forma parte de la presión y no justifica omitir un control previo."
          },
          {
            text: "Responder al mismo audio preguntando si es real.",
            feedback: "El canal puede estar comprometido. Verificar dentro del mismo canal no entrega una confirmación independiente de la identidad ni de la solicitud."
          },
          {
            text: "Detener la operación y verificar por un canal independiente conocido.",
            correct: true,
            feedback: "Esta acción corta la urgencia, evita una transferencia no verificada y permite escalar mediante contactos y procedimientos ya conocidos."
          }
        ]
      },
      completion: { ...closedCompletion },
      summary: [
        "Urgencia, secreto, autoridad y una acción irreversible son señales que exigen detenerse. La apariencia convincente de una voz o un mensaje no verifica su origen.",
        "DETENER combina pausa, examen, triangulación, escalamiento, protección de información, evidencia y reporte temprano."
      ],
      references: [refs.nistGen, refs.oecd]
    },
    "m6-l2": {
      pedagogyVersion: "1.1",
      duration: "12–15 min",
      objective: "Transformar un error en mejora del sistema.",
      scenario: "Una persona abrió un archivo sospechoso y teme reportarlo porque podría ser sancionada.",
      studySections: [
        {
          title: "El silencio aumenta el daño",
          paragraphs: [
            "Una cultura punitiva puede retrasar los reportes. Cuando una persona teme ser humillada o castigada, el incidente permanece activo por más tiempo.",
            "El objetivo inicial debe ser contener, apoyar y aprender, sin impedir una investigación responsable."
          ]
        },
        {
          title: "Mirar el sistema",
          paragraphs: [
            "Analiza por qué el engaño fue plausible: presión de trabajo, falta de protocolo, canales confusos, capacitación insuficiente o controles débiles.",
            "Centrarse solo en la conducta individual impide corregir las causas organizacionales que hicieron posible el incidente."
          ]
        },
        {
          title: "Cerrar el ciclo",
          paragraphs: [
            "Los aprendizajes deben volver a procedimientos, formación, diseño de sistemas y comunicación. Un reporte que no produce cambios pierde legitimidad.",
            "Apoyar no significa omitir responsabilidades. Significa contener primero y realizar una revisión que considere conducta, contexto y controles."
          ]
        }
      ],
      workedExample: [
        "Mensaje institucional: “Si abrió un archivo o entregó información por error, repórtelo de inmediato. La prioridad es contener el incidente”.",
        "La comunicación añade un canal claro, ofrece apoyo y explica que la revisión considerará también las condiciones del sistema. Así reduce el temor sin prometer impunidad."
      ],
      keypoints: [
        "Reportar temprano reduce impacto.",
        "La investigación revisa contexto y controles.",
        "El aprendizaje debe producir cambios.",
        "Apoyar no significa omitir responsabilidades."
      ],
      activity: {
        type: "reflection",
        prompt: "Redacta un mensaje institucional que invite a reportar un incidente sin culpabilizar.",
        instructions: [
          "Escribe entre 100 y 150 palabras.",
          "Incluye un canal claro, prioridad de contención, trato respetuoso y confidencialidad razonable.",
          "Explica que habrá una revisión responsable y un compromiso de aprendizaje, sin prometer ausencia de consecuencias.",
          "Guarda el borrador, revisa los criterios, compara con el modelo y mejora el mensaje."
        ],
        minimumWords: 100,
        maximumWords: 150,
        responseLabel: "Tu mensaje institucional",
        responsePlaceholder: "Si abriste un archivo o entregaste información por error…",
        rubricTitle: "Autoevaluación del mensaje de reporte",
        criteriaRequirement: "Revisa los cinco criterios del mensaje institucional.",
        allowRetry: true,
        requiredCriteria: [
          { id: "channel", label: "Canal claro", description: "Indica dónde o a quién reportar de inmediato." },
          { id: "containment", label: "Contención prioritaria", description: "Explica que la primera meta es reducir el daño." },
          { id: "respect", label: "Trato respetuoso", description: "Evita humillación y culpabilización anticipada." },
          { id: "confidentiality", label: "Confidencialidad razonable", description: "Limita la difusión sin ofrecer secreto absoluto." },
          { id: "learning", label: "Aprendizaje y revisión", description: "Considera conducta, contexto, controles y cambios posteriores." }
        ],
        modelAnswer: [
          "Si abriste un archivo sospechoso, compartiste información o ejecutaste una acción por error, repórtalo de inmediato al canal interno de seguridad o a tu jefatura. La prioridad será contener el incidente, proteger a las personas afectadas y entregarte apoyo para los siguientes pasos.",
          "El reporte se tratará con respeto y se compartirá solo con los roles necesarios para responder. Se realizará una revisión responsable de lo ocurrido, incluidas las decisiones, la presión de trabajo, los canales, la capacitación y los controles disponibles. Reportar temprano no impide investigar responsabilidades, pero permite reducir el daño. Los aprendizajes se convertirán en mejoras de procedimientos, formación y diseño para evitar que el mismo problema vuelva a ocurrir."
        ]
      },
      completion: openCompletion(100, 150),
      summary: [
        "El temor al castigo puede prolongar un incidente. La respuesta inicial prioriza contención, apoyo y un reporte temprano mediante un canal claro.",
        "Una revisión responsable examina la conducta y también el sistema. El ciclo se cierra cuando el aprendizaje produce cambios en procedimientos, formación, controles y comunicación."
      ],
      references: [refs.nistGen, refs.martin]
    }
  };

  course.lessons = course.lessons.map(lesson => (
    lessons[lesson.id]
      ? { ...lesson, ...lessons[lesson.id] }
      : lesson
  ));
})();
