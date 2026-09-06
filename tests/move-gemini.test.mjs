import test from 'node:test';
import assert from 'node:assert/strict';
import { generateGemini } from '../server/move-gemini.mjs';
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
  assert.equal(request.body.generationConfig.responseFormat.text.mimeType, 'application/json');
  assert.ok(request.body.generationConfig.responseFormat.text.schema.required.includes('referral'));
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
  for (const [status, code] of [[403, 'AI_CREDENTIAL_REJECTED'], [429, 'AI_QUOTA_EXCEEDED'], [500, 'AI_PROVIDER_ERROR']]) {
    await assert.rejects(generateGemini(params, { env, fetchImpl: async () => Response.json({ error: { message: 'sensitive response should be discarded' } }, { status }) }), error => {
      assert.equal(error.code, code); assert.equal(error.statusCode, status);
      assert.ok(!JSON.stringify(error).includes('sensitive')); return true;
    });
  }
});

test('blocked, truncated and invalid JSON replies never become successful AI answers', async () => {
  for (const data of [{ promptFeedback: { blockReason: 'SAFETY' } }, { candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: JSON.stringify(output) }] } }] }, { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'not json' }] } }] }]) {
    await assert.rejects(generateGemini(params, { env, fetchImpl: async () => Response.json(data) }));
  }
});

test('thinking content is excluded from the user-facing structured reply', async () => {
  const data = structuredClone(completed);
  data.candidates[0].content.parts.unshift({ thought: true, text: 'internal thought' });
  const result = await generateGemini(params, { env, fetchImpl: async () => Response.json(data) });
  assert.deepEqual(result.output, output);
});
