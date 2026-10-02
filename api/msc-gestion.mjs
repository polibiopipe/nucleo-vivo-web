import { readFile } from 'node:fs/promises';
import path from 'node:path';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  try{
    const file=path.join(process.cwd(),'prototipos','msc-safety','gestion','index.html');
    const html=await readFile(file,'utf8');
    res.setHeader('Content-Type','text/html; charset=utf-8');
    return res.status(200).send(html);
  }catch(error){
    console.error(JSON.stringify({event:'msc_gestion_page_error',name:error?.name,code:error?.code}));
    return res.status(500).send('No fue posible cargar Gestión MSC Safety.');
  }
}
