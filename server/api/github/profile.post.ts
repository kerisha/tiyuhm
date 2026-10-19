export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string }>(event)
  const username = body?.username?.trim().replace(/^@/, '')
  if (!username || !/^[A-Za-z0-9-]{1,39}$/.test(username)) {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid GitHub username (letters, numbers and hyphens).' })
  }
  const profile = await fetchProfile(username)
  const configured = await readOwnersConfig()
  const owners = await Promise.all(configured.map(verifyOwner))
  return { profile, owners }
})
