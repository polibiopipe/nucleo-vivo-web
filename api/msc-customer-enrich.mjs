import { createLimiter, isAllowedOrigin } from '../server/move-assistant.mjs';

const SUPABASE_URL='https://ygfmpwlpmaasooltjujb.supabase.co';
const SUPABASE_KEY='sb_publishable_evFWgAwjv7xcNxo156NV0g_CFq0j5Ld';
const allow=createLimiter();
const MODEL=process.env.MSC_CUSTOMER_LOOKUP_MODEL||'gemini-3.6-flash';

function cleanRut(value=''){return String(value).toUpperCase().replace(/[^0-9K]/g,'')}
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
  return {
    found:Boolean(c.found),
    name:safeText(c.name,180),
    business_activity:safeText(c.business_activity,220),
    address:safeText(c.address,220),
    city:safeText(c.city,120),
    phone:safeText(c.phone,80),
    email:safeText(c.email,160),
    website:safeText(c.website,260),
    note:safeText(c.note,360)
  };
}
async function lookupPublicCompany(rut){
  const apiKey=process.env.GEMINI_API_KEY?.trim()||process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if(!apiKey)throw Object.assign(new Error('AI_CONFIGURATION_REQUIRED'),{statusCode:503});
  const prompt=`Busca en la web información EMPRESARIAL PÚBLICA asociada inequívocamente al RUT chileno ${rut}. El objetivo es ayudar a un vendedor a prellenar una ficha; NO certifiques la exactitud y NO inventes ni completes por inferencia. Prioriza fuentes oficiales, sitio corporativo y directorios empresariales reconocibles. Si un dato no puede asociarse con suficiente certeza a ese RUT, déjalo como cadena vacía. No busques ni devuelvas datos personales privados.\n\nDevuelve SOLO JSON válido, sin Markdown, con esta forma exacta:\n{"found":true,"name":"","business_activity":"","address":"","city":"","phone":"","email":"","website":"","note":""}\n\nReglas: name=razón social; business_activity=giro o actividad; address=dirección comercial publicada; city=comuna/ciudad; phone=teléfono comercial publicado; email=correo comercial publicado; website=sitio oficial cuando sea identificable. found=false si no existe una coincidencia suficientemente inequívoca.`;
  const controller=AbortSignal.timeout(22000);
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,{
    method:'POST',
    headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},
    signal:controller,
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.1,maxOutputTokens:1200}})
  });
  const data=await r.json().catch(()=>null);
  if(!r.ok)throw Object.assign(new Error(r.status===429?'AI_QUOTA_EXCEEDED':'AI_UNAVAILABLE'),{statusCode:r.status===429?429:503});
  const candidate=data?.candidates?.[0];
  const text=(candidate?.content?.parts||[]).filter(p=>typeof p.text==='string').map(p=>p.text).join('');
  const company=normalizeCompany(parseJsonText(text));
  const gm=candidate?.groundingMetadata||{};
  const seen=new Set();
  const sources=(gm.groundingChunks||[]).flatMap(chunk=>{
    const web=chunk?.web;if(!web?.uri)return[];
    const uri=String(web.uri).slice(0,1200);if(seen.has(uri))return[];seen.add(uri);
    return [{title:safeText(web.title||'Fuente web',180),url:uri}];
  }).slice(0,8);
  return {company,sources,searchEntryPoint:typeof gm?.searchEntryPoint?.renderedContent==='string'?gm.searchEntryPoint.renderedContent.slice(0,12000):''};
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method==='GET')return res.status(200).json({service:'MSC customer public lookup',configured:Boolean(process.env.GEMINI_API_KEY?.trim()||process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()),model:MODEL});
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'METHOD_NOT_ALLOWED'})}
  if(!isAllowedOrigin(req.headers.origin,process.env.VERCEL_URL)||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});
  if(!String(req.headers['content-type']||'').startsWith('application/json'))return res.status(415).json({error:'JSON_REQUIRED'});
  const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'anonymous').split(',')[0];
  if(!allow(ip)){res.setHeader('Retry-After','60');return res.status(429).json({error:'RATE_LIMIT',message:'Demasiadas consultas seguidas. Intenta nuevamente en un minuto.'})}
  try{
    await authUser(req);
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const rut=safeText(body.rut,20);
    if(!validRut(rut))return res.status(400).json({error:'INVALID_RUT',message:'Revisa el RUT y su dígito verificador.'});
    const result=await lookupPublicCompany(rut);
    return res.status(200).json({...result,rut,notice:'Datos sugeridos desde fuentes públicas. El vendedor debe verificarlos con el cliente antes de guardarlos.',lookedUpAt:new Date().toISOString()});
  }catch(error){
    const status=Number(error.statusCode)||503;
    if(error instanceof SyntaxError)return res.status(400).json({error:'INVALID_JSON'});
    return res.status(status).json({error:error.message||'LOOKUP_UNAVAILABLE',message:status===503?'No fue posible consultar fuentes públicas en este momento.':undefined});
  }
}
