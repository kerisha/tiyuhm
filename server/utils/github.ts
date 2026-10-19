export interface GithubProfile {
  username: string
  name: string | null
  email: string | null
  location: string | null
  blog: string | null
  profileUrl: string
}

const API = 'https://api.github.com'

function headers(token?: string) {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'tiyuhm',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchProfile(username: string, token?: string): Promise<GithubProfile> {
  let res: Response
  try {
    res = await fetch(`${API}/users/${encodeURIComponent(username)}`, { headers: headers(token) })
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Couldn't reach GitHub. Check your connection and try again." })
  }
  if (res.status === 404) {
    throw createError({
      statusCode: 404,
      statusMessage: `We couldn't find a GitHub profile called "${username}". Without a real profile there's nothing to read.`,
    })
  }
  if (res.status === 403 || res.status === 429) {
    throw createError({ statusCode: 429, statusMessage: 'GitHub is rate limiting us. Wait a few minutes and try again.' })
  }
  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: `GitHub answered with an unexpected error (${res.status}).` })
  }
  const u = await res.json()
  return {
    username: u.login,
    name: u.name ?? null,
    email: u.email ?? null,
    location: u.location ?? null,
    blog: u.blog || null,
    profileUrl: u.html_url,
  }
}
