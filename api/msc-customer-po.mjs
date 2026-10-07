import { isAllowedOrigin } from '../server/move-assistant.mjs';

const SUPABASE_URL='https://ygfmpwlpmaasooltjujb.supabase.co';
const SUPABASE_KEY='sb_publishable_evFWgAwjv7xcNxo156NV0g_CFq0j5Ld';
const MSC_RUT='77196396K';

function safeText(v,max=240){return v==null?null:String(v).trim().slice(0,max)}
function safeNumber(v){
  if(v==null||v==='')return 0;
  const n=Number(String(v).replace(/\./g,'').replace(',','.'));
  return Number.isFinite(n)?n:0;
}
function cleanBase64(value){
  const s=String(value||'').trim();
  if(!s || s.length>4_200_000 || !/^[A-Za-z0-9+/=]+$/.test(s)) throw new Error('INVALID_PDF');
  return s;
}
function cleanCatalog(value){
  if(!Array.isArray(value))return [];
  return value.slice(0,180).map(p=>({
    sku:String(p?.sku||'').slice(0,80),
    name:String(p?.name||'').slice(0,180),
    brand:p?.brand?String(p.brand).slice(0,80):null,
    model:p?.model?String(p.model).slice(0,100):null,
    manufacturer_code:p?.manufacturer_code?String(p.manufacturer_code).slice(0,100):null,
    variant_code:p?.variant_code?String(p.variant_code).slice(0,40):null,
    product_color:p?.product_color?String(p.product_color).slice(0,60):null
  })).filter(p=>p.sku&&p.name);
}
async function verifyUser(token){
  const r=await fetch(SUPABASE_URL+'/auth/v1/user',{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+token}});
  if(!r.ok)return null;
  const u=await r.json();
  const role=u?.app_metadata?.msc_role;
  return ['admin','bodega','ventas','supervisor'].includes(role)?u:null;
}
function rutKey(value){return String(value||'').replace(/[^0-9kK]/g,'').toUpperCase()}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'METHOD_NOT_ALLOWED'})}
  if(!isAllowedOrigin(req.headers.origin,process.env.VERCEL_URL)||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});
  const bearer=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!bearer||!(await verifyUser(bearer)))return res.status(401).json({error:'UNAUTHORIZED',message:'Acceso MSC no autorizado.'});

  let pdfBase64,catalog;
  try{
    pdfBase64=cleanBase64(req.body?.pdfBase64);
    catalog=cleanCatalog(req.body?.catalog);
  }catch{
    return res.status(400).json({error:'INVALID_INPUT',message:'PDF inválido o demasiado grande.'});
  }

  const apiKey=process.env.GEMINI_API_KEY?.trim()||process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if(!apiKey)return res.status(503).json({error:'AI_CONFIGURATION_REQUIRED',message:'El lector de documentos aún no está configurado.'});
  const models=[process.env.MOVE_GEMINI_MODEL||'gemini-3.8-flash',process.env.MOVE_GEMINI_FALLBACK_MODEL||'gemini-flash-lite-latest','gemini-3.5-flash-lite'].filter((m,i,a)=>m&&a.indexOf(m)===i);

  const prompt=`Interpreta este PDF como posible ORDEN DE COMPRA DE UN CLIENTE dirigida a MSC Safety, RUT 77.196.396-K. No es un DTE tributario y NO debe generar contabilidad ni movimiento físico de inventario por sí sola.

Primero clasifica el documento. Devuelve SOLO JSON válido con:
- document_kind: "orden_compra" si efectivamente es una orden de compra de cliente; de lo contrario "otro"
- customer_po_number: número o folio de la orden de compra, o null
- issuer_name, issuer_rut: cliente que emite la OC
- receiver_name, receiver_rut: empresa receptora
- document_date en YYYY-MM-DD o null
- expected_delivery_date en YYYY-MM-DD o null
- payment_terms: condición de pago si aparece, o null
- delivery_address, delivery_city, delivery_contact_name, delivery_phone, delivery_notes si aparecen, o null
- net_amount, tax_amount, total_amount numéricos; si el documento no los muestra usa 0
- ai_confidence: "high","medium" o "low"
- lines: arreglo de productos solicitados

Cada línea debe incluir:
description, product_code si el cliente usa un código propio, ean_gtin si aparece, quantity numérica, unit_price numérico o null, discount_percent numérico o 0, line_total numérico o null, name, brand, model, family_code, subfamily_code, type_code, variant_code.

CONCILIACIÓN CON CATÁLOGO MSC:
- Compara descripción, modelo, talla/variante, marca, código fabricante y color.
- existing_sku solo si la coincidencia es inequívoca.
- candidate_skus: hasta 3 candidatos cuando falte certeza.
- match_confidence: high|medium|low|none.
- match_reason: breve.
- Nunca inventes SKU, códigos ni datos que no estén en el PDF.
- Un código del cliente NO es necesariamente el código fabricante MSC.
- Si falta precio, déjalo null: el sistema exigirá revisión humana antes de convertir la OC a nota de venta.
- Si el receptor no corresponde claramente a MSC Safety o el PDF no es una OC, usa document_kind="otro".

CATÁLOGO INTERNO ACTIVO: ${JSON.stringify(catalog)}`;

  const body={contents:[{role:'user',parts:[{inlineData:{mimeType:'application/pdf',data:pdfBase64}},{text:prompt}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:4000}};

  try{
    let data=null;
    for(let i=0;i<models.length;i++){
      try{
        const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+models[i]+':generateContent',{
          method:'POST',
          headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},
          body:JSON.stringify(body),
          signal:AbortSignal.timeout(9000)
        });
        if(!r.ok){
          console.warn(JSON.stringify({event:'msc_customer_po_ai_error',model:models[i],status:r.status,attempt:i+1}));
          if(i<models.length-1)await new Promise(resolve=>setTimeout(resolve,350));
          continue;
        }
        data=await r.json();break;
      }catch{
        console.warn(JSON.stringify({event:'msc_customer_po_ai_error',model:models[i],status:'network_or_timeout',attempt:i+1}));
      }
    }
    if(!data)return res.status(503).json({error:'AI_UNAVAILABLE',message:'No fue posible leer la orden de compra en este momento.'});
    const raw=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
    let out;try{out=JSON.parse(raw)}catch{return res.status(503).json({error:'INVALID_AI_RESPONSE',message:'El documento necesita revisión manual.'})}
    if(String(out.document_kind||'').toLowerCase()!=='orden_compra'){
      return res.status(422).json({error:'NOT_CUSTOMER_PO',message:'El PDF no fue identificado con suficiente certeza como una orden de compra de cliente.'});
    }
    if(!Array.isArray(out.lines)||!out.lines.length)return res.status(422).json({error:'NO_LINES',message:'La orden de compra no contiene líneas de productos reconocibles.'});

    out.detected_document_type='orden_compra_cliente';
    out.document_kind='orden_compra';
    out.customer_po_number=safeText(out.customer_po_number,80);
    out.folio=out.customer_po_number;
    out.issuer_name=safeText(out.issuer_name,180);
    out.issuer_rut=safeText(out.issuer_rut,30);
    out.receiver_name=safeText(out.receiver_name,180);
    out.receiver_rut=safeText(out.receiver_rut,30);
    out.document_date=safeText(out.document_date,20);
    out.expected_delivery_date=safeText(out.expected_delivery_date,20);
    out.payment_terms=safeText(out.payment_terms,180);
    out.delivery_address=safeText(out.delivery_address,260);
    out.delivery_city=safeText(out.delivery_city,120);
    out.delivery_contact_name=safeText(out.delivery_contact_name,160);
    out.delivery_phone=safeText(out.delivery_phone,80);
    out.delivery_notes=safeText(out.delivery_notes,500);
    out.net_amount=Math.max(0,safeNumber(out.net_amount));
    out.tax_amount=Math.max(0,safeNumber(out.tax_amount));
    out.total_amount=Math.max(0,safeNumber(out.total_amount));
    out.ai_confidence=['high','medium','low'].includes(String(out.ai_confidence))?String(out.ai_confidence):'medium';
    out.receiver_matches_msc=rutKey(out.receiver_rut)===MSC_RUT || /msc\s*safety/i.test(String(out.receiver_name||''));
    out.lines=out.lines.slice(0,100).map(x=>({
      description:String(x.description||'').slice(0,500),
      product_code:x.product_code?String(x.product_code).slice(0,120):null,
      ean_gtin:x.ean_gtin?String(x.ean_gtin).slice(0,40):null,
      quantity:Number(x.quantity||0),
      unit_price:x.unit_price==null?null:Math.max(0,Number(x.unit_price)),
      discount_percent:Math.min(100,Math.max(0,Number(x.discount_percent||0))),
      line_total:x.line_total==null?null:Math.max(0,Number(x.line_total)),
      name:x.name?String(x.name).slice(0,180):String(x.description||'').slice(0,180),
      brand:x.brand?String(x.brand).slice(0,100):null,
      model:x.model?String(x.model).slice(0,100):null,
      family_code:String(x.family_code||'EPP').toUpperCase().slice(0,8),
      subfamily_code:String(x.subfamily_code||'GEN').toUpperCase().slice(0,8),
      type_code:String(x.type_code||'PRO').toUpperCase().slice(0,8),
      variant_code:String(x.variant_code||'UNI').toUpperCase().slice(0,16),
      existing_sku:x.existing_sku?String(x.existing_sku).slice(0,80):null,
      candidate_skus:Array.isArray(x.candidate_skus)?x.candidate_skus.slice(0,3).map(v=>String(v).slice(0,80)):[],
      match_confidence:['high','medium','low','none'].includes(String(x.match_confidence))?String(x.match_confidence):'none',
      match_reason:x.match_reason?String(x.match_reason).slice(0,240):null
    })).filter(x=>x.description&&x.quantity>0);

    out.controller_review_required=true;
    out.accounting_effect='none_until_invoice';
    out.inventory_effect='commitment_only_after_conversion';
    return res.status(200).json(out);
  }catch(err){
    console.warn(JSON.stringify({event:'msc_customer_po_unhandled',name:err?.name,message:String(err?.message||'').slice(0,160)}));
    return res.status(503).json({error:'AI_UNAVAILABLE',message:'No fue posible leer la orden de compra en este momento.'});
  }
}
