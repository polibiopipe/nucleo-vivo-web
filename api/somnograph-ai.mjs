import { createHash, randomUUID } from 'node:crypto';
import { generateGemini } from '../server/move-gemini.mjs';

const SUPABASE_URL = 'https://ygfmpwlpmaasooltjujb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_evFWgAwjv7xcNxo156NV0g_CFq0j5Ld';
const ALLOWED_EMAILS = new Set([
  'polibio.solis@nucleovivo.net',
  'leyla.llanos@nucleovivo.net',
]);
const MODEL = process.env.SOMNOGRAPH_GEMINI_MODEL || 'gemini-3.8-flash';

const limits = new Map();
function allowRequest(key) {
  const now = Date.now();
  for (const [k, v] of limits) if (now - v.start > 60_000) limits.delete(k);
  const entry = limits.get(key) || { start: now, count: 0 };
  if (entry.count >= 24) return false;
  entry.count += 1;
  limits.set(key, entry);
  return true;
}

function isAllowedOrigin(origin, previewHost) {
  const allowed = new Set([
    'https://www.nucleovivo.net',
    'https://nucleovivo.net',
    'https://nucleo-vivo-web.vercel.app',
  ]);
  if (previewHost && /^[a-z0-9-]+\.vercel\.app$/i.test(previewHost)) allowed.add(`https://${previewHost}`);
  return Boolean(origin && allowed.has(origin));
}

async function authenticate(req) {
  const auth = String(req.headers.authorization || '');
  if (!auth.startsWith('Bearer ') || auth.length > 12000) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return null;
  const user = await response.json().catch(() => null);
  const email = String(user?.email || '').toLowerCase();
  if (!user?.id || !ALLOWED_EMAILS.has(email)) return null;
  return { id: user.id, email };
}

function clamp(value, min = 0, max = 1) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
}
function cleanText(value, max = 400) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}
function safeId(value, fallback) {
  const id = String(value || '').toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  return id || fallback;
}

const analyzeSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    summary: { type: 'string', maxLength: 500 },
    nodes: { type: 'array', minItems: 4, maxItems: 14, items: {
      type: 'object', additionalProperties: false,
      properties: {
        id: { type: 'string', maxLength: 30 },
        label: { type: 'string', maxLength: 70 },
        role: { type: 'string', maxLength: 35 },
        summary: { type: 'string', maxLength: 260 },
        importance: { type: 'number', minimum: 0, maximum: 1 },
      }, required: ['id','label','role','summary','importance'],
    } },
    edges: { type: 'array', minItems: 3, maxItems: 22, items: {
      type: 'object', additionalProperties: false,
      properties: {
        id: { type: 'string', maxLength: 30 },
        source: { type: 'string', maxLength: 30 },
        target: { type: 'string', maxLength: 30 },
        relation: { type: 'string', maxLength: 90 },
        strength: { type: 'number', minimum: 0, maximum: 1 },
        strategicWeight: { type: 'number', minimum: 0, maximum: 1 },
        rationale: { type: 'string', maxLength: 260 },
      }, required: ['id','source','target','relation','strength','strategicWeight','rationale'],
    } },
    interferenceRisks: { type: 'array', maxItems: 4, items: {
      type: 'object', additionalProperties: false,
      properties: {
        edgeId: { type: 'string', maxLength: 30 },
        risk: { type: 'number', minimum: 0, maximum: 1 },
        reason: { type: 'string', maxLength: 260 },
      }, required: ['edgeId','risk','reason'],
    } },
    microtest: { type: 'object', additionalProperties: false,
      properties: {
        question: { type: 'string', maxLength: 420 },
        expectedElements: { type: 'array', minItems: 2, maxItems: 6, items: { type: 'string', maxLength: 120 } },
      }, required: ['question','expectedElements'],
    },
    transfer: { type: 'object', additionalProperties: false,
      properties: {
        prompt: { type: 'string', maxLength: 420 },
        rationale: { type: 'string', maxLength: 260 },
      }, required: ['prompt','rationale'],
    },
  }, required: ['summary','nodes','edges','interferenceRisks','microtest','transfer'],
};

const assessmentSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    score: { type: 'number', minimum: 0, maximum: 100 },
    relationStrength: { type: 'number', minimum: 0, maximum: 1 },
    feedback: { type: 'string', maxLength: 500 },
    observedElements: { type: 'array', maxItems: 6, items: { type: 'string', maxLength: 120 } },
    missingElements: { type: 'array', maxItems: 6, items: { type: 'string', maxLength: 120 } },
  }, required: ['score','relationStrength','feedback','observedElements','missingElements'],
};

const coachSchema = {
  type: 'object', additionalProperties: false,
  properties: { message: { type: 'string', maxLength: 1500 } },
  required: ['message'],
};

function sanitizeGraph(raw) {
  const incomingNodes = Array.isArray(raw?.nodes) ? raw.nodes.slice(0, 18) : [];
  const used = new Set();
  const idMap = new Map();
  const nodes = incomingNodes.flatMap((node, i) => {
    const original = String(node?.id || `n${i+1}`);
    let id = safeId(original, `n${i+1}`);
    let suffix = 2;
    while (used.has(id)) id = `${safeId(original, `n${i+1}`)}-${suffix++}`.slice(0,30);
    used.add(id); idMap.set(original, id);
    const label = cleanText(node?.label, 70);
    if (!label) return [];
    return [{ id, label, role: cleanText(node?.role || 'concepto', 35), summary: cleanText(node?.summary,260), importance: clamp(node?.importance,0,1) }];
  });
  const nodeIds = new Set(nodes.map(n => n.id));
  const edgeIds = new Set();
  const edges = (Array.isArray(raw?.edges) ? raw.edges : []).slice(0,30).flatMap((edge, i) => {
    const source = idMap.get(String(edge?.source)) || safeId(edge?.source,'');
    const target = idMap.get(String(edge?.target)) || safeId(edge?.target,'');
    if (!nodeIds.has(source) || !nodeIds.has(target) || source === target) return [];
    let id = safeId(edge?.id, `e${i+1}`); let suffix=2; while(edgeIds.has(id)) id=`e${i+1}-${suffix++}`; edgeIds.add(id);
    return [{ id, source, target, relation: cleanText(edge?.relation || 'se relaciona con',90), strength: clamp(edge?.strength,.05,1), strategicWeight: clamp(edge?.strategicWeight,.05,1), rationale: cleanText(edge?.rationale,260) }];
  });
  if (nodes.length < 3 || edges.length < 2) throw Object.assign(new Error('MAP_TOO_SPARSE'), { statusCode: 503 });

  const degree = new Map(nodes.map(n=>[n.id,0]));
  edges.forEach(e=>{ degree.set(e.source,(degree.get(e.source)||0)+1); degree.set(e.target,(degree.get(e.target)||0)+1); });
  const maxDegree = Math.max(1,...degree.values());
  const ranked = edges.map(edge => {
    const impact = (((degree.get(edge.source)||0)+(degree.get(edge.target)||0))/2)/maxDegree;
    const opportunity = clamp((1-edge.strength)*.45 + edge.strategicWeight*.35 + impact*.20,0,1);
    return { edge, opportunity, impact };
  }).sort((a,b)=>b.opportunity-a.opportunity);
  const target = ranked[0];
  const control = ranked.slice(1).sort((a,b)=>Math.abs(a.opportunity-target.opportunity)-Math.abs(b.opportunity-target.opportunity))[0] || ranked[1] || target;
  const rawRisks = Array.isArray(raw?.interferenceRisks) ? raw.interferenceRisks : [];
  const interferenceRisks = rawRisks.flatMap(r=>{
    const edgeId=safeId(r?.edgeId,''); if(!edgeIds.has(edgeId)) return [];
    return [{edgeId,risk:clamp(r?.risk,0,1),reason:cleanText(r?.reason,260)}];
  }).slice(0,4);
  const targetEdge = target.edge;
  const targetNodes = nodes.filter(n=>n.id===targetEdge.source||n.id===targetEdge.target).map(n=>n.label);

  return {
    version: '0.4',
    summary: cleanText(raw?.summary,500),
    nodes,
    edges,
    lever: {
      edgeId: targetEdge.id,
      opportunity: target.opportunity,
      reason: cleanText(targetEdge.rationale || `Conecta ${targetNodes.join(' y ')} y combina fragilidad estimada con impacto estructural.`,320),
      basis: 'initial_ai_hypothesis',
    },
    control: { edgeId: control.edge.id, reason: 'Relación comparable reservada como control interno.' },
    interferenceRisks,
    microtest: {
      question: cleanText(raw?.microtest?.question || `Explica con tus palabras cómo se relacionan ${targetNodes.join(' y ')}.`,420),
      expectedElements: (Array.isArray(raw?.microtest?.expectedElements)?raw.microtest.expectedElements:[]).map(x=>cleanText(x,120)).filter(Boolean).slice(0,6),
      edgeId: targetEdge.id,
    },
    transfer: {
      prompt: cleanText(raw?.transfer?.prompt,420),
      rationale: cleanText(raw?.transfer?.rationale,260),
    },
  };
}

