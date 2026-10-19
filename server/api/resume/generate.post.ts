export default defineEventHandler(async (event) => {
  const b = await readBody<{ username?: string; owners?: string[]; from?: string; to?: string }>(event)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/
  if (!b?.username || !Array.isArray(b.owners) || !b.owners.length || !b.from || !b.to || !datePattern.test(b.from) || !datePattern.test(b.to) || b.from > b.to) {
    throw createError({ statusCode: 400, statusMessage: 'Pick at least one owner and a valid period first.' })
  }
  const profile = await fetchProfile(b.username)
  return await generateResume({ profile, owners: b.owners, from: b.from, to: b.to })
})
