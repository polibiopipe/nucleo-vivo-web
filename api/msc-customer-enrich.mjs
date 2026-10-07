import { createLimiter, isAllowedOrigin } from '../server/move-assistant.mjs';

const SUPABASE_URL='https://ygfmpwlpmaasooltjujb.supabase.co';
const SUPABASE_KEY='sb_publishable_evFWgAwjv7xcNxo156NV0g_CFq0j5Ld';
const allow=createLimiter();
const MODEL=process.env.MSC_CUSTOMER_LOOKUP_MODEL||'gemini-3.6-flash';

function cleanRut(value=''){return String(value).toUpperCase().replace(/[^0-9K]/g,'')}
function formatRut(value=''){
  const rut=cleanRut(value);if(rut.length<2)return safeText(value,20);
  const dv=rut.slice(-1);let body=rut.slice(0,-1),out='';
  while(body.length>3){out='.'+body.slice(-3)+out;body=body.slice(0,-3)}
  return body+out+'-'+dv;
}
function validRut(value=''){
  const rut=cleanRut(value);if(rut.length<2)return false;
  const body=rut.slice(0,-1),dv=rut.slice(-1);if(!/^\d+$/.test(body))return false;
  let sum=0,m=2;for(let i=body.length-1;i>=0;i--){sum+=Number(body[i])*m;m=m===7?2:m+1}
  const r=11-(sum%11),expected=r===11?'0':r===10?'K':String(r);return dv===expected;
}
function safeText(v,max=240){return typeof v==='string'?v.trim().slice(0,max):''}
function parseJsonText(text=''){
  const raw=String(text).trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  try{return JSON.parse(raw)}catch{}
  const a=raw.indexOf('{'),b=raw.lastIndexOf('}');
  if(a>=0&&b>a){try{return JSON.parse(raw.slice(a,b+1))}catch{}}
  throw Object.assign(new Error('INVALID_AI_RESPONSE'),{statusCode:503});
}
async function authUser(req){
  const bearer=String(req.headers.authorization||'');
  if(!bearer.startsWith('Bearer '))throw Object.assign(new Error('AUTH_REQUIRED'),{statusCode:401});
  const r=await fetch(SUPABASE_URL+'/auth/v1/user',{headers:{apikey:SUPABASE_KEY,Authorization:bearer}});
  const user=await r.json().catch(()=>null);if(!r.ok)throw Object.assign(new Error('AUTH_REQUIRED'),{statusCode:401});
  const role=String(user?.app_metadata?.msc_role||'');
  if(!['admin','ventas','supervisor','bodega'].includes(role))throw Object.assign(new Error('FORBIDDEN'),{statusCode:403});
  return {user,role};
}
function normalizeCompany(x){
  const c=x&&typeof x==='object'?x:{};
  const entityTypes=['company','sole_proprietor','natural_person_business','unknown'];
  const matches=['exact_rut','rut_and_name','name_assisted','partial','none'];
  return {
    found:Boolean(c.found),
    entity_type:entityTypes.includes(c.entity_type)?c.entity_type:'unknown',
    match:matches.includes(c.match)?c.match:'none',
    name:safeText(c.name,180),
    business_activity:safeText(c.business_activity,220),
    address:safeText(c.address,220),
    city:safeText(c.city,120),
    phone:safeText(c.phone,80),
    email:safeText(c.email,160),
    website:safeText(c.website,260),
    note:safeText(c.note,420)
  };
}
async function lookupPublicCustomer(rut,nameHint=''){
  const apiKey=process.env.GEMINI_API_KEY?.trim()||process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if(!apiKey)throw Object.assign(new Error('AI_CONFIGURATION_REQUIRED'),{statusCode:503});
  const compact=cleanRut(rut),pretty=formatRut(rut),hint=safeText(nameHint,180);
  const hintRule=hint
    ? `Como apoyo de desambiguación, el vendedor ingresó el nombre o razón social: "${hint}". Úsalo para ampliar la búsqueda. Si el RUT no aparece indexado textualmente, puedes devolver información COMERCIAL O PROFESIONAL pública que corresponda claramente a ese mismo nombre, marcando match="name_assisted" y explicándolo brevemente en note. No asumas que dos personas con nombres parecidos son la misma.`
    : `No se entregó nombre auxiliar. Prioriza coincidencias del RUT. Si no puedes identificar al contribuyente con seguridad sólo con el RUT, devuelve found=false; la interfaz pedirá nombre o razón social para una segunda búsqueda.`;
  const prompt=`Busca en la web información pública útil para prellenar una ficha de CLIENTE en Chile. El identificador es el RUT ${pretty}; busca también sus variantes ${compact} y ${pretty.replace(/[.-]/g,' ')}.

El contribuyente puede ser una sociedad, EIRL, empresario individual, persona natural con inicio de actividades o profesional independiente. NO lo descartes sólo porque no sea una sociedad.

${hintRule}

REGLAS DE SEGURIDAD Y CALIDAD:
- No inventes, completes por inferencia ni certifiques exactitud.
- Devuelve sólo datos vinculados a actividad comercial/profesional: razón social o nombre, giro/actividad, sitio web, dirección comercial/profesional publicada, comuna/ciudad, teléfono comercial/profesional y correo comercial/profesional.
- No recopiles una dirección residencial, teléfono personal o correo privado sólo porque aparezca en internet. Una dirección sólo se devuelve si la fuente la presenta como comercial, profesional, tributaria, oficina, sucursal, establecimiento o lugar de atención.
- Prioriza fuentes oficiales, sitio institucional/corporativo y directorios empresariales reconocibles. Si un dato no es suficientemente atribuible, déjalo vacío.
- found=true si existe al menos un dato útil atribuible con suficiente confianza. No exijas que todos los campos existan.

Devuelve SOLO JSON válido, sin Markdown, exactamente con esta forma:
{"found":true,"entity_type":"company","match":"exact_rut","name":"","business_activity":"","address":"","city":"","phone":"","email":"","website":"","note":""}

entity_type: company | sole_proprietor | natural_person_business | unknown.
match: exact_rut si la fuente vincula directamente el RUT; rut_and_name si vincula RUT y nombre; name_assisted si la segunda llave nombre permite identificar información pública aunque el RUT no esté visible en esa página; partial si hay evidencia limitada pero utilizable como sugerencia; none si no hay coincidencia.`;
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,{
    method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},signal:AbortSignal.timeout(24000),
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.05,maxOutputTokens:1500}})
  });
  const data=await r.json().catch(()=>null);
  if(!r.ok)throw Object.assign(new Error(r.status===429?'AI_QUOTA_EXCEEDED':'AI_UNAVAILABLE'),{statusCode:r.status===429?429:503});
  const candidate=data?.candidates?.[0];
  const text=(candidate?.content?.parts||[]).filter(p=>typeof p.text==='string').map(p=>p.text).join('');
  const company=normalizeCompany(parseJsonText(text));
  const gm=candidate?.groundingMetadata||{};const seen=new Set();
  const sources=(gm.groundingChunks||[]).flatMap(chunk=>{
    const web=chunk?.web;if(!web?.uri)return[];const uri=String(web.uri).slice(0,1200);if(seen.has(uri))return[];seen.add(uri);
    return [{title:safeText(web.title||'Fuente web',180),url:uri}];
  }).slice(0,8);
  return {company,sources,needs_name_hint:!company.found&&!hint,searchEntryPoint:typeof gm?.searchEntryPoint?.renderedContent==='string'?gm.searchEntryPoint.renderedContent.slice(0,12000):''};
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method==='GET')return res.status(200).json({service:'MSC customer public lookup',configured:Boolean(process.env.GEMINI_API_KEY?.trim()||process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()),model:MODEL,mode:'rut_then_name'});
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'METHOD_NOT_ALLOWED'})}
  if(!isAllowedOrigin(req.headers.origin,process.env.VERCEL_URL)||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});
  if(!String(req.headers['content-type']||'').startsWith('application/json'))return res.status(415).json({error:'JSON_REQUIRED'});
  const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'anonymous').split(',')[0];
  if(!allow(ip)){res.setHeader('Retry-After','60');return res.status(429).json({error:'RATE_LIMIT',message:'Demasiadas consultas seguidas. Intenta nuevamente en un minuto.'})}
  try{
    await authUser(req);
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const rut=safeText(body.rut,20),nameHint=safeText(body.name_hint,180);
    if(!validRut(rut))return res.status(400).json({error:'INVALID_RUT',message:'Revisa el RUT y su dígito verificador.'});
    const result=await lookupPublicCustomer(rut,nameHint);
    return res.status(200).json({...result,rut:formatRut(rut),lookup_mode:nameHint?'rut_name':'rut',notice:'Datos sugeridos desde fuentes públicas. El vendedor debe verificarlos con el cliente antes de guardarlos.',lookedUpAt:new Date().toISOString()});
  }catch(error){
    const status=Number(error.statusCode)||503;
    if(error instanceof SyntaxError)return res.status(400).json({error:'INVALID_JSON'});
    return res.status(status).json({error:error.message||'LOOKUP_UNAVAILABLE',message:status===503?'No fue posible consultar fuentes públicas en este momento.':undefined});
  }
}
