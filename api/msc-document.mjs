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

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Método no permitido' });
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
