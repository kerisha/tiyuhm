import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DIR = 'data'

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(join(DIR, name), 'utf8')) as T
  } catch {
    return fallback
  }
}

export async function writeJson(name: string, value: unknown): Promise<void> {
  await mkdir(DIR, { recursive: true })
  await writeFile(join(DIR, name), JSON.stringify(value, null, 2))
}
