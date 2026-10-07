const DOCUMENTS = Object.freeze({
  // PANAMA JACK · fichas técnicas originales
  'pj506-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=49', name: 'Ficha-Tecnica-PJ506BDKTC.pdf' },
  'pj507-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=50', name: 'Ficha-Tecnica-PJ507MDKTC.pdf' },
  'pj508-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=51', name: 'Ficha-Tecnica-PJ508CDKTC.pdf' },
  'pj509-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=52', name: 'Ficha-Tecnica-PJ509BDKTC.pdf' },
  'pj510-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=54', name: 'Ficha-Tecnica-PJ510GDKTC.pdf' },
  'pj511-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=48', name: 'Ficha-Tecnica-PJ511NDKTC.pdf' },
  'pj512-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=47', name: 'Ficha-Tecnica-PJ512GDKTC.pdf' },
  'pj513-ficha': { url: 'https://comercialdimasur.cl/wp-content/uploads/2025/03/CATALOGO-DIGITAL-PANAMA-JACK.pdf', name: 'Ficha-Tecnica-Catalogo-PJ513GDKTC.pdf' },
  'pj514-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=58', name: 'Ficha-Tecnica-PJ514ADKCW.pdf' },
  'pj516-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=46', name: 'Ficha-Tecnica-PJ516BDKCW.pdf' },
  'pj517-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=77', name: 'Ficha-Tecnica-PJ517NDKCW.pdf' },
  'pj518c-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=45', name: 'Ficha-Tecnica-PJ518CDKCW.pdf' },
  'pj518n-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=44', name: 'Ficha-Tecnica-PJ518NDKCW.pdf' },
  'pj526-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=88', name: 'Ficha-Tecnica-PJ526BDKCW.pdf' },
  'pj527-ficha': { url: 'https://images.jumpseller.com/store/eppweb/32157312/attachments/9a6b61e38a1b5ac6435c1d95c1cf3c43/Ficha_PJ527NDKTC.pdf?1760057857=', name: 'Ficha-Tecnica-PJ527NDKTC.pdf' },
  'pj528-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=90', name: 'Ficha-Tecnica-PJ528BDKTC.pdf' },

  // SHERPA'S · fichas técnicas originales
  'sh406-ficha': { url: 'https://epp.cl/wp-content/uploads/2024/01/SH406CDK-V6.pdf', name: 'Ficha-Tecnica-SH406CDK.pdf' },
  'sh406ac-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=27', name: 'Ficha-Tecnica-SH406CDKAC.pdf' },
  'sh407-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=42', name: 'Ficha-Tecnica-SH407CDKTC.pdf' },
  'sh408b-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=40', name: 'Ficha-Tecnica-SH408BDKTC.pdf' },
  'sh408c-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=39', name: 'Ficha-Tecnica-SH408CDKTC.pdf' },
  'sh411-ficha': { url: 'https://dinaseg.cl/wp-content/uploads/2025/01/botin_sherpas_SH411NDK.pdf', name: 'Ficha-Tecnica-SH411NDK.pdf' },
  'sh413-ficha': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=36', name: 'Ficha-Tecnica-SH413CDK.pdf' },
  'sh415-ficha': { url: 'https://www.globalseguridad.cl/productos/botin-de-seguridad-sherpas-sh415bdk/?print-products=pdf&variation=0', name: 'Ficha-Tecnica-SH415BDK.pdf' },
  'sh417-ficha': { url: 'https://images.jumpseller.com/store/prosec-chile/17975303/attachments/62670957b95cb8fca6be6194dcb563dd/FICHA_TECNICA_SHERPAS_417.pdf?1676410582=', name: 'Ficha-Tecnica-SH417ADK.pdf' },
  'sh428-ficha': { url: 'https://ksltda.cl/uploads/cetificados/ficha_BOTIN-PANAMA-JACK-SHERPA-S-SH428GDKCW-798_1691084354.pdf', name: 'Ficha-Tecnica-SH428GDKCW.pdf' },
  'sh436-ficha': { url: 'https://cimmaseg.cl/prestashop/proteccion-visual?id_attachment=714', name: 'Ficha-Tecnica-SH436CDKCW.pdf' },

  // Certificados / registros originales
  'cesmec-024': { url: 'https://www.amsec.cl/index.php?controller=attachment&id_attachment=2', name: 'Certificado-CESMEC-024.pdf' },
  'cesmec-019-historico': { url: 'https://images.jumpseller.com/store/isoprevent/30104236/attachments/f2d3cae933125dd2437bfab764baece0/CERTIFICADO_019__2_b2068cd9-7d05-4b0a-aedd-e7b1f56ea22d.pdf?1748631076=', name: 'Certificado-Historico-CESMEC-019.pdf' },
  'cesmec-023': { url: 'https://mayjo.cl/wp-content/uploads/2026/07/CESMEC-023.pdf', name: 'Certificado-CESMEC-023.pdf' },
  'isp-pj526': { url: 'https://mayjo.cl/wp-content/uploads/2026/07/REGISTRO-ISP-PJ526BDKCW.pdf', name: 'Registro-ISP-PJ526BDKCW.pdf' },
  'isp-sh436': { url: 'https://mayjo.cl/wp-content/uploads/2026/07/REGISTRO-ISP-SH436CDKCW.pdf', name: 'Registro-ISP-SH436CDKCW.pdf' }
});

