const IMAGES=Object.freeze({
  PJ506BDKTC:'https://images.implementos.cl/img/1000/PROZAP0120-1.jpg',
  PJ507MDKTC:'https://www.apro.cl/cdn/shop/files/507_2-680x680_800x800_072a33ac-ad9a-46c6-a5e9-7477eb326065.jpg?v=1770303319',
  PJ508CDKTC:'https://www.amsec.cl/121-home_default/panama-jack-pj508cdktc.jpg',
  PJ509BDKTC:'https://www.amsec.cl/519-home_default/panama-jack-pj509bdktc.jpg',
  PJ510GDKTC:'https://www.apro.cl/cdn/shop/files/Botin-de-seguridad-Panama-Jack-PJ510GDKTC.jpg?v=1774878746&width=1200',
  PJ511NDKTC:'https://www.amsec.cl/142-home_default/panama-jack-pj511ndktc.jpg',
  PJ512GDKTC:'https://britaniaseguridad.cl/1126-medium_default/botin-panama-jack-pj512gdktc.jpg',
  PJ513GDKTC:'https://i5.walmartimages.cl/asr/babe9f09-b3f6-4b1e-a042-2e67eaa59f2e.3162aaa2fae219a36873febd7e682d68.webp?odnBg=FFFFFF&odnHeight=612&odnWidth=612',
  PJ514ADKCW:'https://britaniaseguridad.cl/1117-thickbox_default/botin-panama-jack-pj514adkcw.jpg',
  PJ516BDKCW:'https://www.amsec.cl/245-home_default/botin-de-seguridad-panama-jack-pj516bdktcw.jpg',
  PJ517NDKCW:'https://www.amsec.cl/251-home_default/botin-de-seguridad-panama-jack-pj517ndkcw.jpg',
  PJ518CDKCW:'https://www.amsec.cl/306-home_default/botin-de-seguridad-panama-jack-pj518cdkcw.jpg',
  PJ518NDKCW:'https://www.amsec.cl/312-home_default/botin-de-seguridad-panama-jack-pj518ndkcw.jpg',
  PJ526BDKCW:'https://www.amsec.cl/636-home_default/botin-de-seguridad-panama-jack-pj526bdkcw.jpg',
  PJ527NDKTC:'https://rac.cl/cdn/shop/files/7ce8f2d1-4389-4058-b499-0de7ef9ef0e2.png?v=1779140315&width=1445',
  PJ528BDKTC:'https://www.amsec.cl/655-home_default/botin-de-seguridad-panama-jack-pj528bdktc.jpg'
});

export default async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='HEAD'){
    res.setHeader('Allow','GET, HEAD');
    return res.status(405).json({error:'Método no permitido'});
  }
  const model=String(req.query?.model||'').trim().toUpperCase();
  const url=IMAGES[model];
  if(!url)return res.status(404).json({error:'Imagen no disponible'});
  try{
    const upstream=await fetch(url,{redirect:'follow',headers:{Accept:'image/avif,image/webp,image/*,*/*;q=0.7','User-Agent':'MSC-Safety-Image-Service/1.0'}});
    if(!upstream.ok)throw new Error('Origen respondió '+upstream.status);
    const buffer=Buffer.from(await upstream.arrayBuffer());
    if(!buffer.length||buffer.length>8*1024*1024)throw new Error('Imagen vacía o demasiado grande');
    const type=String(upstream.headers.get('content-type')||'').toLowerCase();
    const allowed=type.startsWith('image/')?type.split(';')[0]:'image/jpeg';
    res.setHeader('Content-Type',allowed);
    res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
    res.setHeader('X-Content-Type-Options','nosniff');
    if(req.method==='HEAD')return res.status(200).end();
    return res.status(200).send(buffer);
  }catch(err){
    console.error('msc-product-image',model,err?.message||err);
    return res.status(502).json({error:'Imagen temporalmente no disponible'});
  }
}
