export const MODEL = process.env.MOVE_GEMINI_MODEL || 'gemini-3.8-flash';

function providerError(code, statusCode) {
  // Never retain provider response bodies: they may echo credentials or input.
  return Object.assign(new Error(code), { name: 'MoveGeminiError', code, statusCode });
}

export async function generateGemini({ model = MODEL, system, messages, schema, maxOutputTokens = 2400, abortSignal }, { env = process.env, fetchImpl = fetch } = {}) {
  const apiKey = env.GEMINI_API_KEY?.trim() || env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) throw providerError('AI_CONFIGURATION_REQUIRED', 503);
  if (!/^gemini-[a-z0-9.-]+$/.test(model)) throw providerError('AI_MODEL_CONFIGURATION', 503);

  const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    signal: abortSignal || AbortSignal.timeout(25000),
    redirect: 'error',
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map(({ role, content }) => ({ role: role === 'assistant' ? 'model' : 'user', parts: [{ text: content }] })),
      generationConfig: {
        maxOutputTokens,
        responseFormat: { text: { mimeType: 'application/json', schema } },
      },
    }),
  });

  if (!response.ok) {
    await response.body?.cancel();
    throw providerError(response.status === 429 ? 'AI_QUOTA_EXCEEDED' : [401, 403].includes(response.status) ? 'AI_CREDENTIAL_REJECTED' : 'AI_PROVIDER_ERROR', response.status);
  }
  const data = await response.json();
  const candidate = data.candidates?.[0];
  if (data.promptFeedback?.blockReason || candidate?.finishReason !== 'STOP') throw providerError('AI_INCOMPLETE_RESPONSE', 503);
  const text = candidate.content?.parts?.filter(part => !part.thought && typeof part.text === 'string').map(part => part.text).join('');
  let output;
  try { output = JSON.parse(text); } catch { throw providerError('AI_INVALID_RESPONSE', 503); }
  return { output, usage: { inputTokens: data.usageMetadata?.promptTokenCount, outputTokens: data.usageMetadata?.candidatesTokenCount } };
}