const IMAGES = Object.freeze({
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

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const imageModel = String(req.query?.image || '').trim().toUpperCase();
  if (imageModel) {
    const imageUrl = IMAGES[imageModel];
    if (!imageUrl) return res.status(404).json({ error: 'Imagen no disponible.' });
    try {
      const upstream = await fetch(imageUrl, {
        redirect: 'follow',
        headers: {
          'Accept': 'image/avif,image/webp,image/*,*/*;q=0.7',
          'User-Agent': 'MSC-Safety-Media-Service/1.0'
        }
      });
      if (!upstream.ok) throw new Error(`Origen respondió ${upstream.status}`);
      const buffer = Buffer.from(await upstream.arrayBuffer());
      if (!buffer.length || buffer.length > 8 * 1024 * 1024) throw new Error('Imagen vacía o demasiado grande');
      const rawType = String(upstream.headers.get('content-type') || '').toLowerCase();
      const contentType = rawType.startsWith('image/') ? rawType.split(';')[0] : 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (req.method === 'HEAD') return res.status(200).end();
      return res.status(200).send(buffer);
    } catch (error) {
      console.error('msc-document-image', imageModel, error?.message || error);
      return res.status(502).json({ error: 'La imagen no está disponible temporalmente.' });
    }
  }

  const key = String(req.query?.key || '').trim().toLowerCase();
  const doc = DOCUMENTS[key];
  if (!doc) return res.status(404).json({ error: 'Documento no disponible o pendiente de validación.' });

  try {
    const upstream = await fetch(doc.url, {
      redirect: 'follow',
      headers: {
        'Accept': 'application/pdf,*/*;q=0.8',
        'User-Agent': 'MSC-Safety-Document-Service/1.0'
      }
    });
    if (!upstream.ok) throw new Error(`Origen respondió ${upstream.status}`);

    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (!buffer.length || buffer.length > 20 * 1024 * 1024) throw new Error('Documento vacío o demasiado grande');

    // La ruta pública de MSC Safety nunca expone ni redirige a la URL del proveedor.
    const contentType = upstream.headers.get('content-type') || '';
    const isPdf = contentType.toLowerCase().includes('pdf') || buffer.subarray(0, 5).toString() === '%PDF-';
    if (!isPdf) throw new Error('El origen ya no está entregando un PDF válido');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.name.replace(/[^A-Za-z0-9._-]/g, '-') }"`);
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'self' https://nucleovivo.net https://www.nucleovivo.net");
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('msc-document', key, error?.message || error);
    return res.status(502).json({ error: 'El documento original no está disponible temporalmente. MSC Safety no mostrará una copia no verificada.' });
  }
}
