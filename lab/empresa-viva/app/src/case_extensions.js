(function(){
  const cases=window.EMPRESA_VIVA_CASES||[];
  const stakeholder=(id,name,role,initials,intro,themes,responses,suggested)=>({id,name,role,initials,intro,themes,responses,suggested});
  const additions={
    'vender-mas-ganar-menos':{
      documents:[{id:'clientes-rentabilidad',category:'Comercial',title:'Rentabilidad por cliente y canal',summary:'El 23% de los clientes genera margen negativo después de logística y cobranza.',insight:'El crecimiento está concentrado en cuentas que demandan descuentos, urgencias y plazos extendidos.',rows:[['Clientes con margen negativo','95','23%'],['Costo de servir promedio','$38.400','+29%'],['Ventas urgentes','34%','Alto']]}],
      stakeholders:[stakeholder('claudia','Claudia Herrera','Clienta estratégica','CH','La empresa nos vende más, pero cumple menos. No quiero cambiar de proveedor, aunque necesito certeza.',['servicio','plazos','precios','confianza'],{servicio:'Las entregas completas bajaron y tenemos que reorganizar nuestras tiendas por faltantes.',plazos:'Aceptamos plazos largos, pero también necesitamos fechas de entrega confiables.',precios:'Los descuentos ayudan, aunque la inconsistencia de precios genera reclamos internos.',confianza:'La relación se puede recuperar con compromisos medibles y comunicación temprana.',default:'Puedo hablarte de servicio, plazos, precios o confianza.'},['¿Qué tendría que cambiar para recuperar su confianza?','¿Qué problema le genera mayor costo?'])],
      evidence:['23% de los clientes tiene margen neto negativo.','El costo de servir aumentó 29%.']
    },
    'automatizar-o-no':{
      documents:[{id:'tco-ia',category:'Finanzas',title:'Costo total de propiedad a tres años',summary:'El costo completo duplica la licencia anunciada al incluir integración, datos, supervisión y cambio.',insight:'El retorno depende más del alcance y adopción que de la licencia.',rows:[['Licencias','$288 MM','3 años'],['Integración y datos','$126 MM','−'],['Supervisión y auditoría','$84 MM','−'],['Formación y cambio','$62 MM','−']]}],
      evidence:['Costo total estimado a tres años: $560 MM.','32% de los registros tiene campos incompletos.']
    },
    'personas-al-limite':{
      documents:[
        {id:'demanda-horaria',category:'Operaciones',title:'Demanda por franja y dotación efectiva',summary:'La dotación está desalineada con las horas de mayor carga.',insight:'El problema no es solo cantidad de personas, sino programación y mezcla de experiencia.',rows:[['Punta 18–22 h','41% de pedidos','28% de dotación'],['Personal nuevo','37%','Turno noche'],['Ausentismo viernes','18%','Alto']]},
        {id:'entrevistas-salida',category:'Personas',title:'Entrevistas de salida consolidadas',summary:'La carga, la jefatura y la imprevisibilidad explican la mayoría de las renuncias.',insight:'La compensación aparece después de las condiciones de trabajo.',rows:[['Carga imprevisible','62%','Principal'],['Jefatura inmediata','54%','Alta'],['Remuneración','31%','Media']]}
      ],
      stakeholders:[stakeholder('marcela','Marcela Godoy','Prevencionista de riesgos','MG','Los incidentes no son casuales: se concentran cuando las personas extienden turnos y pierden pausas.',['incidentes','fatiga','pausas','riesgo'],{incidentes:'El 68% ocurrió después de la décima hora de trabajo.',fatiga:'La fatiga se observa en errores de carga, conducción y comunicación.',pausas:'Las pausas existen en papel, pero se omiten cuando la operación se atrasa.',riesgo:'Necesitamos límites de jornada, reemplazos planificados y autorización real para detener tareas inseguras.',default:'Puedo explicarte incidentes, fatiga, pausas o riesgo.'},['¿Qué patrón muestran los incidentes?','¿Qué cambio reduciría el riesgo primero?'])],
      decisions:[{id:'participacion',title:'Mesa de rediseño con trabajadores',cost:15,description:'Probar nuevos turnos, pausas y reglas con participación de quienes ejecutan el trabajo.',tags:['people','governance'],impact:{value:5,people:14,trust:10,risk:8,execution:9}}],
      evidence:['El 68% de los incidentes ocurrió después de la décima hora.','La punta concentra 41% de pedidos con 28% de la dotación.']
    },
    'directorio-exige-ia':{
      documents:[
        {id:'dependencias',category:'Tecnología',title:'Mapa de dependencias y deuda técnica',summary:'Once integraciones críticas no tienen dueño ni documentación actualizada.',insight:'Escalar IA sobre una base frágil amplifica fallas existentes.',rows:[['Integraciones críticas','11','Sin dueño: 7'],['Sistemas legados','9','Alto'],['APIs documentadas','38%','Bajo']]},
        {id:'impacto-regulatorio',category:'Gobernanza',title:'Evaluación preliminar de impacto',summary:'Dos casos de uso podrían afectar seguridad laboral y decisiones sobre personas.',insight:'Requieren mayor revisión, trazabilidad y posibilidad de impugnación.',rows:[['Mantenimiento predictivo','Riesgo medio','Supervisión técnica'],['Selección de personas','Riesgo alto','No priorizar'],['Control visual','Riesgo medio','Privacidad laboral']]}
      ],
      stakeholders:[stakeholder('andres','Andrés Mella','Representante de trabajadores','AM','La gente no se opone a aprender; se opone a que decidan sobre ella sin explicaciones.',['empleo','transparencia','formacion','participacion'],{empleo:'Existe temor porque el directorio habla de eficiencia, pero no de movilidad ni reconversión.',transparencia:'Necesitamos saber qué sistemas se usarán y qué decisiones pueden afectar a una persona.',formacion:'Hay disposición a capacitarse si se reconoce tiempo y se conecta con roles reales.',participacion:'Involucrar a usuarios tempranos ayuda a detectar errores que el proveedor no conoce.',default:'Puedo hablarte de empleo, transparencia, formación o participación.'},['¿Qué condiciones facilitarían la adopción?','¿Qué uso de IA genera mayor preocupación?'])],
      decisions:[{id:'evaluacion-impacto',title:'Evaluación de impacto y registro de sistemas',cost:20,description:'Clasificar riesgos, documentar dueños, datos, usuarios, límites e incidentes.',tags:['governance','risk','human'],impact:{value:3,people:9,trust:14,risk:16,execution:7}}],
      evidence:['Siete integraciones críticas no tienen dueño.','Dos casos de uso podrían afectar decisiones sobre personas.']
    },
    'expandirse-o-consolidar':{
      documents:[
        {id:'flujo-incremental',category:'Finanzas',title:'Flujo de caja incremental de la expansión',summary:'El proyecto es positivo en el escenario base, pero sensible a demanda y capital de trabajo.',insight:'El VAN se vuelve negativo con ventas 14% bajo el plan.',rows:[['Inversión inicial','$420 MM','−'],['VAN escenario base','$78 MM','12% tasa'],['VAN pesimista','−$96 MM','−14% ventas'],['Payback','4,1 años','Base']]},
        {id:'canibalizacion',category:'Marketing',title:'Mapa de canibalización y demanda',summary:'Dos locales capturarían ventas de sucursales existentes.',insight:'La demanda nueva real es menor que la proyección bruta.',rows:[['Ventas proyectadas','$690 MM','Anual'],['Canibalización estimada','$146 MM','21%'],['Demanda incremental','$544 MM','−']]}
      ],
      stakeholders:[stakeholder('ignacia','Ignacia Soto','Gerenta de Personas','IS','Abrir tres locales exige líderes que hoy no tenemos disponibles.',['talento','contratacion','formacion','capacidad'],{talento:'Solo una de las seis jefaturas candidatas está preparada para asumir un local.',contratacion:'El mercado tarda entre 70 y 95 días en cubrir roles críticos.',formacion:'Podemos formar encargados, pero requiere seis meses y acompañamiento.',capacidad:'Una expansión gradual permite aprender sin vaciar los equipos actuales.',default:'Puedo hablarte de talento, contratación, formación o capacidad.'},['¿Tenemos líderes para abrir tres locales?','¿Cuánto tarda formar una jefatura?'])],
      decisions:[{id:'apertura-escalonada',title:'Apertura escalonada con puertas de avance',cost:25,description:'Abrir un local piloto y continuar solo si cumple demanda, margen, servicio y dotación.',tags:['strategy','risk','people'],impact:{value:10,people:8,trust:7,risk:13,execution:12}}],
      evidence:['El VAN se vuelve negativo si las ventas caen 14%.','La canibalización estimada equivale al 21% de ventas proyectadas.']
    },
    'precio-destruyo-margen':{
      documents:[
        {id:'cohortes',category:'Analítica',title:'Cohortes antes y después de la promoción',summary:'La mayoría de los compradores promocionales no repitió sin descuento.',insight:'El volumen adquirido no se convirtió en valor de vida suficiente.',rows:[['Recompra a 90 días','18%','Promoción'],['Recompra base','42%','Sin promoción'],['CAC promocional','$21.800','+36%']]},
        {id:'elasticidad',category:'Marketing',title:'Estimación de elasticidad por segmento',summary:'La respuesta al precio varía fuertemente entre segmentos.',insight:'Un precio uniforme destruye margen en clientes menos sensibles.',rows:[['Conveniencia','−0,6','Baja sensibilidad'],['Precio','−2,1','Alta sensibilidad'],['Premium','−0,3','Muy baja']]}
      ],
      stakeholders:[stakeholder('tomas','Tomás Vera','Analista de datos','TV','El promedio esconde que la campaña funcionó en un segmento y destruyó valor en otros dos.',['cohortes','elasticidad','segmentos','experimento'],{cohortes:'Los clientes captados por promoción repiten menos y cuestan más.',elasticidad:'La sensibilidad al precio no es igual para todos los compradores.',segmentos:'Conveniencia y premium toleran mejor un precio mayor que el segmento precio.',experimento:'Podemos probar precios con grupos comparables y límites de margen.',default:'Puedo mostrarte cohortes, elasticidad, segmentos o diseño experimental.'},['¿Qué segmento respondió realmente?','¿Cómo probarías un nuevo precio?'])],
      decisions:[{id:'arquitectura-precios',title:'Arquitectura de precios por segmento',cost:20,description:'Precio, surtido y beneficios diferenciados según disposición a pagar y costo de servir.',tags:['pricing','data','governance'],impact:{value:13,people:2,trust:6,risk:8,execution:9}}],
      evidence:['La recompra promocional fue 18% versus 42% en la base.','La elasticidad varía entre −0,3 y −2,1 según segmento.']
    },
    'dolar-cambia-reglas':{
      documents:[
        {id:'exposicion-sku',category:'Finanzas',title:'Exposición cambiaria por familia',summary:'La proporción importada y el margen disponible varían considerablemente.',insight:'No corresponde aplicar el mismo ajuste a todo el portafolio.',rows:[['Diagnóstico básico','82% importado','Margen 18%'],['Accesorios','44% importado','Margen 38%'],['Servicio técnico','12% importado','Margen 51%']]},
        {id:'contratos-clientes',category:'Comercial',title:'Contratos y capacidad de traspaso',summary:'El 57% de las ventas está sujeto a listas o contratos con revisión diferida.',insight:'El traspaso inmediato puede incumplir acuerdos o perder licitaciones.',rows:[['Contratos fijos','34%','6 meses'],['Licitaciones','23%','12 meses'],['Venta spot','43%','Ajustable']]}
      ],
      stakeholders:[stakeholder('valentina','Valentina Ruiz','Encargada de licitaciones','VR','No todo precio puede cambiar mañana; varios acuerdos tienen fórmulas y ventanas específicas.',['contratos','licitaciones','clientes','ajustes'],{contratos:'Un tercio de las ventas tiene precio fijo por seis meses.',licitaciones:'Cambiar unilateralmente puede activar multas o excluirnos de procesos futuros.',clientes:'Los hospitales valoran continuidad y previsibilidad, no solo precio bajo.',ajustes:'Podemos usar bandas, sustitución técnica y renegociación documentada.',default:'Puedo hablarte de contratos, licitaciones, clientes o mecanismos de ajuste.'},['¿Qué ventas no pueden reajustarse ahora?','¿Cómo renegociarías sin perder confianza?'])],
      decisions:[{id:'matriz-traspaso',title:'Matriz diferenciada de traspaso y sustitución',cost:15,description:'Ajustes por exposición, elasticidad, contrato, margen y disponibilidad de sustitutos.',tags:['economics','pricing','governance'],impact:{value:12,people:1,trust:9,risk:10,execution:9}}],
      evidence:['57% de las ventas tiene revisión de precio diferida.','La proporción importada varía entre 12% y 82% según familia.']
    },
    'ia-vender-sin-perder-personas':{
      documents:[
        {id:'equidad-modelo',category:'Riesgo',title:'Prueba de desempeño por segmento',summary:'El modelo funciona peor en clientes mayores y en comunas con menor historial digital.',insight:'El promedio global oculta diferencias relevantes de error.',rows:[['Precisión global','86%','−'],['Mayores de 60','68%','Brecha'],['Historial digital bajo','63%','Brecha']]},
        {id:'journey',category:'Clientes',title:'Mapa de experiencia y derivación',summary:'Los clientes valoran rapidez, pero abandonan cuando no pueden llegar a una persona.',insight:'La automatización sin salida humana eleva reclamos y desconfianza.',rows:[['Resolución bot','61%','−'],['Solicita humano','29%','−'],['Abandono sin derivación','22%','Alto']]}
      ],
      evidence:['La precisión cae a 63% en clientes con bajo historial digital.','22% abandona cuando no existe derivación humana.']
    }
  };
  for(const c of cases){const a=additions[c.id];if(!a)continue;for(const k of ['documents','stakeholders','decisions','evidence']){if(a[k])c[k]=[...(c[k]||[]),...a[k]];}}
  window.EMPRESA_VIVA_RELEASE={version:'4.0.0-rc',cases:cases.length,minimums:{documents:6,stakeholders:4,decisions:6,evidence:8}};
})();
