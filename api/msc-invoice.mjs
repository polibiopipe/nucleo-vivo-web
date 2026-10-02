import { isAllowedOrigin } from '../server/move-assistant.mjs';

const SUPABASE_URL='https://ygfmpwlpmaasooltjujb.supabase.co';
const SUPABASE_KEY='sb_publishable_evFWgAwjv7xcNxo156NV0g_CFq0j5Ld';

function cleanBase64(value){
  const s=String(value||'').trim();
  if(!s || s.length>4_200_000 || !/^[A-Za-z0-9+/=]+$/.test(s)) throw new Error('INVALID_PDF');
  return s;
}
async function verifyUser(token){
  const r=await fetch(SUPABASE_URL+'/auth/v1/user',{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+token}});
  if(!r.ok) return null;
  const u=await r.json();
  const role=u?.app_metadata?.msc_role;
  return ['admin','bodega','ventas','supervisor'].includes(role)?u:null;
}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'METHOD_NOT_ALLOWED'})}
  if(!isAllowedOrigin(req.headers.origin,process.env.VERCEL_URL)||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});
  const bearer=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!bearer||!(await verifyUser(bearer)))return res.status(401).json({error:'UNAUTHORIZED',message:'Acceso MSC no autorizado.'});
  let pdfBase64,documentType;
  try{pdfBase64=cleanBase64(req.body?.pdfBase64);documentType=req.body?.documentType==='venta'?'venta':'compra'}catch{return res.status(400).json({error:'INVALID_INPUT',message:'PDF inválido o demasiado grande.'})}
  const apiKey=process.env.GEMINI_API_KEY?.trim()||process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if(!apiKey)return res.status(503).json({error:'AI_CONFIGURATION_REQUIRED',message:'El lector de facturas aún no está configurado.'});
  const model=process.env.MOVE_GEMINI_MODEL||'gemini-3.8-flash';
  const prompt='Extrae esta factura chilena de '+documentType+'. Devuelve SOLO JSON válido con: folio, issuer_name, issuer_rut, receiver_name, receiver_rut, document_date en YYYY-MM-DD y lines como arreglo. Cada línea: description, product_code si aparece, ean_gtin si aparece, quantity numérica, unit_price numérico o null. No inventes códigos ni EAN. Si un dato no aparece usa null.';
  const body={contents:[{role:'user',parts:[{inline_data:{mime_type:'application/pdf',data:pdfBase64}},{text:prompt}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:2500}};
  try{
    const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},body:JSON.stringify(body),signal:AbortSignal.timeout(25000)});
    if(!r.ok)return res.status(503).json({error:'AI_UNAVAILABLE',message:'No fue posible leer la factura en este momento.'});
    const data=await r.json();const text=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
    let out;try{out=JSON.parse(text)}catch{return res.status(503).json({error:'INVALID_AI_RESPONSE',message:'La factura necesita revisión manual.'})}
    if(!Array.isArray(out.lines))return res.status(503).json({error:'INVALID_AI_RESPONSE',message:'No se detectaron líneas de productos.'});
    out.lines=out.lines.slice(0,100).map(x=>({description:String(x.description||'').slice(0,500),product_code:x.product_code?String(x.product_code).slice(0,120):null,ean_gtin:x.ean_gtin?String(x.ean_gtin).slice(0,40):null,quantity:Number(x.quantity||0),unit_price:x.unit_price==null?null:Number(x.unit_price)})).filter(x=>x.description&&x.quantity>0);
    return res.status(200).json(out);
  }catch{return res.status(503).json({error:'AI_UNAVAILABLE',message:'No fue posible leer la factura en este momento.'})}
}