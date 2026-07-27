window.IA_COURSE = {
  "slug": "ia-con-criterio-humano",
  "title": "IA con criterio humano",
  "subtitle": "Productividad, seguridad y decisiones responsables en el trabajo",
  "version": "1.1 · Julio 2026",
  "estimatedHours": 7,
  "pedagogicalModel": {
    "id": "aula-viva-pedagogy-v1",
    "description": "Estructura reusable para estudiar, practicar, revisar, mejorar y completar una experiencia con evidencia.",
    "supportedBlocks": [
      "moduleContext",
      "objective",
      "scenario",
      "image",
      "studySections",
      "workedExample",
      "comparison",
      "keypoints",
      "activity",
      "feedback",
      "retry",
      "summary",
      "references"
    ],
    "progressSchema": [
      "selectedIndex",
      "correct",
      "attempts",
      "feedbackReviewed",
      "response",
      "wordCount",
      "criteriaReviewed",
      "modelAnswerViewed",
      "confidence",
      "status"
    ]
  },
  "modules": [
    {
      "id": "m0",
      "number": "00",
      "title": "Orientación y diagnóstico",
      "subtitle": "Aprender sin vigilancia ni datos reales",
      "lessons": [
        {
          "id": "m0-l1",
          "title": "Una decisión antes de comenzar",
          "duration": "4 min",
          "objective": "Reconocer que adoptar IA requiere reglas mínimas antes de comenzar.",
          "scenario": "La directora de Proyecto Aurora pide al equipo “usar IA desde mañana”. No existe herramienta aprobada, criterio de revisión ni regla de datos.",
          "content": [
            "La velocidad de adopción no reemplaza la gobernanza. Antes de un piloto deben acordarse herramientas, datos permitidos, revisión y responsabilidad.",
            "El curso no propone obedecer o prohibir automáticamente, sino crear condiciones para innovar sin normalizar riesgos evitables."
          ],
          "keypoints": [
            "La responsabilidad no se transfiere a la herramienta.",
            "La ausencia de reglas no convierte cualquier uso en aceptable.",
            "Un piloto responsable puede comenzar pequeño y con controles claros."
          ],
          "activity": {
            "type": "decision",
            "prompt": "¿Cuál sería la primera respuesta más responsable?",
            "options": [
              {
                "text": "Comenzar de inmediato para no quedar atrás.",
                "feedback": "La urgencia no reemplaza reglas de datos y control."
              },
              {
                "text": "Prohibir todo uso indefinidamente.",
                "feedback": "La prohibición total puede desplazar el uso a canales informales."
              },
              {
                "text": "Acordar herramienta, datos permitidos, revisión y responsable antes del piloto.",
                "correct": true,
                "feedback": "Crea condiciones mínimas para experimentar con responsabilidad."
              },
              {
                "text": "Delegar toda la decisión al área tecnológica.",
                "feedback": "El uso también involucra personas, procesos, cultura y legalidad."
              }
            ]
          },
          "references": [
            "zhang",
            "nist",
            "oecd"
          ]
        },
        {
          "id": "m0-l2",
          "title": "Cómo aprenderemos",
          "duration": "6 min",
          "objective": "Comprender el Ciclo de Aprendizaje Vivo y definir una meta propia.",
          "scenario": "No avanzarás por mirar videos. Avanzarás al decidir, practicar, explicar, revisar y transferir.",
          "content": [
            "Cada experiencia comienza con una situación auténtica, entrega una explicación breve, permite practicar y ofrece retroalimentación con reintentos.",
            "La recuperación activa y la práctica distribuida ayudan a consolidar el aprendizaje. Las actividades nunca requieren datos reales de una empresa."
          ],
          "keypoints": [
            "El error es información para aprender.",
            "La práctica se distribuye en el tiempo.",
            "La transferencia necesita una meta concreta y apoyo del entorno."
          ],
          "activity": {
            "type": "reflection",
            "prompt": "Describe una tarea que deseas mejorar sin revelar datos internos. Puedes usar un ejemplo ficticio."
          },
          "references": [
            "trumble",
            "mawson",
            "hemmler",
            "monib"
          ]
        }
      ]
    },
    {
      "id": "m1",
      "number": "01",
      "title": "IA, capacidad y límite",
      "subtitle": "Comprender antes de delegar",
      "lessons": [
        {
          "id": "m1-l1",
          "title": "Qué hace realmente una IA generativa",
          "duration": "14 min",
          "objective": "Distinguir generación probabilística, búsqueda, análisis y automatización.",
          "scenario": "Un informe generado por IA suena preciso, pero incluye una normativa inexistente.",
          "content": [
            "Una IA generativa produce respuestas plausibles a partir de patrones y contexto. La fluidez no demuestra veracidad.",
            "Buscar fuentes, generar borradores, analizar datos y ejecutar acciones son funciones distintas. Confundirlas produce controles insuficientes."
          ],
          "keypoints": [
            "Plausible no significa verdadero.",
            "La herramienta puede escalar aciertos y errores.",
            "El valor depende del tipo de tarea y del control de calidad."
          ],
          "activity": {
            "type": "decision",
            "prompt": "¿Qué afirmación es correcta?",
            "options": [
              {
                "text": "Una respuesta detallada es una respuesta verificada.",
                "feedback": "El detalle puede aumentar solo la apariencia de autoridad."
              },
              {
                "text": "La IA generativa puede producir contenido convincente y equivocado.",
                "correct": true,
                "feedback": "Por eso la verificación debe integrarse al flujo."
              },
              {
                "text": "Toda tarea mejora al usar IA.",
                "feedback": "Hay tareas donde revisar cuesta más o el riesgo es inaceptable."
              }
            ]
          },
          "references": [
            "noy",
            "brynjolfsson",
            "nist"
          ]
        },
        {
          "id": "m1-l2",
          "title": "La responsabilidad sigue siendo humana",
          "duration": "12 min",
          "objective": "Identificar decisiones que requieren supervisión y rendición de cuentas.",
          "scenario": "Una jefatura quiere descartar postulantes con una recomendación automática sin revisar los criterios.",
          "content": [
            "El uso responsable exige definir quién decide, quién revisa, quién puede cuestionar y cómo se corrige un daño.",
            "Una recomendación automática no elimina la obligación de explicar y responder por la decisión."
          ],
          "keypoints": [
            "La automatización no elimina la rendición de cuentas.",
            "Mayor impacto exige mayor supervisión.",
            "La revisión humana debe ser competente y tener autoridad real."
          ],
          "activity": {
            "type": "decision",
            "prompt": "¿Qué condición falta?",
            "options": [
              {
                "text": "Que el sistema sea rápido.",
                "feedback": "La velocidad no resuelve el impacto sobre personas."
              },
              {
                "text": "Criterios transparentes, revisión humana competente y vía de corrección.",
                "correct": true,
                "feedback": "Sostiene una decisión revisable y responsable."
              },
              {
                "text": "Que la jefatura confíe en el proveedor.",
                "feedback": "La confianza contractual no sustituye evaluar el uso concreto."
              }
            ]
          },
          "references": [
            "unesco",
            "oecd",
            "nist"
          ]
        }
      ]
    },
    {
      "id": "m2",
      "number": "02",
      "title": "Marco VALOR",
      "subtitle": "Elegir una tarea que sí conviene aumentar",
      "lessons": [
        {
          "id": "m2-l1",
          "title": "VALOR: antes de usar la herramienta",
          "duration": "18 min",
          "objective": "Evaluar si una tarea es adecuada para un piloto de IA.",
          "scenario": "Proyecto Aurora quiere automatizar correos, evaluación de desempeño y reclamos al mismo tiempo.",
          "content": [
            "VALOR es un marco original de Núcleo Vivo: Valor esperado, Afectación a personas, Límites de datos, Observabilidad del resultado y Responsable final.",
            "Una buena tarea piloto tiene resultado revisable, riesgo acotado, datos controlables y una persona responsable."
          ],
          "keypoints": [
            "V: valor concreto esperado.",
            "A: personas afectadas.",
            "L: datos necesarios y excluidos.",
            "O: resultado observable y medible.",
            "R: responsable que revisa y responde."
          ],
          "activity": {
            "type": "reflection",
            "prompt": "Aplica VALOR a una tarea ficticia. Escribe una frase por cada letra."
          },
          "references": [
            "noy",
            "brynjolfsson",
            "shukla",
            "oneill"
          ]
        },
        {
          "id": "m2-l2",
          "title": "Cuándo no conviene usar IA",
          "duration": "12 min",
          "objective": "Reconocer señales para detener o rediseñar.",
          "scenario": "El equipo tarda más revisando errores del resumen automático que preparando el resumen manual.",
          "content": [
            "Usar IA no es un fin. Si revisar cuesta más que producir, el error es difícil de detectar o el impacto es desproporcionado, el flujo debe rediseñarse.",
            "Un piloto responsable también puede concluir que la herramienta no agrega valor."
          ],
          "keypoints": [
            "El costo de verificación forma parte del costo total.",
            "No toda automatización reduce trabajo.",
            "Decidir no usar una herramienta puede ser una conclusión válida."
          ],
          "activity": {
            "type": "decision",
            "prompt": "¿Qué decisión corresponde?",
            "options": [
              {
                "text": "Mantener el flujo para justificar la inversión.",
                "feedback": "El costo hundido no demuestra valor."
              },
              {
                "text": "Medir producción y revisión, y rediseñar o detener si no hay beneficio neto.",
                "correct": true,
                "feedback": "La decisión se sostiene en evidencia."
              },
              {
                "text": "Eliminar la revisión para recuperar tiempo.",
                "feedback": "Esto oculta costos y aumenta riesgo."
              }
            ]
          },
          "references": [
            "noy",
            "brynjolfsson"
          ]
        }
      ]
    },
    {
      "id": "m3",
      "number": "03",
      "title": "Marco CLARO",
      "subtitle": "Dar contexto sin entregar información indebida",
      "lessons": [
        {
          "id": "m3-l1",
          "title": "CLARO: instrucciones revisables",
          "duration": "20 min",
          "objective": "Construir instrucciones con objetivo, límites y criterios de calidad.",
          "scenario": "“Hazme un correo profesional” produce un texto genérico y agrega compromisos no autorizados.",
          "content": [
            "CLARO es un marco original de Núcleo Vivo: Contexto permitido, Labor o tarea, Audiencia, Reglas y límites, y Output o formato.",
            "Una instrucción útil puede trabajar con categorías y datos sintéticos sin revelar información confidencial."
          ],
          "keypoints": [
            "Contexto suficiente no significa ilimitado.",
            "Los límites reducen compromisos inventados.",
            "Un formato esperado facilita la revisión humana."
          ],
          "activity": {
            "type": "reflection",
            "prompt": "Redacta una instrucción CLARO para un correo ficticio e incluye: “No inventes datos ni condiciones”."
          },
          "references": [
            "nist",
            "zhang"
          ]
        },
        {
          "id": "m3-l2",
          "title": "Alternativas, no una respuesta única",
          "duration": "14 min",
          "objective": "Usar IA para ampliar opciones sin homogeneizar el criterio.",
          "scenario": "Todo el equipo usa el mismo prompt y las propuestas comienzan a parecerse.",
          "content": [
            "La IA puede aumentar creatividad individual, pero patrones similares pueden reducir diversidad colectiva.",
            "Conviene pedir alternativas con supuestos distintos y compararlas mediante criterios explícitos."
          ],
          "keypoints": [
            "Más contenido no equivale a mayor diversidad.",
            "Los supuestos deben hacerse visibles.",
            "La selección final necesita criterio contextual."
          ],
          "activity": {
            "type": "decision",
            "prompt": "¿Qué protege mejor la diversidad?",
            "options": [
              {
                "text": "Aceptar la primera respuesta bien redactada.",
                "feedback": "La primera respuesta puede anclar al equipo."
              },
              {
                "text": "Pedir alternativas con supuestos distintos y compararlas con criterios explícitos.",
                "correct": true,
                "feedback": "Amplía opciones sin delegar la elección."
              },
              {
                "text": "Usar siempre el mismo prompt institucional.",
                "feedback": "La consistencia debe permitir contexto y contraste."
              }
            ]
          },
          "references": [
            "doshi",
            "nist"
          ]
        }
      ]
    },
    {
      "id": "m4",
      "number": "04",
      "title": "Marco VERIFICA",
      "subtitle": "Confiar después de comprobar",
      "lessons": [
        {
          "id": "m4-l1",
          "title": "VERIFICA: auditoría cotidiana",
          "duration": "22 min",
          "objective": "Aplicar un control proporcional al impacto.",
          "scenario": "La IA cita una fuente real, pero le atribuye una conclusión inexistente.",
          "content": [
            "VERIFICA revisa Vigencia, Evidencia, Riesgo, Integridad, Fuente, Impacto, Coherencia y Aprobación.",
            "No todas las salidas requieren el mismo control: una lluvia de ideas no tiene el mismo impacto que una comunicación contractual."
          ],
          "keypoints": [
            "Vigencia y versión.",
            "Evidencia verificable.",
            "Riesgo e impacto del error.",
            "Correspondencia real con las fuentes.",
            "Aprobación por responsable autorizado."
          ],
          "activity": {
            "type": "reflection",
            "prompt": "Elige una respuesta ficticia y explica qué elementos de VERIFICA aplicarías."
          },
          "references": [
            "nist",
            "oecd"
          ]
        },
        {
          "id": "m4-l2",
          "title": "Escalar la revisión",
          "duration": "12 min",
          "objective": "Diferenciar controles livianos, reforzados y especializados.",
          "scenario": "Un texto de ideas y una carta de despido usan el mismo flujo de revisión.",
          "content": [
            "El control debe ser proporcional. En materias legales, financieras o relacionadas con personas se requiere validación especializada.",
            "Cuando nadie puede verificar competentemente una salida, no debe utilizarse."
          ],
          "keypoints": [
            "El impacto define la profundidad del control.",
            "No saber verificar es una señal para detenerse.",
            "La aprobación debe ser real."
          ],
          "activity": {
            "type": "decision",
            "prompt": "¿Qué documento exige control reforzado?",
            "options": [
              {
                "text": "Lista de nombres ficticios para una actividad.",
                "feedback": "Es reversible y de bajo impacto."
              },
              {
                "text": "Carta laboral con efectos jurídicos y personales.",
                "correct": true,
                "feedback": "Requiere revisión competente y autorización formal."
              },
              {
                "text": "Ideas para el título de una reunión.",
                "feedback": "El impacto es bajo y reversible."
              }
            ]
          },
          "references": [
            "nist",
            "oecd"
          ]
        }
      ]
    },
    {
      "id": "m5",
      "number": "05",
      "title": "Datos, privacidad y autoría",
      "subtitle": "Usar menos información y con más control",
      "lessons": [
        {
          "id": "m5-l1",
          "title": "Datos que no deben copiarse sin autorización",
          "duration": "22 min",
          "objective": "Clasificar información antes de ingresarla en una herramienta.",
          "scenario": "Una persona quiere resumir evaluaciones con nombres, salud y remuneraciones en una plataforma pública.",
          "content": [
            "Antes de usar una herramienta deben conocerse condiciones, aprobación organizacional y finalidad. Los datos personales, sensibles y estratégicos requieren controles específicos.",
            "La Ley N.º 21.719 fue publicada y su entrada en vigor general está fijada para el 1 de diciembre de 2026. El curso distingue ese hito de la normativa hoy vigente.",
            "Las prácticas usan datos sintéticos y nunca solicitan pegar documentos reales."
          ],
          "keypoints": [
            "Minimizar: usar solo lo necesario.",
            "Sustituir: trabajar con datos ficticios.",
            "Autorizar: usar herramientas y finalidades aprobadas.",
            "Eliminar: no conservar más tiempo del necesario."
          ],
          "activity": {
            "type": "decision",
            "prompt": "¿Qué alternativa es más responsable?",
            "options": [
              {
                "text": "Pegar el archivo completo porque la tarea es interna.",
                "feedback": "La finalidad laboral no autoriza cualquier plataforma ni dato."
              },
              {
                "text": "Usar un caso sintético, omitir identificadores y confirmar la herramienta aprobada.",
                "correct": true,
                "feedback": "Reduce exposición y permite practicar."
              },
              {
                "text": "Cambiar solo los nombres y conservar los demás detalles.",
                "feedback": "La combinación de detalles puede seguir identificando personas."
              }
            ]
          },
          "references": [
            "law21719",
            "nist"
          ]
        },
        {
          "id": "m5-l2",
          "title": "Citar no significa tener licencia",
          "duration": "16 min",
          "objective": "Distinguir atribución, cita breve, licencia y autorización.",
          "scenario": "Un equipo quiere copiar una figura completa de un paper en un curso comercial porque agregó APA 7.",
          "content": [
            "APA 7 permite atribuir ideas y dar trazabilidad, pero no concede por sí sola derecho de reproducción.",
            "La Ley N.º 17.336 contempla citas breves bajo condiciones; no autoriza ensamblar un curso comercial con figuras, capítulos o videos ajenos.",
            "Los textos de esta experiencia son originales y las fuentes se usan mediante paráfrasis atribuidas."
          ],
          "keypoints": [
            "Atribuir no reemplaza una licencia.",
            "Figuras y tablas pueden tener protección propia.",
            "Creative Commons exige revisar cada condición.",
            "Voces, rostros, marcas y capturas también deben evaluarse."
          ],
          "activity": {
            "type": "decision",
            "prompt": "¿Qué acción corresponde?",
            "options": [
              {
                "text": "Copiar la figura completa y agregar APA 7.",
                "feedback": "La atribución no concede permiso de reproducción."
              },
              {
                "text": "Crear un diagrama original, citar las ideas y no replicar la expresión protegida.",
                "correct": true,
                "feedback": "Combina creación propia y atribución."
              },
              {
                "text": "Quitar el nombre del autor.",
                "feedback": "Agrava la falta de atribución y no resuelve la licencia."
              }
            ]
          },
          "references": [
            "law17336",
            "unesco"
          ]
        }
      ]
    },
    {
      "id": "m6",
      "number": "06",
      "title": "Marco DETENER",
      "subtitle": "Fraude, manipulación e incidentes",
      "lessons": [
        {
          "id": "m6-l1",
          "title": "DETENER una solicitud sospechosa",
          "duration": "20 min",
          "objective": "Responder ante urgencia, suplantación y cambios de pago.",
          "scenario": "Llega un audio que parece ser de gerencia. Pide cambiar la cuenta bancaria de un proveedor y mantenerlo confidencial.",
          "content": [
            "DETENER significa: Detener la acción, Examinar señales, Triangular por otro canal, Escalar, No compartir ni transferir, Evidenciar sin difundir y Reportar.",
            "La IA facilita mensajes convincentes; la respuesta segura depende de hábitos y procedimientos verificables."
          ],
          "keypoints": [
            "Urgencia y secreto son señales de alerta.",
            "Verificar por un canal independiente.",
            "No usar contactos entregados en el mensaje sospechoso.",
            "Preservar evidencia sin difundirla."
          ],
          "activity": {
            "type": "decision",
            "prompt": "¿Cuál es el primer paso?",
            "options": [
              {
                "text": "Transferir y verificar después.",
                "feedback": "El daño puede ser irreversible."
              },
              {
                "text": "Responder al mismo audio preguntando si es real.",
                "feedback": "El canal puede estar comprometido."
              },
              {
                "text": "Detener la operación y verificar por un canal independiente conocido.",
                "correct": true,
                "feedback": "Corta la presión de urgencia."
              }
            ]
          },
          "references": [
            "nist",
            "oecd"
          ]
        },
        {
          "id": "m6-l2",
          "title": "Aprender del incidente sin culpabilizar",
          "duration": "14 min",
          "objective": "Transformar un error en mejora del sistema.",
          "scenario": "Una persona abrió un archivo sospechoso y teme reportarlo porque podría ser sancionada.",
          "content": [
            "Una cultura punitiva retrasa reportes y aumenta daño. El protocolo debe facilitar aviso temprano, contención, soporte y aprendizaje.",
            "La organización debe revisar por qué el engaño fue plausible y qué controles faltaron."
          ],
          "keypoints": [
            "Reportar temprano reduce impacto.",
            "La investigación revisa sistema y contexto, no solo conducta individual.",
            "El aprendizaje debe volver a políticas y formación."
          ],
          "activity": {
            "type": "reflection",
            "prompt": "Redacta un mensaje institucional que invite a reportar sin culpabilizar."
          },
          "references": [
            "nist",
            "martin"
          ]
        }
      ]
    },
    {
      "id": "m7",
      "number": "07",
      "title": "Sesgos y supervisión",
      "subtitle": "Proteger oportunidades y dignidad",
      "lessons": [
        {
          "id": "m7-l1",
          "title": "Cuando una recomendación afecta a personas",
          "duration": "20 min",
          "objective": "Identificar sesgo, opacidad y automatización de alto impacto.",
          "scenario": "Un sistema favorece a personas con más tiempo disponible y excluye a quienes cuidan a terceros.",
          "content": [
            "Los datos reflejan condiciones históricas. Una recomendación puede reproducir desigualdades aunque no use explícitamente categorías sensibles.",
            "La supervisión humana debe ser competente, informada y con autoridad real para cambiar la decisión."
          ],
          "keypoints": [
            "Medir impactos por grupos puede revelar exclusión.",
            "Confirmar automáticamente no es supervisar.",
            "Deben existir vías para cuestionar y corregir."
          ],
          "activity": {
            "type": "decision",
            "prompt": "¿Qué respuesta es más adecuada?",
            "options": [
              {
                "text": "Aceptar porque no usa categorías sensibles.",
                "feedback": "Los efectos indirectos también pueden excluir."
              },
              {
                "text": "Auditar criterios e impactos, revisar humanamente y ofrecer apelación.",
                "correct": true,
                "feedback": "Aborda proceso, resultado y corrección."
              },
              {
                "text": "Ocultar el uso del sistema.",
                "feedback": "La opacidad debilita confianza y control."
              }
            ]
          },
          "references": [
            "unesco",
            "oecd",
            "nist"
          ]
        },
        {
          "id": "m7-l2",
          "title": "Conversar el cambio sin instalar miedo",
          "duration": "15 min",
          "objective": "Comunicar adopción tecnológica con participación y claridad.",
          "scenario": "La empresa anuncia automatización destacando solo ahorro. El equipo interpreta que habrá despidos.",
          "content": [
            "La adopción responsable debe explicar propósito, límites, cambios esperados, aprendizajes y mecanismos de participación.",
            "La incertidumbre no se resuelve con optimismo vacío; se maneja diciendo qué se sabe, qué no y cómo se decidirá."
          ],
          "keypoints": [
            "Explicar propósito y límites.",
            "Crear espacios de preguntas sin represalias.",
            "Vincular productividad con calidad y bienestar.",
            "Incluir a las personas afectadas."
          ],
          "activity": {
            "type": "reflection",
            "prompt": "Escribe una apertura de 100 palabras para presentar un piloto de IA al equipo."
          },
          "references": [
            "martin",
            "shukla",
            "oneill"
          ]
        }
      ]
    },
    {
      "id": "m8",
      "number": "08",
      "title": "Mi flujo responsable",
      "subtitle": "Integrar, demostrar y transferir",
      "lessons": [
        {
          "id": "m8-l1",
          "title": "Diseña tu flujo",
          "duration": "35 min",
          "objective": "Construir un proceso aplicable, medible y seguro.",
          "scenario": "Proyecto Aurora necesita un piloto de bajo riesgo que demuestre valor sin usar información confidencial.",
          "content": [
            "El producto final integra VALOR, CLARO y VERIFICA. DETENER establece señales para suspender el flujo.",
            "Describe el proceso con datos ficticios e incluye responsable, herramienta autorizada, entradas, salidas, revisión e indicador."
          ],
          "keypoints": [
            "Definir qué no se delega.",
            "Medir tiempo total incluido el control.",
            "Registrar errores y mejoras.",
            "Solicitar apoyo organizacional para transferir."
          ],
          "activity": {
            "type": "reflection",
            "prompt": "Construye tu flujo: tarea, valor, datos, instrucción CLARO, control VERIFICA, señal DETENER, responsable e indicador."
          },
          "references": [
            "shukla",
            "oneill",
            "hemmler",
            "nist"
          ]
        },
        {
          "id": "m8-l2",
          "title": "Plan de transferencia a 30 días",
          "duration": "18 min",
          "objective": "Definir una aplicación realista y una revisión posterior.",
          "scenario": "Aprender no garantiza aplicación. La transferencia necesita tiempo, apoyo, herramientas y acuerdos.",
          "content": [
            "El plan especifica acción, responsable, apoyo, fecha de revisión y señal de éxito. También reconoce barreras del sistema.",
            "La certificación de dominio requiere evidencia revisable y mejora posterior a retroalimentación."
          ],
          "keypoints": [
            "Una acción concreta supera una intención genérica.",
            "La barrera puede estar en el entorno.",
            "La revisión a 30 días permite ajustar."
          ],
          "activity": {
            "type": "reflection",
            "prompt": "Define una acción de 30 días, apoyo, responsable, fecha y señal observable de éxito."
          },
          "references": [
            "oneill",
            "shukla",
            "hemmler"
          ]
        },
        {
          "id": "m8-l3",
          "title": "Cierre y compromiso de criterio",
          "duration": "10 min",
          "objective": "Recuperar las decisiones centrales sin revisar el material.",
          "scenario": "Vuelve a la primera regla que formulaste y compárala con lo que ahora sabes.",
          "content": [
            "El criterio se demuestra al reconocer valor y límite al mismo tiempo. Una persona competente sabe usar, verificar, detenerse y pedir revisión especializada.",
            "Los refuerzos aparecerán en los días 3, 8, 16 y 28 en contextos nuevos."
          ],
          "keypoints": [
            "IA como apoyo; responsabilidad humana como principio.",
            "Datos mínimos y ficticios.",
            "Control proporcional al impacto.",
            "Dominio exige evidencia, no consumo."
          ],
          "activity": {
            "type": "decision",
            "prompt": "¿Cuál resume mejor el curso?",
            "options": [
              {
                "text": "Usar IA siempre que reduzca tiempo.",
                "feedback": "El tiempo no es el único criterio."
              },
              {
                "text": "Usar IA cuando exista valor, datos controlados, revisión y responsabilidad definida.",
                "correct": true,
                "feedback": "Integra productividad, seguridad y criterio."
              },
              {
                "text": "Evitar IA solo en decisiones laborales.",
                "feedback": "Todas las tareas requieren controles proporcionales."
              }
            ]
          },
          "references": [
            "trumble",
            "mawson",
            "nist",
            "zhang"
          ]
        }
      ]
    }
  ],
  "references": [
    "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1",
    "Brynjolfsson, E., Li, D., & Raymond, L. R. (2025). Generative AI at work. The Quarterly Journal of Economics, 140(2), 889–942. https://doi.org/10.1093/qje/qjae044",
    "Doshi, A. R., & Hauser, O. P. (2024). Generative AI enhances individual creativity but reduces the collective diversity of novel content. Science Advances, 10(28), eadn5290. https://doi.org/10.1126/sciadv.adn5290",
    "Hemmler, Y. M., & Ifenthaler, D. (2024). Self-regulated learning strategies in continuing education: A systematic review and meta-analysis. Educational Research Review, 45, 100629. https://doi.org/10.1016/j.edurev.2024.100629",
    "Martin, F., Wu, T., Wan, L., & Xie, K. (2022). A meta-analysis on the Community of Inquiry presences and learning outcomes in online and blended learning environments. Online Learning, 26(1). https://doi.org/10.24059/olj.v26i1.2604",
    "Mawson, K. B., & Kang, S. H. K. (2025). The distributed practice effect on classroom learning: A meta-analytic review of applied research. Behavioral Sciences, 15(6), 771. https://doi.org/10.3390/bs15060771",
    "Monib, W. K., Qazi, A., & Apong, R. A. (2024). Microlearning beyond boundaries: A systematic review and a novel framework for improving learning outcomes. Heliyon, 11(2), e41413. https://doi.org/10.1016/j.heliyon.2024.e41413",
    "Noy, S., & Zhang, W. (2023). Experimental evidence on the productivity effects of generative artificial intelligence. Science, 381(6654), 187–192. https://doi.org/10.1126/science.adh2586",
    "Organisation for Economic Co-operation and Development. (2024). OECD AI Principles. https://oecd.ai/en/ai-principles",
    "O’Neill, S. (2025). Transfer of workplace e-learning: A systematic literature review. Social Sciences & Humanities Open, 11, 101407. https://doi.org/10.1016/j.ssaho.2025.101407",
    "Shukla, B., Dash, S., & Kumar, A. (2024). Factors affecting transfer of online training: A systematic literature review and proposed taxonomy. Human Resource Development Quarterly. https://doi.org/10.1002/hrdq.21518",
    "Trumble, E., Lodge, J., Mandrusiak, A., & Forbes, R. (2024). Systematic review of distributed practice and retrieval practice in health professions education. Advances in Health Sciences Education, 29(2), 689–714. https://doi.org/10.1007/s10459-023-10274-3",
    "United Nations Educational, Scientific and Cultural Organization. (2021). Recommendation on the ethics of artificial intelligence. https://unesdoc.unesco.org/ark:/48223/pf0000381137",
    "CAST. (2024). CAST Universal Design for Learning Guidelines version 3.0. https://udlguidelines.cast.org/",
    "World Wide Web Consortium. (2024). Web Content Accessibility Guidelines (WCAG) 2.2. https://www.w3.org/TR/WCAG22/",
    "Zhang, A., & Lee, M. K. (2025). Knowledge workers’ perspectives on AI training for responsible AI use. In Proceedings of the 2025 CHI Conference on Human Factors in Computing Systems (pp. 1–18). Association for Computing Machinery. https://doi.org/10.1145/3706598.3714100",
    "Biblioteca del Congreso Nacional de Chile. (1970). Ley N.º 17.336 sobre propiedad intelectual. https://www.bcn.cl/leychile/navegar?idNorma=28933",
    "Biblioteca del Congreso Nacional de Chile. (2024). Ley N.º 21.719: Regula la protección y el tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales. https://www.bcn.cl/leychile/navegar?idNorma=1209272"
  ],
  "lessons": [
    {
      "id": "m0-l1",
      "pedagogyVersion": "1.1",
      "title": "Una decisión antes de comenzar",
      "duration": "8–10 min",
      "objective": "Reconocer que adoptar IA requiere reglas mínimas antes de comenzar.",
      "scenario": "La directora de Proyecto Aurora pide al equipo “usar IA desde mañana”. No existe herramienta aprobada, criterio de revisión ni regla sobre qué datos pueden ingresarse.",
      "image": {
        "src": "../../../../assets/images/aula/ia-con-criterio-humano/modulo-00-reglas-minimas.png",
        "webp": "../../../../assets/images/aula/ia-con-criterio-humano/modulo-00-reglas-minimas.webp",
        "alt": "Equipo de trabajo definiendo herramienta autorizada, datos permitidos, revisión humana y responsable antes de iniciar un piloto de inteligencia artificial.",
        "caption": "Antes de iniciar, el equipo acuerda los límites y la responsabilidad del piloto.",
        "width": 1672,
        "height": 941,
        "loading": "eager"
      },
      "studySections": [
        {
          "title": "Adopción no es lo mismo que improvisación",
          "paragraphs": [
            "Una organización puede decidir experimentar con inteligencia artificial sin tener todo resuelto, pero no debería comenzar sin acuerdos mínimos. La velocidad de adopción no reemplaza la gobernanza. Gobernar significa decidir quién puede usar una herramienta, para qué tareas, con qué datos, bajo qué revisión y con qué responsabilidad.",
            "El riesgo no depende solo de la tecnología. También depende del contexto, de las personas afectadas, de la calidad de los datos y de las consecuencias de un error. Un borrador interno tiene un impacto distinto a una recomendación sobre contratación, salud, crédito o desempeño. NIST propone gestionar riesgos considerando tanto el sistema como el uso concreto y sus efectos sobre personas y organizaciones (Tabassi, 2023; Autio et al., 2024)."
          ]
        },
        {
          "title": "Cuatro acuerdos mínimos",
          "paragraphs": [
            "Primero, debe existir una herramienta autorizada. Esto no significa que una plataforma sea perfecta, sino que alguien revisó sus condiciones básicas de uso, privacidad, almacenamiento y control institucional.",
            "Segundo, deben definirse los datos permitidos y excluidos. Para un primer piloto, conviene trabajar con información pública, ficticia, anonimizada o de bajo riesgo. No se deben ingresar credenciales, antecedentes médicos, evaluaciones laborales individualizadas, secretos comerciales ni datos personales sensibles sin una base legítima y controles adecuados.",
            "Tercero, debe existir revisión humana competente. Revisar no significa mirar rápidamente y aprobar. Significa comprobar exactitud, contexto, consecuencias, tono y cumplimiento de reglas.",
            "Cuarto, debe nombrarse a una persona responsable. La herramienta no asume responsabilidad ética, profesional o jurídica. La decisión final sigue siendo humana."
          ]
        },
        {
          "title": "Innovar con límites claros",
          "paragraphs": [
            "Prohibir todo uso indefinidamente tampoco garantiza seguridad. Puede desplazar el uso hacia canales informales y sin supervisión. Un enfoque más útil consiste en comenzar con un piloto pequeño, reversible, medible y de bajo riesgo.",
            "Un buen piloto define qué se probará, durante cuánto tiempo, qué datos se usarán, quién revisará, qué errores se registrarán y qué condición obligará a detenerlo. La supervisión humana y la prevención de daños forman parte de los principios internacionales de IA responsable (UNESCO, 2021; OECD, 2024)."
          ]
        }
      ],
      "workedExample": [
        "Proyecto Aurora podría comenzar con una tarea sencilla: generar borradores de correos internos sobre reuniones ficticias. El equipo usaría una herramienta aprobada, evitaría datos reales, revisaría cada borrador antes de enviarlo y registraría errores frecuentes durante dos semanas.",
        "En cambio, no sería adecuado comenzar automatizando evaluaciones de desempeño. Esa tarea afecta trayectorias laborales, contiene información personal y exige criterios explicables, revisión especializada y vías de corrección."
      ],
      "keypoints": [
        "La responsabilidad no se transfiere a la herramienta.",
        "La ausencia de reglas no convierte cualquier uso en aceptable.",
        "Un piloto responsable puede comenzar pequeño, con datos controlados y revisión real.",
        "La decisión de usar IA debe considerar consecuencias, no solo rapidez."
      ],
      "activity": {
        "type": "decision",
        "prompt": "¿Cuál debería ser la primera respuesta del equipo?",
        "instructions": [
          "Selecciona la respuesta más responsable.",
          "Lee la explicación específica de tu alternativa y revisa el criterio esperado, aunque hayas acertado.",
          "Si la respuesta necesita revisión, vuelve a estudiar la sección indicada y reintenta sin penalización."
        ],
        "expectedCriterion": "Acordar herramienta autorizada, datos permitidos y excluidos, revisión humana competente y una persona responsable antes de iniciar un piloto pequeño, reversible y medible.",
        "reviewSection": "Cuatro acuerdos mínimos e Innovar con límites claros",
        "allowRetry": true,
        "options": [
          {
            "text": "Comenzar de inmediato para no quedar atrás.",
            "feedback": "La urgencia no reemplaza controles. Empezar sin herramienta autorizada, regla de datos, revisión ni responsable normaliza riesgos evitables."
          },
          {
            "text": "Prohibir todo uso indefinidamente.",
            "feedback": "Una prohibición indefinida puede impedir aprendizaje y favorecer usos ocultos. El manual propone un piloto pequeño y controlado, no una adopción sin límites."
          },
          {
            "text": "Acordar herramienta, datos permitidos, revisión y responsable antes del piloto.",
            "correct": true,
            "feedback": "Esta alternativa permite experimentar sin normalizar riesgos evitables y deja claro quién revisa y responde por la decisión final."
          },
          {
            "text": "Delegar toda la decisión al área tecnológica.",
            "feedback": "El uso de IA involucra personas, cultura, procesos, derechos y responsabilidades; no es solo una decisión técnica."
          }
        ]
      },
      "completion": {
        "requiresAnswer": true,
        "requiresCorrectAnswer": true,
        "requiresFeedbackReview": true,
        "allowRetry": true,
        "attemptsAreNotPenalized": true
      },
      "summary": [
        "Adoptar IA con criterio no exige tener todo resuelto, pero sí acordar condiciones mínimas antes de actuar.",
        "La experiencia se cierra con una regla práctica: herramienta autorizada, datos controlados, revisión humana competente, responsable final y un piloto pequeño que pueda medirse, corregirse o detenerse."
      ],
      "references": [
        {
          "apa": "Tabassi, E. (2023). Artificial intelligence risk management framework (AI RMF 1.0) (NIST AI 100-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.100-1",
          "url": "https://doi.org/10.6028/NIST.AI.100-1"
        },
        {
          "apa": "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1",
          "url": "https://doi.org/10.6028/NIST.AI.600-1"
        },
        {
          "apa": "United Nations Educational, Scientific and Cultural Organization. (2021). Recommendation on the ethics of artificial intelligence. UNESCO. https://unesdoc.unesco.org/ark:/48223/pf0000381137",
          "url": "https://unesdoc.unesco.org/ark:/48223/pf0000381137"
        },
        {
          "apa": "Organisation for Economic Co-operation and Development. (2024). OECD AI principles. https://oecd.ai/en/ai-principles",
          "url": "https://oecd.ai/en/ai-principles"
        }
      ],
      "moduleId": "m0",
      "moduleNumber": "00",
      "moduleTitle": "Orientación y diagnóstico"
    },
    {
      "id": "m0-l2",
      "title": "Cómo aprenderemos",
      "duration": "6 min",
      "objective": "Comprender el Ciclo de Aprendizaje Vivo y definir una meta propia.",
      "scenario": "No avanzarás por mirar videos. Avanzarás al decidir, practicar, explicar, revisar y transferir.",
      "content": [
        "Cada experiencia comienza con una situación auténtica, entrega una explicación breve, permite practicar y ofrece retroalimentación con reintentos.",
        "La recuperación activa y la práctica distribuida ayudan a consolidar el aprendizaje. Las actividades nunca requieren datos reales de una empresa."
      ],
      "keypoints": [
        "El error es información para aprender.",
        "La práctica se distribuye en el tiempo.",
        "La transferencia necesita una meta concreta y apoyo del entorno."
      ],
      "activity": {
        "type": "reflection",
        "prompt": "Describe una tarea que deseas mejorar sin revelar datos internos. Puedes usar un ejemplo ficticio."
      },
      "references": [
        "Trumble, E., Lodge, J., Mandrusiak, A., & Forbes, R. (2024). Systematic review of distributed practice and retrieval practice in health professions education. Advances in Health Sciences Education, 29(2), 689–714. https://doi.org/10.1007/s10459-023-10274-3",
        "Mawson, K. B., & Kang, S. H. K. (2025). The distributed practice effect on classroom learning: A meta-analytic review of applied research. Behavioral Sciences, 15(6), 771. https://doi.org/10.3390/bs15060771",
        "Hemmler, Y. M., & Ifenthaler, D. (2024). Self-regulated learning strategies in continuing education: A systematic review and meta-analysis. Educational Research Review, 45, 100629. https://doi.org/10.1016/j.edurev.2024.100629",
        "Monib, W. K., Qazi, A., & Apong, R. A. (2024). Microlearning beyond boundaries: A systematic review and a novel framework for improving learning outcomes. Heliyon, 11(2), e41413. https://doi.org/10.1016/j.heliyon.2024.e41413"
      ],
      "moduleId": "m0",
      "moduleNumber": "00",
      "moduleTitle": "Orientación y diagnóstico"
    },
    {
      "id": "m1-l1",
      "title": "Qué hace realmente una IA generativa",
      "duration": "14 min",
      "objective": "Distinguir generación probabilística, búsqueda, análisis y automatización.",
      "scenario": "Un informe generado por IA suena preciso, pero incluye una normativa inexistente.",
      "content": [
        "Una IA generativa produce respuestas plausibles a partir de patrones y contexto. La fluidez no demuestra veracidad.",
        "Buscar fuentes, generar borradores, analizar datos y ejecutar acciones son funciones distintas. Confundirlas produce controles insuficientes."
      ],
      "keypoints": [
        "Plausible no significa verdadero.",
        "La herramienta puede escalar aciertos y errores.",
        "El valor depende del tipo de tarea y del control de calidad."
      ],
      "activity": {
        "type": "decision",
        "prompt": "¿Qué afirmación es correcta?",
        "options": [
          {
            "text": "Una respuesta detallada es una respuesta verificada.",
            "feedback": "El detalle puede aumentar solo la apariencia de autoridad."
          },
          {
            "text": "La IA generativa puede producir contenido convincente y equivocado.",
            "correct": true,
            "feedback": "Por eso la verificación debe integrarse al flujo."
          },
          {
            "text": "Toda tarea mejora al usar IA.",
            "feedback": "Hay tareas donde revisar cuesta más o el riesgo es inaceptable."
          }
        ]
      },
      "references": [
        "Noy, S., & Zhang, W. (2023). Experimental evidence on the productivity effects of generative artificial intelligence. Science, 381(6654), 187–192. https://doi.org/10.1126/science.adh2586",
        "Brynjolfsson, E., Li, D., & Raymond, L. R. (2025). Generative AI at work. The Quarterly Journal of Economics, 140(2), 889–942. https://doi.org/10.1093/qje/qjae044",
        "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1"
      ],
      "moduleId": "m1",
      "moduleNumber": "01",
      "moduleTitle": "IA, capacidad y límite"
    },
    {
      "id": "m1-l2",
      "title": "La responsabilidad sigue siendo humana",
      "duration": "12 min",
      "objective": "Identificar decisiones que requieren supervisión y rendición de cuentas.",
      "scenario": "Una jefatura quiere descartar postulantes con una recomendación automática sin revisar los criterios.",
      "content": [
        "El uso responsable exige definir quién decide, quién revisa, quién puede cuestionar y cómo se corrige un daño.",
        "Una recomendación automática no elimina la obligación de explicar y responder por la decisión."
      ],
      "keypoints": [
        "La automatización no elimina la rendición de cuentas.",
        "Mayor impacto exige mayor supervisión.",
        "La revisión humana debe ser competente y tener autoridad real."
      ],
      "activity": {
        "type": "decision",
        "prompt": "¿Qué condición falta?",
        "options": [
          {
            "text": "Que el sistema sea rápido.",
            "feedback": "La velocidad no resuelve el impacto sobre personas."
          },
          {
            "text": "Criterios transparentes, revisión humana competente y vía de corrección.",
            "correct": true,
            "feedback": "Sostiene una decisión revisable y responsable."
          },
          {
            "text": "Que la jefatura confíe en el proveedor.",
            "feedback": "La confianza contractual no sustituye evaluar el uso concreto."
          }
        ]
      },
      "references": [
        "United Nations Educational, Scientific and Cultural Organization. (2021). Recommendation on the ethics of artificial intelligence. https://unesdoc.unesco.org/ark:/48223/pf0000381137",
        "Organisation for Economic Co-operation and Development. (2024). OECD AI Principles. https://oecd.ai/en/ai-principles",
        "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1"
      ],
      "moduleId": "m1",
      "moduleNumber": "01",
      "moduleTitle": "IA, capacidad y límite"
    },
    {
      "id": "m2-l1",
      "pedagogyVersion": "1.1",
      "title": "VALOR: antes de usar la herramienta",
      "duration": "20–25 min",
      "objective": "Evaluar si una tarea es adecuada para un piloto de IA.",
      "scenario": "Proyecto Aurora quiere automatizar correos, evaluación de desempeño y reclamos al mismo tiempo.",
      "image": {
        "src": "../../../../assets/images/aula/ia-con-criterio-humano/modulo-02-marco-valor.png",
        "webp": "../../../../assets/images/aula/ia-con-criterio-humano/modulo-02-marco-valor.webp",
        "alt": "Equipo aplicando el marco VALOR para evaluar el beneficio, las personas afectadas, los límites de datos, la observabilidad y la responsabilidad de un piloto de inteligencia artificial.",
        "caption": "El marco VALOR hace visibles beneficios, riesgos, datos, controles y responsabilidades antes del piloto.",
        "width": 1672,
        "height": 941,
        "loading": "eager"
      },
      "studySections": [
        {
          "title": "Por qué se necesita un marco previo",
          "paragraphs": [
            "Las organizaciones suelen comenzar preguntando qué herramienta comprar. VALOR cambia el orden: primero pregunta si la tarea merece ser aumentada con IA y bajo qué condiciones. Es un marco original de Núcleo Vivo compuesto por Valor esperado, Afectación a personas, Límites de datos, Observabilidad del resultado y Responsable final.",
            "VALOR no entrega una respuesta automática. Organiza la conversación para que beneficios, riesgos, datos, controles y responsabilidades sean visibles antes de experimentar."
          ],
          "questions": [
            "¿La conversación comienza por una necesidad concreta o solo por la herramienta disponible?",
            "¿Qué condiciones deben quedar visibles antes de experimentar?"
          ]
        },
        {
          "title": "V — Valor esperado",
          "paragraphs": [
            "Defina qué problema se busca resolver y qué resultado debería mejorar. “Modernizarnos” no es un valor medible. “Reducir en 20% el tiempo de preparación de borradores sin aumentar correcciones” sí permite evaluar."
          ],
          "questions": [
            "¿Quién se beneficia?",
            "¿Qué costo se reduce?",
            "¿Qué calidad se espera?",
            "¿Cómo sabremos si funcionó?"
          ],
          "contrast": {
            "insufficient": "Queremos modernizarnos y trabajar mejor.",
            "adequate": "Buscamos reducir en 20% el tiempo de preparación de borradores sin aumentar las correcciones."
          }
        },
        {
          "title": "A — Afectación a personas",
          "paragraphs": [
            "Identifique quién puede verse beneficiado o perjudicado. Analice si existen relaciones de poder, efectos sobre derechos, empleo, reputación o acceso a servicios.",
            "Una tarea administrativa de bajo impacto no se evalúa igual que una recomendación sobre desempeño o elegibilidad."
          ],
          "questions": [
            "¿Quién puede beneficiarse o resultar perjudicado?",
            "¿Existen relaciones de poder o efectos sobre derechos, empleo, reputación o acceso a servicios?"
          ],
          "contrast": {
            "insufficient": "No afecta a nadie porque la decisión la toma una persona.",
            "adequate": "Afecta al equipo que redacta y a quienes reciben el mensaje; el impacto es bajo solo si cada borrador se revisa antes de enviarlo."
          }
        },
        {
          "title": "L — Límites de datos",
          "paragraphs": [
            "Determine qué información es necesaria, qué puede excluirse y qué nunca debe ingresarse. Minimizar datos significa usar solo lo necesario para el propósito.",
            "Distinga información pública, interna, personal, sensible y confidencial. Para pilotos iniciales, priorice datos ficticios, anonimizados o de bajo riesgo."
          ],
          "questions": [
            "¿Qué información es estrictamente necesaria?",
            "¿Qué datos pueden excluirse y cuáles nunca deben ingresarse?",
            "¿Es posible trabajar con datos ficticios, anonimizados o de bajo riesgo?"
          ],
          "contrast": {
            "insufficient": "Usaremos los datos que el equipo tenga disponibles.",
            "adequate": "Usaremos reuniones ficticias y excluiremos nombres, credenciales, evaluaciones, información sensible y antecedentes confidenciales."
          }
        },
        {
          "title": "O — Observabilidad del resultado",
          "paragraphs": [
            "Un resultado observable puede compararse con una fuente, medirse y corregirse. Pregunte: ¿podemos detectar errores?, ¿existe registro?, ¿sabemos cuánto cuesta revisar?, ¿podemos detener el proceso?",
            "Las tareas cuyo error es difícil de detectar no son buenas candidatas para un primer piloto."
          ],
          "questions": [
            "¿Podemos detectar errores y compararlos con una fuente?",
            "¿Existe un registro de resultados y correcciones?",
            "¿Sabemos cuánto cuesta revisar?",
            "¿Podemos detener el proceso?"
          ],
          "contrast": {
            "insufficient": "Veremos si la herramienta funciona bien.",
            "adequate": "Durante dos semanas mediremos tiempo total, errores detectados y número de correcciones, con revisión del 100% de los borradores."
          }
        },
        {
          "title": "R — Responsable final",
          "paragraphs": [
            "Debe existir un rol identificado que revise, apruebe, registre incidentes y responda por las consecuencias. “El equipo” es demasiado ambiguo.",
            "La persona responsable necesita tiempo, competencia y autoridad para rechazar la salida de la IA."
          ],
          "questions": [
            "¿Qué rol revisa y aprueba cada salida?",
            "¿Quién registra incidentes y responde por las consecuencias?",
            "¿Esa persona tiene tiempo, competencia y autoridad para rechazar el resultado?"
          ],
          "contrast": {
            "insufficient": "El equipo será responsable.",
            "adequate": "La coordinación administrativa revisará y aprobará cada borrador, registrará errores y podrá detener el piloto."
          }
        },
        {
          "title": "Escala de decisión",
          "paragraphs": [
            "Una tarea puede clasificarse como: apta para piloto, apta con controles adicionales o no apta por ahora. La decisión debe quedar documentada y revisarse después del piloto."
          ],
          "questions": [
            "¿La tarea es apta para un piloto de bajo riesgo?",
            "¿Necesita controles adicionales antes de probarse?",
            "¿Debe declararse no apta por ahora?"
          ]
        }
      ],
      "workedExample": [
        "Tarea: generar borradores de correos internos repetitivos sobre reuniones ficticias.",
        "V — Valor esperado: reducir el tiempo de preparación de borradores sin aumentar correcciones ni compromisos no autorizados.",
        "A — Afectación a personas: el equipo y las personas destinatarias pueden verse afectados por mensajes incorrectos, pero el impacto se mantiene bajo si ningún borrador se envía sin revisión.",
        "L — Límites de datos: se usarán casos ficticios y se excluirán nombres, credenciales, antecedentes personales, información sensible y datos confidenciales.",
        "O — Observabilidad: durante dos semanas se registrarán tiempo total, errores, correcciones y borradores rechazados. El proceso puede detenerse si aparecen compromisos inventados o si revisar cuesta más que redactar manualmente.",
        "R — Responsable final: la coordinación administrativa revisará el 100% de las salidas, aprobará antes de enviar, registrará incidentes y tendrá autoridad para detener el piloto.",
        "Decisión: apta para un piloto pequeño de dos semanas, con revisión humana completa y datos ficticios."
      ],
      "comparison": {
        "title": "Tres tareas de Proyecto Aurora",
        "caption": "Comparación orientadora. La decisión final depende del contexto y de los controles reales.",
        "columns": [
          { "key": "task", "label": "Tarea" },
          { "key": "value", "label": "V" },
          { "key": "people", "label": "A" },
          { "key": "data", "label": "L" },
          { "key": "observable", "label": "O" },
          { "key": "responsible", "label": "R" },
          { "key": "decision", "label": "Decisión" }
        ],
        "rows": [
          {
            "task": "Correos internos repetitivos",
            "value": "Valor claro y medible.",
            "people": "Afectación baja con revisión.",
            "data": "Datos ficticios y controlables.",
            "observable": "Resultado fácil de revisar.",
            "responsible": "Coordinación identificable.",
            "decision": "Apta para piloto."
          },
          {
            "task": "Clasificación o borradores de reclamos",
            "value": "Puede reducir tiempos.",
            "people": "Puede afectar atención y respuesta.",
            "data": "Contexto potencialmente sensible.",
            "observable": "Requiere registro y revisión cuidadosa.",
            "responsible": "Rol de atención con autoridad.",
            "decision": "Apta con alcance limitado y controles."
          },
          {
            "task": "Evaluación de desempeño",
            "value": "Beneficio posible, pero no suficiente.",
            "people": "Afectación alta y consecuencias laborales.",
            "data": "Datos personales y riesgo de sesgo.",
            "observable": "Errores y efectos pueden ser difíciles de detectar.",
            "responsible": "Exige revisión especializada y vías de corrección.",
            "decision": "No apta como primer piloto."
          }
        ]
      },
      "keypoints": [
        "V: beneficio concreto y observable.",
        "A: personas afectadas y consecuencias.",
        "L: datos necesarios y excluidos.",
        "O: forma de verificar y medir.",
        "R: persona que revisa, decide y responde."
      ],
      "activity": {
        "type": "reflection",
        "prompt": "Aplica VALOR a una tarea ficticia y decide si es adecuada para un piloto de IA.",
        "instructions": [
          "Elige una tarea ficticia y escribe entre 180 y 280 palabras.",
          "Organiza la respuesta con los subtítulos V, A, L, O y R.",
          "Incluye una decisión final: apta para piloto, apta con controles o no apta por ahora.",
          "No uses información real ni nombres de personas.",
          "Guarda el borrador, revisa los cinco criterios y compáralo con la respuesta modelo antes de completar."
        ],
        "minimumWords": 180,
        "maximumWords": 280,
        "requiredCriteria": [
          {
            "id": "value",
            "label": "V — Valor esperado",
            "description": "Define un beneficio concreto, observable y medible."
          },
          {
            "id": "people",
            "label": "A — Afectación a personas",
            "description": "Identifica personas afectadas, beneficios, perjuicios y consecuencias."
          },
          {
            "id": "data",
            "label": "L — Límites de datos",
            "description": "Distingue datos necesarios, permitidos y excluidos."
          },
          {
            "id": "observability",
            "label": "O — Observabilidad",
            "description": "Explica cómo detectar errores, medir, corregir y detener."
          },
          {
            "id": "responsible",
            "label": "R — Responsable final",
            "description": "Identifica un rol con competencia, tiempo y autoridad para decidir."
          }
        ],
        "modelAnswer": [
          "Tarea ficticia: preparar borradores de correos internos repetitivos para recordar reuniones simuladas.",
          "V — Valor esperado: el propósito es reducir en 20% el tiempo total de redacción, sin aumentar correcciones ni compromisos inventados. El beneficio se medirá comparando el tiempo de preparación y revisión con el proceso manual.",
          "A — Afectación a personas: se benefician quienes redactan y reciben mensajes más oportunos. Podrían perjudicarse las personas destinatarias si el texto contiene fechas, tonos o acuerdos incorrectos. Por eso ningún borrador se enviará automáticamente.",
          "L — Límites de datos: se usarán únicamente reuniones, nombres y contenidos ficticios. Se excluirán credenciales, datos personales, evaluaciones laborales, información sensible, secretos comerciales y cualquier documento real.",
          "O — Observabilidad: durante dos semanas se registrarán el tiempo total, los errores detectados, las correcciones y los borradores rechazados. El piloto se detendrá si revisar cuesta más que redactar manualmente o si la herramienta inventa compromisos.",
          "R — Responsable final: la coordinación administrativa revisará el 100% de las salidas, aprobará antes de enviar, registrará incidentes y tendrá autoridad para detener el proceso.",
          "Decisión: apta para un piloto pequeño de dos semanas, con herramienta autorizada, datos ficticios y revisión humana completa."
        ],
        "allowRetry": true
      },
      "completion": {
        "requiresSavedResponse": true,
        "minimumWords": 180,
        "maximumWords": 280,
        "requiresAllCriteria": true,
        "requiresModelAnswerView": true,
        "requiresFeedbackReview": true,
        "allowEditing": true
      },
      "summary": [
        "VALOR no entrega una respuesta automática: hace visible por qué una tarea podría aportar valor, a quién afecta, qué datos necesita, cómo se observará el resultado y quién responderá por la decisión.",
        "Una tarea puede quedar apta para piloto, apta con controles adicionales o no apta por ahora. Documentar esa decisión permite aprender y revisarla después del piloto."
      ],
      "references": [
        {
          "apa": "Tabassi, E. (2023). Artificial intelligence risk management framework (AI RMF 1.0) (NIST AI 100-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.100-1",
          "url": "https://doi.org/10.6028/NIST.AI.100-1"
        },
        {
          "apa": "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1",
          "url": "https://doi.org/10.6028/NIST.AI.600-1"
        },
        {
          "apa": "United Nations Educational, Scientific and Cultural Organization. (2021). Recommendation on the ethics of artificial intelligence. UNESCO. https://unesdoc.unesco.org/ark:/48223/pf0000381137",
          "url": "https://unesdoc.unesco.org/ark:/48223/pf0000381137"
        },
        {
          "apa": "Noy, S., & Zhang, W. (2023). Experimental evidence on the productivity effects of generative artificial intelligence. Science, 381(6654), 187–192. https://doi.org/10.1126/science.adh2586",
          "url": "https://doi.org/10.1126/science.adh2586"
        },
        {
          "apa": "Brynjolfsson, E., Li, D., & Raymond, L. R. (2023). Generative AI at work (NBER Working Paper No. 31161). National Bureau of Economic Research. https://doi.org/10.3386/w31161",
          "url": "https://doi.org/10.3386/w31161"
        }
      ],
      "moduleId": "m2",
      "moduleNumber": "02",
      "moduleTitle": "Marco VALOR"
    },
    {
      "id": "m2-l2",
      "title": "Cuándo no conviene usar IA",
      "duration": "12 min",
      "objective": "Reconocer señales para detener o rediseñar.",
      "scenario": "El equipo tarda más revisando errores del resumen automático que preparando el resumen manual.",
      "content": [
        "Usar IA no es un fin. Si revisar cuesta más que producir, el error es difícil de detectar o el impacto es desproporcionado, el flujo debe rediseñarse.",
        "Un piloto responsable también puede concluir que la herramienta no agrega valor."
      ],
      "keypoints": [
        "El costo de verificación forma parte del costo total.",
        "No toda automatización reduce trabajo.",
        "Decidir no usar una herramienta puede ser una conclusión válida."
      ],
      "activity": {
        "type": "decision",
        "prompt": "¿Qué decisión corresponde?",
        "options": [
          {
            "text": "Mantener el flujo para justificar la inversión.",
            "feedback": "El costo hundido no demuestra valor."
          },
          {
            "text": "Medir producción y revisión, y rediseñar o detener si no hay beneficio neto.",
            "correct": true,
            "feedback": "La decisión se sostiene en evidencia."
          },
          {
            "text": "Eliminar la revisión para recuperar tiempo.",
            "feedback": "Esto oculta costos y aumenta riesgo."
          }
        ]
      },
      "references": [
        "Noy, S., & Zhang, W. (2023). Experimental evidence on the productivity effects of generative artificial intelligence. Science, 381(6654), 187–192. https://doi.org/10.1126/science.adh2586",
        "Brynjolfsson, E., Li, D., & Raymond, L. R. (2025). Generative AI at work. The Quarterly Journal of Economics, 140(2), 889–942. https://doi.org/10.1093/qje/qjae044"
      ],
      "moduleId": "m2",
      "moduleNumber": "02",
      "moduleTitle": "Marco VALOR"
    },
    {
      "id": "m3-l1",
      "title": "CLARO: instrucciones revisables",
      "duration": "20 min",
      "objective": "Construir instrucciones con objetivo, límites y criterios de calidad.",
      "scenario": "“Hazme un correo profesional” produce un texto genérico y agrega compromisos no autorizados.",
      "content": [
        "CLARO es un marco original de Núcleo Vivo: Contexto permitido, Labor o tarea, Audiencia, Reglas y límites, y Output o formato.",
        "Una instrucción útil puede trabajar con categorías y datos sintéticos sin revelar información confidencial."
      ],
      "keypoints": [
        "Contexto suficiente no significa ilimitado.",
        "Los límites reducen compromisos inventados.",
        "Un formato esperado facilita la revisión humana."
      ],
      "activity": {
        "type": "reflection",
        "prompt": "Redacta una instrucción CLARO para un correo ficticio e incluye: “No inventes datos ni condiciones”."
      },
      "references": [
        "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1",
        "Zhang, A., & Lee, M. K. (2025). Knowledge workers’ perspectives on AI training for responsible AI use. In Proceedings of the 2025 CHI Conference on Human Factors in Computing Systems (pp. 1–18). Association for Computing Machinery. https://doi.org/10.1145/3706598.3714100"
      ],
      "moduleId": "m3",
      "moduleNumber": "03",
      "moduleTitle": "Marco CLARO"
    },
    {
      "id": "m3-l2",
      "title": "Alternativas, no una respuesta única",
      "duration": "14 min",
      "objective": "Usar IA para ampliar opciones sin homogeneizar el criterio.",
      "scenario": "Todo el equipo usa el mismo prompt y las propuestas comienzan a parecerse.",
      "content": [
        "La IA puede aumentar creatividad individual, pero patrones similares pueden reducir diversidad colectiva.",
        "Conviene pedir alternativas con supuestos distintos y compararlas mediante criterios explícitos."
      ],
      "keypoints": [
        "Más contenido no equivale a mayor diversidad.",
        "Los supuestos deben hacerse visibles.",
        "La selección final necesita criterio contextual."
      ],
      "activity": {
        "type": "decision",
        "prompt": "¿Qué protege mejor la diversidad?",
        "options": [
          {
            "text": "Aceptar la primera respuesta bien redactada.",
            "feedback": "La primera respuesta puede anclar al equipo."
          },
          {
            "text": "Pedir alternativas con supuestos distintos y compararlas con criterios explícitos.",
            "correct": true,
            "feedback": "Amplía opciones sin delegar la elección."
          },
          {
            "text": "Usar siempre el mismo prompt institucional.",
            "feedback": "La consistencia debe permitir contexto y contraste."
          }
        ]
      },
      "references": [
        "Doshi, A. R., & Hauser, O. P. (2024). Generative AI enhances individual creativity but reduces the collective diversity of novel content. Science Advances, 10(28), eadn5290. https://doi.org/10.1126/sciadv.adn5290",
        "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1"
      ],
      "moduleId": "m3",
      "moduleNumber": "03",
      "moduleTitle": "Marco CLARO"
    },
    {
      "id": "m4-l1",
      "title": "VERIFICA: auditoría cotidiana",
      "duration": "22 min",
      "objective": "Aplicar un control proporcional al impacto.",
      "scenario": "La IA cita una fuente real, pero le atribuye una conclusión inexistente.",
      "content": [
        "VERIFICA revisa Vigencia, Evidencia, Riesgo, Integridad, Fuente, Impacto, Coherencia y Aprobación.",
        "No todas las salidas requieren el mismo control: una lluvia de ideas no tiene el mismo impacto que una comunicación contractual."
      ],
      "keypoints": [
        "Vigencia y versión.",
        "Evidencia verificable.",
        "Riesgo e impacto del error.",
        "Correspondencia real con las fuentes.",
        "Aprobación por responsable autorizado."
      ],
      "activity": {
        "type": "reflection",
        "prompt": "Elige una respuesta ficticia y explica qué elementos de VERIFICA aplicarías."
      },
      "references": [
        "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1",
        "Organisation for Economic Co-operation and Development. (2024). OECD AI Principles. https://oecd.ai/en/ai-principles"
      ],
      "moduleId": "m4",
      "moduleNumber": "04",
      "moduleTitle": "Marco VERIFICA"
    },
    {
      "id": "m4-l2",
      "title": "Escalar la revisión",
      "duration": "12 min",
      "objective": "Diferenciar controles livianos, reforzados y especializados.",
      "scenario": "Un texto de ideas y una carta de despido usan el mismo flujo de revisión.",
      "content": [
        "El control debe ser proporcional. En materias legales, financieras o relacionadas con personas se requiere validación especializada.",
        "Cuando nadie puede verificar competentemente una salida, no debe utilizarse."
      ],
      "keypoints": [
        "El impacto define la profundidad del control.",
        "No saber verificar es una señal para detenerse.",
        "La aprobación debe ser real."
      ],
      "activity": {
        "type": "decision",
        "prompt": "¿Qué documento exige control reforzado?",
        "options": [
          {
            "text": "Lista de nombres ficticios para una actividad.",
            "feedback": "Es reversible y de bajo impacto."
          },
          {
            "text": "Carta laboral con efectos jurídicos y personales.",
            "correct": true,
            "feedback": "Requiere revisión competente y autorización formal."
          },
          {
            "text": "Ideas para el título de una reunión.",
            "feedback": "El impacto es bajo y reversible."
          }
        ]
      },
      "references": [
        "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1",
        "Organisation for Economic Co-operation and Development. (2024). OECD AI Principles. https://oecd.ai/en/ai-principles"
      ],
      "moduleId": "m4",
      "moduleNumber": "04",
      "moduleTitle": "Marco VERIFICA"
    },
    {
      "id": "m5-l1",
      "title": "Datos que no deben copiarse sin autorización",
      "duration": "22 min",
      "objective": "Clasificar información antes de ingresarla en una herramienta.",
      "scenario": "Una persona quiere resumir evaluaciones con nombres, salud y remuneraciones en una plataforma pública.",
      "content": [
        "Antes de usar una herramienta deben conocerse condiciones, aprobación organizacional y finalidad. Los datos personales, sensibles y estratégicos requieren controles específicos.",
        "La Ley N.º 21.719 fue publicada y su entrada en vigor general está fijada para el 1 de diciembre de 2026. El curso distingue ese hito de la normativa hoy vigente.",
        "Las prácticas usan datos sintéticos y nunca solicitan pegar documentos reales."
      ],
      "keypoints": [
        "Minimizar: usar solo lo necesario.",
        "Sustituir: trabajar con datos ficticios.",
        "Autorizar: usar herramientas y finalidades aprobadas.",
        "Eliminar: no conservar más tiempo del necesario."
      ],
      "activity": {
        "type": "decision",
        "prompt": "¿Qué alternativa es más responsable?",
        "options": [
          {
            "text": "Pegar el archivo completo porque la tarea es interna.",
            "feedback": "La finalidad laboral no autoriza cualquier plataforma ni dato."
          },
          {
            "text": "Usar un caso sintético, omitir identificadores y confirmar la herramienta aprobada.",
            "correct": true,
            "feedback": "Reduce exposición y permite practicar."
          },
          {
            "text": "Cambiar solo los nombres y conservar los demás detalles.",
            "feedback": "La combinación de detalles puede seguir identificando personas."
          }
        ]
      },
      "references": [
        "Biblioteca del Congreso Nacional de Chile. (2024). Ley N.º 21.719: Regula la protección y el tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales. https://www.bcn.cl/leychile/navegar?idNorma=1209272",
        "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1"
      ],
      "moduleId": "m5",
      "moduleNumber": "05",
      "moduleTitle": "Datos, privacidad y autoría"
    },
    {
      "id": "m5-l2",
      "title": "Citar no significa tener licencia",
      "duration": "16 min",
      "objective": "Distinguir atribución, cita breve, licencia y autorización.",
      "scenario": "Un equipo quiere copiar una figura completa de un paper en un curso comercial porque agregó APA 7.",
      "content": [
        "APA 7 permite atribuir ideas y dar trazabilidad, pero no concede por sí sola derecho de reproducción.",
        "La Ley N.º 17.336 contempla citas breves bajo condiciones; no autoriza ensamblar un curso comercial con figuras, capítulos o videos ajenos.",
        "Los textos de esta experiencia son originales y las fuentes se usan mediante paráfrasis atribuidas."
      ],
      "keypoints": [
        "Atribuir no reemplaza una licencia.",
        "Figuras y tablas pueden tener protección propia.",
        "Creative Commons exige revisar cada condición.",
        "Voces, rostros, marcas y capturas también deben evaluarse."
      ],
      "activity": {
        "type": "decision",
        "prompt": "¿Qué acción corresponde?",
        "options": [
          {
            "text": "Copiar la figura completa y agregar APA 7.",
            "feedback": "La atribución no concede permiso de reproducción."
          },
          {
            "text": "Crear un diagrama original, citar las ideas y no replicar la expresión protegida.",
            "correct": true,
            "feedback": "Combina creación propia y atribución."
          },
          {
            "text": "Quitar el nombre del autor.",
            "feedback": "Agrava la falta de atribución y no resuelve la licencia."
          }
        ]
      },
      "references": [
        "Biblioteca del Congreso Nacional de Chile. (1970). Ley N.º 17.336 sobre propiedad intelectual. https://www.bcn.cl/leychile/navegar?idNorma=28933",
        "United Nations Educational, Scientific and Cultural Organization. (2021). Recommendation on the ethics of artificial intelligence. https://unesdoc.unesco.org/ark:/48223/pf0000381137"
      ],
      "moduleId": "m5",
      "moduleNumber": "05",
      "moduleTitle": "Datos, privacidad y autoría"
    },
    {
      "id": "m6-l1",
      "title": "DETENER una solicitud sospechosa",
      "duration": "20 min",
      "objective": "Responder ante urgencia, suplantación y cambios de pago.",
      "scenario": "Llega un audio que parece ser de gerencia. Pide cambiar la cuenta bancaria de un proveedor y mantenerlo confidencial.",
      "content": [
        "DETENER significa: Detener la acción, Examinar señales, Triangular por otro canal, Escalar, No compartir ni transferir, Evidenciar sin difundir y Reportar.",
        "La IA facilita mensajes convincentes; la respuesta segura depende de hábitos y procedimientos verificables."
      ],
      "keypoints": [
        "Urgencia y secreto son señales de alerta.",
        "Verificar por un canal independiente.",
        "No usar contactos entregados en el mensaje sospechoso.",
        "Preservar evidencia sin difundirla."
      ],
      "activity": {
        "type": "decision",
        "prompt": "¿Cuál es el primer paso?",
        "options": [
          {
            "text": "Transferir y verificar después.",
            "feedback": "El daño puede ser irreversible."
          },
          {
            "text": "Responder al mismo audio preguntando si es real.",
            "feedback": "El canal puede estar comprometido."
          },
          {
            "text": "Detener la operación y verificar por un canal independiente conocido.",
            "correct": true,
            "feedback": "Corta la presión de urgencia."
          }
        ]
      },
      "references": [
        "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1",
        "Organisation for Economic Co-operation and Development. (2024). OECD AI Principles. https://oecd.ai/en/ai-principles"
      ],
      "moduleId": "m6",
      "moduleNumber": "06",
      "moduleTitle": "Marco DETENER"
    },
    {
      "id": "m6-l2",
      "title": "Aprender del incidente sin culpabilizar",
      "duration": "14 min",
      "objective": "Transformar un error en mejora del sistema.",
      "scenario": "Una persona abrió un archivo sospechoso y teme reportarlo porque podría ser sancionada.",
      "content": [
        "Una cultura punitiva retrasa reportes y aumenta daño. El protocolo debe facilitar aviso temprano, contención, soporte y aprendizaje.",
        "La organización debe revisar por qué el engaño fue plausible y qué controles faltaron."
      ],
      "keypoints": [
        "Reportar temprano reduce impacto.",
        "La investigación revisa sistema y contexto, no solo conducta individual.",
        "El aprendizaje debe volver a políticas y formación."
      ],
      "activity": {
        "type": "reflection",
        "prompt": "Redacta un mensaje institucional que invite a reportar sin culpabilizar."
      },
      "references": [
        "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1",
        "Martin, F., Wu, T., Wan, L., & Xie, K. (2022). A meta-analysis on the Community of Inquiry presences and learning outcomes in online and blended learning environments. Online Learning, 26(1). https://doi.org/10.24059/olj.v26i1.2604"
      ],
      "moduleId": "m6",
      "moduleNumber": "06",
      "moduleTitle": "Marco DETENER"
    },
    {
      "id": "m7-l1",
      "title": "Cuando una recomendación afecta a personas",
      "duration": "20 min",
      "objective": "Identificar sesgo, opacidad y automatización de alto impacto.",
      "scenario": "Un sistema favorece a personas con más tiempo disponible y excluye a quienes cuidan a terceros.",
      "content": [
        "Los datos reflejan condiciones históricas. Una recomendación puede reproducir desigualdades aunque no use explícitamente categorías sensibles.",
        "La supervisión humana debe ser competente, informada y con autoridad real para cambiar la decisión."
      ],
      "keypoints": [
        "Medir impactos por grupos puede revelar exclusión.",
        "Confirmar automáticamente no es supervisar.",
        "Deben existir vías para cuestionar y corregir."
      ],
      "activity": {
        "type": "decision",
        "prompt": "¿Qué respuesta es más adecuada?",
        "options": [
          {
            "text": "Aceptar porque no usa categorías sensibles.",
            "feedback": "Los efectos indirectos también pueden excluir."
          },
          {
            "text": "Auditar criterios e impactos, revisar humanamente y ofrecer apelación.",
            "correct": true,
            "feedback": "Aborda proceso, resultado y corrección."
          },
          {
            "text": "Ocultar el uso del sistema.",
            "feedback": "La opacidad debilita confianza y control."
          }
        ]
      },
      "references": [
        "United Nations Educational, Scientific and Cultural Organization. (2021). Recommendation on the ethics of artificial intelligence. https://unesdoc.unesco.org/ark:/48223/pf0000381137",
        "Organisation for Economic Co-operation and Development. (2024). OECD AI Principles. https://oecd.ai/en/ai-principles",
        "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1"
      ],
      "moduleId": "m7",
      "moduleNumber": "07",
      "moduleTitle": "Sesgos y supervisión"
    },
    {
      "id": "m7-l2",
      "title": "Conversar el cambio sin instalar miedo",
      "duration": "15 min",
      "objective": "Comunicar adopción tecnológica con participación y claridad.",
      "scenario": "La empresa anuncia automatización destacando solo ahorro. El equipo interpreta que habrá despidos.",
      "content": [
        "La adopción responsable debe explicar propósito, límites, cambios esperados, aprendizajes y mecanismos de participación.",
        "La incertidumbre no se resuelve con optimismo vacío; se maneja diciendo qué se sabe, qué no y cómo se decidirá."
      ],
      "keypoints": [
        "Explicar propósito y límites.",
        "Crear espacios de preguntas sin represalias.",
        "Vincular productividad con calidad y bienestar.",
        "Incluir a las personas afectadas."
      ],
      "activity": {
        "type": "reflection",
        "prompt": "Escribe una apertura de 100 palabras para presentar un piloto de IA al equipo."
      },
      "references": [
        "Martin, F., Wu, T., Wan, L., & Xie, K. (2022). A meta-analysis on the Community of Inquiry presences and learning outcomes in online and blended learning environments. Online Learning, 26(1). https://doi.org/10.24059/olj.v26i1.2604",
        "Shukla, B., Dash, S., & Kumar, A. (2024). Factors affecting transfer of online training: A systematic literature review and proposed taxonomy. Human Resource Development Quarterly. https://doi.org/10.1002/hrdq.21518",
        "O’Neill, S. (2025). Transfer of workplace e-learning: A systematic literature review. Social Sciences & Humanities Open, 11, 101407. https://doi.org/10.1016/j.ssaho.2025.101407"
      ],
      "moduleId": "m7",
      "moduleNumber": "07",
      "moduleTitle": "Sesgos y supervisión"
    },
    {
      "id": "m8-l1",
      "title": "Diseña tu flujo",
      "duration": "35 min",
      "objective": "Construir un proceso aplicable, medible y seguro.",
      "scenario": "Proyecto Aurora necesita un piloto de bajo riesgo que demuestre valor sin usar información confidencial.",
      "content": [
        "El producto final integra VALOR, CLARO y VERIFICA. DETENER establece señales para suspender el flujo.",
        "Describe el proceso con datos ficticios e incluye responsable, herramienta autorizada, entradas, salidas, revisión e indicador."
      ],
      "keypoints": [
        "Definir qué no se delega.",
        "Medir tiempo total incluido el control.",
        "Registrar errores y mejoras.",
        "Solicitar apoyo organizacional para transferir."
      ],
      "activity": {
        "type": "reflection",
        "prompt": "Construye tu flujo: tarea, valor, datos, instrucción CLARO, control VERIFICA, señal DETENER, responsable e indicador."
      },
      "references": [
        "Shukla, B., Dash, S., & Kumar, A. (2024). Factors affecting transfer of online training: A systematic literature review and proposed taxonomy. Human Resource Development Quarterly. https://doi.org/10.1002/hrdq.21518",
        "O’Neill, S. (2025). Transfer of workplace e-learning: A systematic literature review. Social Sciences & Humanities Open, 11, 101407. https://doi.org/10.1016/j.ssaho.2025.101407",
        "Hemmler, Y. M., & Ifenthaler, D. (2024). Self-regulated learning strategies in continuing education: A systematic review and meta-analysis. Educational Research Review, 45, 100629. https://doi.org/10.1016/j.edurev.2024.100629",
        "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1"
      ],
      "moduleId": "m8",
      "moduleNumber": "08",
      "moduleTitle": "Mi flujo responsable"
    },
    {
      "id": "m8-l2",
      "title": "Plan de transferencia a 30 días",
      "duration": "18 min",
      "objective": "Definir una aplicación realista y una revisión posterior.",
      "scenario": "Aprender no garantiza aplicación. La transferencia necesita tiempo, apoyo, herramientas y acuerdos.",
      "content": [
        "El plan especifica acción, responsable, apoyo, fecha de revisión y señal de éxito. También reconoce barreras del sistema.",
        "La certificación de dominio requiere evidencia revisable y mejora posterior a retroalimentación."
      ],
      "keypoints": [
        "Una acción concreta supera una intención genérica.",
        "La barrera puede estar en el entorno.",
        "La revisión a 30 días permite ajustar."
      ],
      "activity": {
        "type": "reflection",
        "prompt": "Define una acción de 30 días, apoyo, responsable, fecha y señal observable de éxito."
      },
      "references": [
        "O’Neill, S. (2025). Transfer of workplace e-learning: A systematic literature review. Social Sciences & Humanities Open, 11, 101407. https://doi.org/10.1016/j.ssaho.2025.101407",
        "Shukla, B., Dash, S., & Kumar, A. (2024). Factors affecting transfer of online training: A systematic literature review and proposed taxonomy. Human Resource Development Quarterly. https://doi.org/10.1002/hrdq.21518",
        "Hemmler, Y. M., & Ifenthaler, D. (2024). Self-regulated learning strategies in continuing education: A systematic review and meta-analysis. Educational Research Review, 45, 100629. https://doi.org/10.1016/j.edurev.2024.100629"
      ],
      "moduleId": "m8",
      "moduleNumber": "08",
      "moduleTitle": "Mi flujo responsable"
    },
    {
      "id": "m8-l3",
      "title": "Cierre y compromiso de criterio",
      "duration": "10 min",
      "objective": "Recuperar las decisiones centrales sin revisar el material.",
      "scenario": "Vuelve a la primera regla que formulaste y compárala con lo que ahora sabes.",
      "content": [
        "El criterio se demuestra al reconocer valor y límite al mismo tiempo. Una persona competente sabe usar, verificar, detenerse y pedir revisión especializada.",
        "Los refuerzos aparecerán en los días 3, 8, 16 y 28 en contextos nuevos."
      ],
      "keypoints": [
        "IA como apoyo; responsabilidad humana como principio.",
        "Datos mínimos y ficticios.",
        "Control proporcional al impacto.",
        "Dominio exige evidencia, no consumo."
      ],
      "activity": {
        "type": "decision",
        "prompt": "¿Cuál resume mejor el curso?",
        "options": [
          {
            "text": "Usar IA siempre que reduzca tiempo.",
            "feedback": "El tiempo no es el único criterio."
          },
          {
            "text": "Usar IA cuando exista valor, datos controlados, revisión y responsabilidad definida.",
            "correct": true,
            "feedback": "Integra productividad, seguridad y criterio."
          },
          {
            "text": "Evitar IA solo en decisiones laborales.",
            "feedback": "Todas las tareas requieren controles proporcionales."
          }
        ]
      },
      "references": [
        "Trumble, E., Lodge, J., Mandrusiak, A., & Forbes, R. (2024). Systematic review of distributed practice and retrieval practice in health professions education. Advances in Health Sciences Education, 29(2), 689–714. https://doi.org/10.1007/s10459-023-10274-3",
        "Mawson, K. B., & Kang, S. H. K. (2025). The distributed practice effect on classroom learning: A meta-analytic review of applied research. Behavioral Sciences, 15(6), 771. https://doi.org/10.3390/bs15060771",
        "Autio, C., Schwartz, R., Dunietz, J., Jain, S., Stanley, M., Tabassi, E., Hall, P., & Roberts, K. (2024). Artificial intelligence risk management framework: Generative artificial intelligence profile (NIST AI 600-1). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1",
        "Zhang, A., & Lee, M. K. (2025). Knowledge workers’ perspectives on AI training for responsible AI use. In Proceedings of the 2025 CHI Conference on Human Factors in Computing Systems (pp. 1–18). Association for Computing Machinery. https://doi.org/10.1145/3706598.3714100"
      ],
      "moduleId": "m8",
      "moduleNumber": "08",
      "moduleTitle": "Mi flujo responsable"
    }
  ]
};
