import { answer, validateInput, createLimiter, isAllowedOrigin } from '../server/move-assistant.mjs';

const allow = createLimiter();
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'GET') return res.status(200).json({ service: 'MOVE Select', version: '20260906-gemini-direct', provider: 'google-gemini', configured: Boolean(process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()), generation: 'POST', demo: true });
  if (req.method !== 'POST') { res.setHeader('Allow','GET, POST'); return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' }); }
  if (!isAllowedOrigin(req.headers.origin, process.env.VERCEL_URL) || req.headers['sec-fetch-site'] === 'cross-site') return res.status(403).json({ error: 'ORIGIN_NOT_ALLOWED' });
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) return res.status(415).json({ error: 'JSON_REQUIRED' });
  if (Number(req.headers['content-length'] || 0) > 20000) return res.status(413).json({ error: 'MESSAGE_TOO_LONG' });
  let input;
  try { input = validateInput(typeof req.body === 'string' ? JSON.parse(req.body) : req.body); } catch { return res.status(400).json({ error: 'INVALID_INPUT' }); }
  const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'anonymous').split(',')[0];
  if (!allow(ip)) { res.setHeader('Retry-After','60'); return res.status(429).json({ error: 'RATE_LIMIT', message: 'Has realizado varias consultas seguidas. Intenta de nuevo en un minuto.' }); }
  try { return res.status(200).json(await answer(input)); }
  catch (error) {
    const status = error.statusCode || error.cause?.statusCode;
    console.warn(JSON.stringify({ event: 'move_ai_error', provider: 'google-gemini', name: String(error.name || 'Error').slice(0,80), code: error.name === 'MoveGeminiError' ? error.code : undefined, status }));
    if (error.code === 'AI_CONFIGURATION_REQUIRED' || error.code === 'AI_CREDENTIAL_REJECTED') return res.status(503).json({ error: 'AI_ACTIVATION_REQUIRED', message: 'El asistente de IA está pendiente de activación. Puedes recorrer MOVE con las preguntas guiadas.' });
    if (status === 429) { res.setHeader('Retry-After', '60'); return res.status(429).json({ error: 'AI_QUOTA_EXCEEDED', message: 'La IA alcanzó su límite de consultas. Puedes reintentar más tarde o usar las preguntas guiadas.' }); }
    return res.status(status === 429 ? 429 : 503).json({ error: 'AI_UNAVAILABLE', message: 'La IA no pudo responder en este momento. Puedes reintentar o continuar con las preguntas guiadas.' });
  }
}
