(function(){
  const normalize=(s='')=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const SOURCES={
    feedback:[
      {id:'hattie-timperley-2007',label:'Hattie & Timperley (2007)',use:'Retroalimentación organizada en meta, progreso y próximo paso.'},
      {id:'deliberate-practice',label:'Práctica deliberada y aprendizaje para el dominio',use:'Repetición con estándar explícito, evidencia y nueva meta.'}
    ],
    ai:[
      {id:'nist-ai-rmf',label:'NIST AI RMF 1.0',use:'Gobernar, mapear, medir y gestionar riesgos durante el ciclo de vida.'},
      {id:'nist-genai-profile',label:'NIST AI 600-1',use:'Controles adicionales para IA generativa, validación, trazabilidad y supervisión.'}
    ],
    finance:[{id:'working-capital',label:'Finanzas corporativas y capital de trabajo',use:'Liquidez, ciclo de efectivo, margen, riesgo y valor incremental.'}],
    people:[{id:'job-demands-resources',label:'Demandas y recursos laborales',use:'La intervención debe abordar carga, recursos, autonomía, coordinación y participación.'}],
    pricing:[{id:'pricing-analytics',label:'Pricing y margen de contribución',use:'Separar volumen, precio, mix, costo de servir y rentabilidad por segmento.'}],
    economics:[{id:'exchange-rate-pass-through',label:'Traspaso cambiario y exposición',use:'El impacto depende de moneda, contratos, insumos, competencia y elasticidad.'}]
  };
  const TRANSVERSAL=[
    {id:'diagnosis',label:'Diagnóstico',weight:.15,terms:['causa','problema','sintoma','consecuencia','hipotesis']},
    {id:'investigation',label:'Investigación',weight:.12,terms:['documento','entrevista','dato','contrastar','evidencia']},
    {id:'quantitative',label:'Análisis cuantitativo',weight:.15,terms:['margen','liquidez','dias','flujo','costo','tasa','van','indicador','escenario','porcentaje']},
    {id:'evidence',label:'Uso de evidencia',weight:.14,terms:['segun','muestra','aumento','disminuyo','paso de','porcentaje','$']},
    {id:'strategy',label:'Decisión estratégica',weight:.15,terms:['priorizar','fase','plan','objetivo','viable','secuencia']},
    {id:'risk',label:'Gestión de riesgos',weight:.11,terms:['riesgo','mitigar','detener','contingencia','umbral','piloto']},
    {id:'people',label:'Personas y stakeholders',weight:.09,terms:['personas','trabajadores','clientes','supervision','capacitacion','participacion']},
    {id:'communication',label:'Comunicación ejecutiva',weight:.09,terms:['diagnostico','recomendacion','indicador','meta','plazo']}
  ];
  const rule=(concepts,facts,errors,nextPractice,sourceGroups=[])=>({requiredConcepts:concepts,facts,criticalErrors:errors,nextPractice,sourceGroups});
  const CASE_RULES={
    'vender-mas-ganar-menos':rule(
      ['ventas no equivalen a caja','cuentas por cobrar','inventario','margen','capacidad operativa'],
      [{id:'cash',label:'Caída de caja',patterns:['126','42'],mode:'all',feedback:'Relacionaste la caída de caja de $126 MM a $42 MM con el crecimiento.'},{id:'collection',label:'Días de cobro',patterns:['48','74'],mode:'all',feedback:'Usaste el aumento de 48 a 74 días de cobro.'},{id:'margin',label:'Deterioro de margen',patterns:['27,5','20,8'],mode:'all',feedback:'Incorporaste el deterioro del margen bruto de 27,5% a 20,8%.'},{id:'service',label:'Servicio',patterns:['92','76'],mode:'all',feedback:'Conectaste el deterioro de entregas a tiempo de 92% a 76%.'}],
      [{patterns:['solo credito','unicamente credito','pedir credito y nada mas'],message:'El crédito por sí solo trata el síntoma y puede elevar el riesgo financiero.'},{patterns:['vender mas solucionara','aumentar ventas solucionara'],message:'Más ventas pueden agravar caja, inventario y descuentos.'}],
      'Construye un plan de 90 días que combine cobranza, inventario, margen y capacidad operacional con metas explícitas.',['finance']),
    'automatizar-o-no':rule(
      ['problema de negocio','calidad de datos','piloto','supervisión humana','gobernanza','métrica de valor'],
      [{label:'Calidad de datos',patterns:['datos','calidad'],mode:'all',feedback:'Verificaste la calidad de datos antes de automatizar.'},{label:'Piloto delimitado',patterns:['piloto','prueba'],feedback:'Propusiste una implementación acotada y reversible.'},{label:'Supervisión humana',patterns:['supervision humana','revision humana','derivacion'],feedback:'Incluiste revisión humana o tratamiento de excepciones.'},{label:'Criterio de detención',patterns:['detener','suspender','umbral','revertir'],feedback:'Definiste una condición para detener o revertir el sistema.'}],
      [{patterns:['automatizar todo','automatizacion total','sin intervencion humana'],message:'La automatización total sin revisión de excepciones incrementa el riesgo operativo.'},{patterns:['responsabilidad del proveedor'],message:'La organización no puede delegar completamente su responsabilidad al proveedor.'},{patterns:['porque es innovador','porque la competencia'],message:'La presión competitiva no sustituye un caso de negocio.'}],
      'Diseña un piloto de cuatro semanas con alcance, responsable, datos mínimos, revisión humana, métricas y criterio de suspensión.',['ai']),
    'personas-al-limite':rule(
      ['carga de trabajo','turnos','coordinación','participación','recursos','liderazgo'],
      [{label:'Carga objetiva',patterns:['horas extra','turnos','sobrecarga'],feedback:'Abordaste la carga de trabajo como una condición organizacional.'},{label:'Rediseño del trabajo',patterns:['redistribuir','redisenar','dotacion','proceso'],feedback:'Propusiste modificar la organización del trabajo.'},{label:'Participación',patterns:['participacion','trabajadores','equipo'],feedback:'Incluiste participación del equipo en el rediseño.'},{label:'Seguimiento',patterns:['licencias','rotacion','horas extra','clima'],feedback:'Definiste indicadores de seguimiento humano y operacional.'}],
      [{patterns:['solo taller','un taller de autocuidado','charla de autocuidado'],message:'Una intervención individual aislada no corrige la sobrecarga estructural.'},{patterns:['despedir a los que no rindan'],message:'La respuesta atribuye el problema a individuos sin analizar condiciones de trabajo.'}],
      'Rediseña una semana operativa con carga máxima, cobertura, participación del equipo e indicadores de recuperación.',['people']),
    'directorio-exige-ia':rule(
      ['madurez digital','gobernanza','caso de uso','responsable','riesgos','portafolio'],
      [{label:'Madurez',patterns:['madurez','preparacion'],feedback:'Evaluaste preparación organizacional antes de escalar IA.'},{label:'Gobernanza',patterns:['gobernanza','responsable','comite'],feedback:'Definiste responsabilidades y gobernanza.'},{label:'Portafolio priorizado',patterns:['priorizar','portafolio','caso de uso'],feedback:'Priorizaste casos de uso por valor y riesgo.'},{label:'Monitoreo',patterns:['monitoreo','incidente','auditoria','detener'],feedback:'Incluiste seguimiento y respuesta a incidentes.'}],
      [{patterns:['implementar en toda la empresa','ia en todas las areas'],message:'Escalar sin madurez ni pruebas impide aprender y controlar riesgos.'},{patterns:['el proveedor responde'],message:'La responsabilidad institucional permanece en la organización usuaria.'}],
      'Presenta un portafolio de IA con tres casos priorizados, dueño, riesgo, métrica, puerta de avance y condición de suspensión.',['ai']),
    'expandirse-o-consolidar':rule(
      ['flujos incrementales','van','punto de equilibrio','capital de trabajo','escenarios','capacidad'],
      [{label:'Valor incremental',patterns:['incremental','van','flujo'],feedback:'Evaluaste la expansión mediante flujos incrementales y valor.'},{label:'Escenarios',patterns:['escenario','sensibilidad','pesimista'],feedback:'Consideraste incertidumbre mediante escenarios.'},{label:'Capacidad',patterns:['capacidad','talento','operacion'],feedback:'Relacionaste la inversión con la capacidad de ejecución.'},{label:'Condición de avance',patterns:['hito','condicion','etapa','fase'],feedback:'Planteaste una expansión condicionada a hitos.'}],
      [{patterns:['abrir todos los locales','expandirse de inmediato sin'],message:'La expansión simultánea concentra riesgo financiero y operacional.'},{patterns:['las ventas proyectadas garantizan'],message:'Las proyecciones no garantizan demanda ni ejecución.'}],
      'Recalcula la decisión con escenario base, pesimista y optimista, incorporando capital de trabajo y un hito de salida.',['finance']),
    'precio-destruyo-margen':rule(
      ['margen de contribución','elasticidad','segmentación','costo de servir','canal','cohortes'],
      [{label:'Margen',patterns:['margen','contribucion'],feedback:'Analizaste margen y no solo volumen.'},{label:'Segmentación',patterns:['segmento','cliente','cohorte'],feedback:'Diferenciaste el efecto por cliente o segmento.'},{label:'Costo de servir',patterns:['costo de servir','logistica','devolucion'],feedback:'Incluiste costos comerciales y operacionales.'},{label:'Prueba de precio',patterns:['prueba','test','piloto','elasticidad'],feedback:'Propusiste aprender antes de generalizar el precio.'}],
      [{patterns:['descuento para todos','mantener 30% para todos'],message:'Un descuento generalizado destruye información de disposición a pagar y margen.'},{patterns:['mas volumen siempre'],message:'El volumen adicional no necesariamente compensa la pérdida de contribución.'}],
      'Diseña una prueba de precio por segmento con grupo de comparación, margen neto y criterio para detener la promoción.',['pricing']),
    'dolar-cambia-reglas':rule(
      ['exposición cambiaria','pass-through','elasticidad','proveedores','cobertura','escenarios'],
      [{label:'Exposición',patterns:['exposicion','dolar','moneda'],feedback:'Cuantificaste la exposición cambiaria.'},{label:'Traspaso diferenciado',patterns:['diferenciado','elasticidad','segmento'],feedback:'Evitaste un traspaso uniforme sin considerar demanda.'},{label:'Abastecimiento',patterns:['proveedor','diversificar','renegociar'],feedback:'Incluiste acciones sobre proveedores y contratos.'},{label:'Cobertura',patterns:['cobertura','forward','seguro de cambio'],feedback:'Consideraste instrumentos o políticas de cobertura.'}],
      [{patterns:['subir todos los precios en la misma proporcion','subir todo 10%'],message:'El traspaso uniforme ignora elasticidad, contratos, competencia y contenido importado.'},{patterns:['comprar todo ahora'],message:'Concentrar compras puede trasladar riesgo cambiario a inventario y liquidez.'}],
      'Construye una matriz por producto con exposición, margen, elasticidad, sustitutos y regla de ajuste de precio.',['economics','finance']),
    'ia-vender-sin-perder-personas':rule(
      ['propósito comercial','segmentación','privacidad','sesgo','derivación humana','monitoreo'],
      [{label:'Valor comercial',patterns:['objetivo','conversion','retencion','valor'],feedback:'Definiste un resultado comercial medible.'},{label:'Privacidad',patterns:['privacidad','consentimiento','datos personales'],feedback:'Incluiste resguardos para datos personales.'},{label:'Derivación humana',patterns:['derivacion','persona','ejecutivo humano'],feedback:'Preservaste acceso a atención humana.'},{label:'Equidad y monitoreo',patterns:['sesgo','segmento','monitoreo','reclamo'],feedback:'Propusiste revisar errores y resultados por segmento.'}],
      [{patterns:['ocultar que es un bot','sin informar que es ia'],message:'Ocultar la naturaleza automatizada deteriora transparencia y confianza.'},{patterns:['usar todos los datos disponibles'],message:'La disponibilidad de datos no reemplaza finalidad, minimización y legitimidad.'},{patterns:['rechazar automaticamente'],message:'Las decisiones relevantes requieren revisión, explicación y posibilidad de apelación.'}],
      'Diseña un piloto de asistencia comercial con transparencia, minimización de datos, derivación humana y métricas por segmento.',['ai','pricing'])
  };
  function level(score){return score>=86?'Avanzado':score>=70?'Competente':score>=50?'En desarrollo':'Inicial'}
  function allText(state){const a=state.analysis||{},b=state.board||{};const interviews=Object.values(state.interviews||{}).flat().filter(x=>x.sender==='student').map(x=>x.text||'');return normalize([a.mainProblem,...(a.causes||[]),...(a.evidence||[]),b.diagnosis,b.plan,b.indicators,b.risks,...interviews].join(' '));}
  function scoreDimension(dim,text,state){let hit=dim.terms.filter(t=>text.includes(normalize(t))).length;let base=Math.min(78,hit*15);if(dim.id==='investigation')base=Math.min(100,(state.readDocuments?.length||0)*12+Object.values(state.interviews||{}).filter(ms=>ms.some(m=>m.sender==='student')).length*14);if(dim.id==='evidence')base=Math.min(100,(state.analysis?.evidence?.length||0)*22+hit*8);if(dim.id==='communication')base=Math.min(100,['diagnosis','plan','indicators','risks'].reduce((n,k)=>n+((state.board?.[k]||'').trim().length>45?25:0),0));return Math.round(base);}
  function matchesFact(f,text){const ps=(f.patterns||[]).map(normalize);return f.mode==='all'?ps.every(p=>text.includes(p)):ps.some(p=>text.includes(p));}
  function sourceList(ruleData,caseData){const groups=['feedback',...(ruleData?.sourceGroups||[]),...(caseData.ai&&!ruleData?.sourceGroups?.includes('ai')?['ai']:[])];return groups.flatMap(g=>SOURCES[g]||[]).filter((s,i,a)=>a.findIndex(x=>x.id===s.id)===i);}
  function evaluate(caseData,state,base){const text=allText(state),rules=CASE_RULES[caseData.id];const dimensions=TRANSVERSAL.map(d=>({...d,score:scoreDimension(d,text,state)}));let evidence=[],omissions=[],critical=[];if(rules){for(const f of rules.facts){const ok=matchesFact(f,text);(ok?evidence:omissions).push(ok?f.feedback:`No se observó uso explícito de: ${f.label}.`);}for(const e of rules.criticalErrors){if(e.patterns.some(p=>text.includes(normalize(p))))critical.push(e.message);}}const rubricScore=Math.round(dimensions.reduce((s,d)=>s+d.score*d.weight,0));const penalty=Math.min(36,critical.length*12);const final=Math.max(0,Math.round(base.totalScore*.40+rubricScore*.60-penalty));return {...base,totalScore:final,level:level(final),academic:{rubricScore,dimensions,evidence,omissions,critical,feedforward:rules?.nextPractice||'Repite el caso explicitando supuestos, riesgos, metas y condiciones de ajuste.',sources:sourceList(rules,caseData),rubricVersion:'3.0'}};}
  window.EmpresaVivaAcademic={evaluate,SOURCES,TRANSVERSAL,CASE_RULES};
})();