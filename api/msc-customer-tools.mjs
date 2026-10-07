import { readFile } from 'node:fs/promises';

const scriptUrl=new URL('../server/msc-customer-tools.js',import.meta.url);
let cache='';

export default async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).end('METHOD_NOT_ALLOWED')}
  try{
    if(!cache)cache=await readFile(scriptUrl,'utf8');
    res.setHeader('Content-Type','application/javascript; charset=utf-8');
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=300');
    res.setHeader('X-Content-Type-Options','nosniff');
    return res.status(200).send(cache);
  }catch(_){return res.status(503).end('CLIENT_TOOLS_UNAVAILABLE')}
}
