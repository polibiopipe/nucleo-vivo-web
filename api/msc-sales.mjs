import { readFile } from 'node:fs/promises';

const pageUrl=new URL('../prototipos/msc-safety/ventas/index.html',import.meta.url);
let cached='';

export default async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');return res.status(405).end('METHOD_NOT_ALLOWED')}
  try{
    if(!cached){
      const html=await readFile(pageUrl,'utf8');
      cached=html.replace('</body>','<script src="/api/msc-customer-tools"></script>\n</body>');
    }
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=60');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    if(req.method==='HEAD')return res.status(200).end();
    return res.status(200).send(cached);
  }catch(_){return res.status(503).send('MSC Sales unavailable')}
}
