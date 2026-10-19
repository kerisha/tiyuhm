// Fallback for an OpenAI-style hosted model. Not chosen or wired up: only needed if Ollama's quality fails.
export async function askHosted(_prompt: string, _schema: object): Promise<string> {
  throw createError({ statusCode: 501, statusMessage: 'No hosted AI model is configured. Set AI_PROVIDER=ollama.' })
}
