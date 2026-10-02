import { isAllowedOrigin } from '../server/move-assistant.mjs';

const SUPABASE_URL='https://ygfmpwlpmaasooltjujb.supabase.co';
const SUPABASE_KEY='sb_publishable_evFWgAwjv7xcNxo156NV0g_CFq0j5Ld';

function validEmail(value){
  const s=String(value||'').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)?s:null;
}
function validPassword(value){
  const s=String(value||'');
  return s.length>=8 && s.length<=128 ? s : null;
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'METHOD_NOT_ALLOWED'});}
  if(!isAllowedOrigin(req.headers.origin,process.env.VERCEL_URL)||req.headers['sec-fetch-site']==='cross-site'){
    return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});
  }
  const email=validEmail(req.body?.email);
  const password=validPassword(req.body?.password);
  if(!email||!password)return res.status(400).json({error:'INVALID_INPUT',message:'Correo o contraseña inválidos.'});

  const check=await fetch(SUPABASE_URL+'/rest/v1/rpc/msc_email_is_allowed',{
    method:'POST',
    headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({candidate_email:email})
  });
  const allowed=check.ok ? await check.json() : false;
  if(allowed!==true)return res.status(403).json({error:'NOT_ALLOWED',message:'Este correo no está autorizado para MSC Safety.'});

  const redirect='https://nucleovivo.net/prototipos/msc-safety/gestion/';
  const signup=await fetch(SUPABASE_URL+'/auth/v1/signup?redirect_to='+encodeURIComponent(redirect),{
    method:'POST',
    headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({email,password,data:{msc_access:true}})
  });
  const data=await signup.json().catch(()=>({}));
  if(!signup.ok){
    const message=String(data?.msg||data?.message||'No fue posible activar la cuenta.');
    return res.status(signup.status).json({error:'SIGNUP_FAILED',message});
  }
  return res.status(200).json({ok:true,requiresConfirmation:!data?.session});
}