function validateAnalyze(body) {
  const title = cleanText(body.title || 'Mapa sin título',90);
  const source = String(body.source || '').trim();
  if (source.length < 120 || source.length > 30000) throw Object.assign(new Error('INVALID_SOURCE'), { statusCode: 400 });
  return { title, source };
}
function validateCoach(body) {
  const message = cleanText(body.message,1200);
  const source = String(body.source || '').slice(0,18000);
  const graph = body.graph && typeof body.graph === 'object' ? body.graph : null;
  if (!message || !graph) throw Object.assign(new Error('INVALID_COACH_INPUT'), { statusCode: 400 });
  return { message, source, graph };
}
function validateAssess(body) {
  const answer = String(body.answer || '').trim().slice(0,4000);
  const question = cleanText(body.question,500);
  const confidence = Math.round(clamp(Number(body.confidence)/100,0,1)*100);
  const graph = body.graph && typeof body.graph === 'object' ? body.graph : null;
  if (answer.length < 12 || !question || !graph) throw Object.assign(new Error('INVALID_ASSESS_INPUT'), { statusCode:400 });
  return { answer, question, confidence, graph };
}

const analysisSystem = `Eres el motor semántico de SomnoGraph, un prototipo de Núcleo Vivo que modela conocimiento como una red de conceptos y relaciones. Tu tarea NO es resumir el documento: identifica la estructura mínima que permite reconstruirlo.

REGLAS:
- Trabaja únicamente con el contenido entregado. No agregues hechos externos ni completes vacíos con conocimiento general.
- Los nodos deben ser conceptos centrales y distinguibles, no frases enteras.
- NO comprimas demasiado: para textos de más de 700 palabras intenta representar entre 9 y 16 conceptos si realmente existen en la fuente. Incluye no sólo el concepto central, sino mecanismos, etapas, fundamentos, límites, criterios, tensiones y consecuencias relevantes.
- Las aristas deben expresar relaciones semánticas explícitas o razonablemente inferibles desde la fuente: causa, condición, contraste, secuencia, función, dependencia, ejemplo, parte-todo, justificación, límite, evidencia, riesgo, etc.
- Busca varias rutas de explicación, no una sola cadena lineal. Un buen mapa debe permitir reconstruir el argumento desde distintos puntos.
- Conserva las distinciones importantes: si dos ideas parecen parecidas pero cumplen funciones distintas, mantenlas separadas y vincúlalas con contraste o condición.
- strength es una HIPÓTESIS INICIAL de claridad/estabilidad de la relación en el material, NO una lectura del cerebro ni una medida del usuario. Usa valores bajos cuando la relación sea compleja, implícita o propensa a confusión; altos cuando sea directa y reiterada.
- strategicWeight estima cuánto conocimiento dependería de comprender bien esa relación.
- interferenceRisks identifica relaciones que podrían confundirse entre sí por compartir conceptos, parecer contradictorias o requerir una distinción fina.
- La microprueba debe evaluar la relación más estructuralmente importante sin pedir repetición literal.
- La prueba de transferencia debe plantear una situación/pregunta NUEVA que exija usar al menos dos relaciones del mapa para inferir una respuesta.
- No hagas afirmaciones clínicas, diagnósticas o neurofisiológicas. No digas que una relación está consolidada en el cerebro.
- Devuelve SOLO JSON válido, sin Markdown ni texto fuera del objeto.
- Usa exactamente esta estructura:
{
  "summary":"...",
  "nodes":[{"id":"n1","label":"...","role":"...","summary":"...","importance":0.8}],
  "edges":[{"id":"e1","source":"n1","target":"n2","relation":"...","strength":0.5,"strategicWeight":0.8,"rationale":"..."}],
  "interferenceRisks":[{"edgeId":"e1","risk":0.4,"reason":"..."}],
  "microtest":{"question":"...","expectedElements":["...","..."]},
  "transfer":{"prompt":"...","rationale":"..."}
}
- Usa entre 7 y 18 nodos y entre 8 y 30 relaciones cuando la fuente tenga suficiente riqueza. Los IDs de aristas deben referir IDs de nodos existentes.`;

