export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string }>(event)
  const username = body?.username?.trim().replace(/^@/, '')
  if (!username || !/^[A-Za-z0-9-]{1,39}$/.test(username)) {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid GitHub username (letters, numbers and hyphens).' })
  }
  return await fetchProfile(username)
})
