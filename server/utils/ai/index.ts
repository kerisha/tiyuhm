import { askOllama } from './ollama'
import { askHosted } from './hosted'

// Sends a prompt, forces JSON matching `schema`, and returns it only if `validate` accepts it.
// Retries once on unreadable output so one odd reply doesn't fail a whole run.
export async function askJson<T>(prompt: string, schema: object, validate: (v: unknown) => v is T): Promise<T> {
  const ask = process.env.AI_PROVIDER === 'hosted' ? askHosted : askOllama
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await ask(prompt, schema)
    try {
      const parsed = JSON.parse(text)
      if (validate(parsed)) return parsed
    } catch {
      // fall through and retry
    }
  }
  throw createError({ statusCode: 502, statusMessage: "The AI answered, but not in a form we could read. Nothing was saved; try again." })
}