const assessSystem = `Eres el evaluador de evidencia de SomnoGraph. Evalúa una respuesta humana a una microprueba usando únicamente el mapa y los elementos esperados entregados. No premies coincidencia de palabras: valora comprensión relacional, coherencia y capacidad de explicar el vínculo. relationStrength es una estimación conductual provisional de la relación específica tras esta evidencia, entre 0 y 1. No la presentes como medida neuronal. Devuelve sólo JSON.`;

const coachSystem = `Eres SomnoGraph Intelligence. Conversas sobre UN mapa de conocimiento privado ya construido. Responde sólo usando el mapa y la fuente incluidos en el mensaje. Explica relaciones, palancas, controles, interferencias y posibles pruebas de transferencia. Diferencia siempre entre hipótesis inicial de IA y evidencia conductual registrada. No inventes papers ni hechos externos y no afirmes leer el cerebro. Responde en español claro, crítico y breve. Devuelve sólo JSON.`;

async function runAnalyze(input) {
  const result = await generateGemini({
    model: MODEL,
    system: analysisSystem,
    messages: [{role:'user',content:`Título: ${input.title}\n\nFUENTE:\n${input.source}`}],
    schema: null,
    maxOutputTokens: 5000,
    abortSignal: AbortSignal.timeout(28_000),
  });
  return { graph: sanitizeGraph(result.output), meta: { model: result.model || MODEL } };
}
async function runAssess(input) {
  const micro = input.graph?.microtest || {};
  const targetEdge = (input.graph?.edges || []).find(e => e.id === micro.edgeId || e.id === input.graph?.lever?.edgeId);
  const compact = {
    targetEdge,
    expectedElements: micro.expectedElements || [],
    nodes: (input.graph?.nodes||[]).filter(n=>!targetEdge || n.id===targetEdge.source || n.id===targetEdge.target),
  };
  const result = await generateGemini({
    model: MODEL,
    system: assessSystem,
    messages: [{role:'user',content:`Pregunta: ${input.question}\nConfianza declarada: ${input.confidence}%\nRespuesta: ${input.answer}\n\nContexto del mapa:\n${JSON.stringify(compact)}`}],
    schema: assessmentSchema,
    maxOutputTokens: 1600,
    abortSignal: AbortSignal.timeout(20_000),
  });
  const out = result.output || {};
  return {
    score: Math.round(clamp(Number(out.score)/100,0,1)*100),
    relationStrength: clamp(out.relationStrength,0,1),
    feedback: cleanText(out.feedback,500),
    observedElements: (Array.isArray(out.observedElements)?out.observedElements:[]).map(x=>cleanText(x,120)).filter(Boolean).slice(0,6),
    missingElements: (Array.isArray(out.missingElements)?out.missingElements:[]).map(x=>cleanText(x,120)).filter(Boolean).slice(0,6),
  };
}
async function runCoach(input) {
  const compactGraph = JSON.stringify(input.graph).slice(0,18000);
  const result = await generateGemini({
    model: MODEL,
    system: coachSystem,
    messages: [{role:'user',content:`MAPA:\n${compactGraph}\n\nFUENTE (puede estar truncada):\n${input.source}\n\nPREGUNTA DEL USUARIO:\n${input.message}`}],
    schema: coachSchema,
    maxOutputTokens: 1800,
    abortSignal: AbortSignal.timeout(20_000),
  });
  return { message: cleanText(result.output?.message,1500) };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','same-origin');
  if (req.method === 'GET') return res.status(200).json({ service:'SomnoGraph Intelligence', version:'0.4', private:true, configured:Boolean(process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) });
  if (req.method !== 'POST') { res.setHeader('Allow','GET, POST'); return res.status(405).json({error:'METHOD_NOT_ALLOWED'}); }
  if (!isAllowedOrigin(req.headers.origin, process.env.VERCEL_URL) || req.headers['sec-fetch-site'] === 'cross-site') return res.status(403).json({error:'ORIGIN_NOT_ALLOWED',message:'Origen no autorizado.'});
  if (!String(req.headers['content-type']||'').startsWith('application/json')) return res.status(415).json({error:'JSON_REQUIRED'});
  if (Number(req.headers['content-length']||0) > 120000) return res.status(413).json({error:'PAYLOAD_TOO_LARGE',message:'El contenido supera el límite de este prototipo.'});

  let user;
  try { user = await authenticate(req); } catch { return res.status(503).json({error:'AUTH_UNAVAILABLE',message:'No pudimos verificar el acceso en este momento.'}); }
  if (!user) return res.status(401).json({error:'UNAUTHORIZED',message:'Esta sesión no está autorizada para SomnoGraph.'});
  const rateKey = createHash('sha256').update(user.id).digest('hex');
  if (!allowRequest(rateKey)) { res.setHeader('Retry-After','60'); return res.status(429).json({error:'RATE_LIMIT',message:'Has realizado varias consultas seguidas. Intenta nuevamente en un minuto.'}); }

  const body = typeof req.body === 'string' ? (()=>{try{return JSON.parse(req.body)}catch{return null}})() : req.body;
  if (!body || typeof body !== 'object') return res.status(400).json({error:'INVALID_INPUT',message:'Solicitud inválida.'});
  const action = String(body.action || '');
  const requestId = randomUUID();
  try {
    let output;
    if (action === 'analyze') output = await runAnalyze(validateAnalyze(body));
    else if (action === 'assess') output = await runAssess(validateAssess(body));
    else if (action === 'coach') output = await runCoach(validateCoach(body));
    else return res.status(400).json({error:'UNKNOWN_ACTION',message:'Acción no reconocida.'});
    console.info(JSON.stringify({event:'somnograph_ai',requestId,action,model:MODEL}));
    return res.status(200).json({...output,requestId});
  } catch (error) {
    const status = Number(error?.statusCode || error?.cause?.statusCode || 503);
    const code = String(error?.code || error?.message || 'AI_UNAVAILABLE');
    console.warn(JSON.stringify({event:'somnograph_ai_error',requestId,action,code:code.slice(0,80),status}));
    if (status === 400 && /^INVALID_/.test(code)) return res.status(400).json({error:'INVALID_INPUT',message:'Revisa el contenido e intenta nuevamente.'});
    if (status === 429) { res.setHeader('Retry-After','60'); return res.status(429).json({error:'AI_QUOTA_EXCEEDED',message:'La IA alcanzó temporalmente su límite de consultas.'}); }
    return res.status(503).json({error:'AI_UNAVAILABLE',message:'La IA no pudo completar este análisis. El contenido está bien; intenta nuevamente en unos segundos.'});
  }
}