export async function askOllama(prompt: string, schema: object): Promise<string> {
  const url = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
  const model = process.env.OLLAMA_MODEL || 'gemma4:12b'
  let res: Response
  try {
    // think:false skips the model's reasoning preamble: ~2s instead of ~17s per call, same answers.
    res = await fetch(`${url}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ model, stream: false, think: false, format: schema, messages: [{ role: 'user', content: prompt }] }),
    })
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: `The AI model isn't reachable. Start Ollama and pull ${model}.`,
    })
  }
  if (!res.ok) {
    throw createError({
      statusCode: 503,
      statusMessage: `The AI model isn't reachable. Start Ollama and pull ${model}.`,
    })
  }
  const data = await res.json()
  return data?.message?.content ?? ''
}
