import test from 'node:test';
import assert from 'node:assert/strict';
import { generateGemini, classifyGoogleError } from '../server/move-gemini.mjs';
import { answer, validateInput } from '../server/move-assistant.mjs';

const env = { GEMINI_API_KEY: 'test-only-key' };
const output = { message: 'Puedes comparar estas bandas.', intent: 'products', referral: 'unknown', products: [{ rank: 1, reason: 'Alternativa del catálogo' }], followUp: [] };
const completed = { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(output) }] } }], usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20 } };
const params = { system: 'Instrucción', messages: [{ role: 'user', content: 'Consulta' }], schema: { type: 'object' } };

test('complete MOVE flow calls Google directly with private header, history and schema, then validates catalog prices', async () => {
  let request;
  const input = validateInput({ messages: [{ role: 'user', content: 'Busco bandas' }, { role: 'assistant', content: '¿Presupuesto?' }, { role: 'user', content: '10000' }], budget: 10000 });
  const result = await answer(input, config => generateGemini(config, { env, fetchImpl: async (url, init) => {
    request = { url, init, body: JSON.parse(init.body) };
    return Response.json(completed);
  } }));
  assert.equal(new URL(request.url).origin, 'https://generativelanguage.googleapis.com');
  assert.equal(new URL(request.url).search, '');
  assert.equal(request.init.headers['x-goog-api-key'], env.GEMINI_API_KEY);
  assert.equal(request.init.redirect, 'error');
  assert.deepEqual(request.body.contents.map(c => c.role), ['user', 'model', 'user']);
  assert.equal(request.body.contents[2].parts[0].text, '10000');
  assert.match(request.body.systemInstruction.parts[0].text, /CATÁLOGO DE REFERENCIA/);
  assert.equal(request.body.generationConfig.responseMimeType, 'application/json');
  assert.ok(request.body.generationConfig.responseJsonSchema.required.includes('referral'));
  assert.equal(result.source, 'ai');
  assert.equal(result.products[0].price, '$5.990');
  assert.ok(!JSON.stringify(result).includes(env.GEMINI_API_KEY));
});

test('missing key fails before network; Gateway identity is never used as a fallback', async () => {
  let called = false;
  await assert.rejects(generateGemini(params, { env: { VERCEL_OIDC_TOKEN: 'unused', AI_GATEWAY_API_KEY: 'unused' }, fetchImpl: async () => { called = true; } }), { code: 'AI_CONFIGURATION_REQUIRED' });
  assert.equal(called, false);
});

test('existing Google provider variable is accepted without changing its secret', async () => {
  const result = await generateGemini(params, { env: { GOOGLE_GENERATIVE_AI_API_KEY: 'test-only-google-key' }, fetchImpl: async (_, init) => {
    assert.equal(init.headers['x-goog-api-key'], 'test-only-google-key');
    return Response.json(completed);
  } });
  assert.equal(result.output.message, output.message);
});

test('provider rejection and quota errors preserve safe status without retaining response contents', async () => {
  for (const [status, code] of [[400, 'AI_PROVIDER_ERROR'], [403, 'AI_CREDENTIAL_REJECTED'], [429, 'AI_QUOTA_EXCEEDED']]) {
    let calls = 0;
    await assert.rejects(generateGemini(params, { env, fetchImpl: async () => {
      calls++;
      return Response.json({ error: { message: 'sensitive response should be discarded' } }, { status });
    } }), error => {
      assert.equal(error.code, code); assert.equal(error.statusCode, status);
      assert.ok(!JSON.stringify(error).includes('sensitive')); return true;
    });
    assert.equal(calls, 1);
  }
});

test('blocked, truncated and invalid JSON replies never become successful AI answers', async () => {
  for (const data of [{ promptFeedback: { blockReason: 'SAFETY' } }, { candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: JSON.stringify(output) }] } }] }, { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'not json' }] } }] }]) {
    let calls = 0;
    await assert.rejects(generateGemini(params, { env, fetchImpl: async () => { calls++; return Response.json(data); } }));
    assert.equal(calls, 1);
  }
});

test('503 recovers with one alternate Gemini model, identical context and bounded backoff', async () => {
  const requests = [];
  let waited = false;
  const result = await generateGemini({ ...params, model: 'gemini-3.8-flash' }, {
    env,
    waitImpl: async (ms, signal) => { assert.ok(ms >= 1000 && ms <= 1250); assert.equal(signal.aborted, false); waited = true; },
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      if (requests.length === 1) return Response.json({ error: { message: 'Overloaded' } }, { status: 503 });
      assert.ok(waited);
      return Response.json(completed);
    },
  });
  assert.equal(requests.length, 2);
  assert.match(requests[0].url, /gemini-3\.8-flash:generateContent$/);
  assert.match(requests[1].url, /gemini-3\.5-flash-lite:generateContent$/);
  assert.equal(requests[0].init.body, requests[1].init.body);
  assert.equal(requests[1].init.headers['x-goog-api-key'], env.GEMINI_API_KEY);
  assert.equal(result.model, 'gemini-3.5-flash-lite');
  assert.equal(result.attempts, 2);
  assert.deepEqual(result.output, output);
});

test('persistent provider failure stops after two requests and discards error bodies', async () => {
  let calls = 0;
  await assert.rejects(generateGemini(params, { env, waitImpl: async () => {}, fetchImpl: async () => {
    calls++;
    return Response.json({ error: { message: 'sensitive' } }, { status: 503 });
  } }), error => {
    assert.equal(error.code, 'AI_PROVIDER_BUSY');
    assert.equal(error.statusCode, 503);
    assert.ok(!JSON.stringify(error).includes('sensitive'));
    return true;
  });
  assert.equal(calls, 2);
});

test('first-attempt timeout can recover, but cancellation prevents a second request', async () => {
  let calls = 0;
  const result = await generateGemini(params, { env, waitImpl: async () => {}, fetchImpl: async () => {
    if (++calls === 1) throw new DOMException('timeout', 'TimeoutError');
    return Response.json(completed);
  } });
  assert.equal(result.attempts, 2);

  const controller = new AbortController();
  calls = 0;
  await assert.rejects(generateGemini({ ...params, abortSignal: controller.signal }, {
    env,
    waitImpl: async () => controller.abort(),
    fetchImpl: async () => { calls++; return Response.json({}, { status: 503 }); },
  }), { code: 'AI_TIMEOUT' });
  assert.equal(calls, 1);
});

test('thinking content is excluded from the user-facing structured reply', async () => {
  const data = structuredClone(completed);
  data.candidates[0].content.parts.unshift({ thought: true, text: 'internal thought' });
  const result = await generateGemini(params, { env, fetchImpl: async () => Response.json(data) });
  assert.deepEqual(result.output, output);
});

test('Google 400 responses distinguish invalid credentials from incompatible request fields', () => {
  assert.equal(classifyGoogleError(400, { error: { details: [{ reason: 'API_KEY_INVALID' }] } }), 'AI_CREDENTIAL_REJECTED');
  assert.equal(classifyGoogleError(400, { error: { message: 'Invalid JSON payload received. Unknown name "responseFormat" at generation_config.' } }), 'AI_REQUEST_FORMAT');
  assert.equal(classifyGoogleError(403, { error: { details: [{ reason: 'SERVICE_DISABLED' }] } }), 'AI_SERVICE_DISABLED');
  assert.equal(classifyGoogleError(404, { error: { message: 'Model unavailable' } }), 'AI_MODEL_UNAVAILABLE');
});
