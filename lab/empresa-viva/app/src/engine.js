(function () {
  const normalize = (text='') => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const clamp = (n,min,max) => Math.min(max,Math.max(min,n));

  function getInterviewResponse(stakeholder, question) {
    const q = normalize(question);
    const aliases = {
      caja:'liquidez',cobrar:'cobranza',cobro:'cobranza',credito:'deuda',banco:'deuda',descuento:'descuentos',venta:'metas',
      stock:'inventario',bodega:'capacidad',despacho:'rutas',coordinacion:'coordinacion',ahorro:'ahorro',directorio:'directorio',
      datos:'datos',privacidad:'privacidad',contrato:'proveedor',capacitacion:'capacitacion',trabajo:'empleo',empleo:'empleo',
      automatizar:'procesos',automatizacion:'procesos',supervision:'supervision',humano:'supervision',cliente:'clientes',precio:'precios',
      dolar:'escenarios',cambio:'escenarios',proveedor:'proveedores',rotacion:'rotacion',jefe:'liderazgo',turno:'turnos',
    };
    for (const theme of stakeholder.themes || []) {
      if (q.includes(normalize(theme))) return stakeholder.responses[theme] || stakeholder.responses.default;
    }
    for (const [word,theme] of Object.entries(aliases)) {
      if (q.includes(word) && stakeholder.responses[theme]) return stakeholder.responses[theme];
    }
    return stakeholder.responses.default;
  }

  function calculateOutcome(caseData, state) {
    const selected = caseData.decisions.filter(d => state.selectedDecisions.includes(d.id));
    const totals = selected.reduce((acc,d)=>{
      Object.keys(acc).forEach(k=>{ acc[k] += Number(d.impact[k] || 0); });
      return acc;
    },{value:0,people:0,trust:0,risk:0,execution:0});

    const docsScore = Math.min(100, (state.readDocuments.length / Math.max(1,caseData.documents.length)) * 100);
    const interviewCount = Object.values(state.interviews || {}).filter(messages => (messages || []).some(m=>m.sender==='student')).length;
    const interviewScore = Math.min(100, (interviewCount / Math.min(3,caseData.stakeholders.length)) * 100);
    const investigationScore = Math.round(docsScore * .55 + interviewScore * .45);

    const analysis = state.analysis || {};
    const problemScore = analysis.mainProblem && analysis.mainProblem.trim().length >= 80 ? 100 : analysis.mainProblem && analysis.mainProblem.trim().length >= 35 ? 70 : analysis.mainProblem && analysis.mainProblem.trim().length >= 10 ? 35 : 0;
    const causesScore = Math.min(100, (analysis.causes || []).filter(x=>x && x.trim().length>8).length * 34);
    const evidenceScore = Math.min(100, ((analysis.evidence || []).length / Math.min(4,caseData.evidence.length)) * 100);
    const board = state.board || {};
    const boardFields = ['diagnosis','plan','indicators','risks'];
    const boardScore = Math.round(boardFields.reduce((sum,k)=>sum + ((board[k]||'').trim().length >= 45 ? 25 : (board[k]||'').trim().length >= 15 ? 14 : 0),0));
    const analysisScore = Math.round(problemScore*.25 + causesScore*.2 + evidenceScore*.25 + boardScore*.3);

    const selectedTags = new Set(selected.flatMap(d=>d.tags || []));
    const requiredCoverage = caseData.requiredTags.length ? caseData.requiredTags.filter(t=>selectedTags.has(t)).length / caseData.requiredTags.length : 1;
    let portfolioBase = 55 + (totals.value + totals.people + totals.trust + totals.risk + totals.execution) / 3;
    let conflictPenalty = 0;
    for (const pair of caseData.conflicts || []) if (pair.every(id=>state.selectedDecisions.includes(id))) conflictPenalty += 20;
    let synergyBonus = 0;
    for (const pair of caseData.synergies || []) if (pair.every(id=>state.selectedDecisions.includes(id))) synergyBonus += 7;
    const spent = selected.reduce((s,d)=>s+d.cost,0);
    if (spent > caseData.budget) conflictPenalty += 30;
    if (!selected.length) conflictPenalty += 30;
    const strategyScore = Math.round(clamp(portfolioBase + synergyBonus - conflictPenalty,0,100));
    const governanceScore = Math.round(clamp(requiredCoverage*85 + Math.max(0,totals.risk)*.5 + Math.max(0,totals.people)*.3,0,100));
    const totalScore = Math.round(investigationScore*.22 + analysisScore*.28 + strategyScore*.30 + governanceScore*.20);

    const metrics = {};
    Object.keys(totals).forEach(k=>{ metrics[k] = clamp(50 + totals[k],5,95); });
    const strengths = [];
    const improvements = [];
    if (investigationScore >= 75) strengths.push('Contrastaste documentos y voces antes de decidir.'); else improvements.push('Amplía la investigación antes de cerrar tu recomendación.');
    if (analysisScore >= 70) strengths.push('Vinculaste el diagnóstico con evidencia observable.'); else improvements.push('Formula un problema central más preciso y respáldalo con cifras.');
    if (requiredCoverage >= .75) strengths.push('Tu portafolio cubre los resguardos críticos del caso.'); else improvements.push('Faltan resguardos clave: ' + caseData.requiredTags.filter(t=>!selectedTags.has(t)).join(', ') + '.');
    if (conflictPenalty === 0 && selected.length) strengths.push('Las decisiones son compatibles entre sí.'); else if (conflictPenalty) improvements.push('Revisa decisiones contradictorias o una asignación que excede el presupuesto.');
    if (totals.people >= 8) strengths.push('La propuesta integra explícitamente a las personas.'); else improvements.push('Haz visible cómo se protegerá y preparará a las personas afectadas.');
    if (caseData.ai && totals.risk >= 10) strengths.push('Incorporaste gobernanza y control en el uso de IA.');
    if (caseData.ai && totals.risk < 5) improvements.push('La estrategia de IA requiere más control de datos, supervisión y mecanismos de detención.');

    const baseResult = {
      totals,metrics,spent,investigationScore,analysisScore,strategyScore,governanceScore,totalScore,
      level: totalScore>=86?'Avanzado':totalScore>=70?'Competente':totalScore>=50?'En desarrollo':'Inicial',
      strengths:strengths.slice(0,4),improvements:improvements.slice(0,4),requiredCoverage,
    };
    return window.EmpresaVivaAcademic ? window.EmpresaVivaAcademic.evaluate(caseData,state,baseResult) : baseResult;
  }

  window.EmpresaVivaEngine = { getInterviewResponse, calculateOutcome };
})();
