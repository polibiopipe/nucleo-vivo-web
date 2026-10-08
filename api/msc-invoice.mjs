import { isAllowedOrigin } from '../server/move-assistant.mjs';

const SUPABASE_URL='https://ygfmpwlpmaasooltjujb.supabase.co';
const SUPABASE_KEY='sb_publishable_evFWgAwjv7xcNxo156NV0g_CFq0j5Ld';
const MSC_RUT='77196396K';
const DOC_TYPES=['compra','venta','nota_credito_compra','nota_credito_venta'];

function rutKey(value){return String(value||'').replace(/[^0-9kK]/g,'').toUpperCase()}
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
  if(!r.ok) return null;
  const u=await r.json();
  const role=u?.app_metadata?.msc_role;
  return ['admin','bodega','ventas','supervisor'].includes(role)?u:null;
}
function inferDocumentType(out,requested){
  const issuer=rutKey(out?.issuer_rut),receiver=rutKey(out?.receiver_rut);
  const dte=String(out?.dte_code||'').trim();
  const kind=(String(out?.document_kind||'').toLowerCase()==='nota_credito'||dte==='61')?'nota_credito':'factura';
  const direction=issuer===MSC_RUT?'venta':receiver===MSC_RUT?'compra':null;
  if(direction)return kind==='nota_credito'?'nota_credito_'+direction:direction;
  return DOC_TYPES.includes(requested)?requested:null;
}
function buildAccountingProposal(type,out){
  const base=Math.max(0,safeNumber(out.net_amount)+safeNumber(out.exempt_amount));
  const tax=Math.max(0,safeNumber(out.tax_amount));
  const total=Math.max(0,safeNumber(out.total_amount)||base+tax);
  const purchaseCode=['110301','610101','610301'].includes(String(out.purchase_account_code||''))?String(out.purchase_account_code):'110301';
  if(type==='compra')return {
    lines:[
      {account_code:purchaseCode,debit:base,credit:0,label:purchaseCode==='110301'?'Inventario / mercaderías':'Cuenta de gasto sugerida'},
      ...(tax>0?[{account_code:'110401',debit:tax,credit:0,label:'IVA Crédito Fiscal'}]:[]),
      {account_code:'210101',debit:0,credit:total,label:'Proveedores'}
    ],
    note:'Propuesta previa. El controller debe revisar documento, cuenta base y efecto en inventario antes de contabilizar.'
  };
  if(type==='venta')return {
    lines:[
      {account_code:'110201',debit:total,credit:0,label:'Clientes'},
      {account_code:'410101',debit:0,credit:base,label:'Ventas'},
      ...(tax>0?[{account_code:'210201',debit:0,credit:tax,label:'IVA Débito Fiscal'}]:[])
    ],
    note:'El costo de ventas y la baja contable de inventario se calculan con el costo vigente de cada SKU al aprobar.'
  };
  if(type==='nota_credito_compra')return {
    lines:[
      {account_code:'210101',debit:total,credit:0,label:'Proveedores'},
      {account_code:purchaseCode,debit:0,credit:base,label:'Reverso compra / inventario'},
      ...(tax>0?[{account_code:'110401',debit:0,credit:tax,label:'Reverso IVA Crédito Fiscal'}]:[])
    ],
    note:'La cantidad física solo se rebaja si el controller confirma devolución/anulación con salida de mercadería.'
  };
  if(type==='nota_credito_venta')return {
    lines:[
      {account_code:'410101',debit:base,credit:0,label:'Reverso ventas'},
      ...(tax>0?[{account_code:'210201',debit:tax,credit:0,label:'Reverso IVA Débito Fiscal'}]:[]),
      {account_code:'110201',debit:0,credit:total,label:'Clientes'}
    ],
    note:'El reingreso físico y el reverso del costo de venta solo se ejecutan si el controller confirma devolución de mercadería.'
  };
  return {lines:[],note:'Revisión contable manual requerida.'};
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'METHOD_NOT_ALLOWED'})}
  if(!isAllowedOrigin(req.headers.origin,process.env.VERCEL_URL)||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});
  const bearer=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!bearer||!(await verifyUser(bearer)))return res.status(401).json({error:'UNAUTHORIZED',message:'Acceso MSC no autorizado.'});
  let pdfBase64,requestedType,catalog;
  try{
    pdfBase64=cleanBase64(req.body?.pdfBase64);
    requestedType=DOC_TYPES.includes(req.body?.documentType)?req.body.documentType:'compra';
    catalog=cleanCatalog(req.body?.catalog);
  }catch{return res.status(400).json({error:'INVALID_INPUT',message:'PDF inválido o demasiado grande.'})}

  const apiKey=process.env.GEMINI_API_KEY?.trim()||process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if(!apiKey)return res.status(503).json({error:'AI_CONFIGURATION_REQUIRED',message:'El lector de documentos aún no está configurado.'});
  const models=[process.env.MOVE_GEMINI_MODEL||'gemini-2.5-flash',process.env.MOVE_GEMINI_FALLBACK_MODEL||'gemini-2.5-flash-lite','gemini-2.5-flash'].filter((m,i,a)=>m&&a.indexOf(m)===i);

  const prompt=`Interpreta este DTE chileno para un ERP de MSC Safety. El documento puede ser FACTURA o NOTA DE CRÉDITO, de compra o de venta. Identifica correctamente EMISOR y RECEPTOR según el DTE; no deduzcas emisor por frases de la interfaz.

Devuelve SOLO JSON válido con:
- document_kind: "factura" o "nota_credito"
- dte_code: código SII si aparece (por ejemplo 33, 34, 61) o null
- folio
- issuer_name, issuer_rut
- receiver_name, receiver_rut
- document_date en YYYY-MM-DD
- net_amount, exempt_amount, tax_amount, total_amount numéricos
- reference_folio y reference_dte_code si existe referencia a otro DTE
- credit_note_reason: uno de "devolucion","diferencia_precio","descuento","anulacion","correccion","otro" o null
- affects_inventory_proposal: boolean. En nota de crédito usa true solo si el documento evidencia devolución/anulación con movimiento físico de mercadería; usa false si es diferencia de precio, descuento o corrección sin movimiento físico.
- ai_confidence: "high","medium" o "low"
- purchase_account_code: solo si es compra/NC compra y puedes clasificar la base con suficiente certeza: "110301" Inventario, "610101" Gastos de Administración o "610301" Transporte y Despacho. Si dudas usa "110301" y explica la duda en accounting_reason.
- accounting_reason: explicación breve, no más de 220 caracteres.
- lines: arreglo de líneas.

Cada línea debe incluir: description, product_code si aparece, ean_gtin si aparece, quantity numérica, unit_price numérico o null, line_total numérico o null, y una propuesta conservadora de name, brand, model, family_code, subfamily_code, type_code y variant_code.

CONCILIACIÓN DE INVENTARIO:
- Las facturas pueden abreviar descripciones y modelos. "BOTIN SH417 N°43" puede corresponder a "Botín Sherpa's SH417ADK Talla 43".
- No concluyas que un producto es nuevo solo porque el texto no sea idéntico.
- Compara modelo base, código fabricante, talla/variante, marca y color con el catálogo interno.
- Para cada línea agrega existing_sku solo si la coincidencia es inequívoca, candidate_skus hasta 3, match_confidence high|medium|low|none y match_reason breve.
- Si falta un dato que distinga variantes, NO elijas existing_sku: entrega candidatos para revisión humana.
- Nunca inventes SKU existente, product_code, EAN o referencias.
- Si un dato documental no aparece usa null.

CONTROL HUMANO OBLIGATORIO:
- Tu salida es una propuesta. No asumas aprobación contable ni de inventario.
- No inventes una referencia de factura para una nota de crédito.
- La decisión final sobre tipo de DTE, cuenta, SKU, efecto de stock y asiento corresponde al controller.

TIPO ELEGIDO EN INTERFAZ COMO PISTA NO VINCULANTE: ${requestedType}
CATÁLOGO INTERNO ACTIVO: ${JSON.stringify(catalog)}`;

  const body={contents:[{role:'user',parts:[{inlineData:{mimeType:'application/pdf',data:pdfBase64}},{text:prompt}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:4000}};

  try{
    let data=null;
    for(let i=0;i<models.length;i++){
      const model=models[i];
      try{
        const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
        if(!r.ok){
          console.warn(JSON.stringify({event:'msc_invoice_ai_error',model,status:r.status,attempt:i+1}));
          if(i<models.length-1) await new Promise(resolve=>setTimeout(resolve,350));
          continue;
        }
        data=await r.json();
        break;
      }catch(err){
        console.warn(JSON.stringify({event:'msc_invoice_ai_error',model,status:'network_or_timeout',attempt:i+1}));
      }
    }
    if(!data)return res.status(503).json({error:'AI_UNAVAILABLE',message:'No fue posible leer el documento en este momento.'});
    const raw=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
    let out;try{out=JSON.parse(raw)}catch{return res.status(503).json({error:'INVALID_AI_RESPONSE',message:'El documento necesita revisión manual.'})}
    if(!Array.isArray(out.lines))return res.status(503).json({error:'INVALID_AI_RESPONSE',message:'No se detectaron líneas del documento.'});

    const detectedType=inferDocumentType(out,requestedType);
    out.detected_document_type=detectedType;
    out.document_kind=(detectedType&&detectedType.startsWith('nota_credito'))?'nota_credito':'factura';
    out.dte_code=safeText(out.dte_code,20);
    out.folio=safeText(out.folio,60);
    out.issuer_name=safeText(out.issuer_name,180);
    out.issuer_rut=safeText(out.issuer_rut,30);
    out.receiver_name=safeText(out.receiver_name,180);
    out.receiver_rut=safeText(out.receiver_rut,30);
    out.document_date=safeText(out.document_date,20);
    out.net_amount=Math.max(0,safeNumber(out.net_amount));
    out.exempt_amount=Math.max(0,safeNumber(out.exempt_amount));
    out.tax_amount=Math.max(0,safeNumber(out.tax_amount));
    out.total_amount=Math.max(0,safeNumber(out.total_amount));
    if(!out.total_amount)out.total_amount=out.net_amount+out.exempt_amount+out.tax_amount;
    out.reference_folio=safeText(out.reference_folio,60);
    out.reference_dte_code=safeText(out.reference_dte_code,20);
    out.credit_note_reason=['devolucion','diferencia_precio','descuento','anulacion','correccion','otro'].includes(String(out.credit_note_reason))?String(out.credit_note_reason):null;
    out.affects_inventory_proposal=typeof out.affects_inventory_proposal==='boolean'?out.affects_inventory_proposal:!detectedType?.startsWith('nota_credito');
    out.ai_confidence=['high','medium','low'].includes(String(out.ai_confidence))?String(out.ai_confidence):'medium';
    out.purchase_account_code=['110301','610101','610301'].includes(String(out.purchase_account_code))?String(out.purchase_account_code):'110301';
    out.accounting_reason=safeText(out.accounting_reason,220);
    out.lines=out.lines.slice(0,100).map(x=>({
      description:String(x.description||'').slice(0,500),
      product_code:x.product_code?String(x.product_code).slice(0,120):null,
      ean_gtin:x.ean_gtin?String(x.ean_gtin).slice(0,40):null,
      quantity:Number(x.quantity||0),
      unit_price:x.unit_price==null?null:Number(x.unit_price),
      line_total:x.line_total==null?null:Number(x.line_total),
      name:x.name?String(x.name).slice(0,180):String(x.description||'').slice(0,180),
      brand:x.brand?String(x.brand).slice(0,100):null,
      model:x.model?String(x.model).slice(0,100):null,
      family_code:String(x.family_code||'EPP').toUpperCase().slice(0,8),
      subfamily_code:String(x.subfamily_code||'GEN').toUpperCase().slice(0,8),
      type_code:String(x.type_code||'PRO').toUpperCase().slice(0,8),
      variant_code:String(x.variant_code||'UNI').toUpperCase().slice(0,8),
      existing_sku:x.existing_sku?String(x.existing_sku).slice(0,80):null,
      candidate_skus:Array.isArray(x.candidate_skus)?x.candidate_skus.slice(0,3).map(v=>String(v).slice(0,80)):[],
      match_confidence:['high','medium','low','none'].includes(String(x.match_confidence))?String(x.match_confidence):'none',
      match_reason:x.match_reason?String(x.match_reason).slice(0,240):null
    })).filter(x=>x.description&&x.quantity>0);

    out.accounting_proposal=buildAccountingProposal(detectedType,out);
    out.controller_review_required=true;
    return res.status(200).json(out);
  }catch(err){
    console.warn(JSON.stringify({event:'msc_invoice_unhandled',name:err?.name,message:String(err?.message||'').slice(0,160)}));
    return res.status(503).json({error:'AI_UNAVAILABLE',message:'No fue posible leer el documento en este momento.'});
  }
}
