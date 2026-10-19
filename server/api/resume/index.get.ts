export default defineEventHandler(() => readJson<Resume | null>('resume.json', null))
